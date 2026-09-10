import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificacoes(): Promise<ResumoNotificacoes> {
    const agora = new Date();
    const notificacoes: ItemNotificacao[] = [];

    // Datas de referência para comparações
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);
    const emTresDias = new Date(agora.getTime() + 3 * 24 * 60 * 60 * 1000);

    try {
      // 1. Buscar Prazos Processuais Reais (pendentes, atrasados ou a vencer nos próximos dias)
      const prazos = await this.prisma.prazo.findMany({
        where: {
          status: {
            notIn: ['Concluído', 'Cumprido', 'Cancelado', 'Arquivado'],
          },
        },
        include: {
          processo: {
            select: {
              id_processo: true,
              numero_processo: true,
              titulo: true,
            },
          },
        },
        orderBy: {
          data_vencimento: 'asc',
        },
        take: 15,
      });

      for (const prazo of prazos) {
        const dataVenc = new Date(prazo.data_vencimento);
        const diffMs = dataVenc.getTime() - inicioHoje.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const dataFormatada = dataVenc.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const processoIdent = prazo.processo?.numero_processo || prazo.processo?.titulo || 'Processo vinculado';

        if (diffDias < 0) {
          // Prazo vencido / atrasado
          notificacoes.push({
            id: `prazo-${prazo.id_prazo}`,
            tipo: 'prazo',
            titulo: `Prazo Vencido (${prazo.tipoCompromisso || 'Prazo Fatal'})`,
            descricao: `${prazo.descricao} • ${processoIdent} (venceu em ${dataFormatada})`,
            dataRef: prazo.data_vencimento.toISOString(),
            urgencia: 'alta',
            link: '/prazos',
          });
        } else if (diffDias === 0) {
          // Prazo vence hoje
          notificacoes.push({
            id: `prazo-${prazo.id_prazo}`,
            tipo: 'prazo',
            titulo: `Prazo Fatal Hoje (${prazo.hora || '18:00'})`,
            descricao: `${prazo.descricao} • ${processoIdent} vence hoje`,
            dataRef: prazo.data_vencimento.toISOString(),
            urgencia: 'alta',
            link: '/prazos',
          });
        } else if (diffDias <= 3) {
          // Prazo nos próximos 3 dias
          notificacoes.push({
            id: `prazo-${prazo.id_prazo}`,
            tipo: 'prazo',
            titulo: `Prazo Próximo (${diffDias === 1 ? 'Amanhã' : `em ${diffDias} dias`})`,
            descricao: `${prazo.descricao} • ${processoIdent} (${dataFormatada})`,
            dataRef: prazo.data_vencimento.toISOString(),
            urgencia: 'media',
            link: '/prazos',
          });
        } else {
          // Prazo futuro em aberto
          notificacoes.push({
            id: `prazo-${prazo.id_prazo}`,
            tipo: 'prazo',
            titulo: `Prazo Processual: ${prazo.descricao}`,
            descricao: `${processoIdent} • Vencimento em ${dataFormatada}`,
            dataRef: prazo.data_vencimento.toISOString(),
            urgencia: 'baixa',
            link: '/prazos',
          });
        }
      }
    } catch (err) {
      console.warn('[NotificacoesService] Erro ao buscar prazos:', err);
    }

    try {
      // 2. Buscar Lançamentos Financeiros Reais (atrasados ou vencendo nos próximos dias)
      const lancamentos = await this.prisma.lancamentoFinanceiro.findMany({
        where: {
          status: {
            in: ['PENDENTE', 'ATRASADO'],
          },
        },
        include: {
          cliente: {
            select: { nome: true },
          },
          processo: {
            select: { numero_processo: true },
          },
        },
        orderBy: {
          dataVencimento: 'asc',
        },
        take: 10,
      });

      for (const lanc of lancamentos) {
        const dataVenc = new Date(lanc.dataVencimento);
        const diffMs = dataVenc.getTime() - inicioHoje.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const valorFormatado = Number(lanc.valor).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        const ehReceita = lanc.tipo === 'RECEITA';

        if (lanc.status === 'ATRASADO' || diffDias < 0) {
          notificacoes.push({
            id: `fin-${lanc.id}`,
            tipo: 'financeiro',
            titulo: ehReceita ? 'Honorário em Atraso' : 'Despesa em Atraso',
            descricao: `${lanc.descricao} • ${valorFormatado} (vencido)`,
            dataRef: lanc.dataVencimento.toISOString(),
            urgencia: 'alta',
            link: '/financeiro',
          });
        } else if (diffDias === 0) {
          notificacoes.push({
            id: `fin-${lanc.id}`,
            tipo: 'financeiro',
            titulo: ehReceita ? 'Recebimento Previsto para Hoje' : 'Despesa Vencendo Hoje',
            descricao: `${lanc.descricao} • ${valorFormatado}`,
            dataRef: lanc.dataVencimento.toISOString(),
            urgencia: 'media',
            link: '/financeiro',
          });
        } else if (diffDias <= 2) {
          notificacoes.push({
            id: `fin-${lanc.id}`,
            tipo: 'financeiro',
            titulo: `Vencimento Financeiro (${diffDias === 1 ? 'Amanhã' : `em ${diffDias} dias`})`,
            descricao: `${lanc.descricao} • ${valorFormatado}`,
            dataRef: lanc.dataVencimento.toISOString(),
            urgencia: 'baixa',
            link: '/financeiro',
          });
        }
      }
    } catch (err) {
      console.warn('[NotificacoesService] Erro ao buscar lançamentos financeiros:', err);
    }

    try {
      // 3. Buscar Compromissos de Agenda (hoje ou amanhã)
      const compromissos = await this.prisma.agenda.findMany({
        where: {
          data_evento: {
            gte: inicioHoje,
            lte: new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          data_evento: 'asc',
        },
        take: 5,
      });

      for (const comp of compromissos) {
        const horaStr = new Date(comp.data_evento).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        notificacoes.push({
          id: `agenda-${comp.id_agenda}`,
          tipo: 'agenda',
          titulo: `Audiência / Compromisso: ${comp.titulo}`,
          descricao: `${comp.descricao ? `${comp.descricao} • ` : ''}Horário: ${horaStr}`,
          dataRef: comp.data_evento.toISOString(),
          urgencia: 'media',
          link: '/prazos',
        });
      }
    } catch (err) {
      console.warn('[NotificacoesService] Erro ao buscar agenda:', err);
    }

    try {
      // 4. Buscar Aniversariantes de Hoje
      const diaHoje = agora.getDate();
      const mesHoje = agora.getMonth() + 1;

      const [clientesNiver, usuariosNiver] = await Promise.all([
        this.prisma.cliente.findMany({
          where: { data_nascimento: { not: null } },
          select: { id_cliente: true, nome: true, data_nascimento: true },
        }),
        this.prisma.usuario.findMany({
          where: { ativo: true, data_nascimento: { not: null } },
          select: { id_usuario: true, nome: true, data_nascimento: true },
        }),
      ]);

      for (const c of clientesNiver) {
        if (c.data_nascimento) {
          const d = new Date(c.data_nascimento);
          if (d.getUTCDate() === diaHoje && d.getUTCMonth() + 1 === mesHoje) {
            notificacoes.push({
              id: `aniv-c-${c.id_cliente}`,
              tipo: 'aniversario',
              titulo: `Aniversário de Cliente: ${c.nome} 🎂`,
              descricao: 'Envie felicitações em nome do escritório hoje.',
              dataRef: agora.toISOString(),
              urgencia: 'baixa',
              link: '/clientes',
            });
          }
        }
      }

      for (const u of usuariosNiver) {
        if (u.data_nascimento) {
          const d = new Date(u.data_nascimento);
          if (d.getUTCDate() === diaHoje && d.getUTCMonth() + 1 === mesHoje) {
            notificacoes.push({
              id: `aniv-u-${u.id_usuario}`,
              tipo: 'aniversario',
              titulo: `Aniversário na Equipe: ${u.nome} 🎉`,
              descricao: 'Parabenize o colega de equipe pelo dia de hoje.',
              dataRef: agora.toISOString(),
              urgencia: 'baixa',
              link: '/usuarios',
            });
          }
        }
      }
    } catch (err) {
      console.warn('[NotificacoesService] Erro ao buscar aniversariantes:', err);
    }

    // 5. Se não houver nenhuma notificação de urgência, adicionar confirmação de sincronização DataJud
    try {
      const totalProcessos = await this.prisma.processo.count();
      if (totalProcessos > 0) {
        notificacoes.push({
          id: 'datajud-sync-status',
          tipo: 'sistema',
          titulo: 'DataJud CNJ Monitorado',
          descricao: `${totalProcessos} processo${totalProcessos > 1 ? 's' : ''} ativos sob monitoramento judicial contínuo.`,
          dataRef: agora.toISOString(),
          urgencia: 'baixa',
          link: '/datajud',
        });
      }
    } catch (err) {
      console.warn('[NotificacoesService] Erro ao contar processos:', err);
    }

    // Ordenar por urgência: alta primeiro, depois media, depois baixa
    const ordemUrgencia: Record<string, number> = {
      alta: 1,
      media: 2,
      baixa: 3,
    };

    notificacoes.sort((a, b) => (ordemUrgencia[a.urgencia] || 4) - (ordemUrgencia[b.urgencia] || 4));

    // O total de não lidas / ativas com prioridade
    const totalNaoLidas = notificacoes.filter((n) => n.urgencia === 'alta' || n.urgencia === 'media').length;

    return {
      totalNaoLidas: Math.max(totalNaoLidas, notificacoes.length > 0 ? 1 : 0),
      total: notificacoes.length,
      notificacoes,
    };
  }
}
