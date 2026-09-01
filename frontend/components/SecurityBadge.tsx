'use client';

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface SecurityBadgeProps {
  variant?: 'compact' | 'banner' | 'pill';
  className?: string;
}

export function SecurityBadge({ variant = 'pill', className = '' }: SecurityBadgeProps) {
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 ${className}`}
      >
        <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        <span>Ambiente Criptografado TLS 256-bit</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`rounded-2xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/20 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">
              Privacidade & Proteção de Dados (LGPD)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Todos os autos judiciais, partes e anexos são armazenados sob sigilo profissional e estrita observância à Lei 13.709/2018.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="h-4 w-4" />
          <span>Auditado</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
      <span>Conforme LGPD • Sigilo Advocatício</span>
    </div>
  );
}

export default SecurityBadge;
