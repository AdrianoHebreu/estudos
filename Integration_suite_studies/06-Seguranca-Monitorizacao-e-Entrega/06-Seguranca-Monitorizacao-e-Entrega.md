# Segurança, monitorização e entrega

Uma integração precisa de identidades separadas para o cliente que a chama, o fluxo que chama um destino, as pessoas que a operam e o processo que a publica. Neste módulo vais mapear essas quatro fronteiras na Casa Nova, configurar o material de segurança de um fluxo, aprender a ler o monitor com uma referência de negócio e desenhar o transporte do fluxo de teste para produção sem editar nada à mão no destino.

**NOTA:** este módulo foi escrito a partir da documentação oficial da SAP, não de uma execução no tenant. Cada afirmação traz o nome da página consultada. O que só se confirma no teu ecrã está marcado como «Por testar». Vários passos (keystore, Security Material, transporte) exigem papéis de administrador que o utilizador de um trial costuma ter, mas confirma no teu tenant.

## As quatro fronteiras

| Fronteira | Exemplo Casa Nova | Controlo | Onde fica a credencial |
|---|---|---|---|
| Cliente para iFlow | Portal chama o endpoint HTTPS do fluxo | Autenticação de entrada e papel de autorização | Chave de serviço (service key) do cliente, guardada pelo portal |
| iFlow para destino | Fluxo chama o ERP simulado | Credencial de saída referida por alias | Security Material (ou keystore) do tenant |
| Operação | Equipa consulta e reinicia fluxos | Papéis e access policies | Gestão de utilizadores do subaccount |
| Entrega | Equipa publica a versão em produção | Papel de transporte e serviço de transporte | Destinos do subaccount e instâncias de serviço |

### Entrada: quem pode chamar o fluxo

A documentação separa autenticação (quem és) de autorização (o que podes fazer). No Cloud Foundry, as opções de entrada para um sender HTTPS são (Documentado, ci/ConnectionSetup: authentication-and-authorization-options-inbound):

| Opção | Como funciona | Recomendação da documentação |
|---|---|---|
| OAuth, client credentials | O cliente obtém um token no servidor de tokens do BTP com clientid e clientsecret (ou com certificado) da service key e chama o fluxo com o token | Recomendada |
| Autenticação por certificado de cliente | O cliente apresenta um certificado e a autorização verifica o Subject e o Issuer DN | Também recomendada |
| Basic com clientid e clientsecret da service key | As credenciais da service key são usadas diretamente como utilizador e palavra-passe | Não recomendada em produção |
| Basic com utilizador do IdP | Utilizador do fornecedor de identidade com a role template MessagingSend, atribuída por um role collection | Sem recomendação explícita na página consultada |

Para o OAuth de entrada, crias no cockpit BTP uma instância do serviço Process Integration Runtime com o plano integration-flow e uma service key; a role padrão que autoriza o remetente é ESBMessaging.send, que indicas no parâmetro User Role do sender adapter do fluxo (Documentado, oauth-with-client-credentials-grant-for-integration-flow-processing). Distingue duas coisas que se confundem: o endpoint do fluxo (que usa o plano integration-flow) e as APIs de administração do tenant (que usam outro plano e outras roles). O URL de token vem da service key e não é o URL do fluxo.

### Operação: personas e access policies

No Cloud Foundry, cada persona é um role collection (Documentado, ci/SecurityCF: personas):

| Persona | Role collection | O que permite, em resumo |
|---|---|---|
| Só leitura | PI_Read_Only | Monitorizar mensagens e ver pacotes |
| Business expert | PI_Business_Expert | Ler payloads e anexos; é um complemento a outros papéis |
| Integration developer | PI_Integration_Developer | Desenhar, deployar e ver detalhes; pode deployar credenciais de utilizador, parâmetros seguros e OAuth2, mas não known hosts, chaves PGP nem conteúdo do keystore |
| Administrador do tenant | PI_Administrator | Definições do tenant, transporte, access policies, segurança |

A separação Business expert existe porque o payload pode ter dados sensíveis. As **access policies** restringem quem pode mexer num pacote ou artefacto e nos dados que ele guarda em runtime: monitorização, data stores, variáveis e filas. Mesmo com uma policy, um utilizador sem o papel continua a poder ver o recurso. Um pacote com um artefacto protegido não pode ser exportado, publicado ou apagado por quem não tem o papel. As custom header properties não são protegidas por access policies e não devem conter dados sensíveis (Documentado, ci/Operations: access-policies).

