import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/shared/ui/atoms/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info'] as const;
    for (const v of variants) {
      const { container } = render(<Badge variant={v}>{v}</Badge>);
      expect(container.textContent).toBe(v);
    }
  });

  it('renders all sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small');
    expect(badge.className).toContain('text-caption');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium').className).toContain('text-body-sm');
  });
});
