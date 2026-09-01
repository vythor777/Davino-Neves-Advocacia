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

/**
 * Remove qualquer caractere não numérico (pontos, traços, barras, espaços),
 * garantindo estritamente os 20 dígitos numéricos limpos para a API do CNJ.
 */
export function limparNumeroProcesso(numero: string): string {
  if (!numero) return '';
  return numero.replace(/\D/g, '').trim();
}

export interface ConsultarDataJudParams {
  numero_processo: string;
  tribunal?: string;
}

export const datajudService = {
  async consultarProcesso(params: ConsultarDataJudParams): Promise<DataJudProcessoResponse> {
    const payload = {
      ...params,
      numero_processo: limparNumeroProcesso(params.numero_processo),
    };
    const response = await api.post<DataJudProcessoResponse>('/datajud/consultar', payload);
    return response.data;
  },

  async consultarPorNumero(numeroProcesso: string): Promise<DataJudProcessoResponse> {
    const limpo = limparNumeroProcesso(numeroProcesso);
    const response = await api.get<DataJudProcessoResponse>(`/datajud/${limpo}`);
    return response.data;
  },
};

export default datajudService;
