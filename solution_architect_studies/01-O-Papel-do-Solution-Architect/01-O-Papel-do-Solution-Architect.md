# 01 O papel do Solution Architect

## O que a função realmente é

No módulo 00 viste a ideia central: o developer pergunta «como se implementa isto?» e o arquiteto pergunta «isto é a coisa certa a construir, e como se encaixa em tudo o resto?». Este módulo transforma essa frase em trabalho concreto: que tipos de arquiteto existem, o que fazem, o que entregam, quando entram num projeto, com quem falam e como se passa de um lado para o outro.

Uma definição de trabalho para o resto do curso:

    Solution Architect = a pessoa responsável por garantir que UMA solução
    (várias peças técnicas juntas) resolve um problema de negócio concreto,
    dentro de restrições de custo, prazo, risco e conformidade,
    e por deixar as decisões registadas para que outros a construam e a mantenham.

**NOTA:** repara no «responsável por garantir». O arquiteto não decide tudo nem constrói tudo. Responde pelo **resultado do desenho**, mesmo quando as decisões são tomadas em conjunto com as equipas.

## Os tipos de arquiteto

«Arquiteto» é um chapéu com vários tamanhos. As fronteiras variam de empresa para empresa, mas estes seis perfis são os mais comuns.

| Tipo | Foco | Pergunta típica | Exemplo na Casa Nova Distribuição |
|---|---|---|---|
| **Enterprise Architect** (empresarial) | A organização inteira: capacidades de negócio, portefólio de sistemas, estratégia a vários anos | Que sistemas precisamos para suportar a estratégia da empresa e quais deixamos de ter? | Decidir se o SAP continua a ser o centro do negócio nos próximos dez anos |
| **Solution Architect** (de soluções) | Uma solução ou um projeto que atravessa vários sistemas e equipas | Como é que estas peças, juntas, resolvem este problema de negócio? | O projeto «stock em tempo real + portal de encomendas» |
| **Software / Technical Architect** | O desenho interno de uma aplicação ou de um conjunto de serviços | Como estruturamos este código e estes componentes para que sejam fáceis de evoluir? | A estrutura interna do serviço de stock |
| **Cloud Architect** | Plataforma cloud: redes, contas, serviços, custos, governação | Em que serviços e topologia corre isto, e como o governamos? | A zona de aterragem (landing zone) em Azure |
| **Data Architect** (dados) | Modelos de dados, qualidade, fluxos e plataformas de dados | Quem é a fonte de verdade deste dado e como circula? | Resolver os dados de clientes duplicados entre SAP e aplicações Delphi |
| **Security Architect** (segurança) | Controlos, identidade, ameaças, conformidade | Que riscos existem e que controlos os reduzem a um nível aceitável? | Identidade dos clientes do portal e requisitos do RGPD |

Uma forma de ver a relação entre eles é pelo **alcance**:

    Enterprise      ──── a empresa toda, horizonte de anos
        │
    Solution        ──── uma solução ponta a ponta, horizonte de meses a anos
        │
    Software        ──── uma aplicação ou serviço, horizonte de sprints a meses

    Cloud, Dados e Segurança são especialidades que cortam estes níveis na transversal.

**DICA:** numa empresa pequena ou média, como a Casa Nova, é frequente uma só pessoa acumular o papel de solution architect, de cloud architect e de parte da arquitetura de dados e de segurança. O curso trata dessa realidade: dá-te as bases de todas as especialidades sem te exigir que sejas especialista em todas.

### Quem faz o quê: fronteiras que confundem

| Função vizinha | O que a distingue do Solution Architect |
|---|---|
| **Tech Lead** | Lidera tecnicamente **uma equipa** e o código dela. O arquiteto olha para **várias equipas** e para a solução como um todo |
| **Project Manager (PM)** | Responde por âmbito, prazo, orçamento e riscos de gestão. O arquiteto responde pela **adequação e integridade técnica** da solução |
| **Developer sénior** | Tem profundidade num componente. O arquiteto trabalha em **largura**, com profundidade suficiente para avaliar propostas |
| **Product Owner / Business Analyst** | Define o que o negócio precisa e a prioridade. O arquiteto traduz isso em soluções técnicas viáveis e diz o que custa cada opção |

## Responsabilidades e entregáveis

As responsabilidades repetem-se na maioria das empresas. O que muda é a profundidade com que cada uma é praticada.

