import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobCard } from '../components/JobCard';
import { Job } from '../entities/job';

function createMockJob(id = 'job-1'): Job {
  return Job.create({
    id,
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    description: 'Build and maintain scalable backend services.',
    location: 'San Francisco, CA',
    type: 'full-time',
    status: 'active',
    salaryMin: 140000,
    salaryMax: 180000,
    currency: 'USD',
    skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
    experienceRequired: 5,
    applicationUrl: 'https://example.com/apply',
    postedAt: new Date('2026-06-01'),
    expiresAt: null,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
  }).getOrThrow();
}

describe('JobCard', () => {
  it('renders job title and company', () => {
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} />);
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });

  it('renders match score badge', () => {
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} />);
    expect(screen.getByText('85% Match')).toBeInTheDocument();
  });

  it('renders match reasons', () => {
    render(
      <JobCard
        job={createMockJob()}
        matchScore={85}
        matchReasons={['Remote position available', '✓ TypeScript experience']}
      />,
    );
    expect(screen.getByText('Remote position available')).toBeInTheDocument();
    expect(screen.getByText('✓ TypeScript experience')).toBeInTheDocument();
  });

  it('renders location and salary', () => {
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} />);
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('$140k–180k')).toBeInTheDocument();
  });

  it('renders action buttons when callbacks provided', () => {
    render(
      <JobCard
        job={createMockJob()}
        matchScore={85}
        matchReasons={[]}
        onSave={vi.fn()}
        onPass={vi.fn()}
        onApply={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('does not render action buttons when callbacks not provided', () => {
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} />);
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pass/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply/i })).not.toBeInTheDocument();
  });

  it('calls onSave when Save button clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith('job-1');
  });

  it('calls onPass when Pass button clicked', async () => {
    const user = userEvent.setup();
    const onPass = vi.fn();
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} onPass={onPass} />);
    await user.click(screen.getByRole('button', { name: /pass/i }));
    expect(onPass).toHaveBeenCalledWith('job-1');
  });

  it('calls onApply when Apply button clicked', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} onApply={onApply} />);
    await user.click(screen.getByRole('button', { name: /apply/i }));
    expect(onApply).toHaveBeenCalledWith('job-1');
  });

  it('renders skills section when job has skills', () => {
    render(<JobCard job={createMockJob()} matchScore={85} matchReasons={[]} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('AWS')).toBeInTheDocument();
  });

  it('shows +N badge when skills exceed 5', () => {
    const job = createMockJob('job-2');
    const jobWithManySkills = Job.create({
      ...job,
      skills: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    }).getOrThrow();

    render(<JobCard job={jobWithManySkills} matchScore={85} matchReasons={[]} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows loading state on save button', () => {
    render(
      <JobCard job={createMockJob()} matchScore={85} matchReasons={[]} onSave={vi.fn()} isSaving />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
