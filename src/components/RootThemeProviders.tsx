'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

export function RootThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RootThemeBodyWrapper>{children}</RootThemeBodyWrapper>
    </ThemeProvider>
  );
}

function RootThemeBodyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <body className="min-h-full flex flex-col">
      {children}
    </body>
  );
}
