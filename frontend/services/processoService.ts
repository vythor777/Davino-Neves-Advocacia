import api from './api';
import { Cliente } from './clienteService';

export interface Processo {
  id_processo: number;
  numero_processo: string;
  titulo: string;
  descricao: string;
  data_abertura: string;
  status: string;
  id_cliente: number;
  data_criacao: string;
  data_atualizacao: string;
  cliente?: Cliente;
  prazos?: Array<{
    id_prazo: number;
    descricao: string;
    data_limite: string;
    status: string;
  }>;
  documentos?: Array<{
    id_documento: number;
    nome_arquivo: string;
    tipo_documento: string;
    data_upload: string;
  }>;
  _count?: {
    prazos: number;
    documentos: number;
  };
}

export interface CreateProcessoInput {
  numero_processo: string;
  titulo: string;
  descricao: string;
  data_abertura: string; // Formato YYYY-MM-DD
  status: string;
  id_cliente: number;
}

export type UpdateProcessoInput = Partial<CreateProcessoInput>;

export const processoService = {
  async getAll(): Promise<Processo[]> {
    const response = await api.get<Processo[]>('/processos');
    return response.data;
  },

  async getById(id: number): Promise<Processo> {
    const response = await api.get<Processo>(`/processos/${id}`);
    return response.data;
  },

  async create(data: CreateProcessoInput): Promise<Processo> {
    const response = await api.post<Processo>('/processos', data);
    return response.data;
  },

  async update(id: number, data: UpdateProcessoInput): Promise<Processo> {
    const response = await api.patch<Processo>(`/processos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/processos/${id}`);
  },
};

export default processoService;
