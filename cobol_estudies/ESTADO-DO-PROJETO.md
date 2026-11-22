# Estado do projeto — Mini-Curso de COBOL

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\studies\cobol_estudies` (o nome foi escolhido pelo utilizador).
- Modelo seguido: `sql_database_studies` e `docker_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados**: nunca editar à mão.
- Público: developer sem experiência de COBOL. Compilador: **GnuCOBOL** executado em Docker (imagem `est-cb-gnucobol:estudo`, construída a partir de `00-Introducao/ambiente/Dockerfile`), por decisão do utilizador.
- Fio condutor: a «loja» (os mesmos dados dos cursos de SQL e MongoDB), em ficheiros de largura fixa em `00-Introducao/dados/` e copybooks em `00-Introducao/copybooks/`.

## Módulos

00 Introdução · 01 Primeiros programas · 02 Dados e PICTURE · 03 Instruções e fluxo · 04 Ficheiros sequenciais · 05 Relatórios e texto · 06 Ficheiros indexados e ordenação · 07 Subprogramas e modularização · 08 Erros e depuração · 09 COBOL no mundo real · 10 Projeto final · 11 Exercícios · 12 Cheat sheet · 13 Gabarito

Numeração dos exercícios (módulo 11): 01 = 1–4, 02 = 5–8, 03 = 9–12, 04 = 13–16, 05 = 17–20, 06 = 21–24, 07 = 25–28, 08 = 29–32, 09 = 33–36, 37 = projeto final.

## Como gerar

    export PYTHONIOENCODING=utf-8
    python tools/build_course_artifacts.py            # tudo
    python tools/build_course_artifacts.py --only 04,05

Depois: apagar `tools/__pycache__`. **Antes de gerar, apagar `_rascunho/`** (o gerador apanha `.md` nas pastas de primeiro nível).

## Regras de conteúdo

- Português europeu, forma «tu», sem «você».
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código em blocos indentados com 4 espaços (mantendo as colunas do COBOL); tabelas Markdown.
- Limitações do gerador: sem itálico em títulos nem dentro de negrito; sem código dentro de negrito; sem `|` dentro de células; sem acento grave solto; sem sequências de escape (um `\b` vira carácter de controlo e parte a geração).
- Cada aula termina com `## Exercícios` e `## Fontes oficiais` (links verificados com curl).
- Todo o código foi compilado e executado; o que não foi executado (mainframe, JCL, CICS, DB2) está assinalado na aula.
- No máximo 3 agentes de cada vez; tarefas curtas.
- Segurança do Docker: ver `_rascunho/BRIEFING.md`. No fim, remover a imagem `est-cb-gnucobol:estudo` e a imagem base `debian:stable-slim` se foram descarregadas para este curso.

## Registo

- **2026-11-19 — criação:** estrutura, gerador, dados da loja em formato COBOL, copybooks, Dockerfile e briefing criados.

## Estado em 2026-11-19: CONCLUÍDO

Curso completo: módulos 00 a 13 escritos e gerados (aulas, Word e PowerPoint). Exemplos executados; o que não foi executado está assinalado nas aulas. A pasta `_rascunho/` foi apagada.
- Docker: a imagem `est-cb-gnucobol:estudo` e a base `debian:stable-slim` foram removidas no fim; para retomar, reconstruir com `docker build -t est-cb-gnucobol:estudo 00-Introducao/ambiente`.
