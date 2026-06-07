import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-background rounded-xl border border-neutral-200 shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ className, children }: CardProps) {
  return <div className={cn('flex flex-col gap-1.5 px-4 pt-4', className)}>{children}</div>;
}

function CardBody({ className, children }: CardProps) {
  return <div className={cn('px-4 py-4', className)}>{children}</div>;
}

function CardFooter({ className, children }: CardProps) {
  return <div className={cn('flex items-center gap-2 px-4 pb-4', className)}>{children}</div>;
}

export { Card, CardHeader, CardBody, CardFooter };
export type { CardProps };
