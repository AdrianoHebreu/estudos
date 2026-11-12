# 17 Gabarito

Respostas-modelo e critérios de autoavaliação dos exercícios do módulo 15. **Em arquitetura raramente há uma só resposta certa**: o que conta é a justificação, os compromissos assumidos e a coerência com os requisitos. Compara o teu raciocínio com o das respostas-modelo, e não só a conclusão.

## Módulo 01 · O papel do Solution Architect

### Exercício 1

Resposta-modelo para as três decisões da Casa Nova.

| | Decisão 1: cópia noturna do stock | Decisão 2: regra de desconto no Delphi | Decisão 3: ficheiro semanal de clientes |
|---|---|---|---|
| **Alternativas consideradas** | Nenhuma. Alternativas possíveis: consulta direta ao SAP por uma interface própria, cópia mais frequente, cache com expiração curta | Nenhuma. Alternativa: pedir a regra à equipa SAP e consumi-la | Nenhuma. Alternativas: integração automática, exportação agendada |
| **Quem foi afetado e se foi ouvido** | Vendedores (stock com até 24 h de atraso), logística (promessas sem stock), equipa SAP (não foi avisada) | Clientes (preços diferentes entre balcão e portal), financeiro (margens), equipa SAP | Equipa do portal (dados desatualizados), RGPD/segurança (ficheiro com dados pessoais a circular) |
| **Onde ficou registada** | Em lado nenhum | Só no código | Num email |
| **Custo suportado por outros** | Discussões sobre «qual é o stock certo»; outras aplicações já dependem da cópia | Regras duplicadas que divergem; correções em dois sítios | Retrabalho manual; risco de fuga de dados |
| **Reversível?** | Parcialmente (há dependências) | Sim, mas com migração de regras | Sim, mas com custo organizacional |

Reflexão-modelo (o que farias diferente):

    1. Antes de decidir, listava as alternativas e quem seria afetado.
    2. Falava com a equipa dona do dado (SAP) em vez de contornar.
    3. Escrevia um ADR curto de meia página, acessível a quem vier depois.

Em todas as três, o padrão é o mesmo: a decisão era **razoável dentro do âmbito do developer** (resolver o problema à mão), mas o seu alcance era maior do que o código. O arquiteto olha para esse alcance antes de decidir.

Critérios de autoavaliação:

- Cada decisão tem alternativas e afetados identificados, mesmo que a resposta seja «nenhuma considerada».
- Distinguiste custo para ti de custo para outros.
- Não concluíste que decidiste mal, mas que faltava informação ou registo.
- A reflexão final tem ações concretas, não apenas «ser mais cuidadoso».

### Exercício 2

| N.º | Tipo que lidera | Justificação | Consultar |
|---|---|---|---|
| a | **Enterprise architect** | Decide estratégia e portefólio de sistemas a vários anos, na empresa inteira | Solution architect, direção |
| b | **Software / technical architect** | Estrutura interna de um serviço: módulos, camadas, dependências | Solution architect (para as fronteiras com outros sistemas) |
| c | **Cloud architect** | Organização de subscrições, redes e custos é governação da plataforma | Security architect |
| d | **Data architect** | Fonte de verdade e circulação do dado entre sistemas | Solution architect, equipa SAP |
| e | **Security architect** | Autenticação, controlos e proteção de dados pessoais | Data architect, jurídico/DPO |

Numa empresa de 400 colaboradores com TI pequena, é **improvável** ter seis arquitetos. O normal é uma ou duas pessoas acumularem vários chapéus: o solution architect cobre o desenho global e partes de cloud, dados e segurança, apoiado por especialistas internos ou externos. O risco é a superficialidade em áreas críticas (sobretudo segurança e RGPD) e a sobrecarga. Mitigações: identificar as áreas em que a empresa **não** tem competência suficiente, recorrer a consultoria pontual e usar listas de verificação e revisão por pares.

Critérios de autoavaliação:

- Associaste cada necessidade ao nível certo (estratégia, solução, componente, plataforma, dados, segurança).
- Reconheceste que as especialidades se sobrepõem e indicaste quem consultar.
- Mencionaste o risco real de acumular papéis, e não apenas que «é possível».

### Exercício 3

**1. Anti-padrões reconhecidos**

| Anti-padrão | Evidência na situação |
|---|---|
| Arquiteto-bottleneck | «Todas as integrações com o SAP têm de passar por ele», quinze pedidos pendentes, duas semanas de espera |
| Torre de marfim | Responde com um PowerPoint, não acompanha as equipas, só descobre a ligação quando há um incidente |
| Arquiteto de diagramas | A resposta a cada pedido é um desenho, não uma decisão acompanhada |
| (Atitude) | «Se tivessem esperado pelo meu desenho...» culpa as equipas em vez de rever o processo |

**2. Consequências**

| Já ocorreram | Podem ocorrer |
|---|---|
| Equipa do portal contornou a arquitetura | Outras equipas copiarem o atalho |
| Incidente em produção por uma ligação não documentada | Dados inconsistentes, problemas de segurança e RGPD |
| Perda de confiança nas equipas | Atrasos acumulados, arquiteto desligado da realidade |

**3. Três mudanças propostas**

1. **Definir princípios e padrões de integração com o SAP** (por exemplo, «as integrações usam os pontos de acesso aprovados, nunca ligação direta à base de dados do ERP»), publicados e acessíveis. As equipas decidem dentro deles sem pedir autorização.
2. **Reservar a aprovação pessoal para o que é caro de reverter ou de alto risco** (dados pessoais, novos pontos de integração com o ERP), e deixar o resto às equipas, com um registo ADR curto.
3. **Estar presente com as equipas:** uma hora semanal de atendimento aberto e participação nas revisões de desenho, para ouvir o problema antes do prazo apertar, e responder em dias, não em semanas.

**4. Indicadores**

- Tempo médio de resposta a pedidos de arquitetura (de duas semanas para poucos dias).
- Número de integrações não documentadas ou fora dos padrões, que deve descer.
- Número de decisões registadas em ADR.
- Satisfação das equipas (pergunta simples, trimestral).

Critérios de autoavaliação:

- Identificaste dois anti-padrões com evidência no texto.
- As mudanças propostas reduzem o bloqueio **sem** abdicar de controlo sobre o que é crítico.
- Os indicadores são mensuráveis e não se reduzem a «mais reuniões».

### Exercício 4

Resposta-modelo (para a Casa Nova Distribuição, a adaptar).

**Dias 1 a 30: ouvir e mapear**

| Pessoa / grupo | Pergunta principal |
|---|---|
| Direção comercial | Qual é a dor de negócio mais cara hoje? |
| Logística | Onde falha mais a informação de stock? |
| Equipa SAP | Que dados e regras são do ERP e o que é que não se pode tocar? |
| Developers Delphi | O que ninguém quer mexer e porquê? |
| Segurança / RGPD | Que dados pessoais circulam e onde? |
| Infraestrutura | O que temos hoje em servidores e o que está previsto? |

Artefactos: **mapa de sistemas e integrações** (estado atual, rascunho) e **lista de decisões já tomadas** com o que se sabe do porquê.

**Dias 31 a 60: primeiras contribuições**

- Contribuição pequena: rever o desenho de uma integração em curso com perguntas, apresentando duas alternativas, sem impor.
- Primeiro ADR: «Fonte de verdade para o stock» (SAP como fonte, com cópia para consulta), com o que se decidiu e o que se aceitou como compromisso.

**Dias 61 a 90: assumir uma peça**

- Peça: desenho da camada de integração entre o portal de encomendas e o SAP.
- Apresentação: à direção, ao PM e aos tech leads.
- Decisão pedida: aprovar a opção recomendada e o orçamento para uma prova de conceito.

**Riscos e mitigação**

| Risco | Mitigação |
|---|---|
| Ser visto como quem critica o passado | Perguntar «porquê?» antes de propor, reconhecer o contexto das decisões antigas |
| Querer abraçar demasiado | Concentrar-me numa peça no terceiro mês e dizer «não» ao resto |
| Ficar longe das equipas | Reservar um período fixo por semana para estar com os developers |

**Medição aos 90 dias:** pelo menos um ADR aprovado; o mapa de sistemas validado por quem opera; a peça de arquitetura entregue com recomendação aceite; feedback de pelo menos três stakeholders sobre a clareza das minhas comunicações.

**Perguntas ao responsável (semana 1):** Posso decidir ou apenas recomendar? Quem pode vetar uma decisão de arquitetura? Como e quando avaliamos o meu progresso?

Critérios de autoavaliação:

- O plano tem ações datadas, pessoas concretas e artefactos, e não apenas intenções.
- O período inicial privilegia ouvir e mapear antes de propor.
- A medição não depende de volume de código ou de diagramas.
- Os riscos incluem o fator humano, não apenas o técnico.

## Módulo 02 · Do negócio aos requisitos

### Exercício 5

**1 e 2. Stakeholders e mapa** (os níveis de poder e interesse são hipóteses razoáveis; o importante é a justificação)

| Stakeholder | Poder | Interesse | Estratégia |
|---|---|---|---|
| Diretor-geral (patrocinador) | Alto | Alto | Gerir de perto |
| Diretor comercial | Alto | Alto | Gerir de perto |
| Diretor financeiro | Alto | Médio | Manter satisfeito (custo e orçamento) |
| Responsável de logística / chefe da frota | Médio | Alto | Gerir de perto (é quem cumpre a promessa) |
| Gestores das delegações (armazéns) | Médio | Alto | Manter informado e envolver |
| Motoristas e armazenistas | Baixo | Alto | Manter informado, observar o trabalho |
| Transportadores subcontratados | Médio | Médio | Manter satisfeito (contratos, integração) |
| Clientes B2B (quem recebe a entrega) | Médio | Alto | Entrevistas e protótipo |
| Jurídico / proteção de dados | Alto | Baixo | Manter satisfeito (moradas, contactos, RGPD) |
| Equipa SAP / consultor | Médio | Alto | Gerir de perto (dependência) |
| Apoio ao cliente | Baixo | Alto | Manter informado (recebe as reclamações) |
| Seguradora / responsabilidade da carga | Baixo | Baixo | Monitorizar (rever se o risco mudar) |

**3. Perguntas de discovery** (exemplos)

- **Chefe da frota:** «Descreve-me o último dia em que uma entrega falhou a hora marcada. O que aconteceu e quem soube primeiro?»
- **Diretor financeiro:** «Que valor anual está disponível e que poupança ou receita faria este serviço valer a pena? Como a vais medir?»
- **Cliente B2B:** «Que janelas de entrega usam hoje e o que acontece quando o camião chega e não há ninguém para receber?»

**4. O enganador «poder baixo».** Motoristas e armazenistas não decidem nada formalmente, mas são quem sabe como o trabalho se faz de facto (acessos, horários, exceções) e quem pode contornar a solução se ela atrapalhar. Uma janela de entrega que o armazém não consegue preparar a tempo falha na prática, seja qual for o plano.

**Critérios para te avaliares:** incluíste pelo menos três stakeholders fora da TI e do negócio direto (jurídico, subcontratados, apoio ao cliente)? Cada estratégia tem justificação, e não só uma etiqueta? As perguntas são abertas e ligadas a um problema real, e não perguntas de sim/não?

### Exercício 6

Hipóteses assumidas: 200 utilizadores simultâneos em hora de ponta; dia de trabalho das 07h às 21h; a Casa Nova considera o portal importante, mas não um serviço de vida ou morte.

**a) «Rápido» (desempenho)**
- Perguntas: Que operações? (consulta de stock, pesquisa, confirmação de encomenda). Com quantos utilizadores em simultâneo? Qual é o tempo a partir do qual o cliente desiste?
- Cenário: *Fonte:* cliente autenticado. *Estímulo:* pede a consulta de stock de um artigo. *Ambiente:* hora de ponta, 200 utilizadores simultâneos. *Artefacto:* portal de encomendas. *Resposta:* mostra a quantidade disponível por delegação. *Medida:* ≤ 2 s no percentil 95.

**b) «Nenhuma encomenda perdida» (fiabilidade / integridade)**
- Perguntas: Perdida em que momento (antes ou depois de confirmada ao cliente)? Se o SAP estiver em baixo, aceitamos a encomenda na mesma? Quem resolve duplicados?
- Cenário: *Fonte:* cliente. *Estímulo:* confirma uma encomenda. *Ambiente:* SAP indisponível. *Artefacto:* portal e integração com o SAP. *Resposta:* a encomenda fica guardada de forma durável e é enviada ao SAP quando ele volta, uma só vez. *Medida:* 0 encomendas confirmadas perdidas ou duplicadas; entrega ao SAP ≤ 15 min após o regresso.

**c) «Sempre disponível» (disponibilidade)**
- Perguntas: Quando é que parar custa dinheiro (horário, épocas)? Quanto vale uma hora parada? Quanto está o negócio disposto a pagar por cada «nove» extra?
- Cenário: *Fonte:* o utilizador. *Estímulo:* tenta usar o portal. *Ambiente:* operação normal, 07h-21h. *Artefacto:* portal. *Resposta:* o serviço responde. *Medida:* disponibilidade ≥ 99,9% por mês (cerca de 43 minutos de falha tolerada).
- Para o diretor: «Sempre» não existe: cada nível a mais custa redundância e operação. Em 99,9% toleramos cerca de 43 minutos de falha por mês; para 99,99% seriam cerca de 4 minutos, e o custo sobe: por isso escolhemos o valor com base no que uma hora parada te custa.

**d) «Seguro por causa do RGPD» (segurança / conformidade)**
- Perguntas: Que dados pessoais guardamos e porquê? Quem pode ver o quê? Como respondemos a pedidos de acesso ou apagamento? Por quanto tempo se guardam? O que diz o responsável de proteção de dados?
- Cenário: *Fonte:* utilizador interno ou externo. *Estímulo:* tenta aceder a dados pessoais de um cliente. *Ambiente:* operação normal. *Artefacto:* portal e base de dados de clientes. *Resposta:* só acede quem tem perfil autorizado para esse cliente; o acesso é registado. *Medida:* 0 acessos fora do perfil nos testes; 100% dos acessos a dados pessoais com registo (quem, quando, o quê).

**e) «Novos canais sem refazer tudo» (modificabilidade)**
- Perguntas: Que canais são prováveis nos próximos dois anos (marketplace, app, EDI)? Quem os faria e com que equipa? Qual é o esforço aceitável?
- Cenário: *Fonte:* o negócio. *Estímulo:* pede um novo canal de venda. *Ambiente:* sistema em produção. *Artefacto:* camada de encomendas e integração. *Resposta:* a equipa acrescenta o canal reutilizando as regras existentes de preço e stock. *Medida:* ≤ 20 dias úteis, sem alterar a integração com o SAP.

**Critérios para te avaliares:** cada cenário tem número **e** condição (carga, horário, estado do sistema)? As perguntas procuram a necessidade de negócio e não só o valor? Marcaste os valores como hipóteses a validar? Explicaste «sempre» sem prometer o impossível?

### Exercício 7

**1. MoSCoW** (capacidade de 260 dias-pessoa; Must ≤ cerca de 156)

| ID | Requisito | Esforço | MoSCoW | Justificação |
|---|---|---|---|---|
| R1 | Stock por delegação | 30 | Must | É o problema central (visibilidade) |
| R2 | Criar encomenda | 50 | Must | Sem isto não há portal |
| R3 | Preço e disponibilidade (SAP) | 40 | Must | Evita encomendas inválidas |
| R4 | Enviar encomenda ao SAP | 45 | Must | Sem integração a encomenda é trabalho manual |
| R5 | Estado e histórico | 25 | Should | Importante, mas o cliente pode ligar para saber, como hoje |
| R6 | Notificações por email | 15 | Could | Reduz chamadas, mas não bloqueia |
| R7 | Repetir encomenda | 10 | Could | Comodidade |
| R8 | Painel de ruturas | 30 | Should | Valor interno claro, pode seguir logo após o arranque |
| R9 | Pagamento online | 60 | Won't (desta vez) | Caro; clientes B2B já têm crédito e faturação |
| R10 | Fusão de duplicados | 45 | Should | Resolve um problema real, mas pode começar por uma limpeza manual |

**2. Proporções:** Must = 30 + 50 + 40 + 45 = **165** dias (cerca de 63% de 260). Should = 25 + 30 + 45 = **100**. Could = 15 + 10 = **25** (cerca de 10%). Won't = 60 (fora do cálculo). Must + Should + Could = 290, acima dos 260: **os Should e Could não cabem todos**. Os Must (165) ficam ligeiramente acima do limite de 60% (156), o que é uma **bandeira amarela**: só se aceita se as estimativas forem muito fiáveis. Proposta: entregar os Must; o R5 (25) entra se as estimativas se confirmarem; o R10 e o R8 passam para a fase seguinte; os Could são a reserva.

**3. Critérios de aceitação para R3**

    Funcionalidade: Validar disponibilidade e preço contratado
      Cenário: Encomenda com preço contratado e stock suficiente
        Dado um cliente com preço contratado de 12,50 EUR para o artigo 4711
        E 35 unidades do artigo 4711 na delegação de Braga
        Quando o cliente pede 20 unidades para levantar em Braga
        Então o portal mostra o preço de 12,50 EUR por unidade
        E aceita a linha de encomenda

      Cenário: Quantidade pedida superior ao stock
        Dado 35 unidades do artigo 4711 na delegação de Braga
        Quando o cliente pede 50 unidades para levantar em Braga
        Então o portal não confirma a linha
        E mostra o stock disponível e as delegações alternativas

**4. Parágrafo ao diretor-geral:** «Com seis meses e a equipa atual, entregamos o essencial: consultar stock, criar encomendas, validar preços e disponibilidade e enviá-las ao SAP sem trabalho manual. Ficam para a fase seguinte o painel de ruturas e a fusão de clientes duplicados; o pagamento online fica fora porque os clientes B2B já faturam a crédito. O estado das encomendas só entra se as estimativas se confirmarem. Se quiseres manter tudo, a alternativa é aumentar a equipa ou o prazo.»

**Critérios para te avaliares:** os Must dependem entre si e formam um fluxo utilizável de ponta a ponta? Verificaste a proporção em **esforço**, e não em número de itens? Os critérios de aceitação são testáveis (valores concretos)? A mensagem à direção diz o que se perde e dá alternativas?

### Exercício 8

**1. Qualidades em conflito:** **frescura/exatidão dos dados** (comercial) contra **disponibilidade e desempenho do SAP**, sistema legado em que o resto depende (equipa SAP).

- Cenário A (comercial): *Fonte:* cliente. *Estímulo:* consulta o stock. *Ambiente:* hora de ponta. *Artefacto:* portal. *Resposta:* mostra a quantidade. *Medida:* diferença para o SAP ≤ 60 s em 99% dos casos (hipótese a validar: o negócio pediu «exato»).
- Cenário B (SAP): *Fonte:* portal. *Estímulo:* consultas de stock. *Ambiente:* hora de ponta, 200 utilizadores e 12 balcões. *Artefacto:* SAP. *Resposta:* mantém o tempo de resposta atual. *Medida:* a carga adicionada pelo portal ao SAP ≤ valor combinado com a equipa SAP (por exemplo, ≤ 5% das operações), e 0 paragens causadas pelo portal.

