# Exercícios de SAP Integration Suite

Resolve os exercícios após leres o módulo correspondente. Guarda entradas, resultados e decisões. Quando não tiveres a capacidade SAP disponível, apresenta a simulação ou o desenho pedido com a evidência que faltaria recolher no tenant. As soluções estão no módulo 15.

## Cloud Integration e mensagens

### Exercício 1 · Ler uma execução

**Nível:** Iniciante

Usa a tabela «No fluxo do teste» do módulo 01 (os 4 passos, as durações e a mensagem antes de cada passo). Responde: (a) em que passo é criado o corpo e em que passo vês o efeito do script Groovy no monitor? (b) Porque aparece «No data available» no Payload do Content Modifier? (c) Qual é o passo mais lento e qual é o mais lento dos que transformam a mensagem? Propõe uma hipótese para essa diferença e diz como a testarias.

### Exercício 2 · Construir o CN01_Mensagem

**Nível:** Iniciante

Constrói o laboratório do módulo 01: Timer (On Deployment), Content Modifier e End, com o corpo JSON de uma encomenda, o cabeçalho Content-Type e a propriedade orderId. Publica o fluxo. No monitor, passo End, copia em texto o Payload, o valor do cabeçalho e o valor da propriedade, e regista a hora de «Deployed on».

### Exercício 3 · Diagnosticar três situações

**Nível:** Intermédio

Para cada situação, indica a causa mais provável, o que verificas primeiro e como confirmas: (a) alteraste o corpo no Content Modifier, guardaste, mas o monitor continua a mostrar o corpo antigo. (b) Publicaste o fluxo e o monitor não mostra nenhuma execução nova. (c) O monitor mostra o aviso «The model view might not be in sync with the run steps as the integration flow was re-deployed past log creation».

## Transformações e Groovy

### Exercício 4 · Prever o resultado do Groovy Ola

**Nível:** Iniciante

Aplica o script de `exemplos/GroovyOla.groovy` ao corpo `{"sku":"c-01","quantity":2}`. Entrega: (a) o valor exato da propriedade tamanho e como o calculaste; (b) o corpo de saída; (c) uma frase a explicar porque este script não serve como regra de negócio para o portal; (d) o que mudaria no monitor, no passo End, se usasses `exemplos/NormalizarEncomenda.groovy` no lugar dele (diz também porque essa entrada seria rejeitada).

### Exercício 5 · Normalizar a encomenda e rejeitar o inválido

**Nível:** Intermédio

Usa `exemplos/NormalizarEncomenda.groovy` (e, se quiseres, `verificar.groovy`, ou o laboratório do módulo 02 no tenant). Entradas: (1) `{"orderId":"CN-1001","sku":" c-01 ","quantity":2}`; (2) a mesma encomenda com quantity 0; (3) a mesma encomenda com quantity "2" (texto). Entrega: a saída válida em JSON, o valor da propriedade orderId, e para cada rejeição a mensagem da exceção e a regra do script que a provoca. Acrescenta uma quarta entrada à tua escolha que também deva falhar e explica porquê.

### Exercício 6 · XSLT, Message Mapping e conversor JSON para XML

**Nível:** Avançado

Parte 1: transforma `exemplos/encomenda.xml` (duas linhas) com `exemplos/encomenda.xsl` e escreve a estrutura obtida. Indica o que sai com uma linha e com zero linhas, e que teste de cardinalidade farias num Message Mapping para detetar um mapeamento que perde a segunda linha. Parte 2: o JSON `{"orderId":"CN-1001","sku":"C-01","quantity":2}` passa por um conversor JSON para XML. Diz o que acontece com as predefinições e porquê, e que configuração (ou passo anterior) corrige o problema. Diz ainda como volta o valor de quantity se converteres o resultado outra vez para JSON. Se tiveres tenant, confirma no editor e anota a diferença face à documentação.

## Conectividade

### Exercício 7 · Escolher adaptadores e um teste negativo

**Nível:** Iniciante

A Casa Nova tem três necessidades: (a) o portal envia encomendas ao Integration Suite por HTTPS; (b) o iFlow consulta e grava num serviço OData do ERP; (c) o armazém deposita ficheiros de stock num servidor SFTP. Para cada caso entrega: adaptador (sender ou receiver) e sentido, opção de autenticação e o que a configura, e um teste negativo com o resultado esperado.

