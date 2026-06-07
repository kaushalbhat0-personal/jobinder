'use client';

import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/shared/hooks/use-local-storage';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme | null>('theme', null);

  const resolvedTheme: Theme = storedTheme ?? (prefersDark ? 'dark' : 'light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (theme: Theme) => {
      setStoredTheme(theme);
    },
    [setStoredTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme: resolvedTheme, setTheme, toggleTheme, isDark: resolvedTheme === 'dark' }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
