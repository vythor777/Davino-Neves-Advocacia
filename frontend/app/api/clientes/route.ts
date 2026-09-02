// frontend/app/api/clientes/route.ts
import { NextResponse } from 'next/server';
import { getClientesStore, setClientesStore, ClienteStoreItem } from '@/lib/serverStore';

export async function GET() {
  try {
    const clientes = getClientesStore();
    return NextResponse.json(clientes);
  } catch {
    return NextResponse.json({ message: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, cpf_cnpj, email, telefone, endereco, data_nascimento } = body || {};

    if (!nome || !cpf_cnpj) {
      return NextResponse.json(
        { message: 'Nome e CPF/CNPJ são obrigatórios.' },
        { status: 400 }
      );
    }

    const clientes = getClientesStore();
    const cpfLimpo = String(cpf_cnpj).replace(/\D/g, '');

    if (clientes.some((c) => c.cpf_cnpj.replace(/\D/g, '') === cpfLimpo)) {
      return NextResponse.json(
        { message: 'Já existe um cliente cadastrado com este CPF/CNPJ.' },
        { status: 409 }
      );
    }

    const nextId = clientes.length > 0 ? Math.max(...clientes.map((c) => c.id_cliente)) + 1 : 1;

    const novoCliente: ClienteStoreItem = {
      id_cliente: nextId,
      nome: String(nome).trim(),
      cpf_cnpj: String(cpf_cnpj).trim(),
      email: String(email || '').trim(),
      telefone: String(telefone || '').trim(),
      endereco: String(endereco || '').trim(),
      data_nascimento: data_nascimento ? String(data_nascimento).split('T')[0] : null,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
      _count: { processos: 0 },
    };

    const updatedList = [novoCliente, ...clientes];
    setClientesStore(updatedList);

    return NextResponse.json(novoCliente, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao cadastrar cliente' },
      { status: 500 }
    );
  }
}
