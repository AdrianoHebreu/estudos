# 15 Exercícios práticos

Cinquenta e três exercícios: quatro por módulo (01 a 13) e o projeto final. São exercícios de **arquitetura**: estudos de caso, decisões a justificar, requisitos a escrever e desenhos a analisar. Resolve-os por escrito, num documento teu, e só consultas o módulo 17 depois de tentares. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem.

**NOTA:** nos exercícios, os números, prazos e custos são fictícios e servem só para raciocinar. Num caso real, confirma sempre com dados da tua empresa.

## Módulo 01 · O papel do Solution Architect

### Exercício 1 · As tuas três decisões, vistas por um arquiteto

**Nível:** Iniciante

Retoma a página que escreveste no módulo 00 com três decisões técnicas que tomaste como developer e as pessoas afetadas fora da tua equipa. Para cada decisão, constrói uma tabela com estas colunas: **alternativas consideradas**, **quem foi afetado e se foi ouvido**, **onde ficou registada**, **custo suportado por outros** e **o que era reversível**. Se não consideraste alternativas ou não registaste a decisão, escreve-o com honestidade. No fim, escreve três a cinco linhas a responder: «Que uma coisa farias diferente nas três se as tomasses hoje como arquiteto?»

Se não tiveres a página do módulo 00, usa estas decisões da Casa Nova Distribuição, tomadas por developers:

1. Copiar o stock do SAP para uma tabela local todas as noites, para as aplicações Delphi lerem mais depressa.
2. Criar, numa aplicação Delphi de balcão, uma regra de desconto própria, em vez de a pedir à equipa SAP.
3. Partilhar com o portal de encomendas um ficheiro de clientes exportado à mão uma vez por semana.

### Exercício 2 · Que arquiteto é preciso?

**Nível:** Iniciante

A Casa Nova Distribuição tem cinco necessidades. Para cada uma, indica o **tipo de arquiteto** (enterprise, solution, software/technical, cloud, dados ou segurança) que deve liderar o trabalho e justifica numa frase. Indica também, quando for caso disso, um segundo tipo que deve ser consultado.

| N.º | Necessidade |
|---|---|
| a | Decidir se, daqui a cinco anos, a empresa quer manter um ERP único ou vários sistemas especializados |
| b | Definir a estrutura interna (módulos e camadas) do novo serviço de stock |
| c | Definir como se organizam as subscrições, as redes e as regras de custo na nova plataforma cloud |
| d | Decidir qual é a fonte de verdade para o endereço de entrega de um cliente, hoje guardado em três sistemas |
| e | Definir como os clientes do portal se autenticam e que dados pessoais se podem guardar |

Depois responde: numa empresa de 400 colaboradores com uma equipa de TI pequena, é provável que haja seis arquitetos distintos? Quem acumula estes papéis e que risco isso traz?

### Exercício 3 · Diagnosticar um anti-padrão

**Nível:** Intermédio

Lê esta situação, passada na Casa Nova Distribuição.

> O arquiteto da empresa define que «todas as integrações com o SAP» têm de passar por ele. Cada equipa que precisa de ler ou escrever dados no ERP envia-lhe um pedido por email. Ele responde, em média, ao fim de duas semanas, com um desenho de PowerPoint. Há uma lista de quinze pedidos pendentes. A equipa do portal, com prazo apertado, começou a aceder diretamente a uma base de dados intermédia, sem avisar ninguém. O arquiteto só soube quando um incidente em produção revelou a ligação. Na última reunião, disse: «Se tivessem esperado pelo meu desenho, isto não tinha acontecido.»

Responde:

1. Que anti-padrões (da aula) reconheces? Justifica com frases da situação.
2. Que consequências já se materializaram e que outras podem ainda ocorrer?
3. Propõe **três mudanças** na forma de trabalhar do arquiteto que mantenham o controlo sobre o que é crítico sem bloquear as equipas.
4. Como medirias, daqui a três meses, se as mudanças funcionaram? Indica pelo menos dois indicadores.

### Exercício 4 · O teu plano dos primeiros 90 dias

**Nível:** Intermédio

Escreve o plano dos teus primeiros 90 dias como Solution Architect, para o caso real da tua empresa, ou para a Casa Nova Distribuição se preferires. O plano deve caber numa página e conter:

1. **Dias 1 a 30:** pelo menos cinco pessoas ou grupos que vais ouvir, e a pergunta principal que farás a cada um. Indica também os dois artefactos que vais produzir para te orientares (por exemplo, um mapa de sistemas).
2. **Dias 31 a 60:** uma contribuição pequena e concreta que possa dar confiança, e o tema do teu primeiro ADR.
3. **Dias 61 a 90:** a peça de arquitetura de que vais assumir a responsabilidade, a quem vais apresentá-la e que decisão pedes.
4. **Riscos:** três riscos do teu arranque (por exemplo, ser visto como alguém que critica o passado) e uma forma de os mitigar.
5. **Medição:** como vais saber, aos 90 dias, que correu bem, sem usar «linhas de código» ou «número de diagramas».

Se o teu responsável direto ainda não definiu o âmbito da função, acrescenta ao plano as três perguntas que lhe farás sobre autoridade e expectativas na primeira semana.

## Módulo 02 · Do negócio aos requisitos

### Exercício 5 · Quem tem de estar na conversa?

**Nível:** Iniciante

A Casa Nova Distribuição quer lançar um serviço de **entregas ao domicílio com marcação de hora**: o cliente B2B escolhe, no portal, uma janela de entrega, e a frota (própria e de transportadores subcontratados) cumpre-a a partir das 12 delegações. A direção quer o serviço operacional dentro de seis meses, com um orçamento limitado.

1. Lista pelo menos **10 stakeholders** (internos e externos), incluindo alguns que normalmente se esquecem.
2. Classifica cada um no mapa **poder/interesse** e indica a estratégia (gerir de perto, manter satisfeito, manter informado, monitorizar).
3. Escolhe **três** stakeholders e, para cada um, escreve a pergunta mais importante que lhe farias numa entrevista de discovery.
4. Aponta o stakeholder em que a classificação «poder baixo» é mais enganadora e explica porquê.

### Exercício 6 · De «rápido e seguro» a números

**Nível:** Intermédio

Numa reunião sobre o portal de encomendas da Casa Nova, o diretor comercial deixa estas frases:

- a) «O portal tem de ser rápido.»
- b) «Não pode haver encomendas perdidas.»
- c) «Tem de estar sempre disponível.»
- d) «Tem de ser seguro, por causa do RGPD.»
- e) «Queremos poder acrescentar novos canais de venda sem refazer tudo.»

Para **cada** frase:

1. Escreve **duas a três perguntas** que farias ao negócio para a tornar mensurável.
2. Depois de assumires respostas razoáveis (indica-as como hipóteses), escreve um **cenário de qualidade** completo, com as seis partes (fonte, estímulo, ambiente, artefacto, resposta, medida da resposta).
3. Classifica a qualidade de cada uma (desempenho, fiabilidade, disponibilidade, segurança, modificabilidade, etc.).

Para a alínea (c), usa a tabela de disponibilidade da aula e explica ao diretor, numa frase, porque é que «sempre» não é um objetivo útil.

### Exercício 7 · Cortar 25% do prazo sem estragar o projeto

**Nível:** Intermédio

A direção da Casa Nova informa que o prazo do portal passa de 8 para 6 meses (menos 25% de tempo) com a mesma equipa. A lista inicial de requisitos, com a estimativa de esforço em dias-pessoa, é:

| ID | Requisito | Esforço (dias-pessoa) |
|---|---|---|
| R1 | Consultar stock por delegação | 30 |
| R2 | Criar encomenda no portal | 50 |
| R3 | Validar preço contratado e disponibilidade com o SAP | 40 |
| R4 | Enviar a encomenda confirmada ao SAP | 45 |
| R5 | Consultar estado e histórico de encomendas | 25 |
| R6 | Notificações por email | 15 |
| R7 | Repetir encomenda anterior | 10 |
| R8 | Painel de ruturas para gestores de delegação | 30 |
| R9 | Pagamento online com cartão | 60 |
| R10 | Fusão de clientes duplicados | 45 |

Total: 350 dias-pessoa. Com o novo prazo, a equipa só tem capacidade para **cerca de 260** dias-pessoa.

