# Cloud Integration e o percurso da mensagem

Neste módulo vais construir o fluxo mais pequeno possível, publicá-lo, ver a mensagem a atravessar cada passo no monitor e abrir o ficheiro que o editor exporta. No fim sabes distinguir três coisas que a maioria dos principiantes confunde: o desenho guardado, o fluxo que está a correr e o registo de uma execução.

**NOTA:** tudo o que está marcado como observado foi visto num tenant trial do Integration Suite (região us10) e no ficheiro exportado do fluxo Groovy_Ola. A SAP muda os nomes dos menus e das versões dos passos com frequência: confirma no teu ecrã.

## Onde estás: o mapa do tenant

Ao abrir o Integration Suite, o menu lateral mostra estas áreas (observado):

| Menu | Para quê (resumo: confirma no teu tenant) | O que contém |
|---|---|---|
| Home | Ponto de partida | Atalhos e resumo |
| Discover | Encontrar conteúdo pronto | Integrations e Type Systems |
| Design | Construir | Integrations and APIs, B2B Scenarios, Custom Type Systems, MIGs e MAGs |
| Modernize | Migrar de outros produtos | Ferramentas de migração |
| Monitor | Ver o que correu | Integrations and APIs e B2B Scenarios |
| Inspect | Inspecionar | Ferramentas de análise |
| Settings | Configurar | Definições do tenant |

Neste módulo usas só duas áreas: **Design, Integrations and APIs** para construir, e **Monitor, Integrations and APIs** para ver o resultado. Em Design vês uma lista de pacotes com as colunas Name, Mode, Version, Created By, Created Date, Description e Action. Um pacote editável aparece com o modo «Editable» e a versão «1.0».

## Pacote, artefacto e execução

Um **pacote** agrupa artefactos de integração. Um **iFlow** (integration flow) é um desses artefactos e descreve a sequência de eventos, passos e ligações. O editor guarda o desenho, e o **deploy** publica uma versão para correr no runtime.

O cabeçalho do editor mostra o estado dessa publicação. Observado:

| Momento | Deployment Status | Runtime Status |
|---|---|---|
| Fluxo acabado de criar | Not Deployed | não mostrado |
| Depois do deploy | Deployed on Nov 23, 2026, 09:41:20 | Started |

Uma alteração guardada no editor só afeta o que corre depois de ser publicada com sucesso. Esta é a primeira regra de diagnóstico: antes de procurares um erro no fluxo, confirma que estás a olhar para a versão que está publicada.

## O editor por dentro

O desenho de um fluxo tem sempre as mesmas peças (observado):

- **Integration Process**: a caixa grande onde ficam os passos, ligados por setas.
- **Receiver**: um participante fora da caixa. Só se liga a ele um fluxo que envie a mensagem para um sistema externo; no nosso fluxo ficou sem ligações.
- **A barra de pesquisa «Search and Add a Step»** no topo, e um menu de ícones à volta do passo selecionado.

Ao selecionar um passo, o painel inferior mostra os separadores desse passo:

| Passo | Separadores | Campos que usámos |
|---|---|---|
| Timer Start | General e Scheduler | Basic, Enter As: Simple Schedule, Repeat: None, Schedule: On Deployment |
| Content Modifier | General, Message Header, Exchange Property e Message Body | Message Body: Type: Constant e o campo Body |
| Groovy Script | General e Processing | Script File: /script/script1.groovy (com o botão Select) e Script Function |

Com «Repeat: None» e «Schedule: On Deployment», o fluxo correu uma vez, no momento do deploy.

## Corpo, cabeçalhos e propriedades

Uma mensagem tem três lugares onde guarda informação, e escolher o certo evita muitos erros:

| Parte | Função | Exemplo |
|---|---|---|
| Corpo (body) | Dados processados pelo fluxo | JSON da encomenda |
| Cabeçalhos (headers) | Metadados usados pelos passos e pelos adaptadores | Content-Type |
| Propriedades de troca (exchange properties) | Estado interno, só visível dentro do fluxo | orderId ou tamanho |

