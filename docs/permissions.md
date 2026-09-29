# Cargos, vínculos e implantação

Esta alteração depende da interface do PR #5. A matriz é fixa por cargo; o administrador atribui cargos na Equipe e libera os processos em **Processos → Detalhes → Gerenciar acessos**. Não existe edição arbitrária da matriz.

## Regras

| Operação | Administrador | Advogado | Estagiário |
|---|---|---|---|
| Criar/editar/excluir usuários; atribuir cargos | Sim | Não | Não |
| Consultar diretório reduzido da equipe | Sim | Sim | Sim |
| Criar/visualizar clientes | Sim | Sim | Sim |
| Editar identificação do cliente | Sim | Sim | Não |
| Editar e-mail, telefone e endereço | Sim | Sim | Sim |
| Excluir clientes | Sim | Não | Não |
| Criar processos | Sim | Sim, torna-se responsável | Não |
| Consultar processos, movimentações, prazos e metadados de documentos | Todos | Próprios e vinculados | Somente liberados |
| Editar informações de processos | Todos | Somente como responsável | Não |
| Arquivar processo | Todos | Próprios e vinculados | Não |
| Restaurar processo encerrado | Sim | Não | Não |
| Excluir processo | Sim, respeitando dependências existentes | Não | Não |
| Definir responsável/participantes | Sim | Não | Não |
| Criar/editar prazos e compromissos processuais | Sim | Nos processos acessíveis | Não |
| Excluir prazos | Sim | Não | Não |
| Upload de documentos | Todos | Nos processos acessíveis | Nos processos liberados |
| Download de documentos | Todos | Nos processos acessíveis | Não |
| Auditoria e alteração de configurações | Sim | Não | Não |

Decisões conservadoras para regras não especificadas: exclusão de clientes/prazos apenas pelo administrador; download não concedido ao estagiário. Nome/razão social, CPF/CNPJ e nascimento/fundação são dados de identificação protegidos contra edição pelo estagiário. O cadastro inicial continua permitido com todos os campos necessários.

A agenda independente (`/agenda`) passa a persistir compromissos pessoais: administrador vê todos, advogado administra os próprios, estagiário consulta os seus. A interface de Agenda e Prazos existente continua usando `/prazos` para compromissos ligados a processos.

O financeiro permanece com sua política de acesso anterior entre usuários autenticados. A autenticação JWT global também protege suas rotas, mas sua autorização por cargo, vínculos financeiros e informações processuais presentes nos lançamentos permanecem fora desta etapa, conforme solicitado. Não considerar a separação de informações completa no módulo financeiro antes dessa revisão. A IA continua processando o texto enviado pelo próprio usuário, sem acesso automático ao banco de processos.

## Comportamento de segurança

- Somente login e saúde (`GET /api`) são públicos; demais rotas exigem JWT válido.
- Cargo e situação ativa são relidos do banco em cada requisição; alterar o cargo/desativar a conta invalida os poderes do token antigo.
- Acesso por ID, listagens, processos dentro de clientes, contagens, prazos, documentos, notificações processuais e consultas CNJ aplicam o mesmo escopo.
- Usuários sem vínculo recebem 404 para não confirmar a existência do processo.
- O responsável é definido pelo servidor na criação feita por advogado. Somente administrador pode reatribuir ou liberar acesso; o payload comum de edição não aceita esses campos.
- Documentos são privados, persistidos como bytes no PostgreSQL (até 5 MB por arquivo), e baixados como anexo. Metadados não incluem bytes nem caminhos públicos. Arquivos legados que possuíam somente caminho devem ser reenviados; não há busca remota automática desses caminhos.
- A auditoria registra mutações bem-sucedidas nos módulos não financeiros, com autor, cargo, entidade, ID e horário. Não armazena senhas, tokens, corpo do documento ou payload completo. A consulta retorna as últimas 100 ações; não oferece alteração/exclusão de logs pela API. Não reconstrói histórico anterior e não equivale a um mecanismo de imutabilidade no banco.
- A tela de configurações permite ao administrador definir nome do escritório e e-mail de contato; o nome é usado na identificação da interface.

## Implantação

Não foi executada migração nem alteração de dados em produção durante o desenvolvimento.

