'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider } from '@/shared/lib/theme';
import { ToastProvider } from '@/shared/ui/molecules/Toast';
import { setProfileRepository } from '@/shared/lib/repositories';
import { SupabaseProfileRepository } from '@/domains/profile/repositories/supabase-profile.repository';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    setProfileRepository(new SupabaseProfileRepository());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
