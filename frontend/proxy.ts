import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rotas públicas que não requerem autenticação
const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar arquivos estáticos, bundles internos do Next.js e requisições públicas de API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar se a rota atual é pública (ex: /login)
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Obter token JWT dos cookies
  const token =
    request.cookies.get('davino_token')?.value ||
    request.cookies.get('davino_auth_token')?.value ||
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('token')?.value;

  // Se não autenticado e tentando acessar rota restrita: redirecionar obrigatoriamente para /login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // A presença de um cookie não comprova uma sessão válida. A tela de login
  // consulta /auth/me antes de decidir o retorno ao painel.
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas da aplicação exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico, ícones e assets públicos com extensão
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
