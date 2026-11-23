# Soluções dos exercícios de SAP Integration Suite

Compara o teu resultado com os critérios de cada solução. Desenhos alternativos podem ser válidos quando preservam o contrato, limitam falhas e permitem demonstrar os efeitos de negócio.

## Cloud Integration e mensagens

### Exercício 1

(a) O corpo é criado no Content Modifier (corpo constante), por isso a mensagem antes do Groovy já o tem. O efeito do script (chaves e valores em maiúsculas) só se vê no passo seguinte, o End, porque o monitor mostra a mensagem antes de cada passo. (b) Antes do Content Modifier a mensagem ainda não tem corpo: o Timer só dispara a execução e não cria dados. (c) O mais lento é o Start Timer (1 s 52 ms); entre os passos que transformam a mensagem, o Groovy (676 ms, contra 21 ms do Content Modifier). Uma hipótese é o custo da primeira execução do script depois do deploy; testava-se voltando a executar o fluxo e comparando as durações. É uma hipótese, não está verificada.

Critério: distinguiste «mensagem antes do passo» de «efeito do passo»; deste uma hipótese testável e não uma certeza.

### Exercício 2

O resultado esperado no passo End é: Payload com o JSON da encomenda, Header com Content-Type igual a application/json, Exchange Properties com orderId igual a CN-1001, e o cabeçalho do editor com «Deployed on» e «Runtime Status: Started». Este laboratório é uma variante do fluxo testado (o Groovy_Ola não definia cabeçalho nem propriedade): confirma o resultado no teu tenant.

Critério: os três valores estão corretos e a hora do deploy é anterior à da execução que analisaste.

### Exercício 3

(a) Causa mais provável: a versão nova não está publicada, ou estás a ver uma execução anterior ao deploy. Verifica «Deployed on» e a hora no editor; confirma publicando de novo e abrindo a execução mais recente. (b) Com o Timer em «On Deployment» o fluxo só corre quando é publicado: verifica o filtro de tempo do monitor e se o deploy terminou com «Started». Confirma com uma nova publicação. (c) O fluxo foi publicado de novo depois de esta execução e o desenho atual já não corresponde ao que correu: abre a execução mais recente.

Critério: para cada caso nomeaste uma causa, uma verificação rápida e uma forma de confirmar, em vez de «tentar outra vez».

## Transformações e Groovy

### Exercício 4

(a) tamanho = 27. A String tem 27 caracteres: as chaves e os dois pontos, as aspas de sku, c-01, quantity, e o valor 2. Contou-se com `length()`, que mede unidades UTF-16 e não bytes. (b) O corpo passa a `{"SKU":"C-01","QUANTITY":2}`. (c) O `toUpperCase` converte todo o texto, incluindo as chaves, e um consumidor que espera sku e quantity deixa de reconhecer o contrato. (d) Com NormalizarEncomenda esta entrada seria rejeitada, porque não tem o campo orderId (falha a validação do identificador, mensagem Identificador inválido). O passo End mostraria o fluxo em falha e não o JSON de saída. Por testar no tenant: o texto exato do estado no monitor.

Critério: 27 e o corpo exato; explicar o efeito nas chaves; identificar a falta de orderId.

### Exercício 5

Saída válida: `{"externalId":"CN-1001","items":[{"sku":"C-01","quantity":2}]}`, com a propriedade orderId igual a CN-1001 (o espaço em volta de c-01 é removido e o SKU fica em maiúsculas). Com quantity 0: IllegalArgumentException com a mensagem Quantidade inválida (regra quantidade menor que 1). Com quantity "2": a mesma mensagem, porque o valor é texto e não um Number. Quarta entrada (exemplos aceites): quantity 1.5 (não é inteiro), orderId X-1001 (não cumpre o padrão CN seguido de dígitos), SKU vazio ou só espaços, ou o JSON `[]` (não é objeto). Todas estas estão em verificar.groovy. Comparar o JSON de saída depois de o interpretar, não por texto.

Critério: saída válida exata, propriedade orderId, duas mensagens de rejeição corretas e uma quarta entrada falhada com a regra certa.

### Exercício 6

Parte 1: com duas linhas o XSLT produz um EntradaERP com referencia igual a CN-1001 e duas Linha: codigo C-01 com quantidade 2 e codigo C-02 com quantidade 1. Com uma linha sai uma Linha. Com zero Item sai um EntradaERP sem nenhuma Linha, ou seja, o XSLT não rejeita: se o contrato exige pelo menos uma linha, a rejeição tem de ser feita antes (validação ou condição). No Message Mapping, o teste de cardinalidade usa origem com Item repetível e destino com Linha repetível, e executa duas, uma e zero linhas: um resultado com uma só Linha para a origem de duas revela um mapeamento que não é por ocorrência.

Parte 2: com as predefinições, o conversor JSON para XML falha, porque o objeto de raiz tem três membros e a documentação exige exatamente um (a exceção é XMLStreamException ou, desde a versão 1.21 do cluster, JsonXmlException). Correções documentadas: ativar Add XML Root Element com o nome Encomenda (NCName válido), ou acrescentar antes um Content Modifier com o corpo `{ "root": ${in.body} }`. O resultado esperado é um XML com a raiz e os três elementos orderId, sku e quantity (por testar o aspeto exato, incluindo o cabeçalho XML em UTF-8). No sentido inverso, o XML para JSON converte todos os valores em Strings, por isso quantity volta como "2" e não como número.

