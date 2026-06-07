import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/shared/ui/molecules/SearchInput';

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    render(<SearchInput placeholder="Search jobs..." />);
    expect(screen.getByPlaceholderText('Search jobs...')).toBeInTheDocument();
  });

  it('accepts input', async () => {
    const user = userEvent.setup();
    render(<SearchInput />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'developer');
    expect(input).toHaveValue('developer');
  });

  it('shows clear button when value exists', () => {
    render(<SearchInput value="test" onChange={() => {}} onClear={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('does not show clear button when no onClear', () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });
});
