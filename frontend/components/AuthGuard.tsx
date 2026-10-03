'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { WorkspaceSkeleton } from '@/components/ui/WorkspaceSkeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFinance?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false, requireFinance = false }: AuthGuardProps) {
  const { user, token, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, token, router, pathname]);

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (!token) {
    return null; // Será redirecionado pelo useEffect
  }

  if ((requireAdmin && !isAdmin) || (requireFinance && !isAdmin && !user?.acesso_financeiro)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900/40 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {requireFinance ? 'Peça ao administrador para liberar seu acesso ao Financeiro na Gestão da Equipe.' : 'Esta funcionalidade é exclusiva para administradores.'}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition dark:bg-action dark:text-white dark:hover:bg-action-hover"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
