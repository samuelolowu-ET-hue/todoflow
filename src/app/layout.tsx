import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '../styles/tailwind.css';

// WHY GEIST?
// Geist is a clean, modern font designed by Vercel — the same company behind Next.js.
// It has excellent legibility at small sizes and a technical/developer aesthetic
// that suits a productivity tool. We're using next/font/google which automatically
// optimizes font loading (no layout shift, no external network request at runtime).
const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'TodoFlow — Task Management for AI Engineering Cohort',
  description: 'A focused todo list application with notes, priorities, and persistent storage — built for AI engineering learners.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className={geist.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--elevated)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </ThemeProvider>
      
      <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Ftodoflow3205back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.20" />
      <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.3" /></body>
    </html>
  );
}