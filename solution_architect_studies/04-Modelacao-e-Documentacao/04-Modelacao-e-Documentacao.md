# 04 Modelação e documentação

## Porque desenhas e escreves

Uma arquitetura que só existe na cabeça de quem a desenhou **não é uma arquitetura, é uma opinião**. Desenhos e documentos servem três coisas: **comunicar** (a direção, as equipas, a segurança), **decidir** (comparar alternativas antes de gastar dinheiro) e **lembrar** (daqui a dois anos, porque é que foi feito assim?).

O kit mínimo: **C4** (estrutura), **UML essencial** (comportamento e implantação), **ADR** (decisões) e **documento de solução** (a narrativa que junta tudo).

**DICA:** o objetivo não é ter muitos diagramas, é ter **os poucos que alguém vai realmente usar**. Um desenho que ninguém consulta é custo, não ativo.

## O modelo C4

O **C4** organiza a descrição de um sistema em quatro níveis de zoom, como um mapa: país, cidade, bairro, rua. Os níveis assentam em cinco abstrações definidas em c4model.com:

| Abstração | Significado |
|---|---|
| **Pessoa** | Um utilizador do sistema (ator, papel, persona) |
| **Sistema de software** | A unidade de topo, composta por um ou mais contentores |
| **Contentor** | Uma aplicação ou um armazenamento de dados que tem de estar a correr para o sistema funcionar |
| **Componente** | Um agrupamento de funcionalidade relacionada dentro de um contentor |
| **Código** | Classes, interfaces, funções que realizam um componente |

**ATENÇÃO:** «contentor» em C4 **não é** Docker. Uma aplicação Delphi de balcão, uma API em Bun e uma base de dados são contentores C4. Docker é uma forma de empacotar, e fica para o módulo 06.

| Nível | Diagrama | Mostra | Público típico | Quando fazer |
|---|---|---|---|---|
| 1 | Contexto do sistema | O sistema como caixa única, pessoas e sistemas à volta | Todos, incluindo negócio | Sempre |
| 2 | Contentores | Aplicações e dados dentro do sistema, e a tecnologia de cada um | Equipas técnicas, segurança, infraestrutura | Sempre |
| 3 | Componentes | Blocos internos de **um** contentor | Developers da equipa | Só onde acrescenta valor |
| 4 | Código | Classes e relações | Developers | Raramente: gera a partir do código |

Segundo o c4model.com, os diagramas de contexto e de contentores são suficientes para a maioria das equipas, e não é preciso usar os quatro níveis, só os que acrescentam valor. Existem ainda diagramas complementares (panorama de sistemas, dinâmico, implantação).

### Regras de notação (do C4)

- Cada diagrama tem **título** (tipo e âmbito) e **legenda**; tem de se perceber **sem narrador**.
- Cada elemento mostra o **tipo**, a responsabilidade e, em contentores e componentes, a **tecnologia**.
- Cada linha tem **um sentido** e uma **etiqueta específica** (evita «usa»; indica o protocolo entre contentores).

## Exemplo trabalhado: Casa Nova, níveis 1 a 3

**Nível 1 — Contexto** da plataforma de encomendas e stock (zero tecnologia: quem aprova o orçamento percebe-o em 30 segundos):

    Título: Contexto do sistema "Plataforma de Encomendas e Stock" (Casa Nova)

    [Cliente profissional]                    [Operador de balcão]
    (Pessoa: encomenda online)                (Pessoa: vende nas 12 delegações)
              | Consulta stock e                         | Regista vendas e
              | encomenda (HTTPS)                        | consulta stock
              v                                          v
        +---------------------------------------------------------+
        |  PLATAFORMA DE ENCOMENDAS E STOCK (sistema novo, Azure) |
        |  Stock em tempo real e portal de encomendas             |
        +---------------------------------------------------------+
              | Cria encomendas,   ^ Stock                | Envia emails de
              | lê stock mestre    | alterado             | confirmação
              v                    |                      v
        [ERP SAP] ----------------+              [Serviço de email]
        (existente: fonte de verdade             (sistema externo)
         de stock, preços e clientes)

    Legenda: [ ] pessoa ou sistema externo; caixa grande = sistema em desenho.

