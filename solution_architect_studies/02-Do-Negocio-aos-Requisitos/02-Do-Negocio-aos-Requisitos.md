# 02 Do negócio aos requisitos

## Porque é que tudo começa nos requisitos

Um **requisito** é uma necessidade que a solução tem de satisfazer, escrita de forma que se possa verificar se foi satisfeita. A arquitetura é a resposta a esses requisitos: se os requisitos estiverem errados, vagos ou incompletos, uma arquitetura impecável resolve o problema errado.

O developer costuma receber os requisitos já prontos (uma tarefa, uma história de utilizador). O arquiteto tem de os **descobrir, questionar, medir e priorizar**, muitas vezes antes de existir qualquer tarefa. O percurso deste módulo:

    Stakeholders -> Discovery -> Requisitos (funcionais e qualidades)
        -> Restrições, pressupostos, riscos -> Prioridade -> Critérios de aceitação
        -> Conflitos entre qualidades (trade-offs) -> Documento de requisitos

**DICA:** a regra que mais poupa trabalho: **não aceites uma solução como requisito.** «Preciso de um botão para exportar para Excel» é uma solução. A necessidade por trás pode ser «a delegação reconcilia o stock ao fim do dia», e talvez a melhor resposta nem seja um botão.

## Stakeholders e o mapa poder/interesse

Um **stakeholder** é qualquer pessoa ou grupo que é afetado pela solução ou que pode influenciá-la. Esquecer um é a maneira clássica de descobrir um requisito tarde e caro (por exemplo, o responsável pela proteção de dados que aparece na véspera do arranque).

O **mapa poder/interesse** classifica-os em quatro quadrantes, para decidires quanto esforço de comunicação cada um merece:

| Poder | Interesse | Estratégia | Exemplo típico |
|---|---|---|---|
| Alto | Alto | **Gerir de perto**: envolver nas decisões | Patrocinador, responsável da área |
| Alto | Baixo | **Manter satisfeito**: consultar nos pontos que os afetam | Jurídico, segurança, finanças |
| Baixo | Alto | **Manter informado**: ouvir e dar feedback | Utilizadores finais, operadores |
| Baixo | Baixo | **Monitorizar**: esforço mínimo | Áreas com impacto marginal |

**ATENÇÃO:** poder baixo não significa impacto baixo. Os operadores de balcão não decidem o orçamento, mas se a solução lhes complicar o trabalho, o projeto falha na prática. O mapa serve para **gerir a comunicação**, não para decidir quem merece ser ouvido.

## Discovery: descobrir antes de desenhar

**Discovery** é a fase em que se compreende o problema antes de propor soluções. Combina-se mais do que uma técnica, porque cada uma vê uma parte da realidade:

| Técnica | Boa para | Limitação |
|---|---|---|
| Entrevista individual | Perceber motivações, dores e exceções | Cada pessoa vê só a sua parte |
| Workshop com várias áreas | Alinhar, descobrir conflitos cedo | Dominado por quem fala mais |
| Observação (acompanhar o trabalho) | Ver o que as pessoas fazem de facto, não o que dizem | Consome tempo |
| Análise de documentos e sistemas | Dados reais: tickets, relatórios, logs, volumes | Mostra o passado, não a intenção |
| Protótipo (ecrã desenhado) | Validar entendimento com algo visível | Pode parecer solução fechada |

**Perguntas-guia para entrevistas:**

- Qual é o problema que queres resolver, e como sabes que é um problema? Qual é o custo de não o resolver?
- Descreve-me a última vez que isto correu mal. O que aconteceu a seguir?
- Quem mais é afetado? Quem devia estar nesta conversa e não está?
- O que seria o sucesso daqui a um ano? Como o medirias?
- O que **não** pode mudar? O que já tentaram antes?

**DICA:** a técnica dos «cinco porquês» ajuda a passar do pedido à necessidade: pergunta «porquê?» sucessivamente até chegares a uma causa ou objetivo de negócio. Raramente precisas das cinco; o importante é não parar no primeiro pedido.

