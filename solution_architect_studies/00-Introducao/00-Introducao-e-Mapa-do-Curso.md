# 00 Introdução e mapa do curso

## O que é um Solution Architect

Um **Solution Architect** (arquiteto de soluções) é a pessoa que, perante um problema de negócio, decide **como a tecnologia o vai resolver**: que sistemas entram, como se ligam, onde correm, como se protegem, quanto custam e que compromissos se aceitam. Não escreve necessariamente o código, mas tem de perceber o suficiente para que a solução desenhada seja **construível, segura, sustentável e adequada ao orçamento e ao prazo**.

A ideia central: **o developer pergunta «como se implementa isto?»; o arquiteto pergunta «isto é a coisa certa a construir, e como se encaixa em tudo o resto?»**

**NOTA:** o título e o âmbito variam muito de empresa para empresa. Onde uma organização diz «Solution Architect», outra diz «Software Architect», «Technical Architect» ou «Tech Lead». O curso cobre o que a função **normalmente** pede e assinala, em cada módulo, o que costuma depender da cultura da empresa.

## Developer vs Solution Architect

| Aspeto | Developer | Solution Architect |
|---|---|---|
| Pergunta principal | Como implemento esta funcionalidade? | Que solução resolve este problema de negócio? |
| Âmbito | Um componente ou um serviço | Vários sistemas, equipas e fornecedores |
| Horizonte | Sprint ou release | Meses a anos |
| Entregáveis | Código, testes, pull requests | Desenhos, decisões documentadas, requisitos, recomendações |
| Decisões | Dentro do componente | Entre componentes, com custo e risco |
| Interlocutores | A equipa | Negócio, equipas, segurança, infraestrutura, fornecedores |
| Erro típico | Otimizar o que não era o problema | Desenhar demais sem validar com quem constrói |

**DICA:** a transição é, acima de tudo, uma mudança de **alavanca**: deixas de produzir valor só com o teu código e passas a produzir valor através das decisões que outros vão implementar. Isso exige competências que o código sozinho não treina: comunicação, negociação e gestão de compromissos (trade-offs).

## Para quem é este curso

- Developers que vão assumir a função de Solution Architect (o caso que motivou o curso).
- Quem já faz parte do trabalho sem ter o título e quer estruturá-lo.
- Líderes técnicos que precisam de falar a mesma língua que os arquitetos.

**Pré-requisitos:** experiência de desenvolvimento de software (qualquer linguagem), noções de bases de dados, de APIs e de linha de comandos. Não é preciso saber cloud, segurança ou DevOps: o curso constrói essas bases.

**O que o curso não é:** não é um curso de preparação para exame, mas serve de base à certificação **Azure Solutions Architect Expert** e tem equivalências com a AWS (ver «Certificações»). Também não ensina uma linguagem ou framework: os conceitos são independentes de tecnologia, e a stack da empresa entra nos exemplos (ver «Contexto tecnológico»).

## Como o curso está organizado

O curso vai **do básico ao avançado** em quatro blocos, mais o fecho prático.

| Bloco | Módulos | Objetivo |
|---|---|---|
| **A. Base** | 01 a 04 | Perceber a função, ouvir o negócio, dominar os estilos de arquitetura e saber desenhar e documentar |
| **B. Construção** | 05 a 09 | Dados e integração, cloud, segurança, qualidade operacional e entrega |
| **C. Decisão e mudança** | 10 a 12 | Custos e negócio, migração de sistemas existentes, comunicação e liderança |
| **D. Avançado** | 13 | Arquitetura empresarial, arquitetura evolutiva, dados e IA |
| **Fecho** | 14 a 17 | Projeto final, exercícios, consulta rápida e gabarito |

## Mapa completo dos módulos

