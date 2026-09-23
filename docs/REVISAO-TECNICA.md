# Revisão inicial — 23 de setembro de 2026

Base analisada: `fab3b5caf4c762150c116eaa2b31860dcde367a5`.

## Ambiente informado

- Interface: https://davino-neves-advocacia-frontend.vercel.app/
- API: https://davino-neves-advocacia.onrender.com
- Banco: Supabase. Credenciais e chaves geridas nos painéis dos provedores.

Não foram acessados registros privados, executadas migrações ou alteradas configurações de produção nesta revisão.

## Verificações públicas

A interface encaminhou a visita sem sessão para `/login`. O Render respondeu HTTP 200 em `/api` e HTTP 401 em `/api/auth/me` sem autenticação. Isso confirma disponibilidade dessas rotas, mas não valida todos os fluxos nem a consistência do banco.

O bundle público da interface contém a URL `https://davino-neves-advocacia.onrender.com/api`. Já o encaminhamento `/api/auth/me` pela Vercel retornou HTTP 404 com `DNS_HOSTNAME_RESOLVED_PRIVATE`. O código anterior só considerava `BACKEND_INTERNAL_URL` e `BACKEND_URL`, com fallback local. A correção permite usar também `NEXT_PUBLIC_API_URL` quando for uma URL absoluta. Se uma variável interna estiver definida com um destino incorreto, ela ainda precisará ser corrigida no painel, pois mantém prioridade.

## Correções deste conjunto

- Sincronização do arquivo de dependências para permitir instalação com `npm ci`.
- Dependência de Vite explícita no ambiente de testes do servidor, com os binários opcionais resolvidos no lockfile.
- Limpeza conjunta de armazenamento, cookies e estado da interface após rejeição da sessão.
- Uso do token dos cookies também nas chamadas à API quando o armazenamento local estiver ausente.
- Acesso à tela de login mesmo com cookie expirado, evitando redirecionamento imediato baseado só na existência do cookie.
- Retorno após login limitado a caminhos internos, sem retornar ao próprio login.
- Respostas antigas de API não encerram uma nova sessão nem restauram um perfil após logout.
- Cookies de autenticação marcados como Secure em HTTPS.
- Normalização do destino da API para evitar duplicação de `/api`.

Os cookies continuam acessíveis ao JavaScript, pois a aplicação usa autenticação bearer no navegador. A migração para uma sessão baseada em cookie HttpOnly exigiria uma alteração específica de arquitetura.

## Pendências antes de considerar o sistema concluído

### 1. Inicialização e credenciais padrão

`backend/src/auth/auth.service.ts` cria um administrador com credenciais fixas quando o banco está vazio. `backend/prisma/seed.ts` também contém senhas fixas e pode redefinir a senha de uma conta existente. A configuração JWT possui um segredo fixo de fallback em `backend/src/auth/auth.module.ts` e `backend/src/auth/strategies/jwt.strategy.ts`.

A configuração efetiva nos provedores não foi inspecionada. O próximo conjunto deve remover esses fallbacks, definir inicialização explícita e preservar as contas existentes. Não executar o seed atual no banco real como parte de testes.

### 2. Histórico de migrações incompleto

A primeira migração cria `Usuario.senha` e `Usuario.tipo`, enquanto o modelo atual usa `senha_hash`, `role` e `ativo`. O modelo também contém `LancamentoFinanceiro` e seus enums, ausentes nas migrações versionadas. Há alterações automáticas de duas colunas na inicialização em `backend/src/prisma/prisma.service.ts`.

É necessário comparar o esquema efetivo do Supabase com o histórico antes de escrever ou aplicar uma migração. O projeto compilar não prova que um banco vazio possa ser instalado nem que o banco publicado esteja divergente.

### 3. Agenda e documentos incompletos

Os serviços `backend/src/agenda/agenda.service.ts` e `backend/src/documentos/documentos.service.ts` ainda devolvem mensagens de exemplo. Seus controladores não têm guardas de autenticação. Não foi encontrado serviço correspondente no frontend; a agenda visual existente trabalha com prazos e não deve ser confundida com o módulo backend `Agenda`.

Definir os fluxos desejados para compromissos independentes e documentos, incluindo armazenamento de arquivos, antes de completar esses módulos.

### 4. Validação autenticada

A navegação autenticada foi conferida em painel, clientes, processos, prazos, financeiro e equipe. Foram abertos e fechados os formulários de cadastro, sem salvar registros. A tela DataJud carregou, mas nenhuma consulta a um processo real foi executada. O resumo de documentos com IA respondeu a um texto inteiramente fictício. Ainda faltam testes de gravação, edição, exclusão e permissões por perfil com dados descartáveis em ambiente de teste. Alterações persistentes devem usar dados de teste identificáveis em um ambiente apropriado.

### 5. Verificações automatizadas

Os testes anteriores do backend cobrem apenas dois casos básicos. Este conjunto adiciona testes de regressão para autenticação e destino da API. Persistem nove avisos de lint preexistentes no frontend, principalmente imports não usados e variáveis não usadas.

## Como conferir este conjunto

Usar Node.js 24 e instalar dependências com `npm ci` na raiz. Em seguida:

```sh
npm run test:session
npm run test:ui
npm run build
npm run test --workspace=backend
npm run lint
```

Essas verificações não exigem as credenciais do banco real. Testes de ponta a ponta e inicialização completa do servidor exigem um banco de teste configurado separadamente.


## Correções após a navegação autenticada

- Os botões de novo processo e prazo no topo do painel agora indicam a ação de cadastro na URL.
- Clientes e prazos passam a reconhecer `novo=true`. Os três cadastros compartilham um hook que consome o parâmetro depois de abrir o formulário, preserva os demais filtros e evita reabertura durante atualização dos dados.
- As telas de processos usam o dia civil de distribuição, sem deslocá-lo pelo fuso do navegador. Testes renderizam a tabela em quatro fusos, incluindo São Paulo e Manaus.
- As datas iniciais dos formulários de processo e prazo usam o dia local.

A compilação do frontend nesta etapa passou com `npm run build --workspace=frontend -- --webpack`. O compilador padrão Turbopack não conseguiu abrir uma porta interna no ambiente restrito de execução; a configuração de build do projeto foi preservada. Os novos atalhos ainda precisam de uma conferência visual após publicar uma versão de teste. Nenhum conteúdo privado das telas foi copiado para este relatório ou para os testes.
