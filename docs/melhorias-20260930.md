# Melhorias Davino Neves

Implementado: escolha da contagem dos prazos, solicitação de confirmação quando a regra faltar ou conflitar, bloqueio de resposta inválida da IA e de agendamento sem data; responsável obrigatório nos prazos fatais; status financeiro derivado do vencimento; auditoria com registro e campos antes/depois permitidos; abas de prazos, movimentações, documentos e honorários na ficha de processo; exportação PDF com identificação institucional, marca d'água e revisão; documentos privados com limite decimal de 5.000.000 bytes, otimização sem perda, detecção de assinaturas, reserva de 800 MB, backup ZIP com manifesto SHA-256 e arquivamento administrativo após confirmação.

## Configuração de documentos

No Render, configurar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (somente backend; nunca NEXT_PUBLIC). SUPABASE_DOCUMENTS_BUCKET é opcional e usa documentos-juridicos. Criar esse bucket privado, MIME application/pdf, file_size_limit 5000000. Não criar políticas públicas: esta aplicação usa JWT próprio e valida permissões no Nest antes de acessar Storage com a credencial privada. A migração Prisma é aplicada pelo build atual do Render (prisma migrate deploy).

O limite de 800 MB se refere aos documentos gerenciados pela aplicação. Outros buckets/objetos consomem a mesma quota do projeto e precisam ser monitorados no Supabase. Backups são feitos em lotes de até oito PDFs para limitar memória e tráfego. Nenhum arquivo é eliminado automaticamente. O administrador deve abrir o ZIP, verificar os PDFs e comparar SHA-256 antes de confirmar a retirada da nuvem. O histórico e os metadados permanecem. PDFs assinados são enviados intactos e não são otimizados. Compressão sem perda não garante redução abaixo de 5 MB.

## Limitações e verificações pendentes

A data continua sendo sugerida pelo Gemini, conforme preferência do projeto. As validações de formato e ambiguidade não provam a correção aritmética nem a aplicação correta de feriados e suspensões. Revisão do advogado é obrigatória. A revisão das demais funções da IA foi adiada pelo usuário; nenhum modelo de probabilidade ou jurisprudência foi refeito nesta etapa.

Testes de backend, validação de PDFs, permissões HTTP e permissões da interface; compilação de ambos os projetos e inspeção visual de PDF multipágina. É necessário validar em produção: Gemini com 120 dias corridos e casos de dias úteis, upload/download privado, backup e arquivamento com dados fictícios. Não executar testes destrutivos com documentos reais.

## Roteiro de apresentação

Criar dados fictícios pela interface: cliente de demonstração, processo de teste vinculado, advogado responsável, prazo com responsável, honorário, PDF sem dados pessoais. Demonstrar visão integrada, perfis de acesso, identificação de atraso, exportação PDF e backup. Não inserir registros de demonstração automaticamente em produção.
