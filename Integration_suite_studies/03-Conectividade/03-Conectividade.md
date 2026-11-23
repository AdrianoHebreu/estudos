# Conectividade e adaptadores

Os adaptadores ligam as mensagens do iFlow aos sistemas que as enviam ou recebem. Antes de escolheres um adaptador, define o sentido da comunicação, o contrato do destino, a autenticação, os limites de tempo e o que fazer perante uma falha. Para a Casa Nova, o portal chama o SAP por HTTPS. O iFlow chama o simulador do ERP e devolve um resultado compreensível ao portal. Nesta aula resumes os adaptadores HTTP, SOAP, OData, SFTP, Mail e JDBC, as opções de autenticação e o papel do Cloud Connector.

**NOTA:** Documentado significa resumo de uma página da documentação SAP (nomes em ISuite_Integrations_APIs/ e ci/ConnectionSetup/, no fim de cada secção). Observado só se aplica ao módulo 01. Todos os laboratórios desta aula são por testar no teu tenant: nenhum foi executado nesta revisão. Os nomes dos campos são os da documentação em inglês e podem variar com a versão do adaptador.

## Escolher pelo contrato

| Adaptador | Encaixa quando | Verifica antes do teste |
|---|---|---|
| HTTPS (entrada) ou HTTP (saída) | Pedidos e respostas por URL | Método, TLS, autenticação e códigos |
| OData (V2 ou V4, saída) | Um serviço expõe entidades e operações OData | Versão, metadados, filtros e paginação |
| SOAP (SOAP 1.x) | O contrato é definido em WSDL | Operação, namespaces e SOAP Fault |
| SFTP | A troca ocorre por ficheiros (não serve para FTP) | Diretório, chave do servidor e arquivo |
| Mail | Envio ou leitura de notificações | Conta, porta, anexos e política de dados |
| JDBC (saída) | Gravar ou ler numa base de dados | Driver, Data Source, formato XML SQL e Cloud Connector |
| IDoc | Documentos de negócio SAP | Tipo de IDoc, porta e confirmações |
| RFC | Chamada remota a função SAP permitida | Função, autorização e Cloud Connector |

Os sentidos suportados dependem do adaptador. No padrão deste curso, o HTTPS Sender expõe um endpoint e o HTTP Receiver efetua a chamada de saída. O adaptador SFTP, por exemplo, tem versão de entrada (o tenant lê ficheiros) e de saída (o tenant escreve).

## Entrada HTTPS

Documentado (ISuite_Integrations_APIs/https-sender-adapter-0ae4a78.md). Parâmetros e comportamentos que importam:

| Campo ou comportamento | O que faz | Quando usar ou cuidado |
|---|---|---|
| Address | Caminho relativo; ao fazer deploy, é acrescentado ao endereço da instância de serviço com o prefixo /http. Exemplo: /myIntegrationFlow dá /http/myIntegrationFlow | Tem de ser único no tenant: se repetires o endereço, o iFlow não arranca; não distingue maiúsculas |
| CSRF Protected | Exige o cabeçalho X-CSRF-Token nos pedidos que alteram dados; um GET ou HEAD devolve o token | A validação falhada devolve 403; desativa se o portal não obtém o token |
| Maximum Message Size (Body Size em MB) | Rejeita mensagens acima do limite | O mínimo permitido é 1 MB |
| Allowed Headers (configuração do iFlow) | Cabeçalhos e parâmetros do pedido só chegam ao fluxo se estiverem nesta lista | Envia apenas os cabeçalhos do contrato |
| Return Exception to Sender | Devolve a exceção ao cliente; se desativado, devolve uma mensagem com o identificador do registo (MPL ID) e não o stack trace | Preferível para clientes externos |
| Código de resposta | Com Cloud Integration 8.x: 200 sucesso, 204 sem conteúdo; o cabeçalho CamelHttpResponseCode permite personalizar | Define o código no fim do fluxo para o portal |

O adaptador acrescenta cabeçalhos ao fluxo, como CamelHttpUrl, CamelHttpQuery, CamelHttpMethod, CamelHttpPath e SapAuthenticatedUserName (o utilizador que chamou). Não podes acrescentar manualmente os cabeçalhos com prefixo camel: o adaptador remove os que enviares. Os parâmetros de query chegam como cabeçalhos. Recomenda-se remover cabeçalhos internos antes de responder.

## Saída HTTP

Documentado (ISuite_Integrations_APIs/http-receiver-adapter-2da452e.md):