### Exercício 8 · Request Reply HTTP e a resposta perdida

**Nível:** Intermédio

Desenha (em papel ou no editor) um Request Reply com um recetor HTTP para o simulador do ERP. Preenche, com valores concretos: Address (placeholder), Method, cabeçalhos de pedido, Authentication, Timeout, Throw Exception on Failure e política de repetição. Depois responde: o ERP gravou a encomenda mas a resposta perdeu-se e o tempo-limite expirou. O que vê o iFlow, o que fazes, e que chave e consulta tornam a repetição segura? Indica ainda os limites das repetições do adaptador, citados da documentação.

### Exercício 9 · Ligar a um SAP privado

**Nível:** Avançado

O ERP real da Casa Nova está numa rede privada, sem exposição à Internet. Desenha o percurso do tenant até ao sistema, indicando a função do Cloud Connector, onde o sistema é autorizado e como se configura o adaptador (Proxy Type, Location ID, Address, Authentication). Lista as restrições do adaptador para este modo, os passos de preparação no BTP e no Cloud Connector, e três falhas prováveis com o primeiro sintoma e a verificação de cada uma.

## Padrões e erros

### Exercício 10 · Router para aceitar, rever e rejeitar

**Nível:** Iniciante

Desenha um Router com os percursos aceitar, rever e rejeitar, usando uma propriedade route preenchida antes do Router. Entrega as condições de cada ramo (todas do mesmo tipo), um caso de teste por ramo com o valor de route e o resultado esperado, e marca o ramo predefinido. Explica o que aconteceria a um valor desconhecido de route.

### Exercício 11 · Dividir um lote com uma encomenda inválida

**Nível:** Intermédio

Dado o lote `<Batch id="B-17"><Order id="CN-1001"><Quantity>2</Quantity></Order><Order id="CN-1002"><Quantity>0</Quantity></Order></Batch>`, desenha a divisão em duas mensagens. Entrega: o tipo de Splitter e o XPath, a chave de correlação de cada parte, como se preserva o id do lote, a decisão sobre Stop On Exception (com justificação), o evento final do Exception Subprocess e a resposta agregada (o XML ou JSON que o portal recebe) com uma parte aceite e outra rejeitada.

### Exercício 12 · Matriz de erros: repetir ou não

**Nível:** Avançado

Para as respostas 400, 409, 429, 503 e para um tempo-limite com escrita incerta, preenche uma tabela com: classificação da falha, se repetes, com que chave, quantas vezes e com que intervalo (respeitando os limites do recetor HTTP na documentação), e onde consultas o estado antes de repetir. Acrescenta um parágrafo sobre o que o Idempotent Process Call resolve e o que não resolve neste cenário, e qual a responsabilidade do ERP.

## API Management

### Exercício 13 · Desenhar o proxy de encomendas

**Nível:** Iniciante

O portal da Casa Nova vai chamar `POST /v1/orders` com `orderId`, `sku` e `quantity`; o destino é o iFlow HTTPS de encomendas. Usa o módulo 05. Entrega uma tabela ou um esquema com: (a) o nome, a versão e o base path do proxy; (b) o Proxy Endpoint e o Target Endpoint; (c) as políticas, pela ordem de execução, indicando o fluxo (PreFlow, Conditional Flow ou PostFlow) e se ficam no pedido ou na resposta, com a Verify API Key e a Quota; (d) como propagas o cabeçalho de correlação X-Correlation-Id do proxy até ao iFlow e que campo do iFlow usas para pesquisar CN-1001 no monitor.

### Exercício 14 · Matriz de pedidos

**Nível:** Intermédio

Parte do proxy do exercício 13, com Verify API Key seguida de Quota de 3 pedidos por minuto. Monta uma tabela com cinco pedidos: (1) chave válida dentro da quota, (2) chave ausente, (3) chave inventada, (4) quarto pedido do mesmo minuto com chave válida, (5) chave válida, quota livre, mas o iFlow de destino está parado. Para cada pedido indica o resultado esperado (código HTTP quando a documentação o permite, ou o nome da falha), se o pedido chega ao iFlow, e se conta para a quota. Marca como «por testar» tudo o que a documentação não diz.

### Exercício 15 · Renomear um campo sem partir clientes

**Nível:** Avançado

