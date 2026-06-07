import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryApplicationRepository } from '../repositories/in-memory-application.repository';
import { CreateApplicationUseCase } from '../use-cases/create-application.use-case';
import { UpdateApplicationStageUseCase } from '../use-cases/update-application-stage.use-case';

describe('UpdateApplicationStageUseCase', () => {
  let repo: InMemoryApplicationRepository;
  let createUseCase: CreateApplicationUseCase;
  let updateUseCase: UpdateApplicationStageUseCase;

  beforeEach(() => {
    repo = new InMemoryApplicationRepository();
    createUseCase = new CreateApplicationUseCase(repo);
    updateUseCase = new UpdateApplicationStageUseCase(repo);
  });

  it('updates application stage', async () => {
    await createUseCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
    });

    const updated = await updateUseCase.execute('app-1', 'applied');
    expect(updated.stage).toBe('applied');
  });

  it('throws for non-existent application', async () => {
    await expect(updateUseCase.execute('nonexistent', 'applied')).rejects.toThrow(
      'Application nonexistent not found',
    );
  });
});
