'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  id?: string;
}

/**
 * Componente base de Skeleton com animação de pulso suave e neutros sofisticados
 */
export function Skeleton({ className = '', id }: SkeletonProps) {
  return (
    <div
      id={id}
      className={`animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/70 ${className}`}
    />
  );
}

/**
 * Skeleton para linhas e tabelas corporativas completas com sticky header simulado
 */
export function TableSkeleton({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`th-${i}`} className="h-4 w-24" />
        ))}
      </div>

      {/* Body Rows Skeleton */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={`row-${rIdx}`}
            className="flex items-center justify-between p-4 gap-4"
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64 opacity-70" />
            </div>
            <Skeleton className="h-4 w-28 hidden sm:block" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Pagination Skeleton */}
      <div className="border-t border-slate-200 bg-slate-50/60 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/30 flex items-center justify-between">
        <Skeleton className="h-3.5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para cards de métricas do dashboard
 */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-36 opacity-60" />
    </div>
  );
}

/**
 * Skeleton para grids de cards (clientes, módulos, prazos em cards)
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`card-skel-${i}`}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20 opacity-70" />
              </div>
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para timeline de movimentações processuais (DataJud / Detalhes)
 */
export function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`tl-skel-${i}`} className="flex items-start gap-4">
          <Skeleton className="h-4 w-4 rounded-full mt-1 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4 opacity-70" />
          </div>
        </div>
      ))}
    </div>
  );
}
