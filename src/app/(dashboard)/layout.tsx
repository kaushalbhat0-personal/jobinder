import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col">{children}</div>;
}
