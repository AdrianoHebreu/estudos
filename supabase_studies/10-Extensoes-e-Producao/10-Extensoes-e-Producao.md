# 10 Extensões e produção

## Extensões do Postgres

O Supabase inclui muitas extensões Postgres. Ativas-as em Database → Extensions ou por SQL:

    create extension if not exists vector with schema extensions;

| Extensão | Utilização |
|---|---|
| `vector` (pgvector) | Guardar embeddings e fazer pesquisa por semelhança |
| `pg_cron` | Agendar tarefas SQL recorrentes |
| `pg_net` | Fazer pedidos HTTP a partir da base de dados |
| `pg_trgm` | Pesquisa de texto aproximada |
| `postgis` | Dados geográficos |

## Pesquisa vetorial

Com a extensão `vector`, guardas embeddings gerados por um modelo de IA e procuras os mais próximos:

    create table public.documentos (
      id bigint generated always as identity primary key,
      conteudo text,
      embedding extensions.vector(1536)
    );

    select id, conteudo
    from public.documentos
    order by embedding <=> '[0.01, 0.02, ...]'
    limit 5;

O operador `<=>` calcula a distância de cosseno. A dimensão (1536) tem de coincidir com o modelo que gera os embeddings. Como a extensão foi criada no esquema `extensions`, o tipo escreve-se `extensions.vector`.

## Pesquisa vetorial na prática

Um índice acelera a pesquisa por semelhança. O tipo HNSW é a escolha habitual:

    create index on public.documentos
      using hnsw (embedding vector_cosine_ops);

Encapsula a pesquisa numa função para a chamares com `rpc`:

    create function public.procurar_documentos(consulta extensions.vector(1536), quantos int default 5)
    returns table (id bigint, conteudo text, semelhanca float)
    language sql
    stable
    as $$
      select id, conteudo, 1 - (embedding <=> consulta) as semelhanca
      from public.documentos
      order by embedding <=> consulta
      limit quantos;
    $$;

    const { data } = await supabase.rpc('procurar_documentos', {
      consulta: embedding,
      quantos: 3,
    })

Os embeddings são gerados por um modelo externo, normalmente numa Edge Function que guarda a chave desse serviço como segredo. Como a função é `security invoker` por omissão, o RLS de `documentos` continua a aplicar-se.

## Tarefas agendadas

    select cron.schedule(
      'limpar-antigas',
      '0 3 * * *',
      $$ delete from public.tarefas where concluida and criada_em < now() - interval '90 days' $$
    );

A expressão `0 3 * * *` corre todos os dias às 03:00 (UTC).

## Lista de verificação para produção

| Área | Verificação |
|---|---|
| RLS | Todas as tabelas de `public` têm RLS ativo e políticas testadas |
| Chaves | A chave secreta só existe em servidores; nada no repositório |
| Auth | Confirmação de email ativa; URLs de retorno limitados ao teu domínio |
| Backups | Backups automáticos ativos; testa uma restauração |
| Migrations | Esquema versionado e aplicado por `db push` ou CI |
| Índices | Colunas de filtros e de políticas indexadas |
| Limites | Conheces as quotas do plano e os alertas de utilização |
| Email | SMTP próprio configurado (o SMTP por omissão do Auth só serve para testes) |
| Rede | SSL obrigatório e, se possível, restrições de rede à base de dados |
| Conta | MFA na conta Supabase e mais de um proprietário na organização |

## Gerir tarefas agendadas

    select * from cron.job;                       -- tarefas existentes
    select * from cron.job_run_details
      order by start_time desc limit 10;          -- execuções recentes
    select cron.unschedule('limpar-antigas');     -- remover

Verifica os resultados das execuções: uma tarefa que falha em silêncio é um problema escondido.

## Auditar a segurança com SQL

Uma consulta rápida mostra que tabelas do esquema `public` estão sem RLS:

    select tablename, rowsecurity
    from pg_tables
    where schemaname = 'public'
    order by rowsecurity, tablename;

Qualquer linha com `rowsecurity = false` é uma tabela exposta pela API. Lista também as políticas existentes:

    select tablename, policyname, cmd, roles
    from pg_policies
    where schemaname = 'public'
    order by tablename;

