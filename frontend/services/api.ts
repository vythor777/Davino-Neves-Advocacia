import axios from 'axios';

// URL base da API configurável via variável de ambiente NEXT_PUBLIC_API_URL
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Ocorreu um erro ao processar a requisição.';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

export default api;
