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

// Global server in-memory store (persists across requests during server runtime)
declare global {
  var __davino_usuarios: UsuarioStoreItem[] | undefined;
  var __davino_clientes: ClienteStoreItem[] | undefined;
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
