'use client';

import { type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/shared/utils/cn';

type DrawerSide = 'bottom' | 'left' | 'right';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: DrawerSide;
  className?: string;
}

const sideStyles: Record<DrawerSide, string> = {
  bottom: 'bottom-0 left-0 right-0 w-full max-h-[85vh] rounded-t-xl',
  left: 'left-0 top-0 bottom-0 w-full max-w-[320px]',
  right: 'right-0 top-0 bottom-0 w-full max-w-[320px]',
};

const sideAnimations: Record<DrawerSide, string> = {
  bottom: 'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  left: 'data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  right: 'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
};

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  side = 'bottom',
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="z-drawer fixed inset-0 bg-black/50" />
        <DialogPrimitive.Content
          className={cn(
            'z-drawer bg-background fixed shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:duration-200 data-[state=open]:duration-300',
            sideStyles[side],
            sideAnimations[side],
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <DialogPrimitive.Title className="text-heading-sm text-foreground">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="hover:text-foreground text-neutral-400"
              aria-label="Close"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </DialogPrimitive.Close>
          </div>
          <div className="overflow-y-auto p-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export type { DrawerProps, DrawerSide };
