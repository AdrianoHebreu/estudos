# 06 Cloud e infraestrutura

## O que é a cloud, em termos de arquitetura

Para um arquiteto, **cloud** não é «os servidores de outra pessoa». É um conjunto de serviços que se pedem por API, se pagam por utilização e onde **parte da responsabilidade passa para o fornecedor**. A pergunta de arquitetura deixa de ser «que servidor compro?» e passa a ser «que nível de responsabilidade quero manter, e quanto estou disposto a pagar para a delegar?». Este módulo usa o **Microsoft Azure** como plataforma principal (é a stack do caso fio condutor e o alvo do AZ-305) e dá o equivalente **AWS** numa tabela. Os conceitos (rede, computação, governação) são os mesmos nos dois; mudam os nomes e alguns detalhes.

## IaaS, PaaS, SaaS e a responsabilidade partilhada

| Modelo | Tu geres | O fornecedor gere | Exemplos no Azure |
|---|---|---|---|
| **IaaS** | Sistema operativo, aplicações, dados, configuração de rede | Hardware, datacenter, virtualização | Virtual Machines, managed disks, redes virtuais |
| **PaaS** | Aplicação, dados, configuração | Sistema operativo, runtime, a maior parte da plataforma | App Service, Functions, Azure SQL Database |
| **SaaS** | Dados, identidades, configuração, utilizadores | Praticamente tudo o resto | Microsoft 365, Dynamics 365 |

A documentação da Microsoft resume a **responsabilidade partilhada** numa matriz. O essencial:

| Área | On-premises | IaaS | PaaS | SaaS |
|---|---|---|---|---|
| Dados, identidades e configurações | Cliente | Cliente | Cliente | Cliente |
| Aplicações | Cliente | Cliente | Partilhada | Partilhada |
| Controlos de rede | Cliente | Cliente | Partilhada | Microsoft |
| Sistema operativo | Cliente | Cliente | Microsoft | Microsoft |
| Anfitriões, rede física e datacenter | Cliente | Microsoft | Microsoft | Microsoft |

**ATENÇÃO:** em **todos** os modelos os teus dados e as tuas identidades continuam a ser teus. «Está na cloud» não é o mesmo que «está seguro»: uma conta de armazenamento exposta por configuração errada é responsabilidade do cliente, mesmo sendo PaaS.

**DICA:** a regra prática é subir tanto quanto possível na escada (SaaS, depois PaaS, depois IaaS) **enquanto os requisitos o permitirem**. Cada degrau abaixo é mais controlo, mais trabalho de operação e mais risco de configuração errada.

## Regiões, zonas de disponibilidade e pares de regiões

- **Região:** localização geográfica com datacenters (ex.: uma região na Europa). Determina latência, preços, serviços disponíveis e **onde ficam os dados** (RGPD, módulo 07).
- **Zona de disponibilidade:** grupo de datacenters fisicamente separados **dentro** de uma região, com energia, refrigeração e rede independentes. Nem todas as regiões têm zonas; confirma a lista oficial.
- **Par de regiões:** algumas regiões estão associadas a outra, normalmente na mesma geografia, e alguns serviços usam o par para geo-replicação.

| Âmbito de falha | Protege-te com | Nota |
|---|---|---|
| Datacenter (zona) | Recursos **redundantes entre zonas** | Alguns serviços fazem-no sozinhos; outros exigem que o configures |
| Região inteira | Implantação em **segunda região** e plano de recuperação | Tem custo e complexidade; ver módulo 08 |

**ATENÇÃO:** a documentação do Azure avisa que implantar numa região que tem par **não** torna a solução automaticamente mais resiliente: tens de desenhar o teu próprio plano de alta disponibilidade e recuperação, e não deves depender do failover gerido pela Microsoft como estratégia principal.

## Redes: o esqueleto da solução

