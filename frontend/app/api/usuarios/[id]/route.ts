// frontend/app/api/usuarios/[id]/route.ts
import { NextResponse } from 'next/server';
import { getUsuariosStore, setUsuariosStore, UsuarioStoreItem } from '@/lib/serverStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  const usuarios = getUsuariosStore();
  const usuario = usuarios.find((u) => u.id_usuario === numId);

  if (!usuario) {
    return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
  }

  return NextResponse.json(usuario);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const body = await request.json();
    const usuarios = getUsuariosStore();
    const index = usuarios.findIndex((u) => u.id_usuario === numId);

    if (index === -1) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    const { nome, email, role, ativo, data_nascimento } = body || {};
    const existing = usuarios[index];

    if (email) {
      const emailNormalizado = String(email).trim().toLowerCase();
      if (
        usuarios.some(
          (u) => u.id_usuario !== numId && u.email.toLowerCase() === emailNormalizado
        )
      ) {
        return NextResponse.json(
          { message: 'Já existe outro usuário com este e-mail.' },
          { status: 409 }
        );
      }
      existing.email = emailNormalizado;
    }

    if (nome) existing.nome = String(nome).trim();
    if (role) existing.role = role;
    if (ativo !== undefined) existing.ativo = Boolean(ativo);
    if (data_nascimento !== undefined) {
      existing.data_nascimento = data_nascimento
        ? String(data_nascimento).split('T')[0]
        : null;
    }
    existing.data_atualizacao = new Date().toISOString();

    usuarios[index] = existing;
    setUsuariosStore(usuarios);

    return NextResponse.json(existing);
  } catch {
    return NextResponse.json({ message: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const usuarios = getUsuariosStore();
    const filtered = usuarios.filter((u) => u.id_usuario !== numId);

    if (filtered.length === usuarios.length) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    setUsuariosStore(filtered);
    return NextResponse.json({ message: 'Usuário removido com sucesso' });
  } catch {
    return NextResponse.json({ message: 'Erro ao excluir usuário' }, { status: 500 });
  }
}