| Responsabilidade | Em que consiste | Entregável típico | Módulo |
|---|---|---|---|
| Compreender o problema | Ouvir o negócio e transformar necessidades em requisitos e restrições | Documento de requisitos, lista de stakeholders | 02 |
| Desenhar a solução | Escolher o estilo, os componentes e as ligações entre eles | Diagramas, documento de arquitetura da solução | 03 e 04 |
| Decidir e registar | Escolher entre alternativas e guardar o porquê | ADRs (registos de decisão de arquitetura) | 04 |
| Gerir compromissos | Equilibrar custo, prazo, qualidade e risco | Análise de alternativas, recomendação | 10 |
| Assegurar qualidades | Segurança, desempenho, disponibilidade, operabilidade | Requisitos não funcionais verificáveis | 07 e 08 |
| Acompanhar a construção | Verificar que o implementado segue o desenhado, e ajustar o desenho à realidade | Revisões de arquitetura, pareceres | 12 |
| Gerir a evolução | Dívida técnica, migrações, ciclo de vida | Roteiro de modernização | 11 |
| Comunicar | Explicar a solução a públicos diferentes | Apresentações, resumos para a direção | 12 |

**NOTA:** a documentação da Microsoft (Well-Architected Framework) descreve o registo de decisões como «um dos entregáveis mais importantes de um solution architect», porque a arquitetura de um sistema é a acumulação das suas decisões. Vais trabalhar com ADRs no módulo 04.

### O que o arquiteto não é

| Não é | Porque não |
|---|---|
| Quem aprova tudo | Se tudo passa por ti, tornas-te um obstáculo (ver «Erros comuns») |
| Quem desenha longe da realidade | Um desenho que ninguém consegue construir não resolve o problema |
| Quem escolhe a tecnologia de que mais gosta | A escolha tem de responder a requisitos, custos e competências da equipa |
| Quem sabe mais do que todos | Sabe o suficiente para fazer boas perguntas e confiar nos especialistas |

## Onde entra no ciclo de vida de um projeto

Um erro frequente é pensar que o arquiteto só trabalha «no início», antes do código. Na prática, o envolvimento muda de intensidade ao longo do projeto, mas não desaparece.

    Ideia ─► Viabilidade ─► Desenho ─► Construção ─► Entrega ─► Operação ─► Evolução
      │          │            │           │            │           │           │
      ▼          ▼            ▼           ▼            ▼           ▼           ▼
    Perceber   Opções e     Arquitetura  Acompanhar,  Validar    Aprender    Dívida
    o problema  custos      e decisões   rever,       prontidão  com         técnica,
                aproximados  registadas   ajustar      p/ produção incidentes  migrações

| Fase | O que o arquiteto faz | O que corre mal se faltar |
|---|---|---|
| Ideia e viabilidade | Ajuda o negócio a formular o problema, levanta opções e custos aproximados | Compromete-se um orçamento sem perceber a complexidade real |
| Desenho | Define a solução, regista decisões, valida com quem constrói | Cada equipa desenha à sua maneira e as peças não encaixam |
| Construção | Responde a dúvidas, faz revisões, ajusta o desenho quando a realidade o contraria | O código afasta-se do desenho sem ninguém notar |
| Entrega | Verifica requisitos não funcionais, segurança, prontidão operacional | Vai para produção algo que funciona, mas que não aguenta carga ou não se consegue operar |
| Operação e evolução | Aprende com incidentes e custos reais, planeia a evolução | A solução degrada-se e a dívida técnica cresce sem controlo |

**DICA:** a documentação da Microsoft insiste que a transição do desenho para a produção é iterativa e que o arquiteto deve manter-se envolvido durante a implementação: definir pontos de revisão, priorizar primeiro os componentes de maior risco e usar provas de conceito para validar a viabilidade. Um desenho entregue por cima do muro e esquecido é um sinal de alerta.

## Com quem trabalhas

O arquiteto é um **ponto de ligação**. Esta é a rede de relações no caso da Casa Nova:

    Direção / Negócio ──── porquê, prioridades, orçamento
            │
    Project Manager ────── prazo, âmbito, riscos de gestão
            │
      ┌─────┴──────┐
      │  Solution  │──── Segurança / RGPD ── controlos, conformidade
      │  Architect │──── Equipa SAP ──────── regras e dados do ERP
      └─────┬──────┘──── Infraestrutura ──── rede, cloud, operação
            │
    Tech leads e developers ── construção, feedback da realidade

