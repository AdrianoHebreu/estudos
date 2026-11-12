# 12 Comunicação e liderança

## Porque a comunicação é metade da função

Uma arquitetura que só tu percebes não é uma arquitetura: é uma opinião. O Solution Architect produz valor através de **decisões que outros implementam, financiam ou aprovam**, e isso só acontece se essas pessoas as entenderem, concordarem (ou, pelo menos, aceitarem) e souberem o que fazer a seguir.

Neste módulo trabalhas as competências que o código não treina: adaptar a mensagem, apresentar à direção, conduzir revisões, influenciar sem mandar, negociar, dizer «não», facilitar, ensinar e documentar. Todas partem de uma pergunta antes de falares: **o que é que esta pessoa precisa de decidir ou de fazer depois de me ouvir?**

**NOTA:** estas técnicas são ferramentas, não fórmulas. O que funciona com um diretor financeiro numa multinacional pode falhar com o dono de uma PME. Por isso a secção «Depende da empresa» é aqui mais importante do que em qualquer outro módulo: lê-a com atenção.

## Adaptar a mensagem ao público

O mesmo desenho conta-se de cinco maneiras diferentes. A decisão é a mesma; muda o que destacas, a linguagem e o formato.

| Público | O que precisa de decidir | Quer ouvir | Evita | Formato típico |
|---|---|---|---|---|
| Direção | Aprovar investimento e risco | Problema de negócio, opções, custo, prazo, risco, recomendação | Siglas, detalhe técnico, «depende» sem recomendação | Uma página, 5 a 10 minutos, pedido explícito |
| Negócio (donos de processo) | Prioridades e regras de negócio | O que muda no dia a dia, o que ganham, o que têm de fazer e quando | Linguagem de infraestrutura, promessas de datas sem base | Exemplos concretos, cenários, maquetas |
| Equipas técnicas | Como construir e o que podem decidir sozinhas | Contexto, restrições, contratos entre componentes, o porquê | Impor sem explicar, esconder as restrições | Diagramas, ADRs, sessões de desenho, conversa |
| Segurança e conformidade | Se o risco é aceitável | Dados tratados, fronteiras de confiança, controlos, riscos residuais | Surpresas tardias, «depois vemos a segurança» | Diagrama com fronteiras, lista de controlos, registo de riscos |
| Fornecedores | Se conseguem cumprir | Requisitos claros, critérios de avaliação, restrições de integração | Requisitos vagos, ajudar um fornecedor com informação que outros não têm | Documento de requisitos, perguntas e respostas partilhadas |

**DICA:** antes de qualquer reunião, escreve numa linha: «No fim, quero que [pessoa] decida/faça [X]». Se não consegues escrever a frase, ainda não sabes o que vais pedir.

### Traduzir o mesmo facto para públicos diferentes

Facto técnico: o stock passa a ser publicado como eventos a partir do SAP, em vez de ser lido por sondagem de hora a hora.

| Público | Como dizes |
|---|---|
| Direção | «O stock visível online passa a refletir a realidade em minutos, não em horas. Isto reduz vendas perdidas por falsa rutura.» |
| Negócio | «Quando o armazém do Porto der saída de um artigo, o portal atualiza sem esperarem pelo ciclo da hora.» |
| Equipa técnica | «O SAP publica eventos de movimento de stock; o serviço de stock consome-os de forma idempotente e mantém a projeção de leitura.» |
| Segurança | «Os eventos não contêm dados pessoais; só referências de artigo e quantidades. O canal exige autenticação.» |

## A pirâmide: conclusão primeiro

A **pirâmide** (ideia popularizada por Barbara Minto) inverte a ordem natural de quem estudou: em vez de contares o caminho até à conclusão, **começas pela conclusão** e depois dás os argumentos que a sustentam.

    Recomendação: adotar a opção B (integração por eventos)
      ├─ Argumento 1: resolve o problema de stock em tempo real
      ├─ Argumento 2: custa menos de manter do que a opção A
      └─ Argumento 3: o risco é controlável com uma fase-piloto
           └─ Detalhe de cada argumento (só se perguntarem)

Quem decide quer a resposta primeiro e escolhe quanto detalhe pedir. Quem só tem 5 minutos não perde a decisão no meio de uma história.

### O one-pager de arquitetura

Um **one-pager** é uma página que resume uma solução para quem não vai ler o resto. Serve de porta de entrada: quem precisa de mais detalhe segue para os documentos do módulo 04.

