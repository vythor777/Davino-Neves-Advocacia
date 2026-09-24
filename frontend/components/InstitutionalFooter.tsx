export function InstitutionalFooter() {
  return (
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <span>Davino Neves Advocacia</span>
      <span>Gestão do escritório · {new Date().getFullYear()}</span>
    </footer>
  );
}
