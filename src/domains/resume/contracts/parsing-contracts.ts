export interface ParsedResumeData {
  skills: string[];
  experience: number;
  education: Array<{ degree: string; institution: string; year: number }>;
  workHistory: Array<{ company: string; role: string; years: number }>;
  summary: string;
}

export interface ResumeParsingContract {
  parseResume(fileContent: string, fileType: string): Promise<ParsedResumeData>;
  extractSkills(content: string): Promise<string[]>;
  extractExperience(content: string): Promise<number>;
  validateFileType(fileType: string): boolean;
}
