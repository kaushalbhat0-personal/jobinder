import type { AIProvider, AICompleteParams, AIResponse, AITokenUsage } from './ai-provider';
import { InfrastructureError } from '@/shared/core/errors';
import { failure, success } from '@/shared/core/result';
import type { Result } from '@/shared/core/result';

export class DeepSeekAdapter implements AIProvider {
  readonly name = 'deepseek';
  readonly model = 'deepseek-v4-flash';

  async complete<T>(params: AICompleteParams): Promise<AIResponse<T>> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new InfrastructureError('DEEPSEEK_API_KEY is not set');
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userPrompt },
    ];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 4096,
        response_format: params.schema ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new InfrastructureError(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const body = await response.json();

    const usage: AITokenUsage = {
      promptTokens: body.usage?.prompt_tokens ?? 0,
      completionTokens: body.usage?.completion_tokens ?? 0,
      totalTokens: body.usage?.total_tokens ?? 0,
    };

    const content = body.choices?.[0]?.message?.content ?? '';

    if (params.schema) {
      const parsed = params.schema.safeParse(JSON.parse(content));
      if (!parsed.success) {
        throw new InfrastructureError(`AI response validation failed: ${parsed.error.message}`);
      }
      return { data: parsed.data as T, usage };
    }

    return { data: content as unknown as T, usage };
  }

  estimateCost(usage: AITokenUsage): number {
    const inputRate = 0.00015;
    const outputRate = 0.0006;
    const inputCost = (usage.promptTokens / 1000) * inputRate;
    const outputCost = (usage.completionTokens / 1000) * outputRate;
    return inputCost + outputCost;
  }
}

export function createAnalysisPrompt(resumeText: string): { system: string; user: string } {
  return {
    system: `You are an expert ATS resume analyzer. Analyze the provided resume and return a JSON object with the following fields:
- atsScore (number 0-100): ATS compatibility score
- missingSkills (string[]): Important skills missing from the resume
- strengths (string[]): Key strengths of the resume
- weaknesses (string[]): Areas that need improvement
- suggestedRoles (string[]): Job roles that best match this resume
- recommendations (string[]): Specific actionable recommendations to improve the resume
- summary (string): A brief 2-3 sentence summary of the resume quality

Be honest and constructive. Return ONLY valid JSON.`,
    user: `Analyze this resume text:\n\n${resumeText}`,
  };
}

export async function analyzeResumeWithProvider(
  provider: AIProvider,
  resumeText: string,
  _schema: {
    safeParse: (data: unknown) => { success: boolean; data?: unknown; error?: { message: string } };
  },
): Promise<Result<{ data: unknown; usage: AITokenUsage }>> {
  try {
    const prompt = createAnalysisPrompt(resumeText);
    const response = await provider.complete({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      temperature: 0.3,
      maxTokens: 4096,
    });
    return success({ data: response.data, usage: response.usage });
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Analysis failed'));
  }
}
