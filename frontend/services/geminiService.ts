import api from './api';

export interface AnalisarDocumentoParams {
  texto: string;
  tipo_documento?: string;
  instrucoes?: string;
}

export interface AnaliseDocumentoResponse {
  sucesso: boolean;
  tipo_documento: string;
  analise: string;
}

export interface MovimentoProcessoInput {
  dataHora?: string;
  nome?: string;
  descricao?: string;
  complemento?: string;
  [key: string]: unknown;
}

export interface ResumirProcessoParams {
  titulo?: string;
  numero_processo?: string;
  movimentacoes: Array<string | MovimentoProcessoInput>;
  publico_alvo?: 'advogado' | 'cliente';
}

export interface ResumoProcessoResponse {
  sucesso: boolean;
  publico_alvo: 'advogado' | 'cliente';
  resumo: string;
}

export interface ExtrairPrazosParams {
  texto_publicacao: string;
  data_publicacao?: string;
}

export interface DadosPrazoExtraido {
  tem_prazo: boolean;
  descricao_providencia: string;
  quantidade_dias?: number;
  tipo_contagem?: string;
  data_limite_estimada?: string;
  urgencia: 'Baixa' | 'Média' | 'Alta' | 'Fatal' | string;
  observacoes?: string;
}

export interface ExtrairPrazosResponse {
  sucesso: boolean;
  dados_prazo: DadosPrazoExtraido;
}

export const geminiService = {
  async analisarDocumento(params: AnalisarDocumentoParams): Promise<AnaliseDocumentoResponse> {
    const response = await api.post<AnaliseDocumentoResponse>('/gemini/analisar-documento', params);
    return response.data;
  },

  async resumirProcesso(params: ResumirProcessoParams): Promise<ResumoProcessoResponse> {
    const response = await api.post<ResumoProcessoResponse>('/gemini/resumir-processo', params);
    return response.data;
  },

  async extrairPrazos(params: ExtrairPrazosParams): Promise<ExtrairPrazosResponse> {
    const response = await api.post<ExtrairPrazosResponse>('/gemini/extrair-prazos', params);
    return response.data;
  },
};

export default geminiService;
