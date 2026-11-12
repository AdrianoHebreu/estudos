# Curso de Git de A a Z

Material de estudo completo sobre Git, organizado em módulos numerados — do primeiro
`git init` até rebase interativo, resolução de conflitos e trabalho em equipa. Cada módulo
é um documento Word (`.docx`) independente, dentro da sua própria pasta.

Cada pasta tem também um `.pptx` companheiro — uma versão em slides do mesmo módulo,
visual e resumida (ícones, tabelas, gráficos e blocos de código, sem parágrafos de texto),
pensada para apresentar ou rever rapidamente. O Word continua a ser a referência completa;
o PowerPoint é o resumo visual. Os módulos 11-13 (exercícios, cheat sheet, gabarito) têm
decks mais curtos, de visão geral, que remetem para o Word para o detalhe completo.

## Como está organizado

Os números das pastas indicam a ordem recomendada de estudo. Cada documento é autónomo
(pode ser consultado isoladamente como referência), mas o conteúdo constrói-se sobre os
módulos anteriores.

| Pasta | Módulo | Conteúdo |
|---|---|---|
| `00-Introducao/` | 00 | Boas-vindas, índice do curso e como estudar cada módulo |
| `01-Fundamentos/` | 01 | O que é controlo de versões, conceitos-base e vocabulário essencial |
| `02-Instalacao-e-Configuracao/` | 02 | Instalar o Git, configurar identidade, editor e acesso ao GitHub |
| `03-Comandos-Basicos/` | 03 | `init`, `clone`, `status`, `add`, `commit`, `log`, `diff`, `.gitignore` |
| `04-Repositorios-Remotos/` | 04 | `remote`, `push`, `pull`, `fetch` — trabalhar com o GitHub |
| `05-Branches-e-Fluxos-de-Trabalho/` | 05 | Criar/combinar branches, merge local vs. merge no remoto, Git Flow, GitHub Flow |
| `06-Desfazer-Alteracoes/` | 06 | `restore`, `reset`, `revert`, `stash`, `reflog` |
| `07-Trabalho-em-Equipa/` | 07 | Pull Requests, code review, convenções de equipa, branch protection |
| `08-Conflitos-Commit-e-Merge/` | 08 | Entender, resolver e prevenir conflitos — passo a passo |
| `09-Git-Avancado/` | 09 | `rebase -i`, `cherry-pick`, `bisect`, tags, hooks, submódulos, worktree |
| `10-Boas-Praticas/` | 10 | Mensagens de commit, versionamento semântico, segurança, checklist de PR |
| `11-Exercicios-Praticos/` | 11 | 23 exercícios (iniciante → avançado) + projeto final de simulação de equipa |
| `12-Cheat-Sheet/` | 12 | Referência rápida com todos os comandos do curso, organizados por tema |
| `13-Gabarito-dos-Exercicios/` | 13 | Solução sugerida e resultado esperado para cada exercício do Módulo 11 |

## Como estudar

1. Siga a ordem numérica dos módulos 00 a 10 (teoria).
2. Depois de cada módulo teórico, resolva os exercícios correspondentes no **Módulo 11**
   (cada exercício indica em que módulo se baseia).
3. Use o **Módulo 12** como consulta rápida no dia a dia, sem precisar de reabrir os
   módulos inteiros.
4. Confirme o seu trabalho no **Módulo 13** só depois de tentar resolver sozinho — é aí
   que a aprendizagem acontece.

## Convenções usadas nos documentos

- **Blocos de código** — comandos para escrever no terminal ou output do Git.
- **DICA** — sugestões e atalhos.
- **ATENÇÃO** — operações de risco (podem apagar trabalho ou reescrever histórico).
- **PRATICAR** — remete para o exercício correspondente no Módulo 11.
- **NOTA** — contexto adicional ou detalhe técnico opcional.
