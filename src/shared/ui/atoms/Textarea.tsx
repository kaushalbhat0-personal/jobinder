import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'bg-background text-body-md text-foreground flex min-h-[80px] w-full rounded-lg border px-3 py-2',
          'placeholder:text-neutral-400',
          'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
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

Textarea.displayName = 'Textarea';

export type { TextareaProps };
