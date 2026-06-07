import { cn } from '@/shared/utils/cn';

type ProgressBarSize = 'sm' | 'md';
type ProgressBarVariant = 'primary' | 'success';

interface ProgressBarProps {
  value: number;
  size?: ProgressBarSize;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  className?: string;
}

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

const variantStyles: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
};

export function ProgressBar({
  value,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn('flex-1 overflow-hidden rounded-full bg-neutral-200', sizeStyles[size])}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantStyles[variant],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-body-sm min-w-[3ch] text-right text-neutral-600 tabular-nums">
          {clamped}%
        </span>
      )}
    </div>
  );
}

export type { ProgressBarProps, ProgressBarSize, ProgressBarVariant };