## Material de segurança e keystore

No Monitor, secção Manage Security, há duas áreas diferentes que convém não misturar:

| Área (tile) | O que guarda | Exemplos |
|---|---|---|
| Security Material | Credenciais referidas por alias nos adaptadores | User Credentials, OAuth2 Client Credentials, OAuth2 Password, OAuth2 SAML Bearer, OAuth2 Authorization Code, Secure Parameter, Known Hosts SSH |
| Keystore | Material criptográfico X.509, identificado por alias | Pares de chaves (chave privada e cadeia de certificados) e certificados |

Estados de um artefacto de Security Material: Stored, Deployed, Error e, só para OAuth2 Authorization Code, Unauthorized (Documentado, managing-security-material).

### Criar uma credencial de saída

O nome do artefacto é o alias que o adaptador de saída usa. Campos documentados por tipo:

| Tipo | Campos principais | Notas |
|---|---|---|
| User Credentials | Name, Description, Type (opcional: SuccessFactors ou OpenConnectors), User, Password | A palavra-passe tem no máximo 255 caracteres; fluxos que usam o artefacto devem ser redeployados e reiniciados |
| OAuth2 Client Credentials | Name, Token Service URL, Grant Type, Client ID, Client Secret, Client Authentication | Cada vez que editas, reintroduzes o Client Secret; o token fica em cache pelo nome da credencial; define a validade do token em pelo menos 10 minutos |
| Secure Parameter | Name, Secure Parameter (e repetição) | No Cloud Foundry até 4096 caracteres |

Documentado em deploying-a-user-credentials-artifact, deploying-an-oauth2-client-credentials-artifact e deploying-a-secure-parameter-artifact. A razão dos 10 minutos: o token é renovado 5 minutos antes de expirar, e uma validade demasiado curta cria um ciclo de renovação que pode ativar limites do servidor de tokens.

### Chaves e certificados

Regras do keystore (Documentado, managing-keystore-entries, uploading-a-key-pair, uploading-a-certificate, changing-the-alias):

- Cada entrada tem um alias, com no máximo 250 caracteres; o prefixo sap_ (e hcicertificate para pares de chaves) está reservado a entradas da SAP.
- Tipos de entrada: Key Pair e Certificate. A chave privada nunca se pode descarregar.
- Limites: o upload de um par de chaves aceita até 30720 bytes e o de um certificado até 10240 bytes. O keystore completo tem 6 MB no Cloud Foundry; o upload de um ficheiro .jks inteiro está limitado a 2 MB.
- Um ficheiro .pfx ou .p12 com mais de uma chave deve ser carregado como keystore (Add, Keystore) e não como par de chaves, senão só uma chave é carregada.
- O botão Back Up cria uma cópia das entradas do administrador do tenant, visível no separador Backup.

### Chaves fornecidas pela SAP e a regra dos 60 dias

O tenant traz um par de chaves da SAP, com aliases como sap_cloudintegrationcertificate, hcicertificate ou hcicertificate1, que tem de ser renovado todos os anos. A SAP prepara o novo par 60 dias antes de expirar, com o mesmo alias, no keystore New SAP Keys. Tu descarregas o certificado novo, entregas aos administradores dos sistemas ligados, e só depois ativas (Activate). Se não ativares, um job do sistema ativa a chave nova um dia antes da expiração. Se renovares sem trocar o certificado com os parceiros, o processamento falha (Documentado, keys-provided-by-sap, renewal-of-keys-provided-by-sap e activating-a-new-key-pair-provided-by-sap). Ao ativar, o par antigo vai para o keystore SAP Key History, de onde pode ser restaurado.

**ATENÇÃO:** a renovação de chaves exige coordenação com todos os sistemas ligados. Sem um plano, uma ativação automática pode partir integrações que só têm o certificado antigo.

## Monitorizar com uma referência de negócio

No Monitor, Monitor Message Processing, filtras por tempo, estado, tipo de artefacto, pacote, artefacto e ID. A lista carrega até 50 mensagens de cada vez (Documentado, monitor-message-processing). Os estados que vais encontrar:

| Estado | Significado, em resumo |
|---|---|
| COMPLETED | Entregue ao recetor com sucesso |
| PROCESSING | Em processamento |
| RETRY | Houve erro e foi iniciada uma repetição automática |
| ESCALATED | Erro sem repetição; nas síncronas, o remetente recebe o erro |
| FAILED | Falhou, não foi entregue e já não há repetições: é um estado final |
| CANCELLED | Cancelamento manual de entradas de fila JMS; pode ser sobrescrito por um estado final posterior |
| DISCARDED | Fluxo com Timer reiniciado noutro nó: a execução original fica com este estado e a nova recebe outro ID |
| ABANDONED | Processamento interrompido ou sem atualização do log; pode mudar se o processamento retomar |

(Documentado, message-status.) Os IDs que podes usar na pesquisa (Documentado, using-ids-to-filter-messages):

| ID | O que é | Quando usar |
|---|---|---|
| Message ID | Identificador único do log da mensagem | Uma execução concreta |
| Correlation ID | Liga logs de fluxos chamados em conjunto (por exemplo via ProcessDirect: IDs de mensagem diferentes, mesmo Correlation ID) | Seguir uma cadeia de fluxos |
| Application Message ID | Valor do cabeçalho SAP_ApplicationID, que defines por exemplo num Content Modifier | Procurar pela referência de negócio, como CN-1001 |
| Predecessor ID | Navega para o log do fluxo anterior na cadeia | Descobrir qual fluxo falhou |

Para a Casa Nova, o desenho é simples: o primeiro passo do fluxo copia o orderId para o cabeçalho SAP_ApplicationID e a equipa procura CN-1001 no filtro de ID. Cada ID responde a uma pergunta diferente: uma encomenda pode ter várias tentativas, e cada tentativa tem o seu Message ID. A propagação do Correlation ID de HTTP de entrada para HTTP de saída tem de ser feita por ti, com um Content Modifier ou cabeçalho.

Para acrescentar valores pesquisáveis ao log, o script Groovy pode escrever propriedades de cabeçalho personalizadas, adaptado da documentação (não executado nesta revisão):

    import com.sap.gateway.ip.core.customdev.util.Message

    def Message processData(Message message) {
        def messageLog = messageLogFactory.getMessageLog(message)
        def orderId = message.getProperty("orderId")
        if (messageLog != null && orderId != null) {
            messageLog.addCustomHeaderProperty("orderId", orderId.toString())
        }
        return message
    }

### Níveis de registo

| Nível | O que regista | Notas documentadas |
|---|---|---|
| None | Nada | Sem dados no monitor |
| Info | Informação básica; cabeçalho sempre visível | Em falha, mantém detalhe dos últimos 50 passos |
| Error | Só execuções falhadas | Uma repetição final bem-sucedida não é registada: o estado pode ficar Retry ou Failed |
| Debug | Todos os passos, sem conteúdo da mensagem | Só em desenvolvimento ou teste; expira ao fim de 24 horas no Cloud Foundry |
| Trace | Todos os passos e o conteúdo (payload, cabeçalhos, propriedades) | Só em desenvolvimento ou teste; expira ao fim de 10 minutos por omissão; o conteúdo fica 1 hora; valores acima de 10000 caracteres são truncados |

(Documentado, setting-log-levels e tracing-the-execution-of-an-integration-flow.) Alterar o nível não afeta mensagens já em processamento; fazer undeploy e deploy de novo trata o fluxo como novo, com nível Info. Isto liga ao módulo 01: o Payload que viste no monitor depende do nível de registo.

**ATENÇÃO:** usa Trace durante uma janela curta, com dados sintéticos. O conteúdo capturado pode ter informação sensível, e quem tem o papel Business expert consegue lê-lo.

### Alertas e observação externa

A documentação indica estas vias para alertas e vigilância (Documentado, central-monitoring-and-alerting-solutions, enabling-sap-solution-manager-to-act-as-additional-alert-consumer, external-logging-cloud-foundry-environment):

