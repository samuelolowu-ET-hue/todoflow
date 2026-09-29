'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="btn btn-ghost btn-icon w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={17} className="text-muted-foreground hover:text-foreground transition-colors" />
      ) : (
        <Moon size={17} className="text-muted-foreground hover:text-foreground transition-colors" />
      )}
    </button>
  );
}
