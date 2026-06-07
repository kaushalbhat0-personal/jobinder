import { describe, it, expect } from 'vitest';
import { AIPrompt } from '../entities/ai-prompt';

const validData = {
  id: 'prompt-1',
  name: 'Resume Analysis',
  category: 'analysis' as const,
  template: 'Analyze this resume: {{resume_content}}',
  version: 1,
  variables: ['resume_content'],
  model: 'deepseek-v4-flash',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('AIPrompt entity', () => {
  it('creates with valid data', () => {
    const result = AIPrompt.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.name).toBe('Resume Analysis');
    }
  });

  it('fails when id is empty', () => {
    const result = AIPrompt.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when template is empty', () => {
    const result = AIPrompt.create({ ...validData, template: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when version is less than 1', () => {
    const result = AIPrompt.create({ ...validData, version: 0 });
    expect(result.isFailure()).toBe(true);
  });

  it('compiles template with variables', () => {
    const result = AIPrompt.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const compiled = result.value.compile({ resume_content: 'My resume' });
      expect(compiled.isSuccess()).toBe(true);
      if (compiled.isSuccess()) {
        expect(compiled.value).toBe('Analyze this resume: My resume');
      }
    }
  });

  it('fails compilation when variable is missing', () => {
    const result = AIPrompt.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const compiled = result.value.compile({});
      expect(compiled.isFailure()).toBe(true);
    }
  });

  it('creates a new version', () => {
    const result = AIPrompt.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const next = result.value.createNewVersion('New template {{resume_content}}');
      expect(next.version).toBe(2);
      expect(next.isActive).toBe(true);
    }
  });

  it('activates and deactivates', () => {
    const result = AIPrompt.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.deactivate().isActive).toBe(false);
      expect(result.value.deactivate().activate().isActive).toBe(true);
    }
  });
});