| Módulo | Tema | O que vais conseguir fazer no fim |
|---|---|---|
| 00 | Introdução e mapa do curso | Saber o que esperar e como estudar |
| 01 | O papel do Solution Architect | Distinguir os tipos de arquiteto, as responsabilidades, os entregáveis e o caminho de carreira |
| 02 | Do negócio aos requisitos | Levantar requisitos funcionais e não funcionais, identificar stakeholders e restrições, e escrever atributos de qualidade mensuráveis |
| 03 | Fundamentos de arquitetura | Escolher entre monólito, camadas, hexagonal, SOA, microsserviços e arquiteturas orientadas a eventos, justificando o compromisso |
| 04 | Modelação e documentação | Desenhar com o modelo C4 e UML essencial, e registar decisões com ADRs |
| 05 | Dados e integração | Escolher bases de dados, desenhar APIs e integrar sistemas por pedidos, mensagens e ficheiros, incluindo sistemas legados |
| 06 | Cloud e infraestrutura | Dominar IaaS, PaaS e SaaS, redes, contentores, noções de Kubernetes e infraestrutura como código |
| 07 | Segurança e conformidade | Aplicar identidade, OAuth e OIDC, modelação de ameaças e requisitos do RGPD à arquitetura |
| 08 | Qualidade operacional | Desenhar para escalabilidade, disponibilidade, resiliência, observabilidade e recuperação de desastres |
| 09 | DevOps e entrega | Definir pipelines de CI/CD, ambientes, estratégias de release e a relação com as equipas de plataforma |
| 10 | Decisões, custos e negócio | Comparar construir vs comprar, estimar o custo total (TCO), avaliar fornecedores, conduzir um RFP e gerir dívida técnica |
| 11 | Migração e modernização | Planear a modernização de sistemas existentes (padrão *strangler*, estratégias de migração) |
| 12 | Comunicação e liderança | Apresentar a diferentes públicos, conduzir revisões de arquitetura, negociar e fazer governação sem autoridade formal |
| 13 | Temas avançados | Situar a arquitetura empresarial (TOGAF, noções), arquitetura evolutiva, plataformas de dados e IA nas soluções |
| 14 | Projeto final | Desenhar e defender uma solução ponta a ponta, com documentação |
| 15 | Exercícios práticos | Treinar cada módulo com exercícios e estudos de caso |
| 16 | Consulta rápida | Rever num só lugar listas de verificação, comparações e modelos |
| 17 | Gabarito | Comparar as tuas soluções com resoluções comentadas e critérios de avaliação |

## O que cada aula contém

Todas as aulas seguem a mesma forma, para saberes sempre onde procurar:

1. **Conceito:** o que é e porque importa, sem jargão desnecessário.
2. **Comparações em tabela:** opções, vantagens, desvantagens e quando usar cada uma.
3. **Exemplo trabalhado:** aplicado ao caso fio condutor.
4. **Modelo reutilizável:** uma lista de verificação, um modelo de documento ou uma pergunta-guia.
5. **Depende da empresa:** o que muda conforme a cultura e a dimensão da organização.
6. **Erros comuns:** o que costuma correr mal com arquitetos em início de função.
7. **Exercícios e fontes oficiais.**

## Contexto tecnológico dos exemplos

O curso é independente de fornecedor nos conceitos, mas os exemplos usam a stack que é comum nas empresas para quem o curso foi escrito. Assim, cada conceito aparece ligado a algo que já vais encontrar no trabalho.

| Tecnologia | Papel nos exemplos | Onde aparece mais |
|---|---|---|
| **SAP** | ERP e fonte de verdade de stock, encomendas e clientes; o que quase tudo precisa de integrar | Módulos 05, 10 e 11 |
| **Microsoft Azure** | Plataforma cloud de destino das soluções | Módulos 06 a 09 |
| **Delphi** | Aplicações de desktop existentes (sistema legado a integrar ou modernizar) | Módulos 05 e 11 |
| **Bun** | Ambiente de execução JavaScript/TypeScript para serviços e APIs novas | Módulos 03, 05 e 09 |
| **Claude Code e Codex** | Assistentes de programação com IA: como entram numa equipa, com que regras e que riscos trazem | Módulos 07, 09 e 13 |

**NOTA:** quando uma tecnologia da lista não for a certa para um problema, a aula di-lo. Escolher a ferramenta adequada, e não a mais familiar, faz parte da função.

## Certificações

O curso foi pensado para te preparar o raciocínio que as certificações de arquitetura exigem, e não para decorar perguntas de exame.

| Certificação | Papel no curso |
|---|---|
| **Microsoft Azure Solutions Architect Expert** (exame AZ-305) | Alvo principal. Exige também a certificação Azure Administrator Associate (exame AZ-104) |
| **AWS Certified Solutions Architect** (Associate e Professional) | Equivalência opcional: os módulos técnicos indicam o serviço AWS equivalente |

O AZ-305 mede a capacidade de desenhar soluções em quatro domínios: identidade, governação e monitorização; armazenamento de dados; continuidade de negócio; e infraestrutura. Os módulos 03 a 11 têm uma secção **Ligação às certificações** que diz onde cada tema se encaixa nesses domínios e qual é o serviço equivalente na AWS.

