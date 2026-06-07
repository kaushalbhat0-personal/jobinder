'use client';

import { cn } from '@/shared/utils/cn';
import { Heading } from '@/shared/ui/atoms/Heading';
import { Text } from '@/shared/ui/atoms/Text';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  backButton?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, backButton, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-start justify-between gap-4 px-4 py-4', className)}>
      <div className="min-w-0 flex-1">
        {backButton && <div className="mb-2">{backButton}</div>}
        <Heading variant="heading-lg" as="h1" className="truncate">
          {title}
        </Heading>
        {description && (
          <Text variant="body-sm" className="mt-1 text-neutral-500">
            {description}
          </Text>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export type { PageHeaderProps };