Usa uma propriedade para reter um identificador se o passo seguinte vai mudar o corpo. Um cabeçalho pode seguir para fora do fluxo, conforme o adaptador e a configuração: define o que aceitas e o que envias, e não copies todos os cabeçalhos de entrada para um serviço de terceiros.

O **Content Modifier** define estas três partes de forma declarativa, nos separadores Message Header, Exchange Property e Message Body. Para a primeira experiência usa valores constantes. Quando passares a valores vindos da mensagem, confirma a linguagem de expressão e que o campo existe antes de depender dele.

## O que o editor exporta

Um iFlow exporta-se como um ficheiro zip. O do fluxo Groovy_Ola tem estes 7 ficheiros (observado):

| Ficheiro | Conteúdo |
|---|---|
| src/main/resources/scenarioflows/integrationflow/Groovy_Ola.iflw | O fluxo, em XML BPMN2 |
| src/main/resources/script/script1.groovy | O script Groovy |
| src/main/resources/parameters.prop e parameters.propdef | Parâmetros externalizados (vazios neste fluxo) |
| metainfo.prop | Descrição do artefacto |
| .project | Descritor de projeto |
| META-INF/MANIFEST.MF | Identificação do artefacto |

O MANIFEST identifica o tipo do artefacto (SAP-BundleType: IntegrationFlow) e lista pacotes Java importados, entre eles `org.apache.camel` e `org.apache.cxf`. Isto indica que o motor do Cloud Integration se apoia em Apache Camel (é uma inferência a partir dos pacotes importados), o que ajuda a explicar o vocabulário que vais encontrar mais adiante (rotas, trocas, propriedades).

O ficheiro `.iflw` descreve o desenho de forma legível. Este é o esqueleto do Groovy_Ola, sem as propriedades de configuração:

    bpmn2:collaboration  "Default Collaboration"
      bpmn2:participant  "Receiver"             (EndpointRecevier)
      bpmn2:participant  "Integration Process"  (IntegrationProcess)
    bpmn2:process        "Integration Process"
      bpmn2:startEvent     "Start Timer 1"
      bpmn2:callActivity   "Content Modifier 1"   (Enricher)
      bpmn2:callActivity   "Groovy Script 1"      (Script, GroovyScript)
      bpmn2:endEvent       "End"
      bpmn2:sequenceFlow   ligam os passos pela ordem do desenho

Cada passo traz propriedades com a sua versão. Observado:

| Passo no editor | Tipo no XML | Variante e versão |
|---|---|---|
| Content Modifier | Enricher | FlowstepVariant, Enricher, versão 1.6.6 |
| Groovy Script | Script, subtipo GroovyScript | FlowstepVariant, GroovyScript, versão 1.1.2 |
| End | MessageEndEvent | versão 1.1.0 |
| Start Timer | temporizador de início | versão 1.4.0 |

Há ainda definições do fluxo inteiro, como o tempo limite da transação (30), o tratamento transacional («Not Required») e o nível de registo («All events»). A palavra «EndpointRecevier», com essa grafia, é a que aparece no ficheiro exportado.

**DICA:** o `.iflw` é texto. Podes pô-lo num sistema de controlo de versões e comparar duas versões do mesmo fluxo com uma ferramenta de diferenças, o que é muito mais prático do que comparar capturas de ecrã.

## Ler o monitor

Depois do deploy, o resultado vê-se em **Monitor, Integrations and APIs**, abrindo a execução («Message Processing Run»). A página tem três separadores no topo: Integration Flow Model, Log Content e Message Content. No Message Content, escolhes um passo na lista da esquerda e vês a mensagem **antes** desse passo, com os separadores Header, Exchange Properties e Payload.

No fluxo do teste, a execução teve 4 passos (observado):

