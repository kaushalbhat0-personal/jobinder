import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import { NormalizedJob } from '../entities/normalized-job';

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  salary: string;
  candidate_required_location: string;
  description: string;
  company_logo_url?: string;
}

function parseSalary(text: string): { min: number | null; max: number | null } {
  if (!text || text === '-') return { min: null, max: null };
  const multiplier = /[kK]/.test(text) ? 1000 : 1;
  const numbers = text.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return { min: null, max: null };
  if (numbers.length === 1) return { min: numbers[0]! * multiplier, max: null };
  return { min: Math.min(...numbers) * multiplier, max: Math.max(...numbers) * multiplier };
}

const KNOWN_SKILLS = [
  'javascript',
  'typescript',
  'python',
  'react',
  'node',
  'rust',
  'go',
  'ruby',
  'rails',
  'java',
  'aws',
  'docker',
  'kubernetes',
  'sql',
  'postgres',
  'mongodb',
  'redis',
  'graphql',
  'vue',
  'angular',
  'svelte',
  'tailwind',
  'css',
  'html',
  'api',
  'rest',
  'devops',
  'ci',
  'cd',
  'git',
  'linux',
  'machine learning',
  'ai',
  'data science',
  'blockchain',
  'mobile',
  'swift',
  'kotlin',
  'flutter',
  'react native',
  'testing',
  'agile',
  'scrum',
  'product',
  'design',
  'figma',
  'ui',
  'ux',
  'senior',
  'lead',
  'manager',
  'full stack',
  'frontend',
  'backend',
  'customer support',
  'marketing',
  'sales',
  'content',
  'writing',
  'social media',
  'seo',
  'analytics',
  'research',
  'hr',
  'recruiting',
  'finance',
  'accounting',
  'legal',
  'devrel',
  'technical writing',
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter((s) => lower.includes(s));
}

export class RemotiveProvider implements NormalizedJobProvider {
  readonly name = 'remotive';
  private readonly baseUrl = 'https://remotive.com/api/remote-jobs';

  async fetchJobs(): Promise<NormalizedJob[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) return [];

    const data = (await response.json()) as { jobs?: RemotiveJob[] };
    if (!data.jobs) return [];

    return data.jobs.map((item) => {
      const salary = parseSalary(item.salary);
      const skills = [
        ...new Set([
          ...extractSkills(item.title + ' ' + item.description),
          ...item.tags.map((t) => t.toLowerCase()),
        ]),
      ];
      const postedDate = new Date(item.publication_date);

      const id = `remotive-${item.id}`;

      return NormalizedJob.create({
        id,
        title: item.title,
        company: item.company_name,
        location: item.candidate_required_location || null,
        salaryMin: salary.min,
        salaryMax: salary.max,
        currency: 'USD',
        skills,
        description: item.description.replace(/<[^>]*>/g, '').substring(0, 5000),
        source: this.name,
        sourceUrl: item.url,
        postedAt: postedDate,
      });
    });
  }
}
