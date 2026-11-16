# Estado do projeto — Mini-Curso de SQL e Bases de Dados

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\studies\sql_database_studies`
- Modelo seguido: `python_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados**: nunca editar à mão.
- Público: iniciantes em SQL, do primeiro SELECT às consultas avançadas, com **foco nas diferenças entre dialetos** (SQLite, PostgreSQL, MySQL, SQL Server; Oracle e SAP HANA só em nota).
- Ambiente: SQLite via Python (3.45) e servidores em Docker (PostgreSQL 17.12, MySQL 8.4.13, SQL Server 2025).
- Fio condutor: a «loja» (categorias, clientes, produtos, encomendas, linhas de encomenda).

## Módulos

00 Introdução · 01 Primeiras consultas · 02 Agregação e funções · 03 Joins e subconsultas · 04 Modificar dados e transações · 05 Modelação e DDL · 06 Consultas avançadas · 07 Índices e desempenho · 08 Dialetos de SQL · 09 SQL em código e objetos · 10 Projeto final · 11 Exercícios · 12 Cheat sheet · 13 Gabarito

Numeração dos exercícios: 01 = 1–4, 02 = 5–8, 03 = 9–12, 04 = 13–16, 05 = 17–20, 06 = 21–24, 07 = 25–28, 08 = 29–32, 09 = 33–36, 37 = projeto final.

## Como gerar

    export PYTHONIOENCODING=utf-8
    python tools/build_course_artifacts.py            # tudo
    python tools/build_course_artifacts.py --only 04,05

Depois: apagar `tools/__pycache__`. **Antes de gerar, apagar qualquer pasta `_rascunho/`** (o gerador apanha `.md` nas pastas de primeiro nível).

## Regras de conteúdo

- Português europeu, forma «tu», sem «você».
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código em blocos indentados com 4 espaços; tabelas Markdown para comparações.
- Limitações do gerador: sem itálico em títulos nem dentro de negrito; sem código dentro de negrito; sem `|` dentro de células.
- Cada aula termina com `## Exercícios` (linha PRATICAR) e `## Fontes oficiais` (links verificados com curl).
- Todo o código foi executado; o que não foi executado está assinalado na aula.
- Não deixar processos nem contentores a correr no fim.

## Registo

- **2026-11-13 — criação:** estrutura e geradores criados.

## Estado em 2026-11-13: CONCLUÍDO

Curso completo: módulos 00 a 13 escritos e gerados (aulas, Word e PowerPoint). Exemplos executados; o que não foi executado está assinalado nas aulas. A pasta `_rascunho/` foi apagada.
