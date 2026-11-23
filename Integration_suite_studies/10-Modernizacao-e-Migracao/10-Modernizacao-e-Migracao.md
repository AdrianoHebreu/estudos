# Modernizar interfaces SAP Process Orchestration

A Casa Nova tem uma interface antiga para ficheiros de stock, um processo de encomendas e uma integração usada apenas por um portal desativado. Vais decidir o que retirar, migrar ou redesenhar, perceber que ferramentas a SAP oferece para cada fase (Migration Assessment, Migration Tooling, Integration Assessment, clonagem do API Management) e preparar uma transição com critérios observáveis.

**NOTA:** a origem de cada afirmação está indicada. «Documentado» vem do repositório SAP-docs/btp-integration-suite (lido nesta revisão). «Método do curso» é prática de engenharia nossa, sem fonte SAP. Nada neste módulo foi executado num tenant: tudo o que é feito no ecrã está marcado como «por testar». Âmbito reduzido: a migração do próprio Cloud Integration do ambiente Neo para Cloud Foundry não está descrita nas páginas lidas (só a do API Management), por isso não é tratada aqui.

## Inventariar antes de migrar

Método do curso. Começa pelo comportamento em produção: volume, horários, donos, destinos, formato, autenticação, dependências e requisito de recuperação. Junta amostras saneadas e casos raros. Distingue o que está configurado do que o negócio ainda precisa. O resultado indica o risco de interrupção por interface e quem autoriza o corte.

| Interface | Decisão de partida | Evidência a reunir |
|---|---|---|
| Stock por ficheiro | Avaliar migração | Formato, horários e dependência SFTP |
| Encomendas | Redesenhar com contrato explícito | Duplicados e regras de negócio |
| Portal retirado | Confirmar retirada | Tráfego, dono e data de encerramento |

## O mapa das ferramentas

Documentado. Cada ferramenta responde a uma pergunta diferente. A disponibilidade de várias depende do plano de serviço do Integration Suite (a documentação remete para a SAP Note 2903776).

| Ferramenta | Pergunta a que responde | Onde vive |
|---|---|---|
| Migration Assessment | Que cenários do meu PO podem migrar e com que esforço? | Capacidade própria (ambiente Cloud Foundry) |
| Migration Tooling | Como crio os iFlows a partir dos objetos do PO? | Capacidade Cloud Integration, assistente Migrate |
| Integration Content Migration Agent | Como converto mapeamentos Java em Groovy? | Dentro do Migration Tooling, com IA |
| Integration Assessment | Que tecnologia de integração uso para uma interface nova? | Capacidade própria, baseada na metodologia ISA-M |
| Ferramenta de clonagem de tenants (APIM) | Como levo o API Management de Neo para multi-cloud foundation? | Ferramenta Java fora do ecrã |
| Edge Integration Cell | Posso correr os iFlows dentro da minha rede? | Runtime opcional em Kubernetes |

## Migration Assessment

Documentado: extrai dados de um sistema SAP Process Orchestration, avalia-os e estima o esforço de migrar os cenários para o Integration Suite. Suporta configurações integradas e cenários dual-stack, e as versões 7.31 SP28 e superiores, 7.40 SP23 e superiores e 7.50 SP06 e superiores. Foca-se na extração e avaliação: a migração em si é o Migration Tooling.

O percurso tem três passos:

| Passo | Onde | Campos e regras |
|---|---|---|
| Adicionar o sistema PO | Settings, tabela SAP Process Orchestration Systems, Add | System Name, System Version (ou Auto-Detect), Integration Directory (Address, User ID, Password), ES Repository (ou Same as Integration Directory). Utilizador técnico com as roles SAP_XI_API_DISPLAY_J2EE, SAP_XI_API_DEVELOP_J2EE e SAP_XI_MONITOR_J2EE. Depois, Test Connection |
| Extrair dados | Request, Data Extraction, Create | Request Name, System, Complete Extraction ou Custom Extraction. Estados finais: Completed, Completed with warnings, Completed with errors. Há um botão Log |
| Avaliar | Request, Scenario Evaluation, Create | Request Name, Data Extraction Request, Evaluation Run Name, Description. Ações: Open Dashboard, Trigger Analysis, Export, Generate Report |

A ligação ao PO passa por destinos da BTP, normalmente através do Cloud Connector, com um destino HTTP do tipo SAP Process Integration. Evita o carácter sublinhado no nome do endereço. Depois do Create, faz sempre Test Connection, mesmo que os testes do Cloud Connector e do destino tenham passado: só este verifica o acesso aos recursos usados na extração. A documentação indica também que a recolha de dados de desempenho e a contagem de mensagens síncronas exigem ativação prévia no PO (SAP Notes 3300008, 2442373 e 2442344), com custo adicional na base de dados.

