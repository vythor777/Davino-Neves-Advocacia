'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService, { Usuario, LoginCredentials } from '@/services/authService';

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

    async function initializeAuth() {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getStoredUser();

        if (storedToken && storedUser && isMounted) {
          setToken(storedToken);
          setUser(storedUser);

          try {
            const profile = await authService.getProfile();
            if (isMounted) {
              setUser(profile);
              authService.setSession(storedToken, profile);
            }
          } catch {
            // Token pode estar expirado
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
    router.push('/login');
  };

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      const currentToken = authService.getToken();
      if (currentToken) {
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
