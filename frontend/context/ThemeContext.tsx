'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore, useCallback } from 'react';

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

const THEME_EVENT = 'davino-theme-change';
let memoryTheme: ThemeMode | undefined;
function readTheme(): ThemeMode { return memoryTheme ?? getStoredTheme(); }
function subscribeTheme(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      memoryTheme = undefined;
      listener();
    }
  };
  window.addEventListener(THEME_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}
function subscribeSystem(listener: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
const serverTheme = (): ThemeMode => 'system';
const serverSystemTheme = (): ResolvedTheme => 'light';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The server and the first client render share snapshots; preferences apply
  // after hydration, avoiding different Sun/Moon markup in the initial HTML.
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const systemTheme = useSyncExternalStore(subscribeSystem, getSystemPreference, serverSystemTheme);
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => { applyHtmlTheme(resolvedTheme); }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    memoryTheme = newTheme;
    try { localStorage.setItem(STORAGE_KEY, newTheme); } catch { /* In-memory preference still works. */ }
    window.dispatchEvent(new Event(THEME_EVENT));
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

const defaultThemeContext: ThemeContextType = {
  theme: 'system',
  resolvedTheme: 'dark',
  isDark: true,
  setTheme: () => {},
  toggleTheme: () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
}