1. Aplica o **MoSCoW** a todos os requisitos, justificando cada escolha numa linha. Os Must não devem passar de cerca de 60% do esforço **que a equipa pode fazer**.
2. Calcula o esforço de cada categoria e verifica as proporções.
3. Escreve os **critérios de aceitação** (formato Dado/Quando/Então, pelo menos dois cenários) para o requisito R3.
4. Escreve o parágrafo que dirias ao diretor-geral sobre o que fica de fora e as consequências.

### Exercício 8 · Frescura contra proteção do SAP

**Nível:** Avançado

Duas áreas da Casa Nova pedem coisas que colidem:

- **Comercial:** «O cliente tem de ver o stock exato no momento em que consulta. Se disser 10 unidades, tem de haver 10.»
- **Equipa SAP e infraestrutura:** «O SAP já está no limite em horas de ponta e não pode parar nem abrandar. Não pode receber uma consulta por cada pedido do portal.»

Dados adicionais (hipóteses do caso): 200 utilizadores simultâneos no portal; as 12 delegações vendem ao balcão em paralelo; o SAP é a fonte de verdade do stock; uma ruptura vendida e não cumprida gera uma reclamação e, por vezes, uma devolução.

1. Identifica as **duas qualidades** em conflito e reescreve cada pedido como um **cenário mensurável** com valores propostos.
2. Constrói uma pequena **árvore de qualidade** (3 a 5 qualidades dominantes, com cenários e importância alta/média/baixa).
3. Propõe **dois ou três compromissos** possíveis a nível de requisito (por exemplo, ao nível da frescura exigida ou do tratamento do momento da confirmação), sem escolher tecnologia. Para cada um, indica quem ganha, quem perde e o risco.
4. Escolhe um e escreve a **proposta que levarias a uma reunião** com as duas áreas e o patrocinador: o que decide o negócio, que pressupostos há a validar e que medida mostra que o compromisso funciona.
5. Lista **três riscos** e uma resposta para cada.

## Módulo 03 · Fundamentos de arquitetura

### Exercício 9 · Acoplamento e coesão num desenho existente

**Nível:** Iniciante

Observa o desenho atual da Casa Nova Distribuição, descrito em texto:

    [App Delphi de balcão] --lê tabelas diretamente--> [Base de dados do SAP]
    [App Delphi de balcão] --escreve ficheiros CSV--> [Pasta partilhada] --importa à noite--> [SAP]
    [Site de encomendas atual] --lê tabelas diretamente--> [Base de dados do SAP]
    [Módulo "Utilitários" da app Delphi: cálculo de descontos, formatação de moeda,
     envio de emails, geração de etiquetas, ligação à base de dados]

1. Identifica **três pontos de acoplamento forte** e explica o que acontece em cada um se o SAP for atualizado e as tabelas mudarem.
2. Identifica o **ponto de baixa coesão** e diz que responsabilidades separarias e em que partes.
3. Para cada acoplamento, propõe uma forma de o baixar (interface, API, adaptador, evento) sem mudar o SAP. Indica o que cada proposta custa.

### Exercício 10 · Escolher e justificar um estilo para o caso Casa Nova

**Nível:** Intermédio

A Casa Nova quer um portal de encomendas e stock em tempo real, convivendo com o SAP e as apps Delphi. Dados de partida (resumo do módulo 02):

| Atributo de qualidade | Meta |
|---|---|
| Desempenho | Consulta de stock em 2 s ou menos para 95% dos pedidos, com 200 utilizadores simultâneos (QA-01) |
| Disponibilidade | O portal fica disponível mesmo que o SAP esteja em manutenção, para consulta |
| Modificabilidade | Alterações ao portal sem tocar no SAP |
| Custo | Equipa de 4 developers, sem equipa de plataforma |

1. Escolhe **um estilo principal** (e, se quiseres, um secundário) entre monólito modular, camadas, hexagonal, microsserviços, orientada a eventos e serverless.
2. Usa uma matriz atributo × estilo para comparar pelo menos três candidatos.
3. Escreve um **ADR resumido** (contexto, opções, decisão, consequências) e inclui um **gatilho mensurável** para rever a decisão.
4. Explica onde entram Bun/TypeScript, o SAP e as apps Delphi no teu desenho.

### Exercício 11 · Onde a consistência forte é obrigatória

**Nível:** Intermédio

O serviço de stock do portal mantém uma cópia de leitura atualizada por eventos do SAP, com um atraso típico de alguns segundos. Para cada operação abaixo, decide se aceitas **consistência eventual** ou se exiges **consistência forte** (consultando o SAP ou bloqueando), e justifica em duas linhas, usando a pergunta: «prefiro bloquear ou responder com informação possivelmente velha?».

| N.º | Operação |
|---|---|
| a | Mostrar «Em stock» na listagem de produtos do portal |
| b | Reservar a última unidade de um artigo para um cliente |
| c | Mostrar o saldo da conta corrente do cliente na área reservada |
| d | Relatório de vendas do dia para a direção, gerado às 18h |
| e | Atualizar o endereço de entrega de um cliente que existe no SAP e no portal |

Depois responde: (1) o que acontece ao portal se a ligação entre o serviço de stock e o SAP falhar durante uma hora, e como comunicas isso ao cliente? (2) Porque é enganador dizer «o nosso serviço de stock é CP»?

### Exercício 12 · Avaliar uma proposta de microsserviços

**Nível:** Avançado

Um colega propõe dividir o novo sistema da Casa Nova em dez microsserviços, e apresenta isto:

    Serviços: Clientes, Produtos, Preços, Stock, Encomendas, Faturação, Notificações,
              Utilizadores, Relatórios, Logística
    Base de dados: uma única instância PostgreSQL partilhada por todos os serviços
    Implementação: um único pipeline que publica os dez serviços de uma vez
    Equipa: 4 developers
    Motivo: "é o que as grandes empresas fazem e fica preparado para crescer"

1. Lista os **problemas** que vês, relacionando-os com as perguntas do modelo da aula (equipas, maturidade, domínio, dados).
2. Explica porque isto é um **monólito distribuído** e que custos tem sem os benefícios.
3. Propõe uma **alternativa** (com um desenho em texto) e os **gatilhos** que justificariam extrair um serviço no futuro.
4. Escreve em cinco linhas como apresentarias a tua recomendação ao colega sem o desmotivar e sem desvalorizar a ambição de crescimento.

## Módulo 04 · Modelação e documentação

### Exercício 13 · Portal de devoluções em dois níveis

**Nível:** Iniciante

A Casa Nova Distribuição quer um **Portal de Devoluções**: o cliente profissional pede online a devolução de material (indicando a encomenda e o motivo), o armazém da delegação recebe o aviso e prepara a receção, e o departamento financeiro emite a nota de crédito no SAP. O cliente recebe um email a cada mudança de estado. O portal usa o mesmo sistema de identidade da plataforma de encomendas (assume que já existe e não o desenhas). Os operadores de armazém usam uma aplicação Delphi existente nas delegações, que terá de mostrar as devoluções pendentes.

1. Desenha em ASCII (bloco indentado) o diagrama de **contexto (C4 nível 1)**, com título, legenda e etiquetas específicas nas linhas.
2. Desenha o diagrama de **contentores (C4 nível 2)** com tecnologia proposta em cada contentor e protocolo nas linhas.
3. Escreve, numa frase por diagrama, qual o público a que se destina.
4. Indica **uma decisão** escondida no teu diagrama de contentores que mereceria um ADR.

---

### Exercício 14 · Encontra os defeitos do diagrama

**Nível:** Intermédio

Um colega entregou-te este diagrama como «arquitetura da plataforma de encomendas», para aprovação:

    +---------+     usa      +-----------+     usa      +----------+
    | Cliente |------------->|  Portal   |------------->|   API    |
    +---------+              +-----------+              +----------+
                                   |                        |  |
                                   | usa                usa |  | usa
                                   v                        v  v
                             +-----------+   +--------+  +--------+
                             | Controlo  |   | SAP    |  | BD     |
                             | de Pedidos|   |        |  |        |
                             +-----------+   +--------+  +--------+
                                   |             ^
                                   +-- usa ------+
          class EncomendaService { validar(); gravar(); }
          Azure Service Bus (mensagens)    Delphi (balcão)    Operador

1. Lista **pelo menos 8 problemas** (de notação, de nível de detalhe, de conteúdo e de comunicação). Usa a lista de verificação de um diagrama do módulo.
2. Indica **três perguntas** que farias ao colega antes de aprovar, para perceber o que o diagrama não diz.
3. Redesenha **um** diagrama corrigido (à tua escolha: contexto ou contentores), com título, legenda, tipos e etiquetas. Podes assumir o que o módulo mostra do caso Casa Nova.