**2. Árvore de qualidade**

| Qualidade | Cenário | Importância |
|---|---|---|
| Disponibilidade do SAP (restrição) | O portal não causa paragens nem lentidão do SAP | Alta |
| Frescura do stock | Atraso ≤ 60 s, 99% | Alta |
| Desempenho do portal | Consulta ≤ 2 s (p95) com 200 utilizadores | Alta |
| Integridade das encomendas | Nenhuma encomenda confirmada perdida | Alta |
| Modificabilidade | Novo canal ≤ 20 dias úteis | Média |

**3. Compromissos possíveis (a nível de requisito)**

| Opção | O que o negócio aceita | Ganha | Perde | Risco |
|---|---|---|---|---|
| 1. Frescura de até 60 s, confirmação final no SAP | Consulta aproximada; a confirmação valida contra o SAP | Comercial e SAP | Exatidão perfeita na consulta | Cliente vê 10 e, ao confirmar, há 8: tratar na mensagem |
| 2. Frescura de 5 minutos | Dados mais antigos, carga mínima | SAP | Comercial | Mais ruturas descobertas na confirmação |
| 3. Consulta direta ao SAP em artigos críticos, aproximada nos restantes | Dois níveis de exatidão | Comercial nos artigos críticos | Complexidade | Escolher mal os críticos; carga imprevisível |

**4. Proposta (opção 1):** «O portal mostra um stock com atraso máximo de 60 segundos e, ao confirmar a encomenda, o sistema valida o stock no SAP: o cliente nunca recebe uma confirmação falsa, e o SAP só recebe uma verificação por encomenda, e não por consulta. O negócio decide que atraso aceita e como se comunica a diferença; a equipa SAP confirma qual a carga que suporta. Pressupostos a validar: o SAP suporta a verificação na confirmação; o volume de encomendas é muito inferior ao de consultas (medir os últimos 3 meses). Sucesso mede-se por: % de linhas rejeitadas na confirmação por falta de stock (alvo, por exemplo, ≤ 2%) e 0 incidentes no SAP atribuídos ao portal. A forma técnica de o conseguir (cópia de leitura, eventos, cache) decide-se no módulo 05.»

**5. Riscos**

| Risco | Resposta |
|---|---|
| O volume de encomendas confirmadas também sobrecarrega o SAP | Medir o volume; acordar limites; prever fila para absorver picos |
| O cliente rejeita ver stock «aproximado» | Protótipo e entrevistas; mostrar «última atualização» e margem de segurança |
| Atrasos maiores que 60 s por falhas de sincronização | Monitorizar o atraso real; alertar; mostrar aviso quando passar o limite |

**Critérios para te avaliares:** identificaste que o conflito é entre qualidades (e não entre pessoas)? Os compromissos são avaliados por quem ganha, quem perde e o risco? Não escolheste tecnologia, deixaste a decisão ao negócio com números e pressupostos? A proposta diz como se mede o sucesso?

## Módulo 03 · Fundamentos de arquitetura

### Exercício 9

**Pontos de acoplamento forte:**

| Acoplamento | O que acontece se o SAP mudar as tabelas | Como baixar | Custo |
|---|---|---|---|
| App Delphi lê tabelas do SAP diretamente | A app deixa de funcionar ou devolve dados errados; só se descobre em produção | Uma API ou camada de leitura estável entre a app e o SAP; a app deixa de conhecer tabelas | Construir e operar a camada; alterar a app Delphi (REST client) |
| Troca de ficheiros CSV por pasta partilhada | Mudança de colunas parte a importação noturna; falhas silenciosas | Contrato versionado do ficheiro, ou substituir por chamada de API / mensagem com confirmação | Migrar o fluxo; manter os dois em paralelo durante a transição |
| Site de encomendas lê tabelas do SAP | O mesmo que a app de balcão; além disso carga extra no SAP | Serviço de stock com vista de leitura própria, atualizada por eventos ou por sincronização | Nova peça a operar; consistência eventual |

**Baixa coesão:** o módulo «Utilitários» mistura regras de negócio (descontos), apresentação (formatação de moeda), comunicação (email), geração de documentos (etiquetas) e acesso a dados. Separaria em: regras de negócio (núcleo), acesso a dados (adaptador), serviços de comunicação (email) e apresentação/impressão (etiquetas e formatação), cada um com o seu motivo para mudar.

**Critérios de autoavaliação:** identificaste acoplamentos através de **dados partilhados**, não só de código? Cada proposta de melhoria tem um custo declarado? A separação de responsabilidades segue «um motivo para mudar» por parte? Evitaste propor reescrever tudo?

### Exercício 10

Resposta-modelo (outras escolhas justificadas são válidas):

**Estilo principal:** monólito modular com fronteiras hexagonais nas ligações externas (SAP, Delphi). **Secundário:** orientado a eventos para o stock; uma função serverless pontual, se houver tarefas orientadas a eventos (ex.: processar ficheiros).

Matriz (+ favorece, - prejudica):

| Atributo | Monólito modular hexagonal | Microsserviços | Serverless puro |
|---|---|---|---|
| Desempenho de stock (≤ 2 s) | + (vista local, chamada interna) | + (se bem feito, mas rede adicional) | - (arranque a frio pode afetar a cauda, a confirmar) |
| Disponibilidade com SAP parado | + (vista de leitura própria) | + | + |
| Modificabilidade sem tocar no SAP | + (adaptador isola o SAP) | ++ | + |
| Custo com 4 developers | ++ | -- | + |

**ADR resumido:**

    Título: Estilo da solução do portal de encomendas e stock
    Contexto: 4 developers, sem equipa de plataforma; SAP e apps Delphi não podem parar;
              metas: stock em ≤ 2 s (p95), portal consultável com o SAP em manutenção.
    Opções: (A) monólito modular hexagonal + eventos de stock; (B) microsserviços; (C) serverless puro.
    Decisão: A. Dois módulos (Stock, Encomendas) numa aplicação Bun/TypeScript; adaptador SAP
             atrás de uma porta; eventos do SAP atualizam a vista de stock.
    Consequências: simples de operar; fronteiras exigem disciplina; stock com consistência eventual;
                   a reserva é confirmada no SAP.
    Gatilho de revisão: mais de 3 equipas a mexer no mesmo código, ou o módulo de stock precisar de
                        escalar de forma muito diferente do resto (ex.: 10 vezes a carga).

**Onde entram as peças:** Bun/TypeScript para a aplicação nova; o SAP continua a fonte de verdade, acedido só pelo adaptador; as apps Delphi passam a usar a API REST da aplicação nova, atrás de uma camada anticorrupção, nos pontos que o exigirem.

**Critérios de autoavaliação:** partiste dos atributos e não do estilo? Escolheste o estilo **mais simples** que cumpre as metas? O gatilho é mensurável? O SAP e o Delphi aparecem no desenho com um papel claro?

### Exercício 11

| Op. | Decisão | Justificação |
|---|---|---|
| a | Eventual | Mostrar «Em stock» com alguns segundos de atraso é aceitável; ganhas desempenho e menos carga no SAP |
| b | Forte | Vender duas vezes a última unidade tem custo para o cliente; a reserva confirma-se no SAP (ou bloqueia) e pode ser recusada |
| c | Forte (ou eventual com indicação clara da hora da atualização, conforme a regra de negócio) | Informação financeira desatualizada pode levar a decisões erradas; se for eventual, tem de mostrar «atualizado às HH:MM» |
| d | Eventual | Um relatório de fim de dia pode usar dados «até às 17h59» se isso for dito e aceite pelo negócio |
| e | Forte, no sistema que for a fonte de verdade, e propagação eventual para os restantes | Um endereço errado causa entregas falhadas; define a fonte de verdade e propaga por evento |

**(1)** O portal continua a mostrar a última vista conhecida (disponibilidade priorizada), com a indicação de que o stock pode estar desatualizado e sem permitir confirmar reservas que exijam o SAP; as encomendas ficam em fila para processamento posterior, se o negócio o aceitar. Comunica ao cliente com transparência («stock sujeito a confirmação») em vez de erro genérico.

**(2)** O CAP não classifica produtos: descreve a escolha que um sistema distribuído tem de fazer **durante uma partição**, e essa escolha pode variar por operação (aqui, a listagem prefere disponibilidade e a reserva prefere consistência). Rotular o serviço como «CP» ignora isso e esconde a decisão real. Convém ainda lembrar que, fora das partições, existe o compromisso entre latência e consistência (PACELC).

**Critérios de autoavaliação:** decidiste por operação e com base no custo do erro para o negócio? Distinguiste a fonte de verdade da cópia? Descreveste o comportamento durante a falha e não só no caso normal?

### Exercício 12

**1. Problemas:**

| Problema | Relação com o modelo |
|---|---|
| 10 serviços para 4 pessoas | Mais serviços do que pessoas para os operar |
| Base de dados partilhada | Sem autonomia de dados; qualquer alteração de esquema afeta todos |
| Um único pipeline para todos | Não há implementação independente, o que é o benefício principal |
| Domínio dividido por nomes de entidades (Clientes, Produtos, Preços) | Fronteiras por técnica/entidade e não por capacidade de negócio; Preços e Produtos mudam quase sempre juntos |
| Sem menção a observabilidade, CI/CD ou plataforma | Maturidade de operação em falta |
| Motivo «fazem as grandes empresas» | Argumento de moda, sem ligação a atributos de qualidade |

**2. Monólito distribuído:** os serviços têm de mudar e ser implementados em conjunto (pipeline único, esquema partilhado), mas comunicam por rede. Pagas latência, falhas parciais, depuração distribuída e transações difíceis, sem equipas nem escalas independentes.

**3. Alternativa:**

    [Portal Web] --> [Aplicação Bun: monólito modular]
                        módulos: Catálogo+Preços | Stock | Encomendas | Notificações
                        fronteira hexagonal --> [Adaptador SAP] --> [SAP]
                        uma BD, esquemas separados por módulo, sem consultas entre módulos
                        eventos internos entre módulos (publicáveis para o exterior depois)

Gatilhos para extrair um serviço: uma parte precisa de escalar de forma claramente diferente (medido); há uma segunda equipa que precisa de implementar sem coordenar com a primeira; um módulo tem requisitos de disponibilidade ou de segurança diferentes; o ciclo de implementação conjunta passou a ser o gargalo.

**4. Comunicação (exemplo):** «Concordo com o objetivo de crescer sem reescrever. Proponho preparar isso já nas fronteiras entre módulos e nos eventos, e adiar a separação física até haver um gatilho concreto: mais equipas ou uma parte com carga própria. Assim ficamos prontos para extrair serviços, sem pagar hoje o custo de operar dez. Podemos rever o plano juntos e definir os gatilhos?»

**Critérios de autoavaliação:** relacionaste cada problema com o modelo da aula e não com opinião? A alternativa é mais simples e mantém a porta aberta? Os gatilhos são mensuráveis? A mensagem reconhece a intenção do colega?

## Módulo 04 · Modelação e documentação

### Exercício 13

**Contexto (nível 1):**

    Título: Contexto do sistema "Portal de Devoluções" (Casa Nova)

    [Cliente profissional]                      [Operador de armazém]
    (Pessoa: pede devoluções)                   (Pessoa: recebe material nas delegações)
              | Pede devolução e                          | Consulta devoluções pendentes
              | acompanha estado (HTTPS)                  | e confirma receção
              v                                           v
        +--------------------------------------------------------+
        |  PORTAL DE DEVOLUÇÕES (sistema novo)                   |
        |  Registo e acompanhamento de devoluções                |
        +--------------------------------------------------------+
           | Valida encomenda e      | Autentica    | Envia emails de
           | pede nota de crédito    | utilizadores | mudança de estado
           v                         v              v
        [ERP SAP]            [Sistema de identidade]  [Serviço de email]
        (existente)          (existente)              (externo)

    Legenda: [ ] pessoa ou sistema externo; caixa grande = sistema em desenho.

**Contentores (nível 2):**

    Título: Contentores do "Portal de Devoluções"

    [Cliente]--HTTPS-->[Portal Web (página única)]--HTTPS/JSON-->+------------------------+
    [Balcão/Armazém Delphi]-------------HTTPS/JSON-------------->| API de Devoluções      |
                                                                 | (Bun + TypeScript)     |
                                                                 +------------------------+
                                                                  | SQL           | mensagem "DevolucaoPedida"
                                                                  v               v
                                                         [Base de dados]   [Barramento de mensagens]
                                                                                  | consome
                                                                                  v
                                                                       [Integrador SAP (serviço)]
                                                                                  | pede nota de crédito
                                                                                  v
                                                                              [ERP SAP]
    Notificações: a API de Devoluções envia pedidos de email ao [Serviço de email] (HTTPS).
    Autenticação: o Portal e a API validam tokens do [Sistema de identidade] (HTTPS).
    Legenda: [ ] contentor ou sistema; setas com protocolo e finalidade.

**Públicos:** o nível 1 serve a direção e o negócio (o que o sistema faz e com quem fala); o nível 2 serve as equipas técnicas, a segurança e a infraestrutura (que aplicações e dados existem e que protocolos usam).

**Decisão que mereceria ADR** (qualquer uma, bem justificada): reutilizar o **Integrador SAP** existente em vez de uma integração direta nova; ou a escolha de comunicação **assíncrona** com o SAP (o cliente vê «pedido registado» antes da nota de crédito); ou fazer o armazém Delphi consumir a API em vez de aceder à base de dados.

**Critérios de autoavaliação:** o contexto não mostra tecnologia e inclui pessoas e sistemas externos; o diagrama de contentores indica tecnologia e protocolo nas linhas; ambos têm título e legenda; identificaste uma decisão significativa (difícil de reverter ou com impacto em qualidade).

---

### Exercício 14

**Problemas (mais de 8):**

| # | Problema | Tipo |
|---|---|---|
| 1 | Sem título nem legenda: não se sabe o que é, que nível, o que as caixas significam | Notação |
| 2 | Todas as linhas dizem «usa»: sem sentido claro, sem finalidade e sem protocolo | Notação |
| 3 | Elementos sem tipo (pessoa, sistema, contentor) nem descrição de responsabilidade | Notação |
| 4 | Sem tecnologias nos contentores (Portal, API, BD) | Conteúdo |
| 5 | Mistura de níveis: um bloco de código («class EncomendaService») ao lado de contentores | Nível de detalhe |
| 6 | «SAP» desenhado como se fosse um contentor do sistema, quando é um sistema externo existente: falta a fronteira do sistema | Conteúdo |
| 7 | «Controlo de Pedidos» sem explicação (é um contentor? um componente? de quem?) e ligação ao SAP sem etiqueta | Comunicação |
| 8 | Service Bus, Delphi (balcão) e Operador aparecem soltos, sem ligações: não se percebe o papel de cada um | Conteúdo |
| 9 | O Cliente liga ao Portal e a API ao SAP sem mostrar autenticação, nem direção real dos dados | Conteúdo |
| 10 | O diagrama não se percebe sem o autor a explicar; sem data, versão ou dono | Comunicação |

**Perguntas ao colega (exemplos):** (1) O que é o «Controlo de Pedidos» e quem o desenvolve? (2) Porque é que a API fala diretamente com o SAP, e o que acontece ao SAP num pico de pedidos? (3) Onde entram o Service Bus e o balcão Delphi, e que dados circulam em cada ligação?

**Diagrama corrigido (contentores, resumo):**

    Título: Contentores da "Plataforma de Encomendas e Stock" (v1, 2026-11-12, dono: Arquiteto)

    [Cliente]--HTTPS-->[Portal Web: página única]--HTTPS/JSON-->[API de Encomendas: Bun/TS]
    [Balcão Delphi]----------------HTTPS/JSON-------------------------^        | SQL      | publica evento
                                                                               v          v
                                                                  [Base de dados]  [Barramento de mensagens]
                                                                                          | consome
                                                                                          v
                                                                           [Integrador SAP] --chamada ao SAP--> [ERP SAP]

    Legenda: [ ] contentor ou sistema externo; seta etiquetada = protocolo e finalidade. "Operador" passa a pessoa que usa o Balcão Delphi (diagrama de contexto).

**Critérios de autoavaliação:** encontraste pelo menos 8 problemas e distinguiste os de notação dos de conteúdo; as perguntas pedem decisões e fronteiras, não detalhes; o diagrama corrigido tem título, legenda, tipos, tecnologias e etiquetas específicas.

---

### Exercício 15

    # ADR-0007: Manter o balcão Delphi e ligá-lo à nova API em vez de aceder ao SAP

    - Estado: Proposto   Data: 2026-11-12
    - Decisores: Arquiteto de soluções, Responsável de operações   Consultados: Equipa Delphi, Responsável SAP, Delegações

    ## Contexto e problema
    O balcão Delphi das 12 delegações lê dados diretamente da base de dados do SAP através
    de uma camada de acesso feita à medida. A direção quer stock em tempo real também no
    balcão. O balcão não pode parar em horário comercial; a equipa é pequena, com experiência
    em Delphi; o orçamento é limitado. Como dar stock em tempo real ao balcão?

    ## Critérios de decisão
    Prazo de entrega de valor; risco de paragem do balcão; competências da equipa;
    custo; redução do acesso direto ao SAP; stock realmente em tempo real.

    ## Opções consideradas
    A. Reescrever o balcão em tecnologia web (14 meses previstos).
    B. Manter o Delphi e adaptá-lo para consumir a API da plataforma (HTTPS/JSON).
    C. Manter o balcão e atualizar o stock por lote noturno.

    ## Decisão
    Escolhemos B: o balcão passa a obter stock e a criar vendas pela API, mantendo
    a interface e o fluxo de trabalho que os operadores conhecem.

    ## Consequências
    - Positivas: entrega mais rápida e incremental (delegação a delegação); aproveita as
      competências da equipa; elimina o acesso direto ao SAP a partir do balcão; um só
      ponto de integração.
    - Negativas: continua a dívida técnica da tecnologia do balcão; o balcão passa a
      depender da disponibilidade da API e da rede; é preciso manter dois estilos de cliente.
    - Riscos: falha de rede numa delegação. Mitigação: comportamento definido para modo
      degradado (últimos dados conhecidos, sinalizados) e piloto numa delegação antes do
      arranque geral.
    - Confiança: média. Rever se o custo de manter o balcão Delphi ultrapassar o da reescrita
      ou se a tecnologia deixar de ter suporte adequado.

    ## Prós e contras
    A: elimina dívida mas é longa e arriscada. C: simples mas não cumpre «tempo real».

    ## Mais informação
    Diagrama de contentores v1.2; requisitos de disponibilidade do balcão; ADR-0003.

**Rever daqui a dois anos:** se a manutenção do balcão ficar mais cara que a reescrita, se houver mudanças de política de plataforma ou de equipa, ou se o modo degradado gerar muitos incidentes. Escreve-se o **ADR-00XX «Substituir o balcão Delphi por cliente web»**, com estado Aceite, que **substitui** o ADR-0007, e o ADR-0007 passa a Substituído por ADR-00XX.

