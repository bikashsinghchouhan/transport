'use client';

import { Moon, Sun } from 'lucide-react';

export const THEME_STORAGE_KEY = 'b2-theme';

/**
 * Toggles <html data-theme>. Light is the default; the choice is saved in localStorage.
 * Which icon shows is decided by CSS (globals.css), so server and client render the same markup.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode); theme still applies for this visit
    }
  };

  return (
    <button type="button" onClick={toggle} className={className} aria-label="Toggle dark mode" title="Toggle dark mode">
      <Moon size={17} className="theme-icon-moon" />
      <Sun size={17} className="theme-icon-sun" />
    </button>
  );
}
