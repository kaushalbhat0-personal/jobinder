import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryResumeStorageService } from '../services/resume-storage.service';
import type { ParsedResumeData } from '../contracts/resume-parser.contract';

const service = new InMemoryResumeStorageService();
const sampleData: ParsedResumeData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  experience: 5,
  skills: ['javascript', 'react'],
  education: [{ degree: 'B.Sc', institution: 'MIT', year: 2020 }],
  rawText: '',
};

describe('InMemoryResumeStorageService', () => {
  beforeEach(() => {
    // Reset by deleting test entries
  });

  describe('storeFile and retrieveFile', () => {
    it('stores and retrieves file content', async () => {
      const storeResult = await service.storeFile('user-1', 'res-1', 'file content here');
      expect(storeResult.isSuccess()).toBe(true);
      if (storeResult.isSuccess()) {
        expect(storeResult.value).toContain('res-1');
      }

      const retrieveResult = await service.retrieveFile('user-1', 'res-1');
      expect(retrieveResult.isSuccess()).toBe(true);
      if (retrieveResult.isSuccess()) {
        expect(retrieveResult.value).toBe('file content here');
      }
    });

    it('fails to retrieve non-existent file', async () => {
      const result = await service.retrieveFile('user-1', 'non-existent');
      expect(result.isFailure()).toBe(true);
    });

    it('fails with empty resumeId', async () => {
      const result = await service.storeFile('user-1', '', 'content');
      expect(result.isFailure()).toBe(true);
    });

    it('overwrites existing file', async () => {
      await service.storeFile('user-1', 'res-2', 'original');
      await service.storeFile('user-1', 'res-2', 'updated');
      const result = await service.retrieveFile('user-1', 'res-2');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe('updated');
      }
    });
  });

  describe('storeParsedData and retrieveParsedData', () => {
    it('stores and retrieves parsed data', async () => {
      const storeResult = await service.storeParsedData('res-3', sampleData);
      expect(storeResult.isSuccess()).toBe(true);

      const retrieveResult = await service.retrieveParsedData('res-3');
      expect(retrieveResult.isSuccess()).toBe(true);
      if (retrieveResult.isSuccess()) {
        expect(retrieveResult.value?.name).toBe('John Doe');
        expect(retrieveResult.value?.skills).toContain('react');
      }
    });

    it('returns null for non-existent parsed data', async () => {
      const result = await service.retrieveParsedData('non-existent');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe('storeProfileSnapshot and retrieveProfileSnapshot', () => {
    it('stores and retrieves profile snapshot', async () => {
      const storeResult = await service.storeProfileSnapshot('user-1', sampleData);
      expect(storeResult.isSuccess()).toBe(true);

      const retrieveResult = await service.retrieveProfileSnapshot('user-1');
      expect(retrieveResult.isSuccess()).toBe(true);
      if (retrieveResult.isSuccess()) {
        expect(retrieveResult.value?.name).toBe('John Doe');
      }
    });

    it('returns null for non-existent snapshot', async () => {
      const result = await service.retrieveProfileSnapshot('no-user');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBeNull();
      }
    });

    it('overwrites existing snapshot', async () => {
      await service.storeProfileSnapshot('user-2', sampleData);
      await service.storeProfileSnapshot('user-2', { ...sampleData, name: 'Jane' });
      const result = await service.retrieveProfileSnapshot('user-2');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value?.name).toBe('Jane');
      }
    });
  });

  describe('deleteFile', () => {
    it('deletes a file', async () => {
      await service.storeFile('user-1', 'res-4', 'to delete');
      const deleteResult = await service.deleteFile('user-1', 'res-4');
      expect(deleteResult.isSuccess()).toBe(true);

      const retrieveResult = await service.retrieveFile('user-1', 'res-4');
      expect(retrieveResult.isFailure()).toBe(true);
    });

    it('succeeds on deleting non-existent file', async () => {
      const result = await service.deleteFile('user-1', 'non-existent');
      expect(result.isSuccess()).toBe(true);
    });
  });

  describe('integration: file + parsed data', () => {
    it('retains parsed data when stored after file', async () => {
      await service.storeFile('user-1', 'res-5', 'raw content');
      await service.storeParsedData('res-5', sampleData);

      const fileResult = await service.retrieveFile('user-1', 'res-5');
      expect(fileResult.isSuccess()).toBe(true);
      if (fileResult.isSuccess()) {
        expect(fileResult.value).toBe('raw content');
      }

      const dataResult = await service.retrieveParsedData('res-5');
      expect(dataResult.isSuccess()).toBe(true);
      if (dataResult.isSuccess()) {
        expect(dataResult.value?.email).toBe('john@example.com');
      }
    });
  });
});
