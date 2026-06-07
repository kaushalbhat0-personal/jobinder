import { cn } from '@/shared/utils/cn';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'text-primary-500 animate-spin rounded-full border-current border-t-transparent',
        sizeStyles[size],
        className,
      )}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export type { SpinnerProps, SpinnerSize };
