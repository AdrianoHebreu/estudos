# 03 Escolher modelo e esforço

**Estado desta aula: 1 de outubro de 2026.** A disponibilidade varia por conta, plano, cliente, versão e políticas da organização. O seletor <code>/model</code> mostra os modelos que a tua instalação pode usar.

## Modelos principais no Codex

| Modelo | Identificador usado no CLI | Perfil de utilização |
|---|---|---|
| GPT-6 Astra | <code>gpt-6-astra</code> | Maior capacidade para tarefas exigentes que cruzam código, ferramentas e investigação |
| GPT-6.1 Sol | <code>gpt-6.1-sol</code> | Trabalho complexo e prolongado com um equilíbrio entre capacidade e custo |
| GPT-6 Luna | <code>gpt-6-luna</code> | Tarefas focadas, repetíveis e de elevado volume |
| GPT-6 Sol | <code>gpt-6-sol</code> | Modelo da geração GPT-6 anterior, ainda visível durante transições para algumas contas |
| GPT-5.6 Sol, Terra e Luna | <code>gpt-5.6-sol</code>, <code>gpt-5.6-terra</code>, <code>gpt-5.6-luna</code> | Família anterior que pode continuar disponível durante a transição |

Na documentação atual, GPT-6.1 Sol é a recomendação para fluxos complexos de código e agentes quando está disponível. Astra destina-se ao trabalho mais exigente; Luna é eficiente quando o objetivo e o resultado esperado estão bem delimitados. A conta pode apresentar uma lista diferente.

## O que significa esforço

O esforço de raciocínio controla quanto trabalho o modelo dedica à análise antes de responder ou agir. Aumentá-lo pode ajudar quando existem dependências, hipóteses ou decisões difíceis, mas tende a aumentar latência e consumo. Um modelo forte com uma instrução vaga continua sem saber qual resultado aceitas.

Os nomes podem surgir traduzidos ou abreviados no interface:

| Rótulo possível | Valor de configuração habitual | Quando começar |
|---|---|---|
| Light / Baixo | <code>low</code> | Extração, pergunta objetiva, edição pequena e delimitada |
| Medium / Médio | <code>medium</code> | Pequena funcionalidade, comparação de opções ou diagnóstico conhecido |
| High / Alto | <code>high</code> | Depuração com várias causas, alterações em vários ficheiros, plano técnico |
| Extra High | <code>xhigh</code> | Trabalho difícil com mais etapas, evidência ou compromissos |
| Max | <code>max</code> | Problema muito exigente em que profundidade vale mais do que rapidez |
| Ultra | <code>ultra</code> | Quando a interface o oferece e a tarefa pode ser dividida entre subagentes |

O CLI aceita níveis anunciados pelo modelo e pelo cliente. <code>low</code>, <code>medium</code>, <code>high</code>, <code>xhigh</code>, <code>max</code> e <code>ultra</code> aparecem na referência atual de configuração, mas nenhum modelo ou conta tem de disponibilizar todos. Os níveis não se traduzem de forma exata entre gerações.

**Max e Ultra têm significados diferentes.** Max concede mais trabalho ao modelo numa tarefa. Ultra usa subagentes para tratar partes separáveis em paralelo, se esse controlo estiver disponível. Não uses Ultra para uma tarefa pequena ou para várias subtarefas que dependem umas das outras.

## Esforço por modelo

| Modelo | O que a documentação atual permite afirmar | Ponto de partida |
|---|---|---|
| GPT-6 Astra | A configuração <code>low</code> corresponde ao rótulo Light. A seleção efetiva depende do cliente e da conta; níveis mais elevados podem ser disponibilizados no seletor. | <code>low</code> para trabalho simples; <code>medium</code> ou <code>high</code> para análise. Sobe para <code>xhigh</code>/<code>max</code> quando a tarefa justificar o tempo adicional. |
| GPT-6.1 Sol | A seleção publicada para Codex varia entre Light e Ultra. Max e Ultra dependem das definições da conta e do cliente. | <code>medium</code> para desenvolvimento diário; <code>high</code> para diagnóstico ou alteração com várias etapas. |
| GPT-6 Luna | Pode usar esforço até Max; a documentação indica que não suporta Ultra. | A orientação do Codex usa High como ponto de partida recomendado para Luna. Para uma tarefa mecânica e bem delimitada, experimenta <code>low</code> se estiver disponível e confirma que a qualidade continua suficiente. |
| GPT-6 Sol | Pode continuar na lista de alguns utilizadores. Confirma os níveis no seletor e na configuração aceite pela versão instalada. | Mantém o valor anunciado pela instalação e compara com uma tarefa conhecida antes de mudar. |
| GPT-5.6 | A família pode continuar disponível durante a transição. Os valores e predefinições diferem dos modelos GPT-6. | Consulta o modelo concreto no seletor. Não assumes que <code>none</code> ou <code>minimal</code> existe em todos os modelos. |

