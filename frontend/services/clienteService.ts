import api from './api';

export interface Cliente {
  id_cliente: number;
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  data_criacao: string;
  data_atualizacao: string;
  processos?: Array<{
    id_processo: number;
    numero_processo: string;
    titulo: string;
    status: string;
    data_abertura: string;
  }>;
  _count?: {
    processos: number;
  };
}

export interface CreateClienteInput {
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

export type UpdateClienteInput = Partial<CreateClienteInput>;

export const clienteService = {
  async getAll(): Promise<Cliente[]> {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  async getById(id: number): Promise<Cliente> {
    const response = await api.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  async create(data: CreateClienteInput): Promise<Cliente> {
    const response = await api.post<Cliente>('/clientes', data);
    return response.data;
  },

  async update(id: number, data: UpdateClienteInput): Promise<Cliente> {
    const response = await api.patch<Cliente>(`/clientes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
};

export default clienteService;
