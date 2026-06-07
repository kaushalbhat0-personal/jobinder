import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadResumeUseCase } from '../use-cases/upload-resume.use-case';
import type { ResumeStorageContract } from '../contracts/resume-storage.contract';
import type { ResumeParserContract, ParsedResumeData } from '../contracts/resume-parser.contract';
import type { ResumeRepository } from '../repositories/resume-repository';
import type { Resume } from '../entities/resume';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';
import { FileReaderService, type FileReadResult } from '../services/file-reader.service';

const mockFile = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });

function createMockFileReader(readResult: FileReadResult) {
  return {
    readAsText: vi.fn().mockResolvedValue(success(readResult)),
  } as unknown as FileReaderService;
}

function createMockStorage() {
  return {
    storeFile: vi.fn().mockResolvedValue(success('resumes/res-1.txt')),
    retrieveFile: vi.fn(),
    storeParsedData: vi.fn().mockResolvedValue(success(undefined)),
    retrieveParsedData: vi.fn(),
    storeProfileSnapshot: vi.fn(),
    retrieveProfileSnapshot: vi.fn(),
    deleteFile: vi.fn(),
  } satisfies ResumeStorageContract;
}

function createMockParser() {
  return {
    parse: vi.fn().mockResolvedValue(
      success({
        name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        experience: 3,
        skills: ['javascript'],
        education: [],
        rawText: 'John Doe john@example.com',
      } satisfies ParsedResumeData),
    ),
    supports: vi.fn().mockImplementation((type: string) => type === 'pdf' || type === 'docx'),
  } satisfies ResumeParserContract;
}

function createMockRepo() {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    save: vi.fn().mockImplementation(async (resume: Resume) => success(resume)),
    delete: vi.fn(),
    getAnalysis: vi.fn(),
    saveAnalysis: vi.fn(),
  } satisfies ResumeRepository;
}

describe('UploadResumeUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads a file and returns resume with parsed data', async () => {
    const fileReader = createMockFileReader({
      content: 'John Doe john@example.com',
      sourceType: 'pdf',
    });
    const storage = createMockStorage();
    const parser = createMockParser();
    const repo = createMockRepo();

    const useCase = new UploadResumeUseCase(fileReader, storage, parser, repo);

    const result = await useCase.execute('user-1', mockFile);

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.resume.userId).toBe('user-1');
      expect(result.value.resume.fileName).toBe('resume.pdf');
      expect(result.value.resume.status).toBe('uploaded');
      expect(result.value.parsedData.name).toBe('John Doe');
      expect(result.value.storagePath).toBe('resumes/res-1.txt');
    }
  });

  it('calls all dependencies in order', async () => {
    const fileReader = createMockFileReader({ content: 'content', sourceType: 'pdf' });
    const storage = createMockStorage();
    const parser = createMockParser();
    const repo = createMockRepo();

    const useCase = new UploadResumeUseCase(fileReader, storage, parser, repo);

    await useCase.execute('user-1', mockFile);

    expect(fileReader.readAsText).toHaveBeenCalledWith(mockFile);
    expect(parser.supports).toHaveBeenCalledWith('pdf');
    expect(storage.storeFile).toHaveBeenCalled();
    expect(parser.parse).toHaveBeenCalled();
    expect(storage.storeParsedData).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('fails with empty userId', async () => {
    const useCase = new UploadResumeUseCase(
      createMockFileReader({ content: '', sourceType: 'pdf' }),
      createMockStorage(),
      createMockParser(),
      createMockRepo(),
    );

    const result = await useCase.execute('', mockFile);
    expect(result.isFailure()).toBe(true);
  });

  it('fails with null file', async () => {
    const useCase = new UploadResumeUseCase(
      createMockFileReader({ content: '', sourceType: 'pdf' }),
      createMockStorage(),
      createMockParser(),
      createMockRepo(),
    );

    const result = await useCase.execute('user-1', null as unknown as File);
    expect(result.isFailure()).toBe(true);
  });

  it('fails when file reader fails', async () => {
    const fileReader = {
      readAsText: vi.fn().mockResolvedValue(failure(new ValidationError('Bad file'))),
    } as unknown as FileReaderService;

    const useCase = new UploadResumeUseCase(
      fileReader,
      createMockStorage(),
      createMockParser(),
      createMockRepo(),
    );

    const result = await useCase.execute('user-1', mockFile);
    expect(result.isFailure()).toBe(true);
  });

  it('fails when parser does not support source type', async () => {
    const fileReader = createMockFileReader({ content: 'content', sourceType: 'pdf' });
    const parser = createMockParser();
    parser.supports = vi.fn().mockReturnValue(false);

    const useCase = new UploadResumeUseCase(
      fileReader,
      createMockStorage(),
      parser,
      createMockRepo(),
    );

    const result = await useCase.execute('user-1', mockFile);
    expect(result.isFailure()).toBe(true);
  });

  it('fails when storage fails', async () => {
    const storage = createMockStorage();
    storage.storeFile = vi.fn().mockResolvedValue(failure(new ValidationError('Storage error')));

    const useCase = new UploadResumeUseCase(
      createMockFileReader({ content: 'content', sourceType: 'pdf' }),
      storage,
      createMockParser(),
      createMockRepo(),
    );

    const result = await useCase.execute('user-1', mockFile);
    expect(result.isFailure()).toBe(true);
  });

  it('fails when parser fails', async () => {
    const parser = createMockParser();
    parser.parse = vi.fn().mockResolvedValue(failure(new ValidationError('Parse error')));

    const useCase = new UploadResumeUseCase(
      createMockFileReader({ content: 'content', sourceType: 'pdf' }),
      createMockStorage(),
      parser,
      createMockRepo(),
    );

    const result = await useCase.execute('user-1', mockFile);
    expect(result.isFailure()).toBe(true);
  });
});
