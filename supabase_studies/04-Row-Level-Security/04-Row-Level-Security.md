# 04 Row Level Security

## O problema

A chave publicável está no browser, logo qualquer pessoa a pode usar para pedir dados à API. O que impede um utilizador de ler as tarefas de outro não é a chave: é o **Row Level Security (RLS)**, um mecanismo do Postgres que filtra linhas conforme regras definidas por ti.

## Ativar o RLS

    alter table public.tarefas enable row level security;

Com o RLS ativo e **sem políticas**, ninguém (exceto as roles que o ignoram) consegue ler ou escrever na tabela. Isto é seguro por omissão: tens de permitir explicitamente cada acesso.

**ATENÇÃO:** tabelas criadas pelo SQL sem `enable row level security` ficam abertas a quem tiver a chave publicável. O Table Editor oferece a opção de ativar o RLS ao criar a tabela, mas a documentação manda ativá-lo explicitamente em cada tabela: confirma sempre.

## Como o Postgres decide

Para cada pedido, o Postgres junta três coisas: a **role** de quem pede (`anon` ou `authenticated`), a **operação** (`select`, `insert`, `update`, `delete`) e as **políticas** da tabela que se aplicam a essa role e operação.

- Se houver várias políticas permissivas para a mesma operação, basta **uma** deixar passar a linha.
- Se não houver nenhuma política aplicável, a operação é negada.
- Uma linha só é devolvida ou alterada se a condição for verdadeira para ela.

**NOTA:** para o `update` e o `delete` afetarem uma linha, o utilizador também precisa de poder **ver** essa linha, ou seja, de uma política de `select` que a inclua. Sem ela, a operação afeta zero linhas, sem erro.

## Escrever políticas

Uma política indica quem (`to`), para que operação (`for`) e sob que condição:

    create policy "Ver as próprias tarefas"
    on public.tarefas for select
    to authenticated
    using ( (select auth.uid()) = user_id );

    create policy "Criar tarefas próprias"
    on public.tarefas for insert
    to authenticated
    with check ( (select auth.uid()) = user_id );

    create policy "Alterar as próprias tarefas"
    on public.tarefas for update
    to authenticated
    using ( (select auth.uid()) = user_id )
    with check ( (select auth.uid()) = user_id );

    create policy "Apagar as próprias tarefas"
    on public.tarefas for delete
    to authenticated
    using ( (select auth.uid()) = user_id );

## using e with check

| Cláusula | Quando se aplica | Pergunta |
|---|---|---|
| `using` | Linhas já existentes (select, update, delete) | Posso ver ou tocar nesta linha? |
| `with check` | Linhas novas ou alteradas (insert, update) | Posso gravar esta linha assim? |

No `update`, `using` escolhe as linhas que podes alterar e `with check` valida o resultado, evitando que passes uma linha tua para outro utilizador.

## Roles do Supabase

| Role | Quem é |
|---|---|
| `anon` | Pedido sem sessão, apenas com a chave publicável |
| `authenticated` | Pedido com um utilizador autenticado |
| `service_role` | Chave secreta; ignora o RLS |

Usa `to authenticated` nas políticas que exigem login. Uma política sem `to` aplica-se a todas as roles, incluindo `anon`.

**NOTA:** a chave secreta (role `service_role`) ignora o RLS quando o pedido não leva token de utilizador. Se o pedido levar o token de um utilizador, o RLS aplica-se a esse utilizador. Mesmo assim, nunca a uses no browser.

## Dados públicos e partilhados

Leitura aberta a todos e escrita só do dono:

    create policy "Leitura pública"
    on public.artigos for select
    to anon, authenticated
    using ( true );

Partilha por equipa, com uma tabela de membros:

    create policy "Membros veem a equipa"
    on public.documentos for select
    to authenticated
    using (
      equipa_id in (
        select equipa_id from public.membros
        where user_id = (select auth.uid())
      )
    );

## Aplicar ao projeto fio condutor

No módulo 02 criaste `projetos` e `tarefas`. Vamos permitir que cada utilizador gira os seus projetos e as tarefas desses projetos.

    alter table public.projetos add column user_id uuid not null default auth.uid()
      references auth.users (id) on delete cascade;

    alter table public.projetos enable row level security;

    create policy "Gerir os próprios projetos"
    on public.projetos for all
    to authenticated
    using ( (select auth.uid()) = user_id )
    with check ( (select auth.uid()) = user_id );

`for all` junta as quatro operações numa só política. É mais curto, mas menos explícito; para tabelas sensíveis, prefere políticas separadas.

