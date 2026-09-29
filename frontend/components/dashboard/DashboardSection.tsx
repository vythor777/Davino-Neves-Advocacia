import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Inbox, type LucideIcon } from "lucide-react";

export function DashboardSection({
  className = "",
  title,
  href,
  children,
  loading,
  unavailable,
}: {
  className?: string;
  title: string;
  href?: string;
  children: ReactNode;
  loading: boolean;
  unavailable: boolean;
}) {
  return (
    <section
      className={`dashboard-section legal-card min-w-0 ${className}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {href && (<Link
          className="dashboard-link shrink-0 text-xs font-medium"
          href={href}
          aria-label={`Ver todos: ${title}`}
        >
          Ver todos <ArrowUpRight aria-hidden className="inline h-4 w-4" />
        </Link>)}
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

export function EmptyState({ children, icon: Icon = Inbox, action }: {
  children: ReactNode;
  icon?: LucideIcon;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-background text-slate-500"><Icon aria-hidden className="h-5 w-5" /></span>
      <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">{children}</p>
      {action && <Link href={action.href} className="ui-button ui-button-secondary mt-1">{action.label}</Link>}
    </div>
  );
}
