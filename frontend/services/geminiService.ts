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

export interface AnalisarProcessoParams {
  numero_processo?: string;
  titulo?: string;
  conteudo_processual: string;
  polo_cliente?: 'Autor' | 'Réu' | 'Terceiro Interessado' | string;
  foco_estrategico?: string;
}

export interface AnaliseProcessoResponse {
  sucesso: boolean;
  numero_processo: string | null;
  analise: string;
}

export interface ResumirDocumentoParams {
  texto: string;
  tipo_documento?: string;
  formato_resumo?: 'executivo' | 'cliente_simples' | 'topicos_estrategicos' | string;
}

export interface ResumoDocumentoResponse {
  sucesso: boolean;
  tipo_documento: string;
  formato_resumo: string;
  resumo: string;
}

export interface EncontrarJurisprudenciaParams {
  tema: string;
  ramo_direito?: string;
  tribunal_alvo?: string;
  tese_pretendida?: string;
}

export interface JurisprudenciaResponse {
  sucesso: boolean;
  tema: string;
  resultado: string;
}

export interface CriarPecaParams {
  tipo_peca: string;
  fatos_contexto: string;
  polos_partes?: string;
  pedidos_especificos?: string;
  jurisprudencia_referencia?: string;
  tribunal_foro?: string;
}

export interface CriarPecaResponse {
  sucesso: boolean;
  tipo_peca: string;
  minuta: string;
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
  // 1. Analisar Processo (Autos, riscos, probabilidade de êxito)
  async analisarProcesso(params: AnalisarProcessoParams): Promise<AnaliseProcessoResponse> {
    const response = await api.post<AnaliseProcessoResponse>('/gemini/analisar-processo', params, {
      timeout: 60000,
    });
    return response.data;
  },

  // 2. Resumir Documento (Síntese executiva ou para cliente)
  async resumirDocumento(params: ResumirDocumentoParams): Promise<ResumoDocumentoResponse> {
    const response = await api.post<ResumoDocumentoResponse>('/gemini/resumir-documento', params, {
      timeout: 60000,
    });
    return response.data;
  },

  // 3. Encontrar Jurisprudência (Teses, precedentes STJ/STF, súmulas)
  async encontrarJurisprudencia(params: EncontrarJurisprudenciaParams): Promise<JurisprudenciaResponse> {
    const response = await api.post<JurisprudenciaResponse>('/gemini/encontrar-jurisprudencia', params, {
      timeout: 60000,
    });
    return response.data;
  },

  // 4. Criar Peça (Minuta de petições, contestações e recursos)
  async criarPeca(params: CriarPecaParams): Promise<CriarPecaResponse> {
    const response = await api.post<CriarPecaResponse>('/gemini/criar-peca', params, {
      timeout: 60000,
    });
    return response.data;
  },

  // 5. Identificar Prazos (Extração de prazos de publicações e termos fatais)
  async identificarPrazos(params: ExtrairPrazosParams): Promise<ExtrairPrazosResponse> {
    const response = await api.post<ExtrairPrazosResponse>('/gemini/identificar-prazos', params, {
      timeout: 60000,
    });
    return response.data;
  },

  // Compatibilidade com código existente
  async analisarDocumento(params: AnalisarDocumentoParams): Promise<AnaliseDocumentoResponse> {
    const response = await api.post<AnaliseDocumentoResponse>('/gemini/analisar-documento', params, {
      timeout: 60000,
    });
    return response.data;
  },

  async resumirProcesso(params: ResumirProcessoParams): Promise<ResumoProcessoResponse> {
    const response = await api.post<ResumoProcessoResponse>('/gemini/resumir-processo', params, {
      timeout: 60000,
    });
    return response.data;
  },

  async extrairPrazos(params: ExtrairPrazosParams): Promise<ExtrairPrazosResponse> {
    const response = await api.post<ExtrairPrazosResponse>('/gemini/extrair-prazos', params, {
      timeout: 60000,
    });
    return response.data;
  },
};

export default geminiService;