O portal quer renomear `sku` para `productCode`. Dois consumidores usam a v1 da API, e o produto de treino associa a v1 à aplicação de cada um. Propõe uma evolução em fases: o mecanismo de API Management usado em cada fase (revisão ou versão), o URL de cada fase, o estado do proxy ao longo do tempo, o que dizes aos consumidores e a evidência concreta que exiges antes de retirar a v1 (que dados consultas e onde). Inclui a data de retirada e o que acontece a quem ainda chamar a v1 depois dessa data.

## Segurança e operação

### Exercício 16 · As quatro identidades

**Nível:** Iniciante

Para o fluxo de encomendas da Casa Nova, desenha as identidades de entrada (portal para o iFlow), de saída (iFlow para o ERP), de operação (equipa que monitoriza e reinicia) e de entrega (quem publica em produção). Numa tabela, associa cada uma à permissão ou ao papel que precisa e ao local onde a credencial fica guardada. Indica uma credencial que não deve ficar num URL e uma que não viaja com o transporte do pacote.

### Exercício 17 · O destino devolveu 401

**Nível:** Intermédio

O ERP simulado devolveu 401 ao fluxo de encomendas e a encomenda CN-1001 não chegou. O fluxo usa um artefacto OAuth2 Client Credentials com o alias CN_ERP_TREINO, editado ontem. Escreve a sequência de diagnóstico, passo a passo, desde a pesquisa no monitor até ao material de segurança: o que filtras e por que ID, o que abres no log, o que verificas no Security Material, o que confirmas na configuração do adaptador, e como distingues um 401 vindo do destino de um 401 à entrada do fluxo. Indica em que ponto usarias o nível Trace e que cuidados tens.

### Exercício 18 · Transporte com reversão

**Nível:** Avançado

Desenha o transporte do pacote CN01 do tenant de teste para o de produção. O fluxo tem dois parâmetros que mudam por ambiente: o URL do ERP e o alias da credencial. Entrega: (a) o que externalizas no desenho; (b) a lista de artefactos que não viajam no pacote e como os crias em produção; (c) o mecanismo de transporte que escolhes e porquê; (d) uma verificação autorizada após a publicação, com os dados de entrada e o que deves ver no monitor; (e) um critério de reversão com números e prazo, o procedimento de reversão e quem reconcilia as encomendas já gravadas no ERP.

## Eventos

### Exercício 19 · Um tópico e duas filas

**Nível:** Iniciante

Desenha a topologia para o evento «encomenda aceite» da Casa Nova: o namespace do message client, o tópico, as duas filas (stock e expedição), a fila de mensagens mortas e as subscrições. Indica o produtor, os consumidores e a chave estável que identifica o evento. Verifica as tuas escolhas contra as regras de nomes de tópicos e filas do módulo 07 (comprimento, segmentos, caracteres).

### Exercício 20 · Falha antes da confirmação

**Nível:** Intermédio

O consumidor de stock recebe o evento `evt-cn-1001-01` (reservar 2 unidades de C-01 para CN-1001), grava a reserva na base de dados e falha antes de confirmar. Descreve, numa tabela com a primeira entrega, a segunda entrega e o estado final, o que acontece no broker (contador de entregas, estado da mensagem), o que o consumidor faz e qual o efeito. Mostra o desenho do consumidor que garante uma reserva única, indicando o que grava, em que transação e quando confirma. Diz o que muda se a fila tiver Max Redelivery Count 3 e uma fila de mensagens mortas.

### Exercício 21 · Eventos fora de ordem

**Nível:** Avançado

Chegam ao consumidor dois eventos de atualização da encomenda CN-1001: primeiro o que diz «expedida» (hora de ocorrência 10:32:00) e só depois o que diz «separada» (hora de ocorrência 10:31:00). Define os campos que o evento precisa de ter, a regra que impede que o estado antigo substitua o novo, o que o consumidor faz com o evento atrasado (confirma, descarta ou guarda) e como tratas o caso de duas horas iguais. Entrega a regra como tabela de decisão e, se quiseres, como função Groovy de poucas linhas (marca-a como não executada).

## B2B

### Exercício 22 · Ficha MIG de aviso de expedição

**Nível:** Iniciante

