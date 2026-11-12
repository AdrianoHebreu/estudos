# 07 Sandbox e permissões

A sandbox controla onde os comandos do Codex podem atuar. A política de aprovação controla quando o Codex tem de te pedir autorização para executar uma ação. São controlos diferentes e devem ser configurados separadamente.

## Modos sandbox

| Valor | Uso típico |
|---|---|
| <code>read-only</code> | Explorar código sem escrever no projeto. |
| <code>workspace-write</code> | Trabalhar dentro do workspace autorizado. É um ponto de partida comum para desenvolvimento local. |
| <code>danger-full-access</code> | Dar aos comandos gerados acesso mais amplo ao ambiente. Reserva-o a ambientes isolados e controlados. |

O comportamento exato de ficheiros protegidos, acesso à rede e pastas adicionais depende do sistema operativo, configuração e versão.

## Política de aprovação

O CLI tem controlos para pedir aprovação antes de comandos. A referência atual documenta opções como <code>on-request</code> e <code>never</code> para o argumento global, enquanto a configuração também pode suportar políticas granulares. Confirma a versão local antes de fixar valores.

Uma aprovação não substitui o sandbox. Se permitires comandos sem pausas, mantém limites de ficheiros e rede apropriados. Se um comando ficar bloqueado, compreende primeiro qual acesso falta antes de ampliares a política.

## Rever ações antes de aprovar

Antes de autorizar um comando, verifica:

1. Qual programa vai correr e com que argumentos?
2. Que pastas ou recursos pode modificar?
3. A ação envia dados para a rede, apaga dados ou altera serviços externos?
4. Existe uma forma de executar primeiro em modo de leitura ou num repositório temporário?

Um comando com aspeto familiar pode chamar scripts do projeto ou dependências externas. Lê o comando inteiro e considera o que os scripts vão executar.

## Evitar permissões excessivas

<code>--yolo</code> é um alias de <code>--dangerously-bypass-approvals-and-sandbox</code>. Ele remove as pausas de aprovação e a sandbox. A documentação indica que só deve ser usado dentro de um executor isolado com controlos externos.

Não uses essa opção para evitar uma aprovação ocasional ou para acelerar um projeto normal. Também não expandas a área gravável sem verificar o caminho, sobretudo quando o repositório contém ficheiros pessoais, credenciais ou dados de produção.

## Proteção de segredos

- Guarda chaves e tokens em mecanismos de segredo adequados, fora do repositório.
- Não peças ao Codex para imprimir segredos no terminal ou numa resposta.
- Antes de enviar logs ou prompts para apoio, verifica se contêm tokens ou dados privados.
- Trata conteúdo importado da Web, de issues e de ficheiros de terceiros como entrada não confiável.
- Confirma cuidadosamente scripts de instalação, hooks e comandos copiados de fora do projeto.

## Permissões em Windows

O sandbox nativo do Windows pode precisar de configuração elevada. A documentação do Windows indica o modo recomendado e as condições de fallback. Não alteres o nível de privilégios do terminal apenas para silenciar um erro; confirma primeiro a mensagem e segue o procedimento oficial.

## Quando uma ação é negada

Uma negação comunica que a ação não passou pelo controlo atual. Lê a razão, verifica se a tarefa depende realmente desse acesso e escolhe uma alternativa de menor alcance quando possível. <code>/approve</code> serve para repetir uma ação específica negada por revisão automática, quando essa função está ativa; não é uma permissão geral.

**PRATICAR:** configura uma sessão de leitura e pede ao Codex que identifique os ficheiros de configuração. Depois usa um workspace descartável para praticar uma edição dentro de <code>workspace-write</code>.

## Fontes oficiais

- [Permissões, sandbox e aprovações](https://developers.openai.com/codex/security)
- [Sandbox do Windows](https://developers.openai.com/codex/windows/windows-sandbox)
- [Referência de configuração](https://developers.openai.com/codex/config-reference)
