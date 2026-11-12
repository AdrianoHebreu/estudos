# 10 Skills, MCP, subagentes, plugins e hooks

O Codex pode ser ampliado de várias formas. Escolhe cada mecanismo segundo o tipo de comportamento ou acesso necessário.

## Skills

Uma skill empacota instruções para um fluxo de trabalho específico. Pode incluir referências e scripts auxiliares. Uma skill bem escrita indica claramente quando deve ser aplicada, os passos que tem de seguir e o que conta como resultado concluído.

No TUI, explora as skills disponíveis com <code>/skills</code>. Em produtos que suportam invocação por nome, o prompt pode referir a skill. Confirma o conteúdo antes de instalar skills de terceiros, porque uma skill pode influenciar instruções e executar ferramentas permitidas.

Usa uma skill quando várias tarefas repetem o mesmo processo. Usa AGENTS.md para as regras estáveis que se aplicam ao próprio repositório.

## MCP

Model Context Protocol liga o Codex a servidores que fornecem ferramentas ou contexto, por exemplo dados de um serviço externo. <code>codex mcp</code> gere servidores e <code>/mcp</code> mostra informação no TUI.

Antes de ligar um servidor:

1. Confirma quem o fornece e que permissões pede.
2. Limita credenciais e recursos ao que o fluxo precisa.
3. Aprende que ações as ferramentas podem fazer.
4. Testa primeiro com dados sem impacto.
5. Remove ou desativa a integração quando deixa de ser necessária.

Trata texto devolvido por um servidor como entrada. Uma issue, documento ou página pode conter instruções hostis que não devem substituir o teu pedido ou as regras do repositório.

## Subagentes

Subagentes podem explorar partes separáveis do trabalho em paralelo. São úteis quando cada parte tem um limite claro, por exemplo analisar módulos independentes e devolver observações ao agente principal.

Usa-os quando:

- a tarefa tem subproblemas que podem ser investigados em paralelo;
- cada subproblema tem resultados claros e verificáveis;
- o custo de coordenar resultados é inferior ao tempo poupado.

Não dividas tarefas pequenas ou dependentes em cadeia. Confirma como o agente principal integra e verifica o trabalho delegado. Algumas formas de paralelismo e os controlos Ultra dependem do modelo e do cliente.

## Plugins

Um plugin pode combinar skills, ferramentas, servidores MCP, comandos e outros recursos. <code>codex plugin</code> e <code>codex plugin marketplace</code> gerem instalações e fontes compatíveis.

Uma fonte de plugin pode acrescentar código e ferramentas. Confirma o dono, o conteúdo e as permissões pedidas. Não assumes que uma entrada do catálogo é adequada só por aparecer no CLI.

## Hooks

Hooks executam código em eventos do ciclo de vida do agente. Servem para verificações mecânicas ou automatizações previsíveis, como aplicar uma regra de formatação após uma alteração, se o hook e o evento forem suportados.

Como um hook é código executável:

- inspeciona o comando e o ficheiro antes de confiar nele;
- usa tarefas curtas e repetíveis;
- evita operações destrutivas ou com rede sem controlo;
- revê alterações ao hook antes de aprovar a confiança;
- considera a política da organização e o sandbox.

O comando <code>/hooks</code> pode apresentar gestão e confiança de hooks na versão atual. Os eventos, opções e garantias mudam; consulta a referência antes de criar uma integração.

## Escolher o mecanismo

| Necessidade | Mecanismo indicado |
|---|---|
| Regras permanentes de um repositório | AGENTS.md |
| Procedimento reutilizável e especializado | Skill |
| Acesso a ferramentas ou dados externos | Servidor MCP |
| Investigação paralela com limites definidos | Subagentes |
| Pacote de capacidades instalável | Plugin |
| Ação automática acionada por um evento | Hook |

Não instales ferramentas para resolver uma tarefa que uma instrução clara e um comando local já resolvem.

## Exercícios

1. Escolhe uma tarefa repetível e escreve o que teria de conter uma skill para a executar.
2. Avalia que permissões um servidor MCP precisaria e o que não deveria poder alterar.
3. Divide uma análise de três componentes em partes independentes; define o resultado que cada subagente deve devolver.
4. Escreve um hook hipotético para uma verificação mecânica e lista os riscos que tens de rever antes de o ativar.

## Fontes oficiais

- [Skills no Codex](https://developers.openai.com/codex/build-skills)
- [MCP no Codex](https://developers.openai.com/codex/extend/mcp)
- [Subagentes](https://developers.openai.com/codex/agent-configuration/subagents)
- [Hooks](https://developers.openai.com/codex/hooks)
- [Plugins](https://developers.openai.com/codex/plugins)