| Conceito | O que é | Pergunta de arquitetura |
|---|---|---|
| **VNet** (virtual network) | A tua rede privada no Azure, com espaço de endereços próprio | Que intervalo de IPs usar sem colidir com a rede on-premises? |
| **Sub-rede** | Divisão da VNet; no Azure é regional e abrange todas as zonas | Que camadas separar (web, aplicação, dados, gestão)? |
| **NSG** | Regras de filtragem de tráfego com estado, aplicáveis a sub-redes ou interfaces | Quem pode falar com quem, em que portas? |
| **Peering** | Liga duas VNets pela rede privada da Microsoft; **não é transitivo** | Como ligar muitas VNets sem malha de ligações? |
| **VPN Gateway** | Túnel IPsec/IKE cifrado sobre a **internet pública** | O custo e o prazo chegam para o débito e a estabilidade pedidos? |
| **ExpressRoute** | Ligação **privada** via fornecedor de conectividade, fora da internet pública | Preciso de latência consistente e mais fiabilidade? |
| **Private Endpoint** | Dá a um serviço PaaS (Storage, SQL) um IP privado na tua VNet | Como aceder ao PaaS por IP privado (e depois desativar o acesso público)? |
| **DNS** | Azure DNS (público e privado), Private Resolver para resolver nomes entre Azure e on-premises | Como resolver nomes dos dois lados? |

**VPN ou ExpressRoute?** A VPN é rápida de pôr de pé e usa a internet; o ExpressRoute usa um circuito privado com BGP, redundância incorporada e SLA de disponibilidade da ligação, mas exige fornecedor e prazo. A documentação prevê ainda combinar os dois: uma VPN como caminho de backup do ExpressRoute.

**Topologia hub-and-spoke.** É a topologia que o Cloud Adoption Framework recomenda para muitas organizações. Uma VNet central (hub) concentra o que é partilhado (firewall, gateway para o on-premises, DNS) e várias VNets (spokes) alojam as cargas de trabalho:

        On-premises                        Azure
     +--------------------+      +-----------------------------+
     | SAP · apps Delphi  |      | HUB: firewall, gateway, DNS |
     | 12 delegacoes      +------+ (VPN ou ExpressRoute)       |
     +--------------------+      +--------+-----------+--------+
                                   peering|           |peering
                              +-----------+--+   +----+----------+
                              | SPOKE Portal |   | SPOKE Stock   |
                              +--------------+   +---------------+

**Balanceadores e encaminhamento:**

| Serviço Azure | Camada e âmbito | Usa quando |
|---|---|---|
| **Load Balancer** | Camada 4 (TCP/UDP), regional ou entre regiões | Distribuir tráfego não HTTP entre VMs |
| **Application Gateway** | Camada 7, regional, com WAF opcional | Entrada HTTP(S) numa região, encaminhamento por URL |
| **Front Door** | Camada 7, global | Aplicação web com utilizadores em várias regiões, failover rápido |
| **Traffic Manager** | Baseado em DNS, global | Encaminhar por DNS; falha mais devagar que o Front Door por causa da cache de DNS |

## Computação: escolher onde o código corre

| Opção | Modelo | Bom para | Cuidado |
|---|---|---|---|
| **Virtual Machines** | IaaS | Software que exige controlo do SO, legados, SAP em VMs, lift-and-shift | Patching, hardening e capacidade são teus |
| **App Service** | PaaS | Aplicações e APIs web (.NET, Java, Node.js, Python, PHP; ou contentor) | Menos controlo sobre o ambiente |
| **Functions** | Serverless (FaaS) | Lógica orientada a eventos, tarefas curtas, integrações | Para novas apps serverless a documentação aponta o plano Flex Consumption; o plano Consumption é descrito como legado |
| **Container Apps** | Contentores sem gerir o Kubernetes | Microsserviços, jobs, escala por eventos (incluindo a zero) | Não dá acesso direto à API do Kubernetes |
| **AKS** | Kubernetes gerido | Quando precisas da API e do ecossistema Kubernetes | Exige competências de plataforma; escolhe entre modo Automatic e Standard |

**Noções de Kubernetes.** O Kubernetes orquestra contentores: decide em que máquinas correm, reinicia os que falham e escala-os. Um cluster tem um **plano de controlo** e **nós** de trabalho. No AKS o Azure gere o plano de controlo e tu geres (no modo Standard) ou o Azure gere por ti (no modo Automatic) os nós. A documentação do Azure refere que muitas equipas preferem começar por Container Apps.

**DICA:** para uma equipa pequena a ordem razoável é SaaS, App Service/Functions, Container Apps, AKS, VMs. Cada passo acrescenta operação: na Casa Nova o custo humano do AKS pesaria mais do que a fatura.

