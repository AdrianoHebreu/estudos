# Open Connectors e integração SaaS

A Casa Nova recebe pedidos de apoio numa aplicação SaaS. O objetivo é ler o estado de um pedido e associá-lo à referência da encomenda. Vais perceber onde o Open Connectors se encaixa no Integration Suite, como o adaptador OpenConnectors se configura num iFlow, como se tratam as credenciais e como se lê um recurso em páginas sem duplicar registos.

**NOTA:** âmbito reduzido de propósito. A documentação oficial lida (repositório SAP-docs/btp-integration-suite) cobre bem o adaptador OpenConnectors, as credenciais, os papéis de acesso e a política de API Management. Não cobre a criação de instâncias de conectores, os elementos (as definições de cada conector) nem as transformações e os objetos comuns do Open Connectors: esses temas vivem na ajuda própria do Open Connectors, que não foi lida. Por isso este módulo não os descreve campo a campo. Tudo o que é marcado como «por testar» tens de confirmar no teu tenant.

## Onde o Open Connectors encaixa

O Open Connectors é uma das capacidades que se ativam no Integration Suite. Documentado: na página inicial, em Capabilities, escolhes Add Capabilities (ou Manage Capabilities) e, no ecrã Activate Capabilities, a opção associada ao Open Connectors chama-se Extend Non-SAP Connectivity.

| Peça | O que é (segundo a documentação) | Onde a encontras |
|---|---|---|
| Capacidade Open Connectors | Catálogo de conectores para aplicações que não são SAP | Home do Integration Suite, Capabilities |
| Conector | Uma API que expõe os recursos e métodos de uma aplicação | Catálogo de conectores |
| Instância | O conector ligado a uma conta concreta da aplicação, com autenticação | Criada no Open Connectors, antes de configurares o adaptador |
| Recurso | Uma entidade ou operação da instância, listada pelo Open Connectors | Campo Resource do adaptador (botão Select) |
| Adaptador OpenConnectors | Canal de saída (receiver) do iFlow para uma instância | Cloud Integration, canal de saída |
| Tipo de provedor Open Connectors | Liga uma API do API Management a uma instância | API Management, API Provider |

O número de conectores varia consoante a página: umas dizem mais de 150, outras mais de 170. Confirma no catálogo do teu tenant em vez de decorares o número.

**Documentado:** ISuite/activating-and-managing-capabilities, ISuite_Integrations_APIs/connectivity-options, ISuite_Integrations_APIs/openconnectors-receiver-adapter.

## Conector, instância e recurso

Um conector é a interface de um serviço suportado. A instância associa esse conector a uma ligação configurada. O recurso é a operação ou entidade que consomes, como os pedidos de apoio. Para o adaptador, a documentação exige que a instância exista antes de o configurares, e diz que o Open Connectors lista os recursos de cada instância e as suas operações.

| O que precisas de saber | O que a documentação lida diz | Lacuna (por testar) |
|---|---|---|
| Criar a instância | Cria-se a partir do catálogo e autentica-se a ligação; aponta para a ajuda do Open Connectors | Passos e campos do ecrã de criação |
| Elementos do conector | Não descritos | O que cada elemento permite e que versões existem |
| Transformações e objetos comuns | Não descritos | Se o recurso que queres devolve um formato comum ou o da aplicação |
| Operações de um recurso | O adaptador oferece POST, GET, PATCH, PUT e DELETE; a lista real vem do Open Connectors | Que operações o teu recurso suporta |

Uma interface comum facilita o consumo, mas uma operação avançada pode só existir na API original. Documenta sempre duas dependências: o serviço do fornecedor (permissões, limites) e o conector (o seu próprio ciclo de evolução).

## Acesso e papéis

Sem acesso à capacidade, não há nada para configurar. Documentado:

| Item | Regra |
|---|---|
| Role collection OpenConnectors_User | Atribui-se a utilizadores adicionais para adicionarem aplicações não SAP aos cenários |
| Role collection Integration Provisioner | Quem já a tem não precisa de mais nada |
| Condição extra | Atribuir a role collection no cockpit da BTP não chega: o Open Connectors exige que um administrador do Open Connectors adicione o utilizador como membro |

Se um colega diz «tenho a role e não vejo o Open Connectors», a causa documentada mais provável é a falta de inscrição como membro.

**Documentado:** ISuite/60-Security/identity-and-access-management-for-open-connectors e ISuite/configuring-user-access-to-sap-integration-suite.

## Credenciais: onde vive cada segredo

O mesmo serviço pede segredos em três sítios diferentes. Mantém-nos separados e nunca os escrevas no iFlow, em exemplos ou em capturas de ecrã.

