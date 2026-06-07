import type { AIProvider, AITokenUsage } from '../providers/ai-provider';
import {
  ResumeAnalysisResultSchema,
  type ResumeAnalysisResult,
} from '../schemas/resume-analysis-schema';
import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { InfrastructureError } from '@/shared/core/errors';
import { reportAIError } from '@/shared/monitoring/sentry';
export interface AnalysisInput {
  rawText: string;
  skills: string[];
  experience: number;
  education: Array<{ degree: string; institution: string; year: number | null }>;
}

export interface AnalysisOutput {
  result: ResumeAnalysisResult;
  usage: AITokenUsage;
  model: string;
  provider: string;
}

function buildAnalysisPrompt(input: AnalysisInput): { system: string; user: string } {
  const context = [
    `## Resume Text\n${input.rawText}`,
    `## Extracted Skills\n${input.skills.join(', ') || 'None detected'}`,
    `## Years of Experience\n${input.experience}`,
    `## Education\n${input.education.map((e) => `${e.degree} at ${e.institution}${e.year ? ` (${e.year})` : ''}`).join('\n') || 'None listed'}`,
  ].join('\n\n');

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
    user: `Analyze this resume:\n\n${context}`,
  };
}

export class ResumeAIService {
  constructor(private readonly provider: AIProvider) {}

  async analyze(input: AnalysisInput): Promise<Result<AnalysisOutput>> {
    try {
      const prompt = buildAnalysisPrompt(input);

      const response = await this.provider.complete<ResumeAnalysisResult>({
        systemPrompt: prompt.system,
        userPrompt: prompt.user,
        schema: ResumeAnalysisResultSchema,
        temperature: 0.3,
        maxTokens: 4096,
      });

      return success({
        result: response.data,
        usage: response.usage,
        model: this.provider.model,
        provider: this.provider.name,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown AI analysis error');
      reportAIError(this.provider.name, this.provider.model, error);
      return failure(new InfrastructureError(`Resume analysis failed: ${error.message}`));
    }
  }
}