**ATENÇÃO:** o armazenamento é limitado. Cada extração e cada avaliação consome espaço, e quando o limite é atingido surge «Unable to Create Request». Antes de apagar, descarrega os relatórios.

### Ler o resultado

| Conceito | Significado documentado |
|---|---|
| Ready to migrate | Os recursos usados existem no Integration Suite. Migração manual ou semiautomática, com ajustes de configuração possíveis |
| Adjustment required | Equivalência parcial: exige mudar o desenho ponta a ponta, por exemplo conversão de protocolo |
| Evaluation required | Não migra diretamente: funcionalidade limitada ou ausente, ou código personalizado que a ferramenta não analisa. Pede análise manual |
| Migration Readiness | Distribuição ponderada pelas três categorias, por cenário e para o conjunto |
| Migration Tool Coverage | Quanto do cenário o Migration Tooling cobre: Low até 30 por cento, Medium até 60, High até 80, Very High acima de 80 |
| Modernization recommendation | Sugestões como trocar conteúdo personalizado antigo por pacotes pré-entregues ou protocolos abertos; pode não haver nenhuma |

A categoria de avaliação não diz o nível de automação do Migration Tooling: «Ready to migrate» não significa que a ferramenta migre sozinha.

### Limites que mudam decisões

Documentado em Known Limitations. Um relatório limpo não prova que está tudo coberto.

| Área | Limite |
|---|---|
| Adaptadores e módulos personalizados | Identificados, mas o código e os parâmetros não são analisados |
| B2B, BRM e BPM | B2B e BRM ficam fora do âmbito. Em BPM só se sabe que o cenário usa BPM, não a lógica |
| Java, XSLT, bibliotecas de funções e UDFs | Identificados, sem análise recursiva das dependências |
| Dependências entre interfaces | Não são detetadas: exige análise manual |
| Receivers dinâmicos | Condições XPath ou Allow Arbitrary Receivers impedem contar os recetores: avaliação parcial |
| Desempenho do Integration Engine (ABAP) | Sem métricas |

Resolução de problemas da ligação (documentado): 503 indica que a BTP não alcança o PO (host e porta virtuais, Location Id se houver dois Cloud Connectors na mesma subconta); 403 aponta para roles em falta, utilizador inativo ou firewall; 401 para credenciais erradas; 404 para endereço mal configurado (falta host e porta). A lista de ICOs vazia na extração obriga a ver os registos do Cloud Connector e do PO.

## Migration Tooling

Documentado: é uma funcionalidade baseada em padrões do Cloud Integration que migra objetos do PO e do PI para iFlows. Hoje suporta Integrated Configuration (ICO) e Receiver Determination, nas mesmas versões do PO que o Assessment. A SAP recomenda avaliar primeiro com o Migration Assessment, mas o passo é opcional.

### Padrão e abordagem

A ferramenta analisa o objeto, escolhe um padrão e gera os passos dinamicamente. Padrões documentados: Point-to-Point assíncrono, Point-to-Point síncrono, Recipient List assíncrono e Content-Based Routing. Sem padrão associado, usa o padrão por omissão, que cria um desenho ponto a ponto sem canais de origem: os mapeamentos e scripts migram, os canais ficam vazios.

| Critério | Abordagem Standard | Abordagem Pipeline |
|---|---|---|
| Quando usar | Poucos cenários | Muitos cenários, com menos esforço e custo |
| Padrões | Ponto a ponto síncrono e assíncrono, Recipient List, Content-Based Routing | Ponto a ponto assíncrono, Recipient List, Content-Based Routing |
| Artefactos | Um iFlow por cenário | Vários iFlows genéricos e entradas no Partner Directory |
| Tratamento de erros | Só um esqueleto: modelas tu | Incluído, com pontos de extensão |
| Filas JMS | Uma por cenário assíncrono | Menos filas, partilhadas |
| Routing | Condições no iFlow gerado | XSLT carregado no Partner Directory: para mudar, descarrega, altera e volta a carregar |

O assistente abre-se num pacote de integração, com Edit e Migrate. Escolhes o sistema PO, o tipo de objeto (Integrated Configuration ou Receiver Determination), o objeto, o padrão e a abordagem. Há opções como Decouple with JMS Queue (ativa por omissão no padrão assíncrono) e Idempotent Process at Receiver Side. Segue-se a importação dos mapeamentos e dos seus recursos, com Create ou Reuse. Na abordagem Pipeline precisas das roles AuthGroup_IntegrationDeveloper e AuthGroup_TenantPartnerDirectoryConfigurator e das filas ativadas. Todo o percurso é por testar no teu tenant.

### O que fica por tua conta

Documentado em Known Limitations of Migration Tooling:

