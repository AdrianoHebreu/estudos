# 05 Comandos slash do TUI

Os comandos slash são escritos no composer do terminal interativo. Escreve <code>/</code> para abrir a lista e continua a escrever para a filtrar. A lista pode variar com a versão, o modelo, as integrações e a configuração.

Um comando slash é processado pelo TUI. Por exemplo, <code>/review</code> inicia uma revisão da sessão atual; <code>codex review</code> é um comando de terminal para executar uma revisão sem TUI. Não confundas os dois.

## Sessão e conversa

| Comando | Explicação |
|---|---|
| <code>/clear</code> | Limpa a conversa visível e começa uma sessão nova no TUI. |
| <code>/new</code> | Inicia uma conversa nova na mesma interface. |
| <code>/compact</code> | Resume o histórico visível para libertar contexto. |
| <code>/rename</code> | Dá um nome reconhecível à conversa guardada. |
| <code>/copy</code> | Copia a última resposta concluída. |
| <code>/raw</code> | Alterna o modo de texto simples da janela do terminal. |
| <code>/resume</code> | Escolhe uma sessão anterior para continuar. |
| <code>/fork</code> | Cria uma conversa separada a partir da atual. |
| <code>/archive</code> | Arquiva a sessão atual e fecha o TUI. |
| <code>/delete</code> | Apaga a sessão e o respetivo histórico de forma permanente, após confirmação. |
| <code>/quit</code>, <code>/exit</code> | Fecha o CLI. Guarda ou confirma as alterações importantes antes de sair. |
| <code>/side</code>, <code>/btw</code> | Abre uma conversa temporária para uma pergunta paralela. |
| <code>/feedback</code> | Abre o envio de feedback e, se escolhido, de registos de diagnóstico. |

## Modelo, esforço e execução

| Comando | Explicação |
|---|---|
| <code>/model</code> | Escolhe o modelo e o esforço disponíveis para a sessão. |
| <code>/fast</code> | Ativa ou desativa Fast quando o catálogo do modelo o disponibiliza. |
| <code>/plan</code> | Entra no modo de planeamento e pode receber uma instrução de plano. |
| <code>/goal</code> | Define, mostra ou gere um objetivo persistente, conforme a versão. |
| <code>/permissions</code> | Ajusta as permissões que o TUI permite selecionar. |
| <code>/approve</code> | Pede uma repetição de uma ação recentemente negada por revisão automática, quando esse modo está ativo. |
| <code>/personality</code> | Escolhe um estilo de comunicação suportado pelo modelo. |
| <code>/status</code> | Mostra informação da sessão, configuração, contexto e limites disponíveis. |
| <code>/usage</code> | Consulta a utilização ou os limites apresentados pela conta. |
| <code>/experimental</code> | Apresenta funcionalidades experimentais que a instalação permite gerir. |
| <code>/debug-config</code> | Ajuda a inspecionar camadas de configuração e requisitos. |
| <code>/keymap</code> | Consulta ou altera os atalhos de teclado do TUI e guarda as alterações na configuração. |
| <code>/vim</code> | Ativa ou desativa o modo Vim no composer da sessão. |
| <code>/memories</code> | Define se a conversa pode usar ou criar memórias, quando a funcionalidade está disponível. |

## Ficheiros, integrações e subagentes

| Comando | Explicação |
|---|---|
| <code>/mention</code> | Seleciona ficheiros ou pastas para acrescentar ao contexto. |
| <code>/init</code> | Cria um esqueleto de instruções <code>AGENTS.md</code> no projeto. |
| <code>/mcp</code> | Lista os servidores ou ferramentas MCP configurados. |
| <code>/skills</code> | Explora e seleciona uma skill instalada. |
| <code>/agent</code>, <code>/subagents</code> | Inspeciona ou muda para a conversa de um subagente criado. |
| <code>/apps</code> | Explora aplicações conectadas que podem ser chamadas no prompt. |
| <code>/plugins</code> | Explora ou gere plugins disponíveis. |
| <code>/hooks</code> | Inspeciona hooks de ciclo de vida e confiança para hooks locais. |
| <code>/import</code> | Importa configurações compatíveis de Claude Code ou Cursor, quando disponível. |
| <code>/ide</code> | Acrescenta ao próximo pedido ficheiros abertos e a seleção atual do IDE conectado. |
| <code>/logout</code> | Termina a autenticação local do Codex. |

## Git, terminais e apresentação

| Comando | Explicação |
|---|---|
| <code>/diff</code> | Mostra alterações do Git, incluindo ficheiros ainda não acompanhados. |
| <code>/review</code> | Pede uma revisão da árvore de trabalho ou do alvo disponível no TUI. |
| <code>/ps</code> | Mostra terminais em segundo plano e a saída recente. |
| <code>/stop</code> | Para terminais em segundo plano iniciados pela sessão atual. |
| <code>/app</code> | Continua a sessão na aplicação de ambiente de trabalho, se suportada. |
| <code>/statusline</code> | Escolhe os campos apresentados no rodapé do TUI. |
| <code>/title</code> | Escolhe os campos apresentados no título da janela ou separador. |
| <code>/theme</code> | Escolhe um tema de realce de sintaxe. |
| <code>/pet</code>, <code>/pets</code> | Mostra, esconde ou escolhe uma mascote do terminal, se disponível. |
| <code>/setup-default-sandbox</code> | No Windows, configura o sandbox elevado quando o Codex apresenta o fluxo para sair do modo degradado. |
| <code>/sandbox-add-read-dir</code> | No CLI nativo do Windows, permite conceder leitura sandbox a uma pasta absoluta adicional. |

## Quatro comandos que vale a pena memorizar

- <code>/model</code> escolhe modelo e esforço; confirma com <code>/status</code>.
- <code>/permissions</code> mostra controlos para as permissões da sessão; a configuração da conta ou da organização pode limitar as escolhas.
- <code>/diff</code> apresenta o que mudou no repositório.
- <code>/compact</code> ajuda quando o histórico já não cabe confortavelmente no contexto.

Os comandos <code>/setup-default-sandbox</code> e <code>/sandbox-add-read-dir</code> são específicos do Windows. Alguns comandos, como <code>/ide</code>, <code>/memories</code> e <code>/fast</code>, só aparecem quando a integração, funcionalidade ou modelo os suporta.

## Atalhos e comandos em fila

O TUI pode aceitar atalhos de teclado e permite, em certas situações, escrever um slash command durante uma execução e colocá-lo em fila com Tab. Os atalhos e os momentos em que uma ação fica disponível variam. Usa <code>?</code> ou o help local para descobrir os atalhos da instalação.

## Exercícios

1. Usa <code>/model</code> e confirma o estado com <code>/status</code>.
2. Pede uma análise, executa uma pequena alteração e examina <code>/diff</code>.
3. Inicia uma tarefa longa e pratica <code>/compact</code> quando o histórico ficar extenso.
4. Distingue o comando TUI <code>/review</code> do comando de shell <code>codex review</code>.

## Fontes oficiais

- [Comandos slash do Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Referência do CLI](https://developers.openai.com/codex/cli/reference)
