import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token de autenticação não informado.' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token.startsWith('jwt_session_')) {
      const base64Data = token.replace('jwt_session_', '');
      const user = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));
      return NextResponse.json(user);
    }

    // Default admin fallback if token exists
    return NextResponse.json({
      id: 1,
      id_usuario: 1,
      nome: 'Administrador Davino & Neves',
      email: 'admin@davinoneves.com.br',
      role: 'ADMINISTRADOR',
      ativo: true,
    });
  } catch {
    return NextResponse.json(
      { message: 'Token inválido ou expirado.' },
      { status: 401 }
    );
  }
}