---

### Exercício 15 · ADR: manter o balcão Delphi

**Nível:** Intermédio

A Casa Nova tem 12 delegações com uma aplicação Delphi (VCL/FireDAC) de balcão, que hoje fala diretamente com a base de dados do SAP através de uma camada de acesso a dados feita à medida. A direção quer o stock em tempo real também no balcão. Estão em cima da mesa três opções:

- **A.** Reescrever o balcão numa tecnologia web nova (reescrita completa, previsão de 14 meses).
- **B.** Manter o balcão Delphi e alterá-lo para consumir a nova API da plataforma (HTTPS/JSON), deixando de aceder diretamente ao SAP.
- **C.** Manter o balcão como está e fazer apenas uma atualização noturna de stock (em lote) para o balcão.

Contexto adicional: equipa interna pequena com experiência em Delphi, restrição de que o balcão não pode parar em horário comercial, orçamento limitado.

1. Escreve o **ADR completo** (modelo do módulo): estado, contexto, critérios, as três opções, decisão, consequências positivas e negativas, riscos com mitigação e nível de confiança.
2. Indica **o que te faria rever** esta decisão daqui a dois anos e como isso se registaria (que novo ADR escreverias).
3. Justifica numa frase porque é que este ADR **não deve** ser editado quando a decisão mudar.

---

### Exercício 16 · Um mesmo sistema, três públicos

**Nível:** Avançado

Vais apresentar a plataforma de encomendas e stock da Casa Nova a três públicos diferentes em semanas consecutivas: (a) a **direção** (decide o orçamento), (b) a **equipa de segurança** (decide se aprova o desenho), (c) a **equipa de desenvolvimento** que vai implementar (decide como construir).

1. Propõe para cada público o **conjunto mínimo de diagramas e secções** (usa os 12 pontos do arc42 como menu e os níveis C4 e UML), indicando o que **deixas de fora** e porquê.
2. Escreve o **esqueleto do documento de solução** para a equipa de desenvolvimento: as secções arc42 que usas (com 1 linha do conteúdo de cada, aplicada à Casa Nova), as que adias e a ligação a ADRs e diagramas.
3. Redige o **resumo de uma página para a direção**: problema, solução em linguagem não técnica, 3 decisões que precisam de aprovação, principais riscos e custo/prazo (usa valores claramente marcados como hipotéticos, sem inventar números como se fossem reais).
4. Define **como vais manter** a documentação atualizada nos 12 meses seguintes: onde vive, quem é o dono, quando se revê e como se sabe que está desatualizada.

## Módulo 05 · Dados e integração

### Exercício 17 · Escolher o armazenamento certo

**Nível:** Iniciante

A Casa Nova Distribuição vai construir o portal de encomendas. Estes são os seis conjuntos de dados que o portal vai tratar:

1. Encomendas em curso: cada encomenda tem cabeçalho e linhas, e o total tem de bater certo com as linhas.
2. Stock por artigo e por delegação, mostrado no portal e consultado milhares de vezes por minuto.
3. Catálogo de 40 000 artigos, com pesquisa por texto livre («parafuso inox 6 mm») e filtros por categoria e marca.
4. Sessão do utilizador e carrinho de compras (dados temporários).
5. Faturas em PDF (cada uma com cerca de 200 KB), a guardar durante 10 anos.
6. Relações entre artigos substitutos e compatíveis, para sugerir alternativas até três níveis de profundidade.

Para cada conjunto: (a) indica o **modelo de dados** mais adequado (relacional, documento, chave-valor, coluna, grafo, pesquisa, objeto, cache); (b) indica um serviço Azure possível e o equivalente AWS; (c) diz **se é a fonte de verdade ou uma cópia**; (d) justifica em duas frases pelo padrão de acesso. No fim, escolhe **um** dos seis em que a tua resposta poderia ser diferente numa empresa pequena e explica porquê.

### Exercício 18 · Desenhar o contrato da API de encomendas

**Nível:** Intermédio

O portal, a aplicação Delphi de balcão e dois parceiros externos vão criar e consultar encomendas. Desenha o contrato da **API de encomendas**:

1. Lista os recursos e os URLs (pelo menos: encomendas, linhas de encomenda, clientes) e indica o método HTTP de cada operação (criar, consultar, listar com paginação, cancelar, alterar a morada de entrega).
2. Indica os códigos de estado que a API devolve nos casos: criada, não encontrada, dados inválidos, conflito e erro interno. Define o formato único de erro (campos).
3. Escolhe a **estratégia de versionamento** (URL, parâmetro, cabeçalho ou tipo de média) e justifica. Dá um exemplo de uma alteração **compatível** e uma que **parte** os consumidores.
4. A criação de uma encomenda é um `POST`, e a rede é instável: um cliente pode repetir o pedido sem saber se o primeiro chegou. Explica como tornas a criação **idempotente**.
5. Para cada um destes três consumidores escolhe REST, GraphQL ou gRPC e justifica em uma frase: (a) parceiros externos; (b) comunicação interna entre dois serviços novos em Bun e noutra linguagem; (c) portal e app móvel com ecrãs muito diferentes.

Entrega um esboço do contrato em texto (não é preciso o ficheiro OpenAPI completo).

### Exercício 19 · Analisar um desenho de mensagens

**Nível:** Intermédio

Um colega propôs este fluxo para enviar encomendas do portal ao SAP:

    Portal --(publica "EncomendaCriada")--> Tópico --> Subscrição "sap"
                                                     --> Subscrição "faturacao"
                                                     --> Subscrição "notificacoes"
    Consumidor "sap": lê a mensagem, chama a interface do SAP, apaga a mensagem.
    O portal grava a encomenda na base de dados e depois publica a mensagem
    (duas operações separadas).

Há quatro incidentes registados nos primeiros meses: (A) o SAP recebeu a mesma encomenda duas vezes; (B) uma encomenda gravada no portal nunca chegou ao SAP; (C) uma atualização «encomenda cancelada» chegou antes da «encomenda criada»; (D) uma mensagem com dados mal formados bloqueou o processamento durante uma tarde.

Para cada incidente: (1) explica a **causa provável** no desenho; (2) propõe a **correção** de arquitetura, nomeando o padrão ou a funcionalidade (idempotência, deteção de duplicados, outbox, sessões/ordem, fila de mensagens não entregues, etc.); (3) indica como verificarias que ficou resolvido. Diz ainda se, neste fluxo, a mensagem «EncomendaCriada» é um **evento** ou um **comando** e se isso muda o desenho.

### Exercício 20 · Integrar SAP, Delphi e um sistema legado

**Nível:** Avançado

A Casa Nova tem de ligar quatro integrações:

- **I1.** O portal precisa de mostrar o stock por artigo com atraso máximo de 30 s. O stock vive no SAP.
- **I2.** As encomendas do portal têm de chegar ao SAP sem perdas nem duplicados.
- **I3.** Todas as noites, a direção quer um relatório de vendas por delegação com dados do SAP e do portal.
- **I4.** Uma aplicação Delphi de balcão, que escreve diretamente nas tabelas de uma base de dados local antiga, tem de passar a ver as encomendas do portal e o stock.

Tarefas:

1. Para cada integração, escolhe o **estilo** (API síncrona, mensagens/eventos, ficheiros, ETL/ELT) e justifica com os critérios: latência exigida, o que acontece se o outro lado estiver em baixo, volume.
2. Desenha, em diagrama de texto, a solução para **I4** com uma **camada anti-corrupção**: o que é traduzido, onde corre, que modelo cada lado conhece. Indica duas coisas que a camada **não** deve conter.
3. Lista **três perguntas** que farias à equipa SAP antes de fixar I1 e I2, tendo em conta que não sabes que interfaces a versão deles suporta.
4. Escreve um **ADR** (contexto, decisão, consequências) sobre «Como as aplicações Delphi acedem aos dados da Casa Nova», comparando pelo menos duas alternativas.

## Módulo 06 · Cloud e infraestrutura

### Exercício 21 · Quem é responsável por quê? Classificar os componentes da Casa Nova

**Nível:** Iniciante

A Casa Nova Distribuição está a decidir como vai alojar cinco componentes da nova solução em Azure:

| Componente | Como será alojado |
|---|---|
| A. SAP S/4HANA | Máquinas virtuais no Azure, geridas pela equipa interna |
| B. Portal de encomendas | Azure App Service |
| C. Correio eletrónico da empresa | Microsoft 365 |
| D. Processamento de eventos de stock | Azure Functions |
| E. Anexos das encomendas (PDF, imagens) | Azure Blob Storage |

