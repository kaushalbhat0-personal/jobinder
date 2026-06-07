import { describe, it, expect } from 'vitest';
import { Resume } from '../entities/resume';

const validData = {
  id: 'res-1',
  userId: 'user-1',
  fileName: 'resume.pdf',
  fileSize: 1024,
  fileType: 'application/pdf',
  content: null,
  status: 'pending' as const,
  version: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('Resume entity', () => {
  it('creates with valid data', () => {
    const result = Resume.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.fileName).toBe('resume.pdf');
      expect(result.value.version).toBe(1);
    }
  });

  it('fails when id is empty', () => {
    const result = Resume.create({ ...validData, id: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when fileName is empty', () => {
    const result = Resume.create({ ...validData, fileName: '' });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when fileSize is zero', () => {
    const result = Resume.create({ ...validData, fileSize: 0 });
    expect(result.isFailure()).toBe(true);
  });

  it('fails when version is less than 1', () => {
    const result = Resume.create({ ...validData, version: 0 });
    expect(result.isFailure()).toBe(true);
  });

  it('marks as uploaded', () => {
    const result = Resume.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const uploaded = result.value.markUploaded('pdf content');
      expect(uploaded.status).toBe('uploaded');
      expect(uploaded.content).toBe('pdf content');
    }
  });

  it('marks as analyzed', () => {
    const result = Resume.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const analyzed = result.value.markAnalyzed();
      expect(analyzed.status).toBe('analyzed');
    }
  });

  it('creates next version', () => {
    const result = Resume.create(validData);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      const next = result.value.createNextVersion();
      expect(next.version).toBe(2);
      expect(next.status).toBe('pending');
    }
  });
});