Codex tem controlos próprios e a API tem parâmetros com nomes semelhantes. Não uses uma lista da API como se fosse a lista garantida do CLI.

## Escolha por tipo de tarefa

Esta matriz transforma a orientação oficial em pontos de partida práticos. Ajusta-a segundo os resultados do teu projeto.

| Tarefa | Modelo inicial | Esforço inicial | Porquê |
|---|---|---|---|
| Explicar um ficheiro, localizar um símbolo ou extrair dados | GPT-6 Luna | <code>low</code> | O âmbito e o resultado podem ser descritos com clareza |
| Alteração pequena com teste existente | GPT-6 Luna | <code>low</code> ou <code>medium</code> | Mantém o ciclo rápido; aumenta se houver lógica não óbvia |
| Renomeação ou transformação repetível em muitos ficheiros | GPT-6 Luna ou GPT-6.1 Sol | <code>medium</code> | Luna serve lotes previsíveis; Sol ajuda quando há exceções |
| Bug com causa conhecida e reprodução clara | GPT-6 Luna ou GPT-6.1 Sol | <code>medium</code> | Escolhe Sol quando a correção atravessa componentes |
| Bug de origem incerta em vários módulos | GPT-6.1 Sol | <code>high</code> | Exige seguir estados e testar hipóteses |
| Funcionalidade com vários ficheiros e critérios definidos | GPT-6.1 Sol | <code>medium</code> ou <code>high</code> | Boa escolha para trabalho técnico que provavelmente será revisto |
| Migração ou decisão arquitetural com compromissos | GPT-6.1 Sol ou GPT-6 Astra | <code>high</code> ou <code>xhigh</code> | O custo de uma hipótese errada justifica mais análise |
| Trabalho ambicioso com fontes, ferramentas e várias entregas | GPT-6 Astra | <code>medium</code> ou <code>high</code> | Adequado a um fluxo longo que exige manter decisões e critérios |
| Problema excecionalmente difícil | GPT-6 Astra | <code>max</code>, se disponível | Reserva o esforço máximo para tarefas em que a diferença importa |
| Trabalho com partes realmente independentes | Modelo com Ultra disponível | <code>ultra</code>, se disponível | Subagentes permitem avançar em partes separáveis em paralelo |

Quando qualidade e tempo têm o mesmo peso, compara duas configurações com o mesmo prompt e critérios de aceitação. Escolhe a combinação menos dispendiosa que atinge a qualidade necessária.

## Alterar o modelo e esforço

No TUI, escreve <code>/model</code>, escolhe o modelo e, se estiver disponível, o nível de esforço. Confirma a alteração com <code>/status</code>.

Para uma sessão iniciada pela linha de comandos:

    codex -m gpt-6.1-sol -c 'model_reasoning_effort="high"'

Também podes definir valores predefinidos no ficheiro de configuração:

    model = "gpt-6.1-sol"
    model_reasoning_effort = "medium"

Se o CLI rejeitar um valor, consulta <code>codex --help</code>, <code>/model</code> e a referência de configuração da versão instalada. Uma política da organização pode limitar os valores disponíveis.

## Fontes oficiais

- [Modelos e disponibilidade no Codex](https://developers.openai.com/codex/models)
- [Referência de configuração do Codex](https://developers.openai.com/codex/config-reference)
- [Seleção de modelos e esforço](https://developers.openai.com/api/docs/guides/model-selection)
- [Modelos de raciocínio](https://developers.openai.com/api/docs/guides/reasoning)
