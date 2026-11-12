# 02 Trabalhar com o Codex

## O ciclo de trabalho

Uma tarefa bem acompanhada costuma seguir este percurso:

1. Escolhe o repositório e verifica o estado do Git.
2. Descreve o resultado pretendido e os limites.
3. Dá ao Codex espaço para procurar o contexto relevante.
4. Revê a proposta ou a alteração e ajusta a instrução se necessário.
5. Pede a validação adequada ao projeto.
6. Lê o diff e decide o que fazer com as alterações.

O Codex pode executar comandos e alterar ficheiros, mas só deve fazê-lo dentro do ambiente e das permissões que escolheste. Uma resposta convincente não prova que o código compila nem que os testes cobrem o comportamento pedido.

## Escrever um pedido claro

Um pedido útil comunica quatro coisas:

- **Objetivo:** qual é o resultado que queres.
- **Contexto:** onde está o problema ou qual comportamento atual observas.
- **Limites:** que áreas não devem mudar, quais APIs ou padrões preservar.
- **Aceitação:** que evidência demonstrará que terminou.

Exemplo:

> Corrige o estado de carregamento do formulário de login. Quando o pedido falhar, a mensagem de erro deve continuar visível e o botão deve voltar a ficar ativo. Mantém o estilo atual, acrescenta ou ajusta o teste relevante e executa esse teste. No fim, resume os ficheiros alterados e o resultado do teste.

Este pedido deixa o Codex investigar a implementação sem obrigá-lo a seguir uma receita frágil. Se souberes uma restrição importante, como “não alterar o contrato HTTP”, inclui-a.

## Pedir análise antes de edição

Para uma tarefa incerta ou com várias partes, começa por explorar:

> Investiga por que motivo a sessão expira depois de renovar o token. Não alteres ficheiros. Aponta o fluxo provável, os ficheiros envolvidos e a evidência que falta.

Depois da resposta, decide se tens contexto suficiente para pedir a alteração. No TUI, <code>/plan</code> abre o modo de planeamento; podes pedir uma proposta antes de implementar.

## Corrigir uma tarefa sem recomeçar

Se a primeira tentativa falhar, dá informação observável:

> O teste auth/session.test.ts continua a falhar: esperava 401, mas recebeu 200 quando o token está expirado. Segue o ramo que decide o estado e corrige esse caso. Mantém a resposta de tokens válidos inalterada.

Evita apenas “não funciona”. Mensagem de erro, comando executado e resultado esperado reduzem as hipóteses que o agente tem de adivinhar.

## Contexto e sessão

Uma sessão reúne a conversa e o trabalho atual. Projetos grandes podem consumir muito contexto. Quando a conversa acumula investigação que já não é necessária, <code>/compact</code> resume o histórico visível para libertar espaço. Antes de iniciar uma sessão nova, regista as decisões e os comandos já confirmados.

Anexa apenas os ficheiros úteis à tarefa. Em prompts do TUI, <code>@</code> pode abrir a seleção de ficheiros ou pastas, conforme a versão. Evita fornecer segredos ou ficheiros com dados pessoais se não forem necessários.

## Interromper ou orientar

Durante uma execução longa, usa a tecla ou o comando de interrupção disponível na tua versão e envia uma instrução concreta. Podes corrigir o rumo em curso:

> Para antes de alterar o esquema. O código atual usa migrações SQL; primeiro mostra como a migração existente representa índices únicos.

Confirma depois em que ponto o agente parou. Uma interrupção não reverte alterações que já tenham sido gravadas.

## Verificação final

Pede ao Codex que indique:

- ficheiros e comportamento alterados;
- comandos executados e respetivos resultados;
- limitações ou verificações que não conseguiu fazer.

Confirma os resultados no terminal quando a consequência justificar:

    git diff --check
    git diff --stat
    git status --short

**PRATICAR:** usa um pedido de análise para encontrar o ponto de entrada do projeto. Depois pede uma alteração pequena, revê o diff e confirma manualmente que o ficheiro alterado corresponde à tarefa.

## Fontes oficiais

- [Codex CLI](https://developers.openai.com/codex/cli)
- [Boas práticas](https://learn.chatgpt.com/guides/best-practices)
- [Comandos do Codex CLI](https://developers.openai.com/codex/cli/reference)

