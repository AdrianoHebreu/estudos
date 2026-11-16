# Estado do projeto — Mini-Curso de MongoDB

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\studies\mongodb_studies`
- Modelo seguido: `python_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados**: nunca editar à mão.
- Público: developers com noções de bases de dados. MongoDB 8.x (imagem `mongo:8`), shell `mongosh`, Python (pymongo). Exemplos práticos com Docker Compose.
- Fio condutor: a «loja» (os mesmos dados do curso de SQL).

## Módulos

00 Introdução · 01 Conceitos e ambiente (Compose) · 02 CRUD · 03 Modelação de dados · 04 Aggregation · 05 Índices e desempenho · 06 Drivers e transações · 07 Operação e segurança · 08 Projeto final · 09 Exercícios · 10 Cheat sheet · 11 Gabarito

Numeração dos exercícios: 01 = 1–4, 02 = 5–8, 03 = 9–12, 04 = 13–16, 05 = 17–20, 06 = 21–24, 07 = 25–28, 29 = projeto final.

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

Curso completo: módulos 00 a 11 escritos e gerados (aulas, Word e PowerPoint). Exemplos executados; o que não foi executado está assinalado nas aulas. A pasta `_rascunho/` foi apagada.
