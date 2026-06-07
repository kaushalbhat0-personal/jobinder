import { describe, it, expect } from 'vitest';
import { ResumeAnalysis } from '../entities/resume-analysis';

const validData = {
  id: 'analysis-1',
  resumeId: 'res-1',
  skills: [
    { name: 'TypeScript', level: 'advanced' as const, relevance: 0.9 },
    { name: 'React', level: 'advanced' as const, relevance: 0.85 },
    { name: 'Go', level: 'intermediate' as const, relevance: 0.5 },
  ],
  experience: 5,
  suggestions: [
    { category: 'format', message: 'Add more metrics', priority: 'high' as const },
    { category: 'content', message: 'Add summary', priority: 'low' as const },
  ],
  summary: 'Experienced developer',
  score: 85,
  model: 'deepseek-v4',
  createdAt: new Date('2024-01-01'),
};

describe('ResumeAnalysis entity', () => {
  it('creates with valid data', () => {
    const result = ResumeAnalysis.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.score).toBe(85);
      expect(result.value.skills).toHaveLength(3);
    }
  });

  it('fails when id is empty', () => {
    const result = ResumeAnalysis.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when score is out of range', () => {
    const result = ResumeAnalysis.create({ ...validData, score: 101 });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when experience is negative', () => {
    const result = ResumeAnalysis.create({ ...validData, experience: -1 });
    expect(result.isFailure()).toBe(true);
  });

  it('returns top skills sorted by relevance', () => {
    const result = ResumeAnalysis.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const top = result.value.getTopSkills(2);
      expect(top).toHaveLength(2);
      expect(top[0]?.name).toBe('TypeScript');
      expect(top[1]?.name).toBe('React');
    }
  });

  it('filters high priority suggestions', () => {
    const result = ResumeAnalysis.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const high = result.value.getHighPrioritySuggestions();
      expect(high).toHaveLength(1);
      expect(high[0]?.priority).toBe('high');
    }
  });
});
