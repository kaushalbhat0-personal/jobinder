import type { NormalizedJobProvider } from '../contracts/normalized-job-provider.contract';
import { NormalizedJob } from '../entities/normalized-job';

interface RemoteOkJob {
  id: string;
  slug: string;
  epoch: number;
  date: string;
  company: string;
  position: string;
  tags: string[];
  description: string;
  url: string;
}

function parseSalary(text: string | undefined): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };
  const numbers = text.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) return { min: null, max: null };
  if (numbers.length === 1) return { min: numbers[0]! * 1000, max: null };
  return { min: Math.min(...numbers) * 1000, max: Math.max(...numbers) * 1000 };
}

function extractSkills(text: string): string[] {
  const knownSkills = [
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
    'salesforce',
    'hr',
    'sys admin',
    'teaching',
    'education',
    'customer support',
    'marketing',
    'exec',
    'ops',
    'travel',
    'payroll',
    'finance',
    'c',
    'excel',
    'legal',
    'medical',
    'digital nomad',
  ];
  const lower = text.toLowerCase();
  return knownSkills.filter((s) => lower.includes(s));
}

export class RemoteOkProvider implements NormalizedJobProvider {
  readonly name = 'remoteok';
  private readonly baseUrl = 'https://remoteok.com/api';

  async fetchJobs(): Promise<NormalizedJob[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) return [];

    const data: unknown[] = await response.json();
    const jobs = data.filter(
      (item): item is RemoteOkJob =>
        typeof item === 'object' && item !== null && 'id' in item && 'position' in item,
    );

    return jobs.map((item) => {
      const salary = parseSalary(
        item.tags.find((t) => t.startsWith('$') || t.startsWith('€') || t.startsWith('£')),
      );
      const skills = extractSkills(item.description);
      const postedDate = new Date(item.epoch * 1000);

      const id = `remoteok-${item.id}`;
      const cleanCompany = item.company.replace(/&amp;/g, '&');

      return NormalizedJob.create({
        id,
        title: item.position,
        company: cleanCompany,
        location: null,
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
