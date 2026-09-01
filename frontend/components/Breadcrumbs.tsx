'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-1 -ml-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60"
        title="Início / Dashboard"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:inline-block">Início</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            {isLast || !item.href ? (
              <span
                aria-current={isLast ? 'page' : undefined}
                className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[220px] sm:max-w-xs"
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />}
                <span className="truncate">{item.label}</span>
              </span>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-md p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 truncate max-w-[160px]"
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
