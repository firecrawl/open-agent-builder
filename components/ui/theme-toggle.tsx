'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';
import { THEME_KEY, THEME_DARK, THEME_LIGHT, getCurrentTheme, applyTheme } from '@/lib/theme';

type ThemeToggleSize = 'sm' | 'md' | 'lg' | 'xl';

interface ThemeToggleProps {
  size?: ThemeToggleSize;
  className?: string;
}

const SIZE_MAP: Record<ThemeToggleSize, { button: string; icon: string }> = {
  sm: { button: 'h-10 w-10', icon: 'h-5 w-5' },
  md: { button: 'h-14 w-14', icon: 'h-8 w-8' },
  lg: { button: 'h-36 w-36', icon: 'h-16 w-16' },
  xl: { button: 'h-36 w-36', icon: 'h-16 w-16' },
};

export function ThemeToggle({ size = 'md', className }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  // Listen for system color scheme changes
  useEffect(() => {
    // Set initial state from DOM (already applied by blocking script)
    setIsDark(getCurrentTheme() === THEME_DARK);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = getCurrentTheme();
      const savedTheme = localStorage.getItem(THEME_KEY);

      // Only auto-update if no saved preference
      if (!savedTheme && e.matches) {
        applyTheme(THEME_DARK);
        setIsDark(true);
      } else if (!savedTheme && !e.matches) {
        applyTheme(THEME_LIGHT);
        setIsDark(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newIsDark = !isDark;

    if (newIsDark) {
      html.classList.add('dark');
      localStorage.setItem(THEME_KEY, THEME_DARK);
    } else {
      html.classList.remove('dark');
      localStorage.setItem(THEME_KEY, THEME_LIGHT);
    }

    setIsDark(newIsDark);
  };

  const sizing = SIZE_MAP[size];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heat-100 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        sizing.button,
        className,
      )}
    >
      <Sun className={cn(sizing.icon, 'dark:hidden')} />
      <Moon className={cn(sizing.icon, 'hidden dark:block')} />
    </button>
  );
}
