import api from './api';
import { Role } from './authService';

export interface UsuarioItem {
  id_usuario: number;
  id?: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  role: Role;
  ativo?: boolean;
}

export interface UpdateUsuarioInput {
  nome?: string;
  email?: string;
  senha?: string;
  role?: Role;
  ativo?: boolean;
}

export const usuarioService = {
  async getAll(): Promise<UsuarioItem[]> {
    const response = await api.get<UsuarioItem[]>('/usuarios');
    return response.data;
  },

  async getById(id: number): Promise<UsuarioItem> {
    const response = await api.get<UsuarioItem>(`/usuarios/${id}`);
    return response.data;
  },

  async create(data: CreateUsuarioInput): Promise<UsuarioItem> {
    const response = await api.post<UsuarioItem>('/usuarios', data);
    return response.data;
  },

  async update(id: number, data: UpdateUsuarioInput): Promise<UsuarioItem> {
    const response = await api.patch<UsuarioItem>(`/usuarios/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  },
};

export default usuarioService;
