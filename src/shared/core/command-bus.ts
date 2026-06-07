import type { Result } from './result';

type CommandHandler<TInput, TOutput> = (
  payload: TInput,
) => Result<TOutput> | Promise<Result<TOutput>>;

export interface CommandMap {
  'upload:resume': { input: { userId: string; file: Blob }; output: { resumeId: string } };
  'analyze:resume': { input: { resumeId: string }; output: { analysisId: string } };
  'generate:feed': { input: { userId: string }; output: { feedId: string } };
  'apply:job': { input: { userId: string; jobId: string }; output: { applicationId: string } };
  'request:referral': { input: { userId: string; jobId: string }; output: { referralId: string } };
}

type CommandName = keyof CommandMap & string;

class CommandBus {
  private handlers = new Map<string, CommandHandler<unknown, unknown>>();

  register<T extends CommandName>(
    name: T,
    handler: CommandHandler<CommandMap[T]['input'], CommandMap[T]['output']>,
  ): void {
    this.handlers.set(name, handler as CommandHandler<unknown, unknown>);
  }

  execute<T extends CommandName>(
    name: T,
    payload: CommandMap[T]['input'],
  ): Promise<Result<CommandMap[T]['output']>> {
    const handler = this.handlers.get(name) as
      | CommandHandler<CommandMap[T]['input'], CommandMap[T]['output']>
      | undefined;
    if (!handler) {
      return Promise.reject(new Error(`No handler registered for command: ${name}`));
    }
    return Promise.resolve(handler(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const commandBus = new CommandBus();
