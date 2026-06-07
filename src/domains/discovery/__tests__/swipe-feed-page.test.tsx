import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SwipeFeedPage } from '../components/SwipeFeedPage';
import { SwipeSession } from '../entities/swipe-session';
import { Job } from '../entities/job';
import type { SwipeDirection } from '../entities/swipe-session';

function createJob(id: string, title: string) {
  return Job.create({
    id,
    title,
    company: 'TestCorp',
    description: 'A test job description',
    location: 'Remote',
    type: 'full-time',
    status: 'active',
    salaryMin: 100000,
    salaryMax: 150000,
    currency: 'USD',
    skills: ['TypeScript', 'React'],
    experienceRequired: 3,
    applicationUrl: null,
    postedAt: new Date(),
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).getOrThrow();
}

function createSession(userId: string) {
  return SwipeSession.create({
    id: `session-${userId}`,
    userId,
    status: 'active',
    actions: [],
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
  }).getOrThrow();
}

describe('SwipeFeedPage', () => {
  it('renders jobs as swipeable cards', () => {
    const jobs = [createJob('job-1', 'Software Engineer'), createJob('job-2', 'Product Manager')];
    const session = createSession('user-1');
    const onSwipe = vi.fn();
    const onUndo = vi.fn();

    render(<SwipeFeedPage jobs={jobs} session={session} onSwipe={onSwipe} onUndo={onUndo} />);

    expect(screen.getByText('Software Engineer')).toBeDefined();
    expect(screen.getAllByText('TestCorp').length).toBeGreaterThanOrEqual(1);
  });

  it('shows all-caught-up when all jobs swiped', () => {
    const jobs = [createJob('job-1', 'Software Engineer')];
    const session = createSession('user-1');
    const onSwipe = vi.fn();
    const onUndo = vi.fn();

    const { rerender } = render(
      <SwipeFeedPage jobs={jobs} session={session} onSwipe={onSwipe} onUndo={onUndo} />,
    );

    expect(screen.getByText('Software Engineer')).toBeDefined();

    onSwipe.mockImplementation((_id: string) => {
      rerender(
        <SwipeFeedPage
          jobs={jobs}
          session={session}
          onSwipe={(jid: string, dir: SwipeDirection) => onSwipe(jid, dir)}
          onUndo={onUndo}
        />,
      );
    });
  });

  it('shows empty state when no jobs', () => {
    const session = createSession('user-1');
    render(<SwipeFeedPage jobs={[]} session={session} onSwipe={vi.fn()} onUndo={vi.fn()} />);
    expect(screen.getByText('No jobs yet')).toBeDefined();
  });

  it('renders FeedbackSummary with session counts', () => {
    const jobs = [createJob('job-1', 'Software Engineer')];
    const session = createSession('user-1');
    render(<SwipeFeedPage jobs={jobs} session={session} onSwipe={vi.fn()} onUndo={vi.fn()} />);

    expect(screen.getAllByText('0').length).toBe(4);
    expect(screen.getByText('Likes')).toBeDefined();
    expect(screen.getByText('Passes')).toBeDefined();
  });
});
