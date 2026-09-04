import axios from 'axios';

// URL base da API configurável via variável de ambiente NEXT_PUBLIC_API_URL
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api' : (process.env.BACKEND_URL || 'http://127.0.0.1:10000/api'));

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
      const token = localStorage.getItem('davino_auth_token');
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
  (error) => {
    // Se receber 401 Unauthorized e não estiver na página de login, pode limpar a sessão
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage && localStorage.getItem('davino_auth_token')) {
        localStorage.removeItem('davino_auth_token');
        localStorage.removeItem('davino_auth_user');
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Ocorreu um erro ao processar a requisição.';
    const customError = new Error(Array.isArray(message) ? message.join(', ') : message);
    (customError as unknown as { status?: number }).status = error.response?.status;
    return Promise.reject(customError);
  },
);

export default api;
