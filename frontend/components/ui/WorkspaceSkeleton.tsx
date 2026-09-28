/** Preserves the page structure while authentication is being verified. */
export function WorkspaceSkeleton() {
  return (
    <div className="app-page" role="status" aria-label="Verificando autenticação e permissões">
      <span className="sr-only">Verificando autenticação e permissões...</span>
      <div aria-hidden className="space-y-6 animate-pulse">
        <div className="space-y-3 border-b border-line py-3">
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-2/3 max-w-sm rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-3/4 max-w-lg rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-36 rounded-xl border border-line bg-surface p-5"><div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-6 h-8 w-1/2 rounded bg-slate-100 dark:bg-slate-800" /></div>)}
        </div>
        <div className="h-72 rounded-xl border border-line bg-surface" />
      </div>
    </div>
  );
}
