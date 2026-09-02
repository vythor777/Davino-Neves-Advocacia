// frontend/app/api/clientes/[id]/route.ts
import { NextResponse } from 'next/server';
import { getClientesStore, setClientesStore } from '@/lib/serverStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  const clientes = getClientesStore();
  const cliente = clientes.find((c) => c.id_cliente === numId);

  if (!cliente) {
    return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
  }

  return NextResponse.json(cliente);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const body = await request.json();
    const clientes = getClientesStore();
    const index = clientes.findIndex((c) => c.id_cliente === numId);

    if (index === -1) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    const { nome, cpf_cnpj, email, telefone, endereco, data_nascimento } = body || {};
    const existing = clientes[index];

    if (cpf_cnpj) {
      const cpfLimpo = String(cpf_cnpj).replace(/\D/g, '');
      if (
        clientes.some(
          (c) =>
            c.id_cliente !== numId &&
            c.cpf_cnpj.replace(/\D/g, '') === cpfLimpo
        )
      ) {
        return NextResponse.json(
          { message: 'Já existe outro cliente cadastrado com este CPF/CNPJ.' },
          { status: 409 }
        );
      }
      existing.cpf_cnpj = String(cpf_cnpj).trim();
    }

    if (nome) existing.nome = String(nome).trim();
    if (email !== undefined) existing.email = String(email).trim();
    if (telefone !== undefined) existing.telefone = String(telefone).trim();
    if (endereco !== undefined) existing.endereco = String(endereco).trim();
    if (data_nascimento !== undefined) {
      existing.data_nascimento = data_nascimento
        ? String(data_nascimento).split('T')[0]
        : null;
    }
    existing.data_atualizacao = new Date().toISOString();

    clientes[index] = existing;
    setClientesStore(clientes);

    return NextResponse.json(existing);
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const clientes = getClientesStore();
    const filtered = clientes.filter((c) => c.id_cliente !== numId);

    if (filtered.length === clientes.length) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }

    setClientesStore(filtered);
    return NextResponse.json({ message: 'Cliente removido com sucesso' });
  } catch {
    return NextResponse.json({ message: 'Erro ao excluir cliente' }, { status: 500 });
  }
}
