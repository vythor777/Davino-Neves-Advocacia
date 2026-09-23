/** Aceita somente caminhos internos, sem permitir um retorno ao próprio login. */
export function getLoginRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) {
    return '/';
  }
  try {
    const base = 'https://app.invalid';
    const url = new URL(value, base);
    const pathname = decodeURIComponent(url.pathname);
    if (url.origin !== base || pathname === '/login' || pathname.startsWith('/login/')) {
      return '/';
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}
