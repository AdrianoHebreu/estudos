# 08 Git, revisão e desenvolvimento

Git dá-te uma visão clara do estado inicial e das alterações que surgem durante uma tarefa. Usa-o como parte do fluxo com o Codex, mesmo que o teu projeto tenha também outro sistema de controlo de versões.

## Antes de pedir uma alteração

    git status --short
    git branch --show-current
    git diff --stat

Se já tens alterações locais, identifica-as antes da tarefa. Cria um ponto de recuperação quando a alteração for arriscada. O Codex deve saber se pode editar o trabalho em curso ou se deve evitar certas áreas.

## Dividir uma alteração em passos

Para uma funcionalidade ou correção:

1. Pede ao Codex que localize a implementação e o teste atual.
2. Explica o comportamento observado e o comportamento esperado.
3. Define os ficheiros ou contratos que não devem mudar, se forem relevantes.
4. Pede uma alteração focada.
5. Executa o teste mais próximo do comportamento.
6. Revê o diff e, depois, os testes relacionados mais amplos.

Se o plano revelar uma migração de dados, uma mudança no contrato público ou um refactor extenso, confirma o alcance antes de continuar.

## Inspecionar alterações

No TUI:

    /diff

No terminal:

    git diff --check
    git diff --stat
    git diff
    git status --short

Lê também os ficheiros novos, porque um diff convencional pode não apresentar conteúdo não acompanhado da mesma forma em todas as ferramentas. Confirma que não foram incluídos artefactos gerados, logs ou dados que não deviam ir para Git.

## Revisão com Codex

O comando interativo <code>/review</code> pode iniciar uma review dentro do TUI. O comando de terminal <code>codex review</code> executa uma review sem a interface:

    codex review --uncommitted
    codex review --base main
    codex review --commit abc1234

Escolhe um alvo por chamada. A review procura problemas; analisa cada observação no contexto e confirma os casos importantes com testes ou inspeção do código.

## Testes e critérios de conclusão

Indica ao Codex o comando relevante ou pede-lhe que o descubra no projeto. Distingue estes resultados:

- teste executado e aprovado;
- teste executado e reprovado;
- teste não executado;
- teste não aplicável ou ambiente indisponível.

Pede o nome do comando e o resultado. Não descrevas uma alteração como verificada se o comando não foi executado.

## Commit e integração

Revê o diff antes de criar commits. Podes pedir ao Codex uma proposta de mensagem, mas confirma os ficheiros que entram no commit. A decisão de publicar, abrir uma pull request ou fazer merge deve seguir as regras do teu projeto.

Um prompt final útil é:

> Resume a alteração, enumera os ficheiros tocados, indica os comandos executados e assinala verificações em falta. Não cries commit.

## Tarefas comuns

### Corrigir um bug

Pede reprodução, rastreio do ramo relevante, correção mínima e teste que falhava antes da correção. Evita alterar módulos não relacionados.

### Refatorar

Define a estrutura que pretendes preservar e o comportamento que os testes têm de manter. Se a refatoração for grande, pede primeiro um mapa das dependências.

### Rever uma pull request

Indica a branch base ou o commit a comparar. Pede observações com ficheiro, linha aproximada, condição que aciona o problema e impacto. Distingue bugs de preferências estilísticas.

### Documentar

Pede que a documentação corresponda ao comportamento verificado no código. Confirma exemplos de comandos para evitar ensinar opções antigas.

## Fontes oficiais

- [Boas práticas do Codex](https://learn.chatgpt.com/guides/best-practices)
- [Comandos do CLI e review](https://developers.openai.com/codex/cli/reference)
- [Git worktrees no Codex](https://developers.openai.com/codex/environments/git-worktrees)
