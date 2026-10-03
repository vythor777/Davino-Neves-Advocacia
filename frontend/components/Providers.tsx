'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AiTaskProvider } from '@/context/AiTaskContext';
import { AiTaskIndicator } from '@/components/AiTaskNotifications';
import AppLayout from '@/components/AppLayout';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AiTaskProvider>
        <AppLayout>{children}</AppLayout>
        <AiTaskIndicator />
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="system"
          toastOptions={{
            className: "text-xs font-medium rounded-xl shadow-lg border border-slate-200 dark:border-slate-800",
          }}
        />
        </AiTaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