**Porque não se edita:** o histórico mostra o raciocínio e o contexto de **na altura**; editá-lo apagava a razão por que a decisão fazia sentido e impediria rever se a premissa mudou.

**Critérios de autoavaliação:** o ADR tem alternativas reais (incluindo uma que um colega razoável escolheria), consequências negativas e riscos com mitigação, e um nível de confiança; as mudanças futuras fazem-se com um novo ADR, não editando o antigo.

---

### Exercício 16

**1. Conjunto mínimo por público:**

| Público | Diagramas e secções arc42 | Deixas de fora (porquê) |
|---|---|---|
| Direção | C4 nível 1; resumo de uma página; secções 1 (objetivos), 4 (estratégia, versão curta), 11 (riscos) | Contentores, sequência, implantação: não decidem o orçamento |
| Segurança | C4 níveis 1 e 2; implantação (7); conceitos transversais (8, segurança); decisões (9) relevantes; contexto técnico (3.2) | Componentes e código; detalhe funcional não afeta o parecer |
| Desenvolvimento | C4 níveis 2 e 3; sequência dos fluxos críticos (6); decisões (9); qualidade (10); glossário (12) | Resumo de negócio extenso: já o conhecem |

**2. Esqueleto do documento (equipa de desenvolvimento):**

| Secção arc42 | Conteúdo aplicado à Casa Nova | Estado |
|---|---|---|
| 1 Introdução e objetivos | Stock em tempo real, portal de encomendas, integração fiável com o SAP; stakeholders | Escrever |
| 2 Restrições | O SAP não pode parar, RGPD, equipa pequena, orçamento limitado | Escrever |
| 3 Contexto e âmbito | Diagrama C4 nível 1; interfaces técnicas com SAP, email, identidade | Escrever |
| 4 Estratégia | Integrador isolado, comunicação por mensagens, API central | Escrever (resumo) |
| 5 Blocos de construção | C4 níveis 2 e 3 (API de Encomendas) | Escrever |
| 6 Execução | Sequência: criar encomenda; falha do SAP | Escrever |
| 7 Implantação | Delegações, Azure, datacenter | Rascunho, detalhar com o módulo 06 |
| 8 Transversais | Autenticação, logging, tratamento de erros | Adiar (módulos 07 e 08) |
| 9 Decisões | Índice de ADRs (0001 a 000N) com ligação | Escrever |
| 10 Qualidade | Cenários de disponibilidade e desempenho | Escrever (módulo 02) |
| 11 Riscos | Dependência do Integrador, rede nas delegações | Escrever |
| 12 Glossário | Encomenda, delegação, stock, EncomendaCriada... | Escrever |

**3. Resumo para a direção (exemplo, valores hipotéticos):**

    Plataforma de Encomendas e Stock — resumo (1 página, v0.1)
    Problema: encomendas online lentas, dados duplicados e falta de visibilidade de stock.
    Solução: um portal de encomendas e um serviço de stock em tempo real na cloud,
    ligados ao SAP por um serviço de integração; o balcão continua a funcionar.
    A aprovar: (1) integração através de um serviço dedicado; (2) manter o balcão
    atual e adaptá-lo; (3) piloto numa delegação antes de generalizar.
    Riscos principais: dependência do SAP; ligação de rede nas delegações; equipa pequena.
    Custo e prazo: <valor hipotético: a confirmar com o módulo 10>; <prazo hipotético>.
    Próximo passo: aprovar o piloto e o orçamento da fase 1.

**4. Manter atualizada:** repositório junto do código (`docs/`), com ADRs numerados e diagramas como texto ou exportados com data e versão; dono por documento (arquiteto nos transversais, líder técnico nos componentes); revisão em cada marco e a cada decisão significativa; sinal de desatualização: pull requests que alteram contentores ou integrações sem alterar o diagrama (verificar na revisão de código).

**Critérios de autoavaliação:** cada público recebe só o que usa para decidir; o esqueleto liga diagramas, ADRs e secções arc42 sem preencher tudo; o resumo da direção não tem siglas nem tecnologia desnecessária e não apresenta números inventados como factos; o plano de manutenção tem dono, local e gatilho de revisão.

## Módulo 05 · Dados e integração

### Exercício 17

| # | Modelo | Serviço Azure / AWS | Fonte ou cópia | Justificação |
|---|---|---|---|---|
| 1 Encomendas | Relacional | Azure SQL Database / Amazon RDS | **Fonte de verdade** (do portal; o SAP é o registo final após integração) | Transações com várias linhas e integridade: o total tem de bater certo com as linhas |
| 2 Stock | Chave-valor (cache) sobre uma cópia de leitura | Azure Managed Redis / ElastiCache | **Cópia**; a fonte é o SAP | Leitura por chave milhares de vezes por minuto; tolera atraso curto; protege o SAP |
| 3 Catálogo e pesquisa | Pesquisa | Azure AI Search / Amazon OpenSearch Service | **Cópia** indexada; a fonte é o SAP/base de artigos | Texto livre, relevância e filtros por facetas; o índice nunca é o repositório principal |
| 4 Sessão e carrinho | Chave-valor | Azure Managed Redis / ElastiCache | Fonte (temporária) | Acesso por chave, latência mínima, dados com expiração |
| 5 Faturas PDF | Objeto | Azure Blob Storage / Amazon S3 | Fonte (o ficheiro); metadados na base relacional | Ficheiros grandes, escala barata e camadas de custo para retenção longa |
| 6 Substitutos e compatíveis | Grafo | Extensões de grafo do Azure SQL / Amazon Neptune | Cópia derivada dos dados de artigos | Percursos até três níveis de profundidade; relacional também serve com poucas relações |

**Empresa pequena:** o ponto 6. Com 40 000 artigos e três níveis, uma tabela relacional de substituições com consultas recursivas (ou uma consulta com junções) evita operar um grafo; só compensa um grafo se as relações forem profundas e centrais. Alternativamente o 3, usando a pesquisa de texto da própria base de dados em vez de um serviço à parte.

**Critérios de autoavaliação:** partiste do padrão de acesso e não do produto; identificaste que cache e índice são cópias; reconheceste que um só modelo raramente serve tudo (persistência poliglota); a justificação cabe em duas frases por item.

### Exercício 18

**1. Recursos e métodos**

| Operação | Método e URL | Notas |
|---|---|---|
| Criar encomenda | `POST /v1/encomendas` | Corpo com cliente e linhas |
| Consultar | `GET /v1/encomendas/{id}` | |
| Listar | `GET /v1/encomendas?cliente=..&pagina=2&tamanho=50` | Paginada |
| Linhas | `GET /v1/encomendas/{id}/linhas` | Sub-recurso |
| Cancelar | `POST /v1/encomendas/{id}/cancelamento` ou `DELETE` se o negócio aceitar apagar | O cancelamento é um facto de negócio; um recurso próprio regista motivo e data |
| Alterar morada | `PATCH /v1/encomendas/{id}` com a morada | Só enquanto o estado o permitir |
| Clientes | `GET /v1/clientes/{id}` | |

**2. Códigos:** criada `201` (com `Location`); não encontrada `404`; dados inválidos `400` (ou `422`); conflito `409` (por exemplo, cancelar uma encomenda já expedida); erro interno `500`. Formato único de erro, por exemplo: `codigo` (estável, para máquinas), `mensagem` (para humanos), `detalhes` (lista de campos inválidos) e `idCorrelacao` (para encontrar o registo nos logs).

**3. Versionamento:** versão **na URL** (`/v1/`). É simples para parceiros, visível, e amiga da cache. Compatível: acrescentar um campo opcional `referenciaCliente`. Que parte: renomear `morada` ou mudar o significado de `total` (passa a incluir IVA). Para a quebra, publicas `/v2/`, mantens `/v1/` com data de fim anunciada e avisas os consumidores.

**4. Idempotência do POST:** o cliente gera um identificador único por tentativa lógica (por exemplo, enviado num cabeçalho, convenção usada em várias APIs; confirma o que a tua plataforma suporta) e repete o mesmo identificador nas repetições. O servidor guarda o identificador e a resposta: se o recebe de novo, devolve a **mesma encomenda** em vez de criar outra. Alternativa: o cliente define o id da encomenda e usa `PUT /v1/encomendas/{id}`, que é idempotente por definição.

**5. Estilos:** (a) **REST**: universal, simples para parceiros e com ferramentas e contratos OpenAPI; (b) **gRPC**: contrato `.proto` com código gerado nas duas linguagens, compacto e tipado, bom para tráfego interno; (c) **GraphQL**: cada ecrã pede só os campos de que precisa, evitando vários pedidos e excesso de dados (com cuidado no custo das consultas).

**Critérios de autoavaliação:** URLs com substantivos; `PUT` idempotente e `POST` tratado com chave; erros com formato único; versionamento justificado com exemplo concreto de alteração que parte; escolha do estilo por consumidor e não por preferência.

### Exercício 19

**A. Duplicado no SAP.** Causa: a entrega é **pelo menos uma vez**; se o consumidor chama o SAP e falha antes de apagar a mensagem (ou o tempo de bloqueio expira), a mensagem volta. Correção: consumidor **idempotente** (guarda o identificador da encomenda já tratada e ignora repetições; ou usa operação idempotente no SAP) e, no envio, identificador de mensagem derivado do negócio (número da encomenda) com **deteção de duplicados** ativa (disponível no Service Bus Standard/Premium, com janela configurável). Verificação: teste que reenvia a mesma mensagem duas vezes e confirma uma só encomenda no SAP.

**B. Encomenda perdida.** Causa: gravar na base de dados e publicar são duas operações; se a aplicação cai entre ambas, a encomenda existe mas o evento nunca saiu. Correção: **outbox transacional**: o evento é gravado na **mesma transação** da encomenda e um processo publica-o depois (com repetição; o consumidor idempotente absorve duplicados). Verificação: matar o processo entre os dois passos num teste e confirmar que o evento sai depois; reconciliação periódica de encomendas sem confirmação do SAP.

**C. Cancelada antes de criada.** Causa: sem garantia de ordem entre mensagens. Correção: ordem **por encomenda**, não global: sessões no Service Bus com o número da encomenda como identificador de sessão (ou grupo de mensagens numa fila FIFO da AWS); ou o consumidor guarda um número de versão e aplica só alterações com versão superior (estado coerente mesmo que chegue fora de ordem). Verificação: teste com mensagens trocadas de propósito.

**D. Mensagem mal formada.** Causa: uma «mensagem veneno» é reentregue e falha sempre, ocupando o consumidor. Correção: limite de tentativas e **fila de mensagens não entregues**; alerta operacional quando algo chega lá; processo para inspecionar, corrigir e reenviar; validação do formato à entrada. Verificação: injetar uma mensagem inválida e confirmar que as seguintes continuam a ser processadas e que há alerta.

**Evento ou comando?** Para as subscrições de faturação e notificações é um **evento** (algo aconteceu; quem publica não espera nada). Para o consumidor «sap» a mensagem comporta-se como **comando** («cria esta encomenda no SAP») e aí interessa ter resposta, repetições e fila própria. Pode justificar separar: o evento «EncomendaCriada» no tópico e uma **fila dedicada** de integração com o SAP, com garantias e monitorização próprias.

**Critérios de autoavaliação:** ligaste cada incidente à causa (entrega pelo menos uma vez, duas operações, ordem, mensagem veneno); nomeaste correções concretas e não «mais testes»; indicaste como verificar; distinguiste evento de comando.

### Exercício 20

**1. Estilos**

| Integração | Estilo | Justificação |
|---|---|---|
| I1 Stock | **Eventos** do SAP (ou carga frequente) para uma cópia de leitura + cache; o portal lê a cópia | 30 s de atraso aceitável; o SAP não pode servir cada consulta; se o SAP cair, o portal continua a mostrar o último valor conhecido |
| I2 Encomendas | **Mensagens** (fila) com outbox, consumidor idempotente e fila de falhas | Não pode haver perdas nem duplicados; tolera atraso; protege o SAP de picos |
| I3 Relatório noturno | **ETL/ELT** em lote para um armazém de dados | Grande volume, sem urgência; é integração analítica |
| I4 Delphi | **API síncrona** para consultas e mensagens/ficheiro para o que for assíncrono, atrás de uma camada anti-corrupção | O balcão precisa de resposta imediata ao consultar; a escrita legada passa a ser traduzida |

**2. Camada anti-corrupção (I4)**

    Aplicação Delphi (modelo Casa Nova via API)
            |  REST/JSON
            v
    API da Casa Nova (encomendas, stock)  <-- modelo novo, estável
            |
            v
    [ ACL ]  traduz: encomenda nova <-> registos/tabelas da base antiga
             valida entradas, regista erros com id de correlação
            |
            v
    Base local antiga + SAP (modelo legado)

A ACL corre como serviço próprio (ou componente da API). A API e o Delphi só conhecem o **modelo Casa Nova**; só a ACL conhece as tabelas antigas. Não deve conter **regras de negócio** (só tradução) nem **orquestração de processos** (isso pertence aos serviços de domínio). Convém ainda decidir se é permanente ou se desaparece quando o legado for retirado.

**3. Perguntas à equipa SAP:** (1) Que interfaces o nosso SAP expõe para stock e encomendas (OData, SOAP, RFC, IDoc, eventos) e quais está a equipa disposta a suportar? (2) Que limites de volume e janelas de manutenção existem, e como se autentica e autoriza o sistema integrador? (3) Como se garantem duplicados e erros: a criação de encomenda é idempotente? Que identificador usamos e como se devolve confirmação ou erro? (Também aceite: processo de alteração e testes em ambiente de qualidade.)

**4. ADR (modelo)**

    Título: Acesso das aplicações Delphi aos dados da Casa Nova
    Estado: Proposto
    Contexto: as aplicações Delphi escrevem diretamente em tabelas de uma base
      antiga e conhecem o seu esquema. Vamos mudar o SAP e as bases por trás.
    Alternativas: (A) manter o acesso direto às tabelas; (B) Delphi chama uma
      API REST da Casa Nova, com camada anti-corrupção para o legado.
    Decisão: B.
    Consequências: + desacopla o balcão do esquema; + permite substituir
      sistemas sem reescrever o Delphi; + contrato versionado e testável;
      - mais um componente a operar; - latência adicional; - esforço de
      adaptar as rotinas Delphi para cliente REST (confirmar componentes e
      versão na documentação da Embarcadero).
    Revisão: quando o último acesso direto às tabelas for retirado.

**Critérios de autoavaliação:** associaste cada integração ao estilo pelos critérios (latência, falha do outro lado, volume); a ACL só traduz e isola; não afirmaste interfaces SAP sem verificação; o ADR compara alternativas e regista custos, não só benefícios.

## Módulo 06 · Cloud e infraestrutura

### Exercício 21

**1 e 2. Classificação e responsabilidades**

| Componente | Modelo | Atualizações do SO | Dados | Configuração de acesso |
|---|---|---|---|---|
| A. SAP em VMs | IaaS | **Casa Nova** | Casa Nova | Casa Nova |
| B. Portal (App Service) | PaaS | Microsoft | Casa Nova | Casa Nova |
| C. Microsoft 365 | SaaS | Microsoft | Casa Nova | Casa Nova (contas e permissões) |
| D. Functions | PaaS (serverless) | Microsoft | Casa Nova | Casa Nova |
| E. Blob Storage | PaaS | Microsoft | Casa Nova | Casa Nova |

**3. Um risco que permanece (exemplos)**

- A: VMs sem *patches* ou com portas de gestão expostas; *backups* mal configurados.
- B: código da aplicação com vulnerabilidades; segredos guardados no código.
- C: contas sem autenticação multifator; partilha de ficheiros demasiado aberta.
- D: função com permissões a mais, ou que escreve dados sensíveis em *logs*.
- E: contentor ou conta de armazenamento acessível publicamente por configuração errada.

**4. Resposta ao diretor financeiro (exemplo)**

«A Microsoft protege a infraestrutura física e, nos serviços geridos, também o sistema operativo e a plataforma. Mas os nossos dados, as nossas contas e as permissões que damos continuam a ser nossos, quer o serviço seja IaaS, PaaS ou SaaS. Por isso vamos manter controlos de acesso, autenticação forte e monitorização, e o custo disso está previsto no projeto. Passar para a cloud reduz parte do trabalho, não toda a responsabilidade.»

**Critérios de autoavaliação:** classificaste corretamente IaaS (VMs) e PaaS (App Service, Functions, Storage) e SaaS (Microsoft 365)? Afirmaste que **dados e identidades são sempre do cliente**? O teu risco para cada componente é realista e específico? A resposta ao diretor corrige sem assustar nem desvalorizar?

### Exercício 22

**1. Ligação**

| Fase | Escolha | Justificação |
|---|---|---|
| Lançamento (6 semanas) | **VPN site a site** (VPN Gateway) para a VNet hub | Não exige fornecedor de circuito nem prazo de instalação; custo contido; protocolos IPsec/IKE sobre a internet |
| Futuro | **Reavaliar ExpressRoute**; manter a VPN como caminho de backup | O ExpressRoute é uma ligação privada, fora da internet pública, com redundância incorporada e SLA de disponibilidade da ligação, mas exige um fornecedor e prazo. Decide-se com dados de utilização e custo de indisponibilidade |

O requisito «o menos tempo parado» **não** é suficiente para justificar ExpressRoute desde o início. Tem de se traduzir em número (por exemplo, quanto custa uma hora sem encomendas online) e em desenho: além da ligação, a **camada de dados de stock na cloud** pode atenuar a falha (ver módulo 08).

**2. Plano de endereços**

| Rede | Intervalo | Nota |
|---|---|---|
| On-premises (sede + 12 delegações) | `10.0.0.0/16` a `10.12.0.0/16` | Já existente |
| Hub | `10.200.0.0/22` | Firewall, gateway, DNS |
| Spoke Portal | `10.200.4.0/22` | |
| Spoke Integração/Stock | `10.200.8.0/22` | |

Os intervalos do Azure (`10.200.0.0/22` a `10.200.8.0/22`, contínuos) não se sobrepõem a nenhum intervalo on-premises e deixam espaço (`10.200.12.0` em diante) para os spokes futuros. A colisão seria um problema porque o encaminhamento não consegue distinguir dois destinos com o mesmo endereço: a ligação não funciona ou o tráfego vai para o sítio errado. Corrigir depois de implantado implica renumerar redes.

**3. Topologia**

        On-premises (10.0.0.0/16 - 10.12.0.0/16)             Azure
     +------------------------------+          +--------------------------------------+
     | SAP S/4HANA · apps Delphi    |          | HUB 10.200.0.0/22                    |
     | sede + 12 delegacoes         +--VPN-----+ Gateway · Firewall · DNS             |
     +------------------------------+          +--------+------------------+----------+
                                                  peering|                  |peering
                                       +-----------------+--+      +--------+-----------+
                                       | SPOKE Portal       |      | SPOKE Integracao   |
                                       | 10.200.4.0/22      |      | 10.200.8.0/22      |
                                       | App Service        |      | APIM · Functions   |
                                       +--------------------+      +--------------------+