1. Para cada componente, indica o modelo (IaaS, PaaS ou SaaS).
2. Para cada um, responde numa tabela: quem aplica as atualizações do sistema operativo, quem é responsável pelos **dados** e quem é responsável pela **configuração de acesso**.
3. Indica, para cada componente, **um risco típico** que continua a ser da Casa Nova mesmo depois de passar para a cloud.
4. O diretor financeiro diz: «Como vai para o Azure, a Microsoft trata da segurança». Escreve 3 ou 4 frases a corrigir esta ideia sem criar alarme.

### Exercício 22 · Rede híbrida: ligar o Azure ao SAP e desenhar o hub-and-spoke

**Nível:** Intermédio

O portal de encomendas (Azure) vai consultar stock no SAP, que fica **on-premises** na sede. Dados do problema:

- A rede on-premises usa os intervalos `10.0.0.0/16` (sede) e `10.1.0.0/16` a `10.12.0.0/16` (as 12 delegações).
- Se a ligação cair, as encomendas online deixam de ter stock em tempo real. A direção quer «o menos tempo parado possível», mas o orçamento é limitado.
- Há 6 semanas até ao primeiro lançamento.
- Haverá duas cargas de trabalho no Azure: **Portal** e **Integração/Stock**. Querem um ponto único de controlo do tráfego.

Tarefas:

1. Escolhe a ligação (VPN, ExpressRoute ou uma combinação) para o **lançamento** e para o **futuro**, justificando com o prazo, o custo e a disponibilidade.
2. Propõe um **plano de endereços IP** para o hub e os dois spokes, sem colidir com o on-premises, e explica porque é que a colisão seria um problema.
3. Desenha em texto a topologia hub-and-spoke com onde ficam o firewall, o gateway e as cargas de trabalho.
4. O spoke Portal precisa de falar com o spoke Integração. Como é que isso acontece, sabendo que o peering **não é transitivo**?
5. Indica **duas regras** que aplicarias para que o portal chegue ao SAP sem o expor diretamente.

### Exercício 23 · Escolher a computação: cinco cargas de trabalho, cinco decisões

**Nível:** Intermédio

A equipa da Casa Nova tem 5 cargas de trabalho e quer escolher o serviço Azure de cada uma. A equipa interna é pequena (4 pessoas, sem experiência em Kubernetes).

| Carga | Descrição |
|---|---|
| A. Portal de encomendas | Web e API em Bun/TypeScript, tráfego variável, 2 pessoas na equipa |
| B. Reconciliação noturna de stock | Corre 30 minutos por noite, lê do SAP e escreve na base de dados |
| C. Eventos de stock | Reage a mensagens de uma fila; picos de milhares por minuto no fim do dia |
| D. Software de terceiros de etiquetagem | Só instala em Windows Server, licenciado por máquina, sem suporte a contentores |
| E. Plataforma de um parceiro | 30 microsserviços já empacotados para Kubernetes (Helm), que a Casa Nova vai adotar, com 2 pessoas de plataforma |

1. Escolhe um serviço (VM, App Service, Functions, Container Apps, AKS ou outro) para cada carga e justifica numa frase, referindo o modelo de responsabilidade.
2. Em quais destas cargas a escolha é **claramente** a mais simples e em qual é a mais discutível? Porquê?
3. Escreve um **ADR curto** (contexto, decisão, consequências) para a carga **E**, incluindo as alternativas que rejeitaste.
4. Que **custo de operação** estás a aceitar com a tua decisão para E, e como o reduzirias?

### Exercício 24 · Landing zone e governação: pôr ordem num Azure que cresceu sozinho

**Nível:** Avançado

A Casa Nova já usa o Azure há um ano, sem plano. Estado atual:

- 3 subscrições criadas ad hoc, todas diretamente sob o grupo de gestão raiz: «Dev-Maria», «Producao-Portal» e «Teste-Fornecedor».
- Qualquer pessoa da equipa é **Owner** de tudo. Ninguém sabe quanto cada projeto custa.
- Num incidente recente, alguém criou máquinas virtuais numa região fora da UE, o que viola o requisito de residência de dados.
- Os recursos são criados à mão no portal; não há histórico de como o ambiente foi construído.
- Vão chegar 3 novas cargas de trabalho no próximo ano.

Tarefas:

1. Desenha a **hierarquia** de grupos de gestão e subscrições (máximo 3 níveis), com justificação.
2. Define **4 políticas** (o que avalia, âmbito onde atribuis, efeito) que resolvam os problemas descritos. Indica como as introduzirias **sem parar a equipa**.
3. Propõe a atribuição de **RBAC**: quem recebe que papel e em que âmbito, e porquê não dar tudo no grupo de gestão.
4. Define o esquema mínimo de **etiquetas e orçamentos** para responder à pergunta «quanto custa cada projeto?». O que **não** conseguem os orçamentos fazer?
5. Escolhe **Bicep ou Terraform** para o IaC e escreve um ADR de 5 linhas.

## Módulo 07 · Segurança e conformidade

### Exercício 25 · Rever um desenho de identidade e segredos

**Nível:** Iniciante

A equipa da Casa Nova Distribuição preparou o primeiro rascunho do portal de encomendas em Azure e pediu-te uma revisão de segurança. Encontras estas sete situações:

| # | Situação encontrada |
|---|---|
| 1 | Os 6 developers da equipa são *Owner* da subscrição de produção «para não bloquear ninguém». |
| 2 | A *connection string* da base de dados, com palavra-passe, está no `appsettings.json` guardado no repositório Git. |
| 3 | A API de stock não pede *token*: aceita qualquer pedido que venha da rede interna, «porque é interna». |
| 4 | A base de dados e o cofre de segredos estão acessíveis a partir da Internet pública, protegidos só por palavra-passe. |
| 5 | O botão «Aprovar encomenda» só aparece a quem tem o papel de aprovador, mas a API `POST /encomendas/{id}/aprovar` não verifica o papel. |
| 6 | Ninguém ativou registos de acesso ao Key Vault e o *activity log* nunca foi exportado. |
| 7 | As aplicações Delphi dos balcões ligam à base de dados com uma conta partilhada (`balcao_user`) cuja palavra-passe está no ficheiro `.ini` de cada posto. |

1. Para cada situação, indica o **princípio** ou a **propriedade CIA** em causa (menor privilégio, defesa em profundidade, Zero Trust, confidencialidade, integridade, disponibilidade, auditoria) e a **correção** que proporias, usando os serviços do módulo (Entra ID, Azure RBAC, identidades geridas, Key Vault, Private Link).
2. Escolhe, **justificando**, o tipo de identidade gerida (atribuída ao sistema ou ao utilizador) para: (a) a API de encomendas, que corre num único App Service; (b) três instâncias de um worker em contentores, recriadas todos os dias, que têm de aceder sempre à mesma conta de armazenamento.
3. Depois das correções, ainda existe um segredo que não consegues eliminar: a credencial do utilizador técnico com que o serviço de integração fala com o SAP. Diz onde a guardarias, quem teria acesso e como planearias a rotação.

### Exercício 26 · Modelar ameaças ao fluxo de integração de encomendas

**Nível:** Intermédio

Fluxo a analisar (desenho simplificado):

    [Cliente B2B no browser] --HTTPS--> [WAF] --> [API Encomendas]
                                                      |
                                                      v
                                          [Fila de mensagens]
                                                      |
                                                      v
                                       [Serviço de integração] --VPN--> [SAP no datacenter]
                                                      |
                                                      v
                                            [Base de dados de encomendas]

A API autentica o cliente com um *token* emitido pelo fornecedor de identidade. Os serviços em Azure usam identidades geridas. O SAP está na rede do datacenter da Casa Nova.

1. Redesenha o diagrama (em texto) e marca as **fronteiras de confiança**. Quantas encontras e onde?
2. Aplica o **STRIDE**: identifica pelo menos **uma ameaça realista por cada letra** (S, T, R, I, D, E) neste fluxo e a **mitigação** correspondente.
3. Escolhe as **três ameaças prioritárias** usando probabilidade (1 a 5) x impacto (1 a 5) e justifica a escolha.
4. Escreve **dois requisitos não funcionais mensuráveis** que resultem da tua análise, no formato do módulo 02. Indica ainda uma ameaça que **aceitarias** e quem teria de aprovar essa aceitação.

### Exercício 27 · Traduzir o RGPD em requisitos técnicos

**Nível:** Intermédio

