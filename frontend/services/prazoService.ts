import api from './api';
import { Processo } from './processoService';

export interface Prazo {
  id_prazo: number;
  descricao: string;
  data_vencimento: string;
  status: string;
  id_processo: number;
  data_criacao?: string;
  data_atualizacao?: string;
  processo?: Processo;
}

export interface CreatePrazoInput {
  descricao: string;
  data_vencimento: string; // Formato YYYY-MM-DD ou ISO string
  status: string;
  id_processo: number;
}

export type UpdatePrazoInput = Partial<CreatePrazoInput>;

export const prazoService = {
  async getAll(): Promise<Prazo[]> {
    const response = await api.get<Prazo[]>('/prazos');
    return response.data;
  },

  async getById(id: number): Promise<Prazo> {
    const response = await api.get<Prazo>(`/prazos/${id}`);
    return response.data;
  },

  async create(data: CreatePrazoInput): Promise<Prazo> {
    const response = await api.post<Prazo>('/prazos', data);
    return response.data;
  },

  async update(id: number, data: UpdatePrazoInput): Promise<Prazo> {
    const response = await api.patch<Prazo>(`/prazos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/prazos/${id}`);
  },
};

export default prazoService;