## Requisitos funcionais e não funcionais

| | Funcional | Não funcional (qualidade e restrições técnicas) |
|---|---|---|
| Responde a | **O que** o sistema faz | **Com que qualidade** o faz |
| Exemplo | «O cliente consulta o estado da encomenda» | «O estado aparece em menos de 2 s para 95% dos pedidos» |
| Quem costuma pedir | Utilizadores e negócio | Quase ninguém pede: **o arquiteto tem de perguntar** |
| Se falhar | A funcionalidade não existe | Existe, mas é lenta, insegura, cai ou é impossível de evoluir |

Convém distinguir três níveis, do mais abstrato ao mais concreto: **objetivo de negócio** (porquê), **necessidade do stakeholder** (o que a pessoa precisa) e **requisito da solução** (o que o sistema tem de fazer ou ser). O vocabulário exato varia entre referências (o guia BABOK, por exemplo, usa uma classificação própria): confirma o que a tua empresa usa.

**Um bom requisito é:**

- **Único** (diz uma coisa só) e **identificável** (tem um ID estável, como RF-03).
- **Verificável**: alguém consegue dizer, com um teste ou uma medição, se foi cumprido.
- **Sem solução embutida**: diz o quê, não o como (a não ser que o como seja uma restrição real).
- **Rastreável**: liga a um objetivo de negócio e a um stakeholder que o pediu.

**ATENÇÃO:** palavras como «rápido», «seguro», «fácil», «escalável» e «moderno» não são requisitos. São o início de uma pergunta: **rápido em que operação, para quantos utilizadores, medido como?**

## Atributos de qualidade e cenários mensuráveis

Um **atributo de qualidade** é uma propriedade do sistema para além da funcionalidade. A norma ISO/IEC 25010 organiza a qualidade do produto de software em características, entre as quais a adequação funcional, a eficiência de desempenho, a compatibilidade, a fiabilidade, a segurança, a manutenibilidade e a capacidade de interação (a revisão de 2023 renomeou algumas, por isso confirma a lista atual). Para o dia a dia, esta tabela de perguntas chega:

| Atributo | Pergunta que fazes ao negócio | Medida típica |
|---|---|---|
| Desempenho | Que operações têm de ser rápidas, com que carga? | Latência (percentil 95), pedidos por segundo |
| Disponibilidade | Quando é que parar custa dinheiro? Quanto? | % por mês, janelas de operação |
| Recuperação | Quanto tempo e quantos dados podes perder num desastre? | RTO e RPO |
| Escalabilidade | Que picos esperas (campanhas, fim do mês)? | Fator de pico suportado |
| Segurança | Que dados são sensíveis? Quem pode ver o quê? | Controlos, auditoria, prazos legais |
| Modificabilidade | Que mudanças são prováveis nos próximos 2 anos? | Esforço para fazer a mudança |
| Usabilidade | Quem usa, com que formação? | Taxa de sucesso e tempo de tarefa |
| Operabilidade | Quem opera e diagnostica problemas? | Tempo de deteção e de diagnóstico |

Para a disponibilidade, a documentação do Azure Well-Architected Framework dá a referência de quanto tempo de falha cada percentagem permite por mês:

| Objetivo | Falha tolerada por mês |
|---|---|
| 99% | cerca de 7,2 horas |
| 99,9% | cerca de 43 minutos |
| 99,95% | cerca de 21,6 minutos |
| 99,99% | cerca de 4,3 minutos |

**RTO** (recovery time objective) é o tempo máximo aceitável de indisponibilidade após um incidente. **RPO** (recovery point objective) é a perda máxima aceitável de dados, medida em tempo. **SLO** é um objetivo interno e mensurável; **SLA** é o compromisso contratual com consequências. Os detalhes de desenho ficam no módulo 08: aqui basta saber **perguntar** e **escrever**.

