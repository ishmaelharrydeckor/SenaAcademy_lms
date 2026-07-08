'use client';

import React from 'react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export function RootThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RootThemeBodyWrapper>{children}</RootThemeBodyWrapper>
    </ThemeProvider>
  );
}

function RootThemeBodyWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <body className={`min-h-full flex flex-col transition-colors duration-250 ${
      theme === 'dark' 
        ? 'dark bg-[#021736] text-zinc-100' 
        : 'light bg-[#F8FAFC] text-[#021736]'
    }`}>
      {children}
    </body>
  );
}
