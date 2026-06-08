'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation } from '@/shared/ui/organisms';
import type { ReactNode } from 'react';

const navItems = [
  {
    value: '/feed',
    label: 'Feed',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    value: '/resume',
    label: 'Resume',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8"
        />
      </svg>
    ),
  },
  {
    value: '/applications',
    label: 'Applications',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="7"
          width="20"
          height="14"
          rx="2"
          ry="2"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
        />
      </svg>
    ),
  },
  {
    value: '/profile',
    label: 'Profile',
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = navItems.map((item) => ({
    ...item,
    active: pathname.startsWith(item.value),
  }));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
      {children}
      <BottomNavigation items={items} onValueChange={(value) => router.push(value)} />
    </div>
  );
}
