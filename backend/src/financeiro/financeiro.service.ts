import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateLancamentoDto,
  TipoLancamentoDto,
  StatusLancamentoDto,
} from './dto/create-lancamento.dto.js';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto.js';
import { FilterLancamentoDto } from './dto/filter-lancamento.dto.js';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLancamentoDto: CreateLancamentoDto) {
    try {
      const dataVencimento = new Date(createLancamentoDto.dataVencimento);
      const dataPagamento = createLancamentoDto.dataPagamento
        ? new Date(createLancamentoDto.dataPagamento)
        : null;

      // Se não informado status, determinar se é PENDENTE ou PAGO (se tiver dataPagamento) ou ATRASADO se vencido
      let status = createLancamentoDto.status || StatusLancamentoDto.PENDENTE;
      if (dataPagamento && status === StatusLancamentoDto.PENDENTE) {
        status = StatusLancamentoDto.PAGO;
      }

      return await this.prisma.lancamentoFinanceiro.create({
        data: {
          descricao: createLancamentoDto.descricao,
          tipo: createLancamentoDto.tipo as any,
          categoria: createLancamentoDto.categoria as any,
          valor: createLancamentoDto.valor,
          dataVencimento,
          dataPagamento,
          status: status as any,
          formaPagamento: createLancamentoDto.formaPagamento || null,
          observacoes: createLancamentoDto.observacoes || null,
          processoId: createLancamentoDto.processoId || null,
          clienteId: createLancamentoDto.clienteId || null,
        },
        include: {
          cliente: {
            select: {
              id_cliente: true,
              nome: true,
              cpf_cnpj: true,
              email: true,
            },
          },
          processo: {
            select: {
              id_processo: true,
              numero_processo: true,
              titulo: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao criar lançamento financeiro:', error);
      throw new InternalServerErrorException('Erro ao cadastrar lançamento financeiro.');
    }
  }

  async findAll(filter: FilterLancamentoDto = {}) {
    const where: any = {};

    if (filter.tipo) {
      where.tipo = filter.tipo;
    }

    if (filter.categoria) {
      where.categoria = filter.categoria;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.mes || filter.ano) {
      const now = new Date();
      const targetYear = filter.ano ? parseInt(filter.ano, 10) : now.getFullYear();
      let targetMonth: number | null = null;

      if (filter.mes) {
        if (filter.mes.includes('-')) {
          const parts = filter.mes.split('-');
          targetMonth = parseInt(parts[1], 10) - 1;
        } else {
          targetMonth = parseInt(filter.mes, 10) - 1;
        }
      }

      if (targetMonth !== null) {
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        where.dataVencimento = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      } else {
        const startOfYear = new Date(targetYear, 0, 1);
        const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        where.dataVencimento = {
          gte: startOfYear,
          lte: endOfYear,
        };
      }
    }

    if (filter.q) {
      const query = filter.q.trim();
      where.OR = [
        { descricao: { contains: query, mode: 'insensitive' } },
        { observacoes: { contains: query, mode: 'insensitive' } },
        { cliente: { nome: { contains: query, mode: 'insensitive' } } },
        { processo: { numero_processo: { contains: query, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.lancamentoFinanceiro.findMany({
      where,
      orderBy: {
        dataVencimento: 'desc',
      },
      include: {
        cliente: {
          select: {
            id_cliente: true,
            nome: true,
            cpf_cnpj: true,
            email: true,
          },
        },
        processo: {
          select: {
            id_processo: true,
            numero_processo: true,
            titulo: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const lancamento = await this.prisma.lancamentoFinanceiro.findUnique({
      where: { id },
      include: {
        cliente: true,
        processo: true,
      },
    });

    if (!lancamento) {
      throw new NotFoundException(`Lançamento com ID ${id} não encontrado.`);
    }

    return lancamento;
  }

  async update(id: string, updateLancamentoDto: UpdateLancamentoDto) {
    await this.findOne(id);

    try {
      const dataToUpdate: any = {};

      if (updateLancamentoDto.descricao !== undefined) {
        dataToUpdate.descricao = updateLancamentoDto.descricao;
      }
      if (updateLancamentoDto.tipo !== undefined) {
        dataToUpdate.tipo = updateLancamentoDto.tipo;
      }
      if (updateLancamentoDto.categoria !== undefined) {
        dataToUpdate.categoria = updateLancamentoDto.categoria;
      }
      if (updateLancamentoDto.valor !== undefined) {
        dataToUpdate.valor = updateLancamentoDto.valor;
      }
      if (updateLancamentoDto.dataVencimento !== undefined) {
        dataToUpdate.dataVencimento = new Date(updateLancamentoDto.dataVencimento);
      }
      if (updateLancamentoDto.dataPagamento !== undefined) {
        dataToUpdate.dataPagamento = updateLancamentoDto.dataPagamento
          ? new Date(updateLancamentoDto.dataPagamento)
          : null;
      }
      if (updateLancamentoDto.status !== undefined) {
        dataToUpdate.status = updateLancamentoDto.status;
      }
      if (updateLancamentoDto.formaPagamento !== undefined) {
        dataToUpdate.formaPagamento = updateLancamentoDto.formaPagamento;
      }
      if (updateLancamentoDto.observacoes !== undefined) {
        dataToUpdate.observacoes = updateLancamentoDto.observacoes;
      }
      if (updateLancamentoDto.processoId !== undefined) {
        dataToUpdate.processoId = updateLancamentoDto.processoId;
      }
      if (updateLancamentoDto.clienteId !== undefined) {
        dataToUpdate.clienteId = updateLancamentoDto.clienteId;
      }

      return await this.prisma.lancamentoFinanceiro.update({
        where: { id },
        data: dataToUpdate,
        include: {
          cliente: true,
          processo: true,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar lançamento financeiro:', error);
      throw new InternalServerErrorException('Erro ao atualizar lançamento financeiro.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lancamentoFinanceiro.delete({
      where: { id },
    });
  }

  async getResumo(mes?: string, ano?: string) {
    const lancamentos = await this.findAll({ mes, ano });

    let entradasRealizadas = 0;
    let entradasPrevistas = 0;
    let honorariosAReceber = 0;
    let despesasPagas = 0;
    let contasAPagarPendentes = 0;
    let pendenciasAtrasadas = 0;
    let qtdAtrasadas = 0;
    let qtdReceitas = 0;
    let qtdDespesas = 0;

    const categoriasReceita: Record<string, number> = {
      HONORARIO_CONTRATUAL: 0,
      HONORARIO_EXITO: 0,
      CONSULTIVO: 0,
      OUTROS: 0,
    };

    const categoriasDespesa: Record<string, number> = {
      CUSTAS_PROCESSUAIS: 0,
      OPERACIONAL: 0,
      IMPOSTOS: 0,
      OUTROS: 0,
    };

    for (const item of lancamentos) {
      const valorNum = Number(item.valor);

      if (item.tipo === TipoLancamentoDto.RECEITA) {
        qtdReceitas++;
        entradasPrevistas += valorNum;
        if (item.status === StatusLancamentoDto.PAGO) {
          entradasRealizadas += valorNum;
        } else if (item.status === StatusLancamentoDto.PENDENTE) {
          honorariosAReceber += valorNum;
        } else if (item.status === StatusLancamentoDto.ATRASADO) {
          honorariosAReceber += valorNum;
          pendenciasAtrasadas += valorNum;
          qtdAtrasadas++;
        }

        const catKey = item.categoria in categoriasReceita ? item.categoria : 'OUTROS';
        categoriasReceita[catKey] = (categoriasReceita[catKey] || 0) + valorNum;
      } else {
        qtdDespesas++;
        if (item.status === StatusLancamentoDto.PAGO) {
          despesasPagas += valorNum;
        } else if (item.status === StatusLancamentoDto.PENDENTE || item.status === StatusLancamentoDto.ATRASADO) {
          contasAPagarPendentes += valorNum;
          if (item.status === StatusLancamentoDto.ATRASADO) {
            pendenciasAtrasadas += valorNum;
            qtdAtrasadas++;
          }
        }

        const catKey = item.categoria in categoriasDespesa ? item.categoria : 'OUTROS';
        categoriasDespesa[catKey] = (categoriasDespesa[catKey] || 0) + valorNum;
      }
    }

    const saldoLiquido = entradasRealizadas - despesasPagas;
    const saldoPrevisto = (entradasRealizadas + honorariosAReceber) - (despesasPagas + contasAPagarPendentes);
    const taxaRecebimento = entradasPrevistas > 0 ? Math.round((entradasRealizadas / entradasPrevistas) * 100) : 100;

    return {
      periodo: {
        mes: mes || 'Mês Atual',
        ano: ano || new Date().getFullYear().toString(),
      },
      metricas: {
        entradasRealizadas,
        entradasPrevistas,
        honorariosAReceber,
        despesasPagas,
        contasAPagarPendentes,
        saldoLiquido,
        saldoPrevisto,
        pendenciasAtrasadas,
        qtdAtrasadas,
        taxaRecebimento,
        totalLancamentos: lancamentos.length,
        qtdReceitas,
        qtdDespesas,
      },
      categorias: {
        receitas: categoriasReceita,
        despesas: categoriasDespesa,
      },
    };
  }
}
