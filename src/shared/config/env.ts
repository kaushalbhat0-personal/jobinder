import { z } from 'zod';

const EnvSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    AI_PROVIDER: z
      .enum(['openrouter', 'deepseek', 'openai', 'claude', 'gemini'])
      .default('deepseek'),
    DEEPSEEK_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_MODEL: z.string().optional(),
    OPENROUTER_FALLBACK_MODELS: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    CLAUDE_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: z.enum(['true', 'false']).default('false'),
    AI_ANALYSIS: z.enum(['true', 'false']).default('true'),
    FEED_GENERATION: z.enum(['true', 'false']).default('true'),
    JOB_PROVIDERS: z.enum(['true', 'false']).default('true'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  })
  .superRefine((data, ctx) => {
    if (data.AI_PROVIDER === 'deepseek' && !data.DEEPSEEK_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DEEPSEEK_API_KEY'],
        message: 'Required when AI_PROVIDER=deepseek',
      });
    }
    if (data.AI_PROVIDER === 'openrouter' && !data.OPENROUTER_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['OPENROUTER_API_KEY'],
        message: 'Required when AI_PROVIDER=openrouter',
      });
    }
    if (data.NODE_ENV === 'production' && data.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_APP_URL'],
        message: 'Cannot use localhost in production',
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;

let env: Env | null = null;

export function getEnv(): Env {
  if (!env) {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      throw new Error(`Invalid environment variables:\n${issues}`);
    }
    env = result.data;
  }
  return env;
}

export function resetEnv(): void {
  env = null;
}
