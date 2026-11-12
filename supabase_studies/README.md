# Mini-Curso de Supabase

Curso prático de A a Z sobre o Supabase: projeto, base de dados Postgres, autenticação, Row Level Security, API, Storage, Realtime, Edge Functions, desenvolvimento local com a CLI e preparação para produção.

O curso está dividido em módulos numerados. Cada pasta contém a aula editável em Markdown, o documento completo em Word e uma apresentação PowerPoint com os pontos principais. Os Word e PowerPoint são gerados a partir do Markdown por `tools/build_course_artifacts.py`. A edição atual foi escrita em **8 de outubro de 2026**; confirma na documentação oficial as mudanças posteriores.

## Percurso

| Pasta | Módulo | Aula Markdown | Word | Apresentação | Conteúdo |
|---|---|---|---|---|---|
| [00-Introducao](00-Introducao) | 00 | [Aula](00-Introducao\00-Introducao-e-Mapa-do-Curso.md) | [Word](00-Introducao\00-Introducao-e-Mapa-do-Curso.docx) | [PowerPoint](00-Introducao\00-Introducao-e-Mapa-do-Curso.pptx) | O que é o Supabase, o que instalar e como estudar |
| [01-Projeto-e-Dashboard](01-Projeto-e-Dashboard) | 01 | [Aula](01-Projeto-e-Dashboard\01-Projeto-e-Dashboard.md) | [Word](01-Projeto-e-Dashboard\01-Projeto-e-Dashboard.docx) | [PowerPoint](01-Projeto-e-Dashboard\01-Projeto-e-Dashboard.pptx) | Criar projeto, dashboard, URL e chaves de API |
| [02-Base-de-Dados-Postgres](02-Base-de-Dados-Postgres) | 02 | [Aula](02-Base-de-Dados-Postgres\02-Modelar-Dados-em-Postgres.md) | [Word](02-Base-de-Dados-Postgres\02-Modelar-Dados-em-Postgres.docx) | [PowerPoint](02-Base-de-Dados-Postgres\02-Modelar-Dados-em-Postgres.pptx) | Tabelas, tipos, relações, índices e vistas |
| [03-Autenticacao](03-Autenticacao) | 03 | [Aula](03-Autenticacao\03-Autenticacao-de-Utilizadores.md) | [Word](03-Autenticacao\03-Autenticacao-de-Utilizadores.docx) | [PowerPoint](03-Autenticacao\03-Autenticacao-de-Utilizadores.pptx) | Registo, login, OAuth, sessões e perfis |
| [04-Row-Level-Security](04-Row-Level-Security) | 04 | [Aula](04-Row-Level-Security\04-Row-Level-Security.md) | [Word](04-Row-Level-Security\04-Row-Level-Security.docx) | [PowerPoint](04-Row-Level-Security\04-Row-Level-Security.pptx) | Políticas, roles e segurança ao nível da linha |
| [05-API-e-Cliente-JavaScript](05-API-e-Cliente-JavaScript) | 05 | [Aula](05-API-e-Cliente-JavaScript\05-API-e-Cliente-JavaScript.md) | [Word](05-API-e-Cliente-JavaScript\05-API-e-Cliente-JavaScript.docx) | [PowerPoint](05-API-e-Cliente-JavaScript\05-API-e-Cliente-JavaScript.pptx) | CRUD, filtros, relações, RPC e tipos TypeScript |
| [06-Storage](06-Storage) | 06 | [Aula](06-Storage\06-Storage-de-Ficheiros.md) | [Word](06-Storage\06-Storage-de-Ficheiros.docx) | [PowerPoint](06-Storage\06-Storage-de-Ficheiros.pptx) | Buckets, uploads, URLs assinados e políticas |
| [07-Realtime](07-Realtime) | 07 | [Aula](07-Realtime\07-Realtime.md) | [Word](07-Realtime\07-Realtime.docx) | [PowerPoint](07-Realtime\07-Realtime.pptx) | Postgres Changes, Broadcast e Presence |
| [08-Edge-Functions](08-Edge-Functions) | 08 | [Aula](08-Edge-Functions\08-Edge-Functions.md) | [Word](08-Edge-Functions\08-Edge-Functions.docx) | [PowerPoint](08-Edge-Functions\08-Edge-Functions.pptx) | Funções em Deno, segredos, CORS e webhooks |
| [09-CLI-e-Desenvolvimento-Local](09-CLI-e-Desenvolvimento-Local) | 09 | [Aula](09-CLI-e-Desenvolvimento-Local\09-CLI-e-Desenvolvimento-Local.md) | [Word](09-CLI-e-Desenvolvimento-Local\09-CLI-e-Desenvolvimento-Local.docx) | [PowerPoint](09-CLI-e-Desenvolvimento-Local\09-CLI-e-Desenvolvimento-Local.pptx) | Stack local, migrations e publicação |
| [10-Extensoes-e-Producao](10-Extensoes-e-Producao) | 10 | [Aula](10-Extensoes-e-Producao\10-Extensoes-e-Producao.md) | [Word](10-Extensoes-e-Producao\10-Extensoes-e-Producao.docx) | [PowerPoint](10-Extensoes-e-Producao\10-Extensoes-e-Producao.pptx) | pgvector, pg_cron, advisors e lista de produção |
| [11-Exercicios-Praticos](11-Exercicios-Praticos) | 11 | [Aula](11-Exercicios-Praticos\11-Exercicios.md) | [Word](11-Exercicios-Praticos\11-Exercicios.docx) | [PowerPoint](11-Exercicios-Praticos\11-Exercicios.pptx) | 35 exercícios, do nível inicial ao projeto final |
| [12-Cheat-Sheet](12-Cheat-Sheet) | 12 | [Aula](12-Cheat-Sheet\12-Consulta-Rapida.md) | [Word](12-Cheat-Sheet\12-Consulta-Rapida.docx) | [PowerPoint](12-Cheat-Sheet\12-Consulta-Rapida.pptx) | Cliente, SQL, RLS e comandos da CLI |
| [13-Gabarito](13-Gabarito) | 13 | [Aula](13-Gabarito\13-Solucoes.md) | [Word](13-Gabarito\13-Solucoes.docx) | [PowerPoint](13-Gabarito\13-Solucoes.pptx) | Soluções comentadas |

## Como estudar

1. Percorre os módulos 00 a 10 com um projeto Supabase de estudo.
2. Resolve os exercícios do módulo 11 sem consultar o gabarito (cada aula indica quais).
3. Usa o módulo 12 como referência diária e o módulo 13 para rever as soluções.

## Regenerar os ficheiros Office

    pip install python-docx python-pptx
    python tools/build_course_artifacts.py
    python tools/build_course_artifacts.py --only 04,05

## Convenções

- **DICA** sugere uma forma prática de trabalhar.
- **ATENÇÃO** assinala ações com risco para os dados ou para a segurança.
- **NOTA** acrescenta contexto.
- **PRATICAR** remete para um exercício do módulo 11.

## Documentação oficial

- [Documentação do Supabase](https://supabase.com/docs)
- [Referência JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Referência da CLI](https://supabase.com/docs/reference/cli/introduction)