Cria a ficha de uma MIG de origem para o aviso de expedição de um fornecedor, com cinco campos: referência do aviso, encomenda do cliente, artigo do fornecedor, quantidade expedida e unidade. Para cada campo indica a cardinalidade (min e max), o tipo ou a restrição, e para a unidade o código permitido. Indica a direção (In, Out ou Both), o type system e a mensagem que escolhias, e que passo do assistente de criação usarias para cada decisão.

### Exercício 23 · MAG e código desconhecido

**Nível:** Intermédio

A partir da ficha do exercício 22, desenha a MAG para o ERP da Casa Nova: uma tabela com campo de origem, campo de destino e regra. A unidade PCE do fornecedor passa a EA. Mostra como tratas um código desconhecido (por exemplo KGM) e explica porque não podes deixar o valor por omissão do mapeamento de códigos a passar o valor de origem. Define os três casos de teste (válido, sem referência, unidade desconhecida) e o resultado de cada um.

### Exercício 24 · Duas versões e dois níveis de confirmação

**Nível:** Avançado

O Fornecedor Litorâneo continua na versão 1 do aviso; o Fornecedor Ribeirinho passou à versão 2, em que a unidade se chama `unitCode` e é obrigatória. Define como escolhes o mapeamento para cada parceiro (que artefactos tens por versão e como o acordo aponta para eles), o que acontece à ativação de acordos do mesmo tipo de mensagem, e como testas a transição sem afetar o outro parceiro. Depois distingue, numa tabela, confirmação de transporte, confirmação funcional e aceitação de negócio: em que ponto de cada fluxo acontece, quem a emite e onde a vês no monitor.

## Open Connectors

### Exercício 25 · Escolher a interface para uma entidade SaaS
**Nível:** Iniciante

A Casa Nova quer ler os pedidos de apoio de uma aplicação SaaS e associá-los à referência da encomenda. Constrói uma tabela com três opções (Open Connectors, adaptador nativo, HTTP direto) e três linhas de comparação: autenticação, operações disponíveis e quem mantém a ligação quando o fornecedor muda a API. Escolhe uma opção para o caso e escreve duas razões e uma condição concreta que te faria mudar de opção (por exemplo, uma operação ou um filtro em falta). Entrega a tabela e o parágrafo de decisão. Podes fazê-lo em papel: não precisas de tenant.

### Exercício 26 · Duas páginas e uma falha antes do ponto de controlo
**Nível:** Intermédio

Usa as páginas A e B do módulo 09. A página A devolve o registo T-1 e next igual a p2. A página B devolve T-2 e next nulo. Desenha uma tabela com uma linha por passo e três colunas: registos gravados, ponto de controlo e o que fazes a seguir. Preenche-a para três execuções: a normal, uma em que a falha ocorre depois de gravar T-2 e antes de atualizar o ponto de controlo, e a retoma dessa falha. Mostra o estado final de cada uma. Se tiveres tenant, acrescenta a variante do módulo 09: um Content Modifier com o corpo constante da página A e o script Groovy do módulo, e regista o valor das propriedades proximo, temMais e nItens (resultado do script, por testar no teu tenant).

### Exercício 27 · Rotação da identidade de leitura, 401 e 429
**Nível:** Avançado

A identidade de leitura usada pelo iFlow vai ser substituída. Escreve o procedimento de rotação para o artefacto User Credentials do tipo OpenConnectors (cria o novo, valida a leitura, publica, reinicia os iFlows que o usam, retira o antigo). Indica onde ficaria o segredo se a mesma instância fosse exposta pelo API Management (Key Value Map com o token da instância). Depois escreve uma tabela de decisão com duas linhas, 401 e 429: o que verificas, se repetes ou não, quantas vezes e com que espera. Termina com a lista dos campos que registarias para investigar (por exemplo, código de resposta e referência da encomenda) e dos que nunca registarias. Entrega o procedimento e as duas tabelas; as partes que dependem do teu tenant ficam marcadas como por testar.

## Modernização e migração

### Exercício 28 · Classificar as três interfaces da Casa Nova
**Nível:** Iniciante

Para as interfaces de stock por ficheiro, encomendas e portal retirado, escreve a decisão (avaliar migração, redesenhar ou retirar) e uma categoria provisória do Migration Assessment (Ready to migrate, Adjustment required ou Evaluation required). Para cada uma, indica a informação que precisas de confirmar antes de decidir e quem a confirma (volume, dono, dependências, tráfego). Justifica pelo menos uma categoria com um limite do Migration Assessment ou do Migration Tooling.

