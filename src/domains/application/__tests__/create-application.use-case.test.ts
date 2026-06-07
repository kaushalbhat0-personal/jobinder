import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryApplicationRepository } from '../repositories/in-memory-application.repository';
import { CreateApplicationUseCase } from '../use-cases/create-application.use-case';

describe('CreateApplicationUseCase', () => {
  let repo: InMemoryApplicationRepository;
  let useCase: CreateApplicationUseCase;

  beforeEach(() => {
    repo = new InMemoryApplicationRepository();
    useCase = new CreateApplicationUseCase(repo);
  });

  it('creates a new application', async () => {
    const app = await useCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
    });

    expect(app.id).toBe('app-1');
    expect(app.stage).toBe('saved');
  });

  it('returns existing application if duplicate job+user', async () => {
    await useCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
    });

    const second = await useCase.execute({
      id: 'app-2',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
    });

    expect(second.id).toBe('app-1');
  });

  it('allows different users to apply to the same job', async () => {
    const a = await useCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
    });

    const b = await useCase.execute({
      id: 'app-2',
      userId: 'user-2',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
    });

    expect(a.id).toBe('app-1');
    expect(b.id).toBe('app-2');
  });

  it('accepts custom stage', async () => {
    const app = await useCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'TestCorp',
      role: 'Engineer',
      stage: 'applied',
    });

    expect(app.stage).toBe('applied');
  });
});