| Objeto no PO | Depois da migração |
|---|---|
| Value Mapping | Não migra sozinho: importa-o como artefacto e atribui-o ao mapeamento |
| Módulos de adaptador standard e personalizados | Não são importados: reimplementa (em Groovy) |
| Mapeamento Java | Converte com o agente de IA para Groovy, ou migra por um invólucro Groovy; os complexos podem não ser suportados |
| Multimensagem 1:N, N:1, N:M | Sem divisão de mensagens; N:1 e N:M exigem desenho adicional |
| Funções de lookup JDBC ou RFC e funções de nó de remetente e destinatário | Não suportadas: redesenha com XSLT, ProcessDirect ou scripts Groovy |
| Pontes síncrono-assíncrono | Não suportadas: redesenha a correlação |
| Adaptador REST com variáveis de caminho | Migra como HTTPS, sem variáveis de caminho: constrói o URL com uma propriedade ou com o cabeçalho CamelHttpUri |
| Fault message | Indisponível: usa subprocessos de exceção |
| Validação de esquema | Não migra: usa o validador XML |
| EOIO | Não preservado: usa uma fila JMS com acesso exclusivo |
| JDBC com selecionar e atualizar na mesma transação | Não suportado: pede redesenho com procedimentos armazenados e estados intermédios |

O agente Integration Content Migration Agent gera scripts Groovy a partir de mapeamentos Java com uma só classe que estende AbstractTransformation. Um administrador tem de o ativar na página Artificial Intelligence Settings, e a documentação avisa que as funcionalidades de IA exigem as edições Premium ou Enhanced. Verifica sempre os scripts gerados antes de os usares: não os trates como corretos só por virem de uma ferramenta.

## Integration Assessment: a tecnologia certa para a interface nova

Documentado: o Integration Assessment implementa a metodologia ISA-M (SAP Integration Solution Advisory Methodology). Não migra nada: ajuda a decidir que tecnologia de integração usar. O processo percorre: rever as definições ISA-M, rever as tecnologias, definir aplicações de negócio, criar um pedido de solução e um pedido de interface, responder a questionários e decidir.

| Conceito | Para quê |
|---|---|
| Domínios e estilos de integração | Descrevem o cenário sem referir tecnologia (por exemplo cloud para cloud, integração de processos) |
| Key characteristics | Critérios (ligação, padrões, transformação, monitorização) que ligam o estilo às capacidades de cada tecnologia. Tipo Multi (várias respostas) ou Single (sim ou não) |
| Questionário do pedido de interface | Secções como conteúdo, conectividade, API, formato de dados, orquestração, segurança e monitorização |
| Technology mapping | O sistema recomenda a tecnologia a partir das respostas |

Na Casa Nova serve para as interfaces novas (por exemplo a notificação de stock para Azure), não para as antigas. O estado do pedido avança de Requirement Analysis para Technology Selection.

## Runtime profiles e destinos

Documentado: um runtime profile limita o editor do iFlow aos passos e adaptadores suportados por uma plataforma alvo. Existe o perfil Cloud Integration (não se desativa) e perfis SAP Process Orchestration por versão. Em Settings, Integrations, o administrador vê e ativa os perfis. Se desenhares iFlows para correr em PO, o editor impede-te de usar o que esse PO não suporta. A ligação do tenant a um PO configura-se em Settings, separador System, com Version, Integration Directory e ES Repository (em Cloud Foundry, com User ID e Password).

## API Management: de Neo para Cloud Foundry

Documentado em APIM-Migration. A SAP indica que o ambiente Neo da BTP termina a 31 de dezembro de 2028, sujeito aos contratos (SAP Note 3351844): confirma a data em fontes atuais.

| Estratégia | Quando |
|---|---|
| Standard: Neo para multi-cloud foundation | Migração de conteúdo de Neo |
| Starter plan, reutilizar o runtime | Mesma subconta Cloud Foundry, ou outras subcontas |
| Entre ambientes Cloud Foundry | Mover conteúdo entre ambientes |

O percurso tem três passos: pré-requisitos, clonagem e tarefas pós-clonagem. Na origem precisas de API portal e Developer Hub em Neo com autenticação básica e um utilizador com APIPortal.Administrator e AuthGroup.API.Admin. No destino, API Management ativo, sem entidades pré-existentes (podem ser sobrescritas), acesso programático para ambas as funções e, se usares IdP personalizado, atributos dos programadores idênticos aos da origem (são sensíveis a maiúsculas).

A Tenant Cloning Tool é um ficheiro Java com o apim-tct-input.json, que exige Java 25 ou superior (versão da documentação) e descarrega dependências com um script. Podes clonar tudo ou só proxies escolhidos (selectiveEntityMigration com true e selectiveEntities): nesse caso só vão certificate stores, Key Value Maps, API providers e proxies, não produtos nem aplicações. A SAP recomenda clonar tudo; para mover conteúdo com regularidade, usa a capacidade de transporte.