| Via | O que oferece | Condição |
|---|---|---|
| SAP Cloud ALM | Monitorização ponta a ponta e alertas por email, chat ou tickets; vê a validade de certificados e recursos JMS | Tens de ter o Cloud ALM ligado: por testar |
| SAP Solution Manager | Recebe alertas, hoje apenas os de «nenhum recetor determinado» no encaminhamento | Utilizador com a role IntegrationOperationServer.consumealerts e pedido à SAP |
| External logging | Envia os logs de processamento para Splunk, para um endpoint HTTP em JSON ou para um recetor OTLP | Destino com o nome CloudIntegration_MonitoringDataConsumer e ativação por API |
| Análise com IA | Botão Analyze em mensagens com estado Failed: causa, primeiro passo falhado e sugestão | Funcionalidade com quota mensal: por testar |

**NOTA:** a documentação consultada não descreve um motor de alertas próprio dentro do Monitor do Cloud Integration. Os alertas vêm de ferramentas centrais. Define o que consideras alarme (atraso, taxa de falha, certificado a expirar) e em que ferramenta o configuras.

## Transportar do teste para produção

A documentação separa o transporte de um pacote completo das coisas que o transporte não leva consigo (Documentado, ISuite_Integrations_APIs: decision-help-for-choosing-the-right-content-transport-option e guidelines-and-best-practices-for-content-transport):

| Opção | Quando usar | Nota |
|---|---|---|
| Exportar e importar à mão (zip) | Exploração, ou correção urgente se o sistema de transporte estiver em baixo | Sem controlo nem registo de quem transportou o quê |
| Download de MTAR | Correção urgente com a ligação ao sistema de transporte em baixo | Semi-automática |
| CTS+ | Já tens CTS+ instalado para outros sistemas | Opção recomendada, totalmente automática |
| Cloud Transport Management (TMS) | Não tens CTS+ | Opção recomendada; serviço em nuvem |

Para CTS+ e TMS é preciso o Content Agent Service no subaccount de origem, uma instância do Process Integration Runtime (plano api, role WorkspacePackagesTransport) e a definição do Transport Mode em Settings, separador Transport (Documentado, enabling-content-transport-cloud-foundry-environment). O botão Transport só aparece se o administrador tiver ativado o modo de transporte.

### O que o transporte não leva

| Artefacto | O que fazer no destino |
|---|---|
| Fluxos, APIs, value mappings e os seus recursos | Vão no pacote |
| Credenciais (User Credentials, Secure Parameter, OAuth2) | Criar de novo, com o mesmo nome (alias) |
| Pares de chaves | Criar e carregar de novo |
| Certificados públicos | Descarregar da origem e importar |
| Known hosts, chaves PGP, access policies | Carregar ou criar de novo |

(Documentado, handling-integration-artifacts-across-multiple-tenants.) Por isso os endereços e aliases que mudam entre ambientes devem ser **parâmetros externalizados**: depois do transporte e antes do deploy, só configuras os parâmetros; a configuração fica guardada e não é sobrescrita em transportes seguintes (Documentado, decoupling-development-from-transport-using-externalized-parameters). Cada versão do artefacto segue a convenção major.minor.micro; Save cria um rascunho e Save as Version cria uma versão nova, e podes voltar a uma versão antiga (Documentado, versioning-of-artifacts). A versão é específica do tenant.

Sequência documentada, com origem em desenvolvimento, teste e produção: o programador cria a ordem de transporte, o responsável liberta-a para teste, o programador configura e deploya no teste (credenciais incluídas), o responsável encaminha para produção, e no fim configura-se e deploya-se em produção (Documentado, content-transport-sequence-of-steps-example).

A cópia de segurança de dados do tenant é feita pela SAP, mas o restauro não é self-service (pedido por ticket, só até 14 dias, e não serve para copiar dados entre tenants), e filas de mensagens e configurações do subaccount não entram no backup (Documentado, backup-and-restore). Por isso a reversão de um fluxo faz-se com versões e transporte, não com restauro do tenant.

Para a Casa Nova, o plano de entrega do CN01_Mensagem tem estes passos:

1. Parâmetros externalizados: URL do ERP e alias da credencial.
2. Pacote transportado para o tenant de teste.
3. No teste: criar a credencial com o alias certo, configurar os parâmetros, deployar e executar um caso de sucesso e um de falha.
4. Critério de reversão escrito antes (exemplo inventado para estudo: falha de mais de 2 em cada 100 execuções na primeira hora, ou qualquer FAILED no caso de verificação).
5. Reversão: voltar à versão anterior (Version History) e transportar essa versão. Reconciliar manualmente o que já foi gravado no ERP.

