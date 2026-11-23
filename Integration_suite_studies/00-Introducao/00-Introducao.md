# Introdução ao SAP Integration Suite

A Casa Nova Distribuição recebe encomendas num portal web e regista-as no ERP. O portal envia JSON, o ERP tem o seu próprio contrato e a equipa de operações precisa de saber se uma encomenda foi aceite, rejeitada ou ficou pendente. Vais usar esse cenário para aprender a desenhar integrações que se conseguem testar, monitorizar e corrigir.

## Onde entra a integração

Num pedido direto, o portal teria de conhecer o formato, a autenticação e o endereço do ERP. Quando também tens de notificar o armazém ou atualizar o stock, essas decisões acabam espalhadas por vários sistemas. Uma camada de integração dá um lugar explícito às transformações, à escolha de destinos e à observação das mensagens. Cada regra deve ter um dono. Por exemplo, o ERP é dono da encomenda registada. A integração faz a tradução e mantém a referência que permite seguir o pedido.

O SAP Business Technology Platform, ou BTP, fornece a base para gerir contas, serviços e acessos. O SAP Integration Suite reúne capacidades de integração nessa plataforma. Cloud Integration é a capacidade que executa os fluxos de integração, ou iFlows. A sigla CPI ainda aparece em material antigo e em nomes técnicos.

## As capacidades e quando as usar

| Necessidade | Capacidade | Exemplo na Casa Nova |
|---|---|---|
| Transformar ou encaminhar uma mensagem | Cloud Integration | Traduzir o pedido do portal para o ERP |
| Publicar uma API com políticas | API Management | Identificar clientes e impor uma quota |
| Distribuir eventos a consumidores | Event Mesh | Avisar stock e expedição de uma alteração |
| Definir mensagens de parceiros | Integration Advisor | Acordar campos e mapeamentos EDI |
| Operar acordos B2B | Trading Partner Management | Distinguir os perfis de dois fornecedores |
| Aceder a um serviço SaaS | Open Connectors | Consultar uma aplicação de terceiros |
| Estimar uma migração de SAP PO | Migration Assessment | Inventariar interfaces existentes |

As capacidades que vês dependem do plano, da ativação e das permissões. A visibilidade de um menu, por si só, não prova que um recurso específico esteja disponível. O próprio desenho do laboratório indica a alternativa quando depender de uma capacidade opcional.

## Um mapa para começar

1. Em BTP, identifica o subaccount de estudo, a subscrição e a região.
2. Abre a aplicação do Integration Suite. Em Discover, procura exemplos da SAP. Em Design, identifica o pacote de treino e os seus artefactos.
3. Em Monitor, distingue conteúdo implantado de mensagens processadas. Um fluxo pode estar iniciado e ainda não ter corrido.
4. Em Settings, observa apenas as áreas para as quais tens permissões. Regista o nome da capacidade e a opção que falta se uma secção não abrir.

Em contexto empresarial, separa os ambientes de desenvolvimento, teste e produção. Os nomes e as permissões devem permitir distinguir um fluxo de treino de um fluxo que mexe em dados reais. Nos laboratórios, usa dados fictícios e instalações de teste.

## Como trabalhar com as aulas

Lê os módulos 01 a 04 pela ordem indicada. Começas com o percurso de uma mensagem, depois acrescentas transformação, conectividade e tratamento de falhas. Os módulos 05 a 11 introduzem publicação de APIs, operação, eventos, B2B, conectores SaaS, migração e integração com SAP, Azure e IA. O módulo 12 junta as decisões num projeto. Os módulos 13 a 15 permitem praticar, consultar e corrigir.

- **Teste local.** Executa a lógica da transformação e o simulador do projeto com dados do repositório.
- **Laboratório no tenant.** Segue os passos no editor SAP e compara o resultado com as verificações propostas.
- **Simulação ou desenho.** Faz a experiência com dados locais ou produz uma decisão fundamentada quando a capacidade ou o sistema externo não estiver disponível.

O exemplo Groovy Ola parte de um iFlow que já foi testado pelo autor do ZIP. Os laboratórios novos descrevem resultados esperados. O estado da validação está registado no README do curso.

## Primeiro contacto com o exemplo

O iFlow de referência inicia uma mensagem com um Timer, define o corpo, passa pelo script e termina. A propriedade tamanho pode ser observada durante a execução. Este percurso simples separa o que o fluxo faz de quanto tempo esteve implantado. No próximo módulo vais reconhecer estes passos antes de alterar o conteúdo da mensagem.

    Timer → Content Modifier → Groovy Script → End

## Exercícios

Abre o índice do módulo 13 para os exercícios numerados. Como preparação, escolhe uma encomenda fictícia, identifica os sistemas que a recebem e escreve três perguntas operacionais. Por exemplo, como descobrir se a mesma encomenda chegou duas vezes, onde encontrar o identificador de execução e quem corrige um código de produto inválido.

## Fontes oficiais

- [Capabilities of SAP Integration Suite](https://help.sap.com/docs/integration-suite/sap-integration-suite/capabilities?locale=en-US)
- [Working with SAP Integration Suite Home](https://help.sap.com/docs/integration-suite/sap-integration-suite/working-with-integration-suite-home)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
