import { Job } from '../entities/job';
import { success } from '@/shared/core/result';
import type { Result } from '@/shared/core/result';
import type { JobProvider } from './job-provider';

const MOCK_JOBS: Job[] = [
  Job.create({
    id: 'mock-job-1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    description:
      'Build and maintain scalable backend services. Work with cross-functional teams to deliver high-impact features.',
    location: 'San Francisco, CA',
    type: 'full-time',
    status: 'active',
    salaryMin: 140000,
    salaryMax: 180000,
    currency: 'USD',
    skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
    experienceRequired: 5,
    applicationUrl: null,
    postedAt: new Date('2026-06-01'),
    expiresAt: new Date('2026-08-01'),
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    description:
      'Own product strategy and roadmap. Work with engineering and design to ship user-centric features.',
    location: 'Remote',
    type: 'full-time',
    status: 'active',
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Roadmapping'],
    experienceRequired: 4,
    applicationUrl: null,
    postedAt: new Date('2026-06-05'),
    expiresAt: new Date('2026-09-05'),
    createdAt: new Date('2026-06-05'),
    updatedAt: new Date('2026-06-05'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-3',
    title: 'Data Scientist',
    company: 'DataFlow Inc',
    description:
      'Develop ML models and data pipelines. Analyze large datasets to drive business decisions.',
    location: 'New York, NY',
    type: 'full-time',
    status: 'active',
    salaryMin: 130000,
    salaryMax: 170000,
    currency: 'USD',
    skills: ['Python', 'TensorFlow', 'SQL', 'Statistics', 'Machine Learning'],
    experienceRequired: 3,
    applicationUrl: null,
    postedAt: new Date('2026-06-10'),
    expiresAt: new Date('2026-08-10'),
    createdAt: new Date('2026-06-10'),
    updatedAt: new Date('2026-06-10'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-4',
    title: 'UX Designer',
    company: 'DesignLab',
    description: 'Design intuitive user interfaces. Conduct user research and create prototypes.',
    location: 'Remote',
    type: 'full-time',
    status: 'active',
    salaryMin: 100000,
    salaryMax: 130000,
    currency: 'USD',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
    experienceRequired: 3,
    applicationUrl: null,
    postedAt: new Date('2026-06-12'),
    expiresAt: null,
    createdAt: new Date('2026-06-12'),
    updatedAt: new Date('2026-06-12'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-5',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    description: 'Manage CI/CD pipelines, cloud infrastructure, and deployment automation.',
    location: 'Austin, TX',
    type: 'full-time',
    status: 'active',
    salaryMin: 125000,
    salaryMax: 155000,
    currency: 'USD',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    experienceRequired: 4,
    applicationUrl: null,
    postedAt: new Date('2026-06-15'),
    expiresAt: new Date('2026-07-15'),
    createdAt: new Date('2026-06-15'),
    updatedAt: new Date('2026-06-15'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-6',
    title: 'Frontend Developer',
    company: 'WebAgency',
    description: 'Build responsive web applications with modern frameworks.',
    location: 'Remote',
    type: 'contract',
    status: 'active',
    salaryMin: 90000,
    salaryMax: 120000,
    currency: 'USD',
    skills: ['React', 'TypeScript', 'CSS', 'Next.js', 'GraphQL'],
    experienceRequired: 2,
    applicationUrl: null,
    postedAt: new Date('2026-06-18'),
    expiresAt: null,
    createdAt: new Date('2026-06-18'),
    updatedAt: new Date('2026-06-18'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-7',
    title: 'Operations Manager',
    company: 'LogisticsPro',
    description: 'Oversee daily operations, optimize processes, and manage teams.',
    location: 'Chicago, IL',
    type: 'full-time',
    status: 'active',
    salaryMin: 85000,
    salaryMax: 110000,
    currency: 'USD',
    skills: ['Operations', 'Team Leadership', 'Process Optimization', 'Budgeting'],
    experienceRequired: 5,
    applicationUrl: null,
    postedAt: new Date('2026-06-20'),
    expiresAt: new Date('2026-09-20'),
    createdAt: new Date('2026-06-20'),
    updatedAt: new Date('2026-06-20'),
  }).getOrThrow(),

  Job.create({
    id: 'mock-job-8',
    title: 'Marketing Manager',
    company: 'BrandCo',
    description: 'Develop marketing strategies, manage campaigns, and analyze performance.',
    location: 'Remote',
    type: 'full-time',
    status: 'active',
    salaryMin: 95000,
    salaryMax: 125000,
    currency: 'USD',
    skills: ['Marketing Strategy', 'SEO', 'Content Marketing', 'Analytics', 'Social Media'],
    experienceRequired: 4,
    applicationUrl: null,
    postedAt: new Date('2026-06-22'),
    expiresAt: null,
    createdAt: new Date('2026-06-22'),
    updatedAt: new Date('2026-06-22'),
  }).getOrThrow(),
];

export class MockJobProvider implements JobProvider {
  readonly name = 'mock';

  async fetchJobs(_params?: Record<string, unknown>): Promise<Result<Job[]>> {
    return success([...MOCK_JOBS]);
  }

  async searchJobs(query: string): Promise<Result<Job[]>> {
    const lower = query.toLowerCase();
    const results = MOCK_JOBS.filter(
      (j) =>
        j.title.toLowerCase().includes(lower) ||
        j.company.toLowerCase().includes(lower) ||
        j.skills.some((s) => s.toLowerCase().includes(lower)),
    );
    return success(results);
  }

  async getJobById(id: string): Promise<Result<Job | null>> {
    const job = MOCK_JOBS.find((j) => j.id === id) ?? null;
    if (!job) return success(null);
    return success(job);
  }
}
