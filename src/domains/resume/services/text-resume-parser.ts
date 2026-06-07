import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import type { ResumeSourceType } from '../contracts/resume-upload.contract';
import type { ResumeParserContract, ParsedResumeData } from '../contracts/resume-parser.contract';
import { InfrastructureError } from '@/shared/core/errors';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/;
const YEAR_RE = /\b(19|20)\d{2}\b/g;
const EXPERIENCE_RE = /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/gi;

const DEGREE_KEYWORDS = [
  'bachelor',
  'btech',
  'b.e',
  'b.e.',
  'b.sc',
  'b.sc.',
  'ba',
  'b.a.',
  'master',
  'mtech',
  'm.e',
  'm.e.',
  'm.sc',
  'm.sc.',
  'ma',
  'm.a.',
  'mba',
  'm.b.a.',
  'phd',
  'ph.d.',
  'doctorate',
  'associate',
  'diploma',
  'high school',
  'ssc',
  'hsc',
];

const SKILL_KEYWORDS = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c\\+\\+',
  'c#',
  'ruby',
  'go',
  'rust',
  'react',
  'angular',
  'vue',
  'svelte',
  'node',
  'express',
  'next\\.?js',
  'sql',
  'postgresql',
  'mysql',
  'mongodb',
  'redis',
  'aws',
  'azure',
  'gcp',
  'docker',
  'kubernetes',
  'terraform',
  'git',
  'rest',
  'graphql',
  'api',
  'ci/cd',
  'html',
  'css',
  'sass',
  'tailwind',
];

function extractEmail(text: string): string | null {
  const matches = text.match(EMAIL_RE);
  return matches?.[0] ?? null;
}

function extractPhone(text: string): string | null {
  const matches = text.match(PHONE_RE);
  return matches?.[0] ?? null;
}

function looksLikeHeader(line: string): boolean {
  return (
    line.length > 50 ||
    EMAIL_RE.test(line) ||
    PHONE_RE.test(line) ||
    /^RESUME$|^CURRICULUM VITAE$|^CV$/i.test(line) ||
    /^SUMMARY$|^SKILLS$|^EXPERIENCE$|^EDUCATION$|^PROFILE$/i.test(line)
  );
}

function extractName(text: string): string | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (!looksLikeHeader(line)) return line;
  }
  return null;
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const skills: string[] = [];
  for (const pattern of SKILL_KEYWORDS) {
    const re = new RegExp('\\b' + pattern + '\\b', 'i');
    if (re.test(lower)) {
      skills.push(pattern.replace(/\\\+/g, '+').replace(/\\./g, '.').replace(/\\\//g, '/'));
    }
  }
  return [...new Set(skills)];
}

function extractExperience(text: string): number {
  const matches = [...text.matchAll(EXPERIENCE_RE)];
  if (matches.length === 0) return 0;
  const years = matches.map((m) => parseInt(m[1]!, 10)).filter((n) => n >= 0 && n <= 50);
  return years.length > 0 ? Math.max(...years) : 0;
}

interface EducationEntry {
  degree: string;
  institution: string;
  year: number | null;
}

function extractEducation(text: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const years = [
    ...new Set(
      [...text.matchAll(YEAR_RE)]
        .map((m) => parseInt(m[0], 10))
        .filter((y) => y >= 1950 && y <= 2030),
    ),
  ];
  const degreeRe = new RegExp(
    `\\b(?:${DEGREE_KEYWORDS.map((kw) => kw.replace('.', '\\.')).join('|')})\\b`,
    'i',
  );

  for (let i = 0; i < lines.length; i++) {
    if (degreeRe.test(lines[i]!)) {
      let institution = lines[i + 1] ?? null;
      if (
        institution &&
        (years.some((y) => institution!.includes(String(y))) || /^\d{4}/.test(institution))
      ) {
        institution = null;
      }
      let year: number | null = null;
      for (const y of years) {
        if (lines[i]!.includes(String(y)) || (institution && institution.includes(String(y)))) {
          year = y;
          break;
        }
      }
      entries.push({
        degree: lines[i]!.replace(/^\d{4}\s*/, ''),
        institution: institution ?? '',
        year,
      });
    }
  }

  return entries;
}

export class TextResumeParser implements ResumeParserContract {
  async parse(content: string, _sourceType: ResumeSourceType): Promise<Result<ParsedResumeData>> {
    try {
      return success({
        rawText: content,
        name: extractName(content),
        email: extractEmail(content),
        phone: extractPhone(content),
        experience: extractExperience(content),
        skills: extractSkills(content),
        education: extractEducation(content),
      });
    } catch (err) {
      return failure(new InfrastructureError(`Failed to parse resume: ${(err as Error).message}`));
    }
  }

  supports(sourceType: ResumeSourceType): boolean {
    return sourceType === 'pdf' || sourceType === 'docx';
  }
}