| Clonado | Não clonado, tens de refazer |
|---|---|
| Rate plans, Key Value Maps, API providers, policy templates, proxies, produtos, aplicações, developers, caches, métricas e gráficos personalizados | Certificados (chegam como certificados fictícios), valores de Key Value Maps cifrados, palavras-passe de API providers |

Pós-clonagem: o ficheiro apim-tct-output.xlsx tem o separador User Actions com o que falta. Para o Open Connectors (módulo 09), reintroduz Org ID e User Secret no provedor e o token da instância no Key Value Map do proxy. Os proxies ficam ativos e implementados no host virtual por omissão: reaplica os estados desejados. Mantém origem e destino até concluíres a passagem, altera entidades sempre na origem e volta a clonar, e informa os programadores, que recebem e-mails ao serem registados no destino.

## Edge Integration Cell

Documentado: é um runtime híbrido opcional. Desenhas e monitorizas na cloud e corres os iFlows e as APIs na tua rede, em Kubernetes gerido por ti. Serve requisitos de segurança ou conformidade e é um caminho para clientes de SAP Process Integration. As responsabilidades do cliente incluem provisionar o Kubernetes, aplicar atualizações, gerir utilizadores, monitorizar recursos, operar a aplicação e desativar. Para produção precisas de uma base de dados (PostgreSQL ou SAP HANA), de uma loja de dados (Redis, Valkey ou SAP HANA), de um balanceador de carga e, opcionalmente, de um registo de contentores local. As service keys têm de ser rodadas (recomendação de 120 dias): sem rotação, a sincronização de conteúdo deixa de funcionar. Pesa o esforço de operar o Kubernetes antes de escolher.

## Laboratório: classificar e planear o corte

Método do curso, com o apoio das categorias documentadas. Resultado esperado: uma matriz das três interfaces e um plano de corte reversível.

1. Para cada interface da tabela inicial, atribui uma categoria provisória (Ready to migrate, Adjustment required ou Evaluation required) e justifica com um limite da lista de Known Limitations. Por exemplo, se o ficheiro de stock tiver campos de largura fixa, a limitação dos conversores CSV impede a migração direta.
2. Para o stock, regista as janelas, a chave do lote e o último identificador confirmado no sistema antigo.
3. Desenha uma execução em paralelo com uma saída de verificação sem efeitos de negócio. Compara contagens e somas antes de encaminhar tráfego real.
4. Define quem suspende a origem e verifica que filas e ficheiros pendentes ficaram reconciliados.
5. Define a condição de reversão. Se o novo fluxo já escreveu efeitos no ERP, recupera o estado a partir da chave de negócio antes de reativar o antigo.
6. Por testar, se tiveres um PO de teste: adiciona-o em Settings, faz Test Connection, extrai com Custom Extraction apenas estas três interfaces, avalia e compara o relatório (Export) com a tua matriz.

Uma verificação de regressão compara entradas representativas e os resultados dos dois percursos, normaliza campos variáveis (hora, referência técnica) e testa exceções: ficheiro inválido, credencial expirada, destino indisponível e confirmação tardia. A decisão de concluir o corte precisa de uma janela, resultados observados e um responsável.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| Test Connection devolve 503 | Host e porta virtuais, Location Id, destinos PO_nome_DIR e PO_nome_ESR |
| Extração acaba com avisos ou erros | O log da extração: corrige no PO e cria nova extração |
| Não consigo criar pedido novo | Limite de armazenamento: apaga extrações antigas depois de exportar |
| O relatório não menciona o meu adaptador personalizado | Limite documentado: só aparece identificado, não analisado |
| O iFlow migrado tem canais vazios | Padrão por omissão aplicado, por falta de padrão suportado |
| Rota REST falha após migração | Variáveis de caminho não suportadas: usa propriedade ou CamelHttpUri |
| Certificados da API inválidos após a clonagem | São fictícios: carrega os reais com o mesmo nome e certificate store |

## Exercícios

**PRATICAR:** resolve os exercícios 28 a 30 no módulo 13. Entrega a matriz, os critérios de corte e um procedimento que distingue reversão técnica de reconciliação.

## Fontes oficiais

- [Use the Migration Assessment Application](https://developers.sap.com/tutorials/migration-assessment)
- [What Is Migration Tooling](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-migration-tooling)
- [Plan Your Setup of Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/plan-your-setup-of-edge-integration-cell)
- [Concepts of Migration Assessment (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Migration_Assessment/concepts-324507c.md)
- [Known Limitations of Migration Tooling (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/known-limitations-of-migration-tooling-7a552d4.md)
- [Migration of API Management Content (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/apim/API-Management/APIM-Migration/migration-of-api-management-content-d66b3e5.md)
- [What Is Integration Assessment (GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integration_Assessment/what-is-integration-assessment-eeee253.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
