import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResumeAIService, type AnalysisInput } from '../services/resume-ai.service';
import type { AIProvider } from '../providers/ai-provider';

function createMockProvider(
  data: unknown,
  usage = { promptTokens: 50, completionTokens: 150, totalTokens: 200 },
): AIProvider {
  return {
    name: 'test-provider',
    model: 'test-model',
    async complete<_T>() {
      if (data && typeof data === 'object' && 'atsScore' in (data as Record<string, unknown>)) {
        return { data: data as _T, usage };
      }
      return { data: data as _T, usage };
    },
    estimateCost() {
      return 0.001;
    },
  };
}

function createMockProviderThatThrows(errorMessage: string): AIProvider {
  return {
    name: 'test-provider',
    model: 'test-model',
    async complete<_T>(): Promise<never> {
      throw new Error(errorMessage);
    },
    estimateCost() {
      return 0;
    },
  };
}

describe('ResumeAIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleInput: AnalysisInput = {
    rawText: 'John Doe is a software engineer with 5 years of experience.',
    skills: ['JavaScript', 'Python'],
    experience: 5,
    education: [{ degree: 'BS Computer Science', institution: 'MIT', year: 2018 }],
  };

  it('returns analysis result on successful provider call', async () => {
    const aiResult = {
      atsScore: 78,
      missingSkills: ['React', 'TypeScript'],
      strengths: ['Clear experience', 'Good education'],
      weaknesses: ['Needs more keywords'],
      suggestedRoles: ['Software Engineer'],
      recommendations: ['Add more technologies'],
      summary: 'A solid resume.',
    };

    const provider = createMockProvider(aiResult);
    const service = new ResumeAIService(provider);

    const result = await service.analyze(sampleInput);

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.result.atsScore).toBe(78);
      expect(result.value.result.strengths).toEqual(['Clear experience', 'Good education']);
      expect(result.value.usage.totalTokens).toBe(200);
      expect(result.value.model).toBe('test-model');
      expect(result.value.provider).toBe('test-provider');
    }
  });

  it('calls provider with a schema for JSON validation', async () => {
    let callArgs: unknown = null;
    const provider: AIProvider = {
      name: 'test-provider',
      model: 'test-model',
      async complete<T>(params: {
        systemPrompt: string;
        userPrompt: string;
        schema?: unknown;
        temperature?: number;
        maxTokens?: number;
      }) {
        callArgs = params;
        return {
          data: {
            atsScore: 85,
            missingSkills: [],
            strengths: ['Strong profile'],
            weaknesses: [],
            suggestedRoles: [],
            recommendations: [],
            summary: 'Great resume.',
          } as T,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      },
      estimateCost() {
        return 0;
      },
    };
    const service = new ResumeAIService(provider);

    await service.analyze(sampleInput);

    const args = callArgs as { schema?: unknown; temperature?: number; maxTokens?: number };
    expect(args.schema).toBeDefined();
    expect(args.temperature).toBe(0.3);
    expect(args.maxTokens).toBe(4096);
  });

  it('returns failure when provider throws', async () => {
    const provider = createMockProviderThatThrows('API rate limit exceeded');
    const service = new ResumeAIService(provider);

    const result = await service.analyze(sampleInput);

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error.message).toContain('API rate limit exceeded');
    }
  });

  it('returns failure when provider returns invalid data', async () => {
    const provider: AIProvider = {
      name: 'test-provider',
      model: 'test-model',
      async complete<T>() {
        const parsed = (
          await import('../schemas/resume-analysis-schema')
        ).ResumeAnalysisResultSchema.safeParse({
          atsScore: 'not-a-number',
          missingSkills: 'not-array',
        });
        if (!parsed.success) throw new Error('AI response validation failed');
        return {
          data: parsed.data as T,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      },
      estimateCost() {
        return 0;
      },
    };
    const service = new ResumeAIService(provider);

    const result = await service.analyze(sampleInput);

    expect(result.isFailure()).toBe(true);
  });

  it('handles empty input gracefully', async () => {
    const aiResult = {
      atsScore: 30,
      missingSkills: [],
      strengths: [],
      weaknesses: ['No content to analyze'],
      suggestedRoles: [],
      recommendations: ['Add resume content'],
      summary: 'Empty resume.',
    };

    const provider = createMockProvider(aiResult);
    const service = new ResumeAIService(provider);

    const result = await service.analyze({
      rawText: '',
      skills: [],
      experience: 0,
      education: [],
    });

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.result.atsScore).toBe(30);
    }
  });

  it('includes resume context in the prompt', async () => {
    let capturedPrompt = '';
    const provider: AIProvider = {
      name: 'test-provider',
      model: 'test-model',
      async complete<T>(params: { systemPrompt: string; userPrompt: string }) {
        capturedPrompt = params.userPrompt;
        return {
          data: {
            atsScore: 50,
            missingSkills: [],
            strengths: [],
            weaknesses: [],
            suggestedRoles: [],
            recommendations: [],
            summary: 'Test.',
          } as T,
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        };
      },
      estimateCost() {
        return 0;
      },
    };
    const service = new ResumeAIService(provider);

    await service.analyze(sampleInput);

    expect(capturedPrompt).toContain('John Doe');
    expect(capturedPrompt).toContain('JavaScript');
    expect(capturedPrompt).toContain('Computer Science');
    expect(capturedPrompt).toContain('MIT');
  });
});
