import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/shared/ui/atoms/Spinner';

describe('Spinner', () => {
  it('renders with loading label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders sr-only text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...').className).toContain('sr-only');
  });

  it('renders all sizes', () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    expect(screen.getByRole('status').className).toContain('custom-spinner');
  });
});
