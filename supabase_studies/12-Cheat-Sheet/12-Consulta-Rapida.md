# 12 Consulta rápida

## Cliente JavaScript

| Tarefa | Código |
|---|---|
| Criar cliente | `createClient(url, chave)` |
| Ler | `supabase.from('t').select('a, b')` |
| Inserir | `supabase.from('t').insert({ a: 1 }).select()` |
| Atualizar | `supabase.from('t').update({ a: 2 }).eq('id', 1)` |
| Apagar | `supabase.from('t').delete().eq('id', 1)` |
| Upsert | `supabase.from('t').upsert({ id: 1, a: 3 })` |
| Uma linha | `.single()` |
| Função SQL | `supabase.rpc('nome', { arg: 1 })` |

## Filtros

| Filtro | Significado |
|---|---|
| `.eq(c, v)` | Igual |
| `.neq(c, v)` | Diferente |
| `.gt`, `.gte`, `.lt`, `.lte` | Comparações |
| `.like`, `.ilike` | Padrão de texto |
| `.in(c, [..])` | Pertence a uma lista |
| `.is(c, null)` | É nulo |
| `.order(c, { ascending: false })` | Ordenar |
| `.limit(n)`, `.range(a, b)` | Limitar e paginar |

## Autenticação

| Tarefa | Código |
|---|---|
| Registar | `supabase.auth.signUp({ email, password })` |
| Login | `supabase.auth.signInWithPassword({ email, password })` |
| Magic link | `supabase.auth.signInWithOtp({ email })` |
| OAuth | `supabase.auth.signInWithOAuth({ provider })` |
| Utilizador atual | `supabase.auth.getUser()` |
| Terminar sessão | `supabase.auth.signOut()` |
| Ouvir mudanças | `supabase.auth.onAuthStateChange(fn)` |

## Storage e funções

| Tarefa | Código |
|---|---|
| Upload | `supabase.storage.from('b').upload(caminho, ficheiro)` |
| Download | `supabase.storage.from('b').download(caminho)` |
| URL público | `getPublicUrl(caminho)` |
| URL assinado | `createSignedUrl(caminho, segundos)` |
| Chamar função | `supabase.functions.invoke('nome', { body })` |

## SQL e RLS

    alter table public.t enable row level security;

    create policy "nome" on public.t
      for select to authenticated
      using ( (select auth.uid()) = user_id );

| Cláusula | Uso |
|---|---|
| `using` | Linhas existentes: select, update, delete |
| `with check` | Linhas novas ou alteradas: insert, update |
| `to authenticated` | Só utilizadores com sessão |
| `to anon` | Pedidos sem sessão |

## Padrões de RLS

| Necessidade | Política |
|---|---|
| Só o dono | `using ( (select auth.uid()) = user_id )` |
| Leitura pública, escrita do dono | `select` para `anon, authenticated` com `true`; escrita com o teste do dono |
| Membros de uma equipa | `using ( equipa_id in (select equipa_id from membros where user_id = (select auth.uid())) )` |
| Herdar do registo pai | `exists (select 1 from pais p where p.id = filhos.pai_id and p.user_id = (select auth.uid()))` |
| Só utilizadores com sessão | `to authenticated` |

Testar como utilizador no SQL Editor:

    begin;
      set local role authenticated;
      set local request.jwt.claims = '{"sub": "<uuid>"}';
      select * from public.tarefas;
    rollback;

## Realtime e Storage em resumo

| Tarefa | Código |
|---|---|
| Ativar tabela no Realtime | `alter publication supabase_realtime add table public.t;` |
| Ouvir alterações | `.channel('c').on('postgres_changes', { event: '*', schema: 'public', table: 't' }, fn).subscribe()` |
| Fechar canal | `supabase.removeChannel(canal)` |
| Broadcast | `canal.send({ type: 'broadcast', event: 'e', payload })` |
| Presence | `canal.track({ ... })` e `canal.presenceState()` |
| Política de pasta própria | `(storage.foldername(name))[1] = (select auth.uid())::text` |
| Remover ficheiro | `supabase.storage.from('b').remove([caminho])` |

## Erros frequentes

| Mensagem ou sintoma | Verifica |
|---|---|
| `[]` sem erro | Políticas de `select` e sessão do utilizador |
| `42501` ou `violates row-level security` | `with check` e `to authenticated` |
| `23505` | Valor duplicado em coluna `unique` |
| `23503` | Chave estrangeira a apontar para linha inexistente |
| `Invalid API key` | Chave e URL do mesmo projeto |
| `Email not confirmed` | Confirmação de email |
| `401 Invalid JWT` numa função | Cabeçalho `Authorization` |
| Erro de CORS | Resposta ao `OPTIONS` |

## Comandos da CLI

| Comando | Efeito |
|---|---|
| `supabase init` | Cria a pasta `supabase/` |
| `supabase start` / `stop` | Liga e desliga a stack local |
| `supabase migration new nome` | Cria um ficheiro de migration |
| `supabase db reset` | Recria a base local com migrations e seed |
| `supabase db diff -f nome` | Gera migration com as diferenças |
| `supabase login` | Autentica a CLI |
| `supabase link --project-ref ref` | Liga a pasta a um projeto |
| `supabase db push` | Aplica migrations ao remoto |
| `supabase db pull` | Traz o esquema remoto |
| `supabase gen types typescript` | Gera tipos TypeScript |
| `supabase functions new nome` | Cria uma Edge Function |
| `supabase functions serve` | Corre as funções localmente |
| `supabase functions deploy nome` | Publica uma função |
| `supabase secrets set K=V` | Guarda um segredo |

## Que mecanismo escolher

| Necessidade | Escolha |
|---|---|
| Guardar dados estruturados | Tabelas Postgres |
| Quem pode ver o quê | RLS |
| Segredos e integrações externas | Edge Function |
| Ficheiros | Storage |
| Lista sempre atualizada | Realtime Postgres Changes |
| Quem está online | Presence |
| Tarefa recorrente na base | `pg_cron` |

## Regras de ouro

1. Ativa o RLS em todas as tabelas do esquema `public` e escreve as políticas logo a seguir.
2. A chave secreta fica só em servidores e nunca no Git.
3. Prefere `(select auth.uid())` e indexa as colunas usadas nas políticas.
4. Valida no servidor com `getUser()`, não com `getSession()`.
5. Não uses `user_metadata` para permissões.
6. Alterações de esquema vão sempre em migrations versionadas.
7. Testa as políticas com utilizadores reais e com `anon`, nunca só no SQL Editor.
8. Antes de lançar, corre os Advisors e testa uma restauração de backup.

## Lista de verificação rápida de lançamento

| Item | Feito |
|---|---|
| RLS ativo e testado em todas as tabelas | ☐ |
| Chaves secretas fora do código | ☐ |
| Site URL e Redirect URLs corretos | ☐ |
| Migrations aplicadas em staging primeiro | ☐ |
| Backups e alertas verificados | ☐ |
| Advisors sem avisos críticos | ☐ |

## Fontes oficiais

- [Documentação do Supabase](https://supabase.com/docs)
- [Referência JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Referência da CLI](https://supabase.com/docs/reference/cli/introduction)
