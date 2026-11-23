# Publicar e governar APIs

O portal da Casa Nova precisa de enviar encomendas sem conhecer os detalhes do ERP. Neste módulo vais pôr uma camada de API Management à frente do iFlow de encomendas: um proxy com endereço estável, políticas que verificam quem chama e quantas vezes, e um produto que agrupa a API para os consumidores. No fim sabes dizer, para qualquer pedido que falhe, em que camada falhou: proxy, política, iFlow ou destino.

**NOTA:** este módulo foi escrito a partir da documentação oficial da SAP e não de uma execução no tenant. O que a documentação descreve está marcado como «Documentado»; o que tens de confirmar no teu ecrã está marcado como «Por testar». O API Management pode não estar ativo num tenant trial: se for o caso, faz o laboratório em papel.

## O mapa do API Management

O API Management é uma capacidade do Integration Suite com cinco componentes (Documentado, components-of-api-management):

| Componente | Quem o usa | Para quê |
|---|---|---|
| API Portal | Administrador de APIs | Criar, proteger e publicar proxies, definir produtos e planos de preço |
| API Runtime | Aplicações cliente | Onde as APIs publicadas respondem aos pedidos |
| Developer Hub | Programadores de aplicações | Descobrir APIs, subscrever produtos, obter chaves e testar |
| API Analytics | Administrador | Ver tráfego, tempos de resposta e erros |
| API Designer | Programador da API | Desenhar a especificação OpenAPI |

Na Casa Nova, tu és o administrador (API Portal) e o programador do portal de encomendas é o consumidor (Developer Hub). O iFlow de encomendas, do módulo 01 em diante, é o serviço de destino.

**NOTA:** a documentação descreve dois modelos. O modelo clássico, com API proxy, políticas em XML e produtos, é o que este módulo usa. O modelo mais recente, o artefacto de API (API artifact) dentro de Design, Integrations and APIs, aparece na secção «O modelo de artefacto de API». Qual dos dois está disponível depende do teu tenant: por testar.

## Proxy, endpoints e fluxos

Um **API proxy** é a representação de uma API, implementada como ficheiros de configuração, políticas e scripts. Desacopla quem chama das alterações no destino (Documentado, api-proxy). Tem sempre um endpoint de entrada e zero ou mais endpoints de saída:

| Peça | Função | Exemplo Casa Nova |
|---|---|---|
| Proxy Endpoint | Define como os clientes chamam a API (ligações de entrada) | Host virtual e base path da API de encomendas |
| Target Endpoint | Define a ligação ao serviço real (ligações de saída) | URL HTTPS do iFlow de encomendas |
| Route Rule | Escolhe o Target Endpoint quando há mais do que um | Teste e produção, conforme uma condição |
| Fault Rule | Trata os erros com uma resposta própria | Mensagem estável para chave inválida |

Cada endpoint tem um pipeline de pedido e de resposta, dividido em fluxos (Documentado, flow):

| Fluxo | Quando corre | Uso típico |
|---|---|---|
| PreFlow | Sempre primeiro | Segurança e quota: o pedido recusado nem chega ao destino |
| Conditional Flow | Só se a condição for verdadeira, e só o primeiro que cumprir | Converter XML em JSON só para certos clientes |
| PostFlow | Sempre no fim | Registo ou notificação |
| PostClientFlow | Depois de a resposta seguir para o cliente | Só políticas de registo de mensagens, só na resposta |

Uma política é ligada a um fluxo como um **passo**; cada passo tem uma condição que decide se a política corre. A ordem dos passos é a ordem de execução (Documentado, policies).

Há três atributos comuns a todas as políticas (Documentado, policy-types): `enabled` liga ou desliga a política, `continueOnError` decide se o processamento continua quando a política falha (nas políticas de quota deve ficar a falso) e `async` corre a política noutro fio.

## Criar o proxy

