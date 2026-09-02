// frontend/app/api/usuarios/route.ts
import { NextResponse } from 'next/server';
import { getUsuariosStore, setUsuariosStore, UsuarioStoreItem } from '@/lib/serverStore';

export async function GET() {
  try {
    const usuarios = getUsuariosStore();
    return NextResponse.json(usuarios);
  } catch {
    return NextResponse.json({ message: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, senha, role, ativo, data_nascimento } = body || {};

    if (!nome || !email) {
      return NextResponse.json(
        { message: 'Nome e e-mail são obrigatórios.' },
        { status: 400 }
      );
    }

    const usuarios = getUsuariosStore();
    const emailNormalizado = String(email).trim().toLowerCase();

    if (usuarios.some((u) => u.email.toLowerCase() === emailNormalizado)) {
      return NextResponse.json(
        { message: 'Já existe um usuário com este e-mail.' },
        { status: 409 }
      );
    }

    const nextId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id_usuario)) + 1 : 1;

    const novoUsuario: UsuarioStoreItem = {
      id_usuario: nextId,
      id: nextId,
      nome: String(nome).trim(),
      email: emailNormalizado,
      role: role || 'ADVOGADO',
      ativo: ativo !== undefined ? Boolean(ativo) : true,
      data_nascimento: data_nascimento ? String(data_nascimento).split('T')[0] : null,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
    };

    const updatedList = [novoUsuario, ...usuarios];
    setUsuariosStore(updatedList);

    return NextResponse.json(novoUsuario, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao criar usuário' },
      { status: 500 }
    );
  }
}
