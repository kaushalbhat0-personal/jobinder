import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

type HeadingVariant = 'display-lg' | 'display-md' | 'heading-lg' | 'heading-md' | 'heading-sm';

interface HeadingProps {
  variant?: HeadingVariant;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<HeadingVariant, string> = {
  'display-lg': 'text-display-lg',
  'display-md': 'text-display-md',
  'heading-lg': 'text-heading-lg',
  'heading-md': 'text-heading-md',
  'heading-sm': 'text-heading-sm',
};

const defaultTags: Record<HeadingVariant, 'h1' | 'h2' | 'h3'> = {
  'display-lg': 'h1',
  'display-md': 'h1',
  'heading-lg': 'h2',
  'heading-md': 'h3',
  'heading-sm': 'h3',
};

export function Heading({ variant = 'heading-md', as, className, children }: HeadingProps) {
  const Tag = as ?? defaultTags[variant];
  return <Tag className={cn(variantStyles[variant], 'text-foreground', className)}>{children}</Tag>;
}

export type { HeadingProps, HeadingVariant };
