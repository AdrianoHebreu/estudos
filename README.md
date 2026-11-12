# Estudos

Coleção de **mini-cursos de estudo em português europeu**, escritos para aprender, rever e consultar tecnologias do dia a dia de quem desenvolve software. Cada pasta da raiz é um curso independente, organizado em módulos numerados, e cada aula existe em dois formatos: um documento Word completo (`.docx`) e uma apresentação PowerPoint resumida (`.pptx`).

Isto **não é uma aplicação**: não há nada para instalar nem executar na raiz. O "produto" são os documentos e, em alguns cursos, pequenos projetos de código que acompanham as aulas.

## Cursos

| Pasta | Tema | Módulos | Fonte do conteúdo |
|---|---|---|---|
| [`claude_code_studies`](claude_code_studies) | Claude Code, a ferramenta de linha de comandos da Anthropic: comandos, permissões, `CLAUDE.md`, subagentes, skills, hooks, MCP e modo headless | 00 a 12 | Só `.docx`/`.pptx` |
| [`codex_studies`](codex_studies) | Codex CLI: instalação, modelos e esforço de raciocínio, comandos, configuração, permissões, Git, automação e integrações | 00 a 13 | Markdown |
| [`git_studies`](git_studies) | Git, dos fundamentos aos conflitos, ao trabalho em equipa e ao Git avançado | 00 a 13 | Só `.docx`/`.pptx` |
| [`graphQL_studies`](graphQL_studies) | GraphQL, do primeiro pedido à produção (schema, resolvers, Apollo, paginação, erros, autorização, desempenho), com um servidor de estudo em Node | 00 a 14 | Markdown |
| [`javascript_studies`](javascript_studies) | JavaScript de A a Z: linguagem, assincronismo, módulos, DOM, Proxy/Reflect, padrões de projeto e projeto final | 00 a 16 (65 aulas) | JSON |
| [`python_studies`](python_studies) | Python de A a Z: fundamentos, estruturas de dados, POO, testes, Python idiomático, biblioteca padrão e quatro projetos por área | 00 a 14 | Markdown |
| [`supabase_studies`](supabase_studies) | Supabase: Postgres, autenticação, Row Level Security, API, Storage, Realtime, Edge Functions e CLI | 00 a 13 | Markdown |
| [`typescript_studies`](typescript_studies) | TypeScript de A a Z, do sistema de tipos aos genéricos e à migração de projetos reais | 00 a 14 (53 aulas) | JSON |

**Ordem sugerida:** os cursos são cumulativos em alguns pontos. O de TypeScript assume que já fizeste o de JavaScript e não volta a ensinar a linguagem base. O de Python, o de GraphQL e o de Supabase são independentes. O de Git e o de Claude Code/Codex servem de apoio a qualquer um dos outros.

## Como cada curso está organizado

Todos seguem a mesma estrutura:

- **Pastas numeradas por módulo** (`00-Introducao`, `01-...`, ...). A ordem dos números é a ordem recomendada de estudo.
- **Módulo 00:** introdução e mapa do curso.
- **Módulos finais:** exercícios práticos, folha de consulta rápida (cheat sheet) e gabarito com as soluções.
- **Um `.docx` e um `.pptx` por aula.** O Word é a referência completa. O PowerPoint é o resumo visual, com tabelas, ícones e blocos de código, para rever depressa.
- **Um `README.md` por curso**, com a tabela de módulos e sugestões de como estudar.

### Convenções dos textos

- Português europeu, tratamento por «tu».
- Chamadas de atenção em quatro tipos: **DICA**, **ATENÇÃO**, **NOTA** e **PRATICAR** (esta última remete para um exercício).
- Cada aula termina com uma secção de fontes oficiais.
- O código dos exemplos foi executado sempre que possível. O que não foi executado está assinalado na própria aula.

## Os documentos são gerados

Os `.docx` e `.pptx` **não se editam à mão**: são produzidos por scripts Python e substituídos na geração seguinte. O conteúdo vive noutro formato, conforme o curso:

| Cursos | Onde está o conteúdo | Gerador |
|---|---|---|
| `graphQL_studies`, `supabase_studies`, `codex_studies`, `python_studies` | Um `.md` ao lado do `.docx`/`.pptx`, em cada pasta de módulo | `tools/build_course_artifacts.py` |
| `javascript_studies`, `typescript_studies` | JSON em `content-source/<módulo>/` | `tools/build_lesson.py` |
| `claude_code_studies`, `git_studies` | Não há fonte guardada: só existem os documentos | n/a |

Cada curso tem a sua própria cópia dos geradores (`docbuilder.py`, `pptxbuilder.py`, `style.py`); não são partilhados, por isso uma correção num curso não se propaga aos outros.

### Regenerar os documentos

Requisitos: Python 3 com `python-docx` e `python-pptx`.

    pip install python-docx python-pptx
    cd python_studies
    python tools/build_course_artifacts.py              # todos os módulos
    python tools/build_course_artifacts.py --only 04,05 # só alguns módulos

Nos cursos em JSON:

    cd typescript_studies
    python tools/build_lesson.py --all content-source
    python tools/verify_content.py                      # validação automática

Se um `.docx` estiver aberto no Word, essa geração falha nesse ficheiro (está bloqueado): fecha-o e volta a correr com `--only`.

## Projetos de código incluídos

| Onde | O que é | Como correr |
|---|---|---|
| `graphQL_studies/14-Servidor-de-Estudo/servidor` | Servidor GraphQL (Apollo Server 5, dados em memória, DataLoader) com testes e pedidos para a extensão REST Client | `npm install` e `npm test` |
| `python_studies/14-Projetos-por-Area/projetos` | Quatro mini projetos (automação, administração de sistemas, API web com FastAPI, análise de dados com pandas) | Ver a aula do módulo 14; dois precisam de `pip install -r requirements.txt` num ambiente virtual |
| `typescript_studies` | `package.json` com o compilador TypeScript, usado para validar os exemplos | `npm install` |

## Ficheiros de apoio ao trabalho

- [`CLAUDE.md`](CLAUDE.md): instruções para o Claude Code ao trabalhar neste repositório (estrutura, comandos e regras).
- `ESTADO-DO-PROJETO.md` (em `graphQL_studies`, `python_studies`, `supabase_studies` e `typescript_studies`): ficheiro de passagem de testemunho de cada curso, com o plano por etapas, os comandos exatos e os erros já cometidos.
- [`.gitignore`](.gitignore): exclui `node_modules`, `__pycache__`, ambientes virtuais, ficheiros temporários do Office e as imagens de QA do Codex (`codex_studies/.qa/rendered/`).

## Estado

Os oito cursos estão completos. O de Python é o mais recente e inclui o módulo 14 de projetos por área.
