import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

type TextVariant = 'body-lg' | 'body-md' | 'body-sm' | 'caption' | 'label';

interface TextProps {
  variant?: TextVariant;
  as?: 'p' | 'span' | 'div' | 'label';
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  'body-lg': 'text-body-lg',
  'body-md': 'text-body-md',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
  label: 'text-label',
};

export function Text({ variant = 'body-md', as: Tag = 'p', className, children }: TextProps) {
  return <Tag className={cn(variantStyles[variant], 'text-foreground', className)}>{children}</Tag>;
}

export type { TextProps, TextVariant };