| Bloco | Conteúdo | Dimensão |
|---|---|---|
| Problema | O que dói hoje, em termos de negócio | 2 a 3 linhas |
| Objetivo e métricas | O que muda e como se mede | 3 a 4 linhas |
| Solução em imagem | Um diagrama de contexto simples (C4 nível 1, módulo 04) | 1 figura |
| Opções consideradas | 2 a 3 alternativas, com a razão da escolha | Tabela curta |
| Custo e prazo | Ordem de grandeza e fases | 3 linhas |
| Riscos principais | Os 3 maiores e a mitigação | Lista curta |
| Decisão pedida | O que precisas, de quem e para quando | 1 linha |

## Apresentar uma solução à direção

A direção não avalia a tua arquitetura; avalia **se vale a pena investir**. Usa esta estrutura (cabe em 10 minutos mais perguntas):

1. **Contexto e problema** em linguagem de negócio, com um número ou um caso real.
2. **Resultado desejado**: o que fica diferente se correr bem.
3. **Opções** (incluindo «não fazer nada»), cada uma com custo, prazo e risco.
4. **Recomendação** e porquê.
5. **Riscos e como os controlas.**
6. **Pedido explícito**: decisão, orçamento da primeira fase, quem nomear.

### Exemplo: Casa Nova Distribuição

Cenário: apresentas à administração a modernização das encomendas e do stock. Todos os valores abaixo são **ilustrativos**.

    Título: Stock em tempo real e portal de encomendas

    1. Problema
       Os clientes veem stock desatualizado; perdemos encomendas
       e os balcões das delegações duplicam dados à mão.
       (Ilustrativo: «X encomendas perdidas por mês» — vai buscar
       o número real à equipa comercial antes de apresentar.)

    2. Resultado desejado
       Stock visível em minutos, encomendas online sem reintrodução
       de dados, SAP mantido como fonte de verdade.

    3. Opções
       A. Não fazer nada        custo 0       risco: a perda continua
       B. Remendar integrações  custo baixo   risco: dívida cresce
       C. Camada de integração  custo médio   risco: controlável em fases
          em Azure, por eventos

    4. Recomendação: C, em 3 fases, começando por 2 delegações.
       Porquê: resolve a causa (integração frágil) sem parar o SAP.

    5. Riscos: dependência de poucas pessoas conhecedoras do SAP
       (mitigação: documentar e formar); resistência nas delegações
       (mitigação: piloto e embaixadores).

    6. Pedido: aprovar a fase 1, nomear um responsável de negócio
       e libertar a equipa SAP 2 dias por semana durante 8 semanas.

**ATENÇÃO:** não escondas a opção «não fazer nada». Quando a direção a vê com custos, percebe que também é uma decisão, e a tua recomendação ganha credibilidade.

**DICA:** leva **uma página de apoio** (anexo) com detalhes técnicos para quem os pedir, mas não a mostres se ninguém perguntar. Preparares-te para as 3 perguntas mais difíceis (custo total, o que pode correr mal, quem faz o quê) vale mais do que polir os diapositivos.

## Conduzir revisões de arquitetura e comités

Uma **revisão de arquitetura** é uma conversa estruturada em que uma proposta é examinada por pessoas com perspetivas diferentes **antes** de ser construída. O **comité de arquitetura** (ou fórum) é a versão recorrente: um grupo que revê decisões relevantes de várias equipas.

| Modelo | Como funciona | Vantagem | Risco |
|---|---|---|---|
| Comité de aprovação | O grupo aprova ou rejeita propostas | Controlo e consistência | Fila de espera, gargalo, equipas contornam |
| Fórum de aconselhamento | A equipa decide e ouve o fórum antes | Autonomia com aprendizagem partilhada | Pode ser ignorado sem apoio da gestão |
| Revisão por pares (ADR) | Decisões escritas e comentadas por quem é afetado | Leve, deixa registo | Depende de disciplina de escrita |
| Revisão pontual | Só para projetos de risco ou de custo elevado | Pouco peso | Critério de entrada tem de ser claro |

Martin Fowler descreve uma alternativa a comités centrais: o **processo de aconselhamento** (advice process), em que quem decide pode ser qualquer pessoa, mas **tem de pedir conselho** a quem é afetado e a quem sabe, e regista a decisão. Vê a fonte no fim.

