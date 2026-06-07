import { cn } from '@/shared/utils/cn';
import { Heading } from '@/shared/ui/atoms/Heading';
import { Text } from '@/shared/ui/atoms/Text';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}
    >
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      <Heading variant="heading-sm">{title}</Heading>
      {description && (
        <Text variant="body-sm" className="mt-2 max-w-[280px] text-neutral-500">
          {description}
        </Text>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export type { EmptyStateProps };