As tarefas herdam o acesso do projeto a que pertencem. Se criaste as quatro políticas por `user_id` na secção anterior, apaga-as com `drop policy "nome" on public.tarefas;` antes: políticas permissivas somam-se, e as antigas continuariam a valer.

    create policy "Gerir tarefas dos próprios projetos"
    on public.tarefas for all
    to authenticated
    using (
      exists (
        select 1 from public.projetos p
        where p.id = tarefas.projeto_id and p.user_id = (select auth.uid())
      )
    )
    with check (
      exists (
        select 1 from public.projetos p
        where p.id = tarefas.projeto_id and p.user_id = (select auth.uid())
      )
    );

**ATENÇÃO:** se já tens linhas sem dono dos exercícios do módulo 02, atribui-lhes um `user_id` antes de tornares a coluna obrigatória, ou ficam inacessíveis.

## Testar políticas no SQL Editor

O SQL Editor corre como `postgres` e ignora o RLS. Para simular um utilizador, muda de role dentro de uma transação:

    begin;
      set local role authenticated;
      set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001"}';

      select * from public.tarefas;   -- só as tarefas desse utilizador
    rollback;

Substitui o `sub` por um identificador real, visível em Authentication → Users. Para testar o acesso sem sessão usa `set local role anon;`.

**DICA:** o `rollback` desfaz tudo, por isso podes tentar `insert` e `update` à vontade sem deixar lixo na base de dados.

## Armadilhas frequentes

| Armadilha | O que acontece | Solução |
|---|---|---|
| Vista sem cuidado | A vista corre com os direitos do criador e pode ignorar o RLS | `create view ... with (security_invoker = true)` |
| Função `security definer` | Corre com os direitos do criador e ignora o RLS; no esquema `public` fica chamável pela API | Cria-a num esquema não exposto (`private`), com `search_path = ''` |
| Política que lê a própria tabela | Pode causar recursão infinita | Usa uma função auxiliar `security definer` |
| `using ( true )` em escrita | Qualquer pessoa altera tudo | Limita sempre escrita ao dono |
| Esquecer `to authenticated` | A política também vale para `anon` | Indica sempre a role |
| Tabela nova sem RLS | Fica exposta pela API | Ativa o RLS no mesmo script de criação |

## Função auxiliar para evitar recursão

Quando uma política precisa de consultar uma tabela que também tem RLS, uma função pode fazer essa consulta sem voltar a aplicar as políticas:

    create schema if not exists private;
    grant usage on schema private to authenticated;

    create function private.e_membro(id_equipa bigint)
    returns boolean
    language sql
    security definer
    set search_path = ''
    stable
    as $$
      select exists (
        select 1 from public.membros
        where equipa_id = id_equipa and user_id = (select auth.uid())
      );
    $$;

    create policy "Membros veem os documentos"
    on public.documentos for select
    to authenticated
    using ( private.e_membro(equipa_id) );

Estas funções ficam num esquema **não exposto** pela API (aqui `private`): a documentação desaconselha `security definer` em esquemas expostos, porque a Data API as pode chamar com os direitos do criador. Nunca as deixes devolver dados que o utilizador não deveria ver.

## Desempenho e boas práticas

- Escreve `(select auth.uid())` em vez de `auth.uid()` direto: o Postgres calcula-o uma vez por consulta e não por linha.
- Cria índices nas colunas usadas nas políticas, como `user_id`.
- Indica sempre `to` para limitar a role.
- Testa com utilizadores reais e com o papel `anon`; o SQL Editor corre como `postgres` e ignora o RLS, por isso engana.

**DICA:** na API, um `select` bloqueado pelo RLS devolve uma lista vazia, não um erro. Se a aplicação "não vê dados", suspeita das políticas.

**PRATICAR:** faz os exercícios 11 a 14 do módulo 11.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `new row violates row-level security policy` | `with check` falhou: o `user_id` não é o do utilizador |
| `select` devolve `[]` | Nenhuma política de `select` aplicável ao pedido |
| `update` não altera nada | Falta política de `select` ou a condição `using` não coincide |
| Funciona no SQL Editor, falha na app | O editor ignora o RLS; testa com `set local role` |
| Funciona com a chave secreta, falha com a publicável | A chave secreta ignora o RLS; o problema está nas políticas |

## Exercícios

1. Cria as políticas de `projetos` e `tarefas` descritas acima.
2. Usa `set local role authenticated` para simular dois utilizadores e compara o que cada um vê.
3. Cria uma vista de tarefas abertas com `security_invoker = true` e confirma que respeita o RLS.
4. Explica por que razão `using ( true )` numa política de `update` é perigoso.

## Fontes oficiais

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Segurança da base de dados](https://supabase.com/docs/guides/database/secure-data)
- [Documentação de RLS no Postgres](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