Critério: estrutura XSLT correta, diferença entre XSLT e validação de cardinalidade, causa da falha do conversor (um só membro na raiz), correção e a regra das Strings.

## Conectividade

### Exercício 7

(a) Portal: HTTPS Sender (entrada). Autenticação: OAuth client credentials ou certificado de cliente, com uma instância de serviço (plano integration-flow) e o papel ESBMessaging.send configurado no adaptador (User Role). Teste negativo: pedido sem token ou com token inválido deve ser recusado (401); token sem o papel adequado deve falhar a autorização (403); um corpo acima do Maximum Message Size é rejeitado. (b) OData: OData V2 (ou V4) Receiver (saída). Autenticação: Basic com um artefacto User Credentials, ou OAuth2 Client Credentials; Principal Propagation só se o sistema for on-premise. Teste negativo: credencial errada, ou entidade inexistente no Resource Path, ou enviar corpo JSON ao adaptador de V2 (só aceita XML). (c) SFTP: SFTP Sender se o tenant lê os ficheiros de stock (o caso do armazém a depositar); SFTP Receiver se o tenant escrever. Autenticação: utilizador mais chave privada do keystore (Private Key Alias), com a chave do servidor conhecida (known hosts). Teste negativo: um ficheiro ainda em escrita lido incompleto com Read Lock Strategy None (corrige com Done File Expected), ou servidor com chave desconhecida. As mensagens de erro exatas são por testar.

Critério: três adaptadores com o sentido certo, autenticação coerente com a documentação e um teste negativo verificável por caso.

### Exercício 8

Desenho de referência: Address `https://erp-simulado.exemplo/orders` (placeholder), Method POST, Content-Type application/json, cabeçalho de idempotência `portal:CN-1001` (por exemplo Idempotency-Key, se o ERP o suportar), Authentication Basic com um nome de credencial de um artefacto User Credentials, Timeout 10000 ms (o valor por omissão é 60000), Throw Exception on Failure ativado, e Retry on Error Response só para o código 503 com 2 iterações e 5 s de intervalo. Limites documentados do adaptador: no máximo 3 repetições e no máximo 60 s entre tentativas; o Retry-After do destino sobrepõe-se; o Exception Subprocess só é chamado depois das repetições. Resposta perdida: o tempo-limite lança exceção e o iFlow não sabe se o ERP gravou. Não repitas às cegas. Primeiro consulta o ERP pela referência (por exemplo GET por orderId); se existir, trata como sucesso e devolve a referência; se não existir, repete com a mesma chave. A repetição só é segura se o ERP impuser unicidade pela chave. O Timeout do adaptador não altera o tempo-limite de componentes intermédios.

Critério: valores concretos preenchidos, repetição só para falhas antes da escrita, consulta por chave antes de repetir e limites da documentação citados.

### Exercício 9

Percurso: portal, HTTPS Sender, iFlow, receiver HTTP ou OData com Proxy Type On-Premise, Cloud Connector (agente na rede interna com ligação invertida, sem abrir a firewall), sistema SAP. Função do Cloud Connector: estabelecer a ligação autorizada; o Address do adaptador referencia um endereço virtual que é mapeado no Cloud Connector para o host e o recurso internos (acesso configurado em Access Control). A autorização do sistema: o Cloud Connector só deixa passar o que está exposto, mas o sistema SAP continua a exigir autenticação (Basic com User Credentials ou Principal Propagation). Configuração do adaptador: Proxy Type On-Premise, Location ID (se houver vários Cloud Connectors), Address com http:// (virtual host), Authentication Basic ou Principal Propagation. Restrições documentadas: usar http:// no endereço virtual e não usar Client Certificate. Preparação no BTP: coleção de papéis com o papel Cloud Connector Administrator no subaccount e utilizador atribuído; instalar e configurar o Cloud Connector; relação de confiança com o sistema de destino. Três falhas prováveis: Location ID errado (o tenant não encontra o Cloud Connector: confirma o Location ID na configuração do Cloud Connector); recurso não exposto no Access Control (pedido recusado: verifica o mapeamento virtual para interno); credencial inválida (401 do sistema SAP: verifica o artefacto User Credentials).

Critério: percurso completo, restrições do modo On-Premise, papel do Cloud Connector distinto da autenticação do SAP e três falhas com verificação.

## Padrões e erros

### Exercício 10

Um Content Modifier define a propriedade route antes do Router. Condições Non-XML (as três do mesmo tipo): ramo aceitar: `${property.route} = 'aceitar'`; ramo rever: `${property.route} = 'rever'`; ramo rejeitar: Default Route (sem condição própria). Casos: route = aceitar segue para aceitar (por exemplo, corpo com estado ACEITE); route = rever segue para rever; route = xpto, vazio ou em falta segue para o ramo predefinido e termina em rejeição. Um valor desconhecido nunca fica sem destino porque o ramo predefinido o apanha. Se a opção Throw Exception estiver ativa, o ramo predefinido tem de terminar com Terminate Message. Só conta como predefinido o último ramo marcado.

Critério: condições Non-XML coerentes, um caso por ramo, ramo predefinido marcado e tratamento do valor desconhecido.

### Exercício 11

