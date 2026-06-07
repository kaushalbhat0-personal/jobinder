export const AI_MODELS = {
  resumeAnalysis: {
    primary: process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free',
    fallback: ['google/gemini-2.5-flash', 'qwen/qwen3'],
  },
  feedGeneration: {
    primary: process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat-v3-0324:free',
    fallback: ['google/gemini-2.5-flash'],
  },
} as const;

export type AIModelConfig = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export function getModelChain(task: keyof typeof AI_MODELS): string[] {
  const config = AI_MODELS[task];
  return [config.primary, ...config.fallback];
}
