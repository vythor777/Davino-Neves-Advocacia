import api from './api';
import { TOKEN_KEY, USER_KEY, clearSession, getSessionToken } from './session';

export type Role = 'ADMINISTRADOR' | 'ADVOGADO' | 'ESTAGIARIO';

export interface Usuario {
  id: number;
  id_usuario?: number;
  nome: string;
  email: string;
  role: Role;
  ativo?: boolean;
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  user: Usuario;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    const { access_token, user } = response.data;
    this.setSession(access_token, user);
    return response.data;
  },

  async getProfile(): Promise<Usuario> {
    const response = await api.get<Usuario>('/auth/me');
    return response.data;
  },

  setSession(token: string, user: Usuario): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Configura cookies para verificação imediata pelo Middleware do Next.js
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `davino_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secure}`;
      document.cookie = `davino_auth_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${secure}`;
    }
  },

  clearSession,

  getToken: getSessionToken,

  getStoredUser(): Usuario | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'ADMINISTRADOR';
  },

  hasRole(allowedRoles: Role[]): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  },
};

export default authService;