1. Confirmar backup do banco e testar primeiro em um banco de homologação correspondente ao ambiente publicado.
2. Conferir `JWT_SECRET` no backend: deve ser um segredo aleatório com pelo menos 32 caracteres. O fallback conhecido foi removido. Se a chave mudar, os usuários precisarão entrar novamente. Contas existentes não são recriadas. Em banco vazio, o bootstrap exige `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD` (mínimo 12 caracteres), definidos pelo operador.
3. Com as variáveis do ambiente carregadas, executar `node backend/scripts/preflight-permissions.mjs`. O script é somente leitura e confere administrador ativo e estrutura base.
4. Conferir `npx prisma migrate status --schema backend/prisma/schema.prisma`. O histórico antigo do repositório não contém todas as alterações prévias de usuários/financeiro; o banco publicado pode ter sido sincronizado via `db push`. Se houver divergência, reconciliar o histórico com o estado real antes de prosseguir. Não executar reset, `migrate dev` nem aceitar perda de dados no banco publicado.
5. Aplicar `npx prisma migrate deploy --schema backend/prisma/schema.prisma` somente depois de conferir o histórico. A migração `20260928120000_process_access` é aditiva e transacional; cria vínculos, auditoria, configurações e conteúdo privado dos documentos. Não inventa responsáveis nem concede acesso automaticamente a processos antigos.
6. Gerar o cliente Prisma e publicar backend antes do frontend: `npm run build --workspace=backend`. As rotas novas do frontend precisam do backend e da migração novos.
7. Como administrador, atribuir responsáveis e participantes aos processos existentes. Até essa atribuição eles ficam visíveis somente ao administrador.
8. Conferir no preview os três cargos, desativação/revogação de acesso, upload/download e auditoria, além do layout desktop/mobile. Só então promover a versão publicada.

### Proteção do acesso direto ao Supabase

A conferência do banco em 29/09/2026 identificou concessões a `anon` e
`authenticated` sem RLS nas tabelas da aplicação. A migração
`20260929170000_private_api_tables` ativa RLS e remove essas concessões em
usuários, clientes, processos, prazos, documentos, agenda, participantes,
auditoria e configurações. Não cria políticas de Supabase Auth: a autorização
continua centralizada no Nest, que utiliza Prisma.

Antes de aplicar, confirmar que a conexão Prisma utiliza o proprietário das
tabelas ou um papel com `BYPASSRLS`; uma conexão comum sem políticas seria
bloqueada. Não conceder acesso adicional a um papel para contornar esse teste.
Verificar também a ausência de políticas públicas preexistentes.

`LancamentoFinanceiro` não é alterada por essa migração. Sua exposição direta
por concessões sem RLS continua uma pendência de segurança da revisão financeira;
não declarar que todo o banco ficou protegido. As regras financeiras do Nest e
do frontend também permanecem como antes.

### Conferência de 29/09/2026

- Os três checksums de migrações anteriores conferem com `_prisma_migrations`;
  existe um administrador ativo e as novas estruturas ainda não existem.
- O Render usa a branch `main`, deploy automático e `prisma migrate deploy`
  no comando de build. Publicar a branch principal dispara a migração.
- Ensaio isolado em PostgreSQL 18.3 via PGlite 0.5.8, usando somente metadados
  da estrutura publicada e registros fictícios: migrações aprovadas, legados
  preservados, FK de participantes validada, bytes de documento persistidos,
  operações do proprietário funcionais e leitura/exclusão negadas aos papéis
  `anon` e `authenticated` nas nove tabelas. Dados e privilégios do financeiro
  permaneceram idênticos. Esse ensaio não substitui validação no PostgreSQL
  17.6 da produção nem os testes autenticados da interface.
- Nenhuma migração aplicada em produção nesta conferência. Backup recuperável,
  configuração efetiva de JWT e publicação seguem pendentes.

## Validação automatizada

`npm run test:permissions` compila o backend e executa a matriz HTTP no pipeline real do Nest (JWT, guards, validação, controllers e serviços), com Prisma substituído por dados isolados em memória. Também renderiza a tabela de processos para conferir botões por cargo/registro. Não substitui validação da migração e dos relacionamentos em PostgreSQL real nem conferência visual no preview.

Regressões existentes: `npm run test:session` e `TSX_TSCONFIG_PATH=frontend/tsconfig.json node --import tsx --test tests/process-dates.test.ts`. Build de produção e lint do frontend também devem passar.
