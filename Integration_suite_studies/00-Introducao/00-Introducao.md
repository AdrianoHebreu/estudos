# Introdução ao SAP Integration Suite

A Casa Nova Distribuição recebe encomendas num portal web e regista-as no ERP. O portal envia JSON, o ERP tem o seu próprio contrato e a equipa de operações precisa de saber se uma encomenda foi aceite, rejeitada ou ficou pendente. Vais usar esse cenário para aprender a desenhar integrações que se conseguem testar, monitorizar e corrigir. Neste módulo ficas com o mapa: o que é o Integration Suite, que capacidades tem, onde corre e como pões um tenant de estudo a funcionar.

**NOTA:** as secções marcadas como Documentado resumem páginas da documentação oficial SAP (indicadas no fim de cada secção). O que é Observado vem do tenant trial usado no módulo 01. O que é Por testar tens de confirmar no teu tenant, porque a SAP muda menus e planos com frequência.

## Onde entra a integração

Num pedido direto, o portal teria de conhecer o formato, a autenticação e o endereço do ERP. Quando também tens de notificar o armazém ou atualizar o stock, essas decisões acabam espalhadas por vários sistemas. Uma camada de integração dá um lugar explícito às transformações, à escolha de destinos e à observação das mensagens. Cada regra deve ter um dono: o ERP é dono da encomenda registada; a integração faz a tradução e mantém a referência que permite seguir o pedido.

O SAP Business Technology Platform (BTP) fornece a base para gerir contas, serviços e acessos. Segundo a documentação, o Integration Suite é uma plataforma de integração como serviço que corre no ambiente Cloud Foundry do BTP. O Cloud Integration é a capacidade que executa os fluxos de integração (iFlows). A sigla CPI aparece em material antigo e em nomes técnicos.

Documentado: ISuite/what-is-sap-integration-suite-5cc6987.md.

## As capacidades e quando as usar

| Necessidade | Capacidade | Exemplo na Casa Nova |
|---|---|---|
| Transformar ou encaminhar uma mensagem | Cloud Integration | Traduzir o pedido do portal para o ERP |
| Publicar uma API com políticas | API Management (e API Composition) | Identificar clientes e impor uma quota |
| Distribuir eventos a consumidores | Event Mesh | Avisar stock e expedição de uma alteração |
| Definir mensagens de parceiros | Integration Advisor | Acordar campos e mapeamentos EDI |
| Operar acordos B2B | Trading Partner Management | Distinguir os perfis de dois fornecedores |
| Aceder a um serviço SaaS | Open Connectors | Consultar uma aplicação de terceiros |
| Expor dados do SAP Business Suite como OData | OData Provisioning | Publicar uma entidade de um sistema SAP antigo |
| Trocar ativos num espaço de dados | Data Space Integration | Fora do âmbito deste curso |
| Definir a estratégia de integração (ISA-M) | Integration Assessment | Classificar interfaces por tecnologia |
| Estimar uma migração de SAP PO | Migration Assessment | Inventariar interfaces existentes |

A lista segue a página de capacidades da documentação. Esta mesma página diz que o Open Connectors oferece mais de 160 conectores prontos para aplicações não SAP, e que o Edge Integration Cell permite correr integrações num ambiente gerido por ti. As capacidades que vês dependem do plano, da ativação e das permissões: um menu visível não prova que um recurso esteja disponível.

Documentado: ISuite/capabilities-of-sap-integration-suite-e1c5b90.md e ISuite/how-different-capabilities-in-sap-integration-suite-interact-b550bbd.md. Esta última descreve três combinações típicas: A2A (Cloud Integration com Open Connectors), B2B (Integration Advisor, Cloud Integration e Trading Partner Management) e API-centric (API Management com Developer Hub).

## Onde corre: modelos de implementação

| Opção | Quem opera o runtime | Quando faz sentido |
|---|---|---|
| Cloud (standard) | A SAP, no BTP (Cloud Integration Runtime) | Remetente e destinatário na cloud ou on-premise, com mensagens a passar pela cloud |
| Hybrid (Edge Integration Cell) | Tu, num cluster Kubernetes teu | Dados que não podem sair da tua rede: desenhas e monitorizas na cloud, mas a execução é local |
| Integration Cell | A SAP, como base gerida do runtime | A documentação descreve-a como a base totalmente gerida, com governação e monitorização centralizadas |

No modelo standard, o programador desenha o conteúdo (iFlows, APIs), faz deploy, e o runtime da SAP passa a processar e a trocar dados com os sistemas ligados. Este curso usa o modelo standard na cloud. O Edge Integration Cell fica como tema de arquitetura.

Documentado: ISuite/deployment-options-and-runtimes-066f441.md e ISuite/standard-deployment-in-the-cloud-ca5b233.md.

## Ativar e dar acesso

Antes de desenhares qualquer coisa, alguém tem de ativar as capacidades e atribuir papéis. Documentado:

1. Quem ativa precisa do papel Integration_Provisioner. Na página inicial, em Capabilities, escolhe Add Capabilities (primeira vez) ou Manage Capabilities, seleciona as capacidades e escolhe Activate.
2. Para o Cloud Integration escolhe o ambiente: Non-Production (testes, desempenho) ou Production. A mesma página recomenda usar o mesmo ambiente se também ativares o API Management no tenant.
3. A opção Message Queues liga o armazenamento JMS que permite desacoplar de forma assíncrona e repetir a partir do Integration Suite (usado no módulo 04).
4. Depois de ativar, atribui coleções de papéis aos utilizadores no subaccount, em Security, Users. Para o Cloud Integration a documentação lista PI_Read_Only, PI_Business_Expert, PI_Integration_Developer e PI_Administrator.
5. Depois de atribuíres um papel, limpa a cache e as cookies do browser e volta a entrar na aplicação.

