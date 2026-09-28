import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
          Gestão do escritório
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      {children && (
        <div className="page-actions flex flex-wrap items-center gap-2">{children}</div>
      )}
    </header>
  );
}
