// frontend/app/api/financeiro/lancamentos/route.ts
import { NextResponse } from 'next/server';
import {
  getLancamentosStore,
  setLancamentosStore,
  LancamentoStoreItem,
  TipoLancamento,
  CategoriaLancamento,
  StatusLancamento,
  getClientesStore,
} from '@/lib/serverStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') as TipoLancamento | null;
    const categoria = searchParams.get('categoria') as CategoriaLancamento | null;
    const status = searchParams.get('status') as StatusLancamento | null;
    const mes = searchParams.get('mes'); // YYYY-MM ou '2026-09'
    const ano = searchParams.get('ano');
    const q = searchParams.get('q')?.toLowerCase().trim();

    let lancamentos = getLancamentosStore();

    if (tipo) {
      lancamentos = lancamentos.filter((l) => l.tipo === tipo);
    }

    if (categoria) {
      lancamentos = lancamentos.filter((l) => l.categoria === categoria);
    }

    if (status) {
      lancamentos = lancamentos.filter((l) => l.status === status);
    }

    if (mes) {
      lancamentos = lancamentos.filter((l) => l.dataVencimento.startsWith(mes));
    } else if (ano) {
      lancamentos = lancamentos.filter((l) => l.dataVencimento.startsWith(ano));
    }

    if (q) {
      lancamentos = lancamentos.filter(
        (l) =>
          l.descricao.toLowerCase().includes(q) ||
          (l.observacoes && l.observacoes.toLowerCase().includes(q)) ||
          (l.cliente && l.cliente.nome.toLowerCase().includes(q)) ||
          (l.processo && l.processo.numero_processo.toLowerCase().includes(q)),
      );
    }

    // Ordenar decrescente por data de vencimento
    const sorted = [...lancamentos].sort(
      (a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime(),
    );

    return NextResponse.json(sorted);
  } catch (err) {
    console.error('Erro na rota GET /api/financeiro/lancamentos:', err);
    return NextResponse.json({ message: 'Erro ao buscar lançamentos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      descricao,
      tipo,
      categoria,
      valor,
      dataVencimento,
      dataPagamento,
      status,
      formaPagamento,
      observacoes,
      clienteId,
      processoId,
      processoNumero,
    } = body || {};

    if (!descricao || !tipo || !categoria || valor === undefined || !dataVencimento) {
      return NextResponse.json(
        { message: 'Descrição, tipo, categoria, valor e data de vencimento são obrigatórios.' },
        { status: 400 },
      );
    }

    const lancamentos = getLancamentosStore();
    const clientes = getClientesStore();

    let clienteObj = null;
    if (clienteId) {
      const cli = clientes.find((c) => c.id_cliente === Number(clienteId));
      if (cli) {
        clienteObj = {
          id_cliente: cli.id_cliente,
          nome: cli.nome,
          cpf_cnpj: cli.cpf_cnpj,
          email: cli.email,
        };
      }
    }

    let processoObj = null;
    if (processoId || processoNumero) {
      processoObj = {
        id_processo: processoId ? Number(processoId) : 1,
        numero_processo: processoNumero || '1004521-88.2024.8.26.0100',
        titulo: 'Ação Judicial Vinculada',
      };
    }

    const determinedStatus: StatusLancamento =
      status || (dataPagamento ? 'PAGO' : 'PENDENTE');

    const novoLancamento: LancamentoStoreItem = {
      id: `lanc-${Date.now()}`,
      descricao: String(descricao).trim(),
      tipo: tipo as TipoLancamento,
      categoria: categoria as CategoriaLancamento,
      valor: Math.abs(Number(valor)),
      dataVencimento: String(dataVencimento).split('T')[0],
      dataPagamento: dataPagamento ? String(dataPagamento).split('T')[0] : null,
      status: determinedStatus,
      formaPagamento: formaPagamento ? String(formaPagamento).trim() : null,
      observacoes: observacoes ? String(observacoes).trim() : null,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      clienteId: clienteId ? Number(clienteId) : null,
      processoId: processoId ? Number(processoId) : null,
      cliente: clienteObj,
      processo: processoObj,
    };

    const updatedList = [novoLancamento, ...lancamentos];
    setLancamentosStore(updatedList);

    return NextResponse.json(novoLancamento, { status: 201 });
  } catch (err) {
    console.error('Erro na rota POST /api/financeiro/lancamentos:', err);
    return NextResponse.json(
      { message: 'Erro interno ao cadastrar lançamento financeiro.' },
      { status: 500 },
    );
  }
}