Há dependências a conhecer: Trading Partner Management exige Cloud Integration com Message Queues e Integration Advisor; API Composition exige a opção Developer Hub; quem já tem o serviço Event Mesh autónomo não pode subscrever a capacidade Event Mesh no mesmo subaccount.

Documentado: ISuite/activating-and-managing-capabilities-2ffb343.md e ISuite/configuring-user-access-to-sap-integration-suite-2c6214a.md.

## Um tenant de estudo: plano gratuito

A documentação descreve um plano gratuito (free tier) do Integration Suite com estas regras:

| Aspeto | O que diz a documentação |
|---|---|
| Custo | Sem custo, com acesso a todas as capacidades para experimentar |
| Duração | O plano expira ao fim de 90 dias |
| Depois de expirar | Podes reativá-lo, mas o conteúdo de integração desenvolvido e implantado nos primeiros 90 dias é apagado |
| Salvaguarda | Descarrega o conteúdo (por exemplo, exportando os iFlows) ou passa para um plano pago |
| Subscrição | Requer um acordo CPEA ou pay-as-you-go; no cockpit, em Entitlements, adiciona o plano free e subscreve |

A mesma documentação distingue contas trial do BTP (gratuitas) de contas enterprise. Qual destas tens é uma verificação Por testar: vê o tipo de conta e o plano no cockpit do BTP. A disponibilidade de capacidades por plano está na nota SAP 2903776, citada pela documentação.

**ATENÇÃO:** exporta os teus iFlows com regularidade (o módulo 01 mostra o ficheiro zip). Num plano gratuito, perder o tenant significa perder o desenho.

Documentado: ISuite/10-InitialSetup/using-free-service-plans-ddf6692.md e ISuite/10-InitialSetup/subscribing-to-free-tier-cf0cc4c.md.

## Um mapa para começar

1. Em BTP, identifica o subaccount de estudo, a subscrição, o plano e a região.
2. Abre a aplicação do Integration Suite. Em Discover, procura exemplos da SAP. Em Design, identifica o pacote de treino e os seus artefactos.
3. Em Monitor, distingue conteúdo implantado de mensagens processadas. Um fluxo pode estar iniciado e ainda não ter corrido.
4. Em Settings, observa apenas as áreas para as quais tens permissões. Regista o nome da capacidade e a opção que falta se uma secção não abrir.

Observado: os menus Home, Discover, Design, Modernize, Monitor, Inspect e Settings do módulo 01 (região us10). O ecrã tem ajuda contextual: na barra superior, o botão Help abre um painel de tópicos ao lado do ecrã atual (Documentado).

Em contexto empresarial, separa os ambientes de desenvolvimento, teste e produção. Os nomes e as permissões devem permitir distinguir um fluxo de treino de um fluxo que mexe em dados reais. Nos laboratórios, usa dados fictícios.

## Como trabalhar com as aulas

Lê os módulos 01 a 04 pela ordem indicada: percurso de uma mensagem, transformação, conectividade e tratamento de falhas. Os módulos 05 a 11 introduzem publicação de APIs, operação, eventos, B2B, conectores SaaS, migração e integração com SAP, Azure e IA. O módulo 12 junta as decisões num projeto. Os módulos 13 a 15 permitem praticar, consultar e corrigir.

- **Teste local.** Executa a lógica da transformação e o simulador do projeto com dados do repositório.
- **Laboratório no tenant.** Segue os passos no editor SAP e compara o resultado com as verificações propostas.
- **Simulação ou desenho.** Faz a experiência com dados locais ou produz uma decisão fundamentada quando a capacidade ou o sistema externo não estiver disponível.

O exemplo Groovy Ola parte de um iFlow que já foi testado e observado (módulo 01). Os laboratórios novos descrevem resultados esperados e dizem o que ficou por testar. O estado da validação está registado no README do curso.

## Primeiro contacto com o exemplo

O iFlow de referência inicia uma mensagem com um Timer, define o corpo, passa pelo script e termina. A propriedade tamanho pode ser observada durante a execução. Este percurso simples separa o que o fluxo faz de quanto tempo esteve implantado.

    Timer → Content Modifier → Groovy Script → End

## Exercícios

**PRATICAR:** abre o índice do módulo 13 para os exercícios numerados. Como preparação, escolhe uma encomenda fictícia, identifica os sistemas que a recebem e escreve três perguntas operacionais. Por exemplo, como descobrir se a mesma encomenda chegou duas vezes, onde encontrar o identificador de execução e quem corrige um código de produto inválido. Acrescenta uma quarta: que capacidades do Integration Suite precisarias de ativar para a resolver.

## Fontes oficiais

- [Capabilities of SAP Integration Suite](https://help.sap.com/docs/integration-suite/sap-integration-suite/capabilities?locale=en-US)
- [Working with SAP Integration Suite Home](https://help.sap.com/docs/integration-suite/sap-integration-suite/working-with-integration-suite-home)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
- [What is SAP Integration Suite (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite/what-is-sap-integration-suite-5cc6987.md)
- [Deployment Options and Runtimes (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite/deployment-options-and-runtimes-066f441.md)
- [Activating and Managing Capabilities (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite/activating-and-managing-capabilities-2ffb343.md)
- [Using Free Service Plans (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite/10-InitialSetup/using-free-service-plans-ddf6692.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