| Interlocutor | O que precisa de ti | O que precisas dele |
|---|---|---|
| **Negócio / direção** | Opções claras, custos e riscos em linguagem de negócio | Objetivos, prioridades, o que é negociável |
| **Project Manager** | Estimativas e dependências técnicas, aviso cedo de riscos | Calendário, orçamento, restrições de âmbito |
| **Tech leads** | Direção clara e liberdade para decidir dentro dela | A verdade sobre o que é difícil de construir |
| **Developers** | Contexto («porquê») e decisões claras | Feedback honesto: «isto não funciona assim» |
| **Segurança** | Requisitos e desenho a tempo de serem revistos | Ameaças, controlos obrigatórios, política da empresa |
| **Infraestrutura / plataforma** | Requisitos de capacidade, rede e operação | Limites reais do ambiente |
| **Fornecedores** | Requisitos claros e critérios de decisão | Informação técnica e comercial fiável |

**ATENÇÃO:** relações com segurança e infraestrutura que só começam quando o desenho já está «fechado» geram retrabalho. Convida-os cedo, mesmo sem material completo.

## Exemplo trabalhado: o arquiteto no projeto da Casa Nova

O projeto: um **portal de encomendas online** com **stock em tempo real**, integrado com o SAP e as aplicações Delphi das delegações. Assim se reparte o trabalho do arquiteto nas primeiras semanas.

| Semana | Atividade do arquiteto | Com quem | Resultado |
|---|---|---|---|
| 1 | Ouvir o problema: porque são lentas as encomendas, onde se duplicam dados | Direção comercial, logística, equipa SAP | Lista de dores e de stakeholders |
| 2 | Mapear os sistemas atuais e as integrações à medida existentes | Developers Delphi, equipa SAP | Desenho do estado atual (rascunho) |
| 3 | Levantar restrições: orçamento, RGPD, o sistema não pode parar | PM, segurança, direção | Lista de restrições e riscos iniciais |
| 4 | Formular duas ou três opções de solução, com custos aproximados | Tech leads, infraestrutura | Documento curto de opções |
| 5 | Apresentar as opções e recomendar uma | Direção, PM | Decisão e primeiro ADR |
| 6 | Detalhar a solução recomendada e validar com quem a vai construir | Tech leads, developers | Desenho acordado, riscos priorizados |

Repara no que **não** aparece: o arquiteto não escreveu código de produção nestas seis semanas. Mas o que produziu, requisitos, opções, decisões e desenhos validados, é o que evita meses de retrabalho depois.

**NOTA:** o arquiteto pode e deve escrever código quando serve um fim: uma prova de conceito para validar uma dúvida técnica, um exemplo de referência para as equipas. O que muda é o objetivo: código que **reduz incerteza**, e não código que entrega funcionalidades.

## De developer a arquiteto: a mudança de alavanca

Como developer, o teu impacto é diretamente proporcional ao código que escreves. Como arquiteto, o impacto passa a ser o das **decisões que outros implementam**. É uma mudança de alavanca: uma decisão boa multiplica o trabalho de dezenas de pessoas; uma decisão má multiplica o retrabalho.

| O que muda | Como developer | Como arquiteto |
|---|---|---|
| Medida de sucesso | A funcionalidade funciona | A solução serve o negócio e a equipa consegue construí-la e mantê-la |
| Fonte de valor | O teu código | As tuas decisões e o que facilitas aos outros |
| Feedback | Rápido: o teste passa ou falha | Lento: só vês se a decisão foi boa meses depois |
| Nível de certeza | Alto: o código faz o que escreveste | Baixo: decides com informação incompleta |
| Tempo | Blocos longos de concentração | Reuniões, conversas, leitura e escrita |
| Relação com a técnica | Profundidade | Largura, com profundidade quando necessário |

### Retomar o exercício do módulo 00

No módulo 00 escreveste três decisões técnicas que tomaste como developer e quem foi afetado além da tua equipa. Volta a esse texto e passa cada decisão por estas perguntas:

| Pergunta | Porque importa |
|---|---|
| Que alternativas consideraste, e como escolheste? | Um arquiteto decide **entre** opções e mostra a comparação |
| Quem foi afetado e foste ouvi-lo antes? | O alcance de uma decisão mede-se em pessoas e sistemas, não em linhas de código |
| Onde ficou registada? Alguém a consegue encontrar daqui a um ano? | Decisões sem registo são redescobertas, e discutidas outra vez |
| Que custo a decisão trouxe para outros (manutenção, operação, segurança)? | O custo invisível para ti era visível para outras pessoas |
| Que parte era reversível e que parte não? | Decisões difíceis de reverter pedem mais rigor |

Um exemplo, no caso da Casa Nova. Decisão de um developer: «copiar o stock do SAP para uma tabela local todas as noites, para as aplicações Delphi lerem mais depressa.»

    Afetados:       vendedores das delegações (stock com até 24 h de atraso),
                    logística (encomendas prometidas sem stock), equipa SAP.
    Alternativas:   (não foram consideradas)
    Registo:        nenhum.
    Custo para outros: dados divergentes, discussões sobre «qual é o stock certo».
    Reversível?     Parcialmente: outras aplicações já dependem da cópia.

**DICA:** o objetivo deste exercício não é concluir que decidiste mal. A decisão foi razoável **com a informação e o âmbito que tinhas**. O que descobres é que, com o olhar de arquiteto, as mesmas decisões ganham perguntas novas.

## Os primeiros 90 dias

Quem muda de função tem tendência para provar-se depressa com desenhos ambiciosos. É o contrário do que funciona: primeiro compreendes, depois ganhas confiança, só então propões mudanças grandes.

| Período | Objetivo | Ações concretas |
|---|---|---|
| **Dias 1 a 30: ouvir e mapear** | Perceber o terreno | Conversas de 30 minutos com as pessoas-chave (negócio, tech leads, segurança, infraestrutura). Ler a documentação existente. Desenhar o mapa de sistemas e integrações. Descobrir as decisões já tomadas e as dores recorrentes |
| **Dias 31 a 60: primeiras contribuições** | Criar confiança com ganhos pequenos | Escolher um problema concreto e delimitado. Documentar a tua primeira decisão como ADR. Rever o desenho de uma equipa com perguntas, e não com ordens. Começar a registar as decisões que descobriste no mês anterior |
| **Dias 61 a 90: assumir uma peça** | Assumir a responsabilidade por um desenho | Liderar o desenho de uma solução ou de uma parte. Apresentá-la a quem decide. Combinar com o teu responsável como medir o teu progresso. Escrever o que aprendeste e o que mudarias |

Perguntas úteis para as primeiras conversas:

    - Qual é a decisão técnica que mais custou a esta empresa?
    - O que é que dá sempre problemas quando vai para produção?
    - Que sistema ninguém quer tocar, e porquê?
    - Se pudesses mudar uma coisa na forma como decidimos, qual seria?
    - A quem devo ouvir antes de propor mudanças?

**ATENÇÃO:** evita «reinar» logo no primeiro mês com críticas ao que já existe. Há quase sempre razões históricas para as decisões atuais, e quem as tomou vai trabalhar contigo. Pergunta «porquê?» antes de propor «porque não?».

## Anti-padrões do arquiteto

| Anti-padrão | Como se manifesta | Consequência | Antídoto |
|---|---|---|---|
| **Torre de marfim** | Desenha longe das equipas, entrega documentos e desaparece | Desenhos que ninguém consegue ou quer construir; equipas contornam a arquitetura | Estar presente na construção, validar com quem implementa, escrever código de prova de conceito |
| **Arquiteto-bottleneck** | Todas as decisões passam por ele; as equipas esperam aprovação | Projetos parados, equipas desmotivadas, o arquiteto torna-se ponto único de falha | Delegar decisões dentro de princípios claros; reservar as tuas aprovações para o que é caro de reverter |
| **Arquiteto de diagramas** | Produz muitos desenhos e pouca decisão | Documentação que ninguém lê e que desatualiza | Documentar para decidir e comunicar, e não por obrigação |
| **Developer em tempo integral** | Continua a resolver tudo com código e a ser o «herói» | Descuida requisitos, comunicação e as outras equipas | Delegar o código; usar o tempo para o que só tu podes fazer |
| **Arquitetura por moda** | Escolhe a tecnologia do momento sem requisito que a justifique | Complexidade desnecessária, custo e dependência de competências raras | Partir sempre do problema e dos requisitos, e comparar alternativas |
| **Decisão sem registo** | Decide em conversas e não escreve nada | Debates repetidos, perda de contexto quando as pessoas saem | ADR curto para cada decisão estrutural |