Pré-requisito: o papel APIPortal.Administrator. No API Portal, o caminho é Configure, APIs, Create (Documentado, create-an-api-proxy). Há três formas de partir:

| Opção | Quando usar | Notas documentadas |
|---|---|---|
| URL | Tens o endereço HTTPS do destino | Escolhe o Service Type: REST, OData ou SOAP; o URL não deve redirecionar para outro |
| API Provider | O destino é um sistema já configurado (por exemplo Cloud Integration ou SAP Gateway) | Só nestes dois tipos há descoberta (Discover) de serviços |
| API Proxy | Queres um proxy novo baseado noutro proxy | Útil para criar variantes |

Campos do assistente de criação (URL): Name, Title, Short Text, versão opcional, Host Alias (host virtual), API Base Path e Service Type. O nome só aceita letras, números, sublinhado e hífen e não pode começar por hífen.

Quando indicas uma versão, o sistema acrescenta-a ao nome e antepõe-a ao base path: com a versão v1, o nome passa a Nome_v1 e o caminho a /v1/…. Depois de versionado, não podes editar a versão nem o base path (Documentado, api-versioning). Para a Casa Nova, usa o nome Encomendas, a versão v1 e o base path orders: o endereço público fica /v1/orders, como no contrato `POST /v1/orders`.

Depois de criado, o separador Overview mostra nome, host alias, base path, estado e descrição; há ainda os separadores Proxy Endpoint, Target Endpoint, Resources e Revisions. Para publicar, escolhe Deploy; o proxy fica então acessível na Internet pelo host virtual e pelo base path e já pode ser incluído num produto (Documentado, deploy-an-api-proxy).

**ATENÇÃO:** a combinação host virtual mais base path tem de ser única. Por omissão só existem 3 hosts virtuais por tenant no Cloud Foundry, e o host virtual só aceita HTTPS na porta 443 (Documentado, limits-in-api-management).

Se o destino for um iFlow do teu tenant, podes criar um API Provider do tipo Cloud Integration e usar Discover: a lista traz os iFlows e APIs (OData, REST, SOAP) publicados. Na autenticação escolhes Basic, Client Certificate ou OAuth2ClientCredentials (Client ID, Client Secret e Token URL do cliente OAuth do tenant). Atenção: palavras-passe de certificados com caracteres como ! ou # podem falhar na importação (Documentado, creating-an-api-proxy-using-sap-cloud-integration-api-provider).

## Políticas de acesso e tráfego

A documentação lista cerca de 30 políticas pré-construídas (Documentado, policy-types). As que interessam à Casa Nova:

| Política | Intenção | Configuração documentada |
|---|---|---|
| Verify API Key | Reconhecer a aplicação cliente | Elemento APIKey com ref para o local da chave, por exemplo request.header.apikey ou request.queryparam.key |
| OAuth v2.0 (VerifyAccessToken) | Validar o token e, opcionalmente, os scopes | Operation VerifyAccessToken e Scope (lista separada por espaços); por omissão o token vem no cabeçalho Authorization |
| Quota | Limitar o número de pedidos por aplicação num intervalo | Allow count, Interval, TimeUnit (minute, hour, day, week, month), Identifier, tipo calendar, flexi ou rollingwindow |
| Spike Arrest | Proteger o destino de picos | Elemento Rate, por exemplo 30pm (30 por minuto); não guarda contador, só a hora do último pedido |
| Raise Fault | Devolver um erro com código e texto teus | FaultResponse com StatusCode, ReasonPhrase e Payload |
| Message Validation e threat protection | Rejeitar pedidos fora do contrato | Políticas de validação de mensagem e de proteção JSON, XML e expressões regulares |

Exemplo de Verify API Key, adaptado do esquema da documentação (não executado nesta revisão):

    <VerifyAPIKey async="true" continueOnError="false" enabled="true"
        xmlns="http://www.sap.com/apimgmt">
        <APIKey ref="request.header.apikey"></APIKey>
    </VerifyAPIKey>

