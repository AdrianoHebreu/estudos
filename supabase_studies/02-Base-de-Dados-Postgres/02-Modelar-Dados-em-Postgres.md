# 02 Modelar dados em Postgres

## Porquê Postgres

O coração do Supabase é uma base de dados Postgres normal. Tudo o que sabes de SQL aplica-se, e podes ligar-te com qualquer cliente Postgres. Isso significa que os teus dados não ficam presos à plataforma.

## Criar uma tabela

Podes usar o Table Editor ou o SQL Editor. O SQL é mais repetível e pode ser guardado em ficheiros de migration (módulo 09):

    create table public.tarefas (
      id bigint generated always as identity primary key,
      titulo text not null,
      concluida boolean not null default false,
      criada_em timestamptz not null default now()
    );

Pontos a reter:

- `bigint generated always as identity` cria um identificador automático.
- `not null` e `default` protegem a integridade dos dados.
- `timestamptz` guarda datas com fuso horário; é a escolha habitual.

## Tipos de dados úteis

| Tipo | Utilização |
|---|---|
| `text` | Texto de qualquer tamanho |
| `integer`, `bigint` | Números inteiros |
| `numeric` | Valores exatos, como dinheiro |
| `boolean` | Verdadeiro ou falso |
| `timestamptz` | Data e hora com fuso |
| `uuid` | Identificadores únicos; usado nos utilizadores |
| `jsonb` | Documentos JSON pesquisáveis |

## Restrições que protegem os dados

As restrições (constraints) impedem dados inválidos na origem, em vez de dependerem só do código da aplicação:

| Restrição | Exemplo | Efeito |
|---|---|---|
| `not null` | `titulo text not null` | A coluna tem sempre valor |
| `unique` | `unique (projeto_id, titulo)` | Não há duplicados na combinação |
| `check` | `check (char_length(titulo) > 0)` | O valor cumpre uma regra |
| `primary key` | `id bigint primary key` | Identifica cada linha de forma única |
| `references` | `references public.projetos (id)` | A linha referida tem de existir |

Exemplo com uma regra de negócio:

    alter table public.tarefas
      add constraint titulo_nao_vazio check (char_length(trim(titulo)) > 0);

**DICA:** uma regra importante deve existir na base de dados. O código da aplicação pode mudar ou ser contornado; a restrição não.

## Valores fixos com enum

Quando uma coluna só aceita alguns valores, usa um tipo enumerado ou um `check`:

    create type public.estado_tarefa as enum ('por_fazer', 'em_curso', 'feita');

    alter table public.tarefas
      add column estado public.estado_tarefa not null default 'por_fazer';

Um `check` é mais fácil de alterar mais tarde; um enum é mais legível e verifica o tipo. Em equipas que mudam valores com frequência, o `check` com `text` costuma ser mais prático.

## Guardar JSON e listas

    alter table public.tarefas
      add column etiquetas text[] not null default '{}',
      add column extras jsonb not null default '{}';

    -- tarefas com a etiqueta 'urgente'
    select * from public.tarefas where 'urgente' = any (etiquetas);

    -- tarefas cujo extra "prioridade" é "alta"
    select * from public.tarefas where extras->>'prioridade' = 'alta';

Usa `jsonb` para dados realmente variáveis. Se vais filtrar sempre por um campo, é melhor que seja uma coluna normal.

## Alterar o esquema com segurança

    alter table public.tarefas add column notas text;
    alter table public.tarefas rename column notas to descricao;
    alter table public.tarefas drop column descricao;

**ATENÇÃO:** `drop column` e `drop table` apagam dados de forma permanente. Em produção, faz primeiro cópia de segurança e aplica a alteração através de uma migration (módulo 09).

## Atualizar a data de modificação

