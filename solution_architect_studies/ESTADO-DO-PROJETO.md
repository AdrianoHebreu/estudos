# Estado do projeto — Mini-Curso de Solution Architect

**Ler este ficheiro primeiro ao retomar o trabalho.**

## Resumo

- Pasta: `C:\temp\Sites\studies\solution_architect_studies`
- Modelo seguido: `python_studies` (aula `.md` + `.docx` + `.pptx` por módulo; gerador copiado e adaptado em `tools/`).
- As aulas vivem em Markdown. Os `.docx` e `.pptx` são **gerados**: nunca editar à mão.
- Público: developer que vai assumir a função de Solution Architect. Independente de tecnologia e de fornecedor.
- Motivo: o utilizador vai mudar de Developer para Solution Architect na empresa onde trabalha.

## Etapas

| Etapa | Módulos | Estado |
|---|---|---|
| 1 | 00 Introdução e mapa do curso | **Concluída** (2026-11-12), estrutura aprovada pelo utilizador |
| 2 | 01 a 13 (aulas, 4 exercícios cada) | **Concluída** (2026-11-12) |
| 3 | 14 Projeto final, 15 Exercícios, 16 Cheat sheet, 17 Gabarito, README | **Concluída** (2026-11-12) |

Curso **completo**. Trabalho futuro possível: revalidar nomes de serviços e domínios do AZ-305 periodicamente e rever os pontos não verificados listados no Registo.

## Estrutura proposta

00 Introdução · 01 O papel do SA · 02 Do negócio aos requisitos · 03 Fundamentos de arquitetura · 04 Modelação e documentação · 05 Dados e integração · 06 Cloud e infraestrutura · 07 Segurança e conformidade · 08 Qualidade operacional · 09 DevOps e entrega · 10 Decisões, custos e negócio · 11 Migração e modernização · 12 Comunicação e liderança · 13 Temas avançados · 14 Projeto final · 15 Exercícios · 16 Cheat sheet · 17 Gabarito

Os nomes das pastas estão em `tools/build_course_artifacts.py` (função `module_title_from_folder`). Se a estrutura mudar depois da revisão, atualizar aí, no módulo 00 (tabela do mapa) e aqui.

## Como gerar

    export PYTHONIOENCODING=utf-8
    python tools/build_course_artifacts.py --only 00

Depois: apagar `tools/__pycache__`. Nota: o último slide de cada aula indica o módulo seguinte com base nos `.md` existentes; ao criar novos módulos, regenerar o anterior.

## Regras de conteúdo

- Português europeu, forma «tu», sem «você».
- Callouts: `**DICA:**`, `**ATENÇÃO:**`, `**NOTA:**`, `**PRATICAR:**`.
- Código e diagramas em texto em blocos indentados com 4 espaços; tabelas Markdown para comparações.
- Cada aula tem uma secção «Depende da empresa» (o que varia com a cultura e a dimensão da organização).
- Caso fio condutor: **Casa Nova Distribuição** (empresa fictícia de distribuição, 400 colaboradores, 12 delegações), definido no módulo 00.
- Cada aula termina com `## Exercícios` e `## Fontes oficiais` (links verificados com curl).
- Não afirmar versões, preços ou limites de produtos sem verificar na documentação oficial.
- Não deixar processos a correr no fim.

## Decisões do utilizador (2026-11-12)

- Estrutura dos módulos aprovada tal como proposta.
- Caso fio condutor fictício (Casa Nova Distribuição) aprovado.
- Stack da empresa a destacar nos exemplos: SAP, Azure, Delphi, Bun, Claude Code, Codex.
- Certificação: preparar para Azure (AZ-305, que exige também o AZ-104) e incluir equivalências AWS.

## Perguntas que ficaram resolvidas (histórico)

- A estrutura e a ordem dos módulos estão adequadas à função na tua empresa?
- Manter o caso fio condutor fictício ou usar um caso real (anonimizado)?
- Há tecnologias ou frameworks específicos da empresa a destacar (cloud do fornecedor, ERP, etc.)?
- Incluir módulos de certificação (AWS, Azure, TOGAF) ou manter independente de fornecedor?

## Registo

- **2026-11-12 — etapa 1:** estrutura, gerador e módulo 00 criados.
- **2026-11-12 — etapas 2 e 3:** módulos 01 a 13 escritos por um agente cada, em paralelo, com 4 exercícios por módulo (1 a 52); módulo 14 (projeto final, exercício 53), 16 (consulta rápida), 15 e 17 montados a partir dos rascunhos; ficheiros Office gerados (18 aulas, 36 ficheiros). Alinhado o exemplo de desempenho do módulo 03 com o QA-01 do módulo 02 (2 s).
- **Pontos não verificados nas fontes (rever periodicamente):**
  - SAP e Delphi: help.sap.com e o docwiki da Embarcadero não eram legíveis (JavaScript ou 403); as aulas só afirmam o geral e mandam confirmar.
  - Equivalentes AWS: nomes de serviços confirmados só como páginas existentes (módulos 03, 06, 07, 10).
  - Artigos do RGPD citados no módulo 07 e fases do ADM do TOGAF (módulo 13) vêm de conhecimento geral: confirmar nas fontes.
  - Lista de características da ISO/IEC 25010 (módulo 02) e palavras-chave Gherkin em português.
  - Políticas de dados e permissões do Claude Code e do Codex (módulos 07 e 09) mudam: confirmar na documentação.
  - Domínios do AZ-305 baseados no guia de estudo de 17-04-2026.
- **Gerador:** não deixar `.md` fora das pastas de módulo na raiz do curso (rascunhos em `_rascunho/` são apanhados). O gerador também não renderiza itálico em títulos nem dentro de negrito: evitar.
