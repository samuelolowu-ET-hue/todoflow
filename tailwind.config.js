/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background:  { DEFAULT: 'var(--background)' },
        foreground:  { DEFAULT: 'var(--foreground)' },
        card:        { DEFAULT: 'var(--card)',    foreground: 'var(--card-foreground)' },
        elevated:    { DEFAULT: 'var(--elevated)' },
        primary:     { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)', dim: 'var(--primary-dim)' },
        secondary:   { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        accent:      { DEFAULT: 'var(--accent)',  foreground: 'var(--accent-foreground)' },
        muted:       { DEFAULT: 'var(--muted)',   foreground: 'var(--muted-foreground)' },
        border:      { DEFAULT: 'var(--border)' },
        input:       { DEFAULT: 'var(--input)' },
        ring:        { DEFAULT: 'var(--ring)' },
        success:     { DEFAULT: 'var(--success)',  bg: 'var(--success-bg)' },
        warning:     { DEFAULT: 'var(--warning)',  bg: 'var(--warning-bg)' },
        danger:      { DEFAULT: 'var(--danger)',   bg: 'var(--danger-bg)' },
        info:        { DEFAULT: 'var(--info)',     bg: 'var(--info-bg)' },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm:  'calc(var(--radius) - 2px)',
        md:  'var(--radius)',
        lg:  'calc(var(--radius) + 2px)',
        xl:  'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 200ms ease-in-out forwards',
        'slide-up':   'slideUp 200ms ease-out forwards',
        'todo-exit':  'todoExit 250ms ease-out forwards',
        'spin-slow':  'spin 2s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};