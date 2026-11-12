# 01 Instalar e iniciar o Codex CLI

## Instalação

A documentação oficial mantém vários métodos de instalação. Em Windows, consulta a secção Windows na página de instalação e escolhe a opção suportada para o teu ambiente. Se usares Node.js, a instalação global habitual é:

    npm install -g @openai/codex

Depois confirma que o executável responde:

    codex --version
    codex --help

Se o terminal disser que <code>codex</code> não existe, confirma que a instalação terminou e que a pasta de executáveis globais do npm está no <code>PATH</code>. Fecha e volta a abrir o terminal depois de alterar o PATH.

## Autenticação

Inicia sessão com:

    codex login

Escolhe um método que a tua conta disponibilize. O fluxo pode autenticar-se através de uma conta ChatGPT ou de credenciais de API, consoante a versão e a configuração. A autenticação de API e a utilização do Codex através de um plano ChatGPT são formas diferentes de acesso; uma não concede automaticamente acesso à outra.

Para terminar a sessão:

    codex logout

Não coloques uma chave API num prompt, num ficheiro versionado ou num exemplo partilhado. Usa o mecanismo de credenciais documentado para o método escolhido.

## Primeiro arranque

Abre o terminal na pasta do projeto. Confirma primeiro que estás na raiz correta:

    Get-Location
    git status --short

Inicia a interface interativa:

    codex

Pede inicialmente uma leitura do projeto, por exemplo:

> Explica a estrutura deste repositório. Indica o ponto de entrada, como executar os testes e quais pastas parecem gerar código. Não alteres ficheiros.

Este pedido limita a sessão a uma análise. Quando começares a pedir edições, especifica também o comportamento pretendido e como confirmar a alteração.

## Diagnóstico e atualização

Usa os comandos de diagnóstico e atualização documentados pela versão instalada:

    codex doctor
    codex update

<code>codex doctor</code> recolhe informação útil sobre a instalação, autenticação, configuração, Git e terminal. Lê o que o relatório contém antes de o partilhares. <code>codex update</code> verifica ou aplica uma atualização quando a versão instalada suporta atualização própria.

## Instalação verificada

Antes de começar uma tarefa, confirma estes três pontos:

1. <code>codex --version</code> devolve uma versão.
2. <code>codex login</code> termina sem erro e a conta tem acesso ao Codex.
3. <code>/model</code> ou a listagem equivalente apresenta pelo menos um modelo utilizável.

**DICA:** em caso de dúvida sobre parâmetros, usa <code>codex --help</code>, <code>codex login --help</code> ou <code>codex doctor</code>. A referência online pode documentar opções que ainda não chegaram à tua versão.

## Exercícios

1. Instala o CLI pelo método oficial indicado para o teu sistema.
2. Autentica-te e abre um repositório de prática.
3. Pede uma explicação do projeto sem permitir alterações.
4. Regista a versão e os modelos que a tua conta apresenta.

## Fontes oficiais

- [Codex CLI e instalação](https://developers.openai.com/codex/cli)
- [Comandos do Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Autenticação no CLI](https://developers.openai.com/codex/auth)
