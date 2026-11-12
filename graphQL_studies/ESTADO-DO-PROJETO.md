# Estado do projeto — Mini-Curso de GraphQL

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\graphQL_studies`
- Modelo seguido: `C:\temp\Sites\supabase_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados** — nunca editar à mão.
- Curso **completo** (14 módulos). O utilizador autorizou, a meio, seguir todas as etapas seguidas.

## Etapas

| Etapa | Módulos | Estado |
|---|---|---|
| 1 | 00 Introdução + 01 Linguagem de consulta | **Concluída** (2026-11-06) |
| 2 | 02 Schema e SDL + 03 Mutations e subscriptions | **Concluída** (2026-11-06) |
| 3 | 04 Resolvers e servidor (Apollo Server) + 05 Cliente GraphQL | **Concluída** (2026-11-06) |
| 4 | 06 Paginação e Relay + 07 Erros e validação | **Concluída** (2026-11-06) |
| 5 | 08 Autenticação e autorização + 09 Desempenho e cache (N+1, DataLoader) | **Concluída** (2026-11-06) |
| 6 | 10 Tooling e produção + 11 Exercícios práticos | **Concluída** (2026-11-06) |
| 7 | 12 Cheat sheet + 13 Gabarito + README final e revisão | **Concluída** (2026-11-06) |

## Como executar uma etapa

1. Escrever o `.md` de cada módulo na sua pasta (um só `.md` por pasta, exceto README).
2. Gerar: `export PYTHONIOENCODING=utf-8; python tools/build_course_artifacts.py --only 02,03`
3. Atualizar esta tabela e o «Registo». Apagar `tools/__pycache__`.
4. Parar.

## Regras de conteúdo

- Português europeu, forma «tu», sem «você».
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código em blocos indentados com 4 espaços; tabelas Markdown para comparações.
- Cada aula termina com `## Fontes oficiais` (links graphql.org, spec.graphql.org, docs do Apollo).
- Projeto fio condutor: API de **biblioteca** (`Autor`, `Livro`, `Critica`), definido no módulo 00. Enum de exemplo: `Genero` (`FICCAO`, ...).
- Os módulos referem exercícios do módulo 11 (numeração: 1 = módulo 00; 2–6 = módulo 01; continuar a sequência). Ao escrever o 11, manter estas referências coerentes.
- Não afirmar comportamento de bibliotecas sem verificar (Apollo Server 4/5, graphql-js). Validar código com `node` quando possível.
- Não deixar processos a correr no fim.

## Registo

- **2026-11-06 — etapa 1:** estrutura, gerador e módulos 00 e 01 criados.
- **2026-11-06 — etapa 2:** módulos 02 (exercícios 7–10) e 03 (exercícios 11–14) criados. Próximo número livre no módulo 11: 15.
- **2026-11-06 — etapas 3 a 7 (seguidas, por autorização do utilizador):** 04 (ex. 15–18), 05 (19–22), 06 (23–26), 07 (27–30), 08 (31–34), 09 (35–38), 10 (39–42), 11 (43 exercícios), 12 cheat sheet, 13 gabarito, README final. Executados num diretório temporário: Apollo Server 5.5 + graphql 16 (servidor, contexto, erros, formatError, `executeOperation` com `contextValue`, regra de profundidade, DataLoader, `__resolveType`), Apollo Client 4.3 (`query`, `mutate`, `errorPolicy`) e paginação por cursor. **Não executados** (assinalados nas aulas): hooks React, `relayStylePagination`, codegen, federation, servidor de subscriptions.
- **Links:** verificados com curl; corrigidos dois 404 (nullability, persisted-documents).
- **Pendente:** `00-Introducao-e-Mapa-do-Curso.docx` estava aberto no Word (bloqueado) ao regenerar; o módulo 00 não mudou desde a etapa 1, por isso o ficheiro está atual. Se mexeres no módulo 00, fecha o Word e corre `--only 00`.
- Trabalho futuro possível: rever o aspeto dos Word/PowerPoint e revalidar versões do Apollo periodicamente.
- **2026-11-06 — módulo 14 (extra, a pedido do utilizador):** `14-Servidor-de-Estudo/` com aula (.md/.docx/.pptx) e projeto Node em `servidor/` (Apollo Server 5, dados em memória, DataLoader, paginação, autorização por token de teste, 11 testes `npm test` a passar) e `requests.http` (26 pedidos para REST Client, validados contra o servidor real com um script que imita o formato `X-REQUEST-TYPE: GraphQL`; não abertos na extensão). Gerador corrigido para ignorar `node_modules` e só apanhar `.md` ao nível do módulo. Nota: `node --test` no Node 24 não aceita pasta, usa-se glob no script. Subscriptions não implementadas no servidor.