**4. Spoke a falar com spoke.** O peering não é transitivo: o Portal ligado ao hub e a Integração ligada ao hub **não** significa que o Portal chegue à Integração. O tráfego passa pelo hub: configuram-se rotas (user-defined routes) para que o tráfego entre spokes vá ao **firewall do hub**, que o inspeciona e encaminha. Outra opção é peerar diretamente os dois spokes se não for preciso inspecionar (decisão de segurança).

**5. Duas regras (exemplos)**

- O portal **nunca** chama o SAP diretamente: chama a API publicada no spoke Integração (API Management), e só essa camada tem rota e regra de firewall para o SAP.
- As regras do firewall/NSG permitem apenas as portas e os endereços do serviço SAP necessário (princípio do menor privilégio), com origem restrita ao spoke Integração.

**Critérios de autoavaliação:** justificaste a ligação com prazo, custo **e** disponibilidade, sem assumir que o mais caro é o mais certo? O plano de endereços não colide e deixa espaço para crescer? Explicaste a não transitividade e como a contornar? O portal ficou protegido de falar diretamente com o SAP?

### Exercício 23

**1 e 2. Escolhas**

| Carga | Serviço | Justificação | Responsabilidade |
|---|---|---|---|
| A. Portal | **App Service** (com contentor, se o Bun não for suportado como runtime nativo: confirma na documentação) ou Container Apps | PaaS web com escala e certificados; a equipa não gere SO | Microsoft gere SO e plataforma; a Casa Nova gere código e dados |
| B. Reconciliação noturna | **Functions** (temporizador) ou **job** em Container Apps | Corre pouco tempo; pagar só enquanto executa | Serverless: quase só código |
| C. Eventos de stock | **Functions** (gatilho de fila) ou Container Apps com escala por eventos | Escala com o número de mensagens, incluindo a zero | Serverless |
| D. Software de terceiros | **Máquina virtual** Windows | Não suporta contentores nem PaaS; exige o SO | IaaS: SO, patches e backups são da Casa Nova |
| E. Plataforma do parceiro | **AKS** | Já vem empacotada para Kubernetes; precisa da API do Kubernetes | Casa Nova gere cargas e, no modo Standard, os nós; no Automatic o Azure gere os nós |

Mais simples: **B e C** (serverless, pouca operação) e **D** (não há alternativa, a restrição decide). Mais discutível: **E**, porque depende de a equipa aceitar o custo de operação do Kubernetes, ou de se negociar com o parceiro uma versão SaaS ou que corra em Container Apps (que não dá acesso à API do Kubernetes e por isso pode não servir).

**3. ADR (exemplo)**

    ADR-023: Plataforma de execução da solução do parceiro
    Estado: Proposto
    Contexto: o parceiro entrega 30 microsserviços empacotados para
      Kubernetes (Helm). A equipa de plataforma tem 2 pessoas, sem
      experiência prévia em Kubernetes.
    Decisão: usar o Azure Kubernetes Service no modo Automatic, com a
      plataforma implantada por IaC.
    Alternativas rejeitadas: Container Apps (não dá acesso à API do
      Kubernetes e exigiria reempacotar); VMs com Kubernetes próprio
      (mais operação); SaaS do parceiro (a confirmar com o parceiro).
    Consequências: menos operação de nós do que no modo Standard; a
      equipa precisa de formação e de um plano de suporte; custo a
      acompanhar com orçamentos; revisão aos 6 meses.

**4. Custo de operação.** Competências de Kubernetes (atualizações, segurança de imagens, monitorização), tempo de on-call e incidentes de cluster. Reduzir: o modo Automatic (a documentação indica que o Azure trata de nós, escala, defaults de segurança e atualizações), IaC e pipelines, formação, e pedir ao parceiro um acordo de suporte.

**Critérios de autoavaliação:** cada escolha tem uma justificação ligada a um requisito, e não à preferência pessoal? Respeitaste a restrição da equipa pequena? O ADR tem alternativas rejeitadas e consequências **negativas** (não só positivas)? Verificaste na documentação qualquer afirmação sobre suporte do Bun e do modo Automatic?

### Exercício 24

**1. Hierarquia (3 níveis)**

    Tenant
      └── Grupo de gestão raiz
            ├── CasaNova-Plataforma   (políticas globais; rede e monitorização partilhadas)
            ├── CasaNova-Producao     (subscrição por carga de trabalho em produção)
            │     └── Producao-Portal ...
            └── CasaNova-NaoProducao  (dev, teste, sandbox)
                  ├── Dev-Portal
                  └── Teste-Fornecedor

Justificação: agrupar por **necessidade de política** (produção exige regras mais estritas que desenvolvimento) e não pelo organigrama. Mantém-se plana (a Microsoft recomenda ideal de 3 a 4 níveis). Cada carga de trabalho nova recebe a sua subscrição, o que isola custos e permissões. A subscrição «Dev-Maria» passa a ser uma subscrição de não produção com dono explícito.

**2. Políticas (exemplos)**

| Política | Avalia | Âmbito | Efeito |
|---|---|---|---|
| Regiões permitidas | Local dos recursos | Grupo de gestão raiz (ou da empresa) | *deny* (após período em *audit*) |
| Etiquetas obrigatórias (dono, ambiente, centro de custo) | Presença de etiquetas | Grupos Producao e NaoProducao | *deny*, ou *modify* para herdar valores onde fizer sentido |
| Logs de diagnóstico para um Log Analytics workspace | Recursos sem diagnóstico ligado | Grupo Producao | *deployIfNotExists* |
| Tamanhos de VM permitidos (controlo de custo) | SKUs usados | Grupo NaoProducao | *deny* ou *audit* |

Introdução sem parar a equipa: começar em *audit* (só relatório) para ver o impacto, corrigir o que já existe, depois passar a *deny* para recursos novos e comunicar com antecedência. A Policy avalia ao criar/atualizar recursos e num ciclo regular (a documentação indica a cada 24 horas), por isso há tempo para observar.

**3. RBAC**

- **Equipa de plataforma:** papéis de gestão no grupo CasaNova-Plataforma e, se necessário, de leitura/suporte em todas as subscrições, via grupos do Microsoft Entra.
- **Equipa do portal:** papel de Contributor **na sua subscrição ou grupos de recursos**, não no grupo de gestão. Owner só para quem gere acessos, e poucos.
- Atribuir a **grupos** e não a pessoas.
- Razão para não dar tudo no grupo de gestão: a herança propaga o acesso a todas as subscrições abaixo (sobre-permissões e risco). A Microsoft recomenda usar os grupos de gestão sobretudo para políticas.

**4. Etiquetas e orçamentos**

- Etiquetas obrigatórias: `projeto`, `ambiente`, `dono`, `centro-custo`. Impostas por política.
- Uma subscrição por carga de trabalho já responde a grande parte de «quanto custa cada projeto?» (a subscrição é a fronteira de faturação).
- Orçamentos por subscrição, com alertas em valores reais e previstos, enviados ao dono.
- Cost Management para análise e relatórios mensais por etiqueta.
- **O que não fazem:** os orçamentos **só avisam**; não param os recursos nem o consumo. O controlo efetivo vem de políticas (tamanhos permitidos), desligar ambientes fora de horas e revisão de recomendações.

**5. IaC (ADR)**

    ADR-024: Ferramenta de infraestrutura como código
    Contexto: o Azure é a única cloud prevista; a equipa tem pouca
      experiência em IaC; precisamos de repetir ambientes e auditar.
    Decisão: Bicep, aplicado por pipeline a partir do Git, sem
      alterações manuais em produção.
    Alternativa: Terraform (multi-cloud, ficheiro de estado a gerir).
    Consequências: simples e alinhado com o Azure; menos portável se
      um dia houver outra cloud; revisão se a estratégia mudar.

**Critérios de autoavaliação:** a hierarquia é plana e organizada por política e não por organigrama? Cada política tem âmbito e efeito adequados, com plano gradual (audit antes de deny)? O RBAC segue o menor privilégio e evita dar acesso largo no grupo de gestão? Sabes explicar o que os orçamentos **não** fazem? O ADR justifica a escolha com o contexto, e não pela preferência?

## Módulo 07 · Segurança e conformidade

### Exercício 25

**1. Revisão das sete situações**

| # | Princípio ou propriedade | Correção |
|---|---|---|
| 1 | Menor privilégio | Retirar Owner. Criar grupos no Entra ID (por exemplo, «Devs-Portal») e atribuir por Azure RBAC papéis mais estreitos (Contributor ou papéis específicos) ao nível do **grupo de recursos** e não da subscrição. Em produção, acesso de escrita só por pipeline; acesso humano temporário e com aprovação |
| 2 | Confidencialidade; segredo no Git | Eliminar a palavra-passe: a API passa a usar identidade gerida para aceder à base de dados (se o serviço suportar autenticação Entra: confirma na documentação). Se ainda houver segredo, vai para o Key Vault. **Rodar** a palavra-passe atual, porque está no histórico do Git |
| 3 | Zero Trust; defesa em profundidade | A API valida *token* (emissor, validade, audiência) e autorização em cada pedido, mesmo vindo da rede interna |
| 4 | Defesa em profundidade; confidencialidade | *Private endpoints* (Private Link) para base de dados e cofre, acesso público desativado, só o WAF/gateway fica exposto |
| 5 | Autorização falha (OWASP A01, *Broken Access Control*); integridade | A autorização é feita no servidor: a API verifica o papel de «aprovador» (e o âmbito: só encomendas do seu cliente ou da sua delegação). O botão escondido é só conforto de interface |
| 6 | Auditoria (e repúdio, em STRIDE) | Ativar registos de recursos do Key Vault e exportar o *activity log* (retido 90 dias por omissão) e os registos de dados para um Log Analytics workspace, com retenção definida e acesso restrito |
| 7 | Menor privilégio; auditoria; confidencialidade | Conta partilhada impede saber quem fez o quê e a palavra-passe está espalhada pelos postos. As aplicações Delphi passam a falar com a **API** com identidade individual (SSO) e papéis; deixam de ligar à base de dados. Durante a transição: contas separadas, palavra-passe fora do `.ini` e rotação |

**2. Tipo de identidade gerida**

- **(a)** **Atribuída ao sistema**: a carga de trabalho vive num único recurso, a identidade nasce e morre com ele, e as permissões ficam ligadas a esse recurso.
- **(b)** **Atribuída ao utilizador**: os contentores são recriados todos os dias e várias instâncias precisam das mesmas permissões. Uma identidade independente, partilhada, mantém as permissões estáveis (com uma identidade ao sistema, cada recriação obrigaria a atribuir de novo o papel).

**3. Credencial do utilizador técnico do SAP.** Guardar no **Azure Key Vault** (um cofre por aplicação e ambiente). Acesso de leitura **só** para a identidade gerida do serviço de integração, por Azure RBAC; nenhuma pessoa lê o segredo no dia a dia (administradores gerem o cofre, não o conteúdo). Ativar registo de acessos e alerta para leituras anormais. Rotação: acordar com a equipa SAP um calendário (por exemplo, trimestral, a ajustar à política da empresa) e um procedimento que não exija deploy (a aplicação lê o segredo em tempo de execução). Rodar de imediato se houver suspeita de fuga.

**Critérios de autoavaliação:** associaste cada problema a um princípio e não só a uma ferramenta? Propuseste identidade gerida antes de «guardar a palavra-passe no cofre»? Percebeste que a autorização tem de estar no servidor? Tratou-se a palavra-passe no Git como comprometida?

### Exercício 26

**1. Fronteiras de confiança**

    [Browser do cliente] ==(1)==> [WAF/API Encomendas] --(2)--> [Fila] --> [Serviço de integração]
                                                                                  |             |
                                                                      ==(3)== [SAP]     (4) [Base de dados]

Fronteiras: **(1)** Internet para a aplicação (entrada de dados não confiáveis); **(2)** entre a API e a fila, se forem componentes com identidades e permissões diferentes; **(3)** Azure para o datacenter (VPN) e o SAP, com a sua própria administração; **(4)** serviço para a base de dados (dados em repouso). As mais críticas: (1) e (3).

**2. STRIDE** (exemplos de resposta)

| Letra | Ameaça | Mitigação |
|---|---|---|
| S | Atacante usa o *token* roubado de um comprador para criar encomendas | *Tokens* de curta duração, autenticação multifator, validação de emissor e audiência, deteção de comportamento anómalo |
| T | Alteração do preço ou da quantidade no pedido, ou de uma mensagem na fila | O servidor recalcula preços; mensagens com identidade do produtor e controlo de acesso à fila; validação de esquema na integração |
| R | Cliente nega ter feito uma encomenda grande | Registo de auditoria (identidade, hora, conteúdo, identificador de correlação) guardado fora do alcance da própria API |
| I | Comprador de um cliente vê encomendas de outro (IDOR); registos com dados pessoais em claro | Autorização por objeto (filtrar por cliente em cada consulta); cifragem em trânsito e em repouso; não registar dados pessoais desnecessários |
| D | Inundação de pedidos ao portal ou fila cheia que bloqueia a integração com o SAP | Limites de pedidos no WAF/gateway, escala, *dead-letter* e limite de tamanho de mensagens; o SAP protegido por *throttling* na integração |
| E | Utilizador comum chama endpoints administrativos; serviço de integração com permissões a mais no SAP | Papéis verificados no servidor, APIs administrativas separadas; utilizador técnico do SAP com permissões mínimas |

**3. Prioridades (exemplo).** Probabilidade x impacto: **I (IDOR)** 4 x 5 = 20, porque é um erro comum e expõe dados de outros clientes (também RGPD); **S (token roubado)** 3 x 5 = 15; **E (permissões a mais no SAP)** 2 x 5 = 10, baixa probabilidade mas impacto máximo no sistema central. Aceitar valores diferentes se justificares probabilidade e impacto.

**4. Requisitos mensuráveis (exemplos).**
- «Todos os endpoints que devolvem encomendas filtram por cliente autenticado; um teste automático de autorização cobre 100% dos endpoints e corre em cada *build*.»
- «Toda a ação de criar, alterar ou cancelar encomendas gera um registo de auditoria com identidade, hora e identificador de correlação, consultável durante 12 meses (prazo a validar com o DPO e a auditoria).»

**Aceitação:** por exemplo, o risco residual de um DoS volumétrico distribuído sobre o portal, se o WAF e a escala automática já limitam o impacto e o custo de proteção adicional é elevado. Quem aceita é o **dono do risco**, o responsável de negócio do portal (com o responsável de segurança consultado), e fica registado num ADR; o arquiteto não aceita riscos sozinho.

**Critérios de autoavaliação:** marcaste fronteiras de confiança em vez de apenas componentes? Cobriste as seis letras com ameaças deste fluxo e não genéricas? Cada ameaça tem uma mitigação concreta? Os requisitos são testáveis? Reconheceste que a aceitação de risco é uma decisão do negócio?

### Exercício 27

**1. Inventário (exemplo; prazos são hipóteses)**

| Func. | Dados | Titulares | Finalidade | Onde | Retenção proposta |
|---|---|---|---|---|---|
| (a) | Nome, email, telefone de compradores | Pessoas dos clientes B2B | Confirmações e comunicação de encomendas | Portal, SAP, serviço de email | Enquanto durar a relação comercial, mais um prazo a definir com o jurídico |
| (b) | Localização GPS, hora, identificação do motorista | Colaboradores (motoristas) | Rotas e tempos de entrega | App móvel, backend, mapas | Detalhe: curta (por exemplo, dias); agregados: mais tempo |
| (c) | Toda a tabela de clientes e encomendas | Contactos de clientes, possivelmente colaboradores | Análise | Plataforma de análise em nova região | A definir; a cópia completa tem de ser justificada |

**2. Bases legais a discutir e perguntas ao DPO**

- **(a)** Execução do contrato (ou diligências pré-contratuais) é a hipótese provável para comunicar uma encomenda; pergunta: o mesmo contacto pode ser usado para marketing? (finalidade diferente: pode exigir outra base).
- **(b)** Tratar a localização de colaboradores é sensível em contexto laboral: base legal possível (interesses legítimos?), proporcionalidade, informação aos colaboradores, consulta aos representantes dos trabalhadores quando aplicável. **Perguntas ao DPO:** é necessário o GPS **durante todo o turno** ou só nos momentos da entrega? Exige DPIA?
- **(c)** Finalidade «análise» é compatível com a recolha original? Há minimização possível (dados agregados ou pseudonimizados)? Pergunta ao DPO sobre transferência para fora do EEE.

A funcionalidade **(b)** é a que levanta mais cedo a pergunta da **DPIA**: monitorização sistemática da localização de colaboradores é típico de risco elevado. Mas **a decisão final é do DPO** com base nas orientações da autoridade de controlo.

**3. Requisitos testáveis (exemplos)**
- **Acesso:** dado o identificador de um contacto, o sistema produz um relatório com todos os dados dessa pessoa nos sistemas A, B e C em X dias (prazo do processo interno a validar).
- **Apagamento:** o pedido de apagamento propaga-se ao portal, ao SAP (ou anonimização, quando a lei exige conservação), à plataforma de análise e aos registos; as cópias de segurança expiram dentro de um prazo definido e documentado; teste de aceitação com um registo fictício.
- **Retificação:** a correção feita no portal reflete-se no SAP e na plataforma de análise, com um único «dono» do dado.
- **Portabilidade:** exportação dos dados do titular em formato estruturado e legível por máquina (por exemplo, JSON ou CSV) com teste automatizado.
- Opcional: **limitação do tratamento** (marcar o registo como «em disputa» e excluí-lo das análises) e **retenção** (tarefa que apaga ou anonimiza ao fim do prazo).

**4. Funcionalidade (c).** Problemas: (i) transferência para fora do Espaço Económico Europeu (capítulo V do RGPD) requer mecanismo legal e avaliação; (ii) a razão do custo não é uma base legal; (iii) uma cópia completa viola o princípio da minimização. **Alternativas:** manter a plataforma numa região da UE (o custo adicional entra no TCO do módulo 10); enviar só colunas necessárias e **pseudonimizadas ou agregadas**; definir retenção. **Perguntas a confirmar:** em que geography ficam dados e **metadados**, incluindo cópias de segurança; quais serviços são «não regionais» ou em pré-visualização e podem processar dados fora da região; quem é o subcontratante e que contrato de tratamento existe; que sub-subcontratantes há. Isto não é aconselhamento jurídico: as conclusões vão para o DPO e o jurídico.

**Critérios de autoavaliação:** trataste os contactos B2B como dados pessoais? Identificaste que a base legal e a DPIA são decisões do DPO, e não tuas? Os requisitos dos direitos são testáveis e cobrem cópias de segurança e registos? Distinguiste «região certa» de «conformidade»?

### Exercício 28

**1. Riscos e controlos**

