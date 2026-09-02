// frontend/app/api/aniversariantes/route.ts
import { NextResponse } from 'next/server';
import { getUsuariosStore, getClientesStore } from '@/lib/serverStore';

export interface AniversarianteItem {
  id: string;
  nome: string;
  tipo: 'USUARIO' | 'CLIENTE';
  subtitulo: string;
  email: string;
  telefone?: string;
  dataNascimento: string; // YYYY-MM-DD
  dia: number;
  mes: number;
  diaFormatado: string; // e.g. "08 de Setembro"
  diasRestantesTexto: string; // e.g. "Hoje", "Amanhã", "Em 6 dias"
  isHoje: boolean;
  destaque: boolean;
  iniciais: string;
}

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getIniciais(nome: string): string {
  const parts = nome.replace(/^(Dr\.|Dra\.|Sr\.|Sra\.)\s+/i, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hoje = new Date();
    const currentMonth = Number(searchParams.get('mes') || hoje.getMonth() + 1); // 1-12
    const currentDay = hoje.getDate();

    const usuarios = getUsuariosStore();
    const clientes = getClientesStore();

    const lista: AniversarianteItem[] = [];

    // Processar Usuários
    for (const u of usuarios) {
      if (!u.data_nascimento || !u.ativo) continue;
      // data_nascimento: "1988-09-08"
      const [, mStr, dStr] = u.data_nascimento.split('-');
      const mesNasc = parseInt(mStr, 10);
      const diaNasc = parseInt(dStr, 10);

      if (mesNasc === currentMonth) {
        let diasDiff = diaNasc - currentDay;
        let diasTexto = '';
        let isHoje = false;

        if (diasDiff === 0) {
          diasTexto = 'Hoje! 🎂';
          isHoje = true;
        } else if (diasDiff === 1) {
          diasTexto = 'Amanhã';
        } else if (diasDiff > 1) {
          diasTexto = `Em ${diasDiff} dias`;
        } else {
          diasTexto = `Foi dia ${diaNasc}`;
        }

        const roleLabel =
          u.role === 'ADMINISTRADOR'
            ? 'Sócio Administrador'
            : u.role === 'ADVOGADO'
            ? 'Advogado(a) Associado(a)'
            : 'Estagiário(a) de Direito';

        lista.push({
          id: `usr_${u.id_usuario}`,
          nome: u.nome,
          tipo: 'USUARIO',
          subtitulo: `Equipe • ${roleLabel}`,
          email: u.email,
          dataNascimento: u.data_nascimento,
          dia: diaNasc,
          mes: mesNasc,
          diaFormatado: `${String(diaNasc).padStart(2, '0')} de ${NOMES_MESES[mesNasc - 1]}`,
          diasRestantesTexto: diasTexto,
          isHoje,
          destaque: diasDiff >= 0 && diasDiff <= 7,
          iniciais: getIniciais(u.nome),
        });
      }
    }

    // Processar Clientes
    for (const c of clientes) {
      if (!c.data_nascimento) continue;
      const [, mStr, dStr] = c.data_nascimento.split('-');
      const mesNasc = parseInt(mStr, 10);
      const diaNasc = parseInt(dStr, 10);

      if (mesNasc === currentMonth) {
        let diasDiff = diaNasc - currentDay;
        let diasTexto = '';
        let isHoje = false;

        if (diasDiff === 0) {
          diasTexto = 'Hoje! 🎂';
          isHoje = true;
        } else if (diasDiff === 1) {
          diasTexto = 'Amanhã';
        } else if (diasDiff > 1) {
          diasTexto = `Em ${diasDiff} dias`;
        } else {
          diasTexto = `Foi dia ${diaNasc}`;
        }

        lista.push({
          id: `cli_${c.id_cliente}`,
          nome: c.nome,
          tipo: 'CLIENTE',
          subtitulo: `Cliente • ${c.cpf_cnpj.length > 14 ? 'Pessoa Jurídica' : 'Pessoa Física'}`,
          email: c.email,
          telefone: c.telefone,
          dataNascimento: c.data_nascimento,
          dia: diaNasc,
          mes: mesNasc,
          diaFormatado: `${String(diaNasc).padStart(2, '0')} de ${NOMES_MESES[mesNasc - 1]}`,
          diasRestantesTexto: diasTexto,
          isHoje,
          destaque: diasDiff >= 0 && diasDiff <= 7,
          iniciais: getIniciais(c.nome),
        });
      }
    }

    // Ordenar cronologicamente pelos dias do mês
    lista.sort((a, b) => a.dia - b.dia);

    return NextResponse.json({
      mes: currentMonth,
      nomeMes: NOMES_MESES[currentMonth - 1],
      total: lista.length,
      totalUsuarios: lista.filter((i) => i.tipo === 'USUARIO').length,
      totalClientes: lista.filter((i) => i.tipo === 'CLIENTE').length,
      aniversariantes: lista,
    });
  } catch {
    return NextResponse.json(
      { message: 'Erro ao carregar aniversariantes do mês' },
      { status: 500 }
    );
  }
}
