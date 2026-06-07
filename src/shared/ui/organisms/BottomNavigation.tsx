'use client';

import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

interface NavItem {
  value: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavItem[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function BottomNavigation({ items, onValueChange, className }: BottomNavigationProps) {
  return (
    <nav
      className={cn(
        'z-sticky bg-background fixed right-0 bottom-0 left-0 mx-auto w-full max-w-[430px] border-t border-neutral-200',
        className,
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 transition-colors',
              'focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:outline-none',
              item.active ? 'text-primary-500' : 'text-neutral-400',
            )}
            aria-current={item.active ? 'page' : undefined}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-caption font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="bg-danger-500 text-caption absolute -top-0.5 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-white">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export type { BottomNavigationProps, NavItem };
