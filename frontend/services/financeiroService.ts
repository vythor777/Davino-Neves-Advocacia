import api from './api';

export type TipoLancamento = 'RECEITA' | 'DESPESA';
export type CategoriaLancamento =
  | 'HONORARIO_CONTRATUAL'
  | 'HONORARIO_EXITO'
  | 'CONSULTIVO'
  | 'CUSTAS_PROCESSUAIS'
  | 'OPERACIONAL'
  | 'IMPOSTOS'
  | 'OUTROS';
export type StatusLancamento = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';

export interface LancamentoFinanceiro {
  id: string;
  descricao: string;
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  valor: number;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento?: string | null;
  status: StatusLancamento;
  formaPagamento?: string | null;
  observacoes?: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  processoId?: number | null;
  clienteId?: number | null;
  cliente?: {
    id_cliente: number;
    nome: string;
    cpf_cnpj: string;
    email?: string;
  } | null;
  processo?: {
    id_processo: number;
    numero_processo: string;
    titulo: string;
  } | null;
}

export interface CreateLancamentoInput {
  descricao: string;
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string | null;
  status?: StatusLancamento;
  formaPagamento?: string;
  observacoes?: string;
  clienteId?: number | null;
  processoId?: number | null;
  processoNumero?: string;
}

export type UpdateLancamentoInput = Partial<CreateLancamentoInput>;

export interface FilterLancamentoParams {
  tipo?: TipoLancamento;
  categoria?: CategoriaLancamento;
  status?: StatusLancamento;
  mes?: string;
  ano?: string;
  q?: string;
}

export interface ResumoFinanceiroResponse {
  periodo: {
    mes: string;
    ano: string;
  };
  metricas: {
    entradasRealizadas: number;
    entradasPrevistas: number;
    honorariosAReceber: number;
    despesasPagas: number;
    contasAPagarPendentes: number;
    saldoLiquido: number;
    saldoPrevisto: number;
    pendenciasAtrasadas: number;
    qtdAtrasadas: number;
    taxaRecebimento: number;
    totalLancamentos: number;
    qtdReceitas: number;
    qtdDespesas: number;
  };
  categorias: {
    receitas: Record<string, number>;
    despesas: Record<string, number>;
  };
  historicoMensal?: Array<{
    mesChave: string;
    rotulo: string;
    receitas: number;
    despesas: number;
  }>;
}

export const CATEGORIAS_LABELS: Record<CategoriaLancamento, { label: string; tipo: TipoLancamento; badgeClass: string }> = {
  HONORARIO_CONTRATUAL: {
    label: 'Honorário Contratual',
    tipo: 'RECEITA',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/60',
  },
  HONORARIO_EXITO: {
    label: 'Honorário de Êxito',
    tipo: 'RECEITA',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
  },
  CONSULTIVO: {
    label: 'Consultivo & Pareceres',
    tipo: 'RECEITA',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60',
  },
  CUSTAS_PROCESSUAIS: {
    label: 'Custas & Diligências',
    tipo: 'DESPESA',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60',
  },
  OPERACIONAL: {
    label: 'Operacional & Software',
    tipo: 'DESPESA',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  IMPOSTOS: {
    label: 'Impostos & Tributos',
    tipo: 'DESPESA',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/60',
  },
  OUTROS: {
    label: 'Outros Lançamentos',
    tipo: 'RECEITA',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
};

export const financeiroService = {
  async getAll(params?: FilterLancamentoParams): Promise<LancamentoFinanceiro[]> {
    const response = await api.get<LancamentoFinanceiro[]>('/financeiro/lancamentos', {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<LancamentoFinanceiro> {
    const response = await api.get<LancamentoFinanceiro>(`/financeiro/lancamentos/${id}`);
    return response.data;
  },

  async getResumo(mes?: string, ano?: string): Promise<ResumoFinanceiroResponse> {
    const response = await api.get<ResumoFinanceiroResponse>('/financeiro/resumo', {
      params: { mes, ano },
    });
    return response.data;
  },

  async create(data: CreateLancamentoInput): Promise<LancamentoFinanceiro> {
    const response = await api.post<LancamentoFinanceiro>('/financeiro/lancamentos', data);
    return response.data;
  },

  async update(id: string, data: UpdateLancamentoInput): Promise<LancamentoFinanceiro> {
    const response = await api.patch<LancamentoFinanceiro>(`/financeiro/lancamentos/${id}`, data);
    return response.data;
  },

  async marcarComoPago(id: string, dataPagamento?: string): Promise<LancamentoFinanceiro> {
    const response = await api.patch<LancamentoFinanceiro>(`/financeiro/lancamentos/${id}`, {
      status: 'PAGO',
      dataPagamento: dataPagamento || new Date().toISOString().split('T')[0],
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/financeiro/lancamentos/${id}`);
  },
};

export default financeiroService;
