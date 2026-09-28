import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value?: string | number;
  detail: string;
  icon: LucideIcon;
  href?: string;
  loading?: boolean;
}

/** A single presentation contract for linked dashboard indicators. */
export function MetricCard({ label, value, detail, icon: Icon, href, loading }: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-brand">
          <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {href && <ArrowUpRight aria-hidden className="h-4 w-4 text-slate-400 transition group-hover:text-brand" />}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {loading ? (
        <div role="status" className="my-2 h-9 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Carregando {label}</span>
        </div>
      ) : (
        <p className="my-2 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{value ?? "—"}</p>
      )}
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {!loading && value === undefined ? "Informação indisponível" : detail}
      </p>
    </>
  );
  const className = "metric-card group legal-card block min-w-0 p-4 sm:p-5";
  return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}
