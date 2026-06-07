'use client';

import { type ReactNode, type ComponentPropsWithoutRef } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/shared/utils/cn';

interface DropdownRootProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function DropdownRoot({ trigger, children, align = 'start', className }: DropdownRootProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          className={cn(
            'z-dropdown bg-background min-w-[180px] rounded-lg border border-neutral-200 p-1 shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

interface DropdownItemProps extends ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
  children: ReactNode;
}

export function DropdownItem({ children, className, ...props }: DropdownItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'text-body-sm text-foreground flex cursor-default items-center gap-2 rounded-md px-3 py-2 outline-none',
        'data-[disabled]:opacity-50 data-[highlighted]:bg-neutral-100',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

export type { DropdownRootProps, DropdownItemProps };