**ATENÇÃO:** o exercício treina o raciocínio de arquitetura. Não é aconselhamento jurídico: o que dependa de interpretação legal vai para o DPO.

A Casa Nova quer lançar três funcionalidades:

- **(a)** O portal guarda, para cada cliente B2B, os contactos dos compradores (nome, email, telefone) para enviar confirmações de encomenda.
- **(b)** A aplicação dos motoristas regista a localização GPS do telemóvel durante todo o turno, para otimizar rotas e para calcular tempos de entrega.
- **(c)** Uma plataforma de análise recebe uma cópia completa da tabela de clientes e encomendas, alojada numa região Azure fora da União Europeia, porque era «mais barata».

1. Constrói um **inventário de dados pessoais** para as três funcionalidades: que dados, de que titulares, para que finalidade, onde ficam e durante quanto tempo (propõe prazos como hipótese, a validar).
2. Para cada funcionalidade, indica a **base legal que provavelmente seria discutida** (consentimento, contrato, obrigação legal, interesses legítimos...) e escreve explicitamente **o que levarias ao DPO**. Qual das três levanta mais cedo a pergunta sobre **avaliação de impacto (DPIA)** e porquê?
3. Transforma **quatro direitos dos titulares** em **requisitos técnicos testáveis** (por exemplo, apagamento e acesso) que abranjam todos os sistemas: portal, SAP, cópias de segurança, registos e plataforma de análise.
4. Sobre a funcionalidade (c): que problema de **residência de dados** vês? Que alternativa de desenho proporias e que **perguntas confirmarias na documentação e no contrato** do fornecedor cloud antes de decidir?

### Exercício 28 · Política e ADR para assistentes de IA de programação

**Nível:** Avançado

A direção de tecnologia da Casa Nova quer que a equipa (8 developers) use **Claude Code** e **Codex** para acelerar o desenvolvimento do portal. Há três situações reais na equipa:

- Um developer colou num *prompt* um ficheiro CSV com 2 000 clientes reais para depurar um erro de importação.
- A pasta de trabalho de um serviço contém um ficheiro `.env` com credenciais de um ambiente partilhado, e o assistente tem acesso à pasta.
- Um colega usa uma **conta pessoal** da ferramenta, não uma conta da empresa.

1. Faz uma tabela de **riscos** (dados que saem, qualidade do código, segredos, cadeia de fornecimento, injeção de prompt) com a **medida de controlo** para cada um. Marca o que **tens de verificar na documentação atual** antes de afirmar.
2. Escreve uma **política de uma página** com regras claras sobre: ferramentas e contas aprovadas, classificação de dados (o que pode e não pode ir para um prompt), permissões e isolamento (sandbox), revisão humana e o que o assistente não pode fazer sozinho.
3. Escreve o **ADR** da decisão, com contexto, decisão, **pelo menos três alternativas** consideradas (por exemplo, proibir, permitir livremente, permitir com controlos, usar através de um fornecedor cloud da empresa) e consequências.
4. Explica o que farias, passo a passo, perante o **caso do CSV com clientes reais**, incluindo quem envolves e porque **não és tu sozinho a decidir** se há violação de dados pessoais.

## Módulo 08 · Qualidade operacional

### Exercício 29 · Quantos «noves» tem a encomenda?

**Nível:** Iniciante

O portal da Casa Nova Distribuição permite confirmar encomendas. No desenho atual, ao carregar em «Confirmar», o pedido atravessa **em série e de forma síncrona** estes componentes. As disponibilidades são **ilustrativas** (não são SLAs reais de nenhum serviço):

| Componente | Disponibilidade |
|---|---|
| Aplicação web | 99,95% |
| API de encomendas | 99,9% |
| Base de dados | 99,99% |
| Serviço de email transacional (envia a confirmação ao cliente) | 99,9% |
| SAP em servidores próprios (valida crédito e reserva stock) | 99,5% |

A direção quer um SLO de **99,9%** para este fluxo (43,2 minutos de paragem por mês, num mês de 30 dias).

1. Calcula a disponibilidade composta do desenho atual e converte-a em minutos de paragem por mês.
2. Diz se cumpre o SLO e identifica o elo mais fraco.
3. Propõe alterações ao desenho, **por passos**, que levem o fluxo a cumprir o SLO. Para cada passo, recalcula. Podes usar redundância (instâncias em paralelo, assumindo falhas independentes) e retirar dependências do caminho crítico.
4. Escreve duas frases para explicar à direção a diferença entre este SLO e o SLA que a empresa poderia prometer a um cliente.

---

### Exercício 30 · Quanto podemos perder, e quanto custa não perder nada?

**Nível:** Intermédio

A Casa Nova Distribuição quer definir a estratégia de recuperação para cinco sistemas. Uma hora de paragem do portal de encomendas em dia útil representa, segundo o financeiro, perda de vendas relevante. As aplicações de balcão das delegações podem passar a registo manual durante algumas horas. O orçamento é limitado e a equipa interna é pequena.

| Sistema | Notas |
|---|---|
| Portal de encomendas (Azure) | Gera receita direta; encomendas novas a toda a hora |
| Stock em tempo real (Azure) | Alimentado pelo SAP; pode ser reconstruído a partir dele |
| SAP (servidores próprios) | Fonte de verdade de stock, clientes e faturação |
| Aplicações Delphi de balcão (12 delegações) | Ligam à base de dados central; há procedimento manual de contingência |
| Relatórios de gestão | Consultados diariamente de manhã; podem ser regenerados |

1. Para cada sistema, propõe um **RPO** e um **RTO** e justifica com o impacto no negócio.
2. Escolhe, para cada um, a estratégia: apenas backup, DR frio, DR morno ou ativo-ativo. Nomeia o serviço Azure que usarias para backup e para replicação e *failover* (e o equivalente na AWS).
3. Explica porque é que uma réplica da base de dados do portal **não dispensa** o backup.
4. Descreve como e com que frequência testarias a recuperação, e o que fazias para provar à direção que o RTO é real.

---

### Exercício 31 · A tempestade de retries

**Nível:** Avançado

Lê esta descrição de um incidente na Casa Nova Distribuição.

> O SAP ficou lento (respostas em 40 segundos em vez de 1 segundo) durante 20 minutos. O portal ficou completamente inacessível, incluindo páginas que não dependem do SAP, e mesmo depois de o SAP recuperar demorou mais 15 minutos a voltar ao normal.

O desenho é este:

    Utilizador --> Portal (web) --> API de stock --> Adaptador SAP --> SAP

- O timeout por omissão em cada camada é de 100 segundos.
- Cada camada repete até 3 vezes (4 tentativas no total), **de imediato**, quando recebe um erro ou um timeout.
- A API tem um único pool de 200 threads, usado para **todas** as chamadas (stock, catálogo, preços).
- Quando o SAP está em baixo, o portal devolve «Erro 500» ao utilizador.

1. Explica o mecanismo que ligou a lentidão do SAP à indisponibilidade de páginas não relacionadas.
2. Calcula quantas chamadas chegam ao SAP por cada pedido do utilizador no pior caso, e o que isso faz a um SAP que já está sobrecarregado.
3. Propõe um desenho corrigido que aplique **timeouts com orçamento de tempo, retry com backoff e jitter, circuit breaker, bulkhead e degradação graciosa**. Indica valores concretos e justifica-os, e diz em que camada ficam os retries.
4. Define como validarias, antes de produção, que o novo desenho aguenta uma falha do SAP (sem executar nada: descreve o teste e o resultado esperado).

---

### Exercício 32 · Plano de operação para a campanha de outono

**Nível:** Avançado

A Casa Nova Distribuição vai lançar uma campanha online de 3 dias. A equipa de marketing prevê **5 vezes** o tráfego normal no portal. Dados disponíveis:

- Tráfego normal em hora de ponta: 40 pedidos/s à API. Pico esperado na campanha: 200 pedidos/s.
- Num teste de carga, uma instância da API suportou **50 pedidos/s** a 70% de CPU (o limite de utilização aceite pela equipa).
- A região Azure escolhida tem 3 zonas de disponibilidade e a direção exige que o portal **aguente a perda de uma zona inteira** durante a campanha.
- SLO do portal: 99,9% dos pedidos concluídos com sucesso em menos de 2 segundos.