### Exercício 29 · Casos de regressão
**Nível:** Intermédio

Escreve três casos de regressão para a interface de encomendas: uma entrada válida, uma rejeitada e uma repetida. Para cada caso indica a entrada, o resultado de negócio esperado nos dois percursos (o antigo e o novo) e as contagens a comparar. Lista os campos que normalizas antes de comparar (por exemplo hora de execução e identificadores técnicos) e porquê. Acrescenta uma exceção a testar: credencial expirada ou destino indisponível.

### Exercício 30 · Corte reversível com execução paralela
**Nível:** Avançado

Desenha o corte da interface de stock: uma execução em paralelo com uma saída de verificação sem efeitos de negócio, um critério numérico de interrupção, quem suspende a origem e como confirmas que filas e ficheiros pendentes ficaram reconciliados. Escreve em duas colunas distintas o que é reversão técnica (voltar a rota) e o que é reconciliação (tratar o que já foi gravado) e responde: se o novo fluxo já escreveu 40 lotes no ERP quando decides reverter, o que fazes antes de reativar o antigo? Acrescenta uma linha a justificar se, para este caso, escolhias a abordagem Standard ou Pipeline do Migration Tooling.

## SAP S4HANA Azure e IA

### Exercício 31 · Encontrar o contrato SAP e confirmar a escrita
**Nível:** Intermédio

Imagina que substituis a API simulada por uma interface OData V2 do S/4HANA. Indica onde procuras o contrato (catálogo da SAP, para a edição e versão do sistema) e preenche uma tabela com os campos do adaptador OData que vais configurar: Address, Proxy Type, Authentication, CSRF Protected, Operation e Resource Path. Para cada campo, diz como confirmas o valor. Explica as consequências do formato do corpo (o adaptador só suporta XML) no desenho do iFlow que hoje fala JSON, e como confirmas autenticação, paginação e escrita num sistema de teste. Podes fazê-lo em papel.

### Exercício 32 · Notificação de stock para Azure Service Bus
**Nível:** Intermédio

Modela a notificação de stock para o Azure Service Bus. Define o evento (campos), a chave MessageId (e porquê é estável entre repetições), o Correlation ID, se usas fila ou tópico e quem consome. Preenche os campos principais do adaptador Azure Service Bus que usarias no iFlow (Hostname, Authentication Type, Entity, Content Type) sem escreveres nenhum segredo. Do lado do consumidor, escolhe o Failure Message Handling (Acknowledge, Defer, Keep and Process Again ou Move to Dead Letter Queue), diz quando confirma a mensagem e descreve a retoma depois de uma falha. Marca o que depende de um Azure real.

### Exercício 33 · Classificador de texto: aceitável, inválida e timeout
**Nível:** Avançado

Define três respostas de um classificador de comentários: uma aceitável (por exemplo categoria rever_morada com pontuação 0.9), uma inválida (categoria desconhecida ou corpo que não é JSON) e um timeout do serviço. Usa o script Groovy do módulo 11, ou escreve a tua versão, e indica para cada resposta o valor esperado das propriedades destinoCaso e motivoCaso. Decide como o fluxo reage a cada uma sem afetar a gravação da encomenda, onde guardas a evidência da decisão humana e como escolhes o limiar. Se tiveres tenant, corre o script com as três respostas constantes e regista o resultado observado (código Groovy do módulo não executado na revisão).

## Projeto final

### Exercício 34 · Entrega do projeto integrador
**Nível:** Avançado

Entrega o projeto do módulo 12: contrato (campos, formatos e códigos), mapa do fluxo com fronteiras e correlação, os seis casos de aceitação com a evidência de cada um, e a grelha de nove critérios preenchida com os níveis demonstrado, desenhado ou por verificar. Inclui uma prova da consulta após conflito (o pedido original continua gravado depois de um 409) e um desenho para recuperar de uma resposta perdida. Se fizeste deploy, junta o identificador saneado de execução e o perfil usado; se não, marca as partes do tenant como por verificar.

## Fontes oficiais

- [Build Your Integrations and APIs](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/centralized-developer-hub-38422de917ee40e1a47df0b368def295-1188)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
