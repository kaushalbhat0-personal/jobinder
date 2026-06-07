import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

type IconSize = 'sm' | 'md' | 'lg';

interface IconProps {
  children: ReactNode;
  size?: IconSize;
  className?: string;
  label?: string;
}

const sizeStyles: Record<IconSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function Icon({ children, size = 'md', className, label }: IconProps) {
  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      className={cn('inline-flex items-center justify-center', sizeStyles[size], className)}
    >
      {children}
    </span>
  );
}

export type { IconProps, IconSize };