### O cenário de qualidade

A forma mais fiável de tornar uma qualidade mensurável é o **cenário de qualidade**, usado pelo SEI (Software Engineering Institute) e pelo modelo arc42. Tem seis partes:

| Parte | Pergunta | Exemplo (disponibilidade) |
|---|---|---|
| Fonte | Quem ou o que origina o evento? | O servidor SAP |
| Estímulo | O que acontece? | Fica indisponível |
| Ambiente | Em que condições? | Horário comercial, carga normal |
| Artefacto | Que parte do sistema é afetada? | O portal de encomendas |
| Resposta | O que o sistema faz? | Continua a aceitar encomendas e guarda-as numa fila |
| Medida da resposta | Como se verifica? | Nenhuma encomenda perdida; processadas até 15 min após o SAP voltar |

Escrito em frase: **«Quando o SAP fica indisponível em horário comercial, o portal continua a aceitar encomendas e processa-as todas até 15 minutos depois de o SAP voltar, sem perder nenhuma.»**

| Vago (inútil) | Cenário mensurável (útil) |
|---|---|
| «O portal tem de ser rápido» | «Com 200 utilizadores simultâneos, a consulta de stock responde em ≤ 2 s no percentil 95» |
| «Tem de ser seguro» | «Um utilizador de uma delegação só vê encomendas da sua delegação; 100% dos acessos a dados pessoais ficam registados» |
| «Tem de ser fácil de evoluir» | «Adicionar um novo método de entrega demora ≤ 5 dias úteis, sem alterar a integração com o SAP» |

**PRATICAR:** pega em cinco requisitos não funcionais do teu projeto atual e reescreve-os em cenários. Quando não conseguires preencher a «medida da resposta», encontraste uma pergunta que tens de levar ao negócio.

## Restrições, pressupostos, riscos e dependências

Além do que o sistema faz, o arquiteto regista o terreno onde a solução vai viver. Misturar estas categorias é um erro comum:

| Categoria | O que é | Quem decide | Exemplo |
|---|---|---|---|
| **Restrição** | Limite imposto que reduz as opções | Fora do teu controlo | Orçamento anual, RGPD, plataforma obrigatória |
| **Pressuposto** | Algo que assumes como verdadeiro sem o teres confirmado | Tu, até validares | «O SAP já expõe uma interface para stock» |
| **Risco** | Algo incerto que, se acontecer, prejudica | Gere-se: probabilidade e impacto | «O SAP não aguenta consultas a cada pedido» |
| **Dependência** | Algo de que precisas e que outro entrega | Outra equipa ou fornecedor | Disponibilidade do consultor SAP |

**ATENÇÃO:** um pressuposto não validado é um risco escondido. Regista cada pressuposto com **quem o valida e até quando**; os que ficam por validar viram riscos.

## Priorização com MoSCoW

Nunca há recursos para tudo. O **MoSCoW** (usado no DSDM, da Agile Business Consortium) classifica cada requisito para um dado prazo:

| Categoria | Significado | Regra prática |
|---|---|---|
| **Must have** | Sem isto a solução não pode entrar em produção | Cortar um Must faz o projeto falhar |
| **Should have** | Importante, mas a solução funciona com alternativa | Dói perder, mas aguenta-se |
| **Could have** | Desejável; primeiro a sair se o prazo apertar | É a reserva de contingência |
| **Won't have (desta vez)** | Acordado que **não** entra neste prazo | Registar evita que volte pela porta do cavalo |

A orientação do DSDM é que os Must have não passem de cerca de **60% do esforço** e que os Could have rondem 20%, para haver margem quando as estimativas falham. Contar requisitos não chega: conta o **esforço**.

**DICA:** o «Won't have (desta vez)» é a categoria mais política e mais útil. Dizer «não agora» por escrito, com o stakeholder presente, evita o «mas eu pensava que estava incluído» no fim.