| Risco | Controlo | Confirmar na documentação |
|---|---|---|
| Dados sensíveis ou pessoais enviados ao modelo | Proibir dados reais de clientes em *prompts*; contas da empresa; dados fictícios ou anonimizados | Treino e retenção por tipo de conta; retenção zero |
| Código gerado inseguro ou incorreto | Revisão humana obrigatória, CI, testes, análise estática, proteção de ramos | n/a |
| Segredos expostos (`.env`, chaves) | Sem segredos em pastas de trabalho; regras de negação de leitura; *sandbox*; identidades de desenvolvimento com menor privilégio | Limites das regras de negação (melhor esforço) e opções de *sandbox* |
| Cadeia de fornecimento (dependências, servidores MCP, *plugins*) | Lista aprovada; revisão de novas dependências; `bun audit`; SBOM | Funcionamento atual dos *scripts* de instalação do Bun |
| Injeção de *prompt* | Permissões que pedem aprovação; rede restrita; não processar conteúdo não confiável sem isolamento | Modos de permissão e rede por omissão |
| Registos locais com código ou *prompts* | Disco cifrado; retenção das transcrições; telemetria definida por política | Onde e por quanto tempo ficam as transcrições locais |

**2. Política de uma página (modelo)**

    POLÍTICA DE USO DE ASSISTENTES DE IA DE PROGRAMAÇÃO (v1)
    1. Ferramentas aprovadas: Claude Code e Codex, só com contas da empresa
       (contas pessoais proibidas). Novas ferramentas: pedido ao arquiteto e à segurança.
    2. Dados: PERMITIDO código dos repositórios da empresa, dados fictícios.
       PROIBIDO dados pessoais reais, credenciais, chaves, dados de clientes ou de colaboradores.
    3. Segredos: nunca em prompts, em ficheiros de instruções nem em pastas de trabalho.
       Credenciais de desenvolvimento, menor privilégio, nunca de produção.
    4. Permissões: o assistente pede aprovação para comandos e escritas; regras de negação
       para ficheiros de segredos; sandbox ativo; configuração gerida pela empresa.
    5. Revisão: todo o código é revisto por uma pessoa como qualquer pull request.
       O assistente não faz merge, deploy nem acede a produção. Quem submete responde pelo código.
    6. Ferramentas externas (MCP, plugins): só da lista aprovada.
    7. Incidentes: dados indevidos num prompt ou segredo exposto = reportar no próprio dia
       à segurança e ao DPO; rodar o segredo.
    8. Revisão da política: de seis em seis meses ou quando mudarem os termos dos fornecedores.

**3. ADR (modelo)**

    ADR-NNN Adoção de assistentes de IA de programação com controlos
    Estado: Proposto
    Contexto: 8 developers pedem Claude Code e Codex. Incidentes já ocorridos: dados reais num prompt,
      .env acessível, conta pessoal. Requisitos: RGPD, proteção do código, produtividade.
    Decisão: permitir as duas ferramentas só com contas da empresa e a política v1 (dados proibidos,
      permissões e sandbox, revisão humana). Reavaliar em 6 meses com métricas de incidentes e
      de tempo de entrega.
    Alternativas:
      A. Proibir: elimina o risco de dados, mas leva a uso paralelo com contas pessoais (shadow IT).
      B. Permitir livremente: máxima produtividade, risco inaceitável de dados e segredos.
      C. Permitir com controlos (escolhida): risco residual gerido, exige custo de governação.
      D. Usar o modelo através de um fornecedor cloud da empresa: pode melhorar residência e
         contratos, mas exige verificar o que cada fornecedor processa. Complementar a C.
    Consequências: custo de configurar e manter a política; formação; monitorização; dependência
      de fornecedores externos; revisão semestral.

**4. Caso do CSV com clientes reais (passos)**
1. **Contém:** parar de usar a sessão e registar o que aconteceu (que ficheiro, quando, que conta, que ferramenta). Conservar prova, não apagar nada às cegas.
2. **Escalar no próprio dia** à segurança e ao **DPO**: são eles que avaliam se houve violação de dados pessoais e se há **prazo de notificação** à autoridade de controlo (o RGPD prevê, em regra, notificação até 72 horas após conhecimento, quando aplicável: ver artigo 33.º). Tu não decides sozinho: é uma avaliação jurídica e de risco.
3. **Apurar o alcance** com a documentação do fornecedor e o tipo de conta (treino, retenção, pedido de eliminação, retenção zero), e se a conta era pessoal ou da empresa.
4. **Corrigir a causa:** impedir contas pessoais, dados de teste fictícios, regras no ambiente, formação. Registar a lição no ADR e na política.
5. **Comunicar** sem culpabilizar a pessoa: o objetivo é que os incidentes sejam reportados cedo.

**Critérios de autoavaliação:** distinguiste factos verificados na documentação do que ainda tens de confirmar? A política é curta, concreta e verificável? O ADR tem alternativas reais, incluindo «proibir»? Reconheceste que a decisão sobre violação de dados pessoais pertence ao DPO e ao jurídico?

## Módulo 08 · Qualidade operacional

### Exercício 29

**1. Disponibilidade composta (série = produto):**

    0,9995 x 0,999 x 0,9999 x 0,999 x 0,995 = 0,99241  ->  99,24%

Indisponibilidade: (1 - 0,99241) x 30 x 24 x 60 min = cerca de **328 min/mês (5,5 horas)**, mais de sete vezes o permitido pelo SLO (43,2 min).

**2.** **Não cumpre.** O elo mais fraco é o **SAP (99,5%)**, que sozinho já consome 216 minutos por mês. Seguem-se a API e o email (99,9% cada).

**3. Melhorias por passos:**

| Passo | Alteração | Cálculo | Disponibilidade | Paragem/mês |
|---|---|---|---|---|
| A | Estado atual | ver acima | 99,24% | 328 min |
| B | A encomenda é aceite sem esperar pelo SAP (o envio ao SAP passa a assíncrono; o crédito é validado depois ou com valores em cache) | 0,9995 x 0,999 x 0,9999 x 0,999 | 99,74% | 112 min |
| C | O email de confirmação sai do caminho crítico (envio assíncrono, com repetição se falhar) | 0,9995 x 0,999 x 0,9999 | 99,84% | 69 min |
| D | Duas instâncias da API em zonas de disponibilidade diferentes | API = 1 - (0,001)^2 = 99,9999%; total = 0,9995 x 0,999999 x 0,9999 | 99,94% | 26 min |

Com o passo D o fluxo cumpre o SLO (99,94% > 99,9%). A encomenda fica gravada na base de dados e o SAP e o email são processados depois, sem que o cliente espere por eles.

**Cuidados:** a fórmula do paralelo assume falhas independentes. Se as duas instâncias partilharem o mesmo balanceador, a mesma zona ou a mesma dependência, o ganho é menor. Os valores são ilustrativos: confirma os SLAs reais e o seu âmbito. O SAP continua a ter de estar disponível para a encomenda chegar ao armazém, mas o cliente deixou de depender dele para concluir a compra. Sem o passo D (só B e C), 99,84% ainda falhava, por isso a redundância da API foi necessária.

**4. SLO vs SLA:** «O SLO (99,9%) é a meta interna que a equipa se compromete a atingir e que usa para decidir onde investir e quando reagir. O SLA é o contrato com o cliente, com consequências financeiras se falhar, e deve ser mais conservador (por exemplo 99,5%) para termos margem antes de falhar a promessa.»

**Critérios de autoavaliação:** multiplicaste (não somaste) as disponibilidades; converteste para minutos; identificaste o SAP como elo mais fraco; propuseste retirar dependências do caminho crítico antes de pedir «mais noves»; avisaste que o paralelo exige independência.

---

### Exercício 30

**1 e 2. Objetivos e estratégia (valores propostos; o negócio tem a palavra final):**

| Sistema | RPO | RTO | Estratégia | Justificação |
|---|---|---|---|---|
| Portal de encomendas | 5 a 15 min | 1 a 2 h | **DR morno** numa segunda região, com réplica de dados; infraestrutura mínima pré-implantada | Gera receita; encomendas perdidas não se recuperam; orçamento não justifica ativo-ativo |
| Stock em tempo real | Poucos minutos ou nenhum | 2 a 4 h | **Reconstruir a partir do SAP**; backup apenas da configuração | Os dados são derivados; o RPO real é o do SAP |
| SAP | Definido com a equipa SAP e o hosting (típico: minutos) | Definido com a equipa SAP (horas) | Estratégia do SAP em servidores próprios, com **backup das bases e réplica**; se estiver em VMs, avalia o Site Recovery | É a fonte de verdade; é um dado do contrato com quem o opera. Confirma a oferta |
| Aplicações Delphi de balcão | Igual à base de dados central | 4 a 8 h | **Contingência manual** + restauro do servidor aplicacional; sem DR dedicado | O negócio já tem procedimento manual |
| Relatórios de gestão | 24 h | 1 dia útil | **Apenas backup** (regenera-se) | Baixo impacto |

Serviços Azure: **Azure Backup** para cópias com retenção (VMs, bases de dados, ficheiros) e **Azure Site Recovery** para replicação e failover de VMs. Equivalentes AWS: **AWS Backup** e **AWS Elastic Disaster Recovery**. Para bases de dados geridas, confirma na documentação se a funcionalidade nativa de georreplicação serve melhor do que o Site Recovery.

**3.** A réplica copia **também os erros**: se alguém apagar encomendas por engano, ou se um ransomware cifrar os dados, a réplica reproduz o dano segundos depois. O backup guarda **pontos no tempo anteriores ao incidente**, com retenção e, idealmente, isolamento. Réplica protege de falhas de infraestrutura; backup protege de erros e de ataques.

**4. Teste de recuperação:**

- **Restauro de backup**: trimestral para sistemas críticos, anual para os restantes, restaurando para um ambiente isolado e verificando integridade (conta encomendas, valida totais).
- **Exercício de DR (drill)**: pelo menos anual para o portal: simular a perda da região principal, fazer failover para a região secundária, cronometrar até o portal voltar a aceitar encomendas, e fazer o failback.
- **Prova do RTO**: registar tempos reais por passo; comparar com o objetivo; apresentar à direção o resultado e as lacunas (por exemplo, «o RTO real foi 3 h, o objetivo é 2 h; para chegar lá falta automatizar X»).
- Critérios de ativação do DR e responsáveis escritos num plano.

**Critérios de autoavaliação:** RPO e RTO diferentes por criticidade (não o mesmo para tudo); justificaste com o impacto no negócio; distinguiste backup de DR; o plano inclui testes com datas e responsáveis.

---

### Exercício 31

**1. Mecanismo.** Com o SAP a responder em 40 s e timeout de 100 s, cada chamada ocupa uma thread da API durante 40 s. O pool de 200 threads é **partilhado** por stock, catálogo e preços. Quando todas as threads ficam presas à espera do SAP, **qualquer** pedido (mesmo de catálogo, que não usa o SAP) fica em fila: é uma **falha em cascata por esgotamento de recursos partilhados**, exatamente o problema que o padrão Bulkhead resolve. Os retries imediatos em todas as camadas multiplicaram o trabalho; e o «Erro 500» sem degradação não deu ao utilizador nenhuma alternativa. Depois de o SAP recuperar, a fila de pedidos pendentes e as repetições acumuladas continuaram a gerar carga, por isso o regresso ao normal demorou.

**2. Amplificação.** Três camadas repetem, cada uma com 4 tentativas:

    4 (portal) x 4 (API) x 4 (adaptador) = 64 chamadas ao SAP por cada pedido do utilizador

Cada utilizador pode gerar até 64 chamadas a um SAP já lento: o retry **mantém-no em baixo** em vez de o deixar recuperar.

**3. Desenho corrigido:**

    Utilizador --> Portal --> API de stock --> Adaptador SAP --> SAP
                                |                  |
                           cache de stock     circuit breaker
                        (último valor + hora)   + pool próprio

| Medida | Valor proposto | Justificação |
|---|---|---|
| Orçamento de tempo | Utilizador espera 5 s no máximo; portal 4,5 s; API 4 s; adaptador 3,5 s | Cada camada tem um limite inferior ao da que a chama, para falhar antes de quem espera |
| Timeout por tentativa ao SAP | 1,5 s (p99 normal + margem; calibra com a medição real) | O SAP normal responde em cerca de 1 s; 100 s é inútil |
| Retry | **Só no adaptador**: máx. 1 repetição, com espera aleatória até 200 ms (backoff com jitter); só para erros transitórios e operações idempotentes (leituras) | Evita a multiplicação por camadas; o pior caso passa a 2 chamadas |
| Circuit breaker | Abre se mais de 50% de falhas em 20 chamadas ou 10 s; meio-aberto após 30 s com poucos pedidos de teste | Deixa o SAP recuperar sem carga |
| Bulkhead | Pool separado para o SAP (por exemplo 40 de 200 threads), catálogo e preços com pools próprios | A lentidão do SAP só afeta o stock |
| Degradação graciosa | Com o circuito aberto, a API devolve o **último stock em cache** com «atualizado há X min» e aceita encomendas para validação posterior | O portal continua útil; a informação antiga fica assinalada |

Pior caso do adaptador: 2 tentativas x 1,5 s + espera até 0,2 s = **3,2 s**, que cabe nos 3,5 s do orçamento. Se não coubesse, baixavas o timeout por tentativa ou eliminavas a repetição: o retry tem de caber no orçamento de tempo. Valores finais são hipóteses a validar em teste.

**4. Validação.** Num ambiente de pré-produção, com um SAP simulado: (a) injetar latência de 40 s no simulador durante 10 minutos com carga constante; (b) esperado: circuit breaker abre em poucos segundos, o catálogo e os preços continuam dentro do SLO, o stock responde da cache com a indicação de idade, o SAP simulado deixa de receber mais de 2 chamadas por pedido, e 1 minuto após remover a falha o circuito fecha e o tráfego normaliza sem pico de repetições. Repetir com o SAP devolvendo erros e com o SAP desligado. Repetir após cada mudança relevante.

**Critérios de autoavaliação:** identificaste o pool partilhado como causa da cascata; calculaste 64; puseste retries numa só camada; os timeouts decrescem de fora para dentro; a degradação avisa o utilizador; descreveste o teste e o resultado esperado.

---

### Exercício 32

**1. Capacidade.** Capacidade por instância = 50 pedidos/s (a 70% de CPU). Para 200 pedidos/s: 200 / 50 = **4 instâncias** para o pico normal. A direção exige aguentar a perda de uma zona (de 3): as 2 zonas restantes têm de suportar 4 instâncias, logo **2 por zona, 6 no total**. Em funcionamento normal as 6 instâncias partilham 200 pedidos/s (cerca de 33 pedidos/s cada, ~47% de CPU), com margem. Perdida uma zona, as 4 que restam servem 50 pedidos/s cada, exatamente no limite de 70% de CPU. Para folga adicional, acrescenta 1 instância por zona (9 no total, 3 por zona), decisão de custo a apresentar à direção.

**2. Testes de carga** (por exemplo com Azure Load Testing, ou JMeter/Locust):

| Cenário | Objetivo | Critério de falha |
|---|---|---|
| Carga | 200 pedidos/s sustentados durante 1 h | Menos de 99,9% com sucesso, ou p95 acima de 2 s |
| Picos | Subida brusca de 40 para 200 pedidos/s em 1 minuto | O autoscale não acompanha, erros acima do SLO |
| Esforço | Aumentar até 300 pedidos/s | Registar o ponto de rutura e o gargalo (BD? SAP?) |
| Resistência | 150 pedidos/s durante 8 horas | Memória ou ligações a crescer |
| Falha de zona | Carga de 200 pedidos/s com uma zona desligada | Violação do SLO |

Ambiente parecido com produção (mesmos escalões e configuração), **dados sintéticos**, e **nunca contra o SAP de produção** (usar simulador). Medir também a base de dados e o SAP, que costumam ser o gargalo real. Integrar os critérios de falha no pipeline (módulo 09).

**3. Observabilidade.**

- **SLIs:** (1) % de pedidos concluídos sem erro; (2) % de pedidos abaixo de 2 s; (3) idade do stock mostrado (frescura).
- **Logs** estruturados com identificador de correlação, sem dados pessoais desnecessários (RGPD); **métricas** de pedidos/s, erros, latência p95/p99, CPU, ligações à BD, tamanho da fila para o SAP, estado do circuit breaker; **traços** ponta a ponta portal -> API -> SAP para ver onde se perde o tempo (por exemplo, Application Insights com OpenTelemetry, confirmando o suporte para Bun).
- **Alertas** (Azure Monitor, com grupos de ação):

| Alerta | Dispara quando | Quem é notificado |
|---|---|---|
| Erros | Mais de 1% de erros durante 5 min | Pessoa de prevenção (urgente) |
| Latência | p95 acima de 2 s durante 10 min | Pessoa de prevenção |
| Fila para o SAP | Mais de 500 mensagens há 10 min | Equipa de integração e equipa SAP |
| Stock desatualizado | Idade do stock acima de 15 min | Equipa do portal (não urgente) |

Alertas sobre **sintomas** (o que o utilizador sente, ligado ao SLO) em vez de causas (CPU a 80%) porque a CPU alta pode ser normal e inofensiva, enquanto uma falha real pode não mexer na CPU: o alerta de sintoma deteta qualquer causa e reduz o ruído. As causas servem para diagnóstico, nos painéis.

**4. Runbook: «latência acima de 2 s durante 10 minutos».**

    Gatilho:      alerta de latência p95 > 2 s por 10 min
    Impacto:      SLO em risco; clientes a desistir da compra
    Verificar:    1) painel: erros e CPU das instâncias? 2) autoscale ao máximo?
                  3) base de dados (CPU, bloqueios)? 4) SAP/circuit breaker?
                  5) deploy recente? 6) traços: que dependência demora?
    Atuar:        capacidade -> aumentar o máximo do autoscale
                  deploy recente -> reverter para a versão anterior
                  SAP lento -> confirmar circuit breaker e cache; avisar equipa SAP
                  BD -> escalar escalão e analisar consultas lentas
    Escalar:      sem melhoria em 20 min -> responsável do portal; 45 min -> direção
    Comunicar:    mensagem no canal de operações; página de estado se > 30 min
    Confirmar:    p95 < 2 s durante 15 min; registar causa e duração
    Depois:       revisão sem culpados em 3 dias úteis; ações com dono e prazo; atualizar runbook

**5. Depois da campanha.** Manter o autoscale com mínimo baixo e máximo definido (regras por CPU ou fila, ou por horário em picos previsíveis) e reduzir o mínimo de 6 para o valor do tráfego normal respeitando a regra das zonas (por exemplo, 3 instâncias, uma por zona), reavaliar custo por pedido, guardar os resultados dos testes como base para a próxima campanha e registar as lições. A recomendação final depende do orçamento e do perfil de tráfego real observado.

**Critérios de autoavaliação:** consideraste a perda de uma zona no cálculo (6, não 4); testes com critérios ligados ao SLO e fora do SAP de produção; alertas sobre sintomas com destinatário; runbook com gatilho, verificações, escalonamento e revisão; apresentaste a decisão de custo como opção.

