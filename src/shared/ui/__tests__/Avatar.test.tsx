import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '@/shared/ui/atoms/Avatar';

describe('Avatar', () => {
  it('renders initials fallback', () => {
    render(<Avatar alt="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single initial', () => {
    render(<Avatar alt="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    render(<Avatar src="/photo.jpg" alt="User" />);
    expect(screen.getByAltText('User')).toBeInTheDocument();
  });

  it('renders custom fallback', () => {
    render(<Avatar alt="User" fallback="AB" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders all sizes', () => {
    const { rerender } = render(<Avatar alt="Test" size="sm" />);
    expect(screen.getByText('T')).toBeInTheDocument();

    rerender(<Avatar alt="Test" size="xl" />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
