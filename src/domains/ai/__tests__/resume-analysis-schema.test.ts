import { describe, it, expect } from 'vitest';
import { ResumeAnalysisResultSchema } from '../schemas/resume-analysis-schema';

describe('ResumeAnalysisResultSchema', () => {
  it('validates a complete valid result', () => {
    const valid = {
      atsScore: 75,
      missingSkills: ['React', 'TypeScript'],
      strengths: ['Clear structure', 'Strong experience'],
      weaknesses: ['Missing keywords', 'Verbose descriptions'],
      suggestedRoles: ['Software Engineer', 'Frontend Developer'],
      recommendations: ['Add more metrics', 'Use action verbs'],
      summary: 'A solid resume with room for improvement.',
    };

    const result = ResumeAnalysisResultSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects atsScore below 0', () => {
    const result = ResumeAnalysisResultSchema.safeParse({
      atsScore: -10,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects atsScore above 100', () => {
    const result = ResumeAnalysisResultSchema.safeParse({
      atsScore: 150,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('accepts boundary values 0 and 100', () => {
    const r1 = ResumeAnalysisResultSchema.safeParse({
      atsScore: 0,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: '',
    });
    const r2 = ResumeAnalysisResultSchema.safeParse({
      atsScore: 100,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: '',
    });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = ResumeAnalysisResultSchema.safeParse({ atsScore: 50 });
    expect(result.success).toBe(false);
  });

  it('rejects non-array fields', () => {
    const result = ResumeAnalysisResultSchema.safeParse({
      atsScore: 50,
      missingSkills: 'not an array',
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-string summary', () => {
    const result = ResumeAnalysisResultSchema.safeParse({
      atsScore: 50,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: 123,
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty arrays', () => {
    const result = ResumeAnalysisResultSchema.safeParse({
      atsScore: 50,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      suggestedRoles: [],
      recommendations: [],
      summary: 'Okay resume.',
    });
    expect(result.success).toBe(true);
  });
});
