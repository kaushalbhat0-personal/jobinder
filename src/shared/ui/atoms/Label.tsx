import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className, children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn('text-label text-foreground', className)} {...props}>
        {children}
        {required && (
          <span className="text-danger-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = 'Label';

export type { LabelProps };
