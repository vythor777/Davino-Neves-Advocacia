'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IARedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/gemini');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent dark:border-amber-400" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Redirecionando para IA Jurídica...
        </p>
      </div>
    </div>
  );
}