| Passo | Duração | Mensagem antes do passo |
|---|---|---|
| Start Timer 1 | 1 s 52 ms | não aplicável |
| Content Modifier 1 | 21 ms | Payload: «No data available» (ainda não há corpo) |
| Groovy Script 1 | 676 ms | O JSON constante: id 12345678, name «Coca-Cola 2L», price 1, unity «UN» |
| End | 3 ms | O mesmo JSON, com as chaves e os valores em maiúsculas |

Repara na lógica: o monitor mostra a mensagem **antes** de cada passo, por isso o efeito de um passo só aparece no passo seguinte. É por isso que o corpo em maiúsculas só se vê no End.

O monitor pode mostrar este aviso quando alteras e voltas a publicar: «The model view might not be in sync with the run steps as the integration flow was re-deployed past log creation». Significa que o desenho que vês já não corresponde ao que correu. O que o monitor mostra no Payload pode depender do nível de registo configurado: neste teste o Payload apareceu nos passos Groovy e End. A página «Message Processing Logs», nas fontes, explica os níveis.

## Laboratório: o teu primeiro fluxo

Objetivo: um fluxo Timer, Content Modifier e End. Resultado esperado: no monitor, a mensagem antes do End tem o corpo, o cabeçalho e a propriedade que definiste.

**NOTA:** este laboratório é uma variante do que foi testado. O fluxo Groovy_Ola só definia o corpo no Content Modifier; o cabeçalho e a propriedade são acrescentos que deves confirmar no teu tenant.

1. Em **Design, Integrations and APIs**, abre o teu pacote de treino e cria um iFlow chamado CN01_Mensagem. Abre-o e carrega em Edit.
2. Troca o evento inicial por um **Timer**. No separador Scheduler deixa Basic, Simple Schedule, Repeat: None e Schedule: On Deployment.
3. Acrescenta um **Content Modifier** e liga o Timer a ele, e o Content Modifier ao End.
4. No Message Body, Type: Constant, escreve o JSON abaixo.
5. No separador Exchange Property, acrescenta uma propriedade orderId com o valor constante CN-1001. No Message Header, acrescenta o cabeçalho Content-Type com o valor application/json.
6. Guarda e faz **Deploy**. Confirma que o estado passa a «Deployed» e o runtime a «Started».
7. Em **Monitor, Integrations and APIs**, abre a execução, vai a Message Content e escolhe o passo End.
8. Confirma nos três separadores: Payload com o JSON, Header com Content-Type e Exchange Properties com orderId.

    {"orderId":"CN-1001","sku":"C-01","quantity":2}

**ATENÇÃO:** com o Timer em «On Deployment», o fluxo só corre quando o publicas. Se voltares a abrir o monitor sem publicar de novo, vês a execução anterior.

Sem acesso a um tenant, faz o desenho em papel, com uma tabela do corpo, dos cabeçalhos e das propriedades antes e depois do Content Modifier.

## Diagnosticar o primeiro fluxo

| Observação | O que verificar primeiro |
|---|---|
| O editor mostra a alteração, mas a execução ainda tem valores antigos | O estado «Deployed on» e a hora: a versão publicada é a que pensas? |
| Publicaste, mas não há mensagem no monitor | O filtro de tempo do monitor e se o Timer está em «On Deployment» (só corre no deploy) |
| Há registo, mas o Payload está vazio no passo | Estás a ver a mensagem antes do passo; vê o passo seguinte, e confirma o nível de registo |
| Aparece o aviso de modelo fora de sincronização | Voltaste a publicar depois desta execução: abre a execução mais recente |

## Exercícios

**PRATICAR:** faz os exercícios 1 a 3 no módulo 13. Guarda o desenho, as tabelas do estado da mensagem e uma nota com a hora da execução.

## Fontes oficiais

- [Creating an Integration Flow](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/creating-integration-flow?locale=en-us)
- [Getting Started with Integration Flow Design Guidelines](https://developers.sap.com/tutorials/btp-integration-suite-design-guidelines?embed=full)
- [Message Processing Logs](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/message-processing-logs)
- [Monitor Message Processing](https://help.sap.com/docs/integration-suite/sap-integration-suite/monitor-message-processing?version=CLOUD)
