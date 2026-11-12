# 13 Soluções

Estas respostas são orientadoras. Tenta resolver cada exercício antes de as consultares; há várias soluções válidas.

## Nível inicial

1. O URL tem a forma `https://<ref>.supabase.co` e está em Project Settings, na secção API. A região deve ser a mais próxima dos utilizadores.
2. A chave publicável pode estar no browser porque só funciona dentro do RLS. A chave secreta ignora o RLS e só pode ficar em servidores ou Edge Functions.
3. Cria `.env.local` com `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` e acrescenta `.env.local` ao `.gitignore`.
4. Solução:

        create table public.tarefas (
          id bigint generated always as identity primary key,
          titulo text not null,
          concluida boolean not null default false,
          criada_em timestamptz not null default now()
        );

5. Solução:

        insert into public.tarefas (titulo) values ('A'), ('B'), ('C');
        select * from public.tarefas where concluida = false order by criada_em desc;

6. Solução:

        create table public.projetos (
          id bigint generated always as identity primary key,
          nome text not null
        );
        alter table public.tarefas
          add column projeto_id bigint references public.projetos (id) on delete cascade;

7. Apaga todas as linhas. Protege-te com `where`, corre primeiro um `select` com a mesma condição e, em produção, confirma que há backup.

## Autenticação e segurança

8. Usa `supabase.auth.signUp` duas vezes. Confirma os emails ou, em estudo, desliga a confirmação em Authentication.
9. Solução:

        await supabase.auth.signInWithPassword({ email, password })
        const { data: { user } } = await supabase.auth.getUser()
        console.log(user.email)
        await supabase.auth.signOut()

10. Usa a função `private.criar_perfil` com `security definer set search_path = ''` (num esquema não exposto) e o trigger `after insert on auth.users`, como no módulo 03.
11. Depois de `alter table public.tarefas enable row level security;`, um `select` pela API devolve `[]`, porque nenhuma política o permite.
12. Solução: quatro políticas (select, insert, update, delete), todas `to authenticated`, com `(select auth.uid()) = user_id`. O `insert` usa `with check`, o `delete` e o `select` usam `using`, e o `update` usa ambos.
13. Entra com A, cria uma tarefa; entra com B e faz `select`: não vê a de A. Um `update` sobre o `id` de A afeta zero linhas.
14. Um `update` que mude `user_id` para o identificador de outro utilizador: `using` permite-o porque a linha era tua, mas `with check` falha porque a linha final já não é tua.

## API e cliente

15. Solução:

        await supabase.from('tarefas')
          .select('id, titulo')
          .eq('concluida', false)
          .order('criada_em', { ascending: false })
          .limit(10)

16. `await supabase.from('tarefas').insert({ titulo: 'X' }).select()` devolve a linha criada.
17. `await supabase.from('projetos').select('nome, tarefas ( id, titulo )')`.
18. Solução:

        create function public.contar_abertas()
        returns bigint language sql security invoker
        as $$ select count(*) from public.tarefas where concluida = false $$;

    Chama com `await supabase.rpc('contar_abertas')`.

## Storage, Realtime e Edge Functions

19. Cria o bucket no dashboard com acesso privado e usa `upload(`${user.id}/foto.png`, ficheiro)`.
20. Políticas de `select` e `insert` em `storage.objects` com `bucket_id = 'avatares'` e `(storage.foldername(name))[1] = (select auth.uid())::text`. Para o URL: `createSignedUrl(caminho, 60)`.
21. `alter publication supabase_realtime add table public.tarefas;` e depois um canal com `postgres_changes` e `event: 'INSERT'`. O utilizador B não recebe eventos de A porque o RLS de `select` filtra-os.
22. Cria com `supabase functions new ola`, devolve JSON com a saudação e chama com `supabase.functions.invoke('ola', { body: { nome } })`.
23. `supabase secrets set MINHA_CHAVE=valor` e `Deno.env.get('MINHA_CHAVE')` dentro da função. Não incluas o valor na resposta.