## Critérios de aceitação

Um **critério de aceitação** diz, em termos verificáveis, quando um requisito está cumprido. É a ponte entre o arquiteto, quem constrói e quem testa. Há duas formas comuns: uma **lista de verificação** e o formato **Dado/Quando/Então** (Gherkin, com palavras-chave também em português):

    Funcionalidade: Consultar stock por delegação
      Cenário: Artigo com stock na delegação escolhida
        Dado um cliente autenticado no portal
        E o artigo 4711 com 35 unidades na delegação de Braga
        Quando o cliente consulta o artigo 4711 para Braga
        Então o portal mostra 35 unidades disponíveis
        E a informação tem no máximo 60 segundos de atraso face ao SAP

      Cenário: Artigo sem stock
        Dado o artigo 4711 sem unidades na delegação de Braga
        Quando o cliente consulta o artigo 4711 para Braga
        Então o portal mostra «sem stock» e indica as delegações com stock

**NOTA:** os critérios de aceitação são testáveis: cada «Então» devia poder virar um teste automático ou uma verificação manual com resultado claro. Se não consegues imaginar o teste, o requisito está vago.

## Trade-offs entre qualidades

As qualidades **competem entre si**: ganhar numa custa noutra. O arquiteto não procura o «melhor» desenho, procura o **menos mau para as prioridades do negócio** e deixa o compromisso explícito.

| Tensão | Porquê | Pergunta ao negócio |
|---|---|---|
| Segurança vs usabilidade | Mais controlos, mais fricção para o utilizador | Que fricção é aceitável para que dados? |
| Desempenho vs custo | Mais rapidez costuma pedir mais recursos | Quanto vale cada segundo ganho? |
| Disponibilidade vs custo | Cada «nove» extra exige redundância e operação | Quanto custa uma hora parada? |
| Dados frescos vs carga no sistema fonte | Consultar sempre o SAP dá dados exatos, mas sobrecarrega-o | Quanto atraso aceitas no stock? |
| Flexibilidade vs simplicidade | Preparar para tudo complica o que existe | Que mudanças são mesmo prováveis? |
| Prazo vs qualidade interna | Entregar depressa cria dívida técnica | Que dívida aceitas e quando a pagas? |

Para decidir, usa uma **árvore de qualidade** (utility tree, ou quality tree no arc42): lista as qualidades, desdobra-as em cenários e pede ao negócio que marque a importância de cada um. **Escolhe só as 3 a 5 qualidades dominantes**: se tudo é prioritário, nada é. Os cenários marcados como mais importantes e mais difíceis são os que **conduzem a arquitetura**; os módulos 03 e 04 mostram como justificar a escolha e registá-la num ADR.

## Exemplo trabalhado: requisitos da Casa Nova Distribuição

**Ponto de partida (do módulo 00):** encomendas online lentas, dados duplicados entre sistemas e falta de visibilidade de stock em tempo real. Os valores abaixo são **hipóteses do caso fictício**; num caso real, cada um sai de uma entrevista ou de dados medidos.

**1. Mapa de stakeholders**

| Stakeholder | Poder | Interesse | Estratégia |
|---|---|---|---|
| Diretor-geral (patrocinador) | Alto | Alto | Gerir de perto |
| Diretor comercial | Alto | Alto | Gerir de perto |
| Diretor financeiro | Alto | Médio | Manter satisfeito (orçamento) |
| Responsável de proteção de dados / jurídico | Alto | Baixo | Manter satisfeito (RGPD) |
| Equipa SAP / consultor externo | Médio | Alto | Gerir de perto (dependência crítica) |
| Gestores das 12 delegações | Médio | Alto | Manter informado e envolver |
| Operadores de balcão (apps Delphi) | Baixo | Alto | Manter informado, observar o trabalho |
| Clientes B2B (utilizadores do portal) | Médio | Alto | Entrevistas e protótipo |

