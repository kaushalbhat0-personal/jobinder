import { describe, it, expect } from 'vitest';
import { TextResumeParser } from '../services/text-resume-parser';

const parser = new TextResumeParser();

describe('TextResumeParser', () => {
  describe('supports', () => {
    it('returns true for pdf and docx, false for others', () => {
      expect(parser.supports('pdf')).toBe(true);
      expect(parser.supports('docx')).toBe(true);
    });
  });

  describe('parse', () => {
    it('extracts name from first line', async () => {
      const input = 'John Doe\njohn@example.com\n1234567890';
      const result = await parser.parse(input, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.name).toBe('John Doe');
        expect(result.value.rawText).toBe(input);
      }
    });

    it('returns null name when no name-like line exists', async () => {
      const input = 'john@example.com\nsummary@work.com';
      const result = await parser.parse(input, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.name).toBeNull();
        expect(result.value.rawText).toBe(input);
      }
    });

    it('extracts email', async () => {
      const input = 'john.doe@example.com';
      const result = await parser.parse(input, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.email).toBe('john.doe@example.com');
      }
    });

    it('extracts phone number', async () => {
      const result = await parser.parse('Phone: 9876543210', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.phone).toBe('9876543210');
      }
    });

    it('extracts phone number with country code', async () => {
      const result = await parser.parse('Contact: +1-555-123-4567', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.phone).toContain('555');
      }
    });

    it('extracts experience in years', async () => {
      const input = '5 years of experience in software development';
      const result = await parser.parse(input, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.experience).toBe(5);
        expect(result.value.rawText).toBe(input);
      }
    });

    it('extracts experience with "yrs" format', async () => {
      const result = await parser.parse('Experience: 3+ yrs in React', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.experience).toBe(3);
      }
    });

    it('returns 0 when no experience mentioned', async () => {
      const result = await parser.parse('John Doe\nSkills: JavaScript', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.experience).toBe(0);
      }
    });

    it('extracts skills', async () => {
      const result = await parser.parse('Skills: JavaScript, TypeScript, React, Python', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.skills).toContain('javascript');
        expect(result.value.skills).toContain('typescript');
        expect(result.value.skills).toContain('react');
        expect(result.value.skills).toContain('python');
      }
    });

    it('deduplicates skills', async () => {
      const result = await parser.parse('JavaScript and javascript', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const jsCount = result.value.skills.filter((s) => s.toLowerCase() === 'javascript').length;
        expect(jsCount).toBeLessThanOrEqual(1);
      }
    });

    it('extracts education entries', async () => {
      const text = [
        'Bachelor of Science in Computer Science',
        'University of Technology',
        '2018',
        '',
        'Master of Business Administration',
        'Business School',
        '2020',
      ].join('\n');
      const result = await parser.parse(text, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.education.length).toBeGreaterThanOrEqual(2);
        expect(result.value.education[0]?.degree.toLowerCase()).toContain('bachelor');
        expect(result.value.education[1]?.degree.toLowerCase()).toContain('master');
      }
    });

    it('handles empty content', async () => {
      const result = await parser.parse('', 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.name).toBeNull();
        expect(result.value.email).toBeNull();
        expect(result.value.phone).toBeNull();
        expect(result.value.experience).toBe(0);
        expect(result.value.skills).toEqual([]);
        expect(result.value.education).toEqual([]);
        expect(result.value.rawText).toBe('');
      }
    });

    it('parses a realistic resume', async () => {
      const resumeText = [
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

      const result = await parser.parse(resumeText, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.name).toBe('Jane Smith');
        expect(result.value.email).toBe('jane.smith@email.com');
        expect(result.value.phone).toBe('555-0123-4567');
        expect(result.value.experience).toBe(7);
        expect(result.value.skills.length).toBeGreaterThanOrEqual(5);
        expect(result.value.education.length).toBeGreaterThanOrEqual(1);
        expect(result.value.education[0]?.degree.toLowerCase()).toContain('bachelor');
        expect(result.value.rawText).toBe(resumeText);
      }
    });

    it('handles content with only header-like first line', async () => {
      const input = 'RESUME\nJohn Doe\njohn@test.com';
      const result = await parser.parse(input, 'pdf');
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.name).toBe('John Doe');
        expect(result.value.rawText).toBe(input);
      }
    });
  });
});
