# Estado do projeto — Mini-Curso de Bun

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\studies\bun_studies`.
- Modelo seguido: `cobol_estudies` e `sql_database_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados**: nunca editar à mão.
- Objetivo do curso (pedido do utilizador): mostrar **ao máximo todas as funcionalidades nativas do Bun, sem bibliotecas npm** (APIs `Bun.*`, módulos `bun:*`, APIs Web e módulos `node:*` embutidos).
- Pedido adicional do utilizador (2026-11-22): explorar a documentação da API com **OpenAPI e Swagger UI**. Tratado a fundo no módulo 03 (servidor HTTP), reutilizado nos módulos 05, 08 e 09 e entregue no projeto final (12). Ver a secção «Tema transversal» do `_rascunho/BRIEFING.md`.
- Versão usada: Bun 1.4.0 (Windows 11, Git Bash). Público: developers que conhecem JavaScript/TypeScript e Node.
- Fio condutor: a API da «loja» (os mesmos dados dos cursos de SQL, MongoDB e COBOL), em `00-Introducao/dados/loja.sql`.

## Módulos

00 Introdução · 01 Runtime e TypeScript · 02 Ficheiros e sistema · 03 Servidor HTTP · 04 Cliente e Web APIs · 05 Bases de dados · 06 Redis e S3 · 07 Segurança e utilitários · 08 Testes nativos · 09 Bundler e executáveis · 10 Pacotes e workspaces · 11 Concorrência e interoperabilidade · 12 Projeto final · 13 Exercícios · 14 Cheat sheet · 15 Gabarito

Numeração dos exercícios (módulo 13): 01 = 1–4, 02 = 5–8, 03 = 9–12, 04 = 13–16, 05 = 17–20, 06 = 21–24, 07 = 25–28, 08 = 29–32, 09 = 33–36, 10 = 37–40, 11 = 41–44, 45 = projeto final.

## Como gerar

    export PYTHONIOENCODING=utf-8
    python tools/build_course_artifacts.py            # tudo
    python tools/build_course_artifacts.py --only 04,05

Depois: apagar `tools/__pycache__`. **Antes de gerar, apagar `_rascunho/`** (o gerador apanha `.md` nas pastas de primeiro nível). Antes de gerar, procurar caracteres de controlo nos `.md` (um `\b` vira backspace e parte a geração).

## Regras de conteúdo

- Português europeu, forma «tu», sem «você».
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código em blocos indentados com 4 espaços; tabelas Markdown.
- Limitações do gerador: sem itálico em títulos nem dentro de negrito; sem código dentro de negrito; sem `|` dentro de células; sem acento grave solto (atenção aos template literals fora de blocos de código); sem sequências de escape.
- Cada aula termina com `## Exercícios` e `## Fontes oficiais` (links verificados com curl).
- Todo o código foi executado com o Bun 1.4.0; o que não foi executado está assinalado.
- Nenhum exemplo usa pacotes do npm. Nunca `node_modules`, `bun.lock`, `.sqlite` nem binários dentro da pasta do curso.
- No máximo 3 agentes de cada vez; tarefas curtas. Os agentes nunca terminam processos por nome ou filtro, só pelo PID que lançaram.
- Os módulos 05 e 06 usam Docker (PostgreSQL, MySQL, Redis, armazenamento compatível com S3): o Docker Desktop tem de estar aberto. No fim remover contentores, volumes e imagens descarregadas (ver `_rascunho/BRIEFING.md`).

## Registo

- **2026-11-22 — criação:** estrutura, gerador, dados da loja e briefing criados.
- **2026-11-22 — módulos 00 a 08 escritos** (um agente por módulo, 3 de cada vez).
- **2026-11-23 — módulos 09 a 11 escritos; projeto final (12), consulta rápida (14), exercícios (13) e gabarito (15) montados; 32 ficheiros Office gerados.**

## Estado em 2026-11-23: CONCLUÍDO

Curso completo: módulos 00 a 15 escritos e gerados (16 aulas, Word e PowerPoint). Exemplos executados com o Bun 1.4.0 no Windows 11; o que não foi executado está assinalado nas aulas. A pasta `_rascunho/` foi apagada.

**Pontos a rever periodicamente**
- A documentação online já descreve a 1.4.5: várias opções (bun check, bun fmt, import.meta.glob, EventSource, jest.mock, db.function) não existem na 1.4.0, e algumas peculiaridades registadas podem estar corrigidas. Reconfirmar ao mudar de versão.
- Os links de `bun.com/docs` respondem 200 mesmo em páginas inexistentes («soft 404»): verificar sempre o título da página. A página `bundler/executables` consta do índice oficial mas devolve 404, por isso as aulas apontam para `bundler`.
- A renderização do Swagger UI no browser não foi testada (só o HTML e o JSON devolvidos).
- O comportamento em Linux e macOS vem da documentação e não foi executado.

**Efeitos laterais no computador do utilizador (para saber)**
- Uma experiência no módulo 01 (um `.tsx` sem tsconfig) fez o Bun instalar o `react` sozinho na cache global `~/.bun`.
- No módulo 09, `--target=bun-windows-arm64` descarregou o runtime ARM64 (75 MB) para `~/.bun/install/cache/bun-windows-aarch64-v1.4.0`. Fica por apagar à decisão do utilizador.
- No módulo 10, um `bun pm cache rm` apagou 1 pacote em cache do `bunx` na pasta TEMP do utilizador (regenerável).