| Onde | Campos documentados | Notas |
|---|---|---|
| Pedidos HTTP às APIs do conector | Segredo da organização, segredo do utilizador e token da instância (autenticação HTTP personalizada) | É o que o adaptador usa por baixo |
| Cloud Integration, Monitor, Security Material, Create, User Credentials | Name, Description, Type OpenConnectors com Organization e Element, User, Password (máximo 255 caracteres) | Carrega em Deploy. Depois de criares ou alterares o artefacto, volta a publicar e a reiniciar os iFlows que o usam |
| API Management, API Provider do tipo Open Connectors | Region, Organization Secret e User Secret (obtidos na página do Open Connectors) | O token da instância fica num Key Value Map, ver abaixo |

**Por testar:** a documentação diz que Organization e Element vêm do cabeçalho de autorização que autentica a instância, mas não mapeia cada valor para cada campo. Confirma no teu tenant qual valor vai em cada campo, com uma instância de treino e uma identidade só de leitura.

Boas práticas do curso (não vêm da documentação): usa uma identidade de treino com permissão de leitura, revê a expiração e a revogação, e evita deixar no monitor respostas com dados pessoais.

## O adaptador OpenConnectors (receiver)

O adaptador liga um iFlow às aplicações suportadas pelo Open Connectors através de APIs REST. Documentado: trabalha com JSON ou XML, usa os métodos HTTP habituais, não tem proteção CSRF e não processa mensagens com anexos. Funciona com o passo Request Reply, que o inclui na lista de adaptadores suportados.

No separador Connection configuras:

| Campo | Para quê | Atenção |
|---|---|---|
| Base URI | Endereço do serviço Open Connectors, depende da região e do ambiente | O exemplo da documentação termina em /elements/api-v2. Indica-o antes de escolheres o recurso |
| Credential Name | Alias do artefacto de segurança do tipo OpenConnectors (botão Select) | O artefacto tem de estar publicado |
| Resource | Nome do recurso da instância (botão Select lista os recursos) | Não uses o carácter dólar nos parâmetros de pesquisa |
| Method | POST, GET, PATCH, PUT ou DELETE | Com pedido em XML, o método é lido da própria mensagem |
| Request Format | XML ou JSON, formato da mensagem recebida | Em XML, o elemento raiz tem de ser SwaggerParser |
| Response Format | XML ou JSON, formato da mensagem devolvida | Não uses os conversores JSON para XML ou XML para JSON na resposta |
| Query Parameters for Resource | Valores das variáveis do recurso e filtros, por exemplo varname1=ola, varname2=SAP | Variáveis separadas por vírgulas, consultas separadas por ponto e vírgula |
| Page Size | Máximo de registos por página | Ver a secção seguinte |
| Process in Pages | Processa a mensagem em páginas do tamanho indicado | Só deve ser ativado num Local Integration Process chamado por um Looping Process Call |
| Timeout (in ms) | Tempo máximo à espera de resposta | Define-o sempre: o valor por omissão não está na documentação |

**ATENÇÃO:** o adaptador está marcado na documentação como troca de dados com um componente fora do âmbito SAP. Confirma que os dados que envias cumprem as políticas da tua empresa.

## Open Connectors com API Management

Se queres expor o conector como API própria, o API Management tem um tipo de provedor e duas políticas. Documentado:

| Elemento | O que faz |
|---|---|
| API Provider, tipo Open Connectors | Liga a API a harmonized RESTful APIs de terceiros; pede Region, Organization Secret e User Secret |
| Política OpenConnectors | Só uma por API do tipo Open Connectors, no endpoint de destino ou no do proxy. O elemento InstanceSecret aponta para um Key Value Map (atributos kvm-map-name e kvm-key-name) que guarda o token da instância |
| Política OpenConnectorCallout | Chamada externa a um provedor Open Connectors, com Request (Headers, QueryParams, Path, Verb), APIProvider, Timeout em milissegundos e InstanceSecret |

Nas APIs criadas por serviço ou importadas, o Key Value Map tem de existir antes de anexares a política. Se migrares o API Management (módulo 10), as credenciais do Open Connectors têm de ser reintroduzidas na ferramenta de destino: o Key Value Map do proxy leva o token da instância.

## Leitura por páginas e retoma

Um recurso com muitos registos devolve-os em páginas. Com o adaptador, a documentação prevê este desenho: ativas Process in Pages, defines Page Size e colocas o canal num Local Integration Process chamado por um Looping Process Call. Esse passo repete o subprocesso enquanto a Condition Expression for verdadeira, até ao máximo de iterações (Max. Number of Iterations). Quando o máximo é atingido, escolhes entre lançar uma exceção ou sair do ciclo sem erro (Action when Max. Iterations Reached). O ciclo é do tipo do-until: o subprocesso corre primeiro e a condição verifica-se depois. O passo gera a propriedade CamelLoopIndex.

Não está na documentação lida o formato exato de continuação (cursor, número de página) dos conectores. Por isso o laboratório usa uma simulação com campos inventados (items e next). O contrato real pode usar outros campos ou cabeçalhos.

A sincronização incremental é um desenho do curso, sem fonte SAP:

