import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNavigation } from '@/shared/ui/organisms/BottomNavigation';

const feedIcon = <svg aria-hidden="true" data-testid="feed-icon" />;
const resumeIcon = <svg aria-hidden="true" data-testid="resume-icon" />;

const defaultItems = [
  { value: '/feed', label: 'Feed', icon: feedIcon },
  { value: '/resume', label: 'Resume', icon: resumeIcon },
];

describe('BottomNavigation', () => {
  it('renders all navigation items', () => {
    render(<BottomNavigation items={defaultItems} onValueChange={() => {}} />);
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('renders icons for each item', () => {
    render(<BottomNavigation items={defaultItems} onValueChange={() => {}} />);
    expect(screen.getByTestId('feed-icon')).toBeInTheDocument();
    expect(screen.getByTestId('resume-icon')).toBeInTheDocument();
  });

  it('marks active item with aria-current', () => {
    const items = [
      { value: '/feed', label: 'Feed', icon: feedIcon, active: true },
      { value: '/resume', label: 'Resume', icon: resumeIcon, active: false },
    ];
    render(<BottomNavigation items={items} onValueChange={() => {}} />);
    const activeTab = screen.getByRole('button', { name: 'Feed' });
    expect(activeTab).toHaveAttribute('aria-current', 'page');
    const inactiveTab = screen.getByRole('button', { name: 'Resume' });
    expect(inactiveTab).not.toHaveAttribute('aria-current');
  });

  it('calls onValueChange with item value on click', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BottomNavigation items={defaultItems} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onValueChange).toHaveBeenCalledWith('/resume');
  });

  it('displays badge count when provided', () => {
    const items = [
      { value: '/feed', label: 'Feed', icon: feedIcon, badge: 5 },
      { value: '/resume', label: 'Resume', icon: resumeIcon },
    ];
    render(<BottomNavigation items={items} onValueChange={() => {}} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays 99+ for badge values over 99', () => {
    const items = [
      { value: '/feed', label: 'Feed', icon: feedIcon, badge: 150 },
      { value: '/resume', label: 'Resume', icon: resumeIcon },
    ];
    render(<BottomNavigation items={items} onValueChange={() => {}} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('has accessible navigation role and label', () => {
    render(<BottomNavigation items={defaultItems} onValueChange={() => {}} />);
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Bottom navigation');
  });

  it('applies custom className', () => {
    const { container } = render(
      <BottomNavigation items={defaultItems} onValueChange={() => {}} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles empty items gracefully', () => {
    const { container } = render(<BottomNavigation items={[]} onValueChange={() => {}} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });
});