| Campo | O que faz | Valores e limites |
|---|---|---|
| Address | URL do destino | Client Certificate exige HTTPS; certos parâmetros de URL são proibidos (por exemplo throwExceptionOnFailure) |
| Proxy Type | Como se chega ao destino | Internet para cloud, On-Premise para sistemas por Cloud Connector |
| Method | Verbo HTTP | POST, GET, DELETE, e Dynamic (lê de cabeçalho ou propriedade) |
| Authentication | Como o tenant se autentica no destino | None, Basic, Principal Propagation (só On-Premise), Client Certificate, OAuth2 Client Credentials, OAuth2 Password Credentials, OAuth2 SAML Bearer Assertion |
| Timeout (in ms) | Tempo máximo à espera de resposta | Valor por omissão 60000 (1 minuto); não altera o timeout TCP de componentes intermédios |
| Throw Exception on Failure | Lança exceção quando o servidor responde com erro HTTP | Ativado por omissão; desativado, recebes a resposta qualquer que seja o código, mas não os erros de rede ou timeout |
| Retry on Exception e Retry on Error Response | Repete o pedido | Desativado por omissão; o intervalo máximo é 60 s e o máximo é 3 repetições; o Retry-After do destino prevalece |
| Streaming | Usa disco para payloads grandes | Sem streaming, o payload todo vai para memória (pode falhar acima de 2 GB) |

Os cabeçalhos CamelHttpUri e CamelHttpQuery alteram o destino dinamicamente. Por isso, o endereço do destino é configuração do ambiente e nunca deve ser preenchido a partir do corpo ou dos cabeçalhos do pedido do portal. Define sempre o cabeçalho Content-Type antes da chamada (a documentação recomenda-o).

Mesmo que o cliente deixe de esperar, o ERP pode ter gravado a encomenda. Usa uma chave de idempotência e uma forma de consultar a referência antes de repetir um pedido que pode ter escrito dados. Retry on Error Response é seguro para pedidos de leitura ou escritas idempotentes, e deve ser tratado com cuidado nos restantes.

## Autenticação

Documentado (ci/ConnectionSetup/authentication-options-inbound-5495ee0.md, authentication-options-outbound-58a7537.md, authorization-options-inbound-c98c87e.md, service-key-types-0fc1446.md e setting-up-inbound-http-connections-integration-flow-processing-0f92842.md).

| Sentido | Opção | Como funciona | Nota |
|---|---|---|---|
| Entrada | Basic | Utilizador e palavra-passe; no ambiente Cloud Foundry podem vir da chave de serviço (clientId e clientsecret) ou de um utilizador do IdP | Usa TLS; prefere as opções abaixo |
| Entrada | OAuth 2.0 Client Credentials | O cliente obtém um token no servidor de tokens do BTP e chama o iFlow com ele | Descrita pela documentação como recomendada |
| Entrada | Certificado de cliente | Certificado SAP gerado com a chave de serviço, ou externo | Recomendada; o certificado precisa do uso estendido Client Authentication (OID 1.3.6.1.5.5.7.3.2), validado no balanceador de carga |
| Entrada, autorização | User Role | O adaptador de entrada tem um papel; por omissão ESBMessaging.send, ou um papel próprio | O papel é atribuído à instância de serviço (plano integration-flow) |
| Saída | Basic | O tenant usa um artefacto User Credentials implantado em Monitor, Security Material | O certificado raiz do servidor tem de estar no keystore do tenant |
| Saída | Certificado de cliente | Par de chaves do keystore do tenant; Private Key Alias opcional | Exige HTTPS |
| Saída | OAuth | Client Credentials, Password Credentials ou SAML Bearer | Credencial num artefacto OAuth2 |

Os tipos de chave de serviço são ClientId/Secret, Certificate (gerado pela SAP, com validade em dias até 365) e External Certificate. Uma instância de serviço funciona como a definição de um cliente OAuth. Para o portal da Casa Nova, cria uma instância e uma chave de serviço só para ele, para poderes revogar o acesso sem afetar outros consumidores.

**ATENÇÃO:** as credenciais ficam em artefactos de segurança e nunca no corpo, em cabeçalhos ou em propriedades. A documentação de scripts avisa que o tracing pode mostrar esses valores em texto limpo.

## Sistemas privados e o Cloud Connector

Documentado (ci/ConnectionSetup/using-sap-cloud-connector-with-cloud-integration-adapters-65a60e7.md e outbound-sap-cloud-connector-642e87f.md). O Cloud Connector corre na tua rede como agente com ligação invertida: não precisas de abrir a firewall para o exterior. Instala-se no sistema on-premise, configura-se uma vez, e os adaptadores usam-no ao escolher Proxy Type On-Premise.

