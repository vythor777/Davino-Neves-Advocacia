import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/** Abre o cadastro uma vez e consome o atalho sem perder os outros filtros. */
export function useCreateFromQuery(onCreate: () => void, ready = true) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (searchParams.get('novo') !== 'true') {
      handled.current = false;
      return;
    }
    if (!ready || handled.current) return;
    handled.current = true;
    onCreate();
    const remaining = new URLSearchParams(searchParams.toString());
    remaining.delete('novo');
    const query = remaining.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [searchParams, pathname, router, onCreate, ready]);
}
