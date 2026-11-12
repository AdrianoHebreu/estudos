# 09 Execução sem interface e automação

<code>codex exec</code> corre uma tarefa sem abrir o TUI. É útil para scripts locais, tarefas repetíveis e pipelines que precisam de um resultado estruturado. Uma execução automatizada deve ter âmbito, permissões e critérios de saída claros.

## Prompt direto

    codex exec "Resume a estrutura do projeto sem alterar ficheiros"

Define o repositório com <code>-C</code> e escolhe um modelo quando for preciso:

    codex exec -C . -m gpt-6-luna "Lista os testes de autenticação"

## Ler instruções por stdin

Para prompts guardados num ficheiro:

    Get-Content tarefa.txt | codex exec -

O traço indica ao CLI que leia a instrução através da entrada padrão. Confirma o quoting e a passagem de encoding na shell que usas.

## Saída JSONL

    codex exec --json "Explica as alterações deste ramo"

Com <code>--json</code>, o CLI escreve eventos JSONL em vez de uma resposta formatada para leitura humana. Cada linha é um evento; um consumidor deve interpretar o tipo do evento e tratar eventos desconhecidos com segurança.

Para guardar a última mensagem final num ficheiro:

    codex exec --output-last-message resposta.txt "Resume a correção"

Usa <code>--output-schema</code> quando um script consumidor precisa de validar a forma da resposta:

    codex exec --output-schema resultado.schema.json "Extrai os campos definidos no esquema"

Um esquema valida estrutura, não garante que os valores estejam corretos. Verifica também o código de saída e os efeitos no repositório.

## Retomar uma execução

O CLI pode retomar sessões de exec pelo identificador ou pela execução mais recente:

    codex exec resume --last "Continua e executa o teste relacionado"

Guarda o identificador quando o processo que inicia a sessão precisar de retomá-la noutra etapa. As opções e o âmbito da pesquisa de sessões dependem da versão; consulta <code>codex exec resume --help</code>.

## Execução temporária

    codex exec --ephemeral "Analisa este erro"

O modo efémero evita guardar os ficheiros de sessão da execução. Não o confundas com apagar as alterações do código: uma escrita dentro do workspace continua a existir e tem de ser revista.

## Automação segura

- Mantém <code>read-only</code> para tarefas de análise automatizada.
- Usa <code>workspace-write</code> quando a tarefa realmente precisa de editar o repositório.
- Não ponhas <code>--yolo</code> num script geral ou CI partilhado.
- Limita os comandos, as pastas e as variáveis de ambiente disponíveis.
- Define timeout e trata estados de erro ou saída incompleta.
- Revê os logs antes de os guardar; não incluas credenciais.
- Processa os resultados como dados não confiáveis, sobretudo se vierem de issues ou da Web.

## Padrão de pipeline

Num job de CI, fixa a revisão e o objetivo, usa um checkout isolado e captura o código de saída. Conserva só os artefactos necessários e exige revisão humana antes de integrar código. Para tarefas que escrevem código, produz um diff numa branch ou checkout temporária.

## Tarefas de Codex na cloud

<code>codex cloud</code> é um comando experimental para consultar ou executar chats da cloud pelo terminal. <code>codex apply</code> aplica localmente um diff produzido numa tarefa cloud, se a conta e a tarefa estiverem acessíveis. Confirma o diff resultante antes de o integrar.

**PRATICAR:** automatiza uma análise read-only que imprime JSONL. Depois escreve um pequeno consumidor que conta eventos sem assumir que todas as versões emitem exatamente os mesmos tipos.

## Fontes oficiais

- [Modo não interativo](https://developers.openai.com/codex/non-interactive-mode)
- [Referência de comandos do CLI](https://developers.openai.com/codex/cli/reference)
- [Segurança, sandbox e aprovações](https://developers.openai.com/codex/security)