## Armazenamento

| Serviço | Tipo | Exemplo de uso |
|---|---|---|
| **Blob Storage** | Objetos (ficheiros, imagens, backups) | Documentos e anexos de encomendas |
| **Azure Files** | Partilhas SMB/NFS | Substituir servidores de ficheiros das delegações |

**Redundância de armazenamento** (definida por conta de armazenamento):

| Opção | Onde fica a cópia | Quando escolher |
|---|---|---|
| **LRS** | 1 datacenter na região | Dados reconstruíveis; custo mínimo |
| **ZRS** | 3 ou mais zonas da região | Alta disponibilidade na região (a Microsoft recomenda ZRS na região primária para aplicações que exigem alta disponibilidade) |
| **GRS** | Região primária e uma secundária distante | Proteger contra desastre regional |
| **GZRS** | ZRS na primária e cópia noutra região | Ambos os níveis de proteção |

**Escalões de acesso do Blob:** quente (acesso frequente), cool (mín. 30 dias), cold (mín. 90 dias) e archive (offline, mín. 180 dias, horas para recuperar). Descer de escalão baixa o custo de armazenar e sobe o de aceder; apagar antes do mínimo tem taxa.

**ATENÇÃO:** a redundância protege contra **falha de hardware**, **não** contra apagar ou sobrescrever dados: as alterações replicam-se a todas as cópias. Para isso precisas de backup e de proteção contra eliminação (módulo 08).

## Infraestrutura como código (IaC)

Criar recursos à mão no portal não é repetível nem auditável. Com **IaC** descreves a infraestrutura em ficheiros versionados no Git e aplicas com um pipeline (módulo 09).

| Aspeto | **Bicep** | **Terraform** |
|---|---|---|
| Fornecedor | Microsoft, só Azure | HashiCorp, multi-cloud e SaaS (via *providers*) |
| Novos recursos Azure | Suporta todos os tipos e versões de API logo que existem | Via *providers* AzureRM e AzAPI; o AzAPI dá acesso direto às APIs do Azure |
| Estado | Sem ficheiro de estado próprio: o Azure Resource Manager é a referência | Ficheiro de **estado** (state) que tens de guardar e proteger |
| Linguagem | Declarativa, compila para JSON (ARM) | Declarativa (HCL) |
| Escolhe quando | Só usas Azure e queres o caminho mais direto | Tens vários fornecedores ou já tens competência |

Um exemplo mínimo em Bicep (conta de armazenamento redundante entre zonas, com etiquetas):

    param location string = resourceGroup().location

    resource st 'Microsoft.Storage/storageAccounts@2023-05-01' = {
      name: 'stcnd${uniqueString(resourceGroup().id)}'
      location: location
      sku: { name: 'Standard_ZRS' }
      kind: 'StorageV2'
      tags: { ambiente: 'prod', dono: 'logistica' }
      properties: { accessTier: 'Hot' }
    }

Os ficheiros Bicep são **idempotentes**: aplicar o mesmo ficheiro várias vezes dá o mesmo estado. As deployment stacks gerem o ciclo de vida de um grupo de recursos como um conjunto, incluindo o que acontece aos recursos removidos do ficheiro. Este exemplo não foi compilado ao escrever a aula: confirma a versão da API e as regras de nomes na documentação.

## Landing zones e governação

Uma **landing zone** é o ambiente Azure já preparado (rede, identidade, políticas, monitorização) onde as cargas de trabalho aterram. O Cloud Adoption Framework descreve duas partes:

- **Platform landing zone:** a base centralizada de governação, segurança e recursos partilhados.
- **Workload landing zones:** onde as equipas de aplicações implantam, dentro das barreiras da plataforma.

A organização dos recursos no Azure segue esta hierarquia:

    Tenant (Microsoft Entra)
      └── Grupo de gestão raiz
            ├── Plataforma  (identidade, conectividade, gestão)
            └── Cargas de trabalho
                  ├── Subscrição Portal-Prod  ->  grupos de recursos  ->  recursos
                  └── Subscrição Portal-Dev

