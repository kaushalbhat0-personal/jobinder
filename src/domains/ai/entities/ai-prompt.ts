import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

export type PromptCategory = 'analysis' | 'generation' | 'matching' | 'extraction' | 'summary';
export type PromptVersion = number;

export interface AIPromptData {
  id: string;
  name: string;
  category: PromptCategory;
  template: string;
  version: PromptVersion;
  variables: string[];
  model: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AIPrompt {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly category: PromptCategory,
    public readonly template: string,
    public readonly version: PromptVersion,
    public readonly variables: string[],
    public readonly model: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: AIPromptData): Result<AIPrompt> {
    if (!data.id) return failure(new ValidationError('Prompt id is required'));
    if (!data.name || data.name.trim().length === 0)
      return failure(new ValidationError('Prompt name is required'));
    if (!data.template || data.template.trim().length === 0)
      return failure(new ValidationError('Prompt template is required'));
    if (data.version < 1) return failure(new ValidationError('Version must be >= 1'));
    return success(
      new AIPrompt(
        data.id,
        data.name,
        data.category,
        data.template,
        data.version,
        data.variables,
        data.model,
        data.isActive,
        data.createdAt,
        data.updatedAt,
      ),
    );
  }

  compile(variables: Record<string, string>): Result<string> {
    for (const variable of this.variables) {
      if (!(variable in variables)) {
        return failure(new ValidationError(`Missing variable: ${variable}`));
      }
    }
    let compiled = this.template;
    for (const [key, value] of Object.entries(variables)) {
      compiled = compiled.replaceAll(`{{${key}}}`, value);
    }
    return success(compiled);
  }

  createNewVersion(template: string): AIPrompt {
    return new AIPrompt(
      this.id,
      this.name,
      this.category,
      template,
      this.version + 1,
      this.variables,
      this.model,
      true,
      this.createdAt,
      new Date(),
    );
  }

  activate(): AIPrompt {
    return new AIPrompt(
      this.id,
      this.name,
      this.category,
      this.template,
      this.version,
      this.variables,
      this.model,
      true,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): AIPrompt {
    return new AIPrompt(
      this.id,
      this.name,
      this.category,
      this.template,
      this.version,
      this.variables,
      this.model,
      false,
      this.createdAt,
      new Date(),
    );
  }
}