**2. Objetivo de negócio:** reduzir o tempo de confirmação de encomendas e as ruturas descobertas só ao balcão, sem parar o SAP.

**3. Requisitos funcionais (lista inicial)**

| ID | Requisito | MoSCoW |
|---|---|---|
| RF-01 | Consultar o stock de um artigo por delegação, no portal e no balcão | Must |
| RF-02 | Um cliente autenticado cria uma encomenda com artigos, quantidades e delegação de levantamento ou entrega | Must |
| RF-03 | Validar disponibilidade e preço contratado do cliente (dados do SAP) antes de confirmar | Must |
| RF-04 | Uma encomenda confirmada chega ao SAP sem intervenção manual | Must |
| RF-05 | O cliente consulta o estado e o histórico das suas encomendas | Must |
| RF-06 | O balcão (Delphi) mostra o mesmo stock que o portal | Must |
| RF-07 | O gestor de delegação vê os artigos em rutura | Should |
| RF-08 | O cliente recebe notificação por email quando o estado muda | Should |
| RF-09 | O cliente repete uma encomenda anterior | Could |
| RF-10 | Deteção e fusão de clientes duplicados entre sistemas | Should |
| RF-11 | Pagamento online com cartão | Won't (desta vez) |
| RF-12 | Aplicação móvel nativa | Won't (desta vez) |

**4. Qualidades prioritárias (cenários)**

| ID | Qualidade | Cenário mensurável |
|---|---|---|
| QA-01 | Desempenho | Com 200 utilizadores simultâneos, a consulta de stock responde em ≤ 2 s (percentil 95) |
| QA-02 | Frescura dos dados | Uma alteração de stock no SAP aparece no portal em ≤ 60 s, em 99% dos casos |
| QA-03 | Disponibilidade | O portal está disponível 99,9% por mês, ou seja, tolera cerca de 43 min de falha |
| QA-04 | Resiliência | Com o SAP indisponível, o portal aceita encomendas e processa-as até 15 min após o regresso, sem perdas |
| QA-05 | Recuperação | Num desastre, o portal volta em ≤ 4 h (RTO) com perda máxima de 15 min de dados (RPO) |
| QA-06 | Segurança / RGPD | Cada utilizador só acede aos dados do seu perfil; todos os acessos a dados pessoais ficam registados |
| QA-07 | Escalabilidade | Num pico de campanha de 5 vezes a carga normal, a consulta de stock mantém-se ≤ 3 s |
| QA-08 | Modificabilidade | Adicionar um novo método de entrega demora ≤ 5 dias úteis, sem tocar na integração com o SAP |

**5. Restrições, pressupostos, riscos**

| Tipo | Item |
|---|---|
| Restrição | Orçamento limitado e equipa interna pequena; RGPD; o SAP atual não pode parar; as apps Delphi continuam em uso |
| Pressuposto | O SAP consegue expor stock e encomendas por uma interface suportada (validar com a equipa SAP, antes do desenho) |
| Pressuposto | Os clientes B2B aceitam usar um portal em vez do telefone (validar com 5 entrevistas) |
| Risco | O SAP não aguenta uma consulta por cada pedido de stock: impacto alto, probabilidade média |
| Risco | Os dados duplicados contaminam o portal desde o primeiro dia |
| Dependência | Consultor SAP disponível para a interface de encomendas |

**6. O trade-off que dá forma à arquitetura:** QA-01 e QA-02 pedem stock rápido e fresco; consultar o SAP a cada pedido dá exatidão, mas arrisca a restrição «o SAP não pode parar». O compromisso a levar ao negócio é aceitar até 60 s de atraso (QA-02) em troca de proteger o SAP e cumprir QA-01. A forma de o conseguir (cópia de leitura, eventos, cache) é matéria do módulo 05; aqui ficou o requisito que a justifica.

**7. Critérios de aceitação** de RF-01: os cenários Dado/Quando/Então da secção anterior, mais o teste de carga de QA-01.