| Conceito | Função | Notas |
|---|---|---|
| **Subscrição** | Fronteira de faturação, de quotas e de acesso | Equivale à conta AWS |
| **Grupo de gestão** | Âmbito de governação acima das subscrições; políticas e papéis herdam para baixo | Até 6 níveis (sem contar a raiz e as subscrições); cada um tem um só pai |
| **Azure Policy** | Avalia recursos contra regras e pode bloquear ou corrigir | Definições, iniciativas (conjuntos) e atribuições; efeitos como audit, deny, modify e deployIfNotExists |
| **RBAC** | Quem pode fazer o quê, num dado âmbito | Atribuições herdam do âmbito para baixo |
| **Etiquetas (tags)** | Metadados para custos e operação | A Policy pode exigi-las |

**Boas práticas citadas pela Microsoft:** manter a hierarquia de grupos de gestão **plana** (idealmente 3 a 4 níveis); não copiar o organigrama da empresa; usar grupos de gestão para **políticas**, e atribuir RBAC às equipas de carga de trabalho ao nível da subscrição ou do grupo de recursos, não do grupo de gestão. Novas subscrições entram por omissão no grupo de gestão raiz. O **Azure Arc** projeta servidores, clusters Kubernetes e bases de dados de fora do Azure no Azure Resource Manager, estendendo-lhes a governação (incluindo a Policy).

## Ligar a cloud ao SAP e ao on-premises

O SAP da Casa Nova **fica on-premises** durante muito tempo e a cloud tem de conviver com ele.

| Cenário | Opção | Notas |
|---|---|---|
| Ligação de rede segura | VPN Gateway ou ExpressRoute para a VNet *hub* | Escolhe pela criticidade e latência exigidas |
| Expor dados SAP como API | Azure **API Management** a importar o OData do SAP (Gateway) | A documentação descreve a importação dos metadados OData v2 ou v4 |
| Orquestrar processos | Azure **Logic Apps** com o conector SAP | Suporta IDoc, BAPI e RFC/tRFC; compatível com S/4HANA e com ECC/R3 |
| Alojar o próprio SAP no Azure | VMs certificadas, zonas de disponibilidade | A Microsoft documenta SAP NetWeaver e S/4HANA em VMs; *HANA Large Instances* não aceita novos clientes |
| SAP gerido pela SAP (RISE) | O SAP corre numa subscrição Azure da SAP; ligas a tua com *peering* | O cliente não vê nem gere essa subscrição |
| Aplicações Delphi do balcão | Chamam a **API** (REST) publicada, não a base de dados | Ver módulo 05; reduz o acoplamento ao legado |

**DICA:** nunca deixes o portal web falar diretamente com o SAP. Põe uma **camada de API** (API Management) e, se preciso, uma cópia de leitura dos dados de stock na cloud: protege o ERP de picos de tráfego e permite ao portal continuar a mostrar stock se o SAP estiver em manutenção.

## Custos básicos

| Conceito | Para que serve |
|---|---|
| **Pay-as-you-go** | Pagas pelo que usas; sem compromisso |
| **Reservas** | Compromisso de 1 ou 3 anos para uso estável; a documentação refere poupanças que podem chegar a 72% face ao pay-as-you-go |
| **Microsoft Cost Management** | Análise de custos, orçamentos, alertas de anomalias e exportação de dados |
| **Orçamentos (budgets)** | Disparam **alertas**; **não** param os recursos nem o consumo |

**ATENÇÃO:** o orçamento é um aviso, não um travão. Se quiseres **conter** custos, usa políticas (ex.: limitar tamanhos de VM), desligar ambientes fora de horas e rever recomendações. A decisão de custo como argumento de negócio fica para o módulo 10.

## Exemplo trabalhado: a base Azure da Casa Nova

A Casa Nova quer pôr na cloud o portal de encomendas e a camada de integração/stock, mantendo o SAP e as aplicações Delphi on-premises.

