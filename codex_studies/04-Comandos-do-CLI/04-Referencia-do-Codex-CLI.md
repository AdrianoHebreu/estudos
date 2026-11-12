# 04 Referência do Codex CLI

Esta aula descreve comandos escritos no terminal. A interface interativa tem comandos diferentes, escritos com <code>/</code>; vê o módulo 05.

## Forma geral

    codex [opções globais] [pedido]
    codex <comando> [opções do comando] [pedido]

Sem subcomando, <code>codex</code> abre o TUI. Um prompt opcional inicia uma conversa com uma instrução inicial. Para ver a sintaxe exata da tua versão, executa <code>codex --help</code> ou <code>codex <comando> --help</code>.

## Comandos de topo

| Comando | O que faz | Estado documentado |
|---|---|---|
| <code>codex</code> | Abre o TUI interativo. | Estável |
| <code>codex app</code> | Abre a aplicação de ambiente de trabalho, se estiver instalada. | Estável |
| <code>codex app-server</code> | Inicia o servidor local do protocolo app-server para clientes ou depuração. | Experimental |
| <code>codex apply</code> | Aplica ao repositório local o diff de uma tarefa Codex na cloud. Alias: <code>codex a</code>. | Estável |
| <code>codex archive</code> | Arquiva uma sessão guardada. | Estável |
| <code>codex cloud</code> | Lista ou executa tarefas Codex na cloud pelo terminal. Alias: <code>codex cloud-tasks</code>. | Experimental |
| <code>codex completion</code> | Gera complementação de comandos para Bash, Zsh, Fish ou PowerShell. | Estável |
| <code>codex debug</code> | Fornece comandos de diagnóstico avançado, como <code>models</code> e <code>prompt-input</code>. | Experimental |
| <code>codex delete</code> | Apaga permanentemente uma sessão pelo identificador ou nome. | Estável |
| <code>codex doctor</code> | Recolhe diagnóstico de instalação, autenticação, configuração e ambiente. | Estável |
| <code>codex exec</code> | Executa uma tarefa sem abrir o TUI. Alias: <code>codex e</code>. | Estável |
| <code>codex execpolicy</code> | Verifica como regras de execução classificam um comando. | Experimental |
| <code>codex features</code> | Lista ou altera flags de funcionalidades guardadas na configuração. | Estável |
| <code>codex fork</code> | Cria uma nova conversa a partir de uma sessão anterior. | Estável |
| <code>codex login</code> | Autentica o CLI. | Estável |
| <code>codex logout</code> | Remove credenciais guardadas localmente. | Estável |
| <code>codex mcp</code> | Lista, adiciona, remove ou autentica servidores MCP. | Estável |
| <code>codex plugin</code> | Instala, lista ou remove plugins de fontes configuradas. | Estável |
| <code>codex plugin marketplace</code> | Gere marketplaces de plugins. | Estável |
| <code>codex remote-control</code> | Inicia ou gere o controlo remoto e o emparelhamento local. | Experimental |
| <code>codex resume</code> | Retoma uma sessão interativa anterior. | Estável |
| <code>codex review</code> | Faz uma revisão não interativa de alterações Git ou de instruções de review. | Estável |
| <code>codex sandbox</code> | Executa comandos dentro dos ambientes sandbox documentados. | Estável |
| <code>codex unarchive</code> | Restaura uma sessão arquivada. | Estável |
| <code>codex update</code> | Atualiza o CLI quando a instalação suporta atualização própria. | Estável |

As etiquetas indicam a maturidade publicada na referência atual, não garantem que o comando exista em versões antigas. Comandos experimentais podem mudar mais depressa.

## Opções globais mais úteis

