import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export function DashboardSection({
  title,
  href,
  children,
  loading,
  unavailable,
}: {
  title: string;
  href: string;
  children: ReactNode;
  loading: boolean;
  unavailable: boolean;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="font-semibold">{title}</h2>
        <Link
          className="dashboard-link text-sm"
          href={href}
          aria-label={`Ver todos: ${title}`}
        >
          Ver todos <ArrowUpRight aria-hidden className="inline h-4 w-4" />
        </Link>
      </header>
      <div className="p-5">
        {loading ? (
          <div className="space-y-4 animate-pulse" role="status">
            <span className="sr-only">Carregando {title}</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-10 rounded bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : unavailable ? (
          <p
            role="status"
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            Não foi possível carregar esta seção. Tente atualizar o painel.
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
      {children}
    </p>
  );
}