### Como correr uma revisão eficaz

1. **Antes:** a equipa envia o documento (one-pager, diagrama, ADR) com **dias** de antecedência; define-se o que se pede (aprovar, aconselhar, informar).
2. **Durante:** 5 minutos de contexto, depois perguntas. Começa pelo que está bem. Foca nos **riscos e nas qualidades** que importam (módulo 02), não em gostos de tecnologia.
3. **Depois:** registar decisões e ações com responsável e data, e partilhar em 24 horas.

    Perguntas-guia para uma revisão:
    - Que problema de negócio resolve? Como se mede o sucesso?
    - Que alternativas foram consideradas e porque foram postas de lado?
    - O que acontece quando o componente X falha? E sob carga?
    - Onde estão os dados pessoais e quem lhes acede?
    - Quem opera isto às 3 da manhã? Como se sabe que está bem?
    - Qual é o passo mais difícil de reverter?
    - Que decisões ficam em aberto e quem as toma?

**ATENÇÃO:** uma revisão não é um julgamento da pessoa. Critica a **proposta**, em voz de pergunta («o que acontece se...?»), e dá sempre a quem apresenta tempo para responder.

## Governação sem autoridade formal

Muitos arquitetos não são chefes de ninguém. A governação funciona se as pessoas **querem** seguir as orientações. As alavancas são:

| Alavanca | Como se concretiza |
|---|---|
| Valor | Facilitar a vida das equipas: modelos prontos, exemplos, caminhos «pavimentados» |
| Clareza | Princípios curtos e um catálogo do que é padrão, em vez de regras longas |
| Transparência | Decisões e razões registadas e visíveis (ADRs) |
| Confiança | Cumprir o que dizes, admitir erros, ouvir antes de prescrever |
| Patrocínio | Um responsável sénior que apoia quando há conflito |
| Proximidade | Estar disponível na fase de desenho, não só na revisão final |

**Princípio útil:** **guarda-corpos, não portões.** Define limites (segurança, dados pessoais, integração com o SAP) e deixa liberdade dentro deles. Quando uma equipa se desvia, pergunta primeiro **porquê**: pode ser que o padrão não sirva.

## Negociar e dizer «não» com alternativas

Negociar não é ganhar: é chegar a um acordo que ambas as partes conseguem cumprir. Prepara sempre quatro coisas: o que **realmente** precisas (interesse, não posição), o que é inegociável, o que podes dar e qual é a tua melhor alternativa se não houver acordo.

Dizer «não» a um pedido (por exemplo, «liga o portal diretamente à base de dados do SAP») é parte da função. Um «não» seco gera conflito; um «não» com alternativa gera conversa.

    Estrutura do «não» com alternativas:
    1. Reconhece o objetivo:  «Percebo que precisas de stock atualizado já.»
    2. Explica o risco:       «Ler diretamente da base do SAP pode
                              degradar o sistema e viola o suporte do fornecedor.»
                              (Confirma estes factos antes de os afirmares.)
    3. Oferece opções:        A. API/serviço oficial de leitura (2 semanas)
                              B. Réplica de leitura (6 semanas)
                              C. Atalho temporário, com prazo e dono
    4. Recomenda e pergunta:  «Sugiro A. Serve para o teu caso?»

| Situação | Em vez de | Experimenta |
|---|---|---|
| Pedido fora de prazo | «Não dá.» | «Dá para X até dia 15; Y fica para a fase 2. Qual preferes primeiro?» |
| Equipa quer tecnologia nova | «Não é o nosso standard.» | «Que problema resolve que o atual não resolve? Fazemos uma prova de conceito limitada?» |
| Negócio quer tudo | «Não há orçamento.» | «Se tiver de escolher três, quais? O resto entra na fase seguinte.» |
| Fornecedor empurra a sua solução | «Não nos interessa.» | «Mostra-me como cumpre estes cinco requisitos, com o mesmo formato que os outros.» |

## Gerir conflitos e expectativas

Os conflitos em arquitetura costumam ser sobre **prioridades** (segurança vs velocidade, custo vs qualidade), não sobre pessoas. Antes de reagir, identifica de que tipo é:

| Tipo | Sintoma | Resposta |
|---|---|---|
| Factos | Dizem coisas diferentes sobre o sistema | Verificar juntos (medir, testar, ler a documentação) |
| Objetivos | Cada um otimiza algo diferente | Tornar os critérios explícitos e ordená-los com quem decide |
| Método | Concordam no fim, discordam no caminho | Provas de conceito curtas, decisão com prazo |
| Pessoal | Desconfiança, histórico | Conversa a dois, sem plateia; envolver um mediador se preciso |