## Módulo 09 · DevOps e entrega

### Exercício 33

**Resposta-modelo**

Fluxo proposto (GitHub Actions ou Azure Pipelines, a lógica é a mesma):

    Pull request:
      compilar --> testes unitários --> análise estática --> testes de integração (BD de teste)
      (bloqueia o merge se falhar; revisão por 1 colega obrigatória)

    Merge em main:
      construir artefacto (uma vez, versão identificada pelo commit)
         --> implantar em DESENVOLVIMENTO (automático) --> verificação rápida
         --> implantar em TESTES (automático) --> testes de contrato e ponta a ponta
         --> APROVAÇÃO (responsável de produto/IT)
         --> implantar em PRODUÇÃO --> verificação pós-implantação

| Pergunta | Resposta |
|---|---|
| O que corre em cada PR | Compilação, unitários, análise estática, integração: o que é rápido e dá feedback antes do merge |
| O que só corre após o merge | Construção do artefacto, implantações, testes de ponta a ponta |
| Construído uma só vez | O artefacto (por exemplo, a imagem ou o pacote do portal) |
| O que muda entre ambientes | Configuração: endereços do SAP de testes ou produção, segredos (guardados num cofre), dimensão |
| Tipo | **Entrega contínua**: tudo é automático até produção, mas a ida para produção exige aprovação humana. Seria deployment contínuo se a aprovação fosse retirada |

Justificação: com uma equipa de 5 pessoas, ligação ao SAP e um sistema que «não pode parar», a aprovação manual é um controlo razoável no início. Pode retirar-se mais tarde, quando os testes automáticos tiverem provado fiabilidade. O fim das publicações a partir de máquinas pessoais elimina a causa das duas falhas (ficheiros esquecidos).

**Critérios de autoavaliação**
- O artefacto é construído uma vez e promovido, em vez de reconstruído por ambiente.
- Distinguiste o que corre no PR do que corre após o merge, com os testes rápidos primeiro.
- Colocaste a aprovação antes de produção e sabes explicar a diferença entre entrega e deployment contínuo.

---

### Exercício 34

**Resposta-modelo**

| Caso | Estratégia | Rollback | Sinal de falha | Suporte |
|---|---|---|---|---|
| A. Correção de arredondamento | **Rolling** ou **blue/green** simples, sem flag | Reverter para a versão anterior (reimplantar ou repetir a troca) | Testes de regressão do cálculo, alertas de erros e valores de descontos anómalos | App Service slots e swap (reverter repetindo o swap); no AWS, CodeDeploy blue/green |
| B. Ecrã de encomenda recorrente | **Feature flag** com ativação por percentagem (5%) e por grupo (equipa interna primeiro) | Desligar a flag, sem nova implantação | Taxa de erros do ecrã, conversão, feedback; a flag permite comparar quem a vê com quem não vê | Azure App Configuration (cenário Rollout); no AWS, confirmar o serviço equivalente |
| C. Mudança de coluna na BD | **Expand and contract** + **blue/green** ou rolling na API | Voltar à versão anterior, que continua compatível com o esquema | Erros de consulta, falhas nos clientes Delphi antigos | Slots ou rolling; migrações da BD em passos separados |

Notas de raciocínio:

- **A** não tem novidade funcional nem alteração de dados: o custo de uma flag não compensa. O risco é pequeno e a reversão da versão é fácil.
- **B** é uma experiência de negócio: o que se pede é separar **implantar** de **lançar**. A flag é de tipo release/experiment (curta); marca a tarefa de a remover quando a decisão estiver tomada.
- **C** é o caso difícil: blue/green reverte código, não dados. Sequência: (1) **expandir**: acrescentar a coluna nova, mantendo a antiga e escrevendo nas duas; (2) migrar os dados; (3) migrar consumidores (portal primeiro; Delphi delegação a delegação); (4) só quando nenhum cliente usar a coluna antiga, **contrair**: removê-la. Entretanto, a API tem de servir as duas gerações de clientes.

**Critérios de autoavaliação**
- Escolheste a estratégia pelo risco e pela reversão, e não pela moda (não usaste canary em tudo).
- No caso C tratou-se explicitamente a base de dados e os clientes que não atualizam ao mesmo tempo.
- Indicaste um sinal mensurável de falha para cada caso, e o seu mecanismo de reversão.

---

### Exercício 35

**Resposta-modelo**

1. **Débito:** frequência de implantação, tempo de espera de uma alteração, tempo de recuperação de uma implantação falhada. **Instabilidade:** taxa de falha das alterações e taxa de retrabalho das implantações.

2. **Portal:** entrega depressa e com frequência, mas com muitas implantações que falham ou geram retrabalho (25% e 18%): velocidade à frente da proteção; faltam testes ou controlos na pipeline. **Balcão:** entrega muito raramente, com lotes grandes (5 semanas de espera), com poucas falhas mas recuperação lenta (2 dias): estabilidade comprada à custa de velocidade, e quando falha demora a corrigir. Nenhuma é «melhor»: têm **contextos diferentes** (um serviço web com um só ambiente de produção, contra aplicações de balcão distribuídas por 12 delegações com versões em campo). A pergunta é mal formulada porque compara coisas de natureza diferente.

3. Intervenções:

| Intervenção | Equipa | Métrica esperada |
|---|---|---|
| Reforçar a pirâmide de testes (contrato e integração) e bloquear PRs que os falhem | Portal | Taxa de falha e retrabalho a descer |
| Automatizar a compilação do Delphi numa pipeline e publicar versões mais pequenas e frequentes | Balcão | Tempo de espera e frequência a melhorar |
| Registar *post-mortem* sem culpados e treinar a reversão (*rollback* ensaiado) | Comum | Tempo de recuperação a descer |

4. Resposta ao diretor (exemplo): «Agradeço o interesse nas métricas. Sugiro não as usar como ranking nem como meta de bónus individual: medem a capacidade do **sistema** de entrega, não o desempenho de pessoas, e as duas equipas têm contextos diferentes (serviço web contra aplicações distribuídas por 12 delegações). Se se transformarem em meta, as pessoas vão otimizar o número (por exemplo, partir implantações para subir a frequência) e perdemos o sinal. Proponho comparar cada equipa **consigo própria** ao longo do tempo e escolher, para cada uma, uma ou duas métricas a melhorar no semestre, com as intervenções acima. Posso trazer-vos a evolução trimestral.»

**Critérios de autoavaliação**
- Classificaste corretamente as cinco métricas nos dois grupos.
- Evitaste dizer «a equipa X é melhor» e explicaste o contexto.
- As intervenções são concretas e ligadas a uma métrica; a resposta ao diretor propõe alternativa, não só recusa.

---

### Exercício 36

**Resposta-modelo**

**1. Problemas e correções**

| # | Problema | Risco | Correção |
|---|---|---|---|
| 1 | `permissions: write-all` | O fluxo (e o assistente) pode escrever em tudo no repositório | Permissões mínimas por job (por exemplo `contents: write`, `pull-requests: write`, `issues: write` só onde for preciso) |
| 2 | Segredos ao nível do fluxo (`env:` global), incluindo a palavra-passe de produção | Qualquer passo, incluindo o que executa o assistente, vê os segredos | Segredos só no job/passo que precisa; nada de produção no job do assistente; identidade federada (OIDC) em vez de palavra-passe |
| 3 | Acionado por qualquer issue aberta, com o corpo da issue no *prompt* | Injeção de instruções (*prompt injection*): quem escreve a issue controla o que o assistente faz | Acionar só por pessoas autorizadas (a ação já exige permissão de escrita por omissão, mas não contes só com isso); tratar o texto da issue como dado não confiável; revisão do resultado |
| 4 | O assistente faz `push` para `main` | Alteração sem revisão humana | Proteção de ramo: o assistente abre um **pull request** num ramo próprio; revisão obrigatória |
| 5 | `--allowedTools "Bash"` sem restrições | Execução de comandos arbitrários no *runner* | Listar ferramentas e comandos específicos (por exemplo, leitura e edição de ficheiros e comandos de teste concretos) |
| 6 | `./deploy-producao.sh` no mesmo job, sem aprovação | Código gerado vai para produção sem testes, revisão nem aprovação | Separar a implantação: só a partir do ramo principal, depois de CI verde, com *environment* e aprovação de produção |
| 7 | Sem limites de custo nem de tempo | Execuções longas e custos inesperados | `--max-turns`, tempo máximo do job e controlo de concorrência |
| 8 | Sem rastreabilidade | Não se sabe que alterações vieram do assistente nem de que issue | Etiqueta/ramo identificável, referência à issue no PR, autor humano responsável |

**2. Fluxo redesenhado**

    issue (aberta por pessoa autorizada) + etiqueta «assistente» aplicada por um developer
       --> job do assistente: permissões mínimas, ferramentas listadas, SEM segredos de produção
       --> abre um PULL REQUEST num ramo próprio, referenciando a issue
       --> CI normal (testes, análises) corre sobre o PR, como em qualquer alteração
       --> REVISÃO HUMANA obrigatória (quem pediu não aprova o próprio PR)
       --> merge em main --> pipeline normal: artefacto, testes, aprovação de produção, implantação

**3. ADR (resumo)**

- **Título:** Uso de assistentes de IA no fluxo de desenvolvimento da Casa Nova.
- **Contexto:** equipa pequena, pressão de produtividade, código ligado ao SAP e a dados de clientes (RGPD). Os assistentes aceleram o trabalho mas são mais uma identidade com acesso ao repositório e podem produzir código plausível e errado.
- **Decisão:** permitir Claude Code e Codex em pull requests e em tarefas locais, com as regras: (a) o assistente nunca faz push para o ramo principal nem implanta; (b) revisão humana obrigatória e a pipeline normal aplica-se por inteiro; (c) autoria identificada (ramo, etiqueta ou texto do PR) e ligação à issue; o autor humano responde pela alteração; (d) permissões e ferramentas mínimas, sem segredos de produção; (e) só em repositórios autorizados e depois de rever as condições de privacidade e retenção de dados do fornecedor; (f) limites de turnos, tempo e custo, com consumo acompanhado; (g) revisão trimestral do que correu bem e mal.
- **Alternativas:** proibir (perde produtividade e leva ao uso escondido); permitir sem regras (risco de segurança e de qualidade); permitir só localmente, sem CI (menos risco, menos rastreabilidade).
- **Consequências:** mais carga de revisão; custo de CI e de API; necessidade de formar a equipa em revisão de código gerado; a política tem de ser revista quando os produtos mudarem.

**4. O que não sabes (exemplos válidos)**
- As condições exatas de **tratamento e retenção de dados** do fornecedor para o plano contratado, e se o código da empresa pode sair para ele.
- O comportamento e os limites das permissões das ações na versão que vais fixar, e o **custo real** por execução no teu repositório.

**Critérios de autoavaliação**
- Encontraste pelo menos seis problemas, incluindo permissões, segredos, injeção via issue, `push` direto, ferramentas irrestritas e implantação sem aprovação.
- O redesenho põe a revisão humana e a pipeline normal entre o assistente e a produção.
- O ADR tem alternativas e consequências reais (custos, carga de revisão), não só a decisão.

## Módulo 10 · Decisões, custos e negócio

### Exercício 37

**1. TCO a 5 anos**

| Linha | A. Construir | B. Comprar |
|---|---|---|
| Implementação + integração + formação (inicial) | 120 000 + 4 000 = **124 000** | 15 000 + 30 000 + 6 000 = **51 000** |
| Cloud por ano | 9 000 | 0 |
| Licenças por ano | 0 | 40 x 60 x 12 = 28 800 |
| Manutenção por ano | 0,5 x 50 000 = 25 000 | 0,2 x 50 000 = 10 000 |
| **Recorrente por ano** | **34 000** | **38 800** |
| Recorrente em 5 anos | 170 000 | 194 000 |
| **TCO a 5 anos** | **294 000 €** | **245 000 €** |

**2. Ponto de equilíbrio.** A licença custa 40 x 12 = 480 € por utilizador por ano. Com n utilizadores:

    B(n) = 51 000 + 5 x (480 x n + 10 000) = 101 000 + 2 400 x n
    A    = 294 000
    101 000 + 2 400 n = 294 000  ->  n = 80,4

Com 80 utilizadores B custa 293 000 € (ainda mais barata); com 81 custa 295 400 € e A passa a ser mais barata. **A partir de 81 utilizadores.** (Pressuposto: o preço por utilizador não muda com o volume. Na prática, negoceia-se desconto.)

**3. Fatores não financeiros e alternativa «configurar»**

- Diferenciação: registar visitas é uma comodidade (*commodity*), o que favorece comprar.
- Capacidade da equipa: construir exige manter código durante 5 anos com uma equipa interna pequena.
- *Lock-in* e saída: exportação dos dados de visitas, prazos contratuais, preço na renovação.
- Segurança, RGPD e localização dos dados dos clientes no SaaS.
- Integração com o SAP: é o ponto de maior incerteza do SaaS (30 000 € estimados).

Opção «configurar»: verificar se o SAP já usado pela empresa (ou um módulo de CRM/vendas que a empresa já licencie) cobre o registo de visitas com parametrização, e comparar o TCO desta terceira opção.

**4. Recomendação.** «Recomendo comprar a solução SaaS, porque o TCO a 5 anos é mais baixo (245 000 € contra 294 000 €) para 60 utilizadores e o processo não é um diferenciador do negócio. Condições: validar a integração com o SAP numa prova de conceito e exigir exportação dos dados em formato aberto no contrato; se o número de utilizadores passar de 80, reavaliamos.»

**Critérios de autoavaliação:** calculaste inicial e recorrente separados (294 000 e 245 000)? Chegaste a 81 utilizadores com uma fórmula e não por tentativa? Indicaste fatores que o dinheiro não mostra? A recomendação refere pressupostos e condições?

### Exercício 38

**1. Pontuação ponderada**

    F1 = (5x25 + 3x20 + 2x20 + 4x15 + 4x10 + 4x10) / 100 = 365 / 100 = 3,65
    F2 = (3x25 + 5x20 + 4x20 + 3x15 + 4x10 + 3x10) / 100 = 370 / 100 = 3,70
    F3 = (4x25 + 2x20 + 5x20 + 4x15 + 3x10 + 2x10) / 100 = 350 / 100 = 3,50

Ordem: **F2 (3,70) > F1 (3,65) > F3 (3,50)**. F2 e F1 estão praticamente empatados.

**2. Sensibilidade** (Preço 30, Competência Azure 15, os restantes iguais; soma 100)

    F1 = (5x15 + 3x20 + 2x30 + 4x15 + 4x10 + 4x10) / 100 = 335 / 100 = 3,35
    F2 = (3x15 + 5x20 + 4x30 + 3x15 + 4x10 + 3x10) / 100 = 380 / 100 = 3,80
    F3 = (4x15 + 2x20 + 5x30 + 4x15 + 3x10 + 2x10) / 100 = 360 / 100 = 3,60

Nova ordem: **F2 (3,80) > F3 (3,60) > F1 (3,35)**. O vencedor (F2) é o mesmo nos dois cenários, o que dá confiança; mas F1 e F3 trocam de lugar, por isso o segundo lugar depende dos pesos.

**3. Pesos depois das notas.** Torna-se possível ajustar os pesos até ganhar o fornecedor que já se preferia: a matriz deixa de ser um instrumento de decisão e passa a ser uma justificação. Os pesos acordam-se com os stakeholders **antes** de se ver qualquer proposta, e registam-se.

**4. RFP**

    1. Contexto da Casa Nova e objetivos do serviço
    2. Âmbito e requisitos (obrigatórios / desejáveis): monitorização, resposta a incidentes, integração SAP
    3. Requisitos de segurança, RGPD e localização dos dados
    4. SLA exigidos e modelo de reporte
    5. Formato obrigatório da resposta e preço (fixo, por consumo, extras, saída)
    6. Critérios de avaliação e pesos
    7. Calendário do processo e contacto único

Perguntas obrigatórias (exemplos): como medem e reportam o tempo de resposta e resolução? Que equipa concreta (nomes e certificações) vai trabalhar connosco? Que clientes com SAP e Azure podem servir de referência? Como é a transição de entrada e de saída (documentação, acessos, dados)? Que subcontratados tratam dados pessoais e onde?

Prova além da proposta: demonstração ou **prova de conceito** com um incidente simulado no nosso ambiente, e chamadas de referência a clientes parecidos.

**Critérios de autoavaliação:** o cálculo está certo (3,65 / 3,70 / 3,50 e 3,35 / 3,80 / 3,60)? Disseste que o resultado inicial é um quase empate? O RFP tem requisitos priorizados, formato de resposta e critérios transparentes? Pediste uma prova além do papel?

### Exercício 39

**1. Fluxos por ano**

| Ano | Benefício | Custo | Líquido | Acumulado |
|---|---|---|---|---|
| 0 | 0 | 200 000 | −200 000 | −200 000 |
| 1 | 70 000 | 50 000 | +20 000 | −180 000 |
| 2 | 140 000 | 50 000 | +90 000 | −90 000 |
| 3 | 140 000 | 50 000 | +90 000 | 0 |
| 4 | 140 000 | 50 000 | +90 000 | +90 000 |

(Benefício em regime pleno: 70 000 + 40 000 + 30 000 = 140 000 €; ano 1 a 50% = 70 000 €.)

**2. ROI e retorno**

    Benefícios = 70 000 + 3 x 140 000 = 490 000
    Custos     = 200 000 + 4 x 50 000 = 400 000
    ROI        = (490 000 - 400 000) / 400 000 = 22,5 %

O acumulado chega a zero no **fim do ano 3** (payback de 3 anos).

**3. Cenário -25%.** Benefício pleno = 105 000 €/ano; ano 1 = 52 500 €.

    Benefícios = 52 500 + 3 x 105 000 = 367 500
    ROI = (367 500 - 400 000) / 400 000 = -8,1 %   (sem retorno em 4 anos)

Redução máxima para ROI zero: 400 000 / 490 000 = 81,6 %, ou seja, os benefícios podem cair **18,4 %** (490 000 x 0,816 = 400 000). Com -25% o projeto deixa de se pagar no horizonte, por isso o caso é sensível.

**4. Resumo de uma página** (modelo):

    Decisão pedida: aprovar 200 000 € iniciais + 50 000 €/ano para stock em tempo real.
    Problema: vendas perdidas por rutura, stock excedente, tempo perdido nas delegações.
    Opções: (1) não fazer nada; (2) o projeto proposto; (3) versão reduzida (só as delegações maiores).
    Custo e retorno: 400 000 € em 4 anos; benefícios previstos 490 000 €; ROI 22,5 %; retorno ao fim do ano 3.
    Risco principal: os benefícios caírem mais de 18 %; mitigação: medir as vendas perdidas
    e o stock excedente antes e depois, e rever o projeto no fim do ano 1.
    Opção "não fazer nada": mantém as perdas (70 000 + 40 000 + 30 000 €/ano estimados) e o risco de clientes irem à concorrência.

