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

## Estado em 2026-11-22: PAUSADO (a meio, retomar depois)

Interrompido por limite de tokens. **Não** foram gerados `.docx`/`.pptx`: o curso está incompleto e o último slide de cada aula depende do módulo seguinte.

**Pronto (aula `.md` + exemplos executados com o Bun 1.4.0, `lint` com 0 problemas, sem carateres de controlo)**

| Módulo | Linhas | Notas |
|---|---|---|
| 00 Introdução | 314 | Sem exercícios. `bun init -y` descarrega pacotes do npm (avisado na aula) |
| 01 Runtime e TypeScript | 385 | Exercícios 1–4 |
| 02 Ficheiros e sistema | 298 | Exercícios 5–8; várias peculiaridades do Bun 1.4.0 no Windows |
| 03 Servidor HTTP | 320 | Exercícios 9–12; API da loja com OpenAPI e Swagger UI (CDN com SRI), mini validador e 21 testes, em `03-Servidor-HTTP/exemplos/loja-api/` |
| 04 Cliente e Web APIs | 296 | Exercícios 13–16 |
| 05 Bases de dados | 285 | Exercícios 17–20; bun:sqlite e Bun.sql contra SQLite, PostgreSQL e MySQL (Docker) |
| 06 Redis e S3 | 299 | Exercícios 21–24; Redis e Valkey, S3 com RustFS (o MinIO está arquivado) |
| 07 Segurança e utilitários | 282 | Exercícios 25–28 |
| 08 Testes nativos | 338 | Exercícios 29–32; 62 testes, 60 pass, 1 skip, 1 todo |

Os enunciados e as soluções (executadas) dos exercícios 1–32 estão em `_rascunho/ex_01..08.md` e `sol_01..08.md`. **A pasta `_rascunho/` está no `.gitignore` (só existe neste computador): não a apagar antes de montar os módulos 13 e 15.**

**Falta**
1. Módulo 09 Bundler e executáveis (exercícios 33–36): Bun.build e `bun build`, plugins, loaders, macros, targets, `--compile` (executável único; embutir ficheiros), HTML imports com `Bun.serve` (reutilizar a documentação OpenAPI do módulo 03).
2. Módulo 10 Pacotes e workspaces (exercícios 37–40): `bun install`, `bun add`, `bun.lock`, workspaces, catálogos, overrides, patch, `bunx`, `bun pm`, scripts. Só dentro do scratchpad.
3. Módulo 11 Concorrência e interoperabilidade (exercícios 41–44): Workers, Bun.spawn com IPC, `bun:ffi`, Node compat, WASM, `Bun.Transpiler` e plugins de runtime.
4. Módulo 12 Projeto final (escrever à mão, como em `sql_database_studies/10-Projeto-Final`): API da loja documentada com OpenAPI, SQLite, testes e executável único.
5. Módulo 14 Cheat sheet (escrever à mão) e módulos 13 Exercícios e 15 Gabarito (montar com `docker_studies/tools/apoio/montar.py`, acrescentando a entrada `bun`: pasta `bun_studies`, ex_dir `13-Exercicios-Praticos`/`13-Exercicios.md`, sol_dir `15-Gabarito`/`15-Solucoes.md`, módulos 1–11, n_proj 45, mod_ex 13, mod_proj 12, mod_cheat 14, mod_sol 15).
6. Correr `lint.py bun_studies`, procurar carateres de controlo, apagar `_rascunho/`, gerar com `python tools/build_course_artifacts.py`, criar o README (`readme.py` com a entrada `bun`), atualizar este ficheiro e o README e CLAUDE.md da raiz.

**Achados a ter presentes (Bun 1.4.0 no Windows; a documentação online já descreve a 1.4.5)**
- A documentação oficial diz que o Bun está escrito em Rust (a bibliografia antiga diz Zig). `bun check`, `bun fmt`, `import.meta.glob`, `EventSource`, `Bun.FetchSession`, `jest.mock` e `db.function` não existem na 1.4.0.
- `Bun.write` com ficheiro-fatia copia tudo; `Bun.write(destino, Response de ReadableStream em JS)` fica pendurado; `file.writer()` não trunca um ficheiro existente; o `Bun.$` estraga acentos escritos literalmente no template.
- Um `.tsx` sem `tsconfig` fez o Bun instalar o `react` sozinho (auto-install) na cache global: evitar imports que não existam.
- O Bun não traz validador de JSON Schema nem JWT.
- Redis: o `RedisClient` fala também com o Valkey. S3: o Bun 1.4.0 não cria buckets (criar com a CLI do servidor).

**Ambiente (como retomar)**
- Bun 1.4.0 no anfitrião; Docker Desktop aberto só se for preciso (módulos 05 e 06 já feitos; os restantes não precisam de Docker).
- Todos os contentores, volumes, redes e imagens `est-bn*` e as imagens descarregadas (postgres:17, mysql:8.4, redis:8, valkey/valkey:8, rustfs/rustfs:1.0.6) foram removidos.
- Regras de segurança: ver `_rascunho/BRIEFING.md` (portas 35<NN>0 a 35<NN>9, nunca terminar processos por nome ou filtro, nunca `prune`, não tocar no contentor `sqlserver` nem nos volumes `supabase_*` e `db-mssql-snapshot_*`).
- No máximo 3 agentes de cada vez.
