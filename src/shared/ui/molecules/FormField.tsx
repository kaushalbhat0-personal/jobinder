import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Label } from '@/shared/ui/atoms/Label';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, required, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label required={required} htmlFor={undefined}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-caption text-neutral-500">{hint}</p>}
      {error && (
        <p className="text-caption text-danger-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type { FormFieldProps };
