import api from './api';

export interface ComplementoDataJud {
  codigo?: number;
  nome?: string;
  valor?: string | number | boolean;
  descricao?: string;
}

export interface MovimentoDataJud {
  codigo?: number;
  nome: string;
  dataHora: string;
  complementos?: ComplementoDataJud[];
}

export interface DataJudProcessoResponse {
  sucesso: boolean;
  tribunal: string;
  numeroProcesso: string;
  classe?: string;
  orgaoJulgador?: string;
  dataAjuizamento?: string;
  grau?: string;
  nivelSigilo?: number;
  assuntos: string[];
  movimentos: MovimentoDataJud[];
  dadosCompletos?: Record<string, unknown>;
}

export interface ConsultarDataJudParams {
  numero_processo: string;
  tribunal?: string;
}

export const datajudService = {
  async consultarProcesso(params: ConsultarDataJudParams): Promise<DataJudProcessoResponse> {
    const response = await api.post<DataJudProcessoResponse>('/datajud/consultar', params);
    return response.data;
  },

  async consultarPorNumero(numeroProcesso: string): Promise<DataJudProcessoResponse> {
    const limpo = numeroProcesso.replace(/\D/g, '');
    const response = await api.get<DataJudProcessoResponse>(`/datajud/${limpo}`);
    return response.data;
  },
};

export default datajudService;
