import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from '@/shared/ui/atoms/Heading';

describe('Heading', () => {
  it('renders text', () => {
    render(<Heading>Title</Heading>);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
  });

  it('renders correct heading level for variant', () => {
    render(<Heading variant="display-lg">Display</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders custom tag', () => {
    render(<Heading as="h4">Custom</Heading>);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants = [
      'display-lg',
      'display-md',
      'heading-lg',
      'heading-md',
      'heading-sm',
    ] as const;
    for (const v of variants) {
      const { container } = render(<Heading variant={v}>{v}</Heading>);
      expect(container.textContent).toBe(v);
    }
  });
});