## Laboratório: identidade, alias e falha

Objetivo: ver no monitor a diferença entre um alias que existe e um que não existe, e treinar a ficha de diagnóstico.

**NOTA:** variante por testar. Nem o fluxo Groovy_Ola nem o módulo 01 têm recetor externo; precisas de um iFlow com um HTTP Receiver que aceite credenciais básicas num recetor de treino sob o teu controlo (por exemplo um endpoint de teste). O nome exato dos campos do adaptador está no módulo de conectividade.

1. Em Monitor, Manage Security, Security Material, Create, tipo User Credentials, com o nome CN_ERP_TREINO e as credenciais do recetor de treino. Deploy. Confirma o estado Deployed.
2. No fluxo, aponta o recetor para o alias CN_ERP_TREINO, deploya e executa. Procura CN-1001 pelo Application Message ID (SAP_ApplicationID definido num Content Modifier). Regista o estado, o Message ID e a duração.
3. Num fluxo copiado, troca o alias por CN_ERP_NAOEXISTE, deploya e executa. Compara o estado, o passo onde falha e o texto de erro. Resultado esperado: estado Failed ou Retry, com falha no passo do recetor (a confirmar).
4. Sobe o nível para Trace durante uma execução, vê o conteúdo por passo e volta a Info. Anota quando o Trace expira.
5. Preenche a ficha: versão do fluxo, hora, Message ID, referência CN-1001, passo, categoria do erro e ação.

Sem tenant: faz a triagem sobre as duas tabelas seguintes.

## Diagnóstico

| Sintoma | O que verificar primeiro |
|---|---|
| 401 ao chamar o fluxo | Token (expirado, pedido ao URL certo do servidor de tokens) ou, no Basic, a clientid e clientsecret da service key |
| 403 com identidade válida | A role do remetente (ESBMessaging.send ou personalizada) no sender adapter e na service key |
| 401 no recetor | Alias no adaptador, estado Deployed do artefacto e se o fluxo foi redeployado após alterar a credencial |
| OAuth de saída falha de forma intermitente | Validade do token (pelo menos 10 minutos) e limites do servidor de tokens |
| Erro de TLS ou certificado | Cadeia de confiança no keystore, validade e alias; recorda que o par antigo da SAP pode ter sido substituído |
| Execução falhada sem payload | Nível de registo: usa Trace por pouco tempo; se o utilizador não vê o payload, verifica o papel Business expert |
| Falha após transporte | Credenciais, chaves e parâmetros externalizados no destino (nada disto viaja no pacote) |
| Mensagem com estado ABANDONED | Redeploy ou reinício do nó durante a execução; confirma se há repetição configurada |
| Mensagem duplicada vinda de fila JMS | Filas não exclusivas podem entregar duas vezes: o recetor deve ser idempotente (Documentado, monitoring-scenarios-that-include-message-queues) |

## Exercícios

**PRATICAR:** faz os exercícios 16 a 18 no módulo 13. Inclui critérios claros para voltar à versão anterior e indica quem reconcilia pedidos em trânsito.

## Fontes oficiais

- [User Authentication and Authorization](https://help.sap.com/docs/integration-suite/sap-integration-suite/user-authentication-and-authorization)
- [Setting Up OAuth for Cloud Integration in Cloud Foundry](https://help.sap.com/docs/integration-suite/isuite-integrations-and-apis/setting-up-oauth-for-cloud-integration-in-cloud-foundry?locale=en-US)
- [Security-Relevant Logging and Tracing](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/security-relevant-logging-and-tracing)
- [Monitor Message Processing](https://help.sap.com/docs/integration-suite/sap-integration-suite/monitor-message-processing?version=CLOUD)
- [Message Status](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ci/Operations/message-status-733a57b.md)
- [Setting Log Levels](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ci/Operations/setting-log-levels-4e6d3fc.md)
- [Managing Keystore Entries](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ci/Operations/managing-keystore-entries-2dc8942.md)
- [Decision Help for Choosing the Right Content Transport Option](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/decision-help-for-choosing-the-right-content-transport-option-19e0e73.md)
- [Handling Integration Artifacts across Multiple Tenants](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/handling-integration-artifacts-across-multiple-tenants-2a1d598.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0).