1. Calcula o número mínimo de instâncias e como as distribuis pelas zonas. Mostra as contas.
2. Desenha um plano de **testes de carga**: que cenários (carga, esforço, picos, resistência), com que critérios de falha ligados ao SLO e em que ambiente.
3. Define o plano de **observabilidade**: 3 SLIs, que logs, métricas e traços são necessários, e 4 alertas (diz o que dispara cada um e quem é notificado). Justifica porque alertas sobre sintomas e não sobre causas.
4. Escreve o **runbook** do incidente «tempo de resposta do portal acima de 2 s durante 10 minutos»: gatilho, verificações, ações, escalonamento e revisão posterior.
5. Que decisões de escala automática e de custo recomendas para depois da campanha?

## Módulo 09 · DevOps e entrega

### Exercício 33 · Desenhar o caminho até à produção do portal de encomendas

**Nível:** Iniciante

A Casa Nova Distribuição vai publicar o portal de encomendas (Bun/TypeScript, a correr no Azure) e uma API de stock que lê do SAP. Hoje, a equipa interna (5 developers) publica manualmente, de uma máquina pessoal, uma vez por trimestre, e já houve duas falhas graves em produção por ficheiros esquecidos.

1. Desenha, em texto, uma pipeline de CI/CD para o portal, da alteração de código até à produção, com pelo menos: compilação, testes, construção do artefacto, três ambientes e uma aprovação.
2. Indica o que corre **em cada pull request** e o que só corre **depois do merge no ramo principal**.
3. Diz o que é construído **uma só vez** e o que muda entre ambientes.
4. Classifica o teu desenho como entrega contínua ou deployment contínuo, e justifica.

---

### Exercício 34 · Escolher a estratégia de release para três alterações

**Nível:** Intermédio

A equipa da Casa Nova tem três alterações previstas para o próximo mês. Para cada uma, escolhe **uma estratégia de release** (tudo de uma vez, rolling, blue/green, canary ou feature flag, ou uma combinação) e justifica com base em risco, reversão e custo.

- **A.** Correção de um erro de arredondamento no cálculo de descontos da API de stock (sem alterações de base de dados).
- **B.** Um novo ecrã de «encomenda recorrente» no portal, que ainda não sabes se os clientes vão usar. O negócio quer experimentar primeiro com 5% dos clientes.
- **C.** A API de stock passa a guardar uma coluna nova na base de dados e a deixar de usar uma coluna antiga. A API é consumida pelo portal e pelas aplicações Delphi das 12 delegações, que não podem ser atualizadas todas no mesmo dia.

Para cada caso, responde: como se volta atrás se correr mal? Que métrica ou sinal te diria que correu mal? Que serviço do Azure (ou AWS equivalente) usarias para o suportar?

---

### Exercício 35 · Interpretar as métricas DORA de uma equipa

**Nível:** Intermédio

Recebes estes números, **fictícios**, de duas equipas da Casa Nova nos últimos seis meses:

| Métrica | Equipa Portal (Bun) | Equipa Balcão (Delphi) |
|---|---|---|
| Frequência de implantação | 3 por semana | 1 de 6 em 6 semanas |
| Tempo de espera de uma alteração (*change lead time*) | 2 dias | 5 semanas |
| Taxa de falha das alterações | 25% | 8% |
| Tempo de recuperação de uma implantação falhada | 6 horas | 2 dias |
| Taxa de retrabalho das implantações | 18% | 5% |

1. Classifica cada métrica como de **débito** ou de **instabilidade**.
2. Descreve o perfil de cada equipa numa frase. Qual está «melhor»? Argumenta porque a pergunta pode estar mal formulada.
3. Propõe **três intervenções** concretas (uma por equipa e uma comum) e, para cada uma, a métrica que esperas ver mexer.
4. A direção quer um ranking das equipas por estas métricas e metas individuais de bónus. Escreve a tua resposta ao diretor, em 5 a 8 linhas, a explicar os riscos e a propor uma alternativa.

---

### Exercício 36 · Analisar um fluxo com assistente de IA e escrever a política

**Nível:** Avançado

Um developer propôs este fluxo de GitHub Actions para o repositório do portal. Um assistente (Claude Code, através da ação `anthropics/claude-code-action`) trata de issues e implanta o resultado.

    name: Assistente
    on:
      issues:
        types: [opened]
    permissions: write-all
    env:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      AZURE_PROD_PASSWORD: ${{ secrets.AZURE_PROD_PASSWORD }}
    jobs:
      resolver-e-publicar:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: anthropics/claude-code-action@v1
            with:
              anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
              prompt: "Resolve esta issue e faz push para main: ${{ github.event.issue.body }}"
              claude_args: '--allowedTools "Bash"'
          - run: ./deploy-producao.sh

1. Identifica **pelo menos seis problemas** de segurança, controlo e rastreabilidade neste fluxo. Para cada um, indica o risco e a correção.
2. Redesenha o fluxo em texto (por etapas, não é preciso YAML completo): quem aprova o quê, que permissões e ferramentas tem o assistente, onde acontece a revisão humana, onde entra a pipeline normal.
3. Escreve um **ADR** (contexto, decisão, alternativas, consequências) com o título «Uso de assistentes de IA no fluxo de desenvolvimento da Casa Nova», incluindo as regras de revisão, rastreabilidade, dados e custos.
4. Indica **duas coisas que não sabes** sobre o teu desenho e que terias de confirmar na documentação ou com o fornecedor antes de o pôr em produção.

## Módulo 10 · Decisões, custos e negócio

### Exercício 37 · Construir, comprar ou configurar: TCO de uma aplicação de visitas comerciais

**Nível:** Iniciante

A Casa Nova Distribuição quer uma aplicação para as equipas comerciais registarem visitas a clientes, com integração ao SAP. Vão usá-la 60 comerciais das 12 delegações. A equipa de arquitetura reuniu duas opções (todos os valores são **fictícios**, horizonte de 5 anos):

| Linha | A. Construir | B. Comprar (SaaS) |
|---|---|---|
| Implementação inicial | 120 000 € | 15 000 € |
| Integração com o SAP (inicial) | incluída | 30 000 € (parceiro) |
| Formação (única) | 4 000 € | 6 000 € |
| Cloud por ano | 9 000 € | incluída |
| Licença | 0 | 40 € por utilizador por mês |
| Manutenção por ano | 0,5 pessoa a 50 000 €/ano | 0,2 pessoa a 50 000 €/ano |

1. Calcula o TCO a 5 anos de cada opção, mostrando o custo inicial e o recorrente.
2. A partir de quantos utilizadores a opção A fica mais barata do que a B? (Assume que só a licença varia com o número de utilizadores.)
3. Indica **três fatores não financeiros** que mudariam a decisão e que opção «configurar» poderias explorar antes de decidir.
4. Escreve duas frases a recomendar uma opção ao diretor de vendas.

### Exercício 38 · Matriz ponderada e esboço de RFP para um prestador de serviços gerido

**Nível:** Intermédio

A Casa Nova vai contratar um prestador para monitorizar e dar suporte 24x7 à plataforma Azure. Depois de um RFI, ficaram três candidatos. Os critérios, pesos e notas (1 a 5) acordados com os stakeholders são:

| Critério | Peso | F1 | F2 | F3 |
|---|---|---|---|---|
| Competência Azure e certificações | 25 | 5 | 3 | 4 |
| Experiência com SAP | 20 | 3 | 5 | 2 |
| Preço | 20 | 2 | 4 | 5 |
| SLA e tempo de resposta | 15 | 4 | 3 | 4 |
| Segurança e RGPD | 10 | 4 | 4 | 3 |
| Referências de clientes | 10 | 4 | 3 | 2 |

1. Calcula a pontuação ponderada de cada fornecedor e indica a ordem.
2. Faz uma análise de sensibilidade: a direção financeira quer que o **Preço pese 30** e a **Competência Azure 15** (os outros pesos mantêm-se). A ordem muda?
3. Explica porque é perigoso definir os pesos depois de ver as notas.
4. Escreve o índice de um **RFP** para este serviço (7 secções) e 5 perguntas obrigatórias a incluir. Diz que prova pedirias além da proposta escrita.

### Exercício 39 · Business case e ROI do stock em tempo real

**Nível:** Intermédio

O projeto «stock em tempo real» da Casa Nova tem estes valores **fictícios**, num horizonte de 4 anos após o ano 0:

- Custo inicial (ano 0): 200 000 €. Custo recorrente: 50 000 € por ano (anos 1 a 4).
- Benefícios em regime pleno: menos vendas perdidas por rutura 70 000 €/ano, menos custo de stock excedente 40 000 €/ano, menos tempo perdido nas delegações 30 000 €/ano.
- No ano 1 só se obtém 50% dos benefícios (arranque).