Quem valida os benefícios: os **donos do negócio** (direção comercial, logística e operações), porque são eles que vivem os números e que se comprometem a medi-los depois. A TI valida os custos e o prazo.

**Critérios de autoavaliação:** a tabela acumula corretamente até 0 no ano 3? Calculaste 22,5 % e −8,1 %? Explicaste o que a sensibilidade mostra? O resumo tem a opção «não fazer nada» e um marcador de revisão?

### Exercício 40

**1. Pontuação e ordem**

| # | Dívida | Cálculo | Pontuação |
|---|---|---|---|
| 6 | Palavras-passe numa folha de cálculo | 5 x 4 / 1 | 20,0 |
| 1 | Cópias de segurança nunca testadas | 5 x 2 / 1 | 10,0 |
| 5 | *Logs* sem formato comum | 3 x 4 / 2 | 6,0 |
| 2 | *Deploys* manuais | 3 x 5 / 3 | 5,0 |
| 3 | Módulo de preços sem testes | 4 x 4 / 4 | 4,0 |
| 4 | Biblioteca Delphi obsoleta | 3 x 2 / 4 | 1,5 |

Ajustes com critério: o item **4 não se paga**, porque a aplicação vai ser retirada em 12 meses (aceitar a dívida e registar a decisão). Os itens **6 e 1 são obrigatórios** independentemente da pontuação (segurança e recuperação: se os dados da integração se perderem, não há plano), e são baratos (esforço 1). O item 3, apesar da pontuação mais baixa, deve ser feito **antes** de alterar o cálculo de preços, para proteger a mudança.

**2. Estimativa de três pontos**

    Estimativa = (30 + 4 x 50 + 100) / 6 = 330 / 6 = 55 dias
    Incerteza  = (100 - 30) / 6 = 11,7 dias   ->  cerca de 43 a 67 dias (1 desvio)

Comunicação: «A migração demora cerca de 55 dias úteis de esforço, com um intervalo provável de 43 a 67. O pior caso (100) existe se a integração com o SAP revelar surpresas. Depois da prova de conceito das duas primeiras semanas reduzimos o intervalo e confirmamos a data.» Diz que **são dias de esforço**, e não prazo de calendário.

**3. Roadmap**

    AGORA (0-3 meses)                 A SEGUIR (3-9 meses)              MAIS TARDE (9+ meses)
    Resultado: segurança e confiança  Resultado: encomendas mais rápidas  Resultado: menos custo de legado
    - Retirar passwords da folha (6)  - Portal de encomendas              - Retirar aplicações Delphi
    - Testar backups (1)              - Migrar integração SAP para API      (e aceitar dívida 4)
    - Logs com formato comum (5)      - Testes do módulo de preços (3)    - Revisão da dívida restante
    - Deploys automatizados (2, início)

**4. Regra e métricas.** Regra: reservar uma percentagem fixa de cada ciclo (por exemplo, 15 a 20 %, a definir com a equipa) para dívida priorizada, e pagar dívida adjacente sempre que se tocar num módulo. Métricas: tempo médio para alterar o módulo de preços; número de incidentes por componente. Podes acrescentar o tempo de deploy e a percentagem de cobertura de testes.

**Critérios de autoavaliação:** o cálculo está certo (20; 10; 6; 5; 4; 1,5)? Reconheceste que a fórmula não decide sozinha? Calculaste 55 dias e a incerteza de 11,7? O roadmap liga cada bloco a um resultado de negócio e a detalhe decrescente?

## Módulo 11 · Migração e modernização

### Exercício 41

| # | Componente | Estratégia | Justificação | Gatilho para rever |
|---|---|---|---|---|
| 1 | ERP SAP | Retain (por agora) | Decisão de maior impacto; versão e plano de evolução por confirmar; as restantes peças isolam-se dele com ACL | Plano de evolução SAP definido, fim de suporte ou fim do contrato de hospedagem |
| 2 | App Delphi de balcão | Retain, com encapsulamento por API mais tarde | Funciona e os operadores conhecem-na; o problema é o acesso direto à BD, não a aplicação | Necessidade de novos canais ou de alterar o esquema da BD |
| 3 | Portal de encomendas | Rebuild, via *strangler* | Lento e difícil de evoluir; há requisito novo (stock em tempo real) | Se uma fatia revelar que o domínio estava mal compreendido |
| 4 | Servidor de ficheiros | Rehost | Estável, sem necessidade de mudar, baixo risco; liberta datacenter | Necessidade de partilha com parceiros ou fim de vida do hardware |
| 5 | Relatórios | Retire | Poucos utilizadores e dados já existentes no SAP; custo de migrar maior do que o valor | Surgirem requisitos que o SAP não cubra |
| 6 | RH à medida | Replace (SaaS) | Pouca diferenciação, muita manutenção; os recursos internos são mais bem usados noutro sítio | Se o SaaS não cumprir requisitos legais ou de dados |
| 7 | Tarefas agendadas de ficheiros | Rearchitect gradual | Frágeis e pouco documentadas; passam a APIs e mensagens à medida que as fatias migram | Depois de cada fatia, quando o ficheiro correspondente deixar de ser usado |

**Não migraria nesta fase:** o SAP (componente 1), porque condiciona tudo e exige a decisão sobre a sua evolução antes de qualquer movimento. **Não faria rehost sem corrigir:** o portal (3), porque o rehost leva o problema de desempenho para a cloud sem o resolver (a documentação da Azure desaconselha rehost de cargas problemáticas).

**Critérios de autoavaliação:** usaste o vocabulário correto (replace e não «repurchase» no contexto Azure)? Cada estratégia tem justificação ligada ao negócio e um gatilho? Evitaste «reescrever tudo»? Identificaste o SAP como decisão prévia?

### Exercício 42

**Fase 1:**

    Clientes (portal, balcão) --> [ Fachada / API Management ] --> Legado (SAP + BD de balcão)
                                          (100% dos pedidos)

**Fase 2:**

    Clientes --> [ Fachada ] --+--> Serviço de stock (novo) --> [ ACL ] --> SAP
                               |            ^
                               |            +-- eventos / sincronização de stock
                               +--> Legado (encomendas, faturação, resto)

**ACL:** entre o serviço novo e o SAP/BD legada. Traduz o modelo (campos, códigos de artigo, unidades, estados) do SAP para o modelo do serviço novo e vice-versa, e trata protocolo e formatos. **Não deve** conter regras de negócio nem orquestração (ficam no serviço novo), nem ser a única forma de acesso sem observabilidade (correlation IDs, métricas de latência e de erros de tradução).

**Ordem das fatias:**
1. **Consulta de stock:** valor alto (é o requisito novo), risco baixo (leitura, sem alterar dados); permite mostrar resultados cedo.
2. **Criação de encomendas:** valor alto, risco médio (escrita, regras, integração com o SAP); só depois de a primeira fatia validar fachada e ACL.
3. **Faturação:** risco alto (fiscal, contabilidade) e valor de mudança menor; fica para o fim ou fica no SAP.

**Critérios para desativar o legado:** (a) nenhum tráfego a chegar-lhe pela fachada durante um período definido; (b) nenhum outro sistema, relatório ou tarefa agendada depende dele (descoberta de dependências validada); (c) dados reconciliados e histórico arquivado ou migrado.

**Riscos da fachada:** ponto único de falha ou estrangulamento de desempenho (mitiga-se com redundância e testes de carga); tornar-se arquitetura permanente por esquecimento (mitiga-se com plano de remoção e dono).

**Critérios de autoavaliação:** a fachada vem antes das fatias? A ACL só traduz? A ordem justifica-se com valor e risco? Tens critérios objetivos de desativação?

### Exercício 43

1. **Quase sem paragem**, porque a empresa não pode parar em horário de balcão. O custo é mais complexidade (replicação contínua) e testes prévios obrigatórios. Se existir uma janela noturna longa e a BD for pequena, a migração com paragem seria mais simples: avalia o tamanho e o tempo de ensaio.
2. **Fases:** carga inicial (ETL) para a BD gerida; sincronização contínua (CDC); validação (contagens, somas, amostras); **go/no-go** com decisão formal; cutover (apontar as aplicações para o destino); período de observação (rollback ainda possível, porque a origem e a sincronização inversa ou a origem intacta existem); remoção do legado. **Ponto sem retorno:** a remoção do legado (e o fim da sincronização), porque depois disso voltar atrás exige restaurar e repetir alterações.
3. **Critérios de falha (exemplos):** (a) taxa de erros das operações de encomenda acima de um limite acordado durante 10 minutos; (b) tempo de resposta p95 acima do acordado; (c) divergência nas validações de dados acima do tolerado; (d) falha em testes de fumo críticos (criar e consultar encomenda); (e) indisponibilidade superior à janela aprovada. Decide o dono do serviço com o responsável do negócio, com autoridade de rollback definida antes.
4. **Riscos (exemplo):**

| Risco | Prob. / impacto | Mitigação | Sinal de alerta |
|---|---|---|---|
| Dependência não descoberta (relatório ou tarefa que lê a BD) | Alta / Alto | Descoberta e entrevistas; agrupar em caso de dúvida | Falha só vista após ensaio |
| Divergência de dados | Média / Alto | Reconciliação; uma fonte de verdade | Contagens diferentes |
| Atraso do *cutover* | Média / Alto | Ensaio completo cronometrado; rollback testado | Ensaio mais longo do que a janela |
| Equipa sem experiência no serviço gerido | Média / Médio | Formação e ambiente de teste; apoio de parceiro | Erros repetidos nos ensaios |

5. **Calendário:** concluir ensaios e cutover **antes** da época alta, ou adiar para depois dela. Com oito semanas e uma BD crítica, o mais seguro é fazer os ensaios agora, congelar alterações na época alta e executar o cutover depois, salvo se os ensaios mostrarem margem confortável. Evitar migrar em períodos críticos é recomendação da documentação da Azure.

**Critérios de autoavaliação:** o rollback foi definido antes e é testável? Há um ponto sem retorno explícito? Os critérios de falha são mensuráveis? O calendário respeita a época alta?

### Exercício 44

1. **Decisões:**

| App | Decisão | Razão |
|---|---|---|
| A (balcão) | **Encapsular com API** | Valor alto e uso diário; o problema é o acesso direto à BD; permite integrar com o portal sem reescrever a interface |
| B (armazém) | **Manter** | Dependências de hardware (leitores, impressora) e conhecimento concentrado: reescrever é arriscado sem recuperar conhecimento. Ação: documentar e reduzir o risco do «fator camião» |
| C (relatórios) | **Retire** | Uso mensal e lógica duplicada no SAP; migrar custa mais do que vale |

2. **ADR (aplicação A):**

    Título: Encapsular a aplicação de balcão com uma API em vez de reescrever.
    Estado: Proposto.
    Contexto: A aplicação Delphi de balcão acede diretamente à BD, o que impede mudar o esquema
    e bloqueia a integração com o portal novo. Funciona e os operadores dominam-na.
    Decisão: Criar uma API estável (stock e encomendas) e migrar a aplicação para a consumir,
    por fatias, mantendo a interface VCL.
    Alternativas: (1) manter com acesso direto à BD (acoplamento mantém-se); (2) reescrever como
    aplicação web (custo e risco elevados, perde-se comportamento não documentado).
    Consequências: + desacoplamento da BD, integração com o portal; - nova API e ACL para
    operar, esforço de alterar o código existente. Gatilho para rever: se o código se revelar
    inviável de alterar, avaliar rebuild.

3. **API:** operações como `GET /stock/{artigo}`, `GET /encomendas/{id}`, `POST /encomendas`, `PATCH /encomendas/{id}/estado`. Hospedagem: serviço novo (por exemplo, em Bun) em Azure, atrás do API Management; ou RAD Server, se a equipa quiser manter a lógica em Delphi (confirma licenciamento e requisitos). **ACL** entre a API e o SAP: traduz o modelo SAP (códigos, unidades, estados) para o modelo da API; a aplicação Delphi nunca fala diretamente com o SAP.
4. **Maior risco:** comportamento do código existente não documentado, que a API pode alterar sem querer. Redução: testes de caracterização (comparar respostas da API com o comportamento atual), migração por fatias e rollback para o acesso antigo durante o período de transição. **A confirmar:** versão do Delphi usada e suporte atual, licenciamento (por exemplo, para o RAD Server), estado e acesso ao código-fonte, quem mantém a aplicação.

**Critérios de autoavaliação:** as decisões usam os critérios (e não preferência pessoal)? O ADR tem alternativas e consequências? A API é pequena e orientada ao negócio? Identificaste o que falta confirmar?

## Módulo 12 · Comunicação e liderança

### Exercício 45

**Mensagens-modelo (4 linhas no máximo):**

1. **Administração:** «Vamos substituir a troca diária de ficheiros entre o SAP e o portal por atualizações em minutos. Resultado: stock online fiável e menos encomendas perdidas por informação desatualizada. O investimento da primeira fase está no documento anexo; peço apenas a vossa validação do arranque.»
2. **Operações de armazém:** «Quando deres saída ou entrada de um artigo no SAP, o portal passa a refletir a alteração em minutos, e não na atualização seguinte. O teu trabalho no SAP não muda. Vamos fazer um piloto em duas delegações; preciso que me indiques as situações de stock mais difíceis para testarmos.»
3. **Equipa Delphi:** «O SAP passa a publicar eventos de movimento; um serviço novo mantém uma vista de stock que as aplicações de balcão poderão consultar por uma API. Os ficheiros atuais mantêm-se durante a transição. Preciso de saber que campos e formatos as aplicações dependem, para não quebrarmos nada.»
4. **Segurança:** «Os eventos transportam referências de artigo e quantidades, sem dados pessoais. O canal exige autenticação e fica numa rede privada. Peço revisão do diagrama de fronteiras e da lista de controlos antes da fase 1.» (Ajusta ao que o desenho final garantir; não afirmes controlos que ainda não existam.)

| Público | Precisa de decidir/fazer | Destacaste | Deixaste de fora |
|---|---|---|---|
| Administração | Validar o arranque e o investimento | Resultado de negócio, risco de não fazer | Mecanismo de eventos, nomes de ferramentas |
| Operações | Dar casos de teste, aceitar o piloto | O que muda (e o que não muda) no dia a dia | Arquitetura interna |
| Equipa Delphi | Indicar dependências, planear a transição | Compatibilidade, ficheiros mantidos, API | Argumentos de negócio detalhados |
| Segurança | Rever fronteiras e controlos | Dados tratados, canal, autenticação | Custos, calendário |

**Perguntas de confirmação:** administração, «o que precisas de ver na fase 1 para continuares a apoiar?»; operações, «que situação te preocuparia mais num dia de rutura?»; Delphi, «que aplicação seria a primeira a quebrar se o ficheiro mudasse?»; segurança, «que risco te deixaria desconfortável se avançássemos já?»

**Critérios de autoavaliação:** cada mensagem começa pelo que interessa a quem lê, não por ti; evitaste siglas com a administração e com as operações; cada mensagem tem um pedido ou ação clara; não prometeste o que ainda não está decidido.

### Exercício 46

**One-pager modelo:**

    Stock em tempo real e portal de encomendas — Fase 1
    Recomendação: aprovar a fase 1 (2 delegações, 8 semanas).

    Problema
    O stock mostrado online pode estar desatualizado até uma hora e as
    delegações reintroduzem encomendas à mão. Resultado: encomendas
    perdidas e trabalho duplicado. (Ilustrativo: acrescentar o valor
    real fornecido pela área comercial.)

    Objetivo e métricas
    Stock visível em minutos; encomendas online sem reintrodução manual.
    Métricas: atraso do stock visível, n.º de encomendas reintroduzidas,
    n.º de encomendas perdidas por falta de stock aparente.

    Solução (contexto)
                      +------------------+
      Clientes ------>|  Portal de       |
                      |  encomendas      |
                      +--------+---------+
                               |
                      +--------v---------+      +-------------+
                      | Camada de        |<---->| SAP (fonte  |
                      | integração (Azure)|     | de verdade) |
                      +--------+---------+      +-------------+
                               |
                      +--------v---------+
                      | Apps Delphi      |
                      | (balcões)        |
                      +------------------+

    Opções
    A. Não fazer nada     sem investimento; a perda continua
    B. Remendar           baixo agora; manutenção a crescer
    C. Integração por     médio, repartido por 3 fases;
       eventos em Azure   risco controlável em fases   <-- recomendada

    Custo e prazo
    Fase 1: 8 semanas, 2 delegações (valor a indicar após estimativa).
    Fases 2 e 3 só avançam com resultados da fase 1.

    Riscos
    1. Dependência de 2 pessoas SAP      -> documentar e formar
    2. Resistência nas delegações        -> piloto, embaixadores
    3. SAP não pode parar                -> integração sem alterar o núcleo

    Decisão pedida
    Aprovar a fase 1, nomear um responsável de negócio e libertar a
    equipa SAP 2 dias por semana durante 8 semanas.

**Três perguntas difíceis:**

- «Quanto custa no total?» Resposta: «Só comprometemos a fase 1; o custo das seguintes depende do resultado dela e será apresentado antes de avançarmos. A estimativa da fase 1 é X, com margem Y (confirmar com a equipa).»
- «E se correr mal?» Resposta: «A fase 1 é limitada a duas delegações e não altera o SAP; se falhar, perdemos o investimento da fase, não a operação.»
- «Porque não esperar um ano?» Resposta: «Esperar também é uma decisão: as perdas e o trabalho duplicado continuam, e a dependência das duas pessoas SAP agrava-se.»

**Critérios de autoavaliação:** a recomendação está no topo; há uma opção «não fazer nada»; o pedido é concreto (decisão, pessoas, prazo); não inventaste números sem os marcar como a confirmar; cabe numa página.

### Exercício 47

**1. Antes da sessão.** Pede, com pelo menos 3 a 5 dias úteis de antecedência, o one-pager, o diagrama de contexto e contentores, o ADR e uma lista de dúvidas da própria equipa. Objetivo declarado: **aconselhar** (a equipa decide, ouve os revisores e regista), porque a equipa está a estrear o processo e o objetivo é aprender sem criar medo. Se houver risco regulatório ou de dados pessoais, parte da revisão pode ter caráter de aprovação (por exemplo, a parte de segurança): diz-o antes.

**2. Agenda (60 minutos).**

| Tempo | Atividade |
|---|---|
| 0-5 | Objetivo, regras (criticamos a proposta, não as pessoas) e papéis |
| 5-15 | A equipa apresenta o problema, as opções e a decisão |
| 15-45 | Perguntas por tema (negócio, falhas, segurança e dados, operação) |
| 45-55 | Riscos principais e decisões em aberto, com responsável |
| 55-60 | Resumo em voz alta e próximos passos |

**3. Oito perguntas.**