| Elemento | Função |
|---|---|
| Cloud Connector | Estabelece a ligação autorizada e protege o sistema interno |
| Endereço virtual no Cloud Connector | Aparece no campo Address do adaptador; o sistema real fica escondido |
| Location ID | Identifica o Cloud Connector quando existem vários na conta |
| Autorização do sistema de destino | O sistema SAP continua a exigir autenticação adequada (por exemplo, Basic ou Principal Propagation) |

Restrições documentadas para Proxy Type On-Premise: usa http:// (e não https://) no endereço virtual e não uses Client Certificate como autenticação. A alternativa ao Cloud Connector é um proxy inverso, como o SAP Web Dispatcher.

## SOAP

Documentado (configure-the-soap-soap-1-x-sender-adapter-a178913.md e configure-the-soap-soap-1-x-receiver-adapter-57f7b34.md).

| Aspeto | Entrada (sender) | Saída (receiver) |
|---|---|---|
| Endereço | Address, relativo (por exemplo /HCM/GetEmployeeDetails) | Address do serviço; pode ser dinâmico com expressão de cabeçalho ou propriedade (escreve em CamelDestinationOverrideUrl) |
| Contrato | Service Definition: Manual ou WSDL (Service e Endpoint com prefixo, como p1:MyService) | URL to WSDL opcional |
| Padrão de mensagem | Request-Reply ou One-Way (com Processing Settings WS Standard ou Robust) | Cabeçalho SOAPAction suportado |
| Estilo de WSDL | Só document-style (RPC não é suportado) | RPC só sem WSDL; prefere document-style |

Em SOAP, o sucesso do transporte e a confirmação de negócio são coisas diferentes. Um SOAP Fault tem um tratamento próprio (a documentação tem uma página sobre criar uma resposta de exceção para adaptadores SOAP).

## OData

Documentado (configure-the-odata-v2-receiver-adapter-c5c2e38.md). Pontos principais do adaptador de saída OData V2:

| Campo | O que faz | Cuidado |
|---|---|---|
| Operation Details | Query, Create, Update, Merge, Read, Delete, Patch, Function Import ou Dynamic | Usa a versão mais recente do adaptador |
| Resource Path | Entidade; Update e Merge usam EntitySet(chave) | Navegação não é suportada no caminho |
| Content Type | Atom (por omissão) ou JSON | O adaptador só aceita corpo em XML |
| Page Size | Vazio por omissão (paginação do servidor com o link next) | Recomenda-se deixar vazio |
| Process in Pages | Processa por páginas num Local Integration Process chamado por um Looping Process Call | Condição: propriedade hasMoreRecords contém true, máximo de 999 iterações |
| Timeout (in min) | Espera por pedido | Aplica-se a cada pedido interno, não ao total |
| CSRF Protected | Protege contra CSRF | Mantém selecionado |

Para recolhas incrementais, guarda um ponto de controlo depois de persistir a página e trata a repetição de registos. Confirma a sintaxe dos filtros no serviço e a semântica das datas e fusos horários.

## SFTP

Documentado (configure-the-sftp-sender-adapter-2de9ee5.md e configure-the-sftp-receiver-adapter-4ef52cf.md).

| Sentido | Campo | O que faz |
|---|---|---|
| Entrada | Directory e File Name | Caminho e padrão; File Name vazio lê todos os ficheiros do diretório |
| Entrada | Read Lock Strategy | None, ou Done File Expected (ficheiro .done na mesma pasta); evita ler um ficheiro ainda a ser escrito |
| Entrada | Max. Messages per Poll | De 1 a 500 (20 por omissão); Lock Timeout por omissão 15 minutos |
| Entrada | Post-Processing | Delete File (por omissão) ou Keep File and Mark as Processed in Idempotent Repository; só mensagens com sucesso são pós-processadas |
| Saída | Handling for Existing Files | Append, Fail, Ignore ou Override |
| Saída | Use Temporary File | Escreve com nome temporário e renomeia no fim (válido com Fail, Ignore ou Override) |
| Saída | Append Timestamp | Acrescenta data e hora (GMT); pode não garantir nomes únicos |
| Ambos | Timeout, Maximum Reconnect Attempts | Timeout por omissão 10000 ms (máximo 299999); 3 reconexões por omissão |

Em SFTP, acorda o nome, o delimitador, a codificação e o momento em que o ficheiro está pronto. Só arquiva após sucesso e mantém um registo de ficheiros já processados. A documentação exige a configuração da ligação (chaves e known hosts) em ci/ConnectionSetup, nas páginas de SFTP. Para SOAP e IDoc, verifica separadamente o sucesso do transporte e a confirmação de negócio.

