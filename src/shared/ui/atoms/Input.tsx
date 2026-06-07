import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'bg-background text-body-md text-foreground flex h-10 w-full rounded-lg border px-3 py-2',
          'placeholder:text-neutral-400',
          'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-danger-500 focus-visible:ring-danger-500'
            : 'focus-visible:ring-primary-500 border-neutral-300',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export type { InputProps };