## Backups e recuperação

- Os projetos têm **backups diários** automáticos; a retenção depende do plano e, no plano gratuito, os backups não podem ser descarregados.
- O **Point in Time Recovery** (PITR) é um add-on que permite voltar a um instante exato, com granularidade de segundos. A documentação recomenda-o para menor perda de dados aceitável e para bases de dados acima de 4 GB.
- Os backups fazem parte da solução, mas o teste é restaurar: tenta uma restauração para um projeto novo antes de precisares dela a sério.
- Para cópias próprias, usa `supabase db dump` ou `pg_dump`.

**NOTA:** os backups da base de dados não incluem os ficheiros do Storage. Planeia uma cópia dos ficheiros importantes à parte.

## Segurança e monitorização

O dashboard tem verificadores: **Security Advisor** e **Performance Advisor** em Database → Advisors apontam tabelas sem RLS, funções inseguras e índices em falta. Corre-os antes de cada lançamento.

Consulta Logs para diagnosticar erros da API, da autenticação e da base de dados. Em Reports vês pedidos, utilizadores ativos e utilização de recursos.

**ATENÇÃO:** a base de dados é um recurso partilhado pela aplicação. Consultas lentas ou sem índice afetam todos os utilizadores; usa `explain analyze` para perceber o plano de uma consulta lenta.

## Ligações à base de dados

Para aplicações servidor com muitas ligações curtas (como serverless), liga-te através do **pooler** (Supavisor) em vez da ligação direta. As cadeias de ligação estão em Project Settings → Database.

**DICA:** antes de lançar, cria um segundo projeto de staging e aplica lá as migrations. Só depois as envias para produção.

**PRATICAR:** faz os exercícios 26 e 27 do módulo 11.

## Ambientes e rotação de segredos

| Prática | Porquê |
|---|---|
| Projetos separados para desenvolvimento, staging e produção | Evita testes em dados reais |
| Variáveis de ambiente por ambiente | Cada ambiente usa as suas próprias chaves |
| Rodar as chaves se houver suspeita de fuga | Uma chave exposta no Git deve considerar-se comprometida |
| Menor privilégio nos acessos da equipa | Só quem precisa tem papel de administrador |
| Restringir o acesso de rede à base de dados quando possível | Reduz a superfície de ataque |

**ATENÇÃO:** apagar uma chave do repositório não a protege: ela fica no histórico do Git. Roda-a sempre que tiver sido exposta.

## Plano de lançamento

1. Corre o Security Advisor e o Performance Advisor e resolve os avisos.
2. Confirma com SQL que não há tabelas sem RLS.
3. Testa as políticas com dois utilizadores reais e com `anon`.
4. Aplica as migrations em staging e valida a aplicação.
5. Confirma Site URL, Redirect URLs e limites de email do Auth.
6. Verifica backups e alertas de utilização.
7. Aplica em produção com `db push` e acompanha os Logs nas primeiras horas.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Consulta vetorial lenta | Falta o índice HNSW ou a dimensão não coincide |
| `pg_cron` não corre | Extensão por ativar ou erro na tarefa; vê `cron.job_run_details` |
| Muitas ligações esgotadas | Aplicação serverless sem pooler |
| Custo ou utilização inesperados | Consultas sem índice, tráfego de Storage ou Realtime |
| Dados expostos após lançamento | Tabela criada depois da última verificação sem RLS |

## Exercícios

1. Corre a consulta de auditoria e corrige qualquer tabela sem RLS.
2. Cria a tabela `documentos` com um índice HNSW e a função de pesquisa.
3. Agenda uma tarefa e consulta o resultado da execução em `cron.job_run_details`.
4. Escreve o teu próprio plano de lançamento de uma aplicação com Supabase.

## Fontes oficiais

- [Extensões](https://supabase.com/docs/guides/database/extensions)
- [Pesquisa vetorial](https://supabase.com/docs/guides/ai)
- [Lista de verificação de produção](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Advisors](https://supabase.com/docs/guides/database/database-advisors)
