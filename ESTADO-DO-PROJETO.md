# Estado do projeto — Mini-Curso de Python

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\studies\python_studies`
- Modelo seguido: `graphQL_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados** — nunca editar à mão.
- Público: quem sabe usar o computador e o terminal, com ou sem experiência de programação. Python 3.13 (testado com 3.13.0).

## Módulos

00 Introdução · 01 Fundamentos · 02 Controlo de fluxo · 03 Funções · 04 Estruturas de dados · 05 Strings e ficheiros · 06 Módulos e ambientes · 07 Orientação a objetos · 08 Erros e testes · 09 Python idiomático · 10 Biblioteca padrão e ecossistema · 11 Exercícios · 12 Cheat sheet · 13 Gabarito · 14 Projetos por área (automação, sysadmin, web com FastAPI, dados com pandas; IA só como nota com ligações, por decisão do utilizador)

Numeração dos exercícios (módulo 11): módulo 01 = 1–4, 02 = 5–8, 03 = 9–12, 04 = 13–16, 05 = 17–20, 06 = 21–24, 07 = 25–28, 08 = 29–32, 09 = 33–36, 10 = 37–40, 41 = projeto final.

## Como gerar

    export PYTHONIOENCODING=utf-8
    python tools/build_course_artifacts.py            # tudo
    python tools/build_course_artifacts.py --only 04,05

Depois: apagar `tools/__pycache__`.

## Regras de conteúdo

- Português europeu, forma «tu», sem «você».
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código em blocos indentados com 4 espaços; tabelas Markdown para comparações.
- Cada aula termina com `## Exercícios` (linha PRATICAR) e `## Fontes oficiais` (links docs.python.org, peps.python.org, etc.).
- Projeto fio condutor: **gestor de despesas pessoais** (`Despesa`: descrição, valor, categoria, data), definido no módulo 00.
- Todo o código deve ser executado com `python` antes de entrar numa aula; não afirmar comportamento sem verificar. O que não for executado é assinalado.
- Não deixar processos a correr no fim.

## Registo

- **2026-11-09 — criação:** estrutura, gerador e módulos 00–13 escritos e gerados (28 ficheiros Office). Exemplos e soluções executados com Python 3.13.0; mypy, ruff e uv não estavam instalados (assinalado nas aulas). Exercícios por módulo escritos pelos agentes e montados nos módulos 11 e 13; exercício 41 (projeto final) tem critérios em vez de solução. Repositório Git iniciado.
- **2026-11-09 — módulo 14:** 4 mini projetos em `14-Projetos-por-Area/projetos/` (executados; dependências só em venv no scratchpad: fastapi 0.162.2, uvicorn 0.54.0, pydantic 2.14.3, pandas 3.1.1, matplotlib 3.11.2). Não testado em Linux/macOS. O gerador só apanha `.md` ao nível do módulo, por isso não pôr `.md` dentro de `projetos/`.
