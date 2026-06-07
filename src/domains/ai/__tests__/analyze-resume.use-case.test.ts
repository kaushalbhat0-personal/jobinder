import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeResumeUseCase } from '../use-cases/analyze-resume.use-case';
import { ResumeAIService, type AnalysisOutput } from '../services/resume-ai.service';
import type { ResumeStorageContract } from '@/domains/resume/contracts/resume-storage.contract';
import { success, failure } from '@/shared/core/result';
import { NotFoundError } from '@/shared/core/errors';
import type { ParsedResumeData } from '@/domains/resume/contracts/resume-parser.contract';

function createMockStorage(snapshot: ParsedResumeData | null = null) {
  return {
    storeFile: vi.fn(),
    retrieveFile: vi.fn(),
    storeParsedData: vi.fn(),
    retrieveParsedData: vi.fn(),
    storeProfileSnapshot: vi.fn(),
    retrieveProfileSnapshot: vi.fn().mockResolvedValue(success(snapshot)),
    deleteFile: vi.fn(),
  } satisfies ResumeStorageContract;
}

function createMockAIService(result: AnalysisOutput | Error) {
  const mock = {
    analyze: vi.fn(),
  };

  if (result instanceof Error) {
    mock.analyze.mockResolvedValue(failure(result));
  } else {
    mock.analyze.mockResolvedValue(success(result));
  }

  return mock as unknown as ResumeAIService;
}

const sampleSnapshot: ParsedResumeData = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  experience: 4,
  skills: ['TypeScript', 'React', 'Node.js'],
  education: [{ degree: 'BS CS', institution: 'Stanford', year: 2020 }],
  rawText: 'Jane Doe is a full-stack developer with 4 years of experience.',
};

const sampleAnalysisOutput: AnalysisOutput = {
  result: {
    atsScore: 82,
    missingSkills: ['Docker', 'CI/CD'],
    strengths: ['Strong technical stack', 'Clear career progression'],
    weaknesses: ['Missing DevOps experience'],
    suggestedRoles: ['Senior Frontend Developer', 'Full Stack Engineer'],
    recommendations: ['Add Docker skills', 'Highlight leadership experience'],
    summary: 'A strong resume with room for DevOps growth.',
  },
  usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
  model: 'test-model',
  provider: 'test-provider',
};

describe('AnalyzeResumeUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns analysis result when snapshot exists and AI succeeds', async () => {
    const storage = createMockStorage(sampleSnapshot);
    const aiService = createMockAIService(sampleAnalysisOutput);
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    const result = await useCase.execute('user-1', 'resume-1');

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.result.atsScore).toBe(82);
      expect(result.value.result.suggestedRoles).toContain('Senior Frontend Developer');
    }
  });

  it('calls retrieveProfileSnapshot with userId', async () => {
    const storage = createMockStorage(sampleSnapshot);
    const aiService = createMockAIService(sampleAnalysisOutput);
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    await useCase.execute('user-1', 'resume-1');

    expect(storage.retrieveProfileSnapshot).toHaveBeenCalledWith('user-1');
  });

  it('passes snapshot data to AI service', async () => {
    const storage = createMockStorage(sampleSnapshot);
    const aiService = createMockAIService(sampleAnalysisOutput);
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    await useCase.execute('user-1', 'resume-1');

    expect(aiService.analyze).toHaveBeenCalledWith(
      expect.objectContaining({
        rawText: sampleSnapshot.rawText,
        skills: sampleSnapshot.skills,
        experience: sampleSnapshot.experience,
      }),
    );
  });

  it('fails when no snapshot exists', async () => {
    const storage = createMockStorage(null);
    const aiService = createMockAIService(sampleAnalysisOutput);
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    const result = await useCase.execute('user-1', 'resume-1');

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBeInstanceOf(NotFoundError);
    }
  });

  it('fails when storage retrieval fails', async () => {
    const storage = createMockStorage();
    storage.retrieveProfileSnapshot = vi
      .fn()
      .mockResolvedValue(failure(new Error('Storage unavailable')));
    const aiService = createMockAIService(sampleAnalysisOutput);
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    const result = await useCase.execute('user-1', 'resume-1');

    expect(result.isFailure()).toBe(true);
  });

  it('fails when AI analysis fails', async () => {
    const storage = createMockStorage(sampleSnapshot);
    const aiService = createMockAIService(new Error('AI service unavailable'));
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    const result = await useCase.execute('user-1', 'resume-1');

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error.message).toContain('AI service unavailable');
    }
  });

  it('does not call AI service when snapshot retrieval fails', async () => {
    const storage = createMockStorage(null);
    const aiService = createMockAIService(sampleAnalysisOutput);
    const useCase = new AnalyzeResumeUseCase(storage, aiService);

    await useCase.execute('user-1', 'resume-1');

    expect(aiService.analyze).not.toHaveBeenCalled();
  });
});
