import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '@/shared/ui/molecules/FormField';
import { Input } from '@/shared/ui/atoms/Input';

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(
      <FormField label="Email" required>
        <Input />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(
      <FormField label="Email" hint="Enter your email">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('shows error and hides hint', () => {
    render(
      <FormField label="Email" hint="Enter your email" error="Invalid email">
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
  });

  it('uses alert role for error', () => {
    render(
      <FormField label="Email" error="Error">
        <Input />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Error');
  });
});
