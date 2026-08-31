import api from './api';

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

const TOKEN_KEY = 'davino_auth_token';
const USER_KEY = 'davino_auth_user';

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
      document.cookie = `davino_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `davino_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
  },

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      document.cookie = 'davino_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'davino_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) return token;

      // Fallback para cookie caso localStorage não esteja populado
      const match = document.cookie.match(/(?:^|;\s*)(?:davino_token|davino_auth_token)=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : null;
    }
    return null;
  },

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