Um trigger pode manter uma coluna `atualizada_em` sem depender da aplicação:

    alter table public.tarefas
      add column atualizada_em timestamptz not null default now();

    create function public.definir_atualizada_em()
    returns trigger
    language plpgsql
    set search_path = ''
    as $$
    begin
      new.atualizada_em = now();
      return new;
    end;
    $$;

    create trigger tarefas_atualizada_em
      before update on public.tarefas
      for each row execute function public.definir_atualizada_em();

## Relações entre tabelas

Uma chave estrangeira liga linhas de tabelas diferentes:

    create table public.projetos (
      id bigint generated always as identity primary key,
      nome text not null
    );

    alter table public.tarefas
      add column projeto_id bigint references public.projetos (id) on delete cascade;

`on delete cascade` apaga as tarefas quando o projeto é apagado. Escolhe o comportamento de propósito: `restrict` impede a remoção, `set null` mantém a linha sem ligação.

## Dados de exemplo para o projeto fio condutor

Depois de criares `projetos` e `tarefas`, insere dados sem dono. Os utilizadores só existem a partir do módulo 03, por isso a coluna `user_id` da secção seguinte é opcional por agora:

    insert into public.projetos (nome) values ('Casa'), ('Trabalho');

    insert into public.tarefas (titulo, projeto_id)
    select 'Comprar pão', id from public.projetos where nome = 'Casa';

Quando o módulo 03 estiver feito, atribui estas linhas a um utilizador e só então torna a coluna obrigatória.

## Associar linhas a utilizadores

Os utilizadores vivem na tabela `auth.users`. Para ligar dados a um utilizador, guarda o respetivo `uuid`:

    alter table public.tarefas
      add column user_id uuid default auth.uid()
      references auth.users (id) on delete cascade;

`auth.uid()` devolve o identificador de quem faz o pedido. Usá-lo como valor por omissão preenche a coluna automaticamente.

## Consultar e alterar dados

    insert into public.tarefas (titulo) values ('Estudar Supabase');
    select id, titulo from public.tarefas where concluida = false order by criada_em;
    update public.tarefas set concluida = true where id = 1;
    delete from public.tarefas where id = 1;

**ATENÇÃO:** um `update` ou `delete` sem `where` afeta todas as linhas. Confirma sempre a condição antes de executar.

## Índices e vistas

Cria um índice nas colunas usadas para filtrar muitas vezes:

    create index tarefas_user_id_idx on public.tarefas (user_id);

Uma vista guarda uma consulta com nome:

    create view public.tarefas_abertas as
      select * from public.tarefas where concluida = false;

**DICA:** o Table Editor permite criar tabelas e colunas com cliques, mas o SQL Editor mostra exatamente o que acontece. Prefere SQL assim que ganhares confiança.

**PRATICAR:** faz os exercícios 4 a 7 do módulo 11.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `violates foreign key constraint` | A linha referida não existe ou foi apagada |
| `null value in column ... violates not-null` | Faltou um valor obrigatório no `insert` |
| `relation "x" does not exist` | Nome errado ou esquema em falta (`public.`) |
| `permission denied for table` | A role do pedido não tem direitos na tabela |
| Colunas em maiúsculas dão erro | Nomes com maiúsculas exigem aspas; prefere `snake_case` |

**NOTA:** usa nomes em minúsculas e `snake_case` para tabelas e colunas. Evita aspas obrigatórias e simplifica as chamadas da API.

## Exercícios

1. Acrescenta a `tarefas` uma restrição que impeça títulos vazios e testa com um `insert` inválido.
2. Cria o enum `estado_tarefa` e uma tarefa em cada estado.
3. Cria a coluna `etiquetas` e lista as tarefas com uma etiqueta à tua escolha.
4. Cria o trigger de `atualizada_em`, altera uma tarefa e confirma que a data mudou.

## Fontes oficiais

- [Tabelas e dados](https://supabase.com/docs/guides/database/tables)
- [Chaves estrangeiras e relações](https://supabase.com/docs/guides/database/tables#foreign-keys)
- [Visão geral da base de dados](https://supabase.com/docs/guides/database/overview)
- [Documentação do Postgres](https://www.postgresql.org/docs/current/)
