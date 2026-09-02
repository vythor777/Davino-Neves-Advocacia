// frontend/services/aniversarianteService.ts
import api from './api';

export interface AniversarianteItem {
  id: string;
  nome: string;
  tipo: 'USUARIO' | 'CLIENTE';
  subtitulo: string;
  email: string;
  telefone?: string;
  dataNascimento: string;
  dia: number;
  mes: number;
  diaFormatado: string;
  diasRestantesTexto: string;
  isHoje: boolean;
  destaque: boolean;
  iniciais: string;
}

export interface AniversariantesResponse {
  mes: number;
  nomeMes: string;
  total: number;
  totalUsuarios: number;
  totalClientes: number;
  aniversariantes: AniversarianteItem[];
}

export const aniversarianteService = {
  async getAniversariantesDoMes(mes?: number): Promise<AniversariantesResponse> {
    const url = mes ? `/aniversariantes?mes=${mes}` : '/aniversariantes';
    const response = await api.get<AniversariantesResponse>(url);
    return response.data;
  },
};

export default aniversarianteService;