## Mail e JDBC

Documentado (configure-the-mail-receiver-adapter-f68d5e0.md e jdbc-receiver-adapter-88be644.md).

| Adaptador | Pontos a saber |
|---|---|
| Mail (saída) | Address com host e porta do servidor SMTP; as portas recomendadas são 587 (STARTTLS) e 465 (SMTPS), e a porta 25 não é recomendada; Protection: Off, STARTTLS Mandatory, STARTTLS Optional ou SMTPS; Timeout por omissão 30000 ms |
| JDBC (saída) | Precisa de um driver implantado pelo administrador e de um Data Source; usa o formato XML SQL; só suporta ligações TCP; opções Connection Timeout, Query Timeout, Maximum Records e Batch Mode |

A lista de bases suportadas inclui SQL Server, Oracle, PostgreSQL, MariaDB, SAP HANA, SAP ASE e DB2 (cada uma tem a sua página). Para o caso da Casa Nova, JDBC é uma alternativa por testar: o módulo não prevê uma base de dados real.

## Laboratório HTTP

1. Inicia o simulador do módulo 12 e consulta `GET /health`. Usa essa rota para um primeiro teste sem escrita.
2. Para testar dentro do tenant, usa um endpoint HTTPS controlado acessível ao runtime. `127.0.0.1` no runtime SAP não aponta para o teu computador. Para um primeiro teste SAP sem servidor próprio, segue o serviço de exemplo do tutorial oficial.
3. Cria um novo iFlow com Timer, Request Reply e End. Liga o Request Reply a um recetor HTTP. Usa GET, o endpoint autorizado e os parâmetros de autenticação do ambiente. Define Timeout 10000 ms para o teste.
4. Verifica o corpo e o código HTTP no monitor. Repete com um caminho inválido e regista a diferença. Com Throw Exception on Failure ativado (por omissão), um erro HTTP deve terminar o fluxo em falha. Resultado esperado, por testar: estado Failed e anexos de detalhe do erro.
5. Desativa Throw Exception on Failure e repete o caminho inválido. Resultado esperado, por testar: o fluxo termina e o código de erro fica no cabeçalho de resposta (confirma o nome no monitor).
6. Passa para HTTPS Sender só depois de confirmares a chamada de saída. Testa a entrada com um cliente autorizado e envia apenas os cabeçalhos do contrato. Confirma no monitor o endereço final (/http/ mais o teu Address).

    curl.exe -i http://127.0.0.1:8765/health

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| O iFlow de entrada não arranca depois do deploy | Se outro iFlow usa o mesmo Address do HTTPS Sender (tem de ser único e não distingue maiúsculas) |
| O portal recebe 401 ou 403 | Autenticação (token ou certificado), papel do iFlow (ESBMessaging.send ou o papel próprio) e CSRF Protected |
| Um cabeçalho enviado pelo portal não aparece no fluxo | Se está na lista Allowed Headers e se não tem o prefixo camel |
| O recetor HTTP falha ao fim de um minuto | Timeout (por omissão 60000 ms) e o timeout de componentes intermédios |
| O destino respondeu com erro mas o fluxo seguiu | Throw Exception on Failure está desativado? |
| O sistema on-premise não responde | Proxy Type, Location ID, endereço virtual com http:// e a configuração de acesso no Cloud Connector |
| O ficheiro SFTP é lido incompleto | Read Lock Strategy ou Done File Expected |
| O adaptador OData falha com corpo JSON | O adaptador de saída OData V2 só aceita XML no corpo |

## Exercícios

**PRATICAR:** resolve os exercícios 7 a 9 no módulo 13. Inclui no teu registo o adaptador, o contrato, o tempo-limite e as condições em que repetir uma chamada é seguro.

## Fontes oficiais

- [Connectivity Options](https://help.sap.com/docs/integration-suite/sap-integration-suite/connectivity-options?q=Cloud+Integration)
- [Connectivity Options and Communication Security](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/connectivity-options-and-communication-security)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
- [HTTPS Sender Adapter (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/https-sender-adapter-0ae4a78.md)
- [HTTP Receiver Adapter (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/http-receiver-adapter-2da452e.md)
- [Authentication Options Inbound (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ci/ConnectionSetup/authentication-options-inbound-5495ee0.md)
- [Service Key Types (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ci/ConnectionSetup/service-key-types-0fc1446.md)
- [Configure the SFTP Sender Adapter (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/configure-the-sftp-sender-adapter-2de9ee5.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
