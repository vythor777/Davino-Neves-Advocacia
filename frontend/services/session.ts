export const TOKEN_KEY = 'davino_auth_token';
export const USER_KEY = 'davino_auth_user';
export const SESSION_CLEARED_EVENT = 'davino:session-cleared';
const COOKIE_NAMES = ['davino_token', 'davino_auth_token', 'auth_token', 'token'];

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) return stored;

  for (const name of COOKIE_NAMES) {
    const cookie = document.cookie.split(';').map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`));
    if (cookie) {
      try {
        const token = decodeURIComponent(cookie.slice(name.length + 1));
        if (token) return token;
      } catch {
        // Cookies inválidos não devem impedir o acesso à tela de login.
      }
    }
  }
  return null;
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  for (const name of COOKIE_NAMES) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}
