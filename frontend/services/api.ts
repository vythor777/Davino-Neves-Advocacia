import axios from 'axios';
import { clearSession, getSessionToken } from './session';
import { getBackendApiUrl } from '../utils/backendUrl';

// URL base da API configurável via variável de ambiente NEXT_PUBLIC_API_URL
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api' : getBackendApiUrl(process.env));

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor de requisição: anexa o token JWT se presente no localStorage/cookies
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      if (config.data instanceof FormData) config.headers.delete('Content-Type');
      const token = getSessionToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Uma resposta antiga não deve encerrar uma sessão aberta após a requisição.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentToken = getSessionToken();
      const sentAuthorization = error.config?.headers?.Authorization;
      if (currentToken && sentAuthorization === `Bearer ${currentToken}` && error.config?.url !== '/auth/login') {
        clearSession();
      }
    }

    let data = error.response?.data;
    if (data instanceof Blob) {
      try { data = JSON.parse(await data.text()); } catch { data = undefined; }
    }
    const message =
      (error.response?.status === 401 && error.config?.url !== '/auth/login' ? 'Sua sessão expirou ou não é válida. Faça login novamente para continuar.' : data?.message) ||
      error.message ||
      'Ocorreu um erro ao processar a requisição.';
    const customError = new Error(Array.isArray(message) ? message.join(', ') : message);
    (customError as unknown as { status?: number }).status = error.response?.status;
    return Promise.reject(customError);
  },
);

export default api;