**Nível 2 — Contentores** (a tecnologia é uma proposta, justificada depois com ADRs):

    Título: Contentores da "Plataforma de Encomendas e Stock"

    [Portal Web: página única]--HTTPS/JSON--+
    [Balcão Delphi]-----------HTTPS/JSON----+
                                            v
                                +-----------------------------+
                                | API de Encomendas           |
                                | (Bun + TypeScript)          |
                                +-----------------------------+
                                   | SQL                | publica "EncomendaCriada"
                                   v                    v
                     [Base de dados da plataforma]  [Barramento de mensagens]
                                   ^                    | consome
                                   | atualiza stock     v
                                   +------------ +-----------------------------+
                                                 | Integrador SAP (serviço)    |
                                                 +-----------------------------+
                                                        | chamadas ao SAP (módulo 05)
                                                        v
                                                    [ERP SAP]

    Legenda: [ ] contentor ou sistema; setas etiquetadas com protocolo e finalidade.

**NOTA:** o desenho esconde uma decisão de fundo: a API **não fala diretamente com o SAP**; um Integrador isola o resto do sistema das particularidades do ERP. Essa decisão vira um ADR (mais abaixo).

**Nível 3 — Componentes**, só do contentor «API de Encomendas» (onde a equipa mais trabalha):

    +--- API de Encomendas ---------------------------------------------+
    | [Controlador REST] --> [Serviço de Encomendas] --> [Repositório]   |
    |   +--> [Autenticação]        +--> [Publicador de Eventos]          |
    +--------------------------------------------------------------------+

O nível 4 (classes) não se desenha à mão: se for preciso, gera-se a partir do código.

## UML essencial

A **UML** é uma linguagem de modelação padronizada pelo OMG, com muitos tipos de diagrama. Três chegam para quase tudo e **complementam** o C4 (fraco em comportamento).

| Diagrama | Responde a | Quando usar |
|---|---|---|
| **Sequência** | Que mensagens trocam os participantes, por que ordem? | Fluxos críticos, integração, falhas |
| **Componentes** | Que partes existem e que interfaces oferecem e exigem? | Contratos entre equipas |
| **Implantação** | Em que nós de execução corre cada coisa? | Infraestrutura, redes, ambientes |

**Sequência:** criar encomenda no portal (caminho feliz):

    Portal      API Enc.    Base dados   Barramento   Integrador     SAP
      | 1.POST    |            |            |            |           |
      |---------->| 2.Gravar (pendente)     |            |           |
      |           |----------->|            |            |           |
      |           | 3.Publicar EncomendaCriada           |           |
      |           |------------------------>|            |           |
      |<----------| 4.202 Aceite (pendente) | 5.Entregar |           |
      |           |            |            |----------->| 6.Criar   |
      |           |            |            |            |---------->|
      |           |<---------------------------- 7.Confirmar (assíncrono)

O valor do diagrama está em **expor decisões**: a resposta ao cliente é «aceite», não «concluída». E se o passo 6 falhar? Seria o diagrama seguinte; o módulo 08 aprofunda a resiliência.

**Componentes:** mostra o que cada parte **oferece** e **exige**. O Integrador SAP oferece a interface «consumir EncomendaCriada» e exige a interface «criar encomenda» do SAP: é este contrato, e não o código, que as duas equipas negoceiam.

**Implantação** (resumo):

    [Delegações x12]               [Azure]                          [Datacenter Casa Nova]
     PC balcão: App Delphi --VPN--> API, Base de dados, Barramento    Servidor SAP
                                    Integrador SAP <------VPN-------> (ERP)
    [Internet] ---------------------> Portal Web (entrada pública)

**DICA:** usa UML **informalmente mas de forma consistente**. Ninguém te penaliza uma ponta de seta «errada», mas um diagrama sem legenda não se percebe.

## Registos de decisão (ADR)

Um **ADR** (Architecture Decision Record) é um registo curto de uma decisão arquiteturalmente significativa: contexto, alternativas, decisão e consequências. A Microsoft descreve-o como «um dos entregáveis mais importantes de um solution architect», porque a arquitetura é a acumulação das suas decisões.

