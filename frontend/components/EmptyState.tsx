'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  badgeText?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  badgeText,
}: EmptyStateProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-2xs dark:border-slate-800/90 dark:bg-slate-900 ${className}`}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-transparent dark:from-slate-800/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-900/60 shadow-xs mb-4">
          <Icon className="h-7 w-7" />
        </div>

        {badgeText && (
          <span className="mb-2 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {badgeText}
          </span>
        )}

        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-balance">
          {description}
        </p>

        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {action && (
              action.href ? (
                <a
                  href={action.href}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all active:scale-[0.98]"
                >
                  {action.icon && <action.icon className="h-3.5 w-3.5" />}
                  <span>{action.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sky-500 dark:bg-sky-600 dark:hover:bg-sky-500 transition-all active:scale-[0.98]"
                >
                  {action.icon && <action.icon className="h-3.5 w-3.5" />}
                  <span>{action.label}</span>
                </button>
              )
            )}

            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98]"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-3.5 w-3.5" />}
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
