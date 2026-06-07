import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Application } from '../entities/application';
import { ApplicationCard } from '../components/ApplicationCard';

function makeApp(stage: string, overrides: Partial<Parameters<typeof Application.create>[0]> = {}) {
  return Application.create({
    id: 'app-1',
    userId: 'user-1',
    jobId: 'job-1',
    company: 'TestCorp',
    role: 'Software Engineer',
    stage: stage as Parameters<typeof Application.create>[0]['stage'],
    appliedDate: new Date('2026-01-15'),
    lastUpdated: new Date('2026-03-01'),
    ...overrides,
  });
}

describe('ApplicationCard', () => {
  it('renders role and company', () => {
    render(<ApplicationCard application={makeApp('saved')} />);
    expect(screen.getByText('Software Engineer')).toBeDefined();
    expect(screen.getByText('TestCorp')).toBeDefined();
  });

  it('renders current stage badge', () => {
    render(<ApplicationCard application={makeApp('interview')} />);
    expect(screen.getByText('Interview')).toBeDefined();
  });

  it('renders dates', () => {
    render(<ApplicationCard application={makeApp('applied')} />);
    expect(screen.getByText(/Applied:/)).toBeDefined();
    expect(screen.getByText(/Updated:/)).toBeDefined();
  });

  it('shows Offer badge for offer stage', () => {
    render(<ApplicationCard application={makeApp('offer')} />);
    expect(screen.getByText('Offer')).toBeDefined();
  });
});
