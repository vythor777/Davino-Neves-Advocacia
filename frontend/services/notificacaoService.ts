import api from './api';

export interface ItemNotificacao {
  id: string;
  tipo: 'prazo' | 'financeiro' | 'agenda' | 'aniversario' | 'processo' | 'sistema';
  titulo: string;
  descricao: string;
  dataRef: string;
  urgencia: 'alta' | 'media' | 'baixa';
  link: string;
  lida?: boolean;
}

export interface ResumoNotificacoes {
  totalNaoLidas: number;
  total: number;
  notificacoes: ItemNotificacao[];
}

const STORAGE_KEY = 'davino_notificacoes_lidas_v1';

function getLidasSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function salvarLidasSet(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignorar erros de quota
  }
}

export const notificacaoService = {
  async getNotificacoes(): Promise<ResumoNotificacoes> {
    try {
      const res = await api.get<ResumoNotificacoes>('/notificacoes');
      const lidas = getLidasSet();

      const notificacoesComStatus = res.data.notificacoes.map((item) => ({
        ...item,
        lida: lidas.has(item.id),
      }));

      const naoLidas = notificacoesComStatus.filter((n) => !n.lida);

      return {
        totalNaoLidas: naoLidas.length,
        total: notificacoesComStatus.length,
        notificacoes: notificacoesComStatus,
      };
    } catch (err) {
      console.warn('[notificacaoService] Erro ao buscar notificações reais:', err);
      return {
        totalNaoLidas: 0,
        total: 0,
        notificacoes: [],
      };
    }
  },

  marcarComoLida(id: string): void {
    const lidas = getLidasSet();
    lidas.add(id);
    salvarLidasSet(lidas);
  },

  marcarTodasComoLidas(ids: string[]): void {
    const lidas = getLidasSet();
    ids.forEach((id) => lidas.add(id));
    salvarLidasSet(lidas);
  },

  limparHistoricoLidas(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default notificacaoService;
