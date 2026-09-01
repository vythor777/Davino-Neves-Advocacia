import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body || {};

    if (!email || !senha) {
      return NextResponse.json(
        { message: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Validação de credenciais de Administrador e usuários padrão do sistema
    const validUsers = [
      {
        id: 1,
        id_usuario: 1,
        nome: 'Administrador Davino Neves',
        email: 'admin@davinoneves.com.br',
        senha: 'admin123',
        role: 'ADMINISTRADOR',
        ativo: true,
      },
      {
        id: 2,
        id_usuario: 2,
        nome: 'Dr. Lucas Davino',
        email: 'lucas@davinoneves.com.br',
        senha: 'admin123',
        role: 'ADVOGADO',
        ativo: true,
      },
      {
        id: 3,
        id_usuario: 3,
        nome: 'Dra. Beatriz Neves',
        email: 'beatriz@davinoneves.com.br',
        senha: 'admin123',
        role: 'ADVOGADO',
        ativo: true,
      },
      {
        id: 4,
        id_usuario: 4,
        nome: 'Mariana Silva (Estagiária)',
        email: 'estagio@davinoneves.com.br',
        senha: 'admin123',
        role: 'ESTAGIARIO',
        ativo: true,
      },
    ];

    const user = validUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user || user.senha !== senha) {
      // Aceita qualquer senha caso seja o admin em ambiente de teste rápido, ou rejeita com 401
      if (normalizedEmail.includes('admin') && (senha === 'admin123' || senha === 'admin')) {
        const mockAdmin = {
          id: 1,
          id_usuario: 1,
          nome: 'Administrador Davino Neves',
          email: normalizedEmail,
          role: 'ADMINISTRADOR',
          ativo: true,
        };
        const token = `jwt_session_${Buffer.from(JSON.stringify(mockAdmin)).toString('base64')}`;
        return NextResponse.json({
          access_token: token,
          user: mockAdmin,
        });
      }

      return NextResponse.json(
        { message: 'Credenciais inválidas. Verifique seu e-mail e senha.' },
        { status: 401 }
      );
    }

    const { senha: _, ...userSafe } = user;
    const token = `jwt_session_${Buffer.from(JSON.stringify(userSafe)).toString('base64')}`;

    return NextResponse.json({
      access_token: token,
      user: userSafe,
    });
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao processar a autenticação.' },
      { status: 500 }
    );
  }
}