| Opção | Utilização |
|---|---|
| <code>-C</code>, <code>--cd</code> | Define a pasta de trabalho antes de iniciar. |
| <code>-m</code>, <code>--model</code> | Escolhe um modelo disponível na conta. |
| <code>-c</code>, <code>--config</code> | Define uma sobreposição TOML para esta invocação. Pode repetir-se. |
| <code>-p</code>, <code>--profile</code> | Carrega um perfil de configuração nomeado. |
| <code>-s</code>, <code>--sandbox</code> | Escolhe <code>read-only</code>, <code>workspace-write</code> ou <code>danger-full-access</code>. |
| <code>-a</code>, <code>--ask-for-approval</code> | Controla quando o CLI pede aprovação, segundo os valores aceites pela versão. |
| <code>--add-dir</code> | Acrescenta uma pasta com acesso de escrita. |
| <code>-i</code>, <code>--image</code> | Anexa imagem ou imagens ao pedido inicial. |
| <code>--search</code> | Ativa pesquisa Web ao vivo, se disponível. |
| <code>--enable</code>, <code>--disable</code> | Ativa ou desativa uma funcionalidade suportada. |
| <code>--oss</code>, <code>--local-provider</code> | Usa um fornecedor local compatível, como Ollama ou LM Studio. |
| <code>--strict-config</code> | Falha se a configuração contiver campos desconhecidos para esta versão. |
| <code>--no-alt-screen</code> | Ajusta a apresentação do TUI para terminais que não lidam bem com ecrã alternativo. |
| <code>--remote</code> | Liga o cliente a um app-server remoto suportado. |

### Opções de acesso elevado

<code>--dangerously-bypass-approvals-and-sandbox</code> (alias <code>--yolo</code>) ignora aprovações e o sandbox. A documentação reserva esta opção para um executor isolado e protegido por controlos externos. Não é uma forma normal de corrigir problemas de permissões.

<code>--dangerously-bypass-hook-trust</code> permite executar hooks sem confiança persistida para aquela invocação. Usa-o apenas em automação que já tenha verificado a origem dos hooks.

## Sessões e autenticação

    codex login
    codex logout
    codex resume
    codex resume <ID-da-sessao>
    codex fork
    codex archive <ID-da-sessao>
    codex unarchive <ID-da-sessao>
    codex delete <ID-da-sessao>

Retomar mantém a conversa anterior. Fazer fork preserva o histórico original e abre uma linha de exploração separada. Arquivar remove uma sessão das listas ativas sem a apagar; apagar é permanente segundo a referência do CLI.

## Execução sem TUI

    codex exec "Explica a estrutura do projeto"
    codex exec --json "Resume as alterações pendentes"
    codex exec --output-last-message resumo.txt "Resume este repositório"

<code>codex exec</code> serve para scripts e CI. A saída JSON usa eventos JSONL. Confirma o código de saída, o estado do repositório e o conteúdo final antes de encadear a saída a outra ferramenta.

## Revisão de código

    codex review --uncommitted
    codex review --base main
    codex review --commit <SHA>

Escolhe um alvo de revisão de cada vez. Podes dar instruções adicionais depois das opções. Review aponta problemas possíveis; continua a ser necessário julgar se cada observação se aplica ao projeto.

## Estado do catálogo local

    codex debug models
    codex debug models --bundled

Este comando experimental mostra o catálogo que o CLI conhece. O seletor <code>/model</code> continua a ser uma forma mais simples de escolher entre modelos que a tua conta pode utilizar.

**DICA:** usa <code>codex --help</code> como índice e o help do subcomando como referência final. Esta aula resume os comandos publicados em 1 de outubro de 2026; não substitui a saída da instalação.

## Exercícios

1. Inicia o TUI num repositório usando <code>-C</code>.
2. Lista os comandos de <code>codex exec</code> com o respetivo help.
3. Faz uma review das alterações não commitadas.
4. Identifica na referência local um comando experimental e explica por que motivo deves confirmar a sua sintaxe.

## Fontes oficiais

- [Referência de comandos do Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Instalação e início rápido](https://developers.openai.com/codex/cli)
- [Modelos disponíveis no Codex](https://developers.openai.com/codex/models)
