import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de rotas públicas que não requerem autenticação
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
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

  // Se já autenticado e tentando acessar /login: redirecionar para o dashboard '/'
  if (token && isPublicPath) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const redirectUrl = redirectParam && redirectParam !== '/login' ? redirectParam : '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

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