**Gerir expectativas** é, sobretudo, dizer cedo o que é difícil: **o que a solução faz e não faz**, que parte é incerta, o que depende de terceiros. Fala em **intervalos** e em **fases**, não em datas únicas, e revê quando aprenderes algo novo. Quem foi avisado cedo reage melhor do que quem descobre tarde.

**DICA:** quando a discussão aquece, volta aos **requisitos e aos atributos de qualidade** do módulo 02: «qual é o requisito que esta decisão serve?» muda a conversa de opinião para critério.

## Facilitar workshops

Um workshop bem facilitado produz decisões e compromisso; um mal facilitado é uma reunião longa. O facilitador **não impõe o conteúdo**: guarda o processo.

| Fase | O que fazes | Exemplo |
|---|---|---|
| Preparar | Objetivo claro, participantes certos, material | «No fim, escolhemos 3 casos de uso para a fase 1.» |
| Abrir | Regras e agenda | Telemóveis fora, todas as vozes contam |
| Divergir | Recolher ideias sem as criticar | Notas individuais antes de discutir |
| Convergir | Agrupar, priorizar, decidir | Votação por pontos, matriz impacto/esforço |
| Fechar | Decisões, responsáveis, datas | Resumo lido em voz alta |

Dicas práticas: escreve primeiro sozinho e discute depois (evita que o mais barulhento decida); usa quadros ou desenhos partilhados; reserva tempo para o que fica por decidir e quem o decide. Em sessões de desenho com o negócio, desenha **em conjunto** o diagrama de contexto: erros de entendimento aparecem logo.

## Mentoria às equipas

O arquiteto multiplica-se **ensinando**. Mentoria não é dar respostas: é ajudar a equipa a decidir melhor sozinha.

- **Pergunta antes de dizer:** «que opções consideraste?», «o que acontece se isto falhar?»
- **Mostra o raciocínio**, não só a conclusão: explica o trade-off para que possam repeti-lo.
- **Revê em pares** desenhos e ADRs, e elogia as boas decisões com a mesma clareza com que apontas falhas.
- **Cria espaços recorrentes:** uma sessão mensal de desenho, um repositório de exemplos, um canal para dúvidas de arquitetura.
- **Delega decisões** de baixo risco e fica disponível para as de alto risco.

**DICA:** quando uma equipa te traz um problema, resiste a resolvê-lo de imediato. Pergunta o que decidiriam; muitas vezes já têm a resposta, só procuram confirmação.

## Documentar como forma de comunicar

A documentação é comunicação **assíncrona**: chega a quem não estava na sala e sobrevive a quem sai da empresa. Os diagramas e os ADRs (módulo 04) são o formato; aqui interessa o **propósito e o público**.

| Documento | Para quem | Para quê |
|---|---|---|
| One-pager | Direção, negócio | Decidir |
| ADR | Equipas, futuros arquitetos | Saber porquê, não só o quê |
| Diagramas C4 | Equipas, segurança | Perceber estrutura e fronteiras |
| Guia de integração | Equipas e fornecedores | Usar contratos e exemplos |
| Registo de riscos | Direção, segurança | Acompanhar e decidir |

Regras: escreve para **quem vai ler**, começa pela conclusão, usa exemplos, mantém curto e **tem dono e data de revisão**. Documentação desatualizada engana mais do que a falta dela. Guarda-a perto do código ou onde as equipas já trabalham (um repositório, um wiki), e liga-a em vez de a copiar.

## Modelos reutilizáveis

    Preparar uma comunicação (lista de verificação):
    [ ] Quem é o público e o que precisa de decidir ou fazer?
    [ ] Qual é a minha conclusão numa frase?
    [ ] Que três argumentos a sustentam, com evidência?
    [ ] Que perguntas difíceis vão fazer e que resposta tenho?
    [ ] Que opções apresento (incluindo não fazer nada)?
    [ ] Qual é o pedido explícito e o prazo?
    [ ] O que vou registar depois, e para quem envio?

    Registo de uma revisão de arquitetura:
    Data / Participantes / Proposta (ligação)
    Decisões tomadas | Ações (responsável, data) | Riscos novos
    Pontos em aberto e quem decide | Próxima revisão