| Decisão | Escolha | Justificação |
|---|---|---|
| Região | Uma região europeia com zonas de disponibilidade | Dados na UE (RGPD) e resiliência a falha de datacenter |
| Ambientes | 2 subscrições: Portal-Prod e Portal-Dev, num grupo de gestão «Cargas de trabalho» | Isolar custos e permissões; herdar as políticas |
| Rede | Hub-and-spoke; hub com firewall e gateway; 2 spokes | Ponto único de controlo; cresce sem malha |
| Ligação ao SAP | VPN S2S agora; reavaliar ExpressRoute se a latência ou a disponibilidade o exigirem | Prazo e custo; a decisão fica num ADR (módulo 04) |
| Portal | App Service com 2 ou mais instâncias | PaaS: a equipa pequena não gere SO |
| Integração | API Management + Functions/Logic Apps | Fachada para o SAP; eventos de stock |
| IaC | Bicep (só Azure, equipa sem experiência de Terraform) | Simplicidade; acompanha o Azure |
| Governação | Políticas: regiões permitidas, etiquetas obrigatórias, SKUs permitidas | Barreiras sem bloquear a equipa |
| Custos | Orçamento por subscrição com alertas; etiqueta «dono» | Visibilidade desde o primeiro dia |

## Modelo reutilizável: lista de verificação de uma base cloud

- [ ] Quem gere o quê? (matriz de responsabilidade para cada serviço escolhido)
- [ ] Região e zonas decididas, com requisito de residência de dados escrito
- [ ] Endereços IP sem colisão com o on-premises; ligação (VPN ou ExpressRoute) com alternativa em caso de falha
- [ ] Tudo definido em IaC e aplicado por pipeline; nada de alterações manuais em produção
- [ ] Grupos de gestão, subscrições e políticas desenhados; redundância alinhada com o RPO/RTO (módulo 08)
- [ ] Etiquetas obrigatórias (dono, ambiente, centro de custo) e orçamentos com alertas

## Equivalentes na AWS

| Conceito | Azure | AWS |
|---|---|---|
| Fronteira de faturação e isolamento | Subscrição | Conta (*account*) |
| Agrupar contas/subscrições | Grupos de gestão | AWS Organizations (unidades organizacionais) |
| Governação por regras | Azure Policy | AWS Config (avaliação de conformidade); ver também as SCP do Organizations |
| Landing zone | Azure landing zone (Bicep/Terraform) | AWS Control Tower |
| Rede virtual | VNet | VPC |
| Ligação privada dedicada | ExpressRoute | Direct Connect |
| VPN site a site | VPN Gateway | Site-to-Site VPN |
| Balanceador camada 4 / camada 7 | Load Balancer / Application Gateway | Network Load Balancer / Application Load Balancer |
| Acesso privado a PaaS | Private Endpoint | VPC endpoints / PrivateLink |
| Máquinas virtuais | Virtual Machines | EC2 |
| PaaS web | App Service | Elastic Beanstalk |
| Serverless | Functions | Lambda |
| Contentores geridos | Container Apps / AKS | ECS / EKS |
| Armazenamento de objetos | Blob Storage | S3 |
| IaC | Bicep, Terraform | CloudFormation, Terraform |
| Custos | Cost Management | Billing and Cost Management / Cost Explorer |

**ATENÇÃO:** a Microsoft avisa que os serviços «não correspondem sempre de forma clara» e que nem todos os pares têm paridade funcional. Por exemplo, no Azure as sub-redes abrangem todas as zonas da região, enquanto na AWS cada sub-rede pertence a uma só zona. Usa a tabela como ponto de partida, não como equivalência exata.

## Depende da empresa

| Fator | Pequena empresa | Grande empresa |
|---|---|---|
| Landing zone | Mínimo viável: 2 a 3 subscrições e políticas essenciais | Plataforma completa com equipa dedicada e subscrições por carga de trabalho |
| Ligação ao on-premises | VPN | ExpressRoute com redundância |

## Erros comuns

- **Começar a construir sem landing zone:** tudo numa subscrição só, sem políticas, e uma migração dolorosa depois.
- **Esquecer a sobreposição de IPs** entre a VNet e a rede on-premises: só se descobre ao ligar.
- **Ligar o portal diretamente ao SAP,** expondo o ERP a picos e a indisponibilidades.

## Ligação às certificações

Segundo o guia de estudo do **AZ-305** (competências medidas a partir de 17 de abril de 2026, confirma sempre a versão atual), este módulo toca em quatro domínios:

