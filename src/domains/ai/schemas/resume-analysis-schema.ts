import { z } from 'zod';

export const ResumeAnalysisResultSchema = z.object({
  atsScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestedRoles: z.array(z.string()),
  recommendations: z.array(z.string()),
  summary: z.string(),
});

export type ResumeAnalysisResult = z.infer<typeof ResumeAnalysisResultSchema>;
