import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from '@/shared/ui/atoms/Text';

describe('Text', () => {
  it('renders children', () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders as paragraph by default', () => {
    render(<Text>Content</Text>);
    expect(screen.getByText('Content').tagName).toBe('P');
  });

  it('renders as custom element', () => {
    const { rerender } = render(<Text as="span">Span</Text>);
    expect(screen.getByText('Span').tagName).toBe('SPAN');

    rerender(<Text as="label">Label</Text>);
    expect(screen.getByText('Label').tagName).toBe('LABEL');
  });

  it('renders all variants', () => {
    const variants = ['body-lg', 'body-md', 'body-sm', 'caption', 'label'] as const;
    for (const v of variants) {
      const { container } = render(<Text variant={v}>{v}</Text>);
      expect(container.textContent).toBe(v);
    }
  });
});