Usa um General Splitter com XPath `/Batch/Order`: cada parte mantém o envelope, por isso o id B-17 acompanha cada encomenda (com o Iterating Splitter, guarda antes `/Batch/@id` numa propriedade). Chave de correlação por parte: batchId mais orderId, ou seja, B-17:CN-1001 e B-17:CN-1002. Decisão: Stop On Exception desativado, porque queres aceitar CN-1001 e rejeitar só CN-1002; o processamento da parte vai para um Local Integration Process com o seu Exception Subprocess, terminado com Message End, que devolve um XML válido (obrigatório se usares Gather). Resposta agregada (por exemplo, com Gather Combine): `[{"orderId":"CN-1001","status":"ACEITE"},{"orderId":"CN-1002","status":"REJEITADA","motivo":"Quantidade inválida"}]`, mais o batchId B-17. Se a política fosse tudo ou nada, o desenho seria Stop On Exception ativado e Error End. O formato final do portal é por testar.

Critério: General Splitter com o XPath certo, chave de correlação por parte, justificação de Stop On Exception coerente com o evento final, e resposta agregada com as duas partes.

### Exercício 12

| Resposta | Classificação | Repetir? | Chave e limites | Onde consultar |
|---|---|---|---|---|
| 400 | Validação | Não | Corrige a entrada | Mensagem de erro e registo |
| 409 | Conflito de negócio | Não | Mesma chave portal:CN-1001; compara o conteúdo | Consulta no ERP pela chave: igual é sucesso, diferente é conflito para revisão |
| 429 | Transitória | Sim, com limite | Mesma chave; no máximo 3 tentativas e até 60 s entre elas; respeita Retry-After | Contador de tentativas e o monitor |
| 503 | Transitória | Sim, se a falha antecedeu a escrita | Mesma chave; limites iguais | ERP pela chave, para saber se algo foi gravado |
| Timeout com escrita incerta | Resultado incerto | Só depois de consultar | Mesma chave | ERP pela chave; se existir, sucesso; se não, repete |

O Idempotent Process Call evita repetir a chamada de um duplicado dentro do fluxo (identificador guardado por omissão durante 90 dias e por instância do passo), mas não resolve a falha entre a escrita no ERP e a confirmação: o resultado fica incerto, e por isso o ERP deve impor a unicidade da referência. A responsabilidade final por um único efeito é do ERP; o fluxo fornece a chave estável.

Critério: cinco linhas coerentes, a mesma chave estável em todas as repetições, limites de 3 tentativas e 60 s citados, consulta antes de repetir o resultado incerto e a limitação do Idempotent Process Call.

## API Management

### Exercício 13

(a) Nome Encomendas, versão v1: o sistema acrescenta a versão ao nome (Encomendas_v1) e antepõe-na ao base path. Com base path orders, o endereço público fica /v1/orders, como no contrato. (b) O Proxy Endpoint define como o portal chama a API (host virtual e base path). O Target Endpoint define a ligação de saída para o URL HTTPS do iFlow de encomendas. Uma Route Rule só é precisa se houver mais do que um Target Endpoint (por exemplo teste e produção). (c) No PreFlow do pedido do Proxy Endpoint, por esta ordem: 1) Verify API Key (APIKey com ref para o cabeçalho, por exemplo request.header.apikey); 2) Quota, com Identifier verifyapikey.nome_da_política.client_id. A ordem importa: um pedido sem chave nunca chega a gastar quota. Um Raise Fault ou FaultRules servem para devolver um erro estável ao portal. (d) O proxy deixa passar o X-Correlation-Id para o destino; confirma no Debug do proxy (por testar) que o cabeçalho segue para o Target Endpoint, e se não seguir acrescenta o passo de que precisas. No iFlow, um Content Modifier copia o cabeçalho (e o orderId) para o cabeçalho SAP_ApplicationID, que é pesquisável no filtro de ID do monitor. Documentado em: apim/api-proxy, flow, verify-api-key, quota; ci/Operations/using-ids-to-filter-messages.

Critério: a ordem das políticas coloca a segurança antes da quota; o proxy e o iFlow têm papéis separados; indicas um campo concreto para pesquisar CN-1001 e marcas como por testar a propagação do cabeçalho.

### Exercício 14

| Pedido | Resultado esperado | Chega ao iFlow? | Conta para a quota? |
|---|---|---|---|
| 1. Chave válida, dentro da quota | Sucesso: resposta do iFlow (por exemplo 200 ou 202, conforme o fluxo) | Sim | Sim |
| 2. Chave ausente | 401, FailedToResolveAPIKey | Não | Não |
| 3. Chave inventada | 401, InvalidApiKey | Não | Não (falha antes da Quota) |
| 4. Quarto pedido no mesmo minuto | Recusado pela política Quota: QuotaViolation (policies.ratelimit.QuotaViolation); o código HTTP exato não vem na documentação: por testar | Não | O contador já está no limite |
| 5. Chave válida, destino parado | O proxy aceitou o pedido; o erro vem do destino, e o código devolvido ao portal depende do Target Endpoint: por testar | Chega ao endpoint do destino, mas não há execução | Sim (o pedido passou na quota) |

Os pedidos 2 e 3 devolvem 401 porque os erros de Verify API Key estão documentados com esse código. O pedido 5 mostra a diferença entre uma rejeição no proxy (políticas) e uma falha do destino: se o iFlow estiver parado, não há log no monitor do Cloud Integration, e a falha vê-se no Debug do proxy ou no API Analytics (erros 5xx). Como a política Quota vem depois da Verify API Key, os pedidos 2 e 3 nem chegam ao contador.