| Tema deste módulo | Domínio do AZ-305 | Serviço Azure principal | Equivalente AWS |
|---|---|---|---|
| Grupos de gestão, subscrições, grupos de recursos, etiquetas, conformidade (Policy) | Identidade, governação e monitorização (25-30%): *Design governance* | Management groups, Azure Policy | Organizations, Config, Control Tower |
| Máquinas virtuais, contentores, serverless, *batch* | Infraestrutura (30-35%): *Design compute solutions* | VMs, App Service, Container Apps, AKS, Functions | EC2, ECS/EKS, Lambda |
| Ligação à internet e ao on-premises, otimização, balanceamento | Infraestrutura (30-35%): *Design network solutions* | VNet, VPN Gateway, ExpressRoute, Load Balancer, Application Gateway, Front Door | VPC, Direct Connect, ELB, Route 53 |
| Blob, Files, redundância e escalões; zonas de disponibilidade | Armazenamento de dados (20-25%); Continuidade de negócio (15-20%): *Design for high availability* | Storage (LRS/ZRS/GRS/GZRS), availability zones | S3, EBS, EFS; zonas de disponibilidade |

## Exercícios

**PRATICAR:** faz os exercícios **21 a 24** do módulo 15: responsabilidade partilhada (21), rede híbrida (22), escolha de computação (23) e landing zone com governação (24).

## Fontes oficiais

- [Responsabilidade partilhada na cloud (Azure)](https://learn.microsoft.com/azure/security/fundamentals/shared-responsibility)
- [Zonas de disponibilidade do Azure](https://learn.microsoft.com/azure/reliability/availability-zones-overview)
- [Pares de regiões do Azure](https://learn.microsoft.com/azure/reliability/regions-paired)
- [Azure Virtual Network](https://learn.microsoft.com/azure/virtual-network/virtual-networks-overview)
- [VPN Gateway](https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-about-vpngateways)
- [ExpressRoute](https://learn.microsoft.com/azure/expressroute/expressroute-introduction)
- [Opções de balanceamento de carga](https://learn.microsoft.com/azure/architecture/guide/technology-choices/load-balancing-overview)
- [Topologia hub-spoke no Azure](https://learn.microsoft.com/azure/architecture/networking/architecture/hub-spoke)
- [Azure App Service](https://learn.microsoft.com/azure/app-service/overview)
- [Opções de alojamento do Azure Functions](https://learn.microsoft.com/azure/azure-functions/functions-scale)
- [Comparar opções de contentores no Azure](https://learn.microsoft.com/azure/container-apps/compare-options)
- [Azure Kubernetes Service](https://learn.microsoft.com/azure/aks/what-is-aks)
- [Redundância do Azure Storage](https://learn.microsoft.com/azure/storage/common/storage-redundancy)
- [Escalões de acesso do Blob](https://learn.microsoft.com/azure/storage/blobs/access-tiers-overview)
- [Bicep](https://learn.microsoft.com/azure/azure-resource-manager/bicep/overview)
- [Terraform no Azure](https://learn.microsoft.com/azure/developer/terraform/overview)
- [Azure landing zones](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/landing-zone/)
- [Grupos de gestão](https://learn.microsoft.com/azure/governance/management-groups/overview)
- [Organizar subscrições e grupos de gestão](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/organize-subscriptions)
- [Azure Policy](https://learn.microsoft.com/azure/governance/policy/overview)
- [Azure Arc](https://learn.microsoft.com/azure/azure-arc/overview)
- [SAP em Azure: primeiros passos](https://learn.microsoft.com/azure/sap/workloads/get-started)
- [Integração do Azure com SAP RISE](https://learn.microsoft.com/azure/sap/workloads/rise-integration)
- [Conector SAP do Logic Apps](https://learn.microsoft.com/azure/logic-apps/logic-apps-using-sap-connector)
- [Importar OData do SAP para o API Management](https://learn.microsoft.com/azure/api-management/sap-api)
- [Microsoft Cost Management](https://learn.microsoft.com/azure/cost-management-billing/costs/overview-cost-management)
- [Orçamentos do Cost Management](https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [Reservas do Azure](https://learn.microsoft.com/azure/cost-management-billing/reservations/save-compute-costs-reservations)
- [Azure para profissionais AWS](https://learn.microsoft.com/azure/architecture/aws-professional/services)
- [Guia de estudo do AZ-305](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-305)
- [AWS Control Tower](https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html)
- [Modelo de responsabilidade partilhada da AWS](https://aws.amazon.com/compliance/shared-responsibility-model/)