1. Monta a tabela de fluxos por ano (benefício, custo, líquido, acumulado).
2. Calcula o ROI a 4 anos e indica em que ano acontece o retorno (*payback*).
3. A direção financeira acha os benefícios otimistas e pede um cenário com **benefícios 25% mais baixos** (mantendo o custo). Qual é o novo ROI? Qual é a redução máxima dos benefícios que ainda dá ROI zero?
4. Escreve o **resumo de uma página** (decisão pedida, custo, retorno, principal risco) e indica quem deve validar os pressupostos de benefício e porquê. Não te esqueças da opção «não fazer nada».

### Exercício 40 · Priorizar dívida técnica, estimar e montar o roadmap

**Nível:** Avançado

A Casa Nova levantou esta dívida técnica (escalas de 1 a 5):

| # | Dívida | Impacto | Probabilidade | Esforço |
|---|---|---|---|---|
| 1 | Cópias de segurança da base de dados de integração nunca testadas | 5 | 2 | 1 |
| 2 | *Deploys* manuais nos servidores | 3 | 5 | 3 |
| 3 | Módulo de preços (6 000 linhas) sem testes automáticos | 4 | 4 | 4 |
| 4 | Biblioteca Delphi obsoleta, usada só numa aplicação a retirar dentro de 12 meses | 3 | 2 | 4 |
| 5 | *Logs* sem formato comum e sem pesquisa | 3 | 4 | 2 |
| 6 | Palavras-passe de contas de serviço partilhadas numa folha de cálculo | 5 | 4 | 1 |

1. Calcula a pontuação (impacto × probabilidade ÷ esforço) e ordena. Depois ajusta a ordem com critério: que itens **ignorarias** ou tratarias como obrigatórios independentemente da pontuação?
2. Estima, com a técnica de três pontos, a migração da integração Delphi-SAP de ficheiros partilhados para uma API: otimista 30 dias, mais provável 50, pessimista 100. Dá a estimativa e a incerteza aproximada, e escreve como a comunicarias à direção.
3. Monta um **roadmap Agora / A seguir / Mais tarde** que inclua a dívida, o portal de encomendas e a retirada das aplicações Delphi, com um resultado de negócio por bloco.
4. Propõe uma regra para pagar dívida sem parar as entregas de negócio e duas métricas para ver se está a funcionar.

## Módulo 11 · Migração e modernização

### Exercício 41 · Classificar o portfólio com os «Rs»

**Nível:** Iniciante

A Casa Nova Distribuição tem este inventário (hipotético): (1) ERP SAP em servidores próprios; (2) aplicação Delphi de balcão, instalada nos PCs de 12 delegações; (3) portal de encomendas online atual, lento e difícil de alterar; (4) servidor de ficheiros das delegações, estável; (5) ferramenta de relatórios usada por duas pessoas, com dados que já existem no SAP; (6) sistema de gestão de recursos humanos feito à medida, com muita manutenção e pouca diferenciação para o negócio; (7) tarefas agendadas que trocam ficheiros entre o SAP e as aplicações de balcão.

Para cada componente, escolhe **uma** estratégia (retire, retain, rehost, replatform, refactor, rearchitect, rebuild ou replace) usando o vocabulário da Azure, e escreve numa frase a justificação e **o gatilho que te faria mudar de ideias**. No fim, indica qual dos sete componentes **não** migrarias nesta fase e porquê, e qual **não** deve ser alvo de rehost sem antes ser corrigido.

### Exercício 42 · Desenhar um strangler com camada anticorrupção

**Nível:** Intermédio

O requisito novo é «stock em tempo real» no portal de encomendas. Hoje, o stock está no SAP e é copiado para a base de dados das aplicações de balcão por uma tarefa noturna; as aplicações Delphi consultam essa base diretamente.

1. Desenha, em texto, a arquitetura na fase 1 (fachada a encaminhar tudo para o legado) e na fase 2 (a fatia «consulta de stock» já no serviço novo).
2. Indica onde colocas a **camada anticorrupção**, o que ela traduz e o que **não** deve fazer.
3. Define a ordem de **três fatias** (consulta de stock, criação de encomendas, faturação) e justifica a ordem com valor de negócio e risco.
4. Lista três critérios para considerar que o legado pode ser desativado e dois riscos da própria fachada.

### Exercício 43 · Plano de cutover, rollback e riscos para a migração de dados

**Nível:** Intermédio

Vais migrar a base de dados de encomendas (SQL Server em servidores próprios) para um serviço gerido em Azure. A empresa não pode estar parada em horário de balcão; a época alta de vendas começa dentro de oito semanas.

1. Escolhe entre migração com paragem e quase sem paragem, e justifica.
2. Descreve as fases (carga inicial, sincronização, validação, go/no-go, cutover, observação, remoção do legado) e indica o **ponto sem retorno**.
3. Escreve **cinco critérios de falha** mensuráveis que acionam o rollback e quem decide.
4. Constrói um registo de riscos com **quatro riscos**, cada um com probabilidade, impacto, mitigação e sinal de alerta.
5. Diz que calendário recomendas face à época alta.

### Exercício 44 · Decidir o futuro das aplicações Delphi (ADR)

**Nível:** Avançado

A Casa Nova tem três aplicações Delphi: (A) a aplicação de **balcão** (vendas e consulta de stock), usada todos os dias e ligada diretamente à base de dados; (B) uma aplicação de **gestão de armazém** que comunica com leitores de código de barras e uma impressora de etiquetas, com código que só uma pessoa conhece; (C) uma aplicação de **relatórios** usada mensalmente, com lógica já duplicada no SAP.

1. Aplica os critérios de decisão (valor de negócio, estado do código e conhecimento, necessidade de mudar, dependências de hardware, equipa e orçamento) e decide, para cada uma, **manter, encapsular com API ou reescrever** (ou retire).
2. Escreve um **ADR** (contexto, decisão, alternativas consideradas, consequências) para a aplicação A.
3. Para a aplicação A, descreve a API que criarias (3 a 5 operações), onde a hospedarias e que ACL colocarias entre essa API e o SAP.
4. Identifica o maior risco do teu plano e a medida que o reduz. Indica também o que terias de confirmar (versão do Delphi, licenciamento, estado do código) antes de te comprometeres.

## Módulo 12 · Comunicação e liderança

### Exercício 45 · Uma decisão, quatro públicos

**Nível:** Iniciante

Na Casa Nova Distribuição, a equipa propôs **substituir a integração diária por ficheiros entre o SAP e o portal de encomendas por uma integração baseada em eventos**, executada em Azure. A decisão técnica já foi tomada e documentada num ADR. Falta comunicá-la.

Escreve, para cada um dos quatro públicos abaixo, uma mensagem de **no máximo 4 linhas** sobre a mesma decisão:

1. A administração (decide o orçamento).
2. A responsável de operações de armazém (usa o stock todos os dias).
3. A equipa Delphi dos balcões (mantém a aplicação que lê dados do SAP).
4. O responsável de segurança (avalia risco e dados pessoais).

Depois, numa tabela, indica para cada público: o que precisa de decidir ou fazer, o que destacaste e o que deixaste de fora de propósito. Termina com uma pergunta que farias a cada público para confirmar que a mensagem foi percebida.

### Exercício 46 · One-pager para a direção

**Nível:** Intermédio

A administração da Casa Nova vai ter 10 minutos, na próxima segunda-feira, para decidir se aprova a **fase 1** do projeto «Stock em tempo real e portal de encomendas» (duas delegações-piloto, 8 semanas). Tens estes dados, todos fictícios:

- Problema: o stock visível online está desatualizado até uma hora; as delegações reintroduzem encomendas à mão.
- Opções: A) não fazer nada; B) remendar as integrações existentes; C) camada de integração por eventos em Azure, por fases.
- Custos de ordem de grandeza (ilustrativos): A) sem investimento, mas com perdas contínuas; B) baixo agora, a crescer com manutenção; C) médio, repartido por três fases.
- Riscos: dependência de duas pessoas que conhecem bem o SAP; resistência nas delegações; o SAP não pode parar.
- Restrições: orçamento limitado, equipa interna pequena, RGPD.

Escreve o **one-pager** (máx. uma página) com os blocos: problema, objetivo e métricas, solução em imagem (desenha em texto um diagrama de contexto simples), opções consideradas, custo e prazo, riscos principais e decisão pedida. Aplica a regra «conclusão primeiro». Acrescenta ao fim as **três perguntas mais difíceis** que a administração pode fazer e uma resposta curta para cada.

