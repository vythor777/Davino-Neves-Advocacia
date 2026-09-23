'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService, { Usuario, LoginCredentials } from '@/services/authService';
import { SESSION_CLEARED_EVENT, TOKEN_KEY } from '@/services/session';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdvogado: boolean;
  isEstagiario: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const handleSessionCleared = () => {
      setToken(null);
      setUser(null);
    };
    const handleStorage = (event: StorageEvent) => {
      if ((event.key === TOKEN_KEY || event.key === null) && !authService.getToken()) {
        handleSessionCleared();
      }
    };
    window.addEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
    window.addEventListener('storage', handleStorage);

    async function initializeAuth() {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getStoredUser();

        if (storedToken && isMounted) {
          setToken(storedToken);
          setUser(storedUser);

          try {
            const profile = await authService.getProfile();
            if (isMounted && authService.getToken() === storedToken) {
              setUser(profile);
              authService.setSession(storedToken, profile);
            }
          } catch {
            // O interceptor limpa sessões rejeitadas; falhas temporárias preservam a sessão.
            if (isMounted && !authService.getToken()) handleSessionCleared();
          }
        }
      } catch {
        authService.clearSession();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
      window.removeEventListener(SESSION_CLEARED_EVENT, handleSessionCleared);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.access_token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.clearSession();
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  const refreshProfile = useCallback(async () => {
    const currentToken = authService.getToken();
    if (!currentToken) return;
    try {
      const profile = await authService.getProfile();
      if (authService.getToken() === currentToken) {
        setUser(profile);
        authService.setSession(currentToken, profile);
      }
    } catch {
      // Ignora se não autenticado
    }
  }, []);

  const isAdmin = user?.role === 'ADMINISTRADOR';
  const isAdvogado = user?.role === 'ADVOGADO';
  const isEstagiario = user?.role === 'ESTAGIARIO';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isAdvogado,
        isEstagiario,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  isAdvogado: false,
  isEstagiario: false,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}
