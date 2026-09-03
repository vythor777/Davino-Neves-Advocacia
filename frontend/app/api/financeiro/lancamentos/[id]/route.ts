// frontend/app/api/financeiro/lancamentos/[id]/route.ts
import { NextResponse } from 'next/server';
import {
  getLancamentosStore,
  setLancamentosStore,
  getClientesStore,
  TipoLancamento,
  CategoriaLancamento,
  StatusLancamento,
} from '@/lib/serverStore';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const lancamentos = getLancamentosStore();
    const item = lancamentos.find((l) => l.id === id);

    if (!item) {
      return NextResponse.json({ message: 'Lançamento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ message: 'Erro ao buscar lançamento.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const lancamentos = getLancamentosStore();
    const index = lancamentos.findIndex((l) => l.id === id);

    if (index === -1) {
      return NextResponse.json({ message: 'Lançamento não encontrado.' }, { status: 404 });
    }

    const current = lancamentos[index];
    const clientes = getClientesStore();

    let clienteObj = current.cliente;
    if (body.clienteId !== undefined) {
      if (body.clienteId) {
        const cli = clientes.find((c) => c.id_cliente === Number(body.clienteId));
        if (cli) {
          clienteObj = {
            id_cliente: cli.id_cliente,
            nome: cli.nome,
            cpf_cnpj: cli.cpf_cnpj,
            email: cli.email,
          };
        }
      } else {
        clienteObj = null;
      }
    }

    let status = body.status !== undefined ? (body.status as StatusLancamento) : current.status;
    let dataPagamento = body.dataPagamento !== undefined ? body.dataPagamento : current.dataPagamento;

    // Se marcar como pago sem data, preencher hoje
    if (status === 'PAGO' && !dataPagamento) {
      dataPagamento = new Date().toISOString().split('T')[0];
    } else if (status === 'PENDENTE') {
      dataPagamento = null;
    }

    const updatedItem = {
      ...current,
      descricao: body.descricao !== undefined ? String(body.descricao).trim() : current.descricao,
      tipo: body.tipo !== undefined ? (body.tipo as TipoLancamento) : current.tipo,
      categoria: body.categoria !== undefined ? (body.categoria as CategoriaLancamento) : current.categoria,
      valor: body.valor !== undefined ? Math.abs(Number(body.valor)) : current.valor,
      dataVencimento: body.dataVencimento !== undefined ? String(body.dataVencimento).split('T')[0] : current.dataVencimento,
      dataPagamento: dataPagamento ? String(dataPagamento).split('T')[0] : null,
      status,
      formaPagamento: body.formaPagamento !== undefined ? (body.formaPagamento ? String(body.formaPagamento).trim() : null) : current.formaPagamento,
      observacoes: body.observacoes !== undefined ? (body.observacoes ? String(body.observacoes).trim() : null) : current.observacoes,
      clienteId: body.clienteId !== undefined ? (body.clienteId ? Number(body.clienteId) : null) : current.clienteId,
      processoId: body.processoId !== undefined ? (body.processoId ? Number(body.processoId) : null) : current.processoId,
      cliente: clienteObj,
      dataAtualizacao: new Date().toISOString(),
    };

    const newList = [...lancamentos];
    newList[index] = updatedItem;
    setLancamentosStore(newList);

    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error('Erro ao atualizar lançamento:', err);
    return NextResponse.json({ message: 'Erro ao atualizar lançamento.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const lancamentos = getLancamentosStore();
    const exists = lancamentos.some((l) => l.id === id);

    if (!exists) {
      return NextResponse.json({ message: 'Lançamento não encontrado.' }, { status: 404 });
    }

    const filtered = lancamentos.filter((l) => l.id !== id);
    setLancamentosStore(filtered);

    return NextResponse.json({ message: 'Lançamento excluído com sucesso.' });
  } catch {
    return NextResponse.json({ message: 'Erro ao excluir lançamento.' }, { status: 500 });
  }
}
