'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'compact' | 'segmented';
  className?: string;
}

export function ThemeToggle({ variant = 'dropdown', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#161b22]/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f2631] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs ${className}`}
        title={`Tema atual: ${resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}. Clique para alternar.`}
        aria-label="Alternar tema de cor"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 stroke-[1.25] text-[#dfcaa0] transition-transform hover:rotate-12" />
        ) : (
          <Sun className="h-4 w-4 stroke-[1.25] text-amber-500 transition-transform hover:rotate-45" />
        )}
      </button>
    );
  }

  if (variant === 'segmented') {
    const options: { id: ThemeMode; label: string; icon: React.ElementType }[] = [
      { id: 'light', label: 'Claro', icon: Sun },
      { id: 'dark', label: 'Escuro', icon: Moon },
      { id: 'system', label: 'Auto', icon: Laptop },
    ];

    return (
      <div
        className={`flex items-center rounded-xl border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#161b22]/70 p-1 ${className}`}
        role="group"
        aria-label="Seleção de tema"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-[#0d1117] text-slate-950 dark:text-[#dfcaa0] border border-[0.75px] border-slate-200 dark:border-white/[0.08] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5 stroke-[1.25]" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant Dropdown (padrão)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[0.75px] border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#161b22]/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f2631] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
        aria-label="Configurar tema (Claro, Escuro ou Sistema)"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Alterar tema de exibição"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 stroke-[1.25] text-[#dfcaa0]" />
        ) : (
          <Sun className="h-4 w-4 stroke-[1.25] text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[0.75px] border-slate-200 dark:border-white/[0.1] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-[0.75px] border-slate-100 dark:border-white/[0.08]">
            Aparência
          </div>
          <div className="mt-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-[#dfcaa0]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5 stroke-[1.25] text-amber-500" />
                <span>Claro</span>
              </div>
              {theme === 'light' && <Check className="h-3.5 w-3.5 stroke-[1.5] text-[#c5a059]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-[#dfcaa0]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 stroke-[1.25] text-[#dfcaa0]" />
                <span>Escuro</span>
              </div>
              {theme === 'dark' && <Check className="h-3.5 w-3.5 stroke-[1.5] text-[#dfcaa0]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition cursor-pointer ${
                theme === 'system'
                  ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-[#dfcaa0]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Laptop className="h-3.5 w-3.5 stroke-[1.25] text-slate-400" />
                <span>Automático (SO)</span>
              </div>
              {theme === 'system' && <Check className="h-3.5 w-3.5 stroke-[1.5] text-[#dfcaa0]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