## Depende da empresa

Esta aula descreve práticas comuns, mas **quase tudo aqui depende da cultura, da dimensão e da maturidade da organização**. Observa antes de aplicares.

| Dimensão | Empresa pequena / PME | Empresa média | Grande organização |
|---|---|---|---|
| Quem decide | Muitas vezes o dono ou um diretor; decisões rápidas e pessoais | Direção e responsáveis de área, com alguma formalização | Comités, níveis de aprovação, orçamentos anuais |
| Formato com a direção | Conversa direta, mensagem curta, às vezes por escrito informal | Reunião com uma página de apoio | Documento formal, modelo obrigatório, ciclo de aprovação |
| Comités de arquitetura | Raramente existem; o arquiteto aconselha | Fórum leve, por vezes só de pedido | Formais, com calendário, critérios e atas |
| Autoridade do arquiteto | Informal, por confiança e proximidade | Parcial: recomenda e pode ser sobreposto | Pode ter poder de veto ou de aprovação em certos temas |
| Cultura de conflito | Evita-se; resolve-se em privado | Mista | Escalamento hierárquico habitual |
| Documentação exigida | Mínima e útil | Moderada, ADRs e diagramas | Extensa, auditável, modelos fixos |
| Ritmo | Resposta em dias | Semanas | Meses por ciclo de planeamento |

Perguntas para descobrires a tua realidade:

- Quem **realmente** decide e quem influencia quem decide? (nem sempre coincide com o organigrama)
- Como são aprovados investimentos: por projeto, por orçamento anual, por nível de valor?
- Existem comités, modelos ou padrões obrigatórios? Quem os mantém?
- Que tom é normal em reuniões: direto ou diplomático? Formal ou informal?
- Qual é o meu mandato por escrito? O que posso decidir, recomendar ou só informar?
- Em que ponto a empresa aceita um «não», e com que tipo de justificação?

**NOTA:** culturas diferentes têm graus diferentes de franqueza. Em algumas, discordar abertamente numa reunião é sinal de empenho; noutras, é falta de respeito e deve fazer-se a dois. Observa como os colegas respeitados fazem e adapta o teu estilo, sem perderes a honestidade técnica.

## Erros comuns

- **Começar pelos detalhes técnicos** em vez de pela conclusão e pelo pedido.
- **Usar a mesma apresentação para todos**: a direção não precisa do diagrama de sequência.
- **Evitar dar uma recomendação** («depende») por receio de errar: o papel pede posição, com os riscos à vista.
- **Dizer «não» sem alternativa**, ou ceder a tudo por querer agradar.
- **Impor decisões** sem explicar o porquê e sem ouvir quem vai implementar.
- **Aparecer só no fim** para revisões e travar o que já está feito.
- **Esconder más notícias** até ser tarde: avisa cedo, com opções.
- **Documentar para o arquivo**, não para o leitor; e deixar a documentação envelhecer sem dono.
- **Copiar o modelo de outra empresa** sem perceber a cultura da tua.
- **Confundir autoridade com influência**: sem poder formal, ganhas pela utilidade e pela confiança.

## Exercícios

**PRATICAR:** os exercícios deste módulo são os **45, 46, 47 e 48** do módulo 15 (adaptar a mensagem a públicos diferentes, one-pager para a direção, guião de uma revisão de arquitetura e negociar um «não» com alternativas). Faz-os por escrito e compara depois com o gabarito (módulo 17).

## Fontes oficiais

- [Azure Well-Architected Framework: Architect collaboration with workload teams](https://learn.microsoft.com/azure/well-architected/architect-role/collaboration)
- [Azure Well-Architected Framework: Maintain an architecture decision record (ADR)](https://learn.microsoft.com/azure/well-architected/architect-role/architecture-decision-record)
- [Martin Fowler: Scaling the Practice of Architecture, Conversationally](https://martinfowler.com/articles/scaling-architecture-conversationally.html)
- [The Architect Elevator (Gregor Hohpe)](https://architectelevator.com/)
- [Architectural Decision Records](https://adr.github.io/)
- [The C4 model](https://c4model.com/)
- [arc42: modelo de documentação de arquitetura](https://arc42.org/)
- [Diátaxis: estrutura para documentação técnica](https://diataxis.fr/)
- [Write the Docs: Docs as code](https://www.writethedocs.org/guide/docs-as-code/)
