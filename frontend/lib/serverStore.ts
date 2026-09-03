// frontend/lib/serverStore.ts

export interface UsuarioStoreItem {
  id_usuario: number;
  id?: number;
  nome: string;
  email: string;
  senha_hash?: string;
  role: 'ADMINISTRADOR' | 'ADVOGADO' | 'ESTAGIARIO';
  ativo: boolean;
  data_nascimento: string | null;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ClienteStoreItem {
  id_cliente: number;
  nome: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  data_nascimento: string | null;
  data_criacao: string;
  data_atualizacao: string;
  _count?: {
    processos: number;
  };
}

export type TipoLancamento = 'RECEITA' | 'DESPESA';
export type CategoriaLancamento =
  | 'HONORARIO_CONTRATUAL'
  | 'HONORARIO_EXITO'
  | 'CONSULTIVO'
  | 'CUSTAS_PROCESSUAIS'
  | 'OPERACIONAL'
  | 'IMPOSTOS'
  | 'OUTROS';
export type StatusLancamento = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';

export interface LancamentoStoreItem {
  id: string;
  descricao: string;
  tipo: TipoLancamento;
  categoria: CategoriaLancamento;
  valor: number;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento?: string | null;
  status: StatusLancamento;
  formaPagamento?: string | null;
  observacoes?: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  processoId?: number | null;
  clienteId?: number | null;
  cliente?: {
    id_cliente: number;
    nome: string;
    cpf_cnpj: string;
    email?: string;
  } | null;
  processo?: {
    id_processo: number;
    numero_processo: string;
    titulo: string;
  } | null;
}

// Global server in-memory store (persists across requests during server runtime)
declare global {
  var __davino_usuarios: UsuarioStoreItem[] | undefined;
  var __davino_clientes: ClienteStoreItem[] | undefined;
  var __davino_lancamentos: LancamentoStoreItem[] | undefined;
}

export function getInitialUsuarios(): UsuarioStoreItem[] {
  return [
    {
      id_usuario: 1,
      nome: 'Administrador Davino Neves',
      email: 'admin@davinoneves.com.br',
      role: 'ADMINISTRADOR',
      ativo: true,
      data_nascimento: '1980-09-14',
      data_criacao: new Date('2024-01-10').toISOString(),
      data_atualizacao: new Date().toISOString(),
    },
    {
      id_usuario: 2,
      nome: 'Dra. Camila Alencar',
      email: 'camila.alencar@davinoneves.adv.br',
      role: 'ADVOGADO',
      ativo: true,
      data_nascimento: '1988-09-08',
      data_criacao: new Date('2024-02-15').toISOString(),
      data_atualizacao: new Date().toISOString(),
    },
    {
      id_usuario: 3,
      nome: 'Dr. Lucas Davino',
      email: 'lucas@davinoneves.com.br',
      role: 'ADVOGADO',
      ativo: true,
      data_nascimento: '1986-04-18',
      data_criacao: new Date('2024-01-15').toISOString(),
      data_atualizacao: new Date().toISOString(),
    },
    {
      id_usuario: 4,
      nome: 'Dra. Beatriz Neves',
      email: 'beatriz@davinoneves.com.br',
      role: 'ADVOGADO',
      ativo: true,
      data_nascimento: '1992-09-28',
      data_criacao: new Date('2024-03-01').toISOString(),
      data_atualizacao: new Date().toISOString(),
    },
    {
      id_usuario: 5,
      nome: 'Mariana Silva',
      email: 'estagio@davinoneves.com.br',
      role: 'ESTAGIARIO',
      ativo: true,
      data_nascimento: '2001-11-05',
      data_criacao: new Date('2024-05-10').toISOString(),
      data_atualizacao: new Date().toISOString(),
    },
    {
      id_usuario: 6,
      nome: 'Marcos Vinícius Prado',
      email: 'marcos.prado@davinoneves.adv.br',
      role: 'ADVOGADO',
      ativo: true,
      data_nascimento: '1990-09-21',
      data_criacao: new Date('2024-04-12').toISOString(),
      data_atualizacao: new Date().toISOString(),
    },
  ];
}

export function getInitialClientes(): ClienteStoreItem[] {
  return [
    {
      id_cliente: 1,
      nome: 'Carlos Eduardo Siqueira',
      cpf_cnpj: '123.456.789-00',
      email: 'carlos.siqueira@empresa.com.br',
      telefone: '(11) 98765-4321',
      endereco: 'Av. Paulista, 1000, Cj. 42 - Bela Vista, São Paulo - SP',
      data_nascimento: '1979-09-12',
      data_criacao: new Date('2024-01-20').toISOString(),
      data_atualizacao: new Date().toISOString(),
      _count: { processos: 2 },
    },
    {
      id_cliente: 2,
      nome: 'Dra. Helena Peixoto',
      cpf_cnpj: '987.654.321-11',
      email: 'helena.peixoto@medicina.com.br',
      telefone: '(11) 97654-3210',
      endereco: 'Rua Oscar Freire, 550 - Cerqueira César, São Paulo - SP',
      data_nascimento: '1985-09-19',
      data_criacao: new Date('2024-02-10').toISOString(),
      data_atualizacao: new Date().toISOString(),
      _count: { processos: 1 },
    },
    {
      id_cliente: 3,
      nome: 'TechVenture Participações S.A.',
      cpf_cnpj: '12.345.678/0001-90',
      email: 'juridico@techventure.com.br',
      telefone: '(11) 3210-9876',
      endereco: 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi, São Paulo - SP',
      data_nascimento: null, // Pessoa Jurídica
      data_criacao: new Date('2024-01-15').toISOString(),
      data_atualizacao: new Date().toISOString(),
      _count: { processos: 4 },
    },
    {
      id_cliente: 4,
      nome: 'Dr. Fernando Augusto Ramos',
      cpf_cnpj: '456.789.012-33',
      email: 'fernando.ramos@adv.net.br',
      telefone: '(21) 98123-4567',
      endereco: 'Av. Rio Branco, 156, Sl. 2101 - Centro, Rio de Janeiro - RJ',
      data_nascimento: '1982-09-25',
      data_criacao: new Date('2024-03-05').toISOString(),
      data_atualizacao: new Date().toISOString(),
      _count: { processos: 2 },
    },
    {
      id_cliente: 5,
      nome: 'Construtora Aliança Brasil Ltda',
      cpf_cnpj: '98.765.432/0001-10',
      email: 'contato@aliancabrasil.eng.br',
      telefone: '(11) 4004-1234',
      endereco: 'Rua Vergueiro, 2000 - Vila Mariana, São Paulo - SP',
      data_nascimento: null,
      data_criacao: new Date('2024-02-18').toISOString(),
      data_atualizacao: new Date().toISOString(),
      _count: { processos: 3 },
    },
  ];
}

export function getUsuariosStore(): UsuarioStoreItem[] {
  if (!globalThis.__davino_usuarios) {
    globalThis.__davino_usuarios = getInitialUsuarios();
  }
  return globalThis.__davino_usuarios;
}

export function setUsuariosStore(data: UsuarioStoreItem[]) {
  globalThis.__davino_usuarios = data;
}

export function getClientesStore(): ClienteStoreItem[] {
  if (!globalThis.__davino_clientes) {
    globalThis.__davino_clientes = getInitialClientes();
  }
  return globalThis.__davino_clientes;
}

export function setClientesStore(data: ClienteStoreItem[]) {
  globalThis.__davino_clientes = data;
}

export function getInitialLancamentos(): LancamentoStoreItem[] {
  return [
    {
      id: 'lanc-101',
      descricao: 'Honorários Mensais - Assessoria Jurídica Contratual',
      tipo: 'RECEITA',
      categoria: 'HONORARIO_CONTRATUAL',
      valor: 18500.0,
      dataVencimento: '2026-09-05',
      dataPagamento: '2026-09-05',
      status: 'PAGO',
      formaPagamento: 'PIX Bancário',
      observacoes: 'Contrato fixo mensal de assessoria corporativa contínua.',
      dataCriacao: new Date('2026-08-25').toISOString(),
      dataAtualizacao: new Date('2026-09-05').toISOString(),
      clienteId: 3,
      cliente: {
        id_cliente: 3,
        nome: 'TechVenture Participações S.A.',
        cpf_cnpj: '12.345.678/0001-90',
        email: 'juridico@techventure.com.br',
      },
      processoId: null,
    },
    {
      id: 'lanc-102',
      descricao: 'Honorários de Êxito - Fase Executória TJSP',
      tipo: 'RECEITA',
      categoria: 'HONORARIO_EXITO',
      valor: 42000.0,
      dataVencimento: '2026-09-10',
      dataPagamento: '2026-09-10',
      status: 'PAGO',
      formaPagamento: 'Transferência TED',
      observacoes: '20% sobre o proveito econômico obtido em liquidação de sentença.',
      dataCriacao: new Date('2026-08-30').toISOString(),
      dataAtualizacao: new Date('2026-09-10').toISOString(),
      clienteId: 5,
      cliente: {
        id_cliente: 5,
        nome: 'Construtora Aliança Brasil Ltda',
        cpf_cnpj: '98.765.432/0001-10',
        email: 'contato@aliancabrasil.eng.br',
      },
      processoId: 1,
      processo: {
        id_processo: 1,
        numero_processo: '1004521-88.2024.8.26.0100',
        titulo: 'Execução de Título Extrajudicial c/ Embargos',
      },
    },
    {
      id: 'lanc-103',
      descricao: 'Parecer Consultivo Tributário e Blindagem Patrimonial',
      tipo: 'RECEITA',
      categoria: 'CONSULTIVO',
      valor: 9800.0,
      dataVencimento: '2026-09-15',
      dataPagamento: null,
      status: 'PENDENTE',
      formaPagamento: 'Boleto Bancário',
      observacoes: 'Emissão de nota fiscal técnica com entrega de relatório final.',
      dataCriacao: new Date('2026-09-01').toISOString(),
      dataAtualizacao: new Date('2026-09-01').toISOString(),
      clienteId: 2,
      cliente: {
        id_cliente: 2,
        nome: 'Dra. Helena Peixoto',
        cpf_cnpj: '987.654.321-11',
        email: 'helena.peixoto@medicina.com.br',
      },
    },
    {
      id: 'lanc-104',
      descricao: 'Parcela de Entrada - Ação Revisional e Indenizatória',
      tipo: 'RECEITA',
      categoria: 'HONORARIO_CONTRATUAL',
      valor: 6500.0,
      dataVencimento: '2026-09-20',
      dataPagamento: null,
      status: 'PENDENTE',
      formaPagamento: 'PIX Bancário',
      observacoes: '1ª parcela de 3 acordadas em contrato de prestação de serviços.',
      dataCriacao: new Date('2026-09-01').toISOString(),
      dataAtualizacao: new Date('2026-09-01').toISOString(),
      clienteId: 1,
      cliente: {
        id_cliente: 1,
        nome: 'Carlos Eduardo Siqueira',
        cpf_cnpj: '123.456.789-00',
        email: 'carlos.siqueira@empresa.com.br',
      },
      processoId: 2,
      processo: {
        id_processo: 2,
        numero_processo: '0012948-34.2024.8.26.0001',
        titulo: 'Ação de Rescisão Contratual c/ Restituição de Valores',
      },
    },
    {
      id: 'lanc-105',
      descricao: 'Honorários Sucumbenciais Recursais - STJ',
      tipo: 'RECEITA',
      categoria: 'HONORARIO_EXITO',
      valor: 15400.0,
      dataVencimento: '2026-09-28',
      dataPagamento: null,
      status: 'PENDENTE',
      formaPagamento: 'Depósito Judicial / Alvará',
      observacoes: 'Aguardando expedição de MLE pela 3ª Vara Cível.',
      dataCriacao: new Date('2026-09-01').toISOString(),
      dataAtualizacao: new Date('2026-09-01').toISOString(),
      clienteId: 4,
      cliente: {
        id_cliente: 4,
        nome: 'Dr. Fernando Augusto Ramos',
        cpf_cnpj: '456.789.012-33',
        email: 'fernando.ramos@adv.net.br',
      },
    },
    {
      id: 'lanc-106',
      descricao: 'Honorários de Acompanhamento em Diligência Especial',
      tipo: 'RECEITA',
      categoria: 'CONSULTIVO',
      valor: 4200.0,
      dataVencimento: '2026-08-25',
      dataPagamento: null,
      status: 'ATRASADO',
      formaPagamento: 'Boleto Bancário',
      observacoes: 'Fatura vencida. Setor de controladoria notificou preventivamente.',
      dataCriacao: new Date('2026-08-10').toISOString(),
      dataAtualizacao: new Date('2026-08-26').toISOString(),
      clienteId: 1,
      cliente: {
        id_cliente: 1,
        nome: 'Carlos Eduardo Siqueira',
        cpf_cnpj: '123.456.789-00',
        email: 'carlos.siqueira@empresa.com.br',
      },
    },
    {
      id: 'lanc-107',
      descricao: 'Custas Iniciais de Distribuição e Preparo Recursal TJSP',
      tipo: 'DESPESA',
      categoria: 'CUSTAS_PROCESSUAIS',
      valor: 2450.0,
      dataVencimento: '2026-09-04',
      dataPagamento: '2026-09-04',
      status: 'PAGO',
      formaPagamento: 'DARE / Guia TJSP',
      observacoes: 'Guia DARE autenticada e juntada aos autos com comprovante.',
      dataCriacao: new Date('2026-09-02').toISOString(),
      dataAtualizacao: new Date('2026-09-04').toISOString(),
      clienteId: 5,
      cliente: {
        id_cliente: 5,
        nome: 'Construtora Aliança Brasil Ltda',
        cpf_cnpj: '98.765.432/0001-10',
      },
      processoId: 1,
      processo: {
        id_processo: 1,
        numero_processo: '1004521-88.2024.8.26.0100',
        titulo: 'Execução de Título Extrajudicial c/ Embargos',
      },
    },
    {
      id: 'lanc-108',
      descricao: 'Aluguel do Escritório & Condomínio Corporativo',
      tipo: 'DESPESA',
      categoria: 'OPERACIONAL',
      valor: 8200.0,
      dataVencimento: '2026-09-10',
      dataPagamento: '2026-09-09',
      status: 'PAGO',
      formaPagamento: 'Débito Automático',
      observacoes: 'Edifício Faria Lima Corporate Tower - Conjunto 1402.',
      dataCriacao: new Date('2026-08-28').toISOString(),
      dataAtualizacao: new Date('2026-09-09').toISOString(),
    },
    {
      id: 'lanc-109',
      descricao: 'Plataforma Jurídica, Licenças de Software e API IA',
      tipo: 'DESPESA',
      categoria: 'OPERACIONAL',
      valor: 1450.0,
      dataVencimento: '2026-09-15',
      dataPagamento: null,
      status: 'PENDENTE',
      formaPagamento: 'Cartão Corporativo',
      observacoes: 'Licenças de gestão processual, DataJud Crawler e Tokens Google Gemini.',
      dataCriacao: new Date('2026-09-01').toISOString(),
      dataAtualizacao: new Date('2026-09-01').toISOString(),
    },
    {
      id: 'lanc-110',
      descricao: 'DAS - Simples Nacional Advocacia e ISSQN',
      tipo: 'DESPESA',
      categoria: 'IMPOSTOS',
      valor: 5800.0,
      dataVencimento: '2026-09-20',
      dataPagamento: null,
      status: 'PENDENTE',
      formaPagamento: 'DARF / Guia DAS',
      observacoes: 'Tributação sobre faturamento da sociedade de advogados.',
      dataCriacao: new Date('2026-09-01').toISOString(),
      dataAtualizacao: new Date('2026-09-01').toISOString(),
    },
    {
      id: 'lanc-111',
      descricao: 'Honorários Periciais Contábeis Prévios - Vara Cível',
      tipo: 'DESPESA',
      categoria: 'CUSTAS_PROCESSUAIS',
      valor: 4000.0,
      dataVencimento: '2026-08-29',
      dataPagamento: null,
      status: 'ATRASADO',
      formaPagamento: 'Depósito em Conta Judicial',
      observacoes: 'Perícia deferida. Necessário solicitar reembolso antecipado ao cliente.',
      dataCriacao: new Date('2026-08-15').toISOString(),
      dataAtualizacao: new Date('2026-08-30').toISOString(),
      clienteId: 3,
      cliente: {
        id_cliente: 3,
        nome: 'TechVenture Participações S.A.',
        cpf_cnpj: '12.345.678/0001-90',
      },
    },
  ];
}

export function getLancamentosStore(): LancamentoStoreItem[] {
  if (!globalThis.__davino_lancamentos) {
    globalThis.__davino_lancamentos = getInitialLancamentos();
  }
  return globalThis.__davino_lancamentos;
}

export function setLancamentosStore(data: LancamentoStoreItem[]) {
  globalThis.__davino_lancamentos = data;
}

