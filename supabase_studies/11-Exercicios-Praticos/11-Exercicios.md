# 11 Exercícios práticos

Os exercícios 1 a 28 seguem a ordem do curso e os 29 a 35 são desafios adicionais. Resolve-os por ordem, num projeto Supabase de estudo. Não uses dados reais nem chaves de produção. O módulo 13 contém respostas orientadoras.

## Nível inicial

1. **Criar o projeto.** Cria um projeto e indica a região escolhida e onde encontras o URL.
2. **Distinguir as chaves.** Explica a diferença entre a chave publicável e a chave secreta e onde cada uma pode ser usada.
3. **Proteger a configuração.** Cria um ficheiro `.env.local` com o URL e a chave publicável e garante que não é versionado.
4. **Criar uma tabela.** Cria a tabela `tarefas` com `id`, `titulo`, `concluida` e `criada_em`.
5. **Inserir e consultar.** Insere três tarefas por SQL e lista apenas as não concluídas, da mais recente para a mais antiga.
6. **Relacionar tabelas.** Cria a tabela `projetos` e liga `tarefas` a ela com uma chave estrangeira com `on delete cascade`.
7. **Evitar um desastre.** Explica o que acontece com `delete from tarefas;` sem `where` e como te protegerias.

## Autenticação e segurança

8. **Registar utilizadores.** Cria dois utilizadores com `signUp` e confirma-os no dashboard.
9. **Iniciar sessão.** Escreve um fragmento que faça login, mostre o email e termine a sessão.
10. **Criar perfis automáticos.** Cria a tabela `perfis` e o trigger que a preenche quando um utilizador é criado.
11. **Ativar o RLS.** Ativa o RLS em `tarefas` e confirma que a API devolve uma lista vazia sem políticas.
12. **Políticas por dono.** Escreve as quatro políticas para que cada utilizador só trabalhe nas suas tarefas.
13. **Testar com dois utilizadores.** Com o utilizador A e o utilizador B, confirma que A não vê nem altera as tarefas de B.
14. **Explicar using e with check.** Dá um exemplo de uma alteração que `with check` bloqueia mas `using` permite.

## API e cliente

15. **Ler com filtros.** Obtém as 10 tarefas mais recentes ainda abertas, apenas com `id` e `titulo`.
16. **Escrever dados.** Insere uma tarefa e devolve a linha criada numa só chamada.
17. **Pedir relações.** Obtém projetos com as respetivas tarefas numa única chamada.
18. **Criar uma função RPC.** Cria a função `contar_abertas` e chama-a com `rpc`.

## Storage, Realtime e Edge Functions

19. **Bucket privado.** Cria o bucket `avatares` e faz upload para a pasta do utilizador.
20. **Políticas de Storage.** Escreve as políticas que permitem a cada utilizador ler e enviar apenas na sua pasta e gera um URL assinado.
21. **Ouvir alterações.** Ativa o Realtime em `tarefas` e mostra na consola cada `INSERT`. Confirma que o utilizador B não recebe eventos de A.
22. **Primeira função.** Cria uma Edge Function que devolve uma saudação e chama-a com `functions.invoke`.
23. **Usar um segredo.** Guarda um segredo com `secrets set` e lê-o na função sem o devolver na resposta.

## CLI, produção e exercício final

24. **Stack local.** Inicia o Supabase localmente, abre o Studio local e anota os URLs.
25. **Migration.** Cria uma migration para a tabela `tarefas`, aplica-a com `db reset` e envia-a para o projeto com `db push`.
26. **Lista de produção.** Corre o Security Advisor e corrige todos os avisos de tabelas sem RLS.
27. **Agendar uma limpeza.** Usa `pg_cron` para apagar diariamente as tarefas concluídas há mais de 90 dias.
28. **Final de ponta a ponta.** Constrói uma lista de tarefas com login, RLS, anexos de ficheiros e atualização em tempo real. Mantém o esquema em migrations.

## Desafios adicionais

29. **Regras e datas.** Acrescenta a `tarefas` uma restrição de título não vazio e o trigger de `atualizada_em`. Prova que ambos funcionam (módulo 02).
30. **Recuperar a palavra-passe.** Implementa o pedido de recuperação e a página que define a nova palavra-passe (módulo 03).
31. **Vista segura.** Cria `tarefas_abertas` com `security_invoker = true` e prova com dois utilizadores que respeita o RLS (módulo 04).
32. **Paginação e relações.** Pagina as tarefas com contagem total e devolve só os projetos que têm tarefas abertas (módulo 05).
33. **Anexos completos.** Cria a tabela `anexos`, liga cada ficheiro a uma tarefa e garante que apagar o anexo apaga o ficheiro e a linha (módulo 06).
34. **Auditoria de segurança.** Corre as consultas de auditoria de RLS e escreve o resultado antes e depois das correções (módulo 10).
35. **Pesquisa por semelhança.** Cria a tabela `documentos` com embeddings, um índice HNSW e uma função `procurar_documentos` chamada por `rpc` (módulo 10).

## Mapa dos exercícios

| Exercícios | Módulo de apoio |
|---|---|
| 1 a 3 | 01 Projeto e Dashboard |
| 4 a 7, 29 | 02 Base de dados Postgres |
| 8 a 10, 30 | 03 Autenticação |
| 11 a 14, 31 | 04 Row Level Security |
| 15 a 18, 32 | 05 API e cliente JavaScript |
| 19, 20, 33 | 06 Storage |
| 21 | 07 Realtime |
| 22, 23 | 08 Edge Functions |
| 24, 25 | 09 CLI e desenvolvimento local |
| 26, 27, 34, 35 | 10 Extensões e produção |
| 28 | Projeto final, todos os módulos |

## Folha de registo

Para cada tentativa, regista:

| Campo | O que anotar |
|---|---|
| Exercício | Número e título |
| Ambiente | Local ou remoto |
| Resultado | O que fizeste e o que viste |
| Verificação | Como confirmaste (consulta, resposta da API, registo) |
| Dúvidas | O que ficou por perceber |

## Fontes oficiais

- [Documentação do Supabase](https://supabase.com/docs)
- [Referência JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Referência da CLI](https://supabase.com/docs/reference/cli/introduction)