| Decisão | Regra |
|---|---|
| Ponto de controlo | Guarda o último cursor confirmado, não o último lido |
| Quando avança | Só depois de gravar a página com sucesso |
| Empate por data | Preserva também uma chave estável ou usa uma pequena janela de sobreposição com eliminação de duplicados |
| Eliminações | Uma recolha só por data de alteração pode não mostrar registos apagados: define como as detetas |

O script abaixo decide, para cada página, se o ciclo continua. Código Groovy não executado nesta revisão.

    import com.sap.gateway.ip.core.customdev.util.Message
    import groovy.json.JsonSlurper

    def Message processData(Message message) {
        def pagina = new JsonSlurper().parseText(message.getBody(String))
        def proximo = pagina.next
        message.setProperty('proximo', proximo ? proximo.toString() : '')
        message.setProperty('temMais', proximo ? 'true' : 'false')
        message.setProperty('nItens', (pagina.items ?: []).size())
        return message
    }

No Looping Process Call, Expression Type Non-XML e Condition Expression ${property.temMais} = 'true', com um Max. Number of Iterations realista.

## Laboratório com duas páginas

Resultado esperado: T-2 fica registado uma só vez, mesmo que simules uma falha entre as páginas.

Variante A, sem tenant (testada só no papel). Usa as páginas abaixo como respostas constantes.

1. Anota o ponto de controlo inicial (vazio). Processa a página A, grava T-1 e só então guarda o cursor p2.
2. Processa a página B, grava T-2 e guarda o cursor nulo (fim).
3. Repete, mas simula uma falha depois de gravar T-2 e antes de atualizar o cursor. Ao retomar, o cursor ainda aponta para p2: relê a página B e confirma que T-2 só fica registado uma vez, porque a gravação usa a chave id.
4. Escreve o que fazes perante 401 (verificas a identidade e a expiração antes de repetir) e perante 429 (aplicas a política limitada e respeitas a indicação de espera, se o fornecedor a der).

    Pagina A
    {"items":[{"id":"T-1","order":"CN-1001"}],"next":"p2"}

    Pagina B
    {"items":[{"id":"T-2","order":"CN-1002"}],"next":null}

Variante B, com tenant (por testar, depende de a capacidade e de um SaaS de treino estarem disponíveis).

1. Ativa a capacidade (Extend Non-SAP Connectivity), cria uma instância num SaaS de treino com direitos de leitura e experimenta o recurso no próprio Open Connectors.
2. Em Monitor, Security Material, cria o artefacto User Credentials do tipo OpenConnectors e publica-o.
3. Cria o iFlow CN09_Apoio: Timer, Request Reply ligado a um canal OpenConnectors com Method GET, Base URI, Credential Name, Resource e Timeout preenchidos, Groovy do script acima e End.
4. Publica e abre o monitor: confirma o estado do pedido e que o corpo devolvido corresponde ao formato escolhido em Response Format.
5. Só depois experimenta Process in Pages dentro de um Looping Process Call.

Se um pedido de apoio for apagado no SaaS, define como detetas a remoção.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| Não vês o Open Connectors depois de receberes a role collection | Se um administrador do Open Connectors te adicionou como membro |
| Erro 401 do conector | Org e user secret, token da instância e se o artefacto User Credentials foi publicado de novo e o iFlow reiniciado |
| O botão Select do campo Resource não lista nada | Se o Base URI está preenchido e a instância existe |
| Falha com pedido XML | Se o elemento raiz é SwaggerParser e se o método vem na mensagem |
| Resposta com formato estranho | Response Format do canal e se há conversores JSON/XML a mais no fluxo |
| Erro com anexos | O adaptador não processa mensagens com anexos |
| Erro nos parâmetros de pesquisa | Se usaste o carácter dólar nos parâmetros |
| Ciclo infinito ou saída precoce | Condition Expression, tipo de expressão, Max. Number of Iterations e a ação quando o máximo é atingido |
| 429 do SaaS | Limites do fornecedor (por testar): reduz Page Size e espera antes de repetir |

## Exercícios

**PRATICAR:** resolve os exercícios 25 a 27 no módulo 13. Regista a escolha da interface, a autorização mínima e o algoritmo de retoma em caso de falha.

## Fontes oficiais

- [Feature Scope Description for SAP Integration Suite](https://help.sap.com/doc/e50e61e7b66c4b60ae5e88c00c01486a/CLOUD/en-US/FSD_IntegrationSuite.pdf)
- [Capabilities of SAP Integration Suite](https://help.sap.com/docs/integration-suite/sap-integration-suite/capabilities?locale=en-US)
- [OpenConnectors Receiver Adapter (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/openconnectors-receiver-adapter-1a27cee.md)
- [Identity and Access Management for Open Connectors (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite/60-Security/identity-and-access-management-for-open-connectors-d6c2716.md)
- [Open Connectors, política de API Management (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/apim/API-Management/open-connectors-3446d59.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
