# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`C:\temp\Sites\studies` is not an application. It is a collection of independent **study courses written in European Portuguese** (pt-PT, "tu" form, never "você"). Each top-level folder is one course, and each course is a set of numbered module folders (`00-Introducao`, `01-...`, ...). Every lesson is delivered as a `.docx` (full reference) plus a companion `.pptx` (visual summary). The root is a single Git repository (remote `https://github.com/AdrianoHebreu/estudos.git`, branch `main`) that holds every course; the root `.gitignore` excludes `node_modules`, `__pycache__`, `.venv`, Office lock files and `codex_studies/.qa/rendered/`. There is no test suite and no linter at the root. The "build" is generating Office files.

Courses: `claude_code_studies`, `codex_studies`, `git_studies`, `graphQL_studies`, `javascript_studies`, `python_studies`, `solution_architect_studies`, `supabase_studies`, `typescript_studies`.

## Core rule: Office files are generated, never edited by hand

The `.docx`/`.pptx` files are build outputs and are overwritten on the next generation. Change the source and regenerate. The source format differs by course:

| Course | Source of truth | Generator |
|---|---|---|
| `typescript_studies`, `javascript_studies` | `content-source/<module>/<file>.json` | `tools/build_lesson.py` |
| `graphQL_studies`, `supabase_studies`, `codex_studies`, `python_studies`, `solution_architect_studies` | a `.md` next to the `.docx`/`.pptx` in each module folder | `tools/build_course_artifacts.py` |
| `claude_code_studies`, `git_studies` | none kept. Only `.docx`/`.pptx` exist, with no `tools/` | n/a |

Each `tools/` folder carries its own copy of `docbuilder.py`, `pptxbuilder.py` and `style.py`, copied and adapted from course to course. They are not shared, so a fix in one course does not propagate. Requires Python with `python-docx` and `python-pptx`.

## Commands

Use `python` (not `python3`). Run `export PYTHONIOENCODING=utf-8` first, or accented output breaks. Run from inside the course folder.

Markdown-based courses (graphQL, supabase, codex, python, solution_architect):
```
python tools/build_course_artifacts.py                  # all modules
python tools/build_course_artifacts.py --only 02,03     # selected modules (matched on the first 2 chars of the .md filename)
python tools/build_course_artifacts.py --only 02 --format docx   # or pptx
```
The generator picks up one `.md` per module folder (not `README.md`, not inside `tools/` or `node_modules`). The "A seguir" last slide is computed from the sorted file order.

JSON-based courses (typescript, javascript):
```
python tools/merge_raw.py <module>                      # merge agent-written _raw_NN.json with metadata from course_order.py
python tools/build_lesson.py --all content-source       # generate .docx + .pptx
python tools/refresh_nav.py                             # recompute the final "a seguir" slide
python tools/verify_content.py                          # automatic validation, must report zero problems
```

Other helper tools: `build_gabarito.py` (assembles the answer-key module from every lesson's exercises) and `generate_readmes.py`.

## Architecture notes that span files

- **Structure is computed, not written.** In the JSON courses, `tools/course_order.py` is the single source of truth for modules, lessons, numbering, titles, slugs and navigation. Agents write only the lesson content. Edit `course_order.py` first when structure changes.
- **Agent-driven authoring.** The JSON courses are built in "etapas" (stages): one module per stage, one parallel agent per lesson. Do not merge several modules into one stage (this already burned a whole 5-hour usage window).
- **`ESTADO-DO-PROJETO.md` is the handoff file.** `typescript_studies`, `graphQL_studies`, `supabase_studies`, `python_studies` and `solution_architect_studies` each have one with the stage table, exact commands, content rules and past mistakes. **Read it fully before touching that course**, and update it at the end of each stage. "Next stage" means the first row marked **a seguir**. `typescript_studies/CLAUDE.md` holds its own course-level rules, which take precedence inside that folder.
- **Course order and audience.** The courses are cumulative. TypeScript assumes the JavaScript course was completed and must not re-teach JS. GraphQL and Supabase follow the supabase_studies structure (a `.md` lesson plus generated `.docx`/`.pptx`).
- **Module 14 of `graphQL_studies`** (`14-Servidor-de-Estudo/servidor/`) is a real Node project (Apollo Server 5, in-memory data, DataLoader). `npm test` runs its tests. `requests.http` is for the REST Client extension.
- Module 14 of `python_studies` (`14-Projetos-por-Area/projetos/`) holds four small runnable projects; two need `pip install -r requirements.txt` in a venv. Never put `.md` files under `projetos/` (the generator would pick them up).
- `typescript_studies` has a `package.json` (devDependency `typescript`) used to validate code samples. `node_modules` is ignored by the generators.
- `codex_studies/.qa/` has helpers to render the Office files for visual QA (`render_office_qa.ps1`).

## Content conventions (graphQL/supabase, representative of the others)

- Callouts are written `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Code goes in blocks indented with 4 spaces, and comparisons go in Markdown tables.
- Each lesson ends with `## Fontes oficiais` (official links).
- Don't claim library behaviour without checking it. Run the code with `node` when possible.
- Exercises are numbered globally across modules and collected in the exercises module. Keep cross-references consistent with the answer-key module.

## Housekeeping

- Stop any dev server, watcher or background process you start, and confirm the ports are free before finishing. The user tests on their own afterwards.
- Delete `tools/__pycache__` after generating.
- If a `.docx` is open in Word, regeneration fails on that file (it is locked). Ask the user to close it and rerun with `--only`.