Esta política preenche variáveis de fluxo com o prefixo verifyapikey.nome_da_política, por exemplo client_id, developer.app.name, apiproduct.name e as de quota do produto (apiproduct.developer.quota.limit, interval e timeunit). Quando a chave falha, a variável failed fica a true.

Os erros de Verify API Key documentados são todos HTTP 401: FailedToResolveAPIKey (a chave não veio no local indicado), InvalidApiKey, InvalidApiKeyForGivenResource, DeveloperStatusNotActive e invalid_client-app_not_approved (Documentado, handling-faults-using-faultrules-and-defaultfaultrule).

### Quota e Spike Arrest não são a mesma coisa

| Aspeto | Quota | Spike Arrest |
|---|---|---|
| Pergunta | Quantos pedidos por aplicação num período? | A que ritmo máximo deixo passar tráfego? |
| Mecanismo | Contador | Regra de tempo desde o último pedido aceite |
| Uso recomendado | Limitar cada consumidor (plano contratado) | Proteger o destino; não limitar clientes individuais |
| Falha | Fault QuotaViolation, código policies.ratelimit.QuotaViolation | Fault SpikeArrestViolation |
| Limitação | Contador por nome da política, dentro do proxy | Não é distribuído: pode haver discrepância entre o esperado e o real |

Exemplo da documentação: 6 mensagens por minuto num Spike Arrest significa um pedido a cada 10 segundos; um segundo pedido dentro desses 10 segundos, no mesmo servidor, é rejeitado (Documentado, spike-arrest).

Os tipos de quota (Documentado, types-of-quota):

| Tipo | Quando começa a contar | Exemplo |
|---|---|---|
| calendar (é o valor por omissão) | Na StartTime que indicas | 99 pedidos por 20 minutos a partir de 2015-06-26 08:30:00 |
| flexi | No primeiro pedido de cada aplicação | Acesso de uma semana ou um mês por aplicação |
| rollingwindow | Janela deslizante por cliente | 1000 pedidos em cada 24 horas |

Todas as horas de quota estão em UTC, no formato ISO 8601 (Documentado, understanding-quota-time-notation). A quota pode ser estática (count e intervalo fixos) ou dinâmica: os valores vêm do produto, através das variáveis apiproduct.developer.quota.limit, interval e timeunit (Documentado, static-and-dynamic-settings). Cada política Quota mantém um contador próprio, identificado pelo nome da política e, com Identifier, por aplicação.

**DICA:** um pedido recusado por uma política no PreFlow do proxy não chega ao destino. Se o iFlow mostrar uma execução para um pedido que devia ter sido recusado, a política está no fluxo errado ou desativada (atributo enabled).

## Produtos, aplicações e subscrições

Um **produto** agrupa um ou mais proxies para os expor aos programadores. Criação (Documentado, create-a-product): menu Engage, separador Products, Create; indicas Name, Title, Short Text e Description e os limites de quota. Há dois pontos críticos:

- Definir quota no produto não a impõe: tens de ter as políticas Verify API Key e Quota no proxy. A quota do produto é um valor por omissão que as políticas de quota podem referenciar (as variáveis acima) e prevalece sobre a do proxy.
- Podes alterar a quota do produto em runtime, e as políticas que a referenciam passam a usar o novo valor.

Cadeia completa, do consumidor ao destino:

| Passo | Quem faz | Onde | Resultado |
|---|---|---|---|
| 1. Registo | Programador do portal | Developer Hub, botão Register | Pedido enviado ao administrador, que aprova ou rejeita (com motivo) |
| 2. Subscrição | Programador | Developer Hub, Subscribe ou My Workspace | Cria uma aplicação com o produto |
| 3. Chave | Sistema | Dentro da subscrição | Chave gerada automaticamente |
| 4. Chamada | Aplicação cliente | URL do proxy com a chave | A política Verify API Key valida a chave e a quota é contada |