Critério: separas rejeição por política (401, quota) de falha do destino; justificas por que os pedidos 2 e 3 não contam para a quota; não inventas o código HTTP da quota.

### Exercício 15

Fase 0, hoje: v1 com sku. Fase 1, compatível (revisão da v1): o proxy passa a aceitar productCode como campo opcional ao lado de sku, sem mudar o URL. Uma revisão serve para mudanças que não quebram o consumo existente e só uma revisão corre de cada vez no runtime. Fase 2, incompatível (nova versão v2): sku deixa de existir e productCode passa a obrigatório. O sistema cria Encomendas_v2 com base path /v2/orders e as duas versões coexistem no runtime; no produto, acrescentas a v2 ao lado da v1. Fase 3: marcas a v1 como Deprecated, com data de retirada e a v2 como API sucessora (a data e o sucessor são obrigatórios; só se marca Deprecated ou Decommissioned numa atualização). Comunicas aos dois consumidores a data e o novo contrato, com a especificação OpenAPI das duas versões. Evidência para retirar: no API Analytics, zero chamadas à v1 durante o período acordado (por exemplo 30 dias seguidos), vistas por aplicação; confirmas com os dois consumidores. Fase 4: estado Decommissioned na data acordada; quem ainda chamar a v1 deixa de poder usá-la (o serviço deixa de estar disponível). Os valores de datas e dias são propostas para estudo. Documentado em apim/api-revisions, api-versioning, api-proxy-states e api-analytics.

Critério: distingues revisão (compatível) de versão (incompatível); a v1 e a v2 coexistem; a retirada depende de dados de utilização e de uma data, não de uma suposição.

## Segurança e operação

### Exercício 16

| Fronteira | Permissão ou papel | Onde fica a credencial |
|---|---|---|
| Entrada (portal para o iFlow) | Role ESBMessaging.send indicada no User Role do sender; OAuth com client credentials (instância Process Integration Runtime, plano integration-flow) | A service key com clientid e clientsecret, guardada pelo portal; nunca no iFlow |
| Saída (iFlow para o ERP) | Utilizador técnico do ERP, com os direitos mínimos | Security Material (User Credentials ou OAuth2 Client Credentials) com o alias CN_ERP_TREINO |
| Operação (equipa) | PI_Read_Only para ver; PI_Business_Expert para ler payloads e reiniciar; PI_Administrator para segurança e access policies | Gestão de utilizadores do subaccount e do fornecedor de identidade |
| Entrega (publicar) | Role WorkspacePackagesTransport; Content Agent Service; modo de transporte definido pelo administrador | Destinos e instâncias de serviço no cockpit BTP |

Uma credencial que nunca deve ir num URL: a chave ou o token do portal (os URLs ficam em registos). Uma credencial que não viaja com o transporte: a User Credentials, o OAuth2 Client Credentials ou o par de chaves do keystore; criam-se de novo em produção, com o mesmo alias para não partir referências. Documentado em ci/SecurityCF/personas, ci/Operations/managing-security-material e ISuite_Integrations_APIs/handling-integration-artifacts-across-multiple-tenants.

Critério: as quatro identidades têm uma permissão e um local de armazenamento distintos; sabes o que não viaja no transporte.

### Exercício 17

1. Monitor, Monitor Message Processing: filtra pelo tempo (hora do pedido), pelo estado Failed (ou Retry) e pelo artefacto; ou procura CN-1001 no filtro de ID, se o fluxo definiu SAP_ApplicationID. 2. Abre o log: vê o passo que falhou (a seta vermelha) e o texto do erro; se for 401 no passo do recetor, o 401 vem do destino. Se o 401 aparecer ao chamar o fluxo (e não houver execução no monitor), vem da entrada: token ou role do remetente. 3. Abre o iFlow e confirma o alias no adaptador de saída (CN_ERP_TREINO, sem erros de grafia). 4. Em Manage Security, Security Material: o artefacto existe, está Deployed (e não Error)? Foi editado ontem: cada edição obriga a reintroduzir o Client Secret, por isso se isso não foi feito, o segredo está errado. Confirma o Token Service URL, o Grant Type e a validade do token (pelo menos 10 minutos). 5. Redeploy do fluxo (os fluxos que usam o artefacto têm de ser redeployados e reiniciados). 6. Se ainda falhar, usa o teste de conectividade do tenant contra o recetor e, só se precisares do conteúdo, Trace por pouco tempo, com dados sintéticos: o Trace expira ao fim de 10 minutos por omissão e quem tem o papel Business expert consegue ler o payload. Documentado em ci/Operations/monitor-message-processing, deploying-an-oauth2-client-credentials-artifact, setting-log-levels e tracing-the-execution-of-an-integration-flow.

Critério: segues uma ordem (monitor, log, adaptador, material de segurança, redeploy), distingues 401 de entrada de 401 de saída e usas o Trace como último recurso e com cuidado.

### Exercício 18

