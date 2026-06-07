import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Divider } from '@/shared/ui/atoms/Divider';

describe('Divider', () => {
  it('renders horizontal by default', () => {
    const { container } = render(<Divider />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
    expect(hr).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders vertical', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveAttribute('aria-orientation', 'vertical');
  });
});