O programador pode regenerar a chave: a antiga deixa logo de funcionar (Documentado, creating-a-subscription-for-application-with-application-developer-role). O administrador do Developer Hub pode configurar a governação das subscrições para aprovação automática (Auto Approval) ou para aprovação fora do Developer Hub (Manage Approval Outside Developer Hub) e pode revogar o acesso a um programador, com motivo, em Admin Center, Manage Users (Documentado, manage-product-subscriptions e revoke-access). Podes ainda criar planos de preço (Monetize, Create): frequência mensal, encargo base, preço por chamada e tipo Basic ou Tier; só um plano por produto, e um plano novo não afeta subscrições existentes (Documentado, create-a-rate-plan e attach-rate-plan-to-a-product).

Atributos personalizados em produtos e aplicações permitem acrescentar metadados: até 18 por entidade, com nome até 255 e valor até 1024 caracteres (Documentado, limits-in-api-management).

## O modelo de artefacto de API

Na documentação do Integration Suite há um segundo modelo: o artefacto de API, criado em Design, Integrations and APIs, separador Artifacts, Add, API (Documentado, create-and-deploy-a-rest-api-artifact e api-artifact). Diferenças relevantes face ao proxy clássico:

| Aspeto | Proxy clássico | Artefacto de API |
|---|---|---|
| Onde se desenha | API Portal (Configure, APIs) | Pacote de integração (Design, Integrations and APIs) |
| Políticas | XML por fluxo, muitas escolhas | Policy Model: só no fluxo de pedido, antes dos passos de integração |
| Autenticação | A tua política | Política Authentication obrigatória e sempre primeira; por omissão Client Certificate e OAuth, Basic opcional |
| Quota | tipos calendar, flexi, rollingwindow | modos Calendar, Dynamic e Fixed (Fixed: um mês são 28 dias) |
| Versões | Revisões e versões | Histórico de versões, uma versão ativa, possibilidade de reverter |
| Runtime | API Runtime | Cloud Integration, Integration Cell ou Edge Integration Cell, conforme o perfil |

Documentado em add-quota-policy-to-api-endpoint, modes-of-the-quota-policy e api-artifact-versioning. Num artefacto de API, também podes juntar passos de integração (transformar, orquestrar) ao lado das políticas, em vez de ter um proxy e um iFlow separados (api-centric-integration). Para a Casa Nova mantemos o iFlow separado, porque já o tens construído.

## Laboratório: proxy com chave e quota

Objetivo: ver, no mesmo pedido, três resultados diferentes (aceite, recusado por chave, recusado por quota) e distinguir a camada onde acontece cada um.

**NOTA:** todo este laboratório é por testar. Os nomes dos botões vêm da documentação e podem diferir no teu tenant.

1. Escolhe um endpoint HTTPS de teste sob o teu controlo (por exemplo um iFlow com HTTPS Sender) e confirma que responde ao `POST` diretamente.
2. No API Portal, Configure, APIs, Create, URL. Preenche Name Encomendas, Service Type REST, versão v1, base path orders, o host alias, e escolhe Create. Guarda.
3. No Proxy Endpoint, edita o PreFlow do pedido e acrescenta a política Verify API Key com o XML acima (nome vap1). Acrescenta depois a política Quota, com Identifier verifyapikey.vap1.client_id, Allow count 3, Interval 1, TimeUnit minute. A ordem importa: primeiro a chave, depois a quota.
4. Faz Deploy. Cria um produto Encomendas Treino, com o proxy dentro, e publica-o.
5. No Developer Hub, regista-te como programador, cria uma aplicação e subscreve o produto. Copia a chave. A documentação indica que no trial não podes onboardar outros programadores (classic-api-management-faqs), por isso usa a tua própria conta.
6. Envia quatro pedidos com o cabeçalho apikey: sem chave, com chave inventada, com a chave válida (quatro vezes seguidas).
7. Regista, por pedido, o código HTTP, o texto da falha e se apareceu uma execução do iFlow no monitor. Usa o separador Test do API Portal, ou o Debug do proxy (uma sessão de debug captura 20 transações e pára sozinha ao fim de 10 minutos), para ver cada passo do pipeline.

