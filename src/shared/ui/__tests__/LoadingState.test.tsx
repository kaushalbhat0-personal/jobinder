import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from '@/shared/ui/organisms/LoadingState';

describe('LoadingState', () => {
  it('renders spinner and default message', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<LoadingState message="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('renders full page variant', () => {
    render(<LoadingState fullPage />);
    expect(screen.getByRole('status').parentElement?.className).toContain('min-h-screen');
  });
});
