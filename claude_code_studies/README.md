# Mini-Curso de Claude Code

Material de estudo sobre o Claude Code — a ferramenta de linha de comandos da Anthropic —
organizado em módulos numerados — da instalação até subagentes, skills, hooks, MCP e modo
headless. Cada módulo é um documento Word (`.docx`) independente, dentro da sua própria pasta.

Cada pasta tem também um `.pptx` companheiro — uma versão em slides do mesmo módulo,
visual e resumida (ícones, tabelas, gráficos e blocos de código, sem parágrafos de texto),
pensada para apresentar ou rever rapidamente. O Word continua a ser a referência completa;
o PowerPoint é o resumo visual. Os módulos 10-12 (exercícios, cheat sheet, gabarito) têm
decks mais curtos, de visão geral, que remetem para o Word para o detalhe completo.

## Como está organizado

Os números das pastas indicam a ordem recomendada de estudo. Cada documento é autónomo
(pode ser consultado isoladamente como referência), mas o conteúdo constrói-se sobre os
módulos anteriores.

| Pasta | Módulo | Conteúdo |
|---|---|---|
| `00-Introducao/` | 00 | Boas-vindas, índice do curso e como estudar cada módulo |
| `01-Fundamentos/` | 01 | O que é o Claude Code, requisitos, instalação e autenticação |
| `02-Interface-e-Fluxo-de-Trabalho/` | 02 | O terminal interativo, atalhos e modos de permissão |
| `03-Comandos-Slash/` | 03 | Os comandos `/` mais usados no dia a dia |
| `04-Ferramentas-e-Permissoes/` | 04 | As tools internas e o sistema `allow`/`ask`/`deny` |
| `05-CLAUDE-md-e-Memoria/` | 05 | Instruções persistentes, memória automática e gestão de contexto |
| `06-Subagentes-e-Skills/` | 06 | Criar subagentes e comandos slash personalizados (skills) |
| `07-Hooks-e-MCP/` | 07 | Automação com hooks e integrações com serviços externos |
| `08-Git-GitHub-e-Modo-Headless/` | 08 | Claude Code em fluxos de Git/PR e em scripts/CI |
| `09-Boas-Praticas/` | 09 | CLAUDE.md eficaz, custos, segurança e produtividade |
| `10-Exercicios-Praticos/` | 10 | 18 exercícios (iniciante → avançado) + projeto final |
| `11-Cheat-Sheet/` | 11 | Referência rápida com todos os comandos, organizados por tema |
| `12-Gabarito-dos-Exercicios/` | 12 | Solução sugerida e resultado esperado para cada exercício |

## Como estudar

1. Siga a ordem numérica dos módulos 00 a 09 (teoria), com um terminal aberto ao lado.
2. Depois de cada módulo teórico, resolva os exercícios correspondentes no **Módulo 10**
   (cada exercício indica em que módulo se baseia).
3. Use o **Módulo 11** como consulta rápida no dia a dia.
4. Confirme o seu trabalho no **Módulo 12** só depois de tentar resolver sozinho.

## Convenções usadas nos documentos

- **Blocos de código** — comandos para escrever no terminal ou exemplos de ficheiros.
- **DICA** — sugestões e atalhos.
- **ATENÇÃO** — operações de risco (permissões, hooks, automação).
- **PRATICAR** — remete para o exercício correspondente no Módulo 10.
- **NOTA** — contexto adicional ou aviso de que um detalhe pode variar entre versões.

## Aviso sobre atualidade

O Claude Code evolui rapidamente. Este curso foi escrito em setembro de 2026 com base na
documentação oficial (`code.claude.com/docs`). Sempre que um comando não se comportar
exatamente como descrito, confirme com `/help` ou `claude --help` na sua versão instalada.
