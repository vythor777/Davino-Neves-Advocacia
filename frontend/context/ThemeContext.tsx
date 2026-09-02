'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'davino_neves_theme';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      return saved;
    }
  } catch {
    // Ignora erro se localStorage não for acessível
  }
  return 'system';
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyHtmlTheme(targetTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (targetTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemPreference);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Sincroniza classes no DOM sempre que resolvedTheme mudar
  useEffect(() => {
    applyHtmlTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listener reativo em tempo real para mudanças de preferência no SO/navegador
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', updateSystemPreference);

    return () => {
      mediaQuery.removeEventListener('change', updateSystemPreference);
    };
  }, []);

  // Função para alterar tema manualmente
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('Não foi possível salvar preferência de tema no localStorage:', err);
    }
  }, []);

  // Toggle rápido entre Claro e Escuro
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, [resolvedTheme, setTheme]);

  const value = {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}