## Modelo reutilizável: documento de requisitos

    1. Contexto e objetivo de negócio (3 a 5 linhas, com a medida de sucesso)
    2. Stakeholders (tabela: nome/papel, poder, interesse, estratégia)
    3. Âmbito (dentro / fora)
    4. Requisitos funcionais (ID, descrição, origem, MoSCoW, critérios de aceitação)
    5. Cenários de qualidade (ID, 6 partes, prioridade)
    6. Restrições  7. Pressupostos (quem valida, até quando)
    8. Riscos (probabilidade, impacto, resposta)  9. Dependências
    10. Trade-offs identificados e decisão do negócio
    11. Perguntas em aberto

**Lista de verificação antes de fechar:**

- Cada requisito tem ID, origem e teste possível?
- Cada qualidade tem um número e uma condição (carga, horário)?
- Os Must têm no máximo cerca de 60% do esforço?
- Há «Won't have» escritos e aceites pelo patrocinador?
- Cada pressuposto tem dono e data? Falaste com os utilizadores finais, e não só com quem paga?

## Depende da empresa

- **Empresa pequena ou informal:** os requisitos vivem numa página ou no quadro de tarefas. O essencial mantém-se: cenários com números e «Won't have» escritos.
- **Empresa grande ou regulada:** há modelos obrigatórios, aprovações formais e rastreabilidade exigida pela auditoria. Aprende o processo e usa o mesmo raciocínio dentro dele.
- **Equipas ágeis:** os requisitos vivem como histórias e critérios de aceitação, e o detalhe cresce por iterações. As qualidades continuam a precisar de ser definidas **cedo**, porque condicionam a arquitetura.
- **Com análise de negócio dedicada:** o analista levanta o funcional; ao arquiteto cabe sobretudo garantir os não funcionais, as restrições e os trade-offs.

## Erros comuns

- **Aceitar a solução como requisito** e nunca descobrir o problema real.
- **Falar só com quem paga**, ignorando quem usa o sistema todos os dias.
- **Deixar os não funcionais para o fim**, quando já só se descobre que o desenho não os permite.
- **Escrever «rápido», «seguro», «escalável»** sem número nem condição.
- **Tudo é Must**: sem prioridades honestas, qualquer atraso vira crise.
- **Pressupostos nunca validados**, que viram surpresas em produção.
- **Esconder os trade-offs** para não desagradar: o compromisso existe de qualquer maneira, só que ninguém o decidiu.

## Exercícios

**PRATICAR:** faz os exercícios **5 a 8** do módulo 15. Cobrem o mapa de stakeholders, a conversão de requisitos vagos em cenários mensuráveis, a priorização com critérios de aceitação e a resolução de um conflito entre qualidades.

## Fontes oficiais

- [arc42: requisitos de qualidade e cenários (secção 10)](https://docs.arc42.org/section-10/)
- [arc42: restrições (secção 2)](https://docs.arc42.org/section-2/)
- [SEI: Quality Attribute Workshops (QAW)](https://www.sei.cmu.edu/library/quality-attribute-workshops-qaws-third-edition/)
- [SEI: Architecture Tradeoff Analysis Method (ATAM)](https://www.sei.cmu.edu/library/the-architecture-tradeoff-analysis-method/)
- [ISO/IEC 25010: modelo de qualidade do produto (iso25000.com)](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010)
- [Azure Well-Architected: definir objetivos de fiabilidade (RTO, RPO, SLO)](https://learn.microsoft.com/azure/well-architected/reliability/metrics)
- [DSDM: priorização MoSCoW](https://www.agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html)
- [Cucumber: referência Gherkin](https://cucumber.io/docs/gherkin/reference/)
- [IIBA: BABOK Guide](https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/babok/)
- [Comissão Europeia: proteção de dados (RGPD)](https://commission.europa.eu/law/law-topic/data-protection_pt)