(a) Externalizar o URL do ERP e o alias da credencial (parâmetros externalizados): depois do transporte só se configuram os parâmetros e a configuração não é sobrescrita em transportes seguintes. (b) Não viajam: a credencial (User Credentials ou OAuth2) com o alias esperado, o par de chaves e certificados públicos do keystore, known hosts, chaves PGP e access policies. Em produção crias a credencial com o mesmo alias, carregas os certificados e defines os parâmetros, antes do deploy. (c) TMS (ou CTS+ se já existir no teu ambiente): são as duas opções recomendadas, com registo e rotas; a exportação manual fica para urgências e é pouco controlada. Exige o Content Agent Service, o papel WorkspacePackagesTransport e o Transport Mode definido no tenant de origem. (d) Verificação: um pedido autorizado com o orderId de teste CN-TESTE-001 e quantidade 1; no monitor de produção, o estado COMPLETED, o passo do recetor sem erro e a referência de teste visível no ERP; depois o pedido é anulado no ERP de forma controlada. (e) Reversão (os números são exemplo para estudo): se mais de 2 de cada 100 execuções falharem na primeira hora, ou se o pedido de verificação não terminar em COMPLETED, volta à versão anterior do artefacto (Version History) e transporta-a; antes disso, suspende as novas entradas se for preciso. O dono da integração decide a reversão; a equipa do ERP reconcilia as encomendas já gravadas, usando o orderId e o Application Message ID. Documentado em ISuite_Integrations_APIs/decision-help-for-choosing-the-right-content-transport-option, decoupling-development-from-transport-using-externalized-parameters, enabling-content-transport-cloud-foundry-environment e versioning-of-artifacts.

Critério: os parâmetros externalizados cobrem o que muda por ambiente; listas o que não viaja; a reversão tem um critério mensurável, um procedimento e um responsável pela reconciliação.

## Eventos

### Exercício 19

