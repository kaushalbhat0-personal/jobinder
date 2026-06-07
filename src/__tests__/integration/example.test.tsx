import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Providers } from '@/app/providers';

describe('Providers integration', () => {
  it('renders children within QueryClientProvider', () => {
    render(
      <Providers>
        <p>Hello World</p>
      </Providers>,
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