Regras que se repetem nas fontes oficiais:

- **Só decisões significativas:** as que afetam a estrutura, atributos de qualidade importantes ou que são difíceis de reverter.
- **Só de acrescentar (append-only):** não se edita um ADR aceite. Se a decisão muda, um novo ADR **substitui** o anterior e ligam-se os dois.
- **Contexto e justificação sempre**, modelo fixo, curto, decisão compreensível sem anexos, com **estado** explícito (Proposto, Aceite, Substituído).
- **Guardado com o código ou a documentação**, aberto à equipa, não na caixa de correio de um arquiteto.

### Modelo completo

    # ADR-NNNN: <título curto: problema resolvido + solução escolhida>

    - Estado: Proposto | Aceite | Rejeitado | Substituído por ADR-XXXX
    - Data: AAAA-MM-DD   Decisores: <quem decide>   Consultados: <quem opinou>

    ## Contexto e problema
    <Forças em jogo: requisitos, restrições, prazos. Porque é significativo?>

    ## Critérios de decisão e opções consideradas
    <Custo, prazo, competências, risco...>
    1. <A>   2. <B>   3. <C, incluindo "não fazer nada" se fizer sentido>

    ## Decisão
    Escolhemos <opção>, porque <razão principal ligada aos critérios>.

    ## Consequências
    - Positivas / Negativas (compromissos aceites) / Riscos e mitigação
    - Nível de confiança: alto | médio | baixo (e o que nos faria rever)

    ## Mais informação
    <Requisitos, diagramas, ADRs relacionados, prós e contras detalhados>

Este modelo segue de perto o formato **MADR** (adr.github.io/madr) e as recomendações do Azure Well-Architected Framework, incluindo o **nível de confiança** como campo útil para revisão futura.

### Exemplo preenchido (Casa Nova)

    # ADR-0003: Integrar o SAP através de um serviço Integrador dedicado

    - Estado: Aceite   Data: 2026-11-12
    - Decisores: Arquiteto de soluções, Responsável SAP   Consultados: Equipa Delphi, Segurança

    ## Contexto e problema
    A plataforma nova precisa de criar encomendas e ler stock no SAP. Hoje existem
    integrações feitas à medida, ligadas diretamente ao SAP. O SAP não pode parar
    (restrição) e a equipa interna é pequena. Que componentes falam com o SAP?

    ## Critérios de decisão
    Proteger o SAP de picos do portal; limitar o impacto de mudanças no SAP;
    manutenção por equipa pequena.

    ## Opções consideradas
    1. A API de Encomendas chama o SAP diretamente.
    2. Serviço Integrador dedicado, comunicando por mensagens com o resto da plataforma.
    3. Manter as integrações atuais à medida e acrescentar uma nova para o portal.

    ## Decisão
    Escolhemos a opção 2: só o Integrador conhece o SAP e traduz modelos de dados,
    porque concentra o conhecimento do ERP num ponto e protege o SAP do portal.

    ## Consequências
    - Positivas: mudanças no SAP afetam um serviço; o portal continua a aceitar
      encomendas se o SAP estiver indisponível (confirmação assíncrona).
    - Negativas: mais um componente a operar; consistência eventual (o cliente vê
      «em processamento»); exige desenhar bem as falhas e reenvios.
    - Riscos: o Integrador tornar-se gargalo ou «mini-monólito». Mitigação: contrato
      de mensagens versionado e monitorização desde o início.
    - Confiança: média. Rever se o volume ou o custo de operação divergirem do previsto.

    ## Mais informação
    Diagrama de contentores v1.2; requisito RNF-04 (disponibilidade do portal).

**ATENÇÃO:** um ADR sem alternativas reais («Opção 1: a nossa. Opção 2: não fazer nada») é propaganda, não decisão. Inclui a alternativa que um colega razoável defenderia.

## O documento de solução

O **documento de solução** (ou Solution Design Document) junta diagramas, requisitos e decisões numa narrativa. Não tens de inventar a estrutura: o **arc42** é um modelo aberto com 12 secções, que podes usar completo ou reduzido (arc42.org/overview):

