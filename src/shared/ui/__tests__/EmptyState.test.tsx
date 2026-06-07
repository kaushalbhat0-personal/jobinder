import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/shared/ui/organisms/EmptyState';
import { Button } from '@/shared/ui/atoms/Button';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Nothing here" description="Try adding something" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try adding something')).toBeInTheDocument();
  });

  it('renders action', () => {
    render(<EmptyState title="Empty" action={<Button>Add</Button>} />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<EmptyState title="Just title" />);
    expect(screen.getByText('Just title')).toBeInTheDocument();
  });
});
