import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Application } from '../entities/application';
import { ApplicationDashboard } from '../components/ApplicationDashboard';

function makeApp(
  id: string,
  stage: string,
  overrides: Partial<Parameters<typeof Application.create>[0]> = {},
) {
  return Application.create({
    id,
    userId: 'user-1',
    jobId: `job-${id}`,
    company: 'TestCorp',
    role: 'Engineer',
    stage: stage as Parameters<typeof Application.create>[0]['stage'],
    appliedDate: new Date('2026-01-15'),
    lastUpdated: new Date('2026-03-01'),
    ...overrides,
  });
}

describe('ApplicationDashboard', () => {
  it('shows summary stats', () => {
    const apps = [makeApp('1', 'saved'), makeApp('2', 'interview'), makeApp('3', 'offer')];
    render(<ApplicationDashboard applications={apps} />);

    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('33%')).toBeDefined(); // 1/3 = 33%
    expect(screen.getByText('Interviews')).toBeDefined();
    expect(screen.getByText('Offers')).toBeDefined();
  });

  it('shows empty state when no applications', () => {
    render(<ApplicationDashboard applications={[]} />);
    expect(screen.getByText('No applications yet. Start applying to jobs!')).toBeDefined();
  });

  it('shows conversion rate 0 when no applications', () => {
    render(<ApplicationDashboard applications={[]} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1); // Applications count
  });

  it('renders custom title', () => {
    render(<ApplicationDashboard applications={[]} title="My Pipeline" />);
    expect(screen.getByText('My Pipeline')).toBeDefined();
  });
});
