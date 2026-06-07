import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadResumeUseCase } from '@/domains/resume/use-cases/upload-resume.use-case';
import { TextResumeParser } from '@/domains/resume/services/text-resume-parser';
import { InMemoryResumeStorageService } from '@/domains/resume/services/resume-storage.service';
import { InMemoryResumeRepository } from '@/domains/resume/repositories/in-memory-resume-repository';
import type { FileReaderService } from '@/domains/resume/services/file-reader.service';
import { success } from '@/shared/core/result';
import type { Result } from '@/shared/core/result';
import type { UploadResumeResult } from '@/domains/resume/use-cases/upload-resume.use-case';

const readAsTextMock = vi.fn();

const mockFileReader = {
  readAsText: readAsTextMock,
} as unknown as FileReaderService;

const sampleResumeText = [
  'Jane Smith',
  'jane.smith@email.com',
  '555-0123-4567',
  '',
  'Summary',
  'Software engineer with 7 years of experience in full-stack development.',
  '',
  'Skills',
  'JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS, Git',
  '',
  'Experience',
  'Senior Developer at Tech Corp (2019-2024)',
  'Led frontend development team using React and TypeScript.',
  '',
  'Education',
  'Bachelor of Technology in Computer Science',
  'MIT University',
  '2017',
].join('\n');

describe('Resume Upload → Parse → Review → Save flow', () => {
  let parser: TextResumeParser;
  let storage: InMemoryResumeStorageService;
  let repo: InMemoryResumeRepository;
  let useCase: UploadResumeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    parser = new TextResumeParser();
    storage = new InMemoryResumeStorageService();
    repo = new InMemoryResumeRepository();
    useCase = new UploadResumeUseCase(mockFileReader, storage, parser, repo);

    readAsTextMock.mockResolvedValue(success({ content: sampleResumeText, sourceType: 'pdf' }));
  });

  it('uploads a resume and stores parsed data', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });
    const result: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const { resume, parsedData, storagePath } = result.value;

    expect(resume.userId).toBe('user-1');
    expect(resume.fileName).toBe('resume.pdf');
    expect(resume.status).toBe('uploaded');
    expect(parsedData.name).toBe('Jane Smith');
    expect(parsedData.email).toBe('jane.smith@email.com');
    expect(parsedData.phone).toBe('555-0123-4567');
    expect(parsedData.experience).toBe(7);
    expect(parsedData.skills).toContain('javascript');
    expect(parsedData.skills).toContain('typescript');
    expect(parsedData.skills).toContain('react');
    expect(parsedData.education.length).toBeGreaterThanOrEqual(1);
    expect(parsedData.education[0]?.degree.toLowerCase()).toContain('bachelor');
    expect(parsedData.rawText).toBe(sampleResumeText);
    expect(storagePath).toContain(resume.id);
  });

  it('retrieves stored file content after upload', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });
    const result: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const { resume } = result.value;

    const fileResult = await storage.retrieveFile(resume.userId, resume.id);
    expect(fileResult.isSuccess()).toBe(true);
    if (fileResult.isSuccess()) {
      expect(fileResult.value).toBe(sampleResumeText);
    }
  });

  it('retrieves parsed data from storage', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });
    const result: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const { resume } = result.value;

    const dataResult = await storage.retrieveParsedData(resume.id);
    expect(dataResult.isSuccess()).toBe(true);
    if (dataResult.isSuccess() && dataResult.value) {
      expect(dataResult.value.name).toBe('Jane Smith');
      expect(dataResult.value.skills).toContain('javascript');
    }
  });

  it('saves resume to repository after upload', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });
    const result: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);
    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    const { resume } = result.value;

    const found = await repo.findById(resume.id);
    expect(found).not.toBeNull();
    expect(found?.status).toBe('uploaded');
    expect(found?.userId).toBe('user-1');
  });

  it('supports uploading multiple resumes for different users', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });

    const result1: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);
    const result2: Result<UploadResumeResult> = await useCase.execute('user-2', mockFile);

    expect(result1.isSuccess()).toBe(true);
    expect(result2.isSuccess()).toBe(true);
    if (!result1.isSuccess() || !result2.isSuccess()) return;

    expect(result1.value.resume.id).not.toBe(result2.value.resume.id);
    expect(result1.value.resume.userId).toBe('user-1');
    expect(result2.value.resume.userId).toBe('user-2');
  });

  it('loads and edits parsed data in review flow', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });
    const uploadResult: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);
    expect(uploadResult.isSuccess()).toBe(true);
    if (!uploadResult.isSuccess()) return;

    const { resume } = uploadResult.value;

    const dataResult = await storage.retrieveParsedData(resume.id);
    expect(dataResult.isSuccess()).toBe(true);
    if (!dataResult.isSuccess() || !dataResult.value) return;

    const original = dataResult.value;
    const edited = {
      ...original,
      name: 'Jane S. Smith',
      skills: [...original.skills, 'kubernetes'],
      education: [
        ...original.education,
        { degree: 'Master of Science', institution: 'Stanford', year: 2020 },
      ],
      experience: 8,
    };

    const storeResult = await storage.storeParsedData(resume.id, edited);
    expect(storeResult.isSuccess()).toBe(true);

    const reloadResult = await storage.retrieveParsedData(resume.id);
    expect(reloadResult.isSuccess()).toBe(true);
    if (!reloadResult.isSuccess() || !reloadResult.value) return;

    const reloaded = reloadResult.value;
    expect(reloaded.name).toBe('Jane S. Smith');
    expect(reloaded.skills).toContain('kubernetes');
    expect(reloaded.experience).toBe(8);
    expect(reloaded.education.length).toBe(2);
    expect(reloaded.education[1]?.degree).toBe('Master of Science');
  });

  it('stores and retrieves profile snapshot after review confirm', async () => {
    const mockFile = new File([sampleResumeText], 'resume.pdf', { type: 'application/pdf' });
    const uploadResult: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);
    expect(uploadResult.isSuccess()).toBe(true);
    if (!uploadResult.isSuccess()) return;

    const { parsedData } = uploadResult.value;

    const snapshotResult = await storage.storeProfileSnapshot('user-1', parsedData);
    expect(snapshotResult.isSuccess()).toBe(true);

    const retrievedResult = await storage.retrieveProfileSnapshot('user-1');
    expect(retrievedResult.isSuccess()).toBe(true);
    if (!retrievedResult.isSuccess()) return;
    const retrieved = retrievedResult.value;
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Jane Smith');
    expect(retrieved?.email).toBe('jane.smith@email.com');
  });

  it('rejects empty file with zero file size', async () => {
    readAsTextMock.mockResolvedValue(success({ content: '', sourceType: 'pdf' }));

    const mockFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
    const result: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error?.message).toBe('File size must be positive');
    }
  });

  it('processes DOCX as well as PDF', async () => {
    readAsTextMock.mockResolvedValue(
      success({ content: 'John Doe\njohn@test.com\n5 years experience', sourceType: 'docx' }),
    );

    const mockFile = new File(['content'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const result: Result<UploadResumeResult> = await useCase.execute('user-1', mockFile);

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(result.value.parsedData.name).toBe('John Doe');
    expect(result.value.resume.fileType).toBe('docx');
  });
});