| # | Secção arc42 | O que vai lá | Ligação ao curso |
|---|---|---|---|
| 1 | Introdução e objetivos | Requisitos e objetivos de qualidade, stakeholders | Módulo 02 |
| 2 | Restrições | Limites técnicos, organizacionais, legais | Módulo 02 |
| 3 | Contexto e âmbito | Parceiros de comunicação e interfaces (negócio e técnico) | C4 nível 1 |
| 4 | Estratégia da solução | As decisões-chave e a abordagem | Módulo 03 |
| 5 | Vista de blocos de construção | A estrutura estática, por níveis | C4 níveis 2 e 3 |
| 6 | Vista de execução | Cenários importantes em tempo de execução | UML sequência |
| 7 | Vista de implantação | Infraestrutura e mapeamento | UML implantação |
| 8 | Conceitos transversais | Segurança, logging, tratamento de erros, etc. | Módulos 07 e 08 |
| 9 | Decisões de arquitetura | As decisões importantes | ADRs |
| 10 | Requisitos de qualidade | Cenários de qualidade concretos | Módulo 02 |
| 11 | Riscos e dívida técnica | Problemas conhecidos | Módulos 08 e 10 |
| 12 | Glossário | Termos de negócio e técnicos | Módulo 00 |

**DICA:** o arc42 foi desenhado para ser usado de forma **seletiva**: preenche só o que ajuda o leitor. Uma solução pequena pode ter 6 secções de uma página cada. A secção 9 pode ser apenas um índice de ADRs, e a 3 pode ser o diagrama C4 de contexto.

## Diagramas como código

Em vez de desenhar à mão numa ferramenta gráfica, podes **escrever o diagrama em texto** e gerar a imagem. Exemplos de ferramentas: **Structurizr** (DSL própria para C4: um modelo, várias vistas), **PlantUML** e **Mermaid** (diagramas em texto, vários tipos).

**Vantagens:** versiona-se em Git e revê-se em pull request; um modelo pode gerar várias vistas coerentes (Structurizr); atualizar é editar texto. **Limitações:** layout menos controlável, sintaxe a aprender, e nem toda a gente da direção quer ver código.

**NOTA:** a ferramenta é secundária. Se a equipa já usa uma ferramenta gráfica e mantém os desenhos atualizados, não mudes só por moda. O que importa é o desenho estar **no mesmo sítio e ao mesmo ritmo** que o código. Os assistentes de IA (Claude Code, Codex) podem ajudar a rascunhar diagramas em texto, mas confirma sempre se o desenho reflete a realidade: eles escrevem o que parece plausível, não o que está implantado.

## Versionar e rever a documentação

| Prática | Porquê |
|---|---|
| Documentação junto do código (pasta `docs/`) ou num repositório próprio | Muda-se e revê-se com o resto |
| ADRs numerados, nunca apagados | Histórico de pensamento |
| Revisão por pares dos ADRs e diagramas | Apanha lacunas e partilha contexto |
| Data e versão em cada documento | O leitor sabe se é atual |
| Um dono por documento | Sem dono, apodrece |
| Rever em marcos (fim de fase, release grande) | Evita derrapagem entre desenho e realidade |

**ATENÇÃO:** documentação desatualizada é **pior** que não ter documentação: induz decisões erradas com confiança. Documenta menos, mas mantém.

## Nível de detalhe e público

O mesmo sistema descreve-se de forma diferente consoante quem lê. A pergunta certa é: **que decisão vai este leitor tomar com isto?**

| Público | Quer saber | Material adequado | Evitar |
|---|---|---|---|
| Direção / negócio | O que resolve, quanto custa, que riscos | C4 nível 1, resumo de uma página, riscos | Tecnologia, siglas |
| Equipas de desenvolvimento | Como se constrói e se liga | C4 níveis 2 e 3, sequência, ADRs | Visão só de alto nível |
| Segurança / infraestrutura | Onde estão os dados, fronteiras, protocolos | C4 nível 2, implantação, conceitos transversais | Detalhe de código |
| Fornecedores externos | Interfaces e contratos | Contexto, contratos de API, vista de execução relevante | Desenhos internos desnecessários |
| Operações | Como se monitoriza e recupera | Implantação, vista de execução de falhas | Teoria arquitetural |