1. Que problema de negócio resolve e como se mede o sucesso?
2. Que alternativas consideraram (por exemplo, não expor diretamente a leitura ao SAP) e porque ficaram de fora?
3. O que acontece quando o SAP está indisponível ou lento?
4. Como se evita que a API sobrecarregue o SAP em picos de procura?
5. Que dados pessoais circulam, onde ficam e quem lhes acede?
6. Como se autentica e autoriza cada cliente, e como se impede ver encomendas alheias?
7. Quem opera isto fora de horas e como sabem que está bem (observabilidade)?
8. Qual é o passo mais difícil de reverter e como se limita o dano?

**4. Situações difíceis.**
(a) Interrompe com calma: «Obrigado, vamos manter o foco na proposta. Qual é o risco concreto que vês?», e converte a crítica pessoal num risco registado. Se persistir, fala com a pessoa **a dois** depois da sessão.
(b) Regista o parecer e a discordância com razões, define quem decide (o responsável da equipa, no processo de aconselhamento) e acorda um critério de revisão: «se na fase de testes o tempo de resposta passar X, voltamos a esta decisão». Se o risco for sério, escala ao patrocinador com a evidência.

**5. Registo (24 horas).**

    Data / Participantes / Proposta (ligação)
    Decisões tomadas
    Ações (responsável, data)
    Riscos novos e mitigação
    Pontos em aberto e quem decide
    Próxima revisão

**Critérios de autoavaliação:** pediste material antes; o objetivo da revisão é claro; as perguntas são sobre riscos e qualidades, não sobre gostos de tecnologia; tens resposta para o conflito e para a discordância sem autoridade formal; o registo tem responsáveis e datas.

### Exercício 48

**1. Interesse e limites.** Interesse real: ter stock correto no portal durante a campanha de Natal e não perder vendas. Posição: leitura direta à base de dados. **Negociável:** a forma de obter o stock, o âmbito e o calendário (por exemplo, um subconjunto de artigos). **Inegociável:** não pôr em risco o SAP nem a operação, e respeitar as regras de segurança acordadas.

**2. A confirmar antes de afirmar.** Se o acesso direto à base viola as condições de suporte ou licenciamento (documentação e contrato do fornecedor); que mecanismos oficiais de leitura o SAP da empresa já expõe (API, OData, eventos), com a equipa SAP; o impacto de carga estimado; a política interna de segurança sobre acessos diretos. Não dês nenhum destes pontos como certo antes de confirmar.

**3. O «não» com alternativas.**

    «Percebo que precisas de stock correto no portal na campanha de Natal.
    Ler diretamente da base do SAP traz um risco: pode afetar o desempenho
    do sistema central e há questões de suporte e de segurança que
    confirmei/vou confirmar com a equipa SAP até quinta.
    Vejo três caminhos:
      A. Serviço oficial de leitura de stock por API     X semanas   risco baixo
      B. Réplica de leitura atualizada periodicamente     Y semanas   risco médio
      C. Solução temporária só para os artigos da campanha, com prazo
         de fim e responsável definidos                    3 semanas   risco controlado
    Recomendo C para o Natal e A como solução definitiva. Serve para ti?»

(Os prazos X e Y vêm de estimativas da equipa; não os inventes.)

**4. Se insistir.** «Entendo que a decisão final seja da administração. Proponho levar-lhes as três opções com custo, prazo e risco, para decidirem com toda a informação, e eu cumpro o que for decidido. Só peço que o risco de acesso direto fique registado e aceite por quem decide.» Escalar com factos e opções não é contornar o diretor, é dar-lhe voz.

**5. Registo.** ADR (ou registo de risco) com contexto, opções, decisão tomada **contra** a recomendação, quem aceitou o risco, consequências esperadas, medidas de mitigação (limites de carga, monitorização, data de revisão para substituir por A) e data de revisão.

**6. Adaptação.** Empresa muito formal: prepara um pedido de exceção por escrito, no modelo obrigatório, e usa o comité de arquitetura ou de risco para que a aceitação do risco fique formalizada. Empresa muito pequena: fala primeiro a dois com o diretor, antes da reunião, e resolve com uma conversa e uma confirmação por mensagem; evita processos pesados e propõe a opção mais simples que proteja o essencial.

**Critérios de autoavaliação:** separaste interesse de posição; não afirmaste factos por confirmar; ofereceste alternativas reais com prazos; mantiveste a relação enquanto defendeste o essencial; sabes registar uma decisão contrária à tua recomendação; mostraste como adaptar à cultura da empresa.

## Módulo 13 · Temas avançados

### Exercício 49

**Mapa de capacidades (resposta-modelo)**

    VENDAS                  LOGÍSTICA               FINANÇAS               SUPORTE E CLIENTES
    ---------------------   ---------------------   --------------------   ---------------------
    Gerir catálogo          Gerir stock        [!]  Faturar                Gerir clientes
    Definir preços     [!]  Preparar e expedir      Cobrar                 Apoio ao balcão
    Receber encomendas [!]  Gerir transporte        Contabilidade          Gerir devoluções

    [!] = sobreposição ou lacuna

| Capacidade | Sistemas hoje | Observação |
|---|---|---|
| Gerir stock | SAP + consulta Delphi + (futuro) portal | Fonte de verdade no SAP, mas vários pontos de consulta: dados duplicados e atrasos |
| Definir preços | SAP + folha de cálculo do comercial | Sobreposição, risco de preços diferentes entre canais |
| Receber encomendas | SAP (balcão) + portal novo | Dois canais de entrada, regras que têm de ser iguais |
| Gerir transporte | Sistema do fornecedor externo | Dependência externa, integração a confirmar |
| Gerir devoluções | Aplicação Delphi | Sem integração clara com a faturação |
| Faturar, cobrar, contabilidade | SAP | Sem problema evidente |

**Onde investir primeiro (exemplo):**
1. **Gerir stock**: é a dor declarada do negócio (visibilidade em tempo real) e alimenta o portal.
2. **Definir preços**: uma folha de cálculo fora do sistema de registo é risco de erro e de auditoria, e é barato de resolver comparado com o impacto.

**Plataforma de dados:** recomenda-se um **data warehouse ou lakehouse simples**, mantido por uma só equipa, com ingestão do SAP, do portal e das aplicações Delphi, e uma camada final de indicadores por delegação. Para a dimensão da Casa Nova (equipa interna pequena, poucas equipas de domínio), o data mesh resolveria um problema que ainda não existe: o gargalo de uma equipa central de dados. Reavalia-se quando houver três ou mais equipas de domínio a produzir dados analíticos e a equipa central deixar de dar resposta. A escolha entre warehouse e lakehouse depende de haver dados não estruturados e de as competências da equipa serem em SQL ou em Spark: confirma na documentação do produto escolhido.

**Arquiteto de soluções vs empresarial:** o arquiteto de soluções desenha o portal e as integrações que resolvem a dor de stock; o arquiteto empresarial decide, ao nível da empresa, que capacidades merecem investimento e como os sistemas se alinham ao longo dos anos.

**Critérios de autoavaliação:** as capacidades descrevem **o quê** e não nomeiam sistemas; identificaste pelo menos três sobreposições ou lacunas com base nos dados do enunciado; a recomendação de dados considera a dimensão da equipa e inclui critério de reavaliação; não propuseste data mesh sem justificar a maturidade necessária.

### Exercício 50

| Req. | Fitness function | Tipo | Onde e quando corre | Dono e consequência da falha |
|---|---|---|---|---|
| R1 | Teste de carga com 200 utilizadores virtuais contra um ambiente de testes; falha se o p95 da consulta de stock ≥ 800 ms | Atómica (uma característica) | Pipeline noturno, e antes de cada release | Equipa do portal; bloqueia a release, abre incidente de desempenho |
| R2 | Teste de resiliência: simular o SAP indisponível (corte da ligação ou simulador que devolve erros) e verificar que o portal aceita encomendas, as regista numa fila e as processa quando o SAP volta; falha se alguma for perdida ou rejeitada durante o período definido | Holística (disponibilidade, integridade, desempenho em conjunto) | Periódico (por exemplo, a cada release maior ou mensalmente), em ambiente de pré-produção | Equipa do portal e operações; resultado vai para o registo de resiliência, falha bloqueia a release |
| R3 | Script ou ferramenta de análise de dependências que falha se algum ficheiro da pasta de domínio importar de pastas de infraestrutura ou de clientes do SAP | Atómica | A cada pedido de integração (*pull request*) | Equipa de arquitetura define a regra; a equipa que a violou corrige antes do *merge* |
| R4 | Verificação no pipeline de infraestrutura como código: cada serviço novo tem de declarar dono e um painel/alertas associados; caso contrário, o *deploy* para produção é recusado | Atómica | A cada *deploy* para produção | Dono da plataforma; bloqueia o *deploy* |

**Função a não automatizar (exemplo):** R2 completo, em simulação de falha real, pode ser caro de manter e instável (ambiente de testes com réplica do SAP). Em vez de a correr em todos os pipelines, fazem-se **exercícios agendados** (por exemplo, trimestrais) com a equipa a observar, e uma verificação automática mais barata no pipeline que confirma apenas que o mecanismo de fila e repetição está configurado. O ganho de uma automação completa não justifica o custo de manutenção neste momento; regista-se o ADR com o critério de reavaliação.

**Critérios de autoavaliação:** cada função tem limiar de falha mensurável; distingues atómica de holística; indicaste quem responde e o que acontece quando falha; a decisão de não automatizar tem justificação económica e uma alternativa.

### Exercício 51

**1. Problemas identificados (exemplo, mais de 8):**

| Dimensão | Problema |
|---|---|
| Risco/segurança | O agente pode **escrever** no SAP (criar encomendas, alterar preços): agência excessiva, sem aprovação humana |
| Risco/segurança | Índice único com todos os documentos: sem limitação de resultados por permissões, um colaborador pode obter contratos ou documentos de RH |
| Risco/segurança | Injeção de prompt: documentos (por exemplo, de fornecedores) podem conter instruções que o agente executa com as ferramentas de escrita |
| Risco/segurança | Resposta direta a clientes sem revisão: respostas erradas ou inventadas chegam ao exterior |
| Dados | Cópias diárias do stock num índice de pesquisa: informação desatualizada apresentada como verdadeira |
| Custo | Modelo maior para tudo e sem limites de pedidos nem de tokens: custo imprevisível, sujeito a abuso (consumo ilimitado) |
| Latência | Agente com vários passos e modelo grande para perguntas simples: respostas lentas no balcão |
| Avaliação | Sem plano de avaliação: não se sabe se melhora ou piora com mudanças de modelo, de *prompt* ou de dados |
| Governação | Sem dono, sem registo das conversas: sem responsabilização nem auditoria, e possível conflito com o RGPD |
| Dependência | Modelo único, sem camada de isolamento do fornecedor |

**2. Redesenho:**

    Balcão (utilizador autenticado, Entra ID)
        |
        v
    API do assistente  --(limite de pedidos e de tokens por utilizador)-->
        |
        +--> Pesquisa documental (RAG) em índice SÓ com documentos aprovados
        |      de balcão (devoluções, garantias, fichas técnicas),
        |      limitada por permissões do utilizador
        |
        +--> API de stock e preços (só leitura) --> serviço de stock --> SAP
        |
        +--> Modelo (escolhido pela avaliação, atrás de uma interface própria)
        |
        v
    Resposta ao colaborador com citações das fontes;
    registo de pedido, fontes usadas e custo

Padrão escolhido: **workflow com ferramentas** (dois passos fixos: pesquisa documental e consulta à API). Um agente só se justificaria para tarefas abertas com passos imprevisíveis; aqui o caminho é conhecido, por isso o agente traria custo, latência e risco sem ganho. Não há ferramentas de escrita; qualquer ação (criar encomenda) fica no fluxo normal do portal, com confirmação humana. O assistente destina-se a **colaboradores**; a exposição a clientes finais fica para uma fase posterior, com revisão do jurídico.

**3. RAG vs API:** RAG para **conhecimento documental que muda pouco** (regras, garantias, fichas). API para **dados vivos** (stock, preços): são consultados no momento, com a autorização da API, e nunca ficam num índice que envelhece.

**4. Custo por pedido** = (tokens de entrada × preço de entrada) + (tokens de saída × preço de saída) + custo da pesquisa + custo das chamadas às ferramentas. Os preços vêm da página oficial do fornecedor escolhido. Mecanismos de limitação: (a) limite de pedidos e de tokens por utilizador e por dia, e orçamento global com alerta; (b) contexto curto (devolver só os melhores fragmentos); (c) modelo mais pequeno que cumpra a avaliação, e reutilização de contexto repetido quando o fornecedor o suportar (prompt caching, confirma na documentação).

**5. Plano de avaliação (exemplo):** (a) perguntas com resposta presente nos documentos, resposta esperada validada pelo balcão; (b) perguntas cuja resposta **não** está nos documentos (o assistente deve dizer que não sabe); (c) perguntas que exigem stock ou preço (deve usar a API, não memória); (d) perguntas adversariais (tentativas de obter documentos fora das permissões ou de mudar as instruções). Corre-se a cada alteração de modelo, prompt ou documentos, com limiar mínimo para aprovar.

**6. Regulação e verificações:** classifica-se o caso de uso segundo o Regulamento (UE) 2024/1689 (um assistente interno de consulta tende a risco limitado ou mínimo, com deveres de transparência se interage com pessoas; a classificação final é do jurídico). Verifica-se com o jurídico e o encarregado de proteção de dados: que dados pessoais entram no prompt, onde são tratados e por quem, retenção dos registos, transferência para fora da UE, e contrato com o fornecedor. Confirma o calendário de aplicação atual do regulamento.

**7. Regras para CLAUDE.md/AGENTS.md (exemplo):** «O módulo `dominio` não pode importar de `infra`; corre o teste de dependências antes de propor alterações.» e «O assistente nunca recebe ferramentas de escrita no SAP: qualquer nova ferramenta exige um ADR aprovado.»

**Critérios de autoavaliação:** encontraste problemas nas cinco dimensões, incluindo agência excessiva e permissões; o redesenho usa o padrão mais simples e separa documentos de dados vivos; a fórmula de custo não inventa preços; o plano de avaliação inclui casos adversariais.

### Exercício 52

**1. Resposta ao diretor (modelo):**

- **Multi-cloud ativo**: a mesma carga a correr em dois fornecedores. **Cloud híbrida**: nuvem pública mais infraestrutura própria (a Casa Nova, durante a migração do SAP). **Portabilidade planeada**: desenhar para poder sair com custo e prazo conhecidos, sem duplicar a operação.
- **Cinco custos reais** do multi-cloud ativo: (1) denominador comum, perdes funcionalidades específicas que justificavam o fornecedor; (2) competências duplicadas na equipa (identidade, rede, segurança); (3) operação duplicada (monitorização, políticas, incidentes); (4) custos de transferência de dados entre fornecedores (confirma tarifas); (5) mais superfície de segurança e de conformidade a auditar.
- **Alternativa:** Azure como destino único, com portabilidade planeada: infraestrutura como código com módulos isolados, contentores onde fizerem sentido, OpenTelemetry para telemetria, protocolos abertos em dados e mensagens, e **custo de saída** estimado em cada ADR de serviço proprietário. O receio de dependência passa a ser um número que a direção pode ver.

**2. Quando concordar:** (a) exigência regulatória ou contratual de um cliente que obriga a outra cloud ou a localização; (b) fusão em que a empresa adquirida já corre noutra cloud; (c) um serviço crítico só disponível noutro fornecedor.

**3. ADR (exemplo):**

    # ADR-xxx Azure como destino único, com custo de saída documentado
    Estado: proposto
    Contexto: a direção teme dependência do fornecedor. A equipa interna é pequena;
    multi-cloud ativo duplicaria competências e operação.
    Decisão: a solução corre só em Azure. Cada serviço proprietário tem uma linha
    de custo de saída e a medida que a reduz. Reavaliar se surgir exigência
    regulatória ou de cliente.
    Consequências: menor custo e complexidade; dependência assumida e medida.
    Custo de saída estimado (qualitativo):
      Base de dados gerida padrão (PostgreSQL ou SQL): baixo a médio
      Mensagens/eventos com serviço proprietário:     médio
      Funcionalidades de IA específicas do fornecedor: médio a alto (interface própria atenua)

**4. Filtro de cinco perguntas (exemplo):**

| Pergunta | Resposta plausível |
|---|---|
| Que problema nosso resolve? | Nenhum medido: o desempenho atual do portal cumpre os requisitos |
| Alternativa mais simples que já temos? | A base atual, com índices e cache |
| Quem a opera daqui a dois anos? | Ninguém na equipa tem experiência |
| Custo de saída? | Alto: migrar dados e reescrever o acesso |
| Experiência pequena e com prazo? | Possível, num serviço de baixo risco |

Conclusão: **recusar por agora** para o portal; se houver interesse, **experimentar** num serviço periférico durante duas a quatro semanas, com critério escrito de antemão (por exemplo, cumpre o p95 definido e a equipa consegue operá-la sem apoio externo) e registo do resultado em ADR.

**5. Acompanhamento:** uma tarde por quinzena para ler o Technology Radar (duas edições por ano), as notas de versão dos fornecedores que a empresa usa e as alterações regulatórias relevantes, com um responsável que filtra. O resultado vai para um **radar interno** com os anéis em uso (Adopt), em experiência (Trial), em estudo (Assess) e a evitar (Caution), revisto a cada trimestre.

**Critérios de autoavaliação:** distinguiste os três conceitos; os custos listados são reais e não genéricos; a alternativa trata o receio do diretor com números; recusaste ou experimentaste a tecnologia com critérios e não por gosto.

## Projeto final · Exercício 53

O projeto é aberto, por isso não há uma solução única. Usa esta tabela para avaliar cada entregável.

| Entregável | Está bom quando... | Sinal de alerta |
|---|---|---|
| 1. Contexto e requisitos | Há pelo menos cinco atributos de qualidade com número e forma de medir; as restrições estão escritas | Requisitos como «rápido» ou «seguro» |
| 2. Decisão de estilo | Mostra pelo menos duas alternativas e liga a escolha aos atributos de qualidade | O estilo é escolhido por moda |
| 3. Diagramas C4 | Cada diagrama tem título, legenda e um público; o de sequência cobre o fluxo mais crítico | Diagramas com tudo misturado |
| 4. Dados e integração | Cada dado tem uma fonte de verdade; descreve o que acontece quando o SAP ou uma integração falha | Integrações só no caminho feliz |
| 5. Cloud, segurança e operação | Identidade, dados pessoais, RTO e RPO, monitorização e entrega estão tratados | «Segurança» num parágrafo genérico |
| 6. Economia e migração | Pressupostos do custo visíveis; plano por fases com ponto de regresso | Uma só data de passagem sem volta atrás |
| 7. Apresentação | Cabe numa página, abre com o pedido e fala de custo, risco e prazo | Só tecnologia |

**Pontuação:** aplica a grelha de 11 critérios do módulo 14. De 0 a 16 há lacunas importantes; de 17 a 26 o trabalho está sólido; a partir de 27 está pronto para mostrar.

**DICA:** pede a um colega, de preferência alguém que não seja da tua equipa, que leia só a página do entregável 7 e diga o que percebeu. Se não coincidir com o que querias dizer, a comunicação ainda não está pronta.