Resultado esperado (a confirmar): pedido sem chave e pedido com chave inventada devolvem 401 e não aparecem no monitor do iFlow; o quarto pedido com chave válida é recusado por QuotaViolation e também não chega ao iFlow; os três primeiros chegam.

Sem tenant com API Management: faz uma tabela de mesa com os pedidos, a ordem das políticas e o que o iFlow recebe em cada caso.

## Evoluir o contrato

A documentação distingue duas formas de mudar uma API (Documentado, api-revisions e api-versioning):

| Mudança | Mecanismo | O URL muda? | Exemplo |
|---|---|---|---|
| Compatível (campo opcional novo, política nova que não rompe) | Revisão: só uma revisão corre em runtime, as anteriores podem ser comparadas e restauradas | Não | Acrescentar o campo opcional notes |
| Incompatível (renomear campo obrigatório, mudar tipos, mudar o modelo de faturação) | Nova versão: coexistem várias versões no runtime, cada uma com o seu URL | Sim: /v2/orders | Renomear sku para productCode |

O estado do proxy também comunica o ciclo de vida: Alpha, Beta, Active, Deprecated e Decommissioned. Para marcar Deprecated ou Decommissioned tens de indicar a data e uma API sucessora, e só o podes fazer na atualização, não na criação. O estado serve só para demarcar: não altera o comportamento do proxy (Documentado, api-proxy-states).

Para retirar a v1 com evidência: usa o API Analytics para ver quem ainda chama a v1 e com que volume, avisa os consumidores pelo estado Deprecated e só desativas quando a v1 não tiver tráfego durante o período acordado.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| 401 e o iFlow não mostra execução | Chave em falta ou inválida (FailedToResolveAPIKey, InvalidApiKey): local da chave na política e a chave da subscrição |
| 401 com chave aparentemente certa | Estado da aplicação e do programador (aprovada, ativa) e se a chave foi regenerada |
| Muitos pedidos recusados num curto período | Quota do produto ou do proxy; verifica se há Spike Arrest além da quota e o nome da falha (QuotaViolation ou SpikeArrestViolation) |
| A quota do produto não é aplicada | Existe Verify API Key e a política Quota a referenciar as variáveis do produto? Só definir no produto não basta |
| A política não corre | Atributo enabled, condição do passo e o fluxo (PreFlow, Conditional Flow) onde está ligada |
| O proxy responde mas o iFlow devolve erro | Abre a execução no Monitor do módulo 01 e vê a falha no passo; o proxy só reencaminha |
| Chamada ao proxy nova não aparece | Deploy feito? Host virtual e base path corretos? Mudanças em políticas depois do deploy voltam a fazer deploy automático |
| Timeouts ao atualizar ou publicar um produto | Um produto com mais de 100 recursos pode dar timeouts (limites documentados) |

**ATENÇÃO:** em erros devolvidos ao cliente, usa um código e uma mensagem estáveis (Raise Fault ou FaultRules) e não incluas tokens, URLs internos ou nomes de sistemas.

## Exercícios

**PRATICAR:** faz os exercícios 13 a 15 no módulo 13. Produz uma matriz com sucesso, falta de credencial, quota excedida e falha do serviço de destino, indicando para cada pedido em que camada é resolvido.

## Fontes oficiais

- [API Management](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/api-management)
- [Verify API Key](https://help.sap.com/docs/sap-api-management/sap-api-management/verify-api-key?q=certificate)
- [Create a Product](https://help.sap.com/docs/sap-api-management/sap-api-management/create-product)
- [Quota](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/apim/API-Management/quota-1f742c1.md)
- [API Proxy](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/apim/API-Management/api-proxy-8962643.md)
- [Flow](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/apim/API-Management/flow-08b40d9.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0).
