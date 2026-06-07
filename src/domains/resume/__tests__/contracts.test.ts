import { describe, it, expect } from 'vitest';
import type { ResumeQueryContract } from '../contracts/resume-queries';
import type { ResumeVersioningContract } from '../contracts/versioning-contracts';
import type { ResumeParsingContract } from '../contracts/parsing-contracts';
import type { ResumeUploadContract } from '../contracts/resume-upload.contract';
import type { ResumeParserContract } from '../contracts/resume-parser.contract';
import type { ResumeStorageContract } from '../contracts/resume-storage.contract';
import type { ResumeAnalysisContract } from '../contracts/resume-analysis.contract';

describe('Resume contracts', () => {
  it('ResumeQueryContract defines required methods', () => {
    const contract: ResumeQueryContract = {
      getResume: async () => null,
      getAnalysis: async () => null,
      getLatestVersion: async () => null,
    };
    expect(contract.getResume).toBeDefined();
    expect(contract.getAnalysis).toBeDefined();
    expect(contract.getLatestVersion).toBeDefined();
  });

  it('ResumeVersioningContract defines required methods', () => {
    const contract: ResumeVersioningContract = {
      getVersionHistory: async () => [],
      createNewVersion: async () => '',
      rollbackToVersion: async () => undefined,
      getLatestVersion: async () => 0,
    };
    expect(contract.getVersionHistory).toBeDefined();
    expect(contract.createNewVersion).toBeDefined();
    expect(contract.rollbackToVersion).toBeDefined();
    expect(contract.getLatestVersion).toBeDefined();
  });

  it('ResumeParsingContract defines required methods', () => {
    const contract: ResumeParsingContract = {
      parseResume: async () => ({
        skills: [],
        experience: 0,
        education: [],
        workHistory: [],
        summary: '',
      }),
      extractSkills: async () => [],
      extractExperience: async () => 0,
      validateFileType: () => true,
    };
    expect(contract.parseResume).toBeDefined();
    expect(contract.extractSkills).toBeDefined();
    expect(contract.extractExperience).toBeDefined();
    expect(contract.validateFileType).toBeDefined();
  });

  it('ResumeUploadContract defines required methods', () => {
    const contract: ResumeUploadContract = {
      validate: async (input) =>
        ({ isSuccess: () => true, isFailure: () => false, value: input }) as never,
      upload: async () =>
        ({
          isSuccess: () => true,
          isFailure: () => false,
          value: { resumeId: '', storagePath: '', version: 1 },
        }) as never,
      getSupportedTypes: () => ['pdf', 'docx'],
    };
    expect(contract.validate).toBeDefined();
    expect(contract.upload).toBeDefined();
    expect(contract.getSupportedTypes).toBeDefined();
    expect(contract.getSupportedTypes()).toContain('pdf');
  });

  it('ResumeParserContract defines required methods', () => {
    const contract: ResumeParserContract = {
      parse: async () =>
        ({
          isSuccess: () => true,
          isFailure: () => false,
          value: { name: null, email: null, phone: null, experience: 0, skills: [], education: [] },
        }) as never,
      supports: () => true,
    };
    expect(contract.parse).toBeDefined();
    expect(contract.supports).toBeDefined();
  });

  it('ResumeStorageContract defines required methods', () => {
    const contract: ResumeStorageContract = {
      storeFile: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: '' }) as never,
      retrieveFile: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: '' }) as never,
      storeParsedData: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: undefined }) as never,
      retrieveParsedData: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: null }) as never,
      storeProfileSnapshot: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: undefined }) as never,
      retrieveProfileSnapshot: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: null }) as never,
      deleteFile: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: undefined }) as never,
    };
    expect(contract.storeFile).toBeDefined();
    expect(contract.retrieveFile).toBeDefined();
    expect(contract.storeParsedData).toBeDefined();
    expect(contract.retrieveParsedData).toBeDefined();
    expect(contract.storeProfileSnapshot).toBeDefined();
    expect(contract.retrieveProfileSnapshot).toBeDefined();
    expect(contract.deleteFile).toBeDefined();
  });

  it('ResumeAnalysisContract defines required methods', () => {
    const contract: ResumeAnalysisContract = {
      analyze: async () =>
        ({
          isSuccess: () => true,
          isFailure: () => false,
          value: { score: 0, suggestions: [], missingSkills: [], recommendedRoles: [] },
        }) as never,
      scoreResume: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: 0 }) as never,
      suggestImprovements: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: [] }) as never,
      identifyMissingSkills: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: [] }) as never,
      recommendRoles: async () =>
        ({ isSuccess: () => true, isFailure: () => false, value: [] }) as never,
    };
    expect(contract.analyze).toBeDefined();
    expect(contract.scoreResume).toBeDefined();
    expect(contract.suggestImprovements).toBeDefined();
    expect(contract.identifyMissingSkills).toBeDefined();
    expect(contract.recommendRoles).toBeDefined();
  });
});