### Exercício 47 · Guião de uma revisão de arquitetura

**Nível:** Intermédio

Foste nomeado para conduzir a revisão de uma proposta de outra equipa: expor ao público, através de uma API nova em Bun hospedada em Azure, a consulta de encomendas dos clientes da Casa Nova, lendo dados do SAP. A proposta inclui um diagrama e um ADR, mas a equipa nunca fez uma revisão formal e está nervosa.

Prepara:

1. O que pedes à equipa **antes** da sessão (documentos, prazo) e o que declaras como objetivo da revisão (aprovar, aconselhar ou informar), com justificação.
2. A **agenda** da sessão de 60 minutos, com tempos.
3. Uma lista de **8 perguntas** que farias, cobrindo negócio, falhas, segurança e dados pessoais, operação e reversibilidade.
4. Como lidas com duas situações: (a) um participante dominante critica a pessoa e não a proposta; (b) a equipa discorda do teu parecer e ninguém tem autoridade formal para decidir.
5. O formato do **registo** que enviarás em 24 horas.

### Exercício 48 · Dizer «não» com alternativas

**Nível:** Avançado

O diretor comercial da Casa Nova pede-te, numa reunião: «Para a campanha de Natal, quero o portal a ler o stock **diretamente da base de dados do SAP**, e quero-o pronto em 3 semanas. É só ligar.» A equipa interna é pequena, o SAP não pode parar e a segurança já levantou reservas sobre acessos diretos a bases de dados de sistemas centrais.

1. Identifica o **interesse real** do diretor por detrás da posição pedida, e o que é negociável e inegociável do teu lado.
2. Lista o que terias de **confirmar antes de afirmar** o risco (por exemplo, com a documentação do fornecedor ou da equipa SAP), em vez de o dares como certo.
3. Escreve o «não» seguindo a estrutura: reconhecer o objetivo, explicar o risco, oferecer **três opções** com prazo e impacto, recomendar e perguntar.
4. Escreve o que dirias se o diretor responder: «não me interessa, decide a administração, quero à mesma».
5. Descreve como registarias o resultado (por exemplo, num ADR ou registo de risco) se a decisão final for contra a tua recomendação.
6. Indica duas coisas que mudarias nesta abordagem numa **empresa muito formal** e duas numa **empresa muito pequena**.

## Módulo 13 · Temas avançados

### Exercício 49 · Mapa de capacidades e plataforma de dados

**Nível:** Iniciante

A Casa Nova Distribuição (400 colaboradores, 12 delegações) tem os seguintes sistemas: SAP (encomendas, stock, faturação, contabilidade), aplicações Delphi de balcão (consulta de stock, emissão de orçamentos, registo de devoluções), uma folha de cálculo de preços mantida pelo departamento comercial, um portal de encomendas novo (em construção) e um sistema de transporte contratado a um fornecedor externo.

1. Escreve um **mapa de capacidades** com pelo menos 10 capacidades de negócio, agrupadas em 3 a 4 áreas. Cada capacidade descreve **o que** a empresa faz, sem nomear sistemas.
2. Para cada capacidade, indica o(s) sistema(s) que a suportam hoje e assinala as que têm **sobreposição** ou **falta de sistema**.
3. Escolhe **duas** capacidades onde investirias primeiro e justifica numa frase cada (risco, valor, dívida técnica).
4. A direção pede indicadores semanais de vendas e rutura de stock por delegação. Indica se recomendas *data warehouse*, *lakehouse* ou *data mesh* para a Casa Nova, e justifica em 4 a 6 linhas, referindo a dimensão da equipa. Diz também em que condições reavaliarias a decisão.
5. Numa frase, explica a diferença entre o teu trabalho (arquiteto de soluções) e o de um arquiteto empresarial neste caso.

### Exercício 50 · Fitness functions para a Casa Nova

**Nível:** Intermédio

O módulo 02 produziu (entre outros) estes requisitos não funcionais para o portal de encomendas:

- R1: a consulta de stock responde em menos de 800 ms no percentil 95, com 200 utilizadores em simultâneo.
- R2: se o SAP estiver indisponível, o portal continua a aceitar encomendas durante pelo menos 4 horas.
- R3: o código de domínio (regras de negócio) não pode depender de bibliotecas de acesso a bases de dados nem de clientes HTTP do SAP, para poder ser testado sem infraestrutura.
- R4: nenhum serviço novo pode entrar em produção sem dono identificado e sem painel de monitorização.

Para cada requisito:

1. Escreve a **fitness function** correspondente: o que mede ou verifica, qual o limiar de falha e como se automatiza (descreve, não é preciso código; no R3, descreve a regra que um script ou ferramenta verificaria).
2. Classifica-a como atómica ou holística e diz **onde e quando corre** (a cada pedido de integração, noturno, periódico, em produção).
3. Diz quem é o dono da função e o que acontece quando falha (bloqueia o *merge*? gera alerta?).

Por fim, escolhe **uma** destas funções para **não** automatizar, com justificação (custo de manutenção vs valor) e diz o que farias no lugar da automatização.

### Exercício 51 · Rever um desenho de assistente com IA

**Nível:** Avançado

Um colega propõe este desenho para o «Assistente Casa Nova», para o balcão das 12 delegações:

    Balcão (browser) --> API do assistente --> Agente autónomo (modelo único, o maior disponível)
                                                 |-- ferramenta: escrever no SAP (criar encomendas e alterar preços)
                                                 |-- ferramenta: pesquisa vetorial num índice único com
                                                 |   TODOS os documentos (contratos, RH, fichas técnicas,
                                                 |   regras de devolução, listas de preços) e cópias
                                                 |   diárias do stock exportado do SAP
                                                 |-- sem limite de pedidos nem de tokens por utilizador
    Responde diretamente ao cliente final no portal, sem revisão.

Não existe plano de avaliação, nem dono do sistema, nem registo das conversas.

1. Identifica **pelo menos 8 problemas** de arquitetura, agrupados por custo, latência, risco/segurança, avaliação e governação.
2. Redesenha a solução (diagrama em texto) usando o padrão mais simples que serve o caso, e justifica **a escolha entre RAG, workflow com ferramentas e agente**.
3. Indica o que deve vir por RAG e o que deve vir por API, e porquê.
4. Escreve a **fórmula de custo por pedido** (sem inventar preços) e três mecanismos para limitar o custo.
5. Propõe um **plano de avaliação** com pelo menos 4 tipos de perguntas de teste.
6. Diz que categorias de risco do AI Act e que verificações com o jurídico e o encarregado de proteção de dados farias antes de pôr o assistente à frente de clientes.
7. Escreve duas regras para o ficheiro de instruções do repositório (por exemplo `CLAUDE.md` ou `AGENTS.md`) que ajudem um assistente de programação a manter esta arquitetura.

### Exercício 52 · Multi-cloud e uma tecnologia da moda

**Nível:** Intermédio

Num comité, um diretor diz: «Para não ficarmos reféns da Microsoft, a solução da Casa Nova deve correr em Azure **e** noutra cloud ao mesmo tempo.» Na mesma reunião, um developer propõe trocar a base do portal por uma tecnologia de que ouviu falar numa conferência e que «toda a gente vai usar».

1. Escreve uma resposta de uma página ao diretor: distingue multi-cloud ativo, cloud híbrida e portabilidade planeada; lista **cinco custos reais** do multi-cloud ativo para uma equipa pequena; e propõe uma alternativa concreta que trate o receio de dependência.
2. Lista duas situações em que **concordarias** com multi-cloud.
3. Escreve o ADR (contexto, decisão, consequências) «Azure como destino único, com custo de saída documentado», incluindo uma estimativa qualitativa (baixo, médio, alto) do custo de saída de três componentes à tua escolha.
4. Aplica o filtro de cinco perguntas do módulo à tecnologia proposta pelo developer, com respostas plausíveis, e conclui: adotar, experimentar com prazo, ou recusar por agora. Descreve a experiência (duração, critério de sucesso) se escolheres «experimentar».
5. Indica o que irias acompanhar regularmente (fontes e frequência) e de que forma registarias o resultado no radar interno da empresa.

## Projeto final

### Exercício 53 · Solução ponta a ponta

**Nível:** Avançado

Desenha e documenta uma solução completa para o caso Casa Nova Distribuição (ou para um problema real teu, anonimizado), seguindo o módulo 14: sete entregáveis, das necessidades de negócio à apresentação à direção.

**PRATICAR:** faz o projeto por fases e usa a grelha de avaliação do módulo 14 e a lista de verificação do módulo 16.
