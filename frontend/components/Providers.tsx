'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppLayout>{children}</AppLayout>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="system"
          toastOptions={{
            className: "text-xs font-medium rounded-xl shadow-lg border border-slate-200 dark:border-slate-800",
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
