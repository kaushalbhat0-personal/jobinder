import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedbackSummary } from '../FeedbackSummary';

describe('FeedbackSummary', () => {
  it('renders all counts', () => {
    render(<FeedbackSummary likes={5} passes={3} saves={2} applies={1} />);
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });

  it('renders labels', () => {
    render(<FeedbackSummary likes={0} passes={0} saves={0} applies={0} />);
    expect(screen.getByText('Likes')).toBeDefined();
    expect(screen.getByText('Passes')).toBeDefined();
    expect(screen.getByText('Saved')).toBeDefined();
    expect(screen.getByText('Applied')).toBeDefined();
  });

  it('renders all zeros by default', () => {
    render(<FeedbackSummary likes={0} passes={0} saves={0} applies={0} />);
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(4);
  });
});