## Modelo reutilizável: lista de verificação de um diagrama

    [ ] Título com tipo e âmbito, e legenda (formas, cores, linhas, siglas)
    [ ] Cada elemento diz tipo, responsabilidade e tecnologia (se aplicável)
    [ ] Cada linha tem sentido e etiqueta específica
    [ ] Um só nível de detalhe por diagrama; cabe num ecrã
    [ ] Percebe-se sem alguém a explicar
    [ ] Tem data, versão e dono

## Depende da empresa

| Fator | Pode variar em |
|---|---|
| Dimensão | Pequena: C4 níveis 1 e 2 + ADRs numa pasta. Grande: modelo corporativo, repositório central, governação formal |
| Cultura | Equipas ágeis preferem documentação leve e junto do código; ambientes regulados pedem documentos formais e aprovações |
| Notação | Algumas empresas usam ArchiMate, UML completa ou normas próprias: respeita-as e usa o C4 como complemento |
| Auditoria | Setores regulados exigem rastreabilidade das decisões: os ADRs ajudam |
| Quem escreve | Nalgumas empresas o arquiteto escreve tudo; noutras, as equipas escrevem e o arquiteto revê |

## Erros comuns

- Diagramas de «caixas e setas» sem legenda, sem tipos nem etiquetas, ou a misturar níveis.
- Decidir sem registar, ou editar ADRs antigos em vez de os substituir.
- ADRs sem alternativas reais nem consequências negativas.
- Documento de solução com 80 páginas e sem resumo para a direção.
- Documentação que só o arquiteto conhece, sem dono e sem revisão.
- Discutir a notação (setas UML) em vez da arquitetura.
- Desenhar à mão o nível de código, que fica desatualizado em dias.

## Ligação às certificações

O AZ-305 **não tem um domínio sobre documentação**: avalia a capacidade de recomendar soluções. O que este módulo treina é a competência por trás: comunicar e justificar o desenho e registar as decisões. O guia de estudo refere que o papel inclui «aconselhar stakeholders e traduzir requisitos de negócio em desenhos para soluções Azure», alinhados com o Azure Well-Architected Framework e o Cloud Adoption Framework.

| Tema deste módulo | Onde encaixa no AZ-305 | Referência Azure | Equivalente AWS |
|---|---|---|---|
| Diagramas de contexto, contentores e implantação | Transversal aos quatro domínios (identidade/governação/monitorização, armazenamento de dados, continuidade, infraestrutura) | Azure Architecture Center (arquiteturas de referência e ícones oficiais) | AWS Architecture Center e ícones de arquitetura |
| ADRs | Prática do pilar Excelência Operacional do Well-Architected | Azure Well-Architected Framework: *Maintain an architecture decision record* | AWS Prescriptive Guidance: *Architectural decision records* |

**NOTA:** nas questões de exame, os diagramas de referência são ferramenta de estudo, não matéria de exame em si. Confirma a lista de competências atual na página do exame antes de estudar.

## Exercícios

**PRATICAR:** faz os exercícios **13 a 16** do módulo 15: C4 níveis 1 e 2 de um portal de devoluções, correção de um diagrama defeituoso, um ADR sobre a modernização do balcão Delphi e o esqueleto de um documento de solução adaptado a três públicos.

## Fontes oficiais

- [O modelo C4](https://c4model.com/)
- [C4: diagramas](https://c4model.com/diagrams)
- [C4: notação](https://c4model.com/diagrams/notation)
- [arc42: visão geral](https://arc42.org/overview)
- [arc42: contexto e âmbito](https://docs.arc42.org/section-3/)
- [OMG: UML](https://www.omg.org/spec/UML/)
- [Azure Well-Architected: Architecture decision record](https://learn.microsoft.com/azure/well-architected/architect-role/architecture-decision-record)
- [AWS Prescriptive Guidance: Architectural decision records](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/)
- [MADR: Markdown Architectural Decision Records](https://adr.github.io/madr/)
- [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [Structurizr](https://structurizr.com/)
- [PlantUML](https://plantuml.com/)
- [Mermaid](https://mermaid.js.org/)
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-305)