Namespace do message client: casanova/estudo (os filtros de publicação e subscrição começam por ${namespace}/*). Tópico: casanova/estudo/orders/accepted/v1 (5 segmentos, só letras, hífen, ponto e barras, bem abaixo dos 150 caracteres). Filas: casanova/estudo/q.stock e casanova/estudo/q.expedicao, NON EXCLUSIVE, cada uma com uma subscrição ao tópico; fila de mensagens mortas casanova/estudo/q.dlq, criada primeiro e indicada como Dead Message Queue nas duas. Produtor: a aplicação que aceita a encomenda no ERP simulado, que publica no tópico e não diretamente nas filas. Consumidores: o serviço de stock e o de expedição, cada um com a sua fila e a sua cópia. Chave estável do evento: o campo id (evt-cn-1001-01); o orderId CN-1001 é a referência de negócio e não substitui o id, porque a mesma encomenda gera vários eventos. Documentado em ISuite_Event_Mesh/topic-naming-syntax, create-a-queue, create-a-topic-subscription e service-descriptor-syntax.

Critério: a topologia usa um tópico com uma subscrição por fila, uma fila morta, o namespace do cliente, e a chave do evento é distinta da referência de negócio.

### Exercício 20

| Momento | No broker | No consumidor | Efeito |
|---|---|---|---|
| Primeira entrega | Entrega a mensagem; Delivery Count 1 | Grava a reserva de 2 unidades e falha antes de confirmar | Reserva gravada; mensagem não confirmada |
| Segunda entrega | Volta a entregar: Redelivered, Delivery Count 2 | Consulta a tabela de eventos processados, encontra evt-cn-1001-01, não reserva de novo e confirma | Continua uma única reserva |
| Estado final | Mensagem confirmada e removida da fila | Nada | Uma única reserva |

Desenho do consumidor: numa única transação, gravar a reserva e uma linha na tabela de eventos processados, com restrição de unicidade na chave id; confirmar ao broker só depois de a transação terminar. Se a transação falhar, nada fica gravado e a repetição é segura; se o processo morrer depois de gravar e antes de confirmar, a reentrega bate na restrição e confirma sem repetir o efeito. Com Max Redelivery Count 3 e fila morta, se o consumidor continuar a falhar, depois de 3 reentregas a mensagem vai para a fila de mensagens mortas, onde guarda o motivo e espera por reprocessamento; sem fila morta seria purgada (o valor 0, por omissão, repete até ao fim do TTL de 7 dias). Documentado em ISuite_Event_Mesh/queues, create-a-queue e monitor-event-mesh.

Critério: o efeito e o registo do id ficam na mesma transação; a confirmação vem depois; sabes o que a fila morta faz e quando a mensagem é purgada.

### Exercício 21

Campos mínimos do evento: id, orderId, type, occurredAt e um número de versão por encomenda (version, que sobe a cada alteração). O consumidor guarda, por orderId, a versão aplicada. Regra: aplica o evento só se a version do evento for maior do que a guardada; caso contrário confirma o evento e descarta o efeito (regista que foi ignorado). A hora occurredAt serve para auditoria e como desempate, mas é pior chave de ordenação do que o contador de versão, porque relógios diferem.

| Caso | Decisão |
|---|---|
| Evento «expedida» (versão 3) chega antes de «separada» (versão 2) | Aplica (3 é maior do que a guardada 1); guarda a versão 3 |
| Evento «separada» (versão 2) chega depois | Confirma e descarta: 2 não é maior do que 3 |
| Mesma versão repetida (reentrega) | Confirma e descarta: é a idempotência |
| Duas horas iguais sem versão | Desempata por um campo de sequência do produtor; sem ele, a regra não é segura: pede a correção ao produtor |

Função Groovy (não executada nesta revisão), em que stored é a versão guardada e event o evento recebido:

    def boolean deveAplicar(Map stored, Map event) {
        if (stored == null) { return true }
        return event.version > stored.version
    }

O broker não promete ordem entre vários consumidores de uma fila NON EXCLUSIVE, por isso a regra tem de estar no consumidor. Documentado em ISuite_Event_Mesh/queues e create-a-queue; a regra de versão é uma proposta nossa, por testar com dados fictícios.

Critério: a regra não depende da ordem de chegada, descarta o evento antigo depois de o confirmar, e não usa só a hora como chave.

## B2B

### Exercício 22

| Campo | Cardinalidade | Tipo e restrição |
|---|---|---|
| Referência do aviso (shipmentReference) | 1..1 | Texto, obrigatório |
| Encomenda do cliente (customerOrder) | 1..1 | Texto, obrigatório |
| Artigo do fornecedor (supplierItem) | 1..1 por linha | Texto, obrigatório |
| Quantidade expedida (shippedQuantity) | 1..1 por linha | Inteiro, maior do que zero |
| Unidade (quantityUnit) | 1..1 por linha | Código da codelist; permitido: PCE |

As linhas ficam num grupo repetível (por exemplo 1..n). Direção: In, porque o fornecedor é o emissor lógico e a Casa Nova a recetora. Type system: UN/EDIFACT, mensagem DESADV (aviso de expedição): os nomes dos nós vêm da estrutura da mensagem e têm de ser identificados no tenant. Assistente de criação: Type System e Messages escolhem a norma e a mensagem; Envelopes (None); Node Selection e a estrutura selecionam os campos; MIG Creation define Name, Direction, Summary e Business Context. A cardinalidade e a restrição do tipo editam-se no nó (Cardinality, Primitive Type, XSD Pattern); o código permitido seleciona-se na codelist do nó. Por testar no tenant. Documentado em creating-message-implementation-guidelines e working-with-a-node.

Critério: os cinco campos têm cardinalidade e restrição, a unidade só admite o código acordado, e a direção está justificada.

### Exercício 23

| Origem | Destino | Regra |
|---|---|---|
| shipmentReference | externalShipmentId | Copiar; obrigatório |
| customerOrder | orderId | Copiar; obrigatório |
| supplierItem | sku | Mapeamento de códigos por parceiro |
| shippedQuantity | quantity | Copiar; inteiro maior do que zero |
| quantityUnit | unit | Code Value Mapping: PCE para EA |

Código desconhecido (KGM): o valor por omissão do mapeamento de códigos permite só duas coisas, passar o valor de origem ou escolher um código de destino; ambas escondem o erro (KGM entraria no ERP como KGM, ou seria convertido em EA por engano). Por isso a MIG de origem só admite os códigos acordados (a validação gerada a partir da MIG rejeita os restantes), e o código por omissão fica sem uma regra que mascare a falha. A rejeição regista um motivo (por exemplo UNIDADE_DESCONHECIDA) e o aviso fica para correção, sem gerar linha para o ERP. Casos de teste: (1) válido, com SHIP-42, CN-1001, 2 e PCE: gera uma linha com externalShipmentId SHIP-42, orderId CN-1001, quantity 2 e unit EA; (2) sem referência: falha por campo obrigatório, não gera linha; (3) com a unidade KGM: rejeitado, não gera linha. Por testar no simulador da MAG, que aceita um payload de origem e, opcionalmente, um alvo esperado. Documentado em code-value-mapping, runtime-artifacts e simulating-mapping-guidelines.

Critério: o mapeamento de PCE para EA está explícito; o código desconhecido não passa em silêncio; os três casos de teste têm resultado definido.

### Exercício 24

Artefactos por versão: uma MIG de origem por versão do aviso (versão 1 para o Litorâneo, versão 2 para o Ribeirinho), uma MAG por MIG de origem (as duas apontam à mesma MIG de destino do ERP), e um acordo por parceiro, cujas transações escolhem a MIG e a MAG certas. Se os dois acordos partilharem um template, usa Copy from Template para poderes mudar um sem afetar o outro, ou Bind with Template se a transação for igual e quiseres que as mudanças se propaguem. Cuidado: o TPM usa só os 7 primeiros caracteres do tipo de mensagem para calcular o identificador no Partner Directory, por isso duas versões da mesma mensagem não podem estar ativas em simultâneo quando partilham esse prefixo; para o mesmo parceiro, só uma versão do acordo fica ativa; se os parceiros forem diferentes, confirma no tenant que o identificador não colide (por testar). Teste da transição: no tenant de teste, executa a MAG nova com o payload da v2 e a antiga com o da v1, e só depois ativas o acordo do Ribeirinho; usa a simulação da MAG com payload esperado para ver diferenças.

| Nível | O que confirma | Quem emite | Onde se vê |
|---|---|---|---|
| Transporte | O documento chegou pelo canal | O canal (por exemplo AS2) | Monitor do Cloud Integration |
| Confirmação funcional | O parceiro confirma a receção do interchange, se a transação a exigir | O parceiro, ou a Casa Nova para o parceiro | Monitor B2B: Waiting for Acknowledgment ou Acknowledgment Overdue |
| Aceitação de negócio | A Casa Nova aceita o conteúdo (encomenda existe, stock, dados mestres) | O ERP ou a regra de negócio | Estado no ERP; o monitor B2B só mostra o processamento |

Documentado em versioning-in-trading-partner-management, creating-agreement-latest-format, creating-b2b-transactions, activating-a-trading-partner-agreement e monitor-interchanges.

Critério: cada versão tem a sua MIG, a sua MAG e o seu acordo; mencionas a colisão do identificador e o teste isolado; distingues os três níveis de confirmação e a aceitação de negócio não é um estado automático do TPM.

## Open Connectors

### Exercício 25
Resposta de referência. Open Connectors: autenticação gerida na instância e consumida pelo adaptador com um artefacto de credenciais; operações limitadas às que o conector expõe para o recurso; a ligação ao SaaS é mantida pela SAP e pelo conector, que tem o seu ciclo de evolução. Adaptador nativo (se existir para o SaaS): parâmetros específicos do sistema e funcionalidades conforme o perfil. HTTP direto: controlo total do contrato do fornecedor, mas autenticação, paginação e manutenção ficam contigo. Decisão típica para pedidos de apoio: Open Connectors, se o catálogo cobrir a entidade e a autenticação pretendida. Razões possíveis: autenticação e instância já tratadas fora do iFlow; um único adaptador para o recurso. Condição para mudar: falta uma operação ou um filtro no conector (passar a HTTP direto com o contrato do fornecedor), ou o fornecedor não consta do catálogo.
Critério: três opções comparadas nas três linhas, escolha justificada com duas razões, e uma condição de mudança concreta e verificável.

### Exercício 26
Execução normal: passo 1, ponto de controlo vazio, lê a página A, grava T-1, guarda p2; passo 2, lê a página B, grava T-2, guarda cursor nulo. Final: registos T-1 e T-2, cursor nulo. Execução com falha: grava T-1 e guarda p2, lê B, grava T-2 e falha antes de atualizar o cursor. Final: registos T-1 e T-2, cursor ainda p2. Retoma: lê a página B de novo (o cursor ainda é p2), a gravação usa a chave id e atualiza ou ignora T-2 em vez de criar outro, depois guarda o cursor nulo. Final: T-1 e T-2 uma só vez, cursor nulo. Variante com tenant (por testar): para a página A, o script deve deixar proximo igual a p2, temMais igual a true e nItens igual a 1; para a página B, proximo vazio, temMais igual a false e nItens igual a 1.
Critério: a tabela mostra T-2 gravado uma só vez após a retoma e o ponto de controlo só avança depois da gravação.

### Exercício 27
Rotação: criar o novo artefacto User Credentials do tipo OpenConnectors (em Monitor, Security Material) com a nova identidade de leitura; validar a leitura de um recurso de teste; publicar; voltar a publicar e a reiniciar os iFlows que usam o artefacto (a documentação exige-o depois de criar ou alterar o artefacto); confirmar no monitor; revogar a identidade antiga só depois. Com API Management: o token da instância fica num Key Value Map associado ao proxy (política OpenConnectors com InstanceSecret, kvm-map-name e kvm-key-name), e o segredo da organização e do utilizador no provedor. Tabela. 401: verificar identidade, expiração, artefacto publicado e iFlow reiniciado antes de repetir; não repetir em ciclo, porque pode bloquear a conta. 429: aplicar uma política limitada de novas tentativas, por exemplo três tentativas com espera crescente, respeitando a indicação de espera do fornecedor se existir (comportamento por confirmar no teu SaaS). Registar: código de resposta, referência da encomenda, nome do recurso, identificador da tentativa e hora. Nunca registar segredo, token ou corpo com dados pessoais.
Critério: procedimento com a ordem criar, validar, publicar, reiniciar e só depois retirar o antigo; 401 diagnosticado antes de repetir; 429 com política limitada; lista de campos sem segredos.

## Modernização e migração

### Exercício 28
Stock por ficheiro: avaliar migração. Categoria provisória Adjustment required ou Evaluation required, conforme o ficheiro (por exemplo, campos de largura fixa e adaptadores personalizados são limites documentados). Confirmar: formato, horários, dependência SFTP, dono e quem recebe o resultado. Encomendas: redesenhar com contrato explícito; categoria provisória Adjustment required, porque o comportamento exigido (duplicados, regras) não se copia ao desenho antigo. Confirmar regras de negócio e duplicados. Portal retirado: retirar, depois de confirmar ausência de tráfego, o dono e a data de encerramento; categoria irrelevante enquanto a retirada não for confirmada (se o tráfego existir, passa a avaliar). Justificação possível: o Migration Assessment não analisa código de adaptadores personalizados nem dependências recursivas, por isso o relatório não chega sozinho.
Critério: três decisões coerentes com as três categorias, informação a confirmar por interface e pelo menos uma justificação ligada a um limite documentado.

### Exercício 29
Casos: (1) válida: CN-1001, sku C-01, quantidade 2; resultado esperado: um registo no ERP nos dois percursos, mesmo estado de aceitação; (2) rejeitada: quantidade 0; resultado: nenhum registo e o mesmo código de erro de negócio nos dois percursos; (3) repetida: a mesma encomenda enviada duas vezes; resultado: um só efeito e a segunda resposta igual à primeira. Contagens a comparar: pedidos recebidos, registos criados, rejeitados e repetidos ignorados. Normalizar: hora de execução e identificadores técnicos dependentes do ambiente (o identificador de mensagem, o erpId se for gerado de forma diferente). Exceção: credencial expirada, com o mesmo resultado de negócio (recusa sem efeito) e sem segredo nos registos.
Critério: três casos com entrada, resultado de negócio e contagens, campos normalizados justificados e uma exceção.

### Exercício 30
Desenho: executar o novo fluxo em paralelo com saída de verificação sem escrita; comparar contagens e somas por lote durante uma janela; critério de interrupção exemplo: qualquer diferença nas contagens por lote, ou mais de 0,5 por cento de mensagens com diferença de negócio (o valor é exemplo, define o teu). Suspender a origem: um responsável nomeado para a pasta ou fila de origem, e confirmação de que não há ficheiros nem mensagens pendentes. Reversão técnica: voltar a rota para o fluxo antigo (mudança de configuração). Reconciliação: tratar o que o novo fluxo já gravou no ERP, usando a chave do lote como chave de negócio. Resposta para os 40 lotes: listar os 40 lotes pela chave de negócio, confirmar o efeito de cada um no ERP, marcá-los como já processados no antigo (ou anulá-los) antes de reativar, para não os processar duas vezes. Standard ou Pipeline: uma interface isolada, com poucos cenários, justifica a abordagem Standard, ficando o tratamento de erros por tua conta; com muitos cenários semelhantes, a Pipeline traz tratamento de erros e menos filas. Por testar no assistente do Migration Tooling.
Critério: critério de interrupção mensurável, responsável pela origem, separação clara entre reversão e reconciliação, e a resposta dos 40 lotes com a chave de negócio.

## SAP S4HANA Azure e IA

### Exercício 31
Contrato: o catálogo da SAP (SAP Business Accelerator Hub) para a edição e a versão do S/4HANA, e a página da API: entidades, operações, autenticação. Tabela: Address, URL do serviço OData V2 (por ambiente, externalizado); Proxy Type, Internet ou On-Premise com Location ID do Cloud Connector; Authentication, o método que a API exige (Basic, certificado ou OAuth2, e Principal Propagation apenas com On-Premise); CSRF Protected, ativo por omissão, mantém; Operation, Create para registar a encomenda; Resource Path, a coleção da entidade escolhida no assistente de modelação. Consequência do formato: o adaptador OData V2 só suporta XML, por isso o iFlow converte o JSON do portal para XML antes e a resposta de XML para o contrato de resposta depois. Confirmar autenticação, paginação e escrita num sistema de teste: um pedido de leitura (Query) para ver a paginação, uma escrita de teste e a resposta HTTP (cabeçalho camelhttpresponsecode), tudo por testar.
Critério: fontes do contrato identificadas, seis campos do adaptador preenchidos com forma de confirmação, e a consequência do XML explicada.

### Exercício 32
Evento: campos orderId, sku, quantity e hora; MessageId derivado de orderId, por exemplo stock-CN-1001, estável entre repetições; Correlation ID igual à referência da encomenda. Tópico com uma subscrição por consumidor (o serviço de stock tem a sua), em vez de fila, se houver vários consumidores. Adaptador (receiver): Hostname do espaço de nomes, Authentication Type Microsoft Entra ID ou Shared Access Signature com os aliases de Secure Parameter (sem valores no desenho), Entity Topic com o nome do tópico, Content Type Application/JSON. Consumidor: confirma (Acknowledge) só depois de gravar o efeito; em falha, Move to Dead Letter Queue ou Defer com alerta. Retoma: reprocessar a partir da dead letter pela chave MessageId, com proteção contra duplicados também no consumidor. Depende de Azure real: espaço de nomes, políticas e a deteção de duplicados.
Critério: MessageId estável, consumidor e confirmação definidos, retoma descrita, segredos ausentes e dependências de Azure marcadas.

### Exercício 33
Aceitável: categoria rever_morada e pontuação 0.9; destinoCaso automatico, motivoCaso ok. Inválida: categoria desconhecida; destinoCaso revisao, motivoCaso categoria_invalida (com corpo que não é JSON: revisao e resposta_ilegivel). Timeout: o adaptador falha; tratar no subprocesso de exceção atribuindo destinoCaso revisao e um motivo de indisponibilidade, e continuar sem impedir a gravação da encomenda. Evidência da decisão humana: registo com a referência da encomenda, a decisão e quem a tomou, num sítio com retenção adequada. Limiar: calibrar com um conjunto de casos do domínio (falsos positivos e negativos) e voltar a validar quando o modelo ou a instrução mudar. Com tenant (por testar): resultado esperado igual aos valores acima.
Critério: três respostas com valores esperados corretos, nenhuma afeta a gravação da encomenda, limiar justificado por conjunto de validação.

## Projeto final

### Exercício 34
Entrega esperada: contrato com exemplos (entrada do portal, entrada do ERP, resposta); mapa do fluxo com Portal, iFlow, ERP simulado e serviço de stock, e a correlação por orderId e externalId; os seis casos (201, 200, 409, 400, 503 e resposta perdida) com o comando ou a resposta; prova da consulta após conflito: depois do 409, a consulta GET por referência devolve o registo original com a quantidade inicial; desenho para resposta perdida: o cliente consulta por referência, e se não existir repete com a mesma chave, o que é seguro por ser idempotente; grelha de nove critérios com nível e evidência por linha; se houve deploy, identificador saneado da execução e perfil.
Critério: os nove critérios preenchidos com uma evidência cada, sem nada marcado como demonstrado sem prova, e a prova da consulta pós-conflito presente.

## Fontes oficiais

- [Build Your Integrations and APIs](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/centralized-developer-hub-38422de917ee40e1a47df0b368def295-1188)
- [Define Idempotent Process Call](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/define-idempotent-process-call)
- [Azure Service Bus duplicate message detection](https://learn.microsoft.com/en-us/azure/service-bus-messaging/duplicate-detection)