## CLI, produção e exercício final

24. `supabase init`, `supabase start`. O Studio local costuma estar em `http://127.0.0.1:54323`; a CLI imprime os URLs exatos.
25. `supabase migration new criar_tarefas`, escreve o SQL, `supabase db reset` para testar e `supabase link` seguido de `supabase db push` para enviar.
26. Em Database → Advisors, abre o Security Advisor e, para cada tabela assinalada, ativa o RLS e cria as políticas necessárias.
27. Solução:

        select cron.schedule('limpar-concluidas', '0 3 * * *',
          $$ delete from public.tarefas where concluida and criada_em < now() - interval '90 days' $$);

28. Critérios de sucesso: login funcional, RLS testado com dois utilizadores, ficheiros num bucket privado com políticas por pasta, lista atualizada por Realtime e todo o esquema reproduzível a partir das migrations com `db reset`.

## Desafios adicionais

29. Solução:

        alter table public.tarefas
          add constraint titulo_nao_vazio check (char_length(trim(titulo)) > 0);

    Prova: `insert into public.tarefas (titulo) values ('   ');` deve falhar. Depois de criar a coluna `atualizada_em` e o trigger `before update`, um `update` deve alterar a data.

30. Pedido: `supabase.auth.resetPasswordForEmail(email, { redirectTo })`. Na página de destino, depois de o utilizador chegar pelo link, chama `supabase.auth.updateUser({ password: nova })`. Confirma o `redirectTo` nos Redirect URLs.

31. Solução:

        create view public.tarefas_abertas with (security_invoker = true) as
          select * from public.tarefas where concluida = false;

    Com dois utilizadores (e `set local role`), cada um vê só as suas tarefas na vista. Sem `security_invoker`, a vista pode devolver linhas de todos.

32. Solução:

        const { data, count } = await supabase
          .from('tarefas')
          .select('id, titulo', { count: 'exact' })
          .range(0, 9)

        const { data: projetos } = await supabase
          .from('projetos')
          .select('nome, tarefas!inner ( id )')
          .eq('tarefas.concluida', false)

33. Fluxo: `upload` para `anexos/<user.id>/<nome>`, depois `insert` em `anexos` com o caminho. Para apagar: `remove([caminho])` e `delete` da linha. Se removeres só a linha, o ficheiro fica órfão no Storage.

34. A consulta `select tablename, rowsecurity from pg_tables where schemaname = 'public'` deve mostrar `true` em todas as linhas depois da correção. Regista as tabelas que estavam a `false` antes e as políticas criadas para cada uma.

35. Solução resumida:

        create extension if not exists vector with schema extensions;

        create table public.documentos (
          id bigint generated always as identity primary key,
          conteudo text,
          embedding extensions.vector(1536)
        );

        create index on public.documentos using hnsw (embedding vector_cosine_ops);

    A função `procurar_documentos` ordena por `embedding <=> consulta` e é chamada com `supabase.rpc`. A dimensão do vetor tem de coincidir com a do modelo de embeddings.

## Rubrica do projeto final (exercício 28)

| Critério | Evidência esperada |
|---|---|
| Autenticação | Registo, login, logout e recuperação de palavra-passe |
| Segurança | RLS em todas as tabelas, testado com dois utilizadores e `anon` |
| Dados | Esquema com restrições, chaves estrangeiras e índices |
| Ficheiros | Bucket privado com políticas por pasta e URLs assinados |
| Tempo real | Lista atualizada sem recarregar a página |
| Lógica de servidor | Pelo menos uma Edge Function com segredo |
| Reprodutibilidade | `supabase db reset` recria tudo a partir das migrations |
| Lançamento | Auditoria de RLS e plano de publicação documentados |

## Fontes oficiais

- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Referência JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Referência da CLI](https://supabase.com/docs/reference/cli/introduction)
