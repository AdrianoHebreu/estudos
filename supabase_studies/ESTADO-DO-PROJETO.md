# Estado do projeto — Mini-Curso de Supabase

**Ler este ficheiro primeiro ao retomar o trabalho.** Diz onde ficámos e o que fazer a seguir.

## Resumo

- Pasta: `C:\temp\Sites\supabase_studies`
- Modelo seguido: `C:\temp\Sites\codex_studies` (aula `.md` + `.docx` + `.pptx` por módulo).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados** — nunca editar à mão.
- O utilizador autorizou fazer **duas etapas de cada vez** (quatro módulos) a partir da etapa 4.
- Todos os 14 módulos (00–13) existem numa **primeira versão curta** (rascunho que já gera Word e PowerPoint). O trabalho por etapas consiste em **aprofundar** cada módulo: mais explicações, exemplos, problemas comuns, avisos e exercícios.

## Etapas (dois módulos de cada vez)

**Estado global: curso completo (todas as 7 etapas concluídas).** **Validação contra a documentação oficial feita em 2026-10-08** (ver registo). Trabalho futuro possível: ver os Word e PowerPoint e ajustar o aspeto; revalidar periodicamente (as chaves antigas anon/service_role vão ser descontinuadas até ao fim de 2026).

| Etapa | Módulos | Estado |
|---|---|---|
| 1 | 00 Introdução + 01 Projeto e Dashboard | **Concluída** (2026-10-08) |
| 2 | 02 Base de dados Postgres + 03 Autenticação | **Concluída** (2026-10-08) |
| 3 | 04 Row Level Security + 05 API e cliente JavaScript | **Concluída** (2026-10-08) |
| 4 | 06 Storage + 07 Realtime | **Concluída** (2026-10-08) |
| 5 | 08 Edge Functions + 09 CLI e desenvolvimento local | **Concluída** (2026-10-08) |
| 6 | 10 Extensões e produção + 11 Exercícios práticos | **Concluída** (2026-10-08) |
| 7 | 12 Cheat sheet + 13 Gabarito + revisão final e README | **Concluída** (2026-10-08) |

## Como executar uma etapa

1. Editar os `.md` dos dois módulos (em cada pasta, o único `.md` que não é README).
2. Regenerar só esses módulos: `python tools/build_course_artifacts.py --only 02,03`
3. Atualizar esta tabela e a secção «Registo».
4. Parar e esperar pelo pedido do utilizador para a etapa seguinte.

Usar `export PYTHONIOENCODING=utf-8` antes de correr o gerador. Apagar `tools/__pycache__` no fim.

## Regras de conteúdo

- Português europeu, forma «tu».
- Cada aula termina com `## Fontes oficiais` (links `supabase.com/docs`).
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código em blocos indentados com 4 espaços; tabelas Markdown para comparações.
- Se mexer na numeração de exercícios (módulo 11), atualizar as referências «PRATICAR» das aulas e o módulo 13.
- O projeto fio condutor é uma aplicação de **tarefas partilhadas** (ver módulo 00).
- No fim de cada etapa não deixar processos a correr.

## Registo

- **2026-10-08 — rascunho inicial:** 14 módulos criados, gerador copiado de `codex_studies/tools` e adaptado, README criado.
- **2026-10-08 — etapa 1:** módulo 00 ganhou «Porquê Postgres», «Como as peças se ligam», projeto fio condutor, glossário e «Como estudar»; módulo 01 ganhou organizações e projetos, ligação direta à base de dados, primeira tabela pelo Table Editor e problemas comuns.
- **2026-10-08 — etapa 2:** módulo 02 ganhou restrições, enum, JSON e arrays, alterar esquema, trigger de `atualizada_em`, dados de exemplo, problemas comuns e exercícios; módulo 03 ganhou confirmação de email e recuperação de palavra-passe, sessões e tokens, formulário de login, metadados (`user_metadata` vs `app_metadata`), segurança, administração por servidor, problemas comuns e exercícios.
- **2026-10-08 — correção na etapa 2:** no módulo 02 os dados de exemplo passaram a vir depois de criar `projetos`, e `user_id` ficou opcional até ao módulo 03.
- **2026-10-08 — etapa 3:** módulo 04 ganhou «Como o Postgres decide», aplicação ao projeto fio condutor (políticas de `projetos` e `tarefas`), testes com `set local role`, armadilhas (vistas, `security definer`, recursão), função auxiliar, problemas comuns e exercícios; módulo 05 ganhou tratamento de erros, contagem e paginação (limite de 1000 linhas), filtros avançados, `!inner`, inserção em lote e upsert, exemplo de lista, problemas comuns e exercícios.
- **2026-10-08 — etapas 4 e 5 (feitas juntas):** 06 Storage (limites e tipos, uploads grandes e assinados, anexos ligados às tarefas, transformação de imagens, problemas e exercícios); 07 Realtime (funcionamento, filtros, sincronização da interface, canais privados com `realtime.messages`, limites, problemas e exercícios); 08 Edge Functions (quando usar, organização, exemplo de email, chamada a partir da base de dados com `pg_net`, limites, logs, problemas e exercícios); 09 CLI (serviços locais, seed, `db lint` e pgTAP, trabalho em equipa, CI com GitHub Actions, problemas e exercícios).
- **2026-10-08 — etapas 6 e 7 (feitas juntas):** 10 (pesquisa vetorial com HNSW e `rpc`, gestão do `pg_cron`, auditoria de RLS por SQL, backups, ambientes e rotação de segredos, plano de lançamento); 11 (exercícios 29 a 35 e mapa exercício→módulo; total 35); 12 (padrões de RLS, Realtime e Storage, erros frequentes, regras de ouro, lista de lançamento); 13 (soluções 29 a 35 e rubrica do projeto final). Revisão final: todas as aulas têm «Fontes oficiais», referências PRATICAR coerentes, README com 35 exercícios. O gerador passou a ignorar `.md` na raiz (o `ESTADO-DO-PROJETO.md` tinha sido tratado como aula).
- **2026-10-08 — validação contra a documentação oficial:** os 39 links das «Fontes oficiais» respondem 200; comandos da CLI (`db lint`, `test db`, `gen types --local`, `migration new`, `status`) e `supabase/setup-cli@v1` confirmados; `pg_net`, Storage (políticas de upload/upsert), sessões (1 h) e `security_invoker` confirmados. Correções feitas: (1) chaves: nomes novos e descontinuação prevista das antigas até ao fim de 2026, `SUPABASE_PUBLISHABLE_KEY` nos exemplos, variáveis por omissão das Edge Functions; (2) funções `security definer` movidas para o esquema `private` (módulos 03 e 04); (3) Realtime: `DELETE` não respeita RLS, vários filtros combinam-se com E, canais privados exigem desativar «Allow public access» e usam `realtime.topic()`; (4) ligações: direta é IPv6 (IPv4 com add-on), pooler 5432/6543 com utilizador `postgres.<ref>`; (5) limites: projetos gratuitos pausam após ~7 dias, 2 emails/hora com o SMTP por omissão, limites das Edge Functions, transformação de imagens só em Pro+, backups gratuitos não descarregáveis, PITR como add-on; (6) `extensions.vector` nos exemplos de pgvector; (7) `verify_jwt = false` na configuração como forma principal.
- **Por validar (não confirmado nas páginas consultadas):** limite de 1000 linhas por omissão da Data API, `createSignedUploadUrl`/`uploadToSignedUrl`, `signOut({ scope })`, `getUser()` vs `getSession()`, sintaxe HNSW, fuso do `pg_cron`, `--no-verify-jwt` no `deploy`.
