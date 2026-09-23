interface BackendEnvironment {
  [name: string]: string | undefined;
  BACKEND_INTERNAL_URL?: string;
  BACKEND_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
}

/** Usa a URL pública já configurada quando não há um destino interno separado. */
export function getBackendApiUrl(environment: BackendEnvironment): string {
  const publicApiUrl = environment.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = environment.BACKEND_INTERNAL_URL?.trim()
    || environment.BACKEND_URL?.trim()
    || (publicApiUrl && /^https?:\/\//i.test(publicApiUrl) ? publicApiUrl : undefined)
    || 'http://127.0.0.1:10000';

  return `${baseUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/api`;
}