**ATENÇÃO:** os exames mudam com frequência (domínios, percentagens, serviços). Confirma sempre a lista de competências atual na página oficial do exame antes de estudar: as ligações estão nas fontes de cada módulo.

## O caso fio condutor

Para que os conceitos não fiquem abstratos, o curso usa **um caso único** ao longo de todos os módulos: uma empresa fictícia de média dimensão que precisa de modernizar o seu sistema de gestão.

| Elemento | Descrição |
|---|---|
| Empresa | **Casa Nova Distribuição**, distribuidora de materiais com 400 colaboradores e 12 delegações (fictícia) |
| Situação | ERP **SAP** como sistema central, em servidores próprios, com aplicações **Delphi** de balcão e muitas integrações feitas à medida |
| Problema de negócio | Encomendas online lentas, dados duplicados entre sistemas e falta de visibilidade de stock em tempo real |
| Objetivo | Uma solução em **Azure** que ofereça stock em tempo real, um portal de encomendas e integração fiável com o SAP e as aplicações existentes |
| Restrições | Orçamento limitado, equipa interna pequena, RGPD, o sistema atual não pode parar |

Em cada módulo acrescentas uma peça: requisitos (02), estilo de arquitetura (03), desenhos e decisões (04), dados e integração (05), cloud (06), segurança (07), resiliência (08), entrega (09), custos (10), migração (11) e apresentação à direção (12). No módulo 14 juntas tudo numa solução completa.

**NOTA:** o caso é fictício e propositadamente genérico. Podes substituí-lo por um problema real da tua empresa: as técnicas aplicam-se da mesma forma.

## Competências que a função pede

| Tipo | Exemplos | Onde se treina |
|---|---|---|
| Técnicas de base | Estilos de arquitetura, dados, integração, cloud, segurança | Módulos 03 a 09 |
| Análise e decisão | Requisitos, *trade-offs*, custos, avaliação de risco | Módulos 02 e 10 |
| Documentação | Diagramas, ADRs, documentos de solução | Módulo 04 |
| Mudança | Migração, dívida técnica, evolução | Módulo 11 |
| Pessoas | Comunicação, negociação, influência | Módulo 12 |

**ATENÇÃO:** o erro mais comum de quem sobe de developer para arquiteto é **continuar a resolver tudo com código** ou desenhar tudo sozinho. O arquiteto eficaz faz perguntas, regista decisões e deixa as equipas implementar.

## Glossário rápido

| Termo | Significado |
|---|---|
| Stakeholder | Qualquer pessoa ou grupo afetado pela solução ou com poder de a influenciar |
| Requisito funcional | O que o sistema faz |
| Requisito não funcional | Como o sistema se comporta: desempenho, segurança, disponibilidade |
| Atributo de qualidade | Propriedade mensurável do sistema, como latência ou tempo de recuperação |
| *Trade-off* | Compromisso: ganhar numa qualidade custa noutra |
| ADR | *Architecture Decision Record*: registo curto de uma decisão e do seu porquê |
| TCO | *Total Cost of Ownership*: custo total ao longo da vida da solução |
| Dívida técnica | Custo futuro acumulado por atalhos tomados hoje |
| Sistema legado | Sistema antigo ainda em uso e crítico para o negócio |

## Como estudar

1. Segue a ordem dos módulos: cada um assenta nos anteriores.
2. Em cada aula, **aplica o conceito ao caso fio condutor ou a um caso real teu** e escreve a resposta: a escrita expõe lacunas que a leitura esconde.
3. Faz os exercícios do módulo 15 antes de consultar o gabarito (módulo 17).
4. Guarda o que produzires (requisitos, desenhos, ADRs) numa pasta tua: no fim, é o teu **portfólio de arquitetura**.
5. Usa o módulo 16 como consulta rápida no dia a dia.

## Exercícios

**PRATICAR:** o módulo 00 não tem exercícios. Antes de passar ao módulo 01, escreve numa página, por palavras tuas, **três decisões técnicas que já tomaste como developer** e quem foi afetado por elas além da tua equipa. Vais voltar a este texto no módulo 01.

## Fontes oficiais

- [The Open Group, TOGAF](https://www.opengroup.org/togaf)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Microsoft Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
- [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)
- [The C4 model](https://c4model.com/)
- [Azure Solutions Architect Expert](https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/)
- [Exame AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/exams/az-305/)
- [AWS Certified Solutions Architect - Associate](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
