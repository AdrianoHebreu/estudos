# 00 Introdução e mapa do curso

## O que vais aprender

O Codex é um agente de programação que trabalha com o teu projeto. No CLI, descreves a tarefa em linguagem natural e o agente pode ler ficheiros, propor ou aplicar alterações e executar ferramentas locais dentro das permissões configuradas. O resultado depende do contexto fornecido, do modelo selecionado, das instruções do repositório e do ambiente de execução.

Este curso ensina a trabalhar com o Codex CLI desde o primeiro arranque até a tarefas repetíveis de desenvolvimento. O foco é dar instruções claras, escolher um modelo e esforço adequados, manter limites de segurança e verificar o resultado antes de o integrar.

## O que o Codex faz

Um agente de código coordena vários passos. Por exemplo, perante “corrige o erro de sessão e confirma o comportamento”, o Codex pode procurar a implementação, ler os testes existentes, propor uma alteração, editar ficheiros e correr comandos permitidos. Tu continuas responsável por confirmar a adequação da solução e por decisões como publicar, fazer merge ou apagar dados.

O CLI é uma das superfícies do Codex. A aplicação de ambiente de trabalho, a extensão de IDE e os fluxos na cloud podem oferecer partes semelhantes, mas os comandos e controlos visíveis variam. Este curso descreve especificamente o terminal interativo chamado **TUI** e os comandos de shell <code>codex</code>.

## O que precisas

- Um computador com um terminal e acesso ao teu projeto.
- Uma instalação atual do Codex CLI e um método de autenticação suportado pela tua conta.
- Um repositório de prática que possas alterar e restaurar.
- Familiaridade básica com pastas, ficheiros e comandos do teu sistema operativo.

Não precisas de memorizar todos os comandos. O curso mostra como descobrir as opções aceites pela tua própria versão.

## Mapa de aprendizagem

| Etapa | Pergunta respondida |
|---|---|
| Fundamentos | Como instalo, inicio sessão e começo uma conversa? |
| Trabalho diário | Como explico um objetivo e acompanho o que o agente altera? |
| Modelos e esforço | Qual modelo serve melhor a tarefa e quando aumento o esforço? |
| Referência do CLI | Como inicio, retomo, revejo ou automatizo uma sessão? |
| Configuração e segurança | Onde defino instruções e limites de acesso? |
| Integrações | Quando usar skills, MCP, subagentes, plugins ou hooks? |

## Uma regra para todo o curso

Trata o trabalho do Codex como uma alteração de código feita por um colaborador. Explica o resultado esperado, indica limites relevantes e pede evidência de validação. Depois lê o diff e decide se a alteração serve ao projeto.

## Preparar um espaço de prática

Cria ou escolhe um repositório sem dados importantes. Confirma que o Git está limpo antes de começar:

    git status --short
    git branch --show-current

Se o projeto tiver alterações que ainda não guardaste, cria um commit, uma branch ou outro ponto de recuperação antes de experimentar. Não peças ao agente para “limpar tudo” sem especificar o que pode remover.

**PRATICAR:** antes de avançar, identifica o comando de testes do teu projeto e confirma que consegues restaurar uma alteração local.

## Fontes oficiais

- [Introdução ao Codex CLI](https://developers.openai.com/codex/cli)
- [Boas práticas com Codex](https://learn.chatgpt.com/guides/best-practices)

