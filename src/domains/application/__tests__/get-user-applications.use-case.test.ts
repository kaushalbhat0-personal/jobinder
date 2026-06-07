import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryApplicationRepository } from '../repositories/in-memory-application.repository';
import { CreateApplicationUseCase } from '../use-cases/create-application.use-case';
import { GetUserApplicationsUseCase } from '../use-cases/get-user-applications.use-case';

describe('GetUserApplicationsUseCase', () => {
  let repo: InMemoryApplicationRepository;
  let createUseCase: CreateApplicationUseCase;
  let getUseCase: GetUserApplicationsUseCase;

  beforeEach(() => {
    repo = new InMemoryApplicationRepository();
    createUseCase = new CreateApplicationUseCase(repo);
    getUseCase = new GetUserApplicationsUseCase(repo);
  });

  it('returns empty array for user with no applications', async () => {
    const apps = await getUseCase.execute('user-1');
    expect(apps).toEqual([]);
  });

  it('returns all applications for a user sorted by lastUpdated desc', async () => {
    await createUseCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'A',
      role: 'Engineer',
    });

    await new Promise((r) => setTimeout(r, 5));

    await createUseCase.execute({
      id: 'app-2',
      userId: 'user-1',
      jobId: 'job-2',
      company: 'B',
      role: 'Designer',
    });

    const apps = await getUseCase.execute('user-1');
    expect(apps).toHaveLength(2);
  });

  it('does not return other users applications', async () => {
    await createUseCase.execute({
      id: 'app-1',
      userId: 'user-1',
      jobId: 'job-1',
      company: 'A',
      role: 'Engineer',
    });
    await createUseCase.execute({
      id: 'app-2',
      userId: 'user-2',
      jobId: 'job-2',
      company: 'B',
      role: 'Designer',
    });

    const apps = await getUseCase.execute('user-1');
    expect(apps).toHaveLength(1);
    expect(apps[0]!.id).toBe('app-1');
  });
});
