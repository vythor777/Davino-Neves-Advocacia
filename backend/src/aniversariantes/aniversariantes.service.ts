import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AniversariantesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAniversariantesDoMes(mesParam?: number) {
    const dataAtual = new Date();
    const mesAtual = mesParam || dataAtual.getMonth() + 1;
    const diaAtual = dataAtual.getDate();
    const anoAtual = dataAtual.getFullYear();
    
    // Nomes dos meses em PT-BR
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const nomeMes = nomesMeses[mesAtual - 1] || 'Desconhecido';

    try {
      // 1. Buscar Usuários com aniversário no mês
      const usuariosRaw = await this.prisma.usuario.findMany({
        where: {
          ativo: true,
          data_nascimento: {
            not: null,
          }
        },
        select: {
          id_usuario: true,
          nome: true,
          email: true,
          role: true,
          data_nascimento: true,
        },
      });

      // 2. Buscar Clientes com aniversário no mês
      const clientesRaw = await this.prisma.cliente.findMany({
        where: {
          data_nascimento: {
            not: null,
          }
        },
        select: {
          id_cliente: true,
          nome: true,
          email: true,
          telefone: true,
          data_nascimento: true,
        },
      });

      // 3. Filtrar e formatar em memória (Prisma não suporta extract(month from data) de forma nativa facilmente, e não há milhares de registros)
      const todosAniversariantes = [];
      let totalUsuarios = 0;
      let totalClientes = 0;

      for (const usuario of usuariosRaw) {
        if (!usuario.data_nascimento) continue;
        
        // Cuidado com Timezones (usando UTC para extrair dia e mês corretos da data gravada)
        const dateObj = new Date(usuario.data_nascimento);
        const mesNasc = dateObj.getUTCMonth() + 1;
        const diaNasc = dateObj.getUTCDate();

        if (mesNasc === mesAtual) {
          totalUsuarios++;
          todosAniversariantes.push(this.formatarItem(
            `u-${usuario.id_usuario}`, 
            usuario.nome, 
            'USUARIO', 
            usuario.role, 
            usuario.email, 
            undefined, 
            usuario.data_nascimento.toISOString(), 
            diaNasc, 
            mesNasc, 
            diaAtual, 
            mesAtual, 
            anoAtual
          ));
        }
      }

      for (const cliente of clientesRaw) {
        if (!cliente.data_nascimento) continue;
        
        const dateObj = new Date(cliente.data_nascimento);
        const mesNasc = dateObj.getUTCMonth() + 1;
        const diaNasc = dateObj.getUTCDate();

        if (mesNasc === mesAtual) {
          totalClientes++;
          todosAniversariantes.push(this.formatarItem(
            `c-${cliente.id_cliente}`, 
            cliente.nome, 
            'CLIENTE', 
            'Cliente', 
            cliente.email, 
            cliente.telefone, 
            cliente.data_nascimento.toISOString(), 
            diaNasc, 
            mesNasc, 
            diaAtual, 
            mesAtual, 
            anoAtual
          ));
        }
      }

      // 4. Ordenar por dia do mês (do menor para o maior)
      todosAniversariantes.sort((a, b) => a.dia - b.dia);

      return {
        mes: mesAtual,
        nomeMes: nomeMes,
        total: todosAniversariantes.length,
        totalUsuarios,
        totalClientes,
        aniversariantes: todosAniversariantes
      };
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      throw error;
    }
  }

  private formatarItem(
    id: string, 
    nome: string, 
    tipo: 'USUARIO' | 'CLIENTE', 
    subtitulo: string, 
    email: string, 
    telefone: string | undefined, 
    dataNascimento: string, 
    diaNasc: number, 
    mesNasc: number, 
    diaAtual: number, 
    mesAtual: number, 
    anoAtual: number
  ) {
    let diasRestantes = 0;
    
    if (mesNasc === mesAtual) {
      diasRestantes = diaNasc - diaAtual;
    } else {
       // simplificado para cálculo básico caso implementem meses diferentes no futuro
      diasRestantes = 0;
    }

    let diasRestantesTexto = '';
    let isHoje = false;
    let destaque = false;

    if (diasRestantes < 0) {
      diasRestantesTexto = `Foi dia ${diaNasc}`;
    } else if (diasRestantes === 0) {
      diasRestantesTexto = 'Hoje!';
      isHoje = true;
      destaque = true;
    } else if (diasRestantes === 1) {
      diasRestantesTexto = 'Amanhã';
      destaque = true;
    } else {
      diasRestantesTexto = `Em ${diasRestantes} dias`;
      if (diasRestantes <= 5) {
        destaque = true; // Destaque para quem faz aniversário nos próximos 5 dias
      }
    }

    const diaFormatado = diaNasc.toString().padStart(2, '0');
    
    // Pegar iniciais do nome
    const nomeParts = nome.trim().split(' ');
    let iniciais = '';
    if (nomeParts.length > 1) {
      iniciais = (nomeParts[0][0] + nomeParts[nomeParts.length - 1][0]).toUpperCase();
    } else if (nomeParts.length === 1 && nomeParts[0].length > 0) {
      iniciais = nomeParts[0].substring(0, 2).toUpperCase();
    }

    return {
      id,
      nome,
      tipo,
      subtitulo,
      email,
      telefone,
      dataNascimento,
      dia: diaNasc,
      mes: mesNasc,
      diaFormatado,
      diasRestantesTexto,
      isHoje,
      destaque,
      iniciais
    };
  }
}