**DICA:** a diferença entre a torre de marfim e o bottleneck é uma questão de dose de controlo. Se as equipas **não te ouvem**, estás demasiado longe. Se as equipas **não avançam sem ti**, estás demasiado perto.

## Carreira

A trajetória varia muito por empresa, por país e por setor. Estes são os caminhos mais frequentes, não uma regra.

| Ponto de partida | Caminho habitual | Para onde pode ir |
|---|---|---|
| Developer | Developer sénior, depois Tech Lead | Software Architect ou Solution Architect |
| Software / Solution Architect | Responsabilidade crescente em alcance e impacto | Enterprise Architect, Principal Engineer (carreira técnica), ou gestão (Head of Architecture, CTO) |
| Especialista (cloud, dados, segurança) | Aprofundar uma área | Arquiteto dessa especialidade, ou alargar a solution architect |

Dois modelos de progressão que podes encontrar:

| Modelo | Ideia | Risco |
|---|---|---|
| **Carreira técnica (IC)** | Aumentas o alcance sem gerir pessoas | A empresa pode não ter degraus claros acima de arquiteto |
| **Carreira de gestão** | Passas a gerir equipas e orçamentos | Afastas-te da técnica |

**NOTA:** quem te avalia como arquiteto vai olhar, em boa parte, para as decisões que tomaste e para a forma como as comunicaste. Mantém o teu **portfólio de arquitetura** (ver módulo 00): mostra o raciocínio melhor do que uma lista de cargos.

## Depende da empresa

| Fator | Empresa pequena (como a Casa Nova) | Empresa grande |
|---|---|---|
| Número de arquitetos | Um, ou ninguém com o título | Vários, com especializações e níveis |
| Âmbito | Largo: desenho, escolhas de plataforma, parte de segurança e dados | Mais estreito e mais formal |
| Governação | Informal, decisões rápidas | Comités, padrões, revisões obrigatórias |
| Contacto com código | Frequente; o arquiteto continua a programar | Raro; o arquiteto delega |
| Autoridade | Vem da confiança pessoal | Pode vir do cargo, mas funciona melhor com confiança |
| Título | Muitas vezes é «Tech Lead» com funções de arquiteto | Títulos distintos para cada nível |

**DICA:** descobre cedo qual é a **autoridade real** da função na tua empresa: podes decidir, ou apenas recomendar? Quem pode dizer «não» a uma decisão tua? A resposta muda a forma como trabalhas.

## Erros comuns

- **Querer provar-se depressa:** propor grandes mudanças sem conhecer a história nem as pessoas.
- **Ignorar os developers:** desenhar sem validar com quem vai construir.
- **Não registar decisões:** o conhecimento fica na cabeça e perde-se.
- **Aprovar tudo ou recusar tudo:** os dois extremos retiram valor ao teu parecer.
- **Falar só de tecnologia:** com o negócio, fala de resultados, custos e riscos.
- **Esquecer a operação:** desenhar a solução e não pensar em quem a vai manter.
- **Tratar o título como autoridade:** a influência constrói-se com resultados e confiança.
- **Ficar sem medida de sucesso:** deixar de medir o teu impacto pelo código e não arranjar outra métrica (decisões registadas, equipas desbloqueadas, riscos evitados).

## Exercícios

**PRATICAR:** faz os exercícios **1 a 4** do módulo 15 (reflexão sobre as tuas decisões como developer, escolha do tipo de arquiteto, análise de um anti-padrão e plano dos primeiros 90 dias). Compara depois as tuas respostas com o gabarito do módulo 17.

## Fontes oficiais

- [Microsoft Azure Well-Architected Framework: manter um registo de decisões de arquitetura (ADR)](https://learn.microsoft.com/azure/well-architected/architect-role/architecture-decision-record)
- [Microsoft Azure Well-Architected Framework: colaboração do arquiteto com as equipas de workload](https://learn.microsoft.com/azure/well-architected/architect-role/collaboration)
- [Microsoft Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/)
- [The Open Group, TOGAF (arquitetura empresarial)](https://www.opengroup.org/togaf)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Architectural Decision Records (adr.github.io)](https://adr.github.io/)
- [The C4 model](https://c4model.com/)
