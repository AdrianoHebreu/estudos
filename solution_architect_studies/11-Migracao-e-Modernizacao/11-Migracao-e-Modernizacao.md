# 11 Migração e modernização

## Quase nada é construído do zero

Até aqui desenhaste soluções como se o terreno estivesse vazio. Na vida real, quase todas as empresas já têm sistemas a funcionar, com dados, utilizadores e dependências escondidas. Desenhar a solução-alvo é a parte fácil: a parte difícil é **chegar lá sem parar o negócio**.

Dois termos que se confundem:

- **Migração:** mover um sistema, dados ou carga de trabalho de um sítio para outro (por exemplo, de servidores próprios para Azure), com mais ou menos alterações.
- **Modernização:** alterar o sistema (código, arquitetura, tecnologia) para que responda melhor às necessidades atuais. Pode acontecer **durante** a migração ou **depois** dela.

O trabalho do arquiteto é decidir, **para cada peça**, quanto mudar, em que ordem, com que proteções e como voltar atrás se correr mal.

**ATENÇÃO:** «migrar tudo para a cloud» não é uma estratégia. Uma estratégia diz, peça a peça, o que se faz, porquê e com que critério de sucesso.

## As estratégias de migração (os «Rs»)

Cada fornecedor usa um conjunto ligeiramente diferente de nomes. Estes são os que as documentações oficiais da Azure e da AWS usam hoje:

| Azure (Cloud Adoption Framework) | AWS (os «7 Rs») | Significado |
|---|---|---|
| Retire | Retire | Desativar o que já não dá valor |
| Retain | Retain | Manter onde está, por agora ou por restrição |
| Rehost | Rehost («lift and shift») | Mover sem alterar a aplicação (VM para VM) |
| (sem equivalente próprio) | Relocate | Mover para a versão cloud da mesma plataforma, ou entre contas/regiões |
| Replatform | Replatform | Mover com otimizações pontuais (por exemplo, BD gerida) |
| Refactor | Refactor ou re-architect | Azure: melhorar o código. AWS: redesenhar a arquitetura |
| Rearchitect | (incluído em refactor) | Redesenhar a arquitetura (modularizar, decompor) |
| Rebuild | (incluído em refactor) | Reconstruir de raiz de forma cloud-native |
| Replace | Repurchase («drop and shop») | Substituir por produto de mercado ou SaaS |

**NOTA:** «Replace» (Azure) e «Repurchase» (AWS) são o mesmo conceito com nomes diferentes. A Azure separa refactor (código), rearchitect (arquitetura) e rebuild (de raiz); a AWS junta-os em «refactor ou re-architect». Existem outras listas (com 5 ou 6 «Rs») em livros e blogs: o nome é menos importante do que o raciocínio. Num exame, usa o vocabulário do fornecedor do exame.

### Como escolher

Pergunta-guia por peça: ainda dá valor (se não, *retire*)? Há restrição que impeça mover (*retain*)? É estável e sem mudanças previstas (*rehost*)? Um serviço gerido resolve com pouco código (*replatform*)? O desenho limita escala ou evolução (*rearchitect* ou *rebuild*)? Há produto de mercado que cubra a necessidade (*replace*)?

Duas recomendações das documentações oficiais merecem ficar:

- A Azure avisa para **não fazer rehost de cargas problemáticas**: mover não resolve problemas de desempenho, fiabilidade ou arquitetura, apenas os leva para a cloud.
- A AWS recomenda, em migrações de grande escala, **evitar refactor durante a migração** (é a estratégia mais complexa e cara) e modernizar depois de migrar. A Azure diz algo semelhante: modernizar durante a migração só quando a equipa tem competências e tempo, e com justificação de negócio.

**DICA:** não há estratégia «melhor». O mesmo sistema pode ser rehost agora e rearchitect daqui a dois anos. Regista a decisão e o **gatilho** que a faria mudar.

## Exemplo trabalhado: o portfólio da Casa Nova Distribuição

Inventário (hipotético, para o exemplo) e uma primeira proposta de estratégia:

| Componente | Situação | Estratégia proposta | Justificação |
|---|---|---|---|
| ERP SAP em servidores próprios | Sistema central; versão e plano de evolução por confirmar | Retain por agora | Decisão de maior impacto; condiciona o resto (ver secção SAP) |
| Apps Delphi de balcão (VCL) | Instaladas em PCs das delegações, ligam-se diretamente à BD | Retain + encapsular com API | Funcionam e os operadores conhecem-nas; o problema é o acoplamento à BD |
| Base de dados de stock duplicada | Dados duplicados entre sistemas | Replatform | BD gerida, com uma fonte de verdade por entidade |
| Portal de encomendas atual | Lento, difícil de evoluir | Rebuild, via *strangler* | Requisito novo de stock em tempo real; vale a pena novo serviço |
| Integrações feitas à medida (ficheiros, tarefas agendadas) | Frágeis, pouco documentadas | Rearchitect gradual | Substituir por APIs e mensagens (módulo 05) |
| Ferramenta de relatórios antiga | Poucos utilizadores | Retire | Custo de migrar maior do que o valor |
| Servidores de ficheiros | Estáveis | Rehost | Baixo risco; liberta datacenter |

## O padrão strangler fig

O nome vem da figueira-estranguladora, que cresce à volta de uma árvore até a substituir (a imagem é de Martin Fowler). A ideia: em vez de substituir o sistema antigo de uma vez (big bang), constrói-se o novo **ao lado** e passa-se a funcionalidade aos poucos, até o antigo poder ser desligado.

    Fase 1            Fase 2                Fase 3              Fase 4
    Cliente           Cliente               Cliente             Cliente
       |                 |                     |                   |
    [Fachada]         [Fachada]             [Fachada]               |
       |                 |   \                   |                   |
    Legado           Legado  Novo              Novo                Novo
    (100%)           (parte) (parte)          (100%)            (fachada removida)

1. Colocas uma **fachada** (façade, um proxy) entre os clientes e o sistema atual. No início encaminha tudo para o legado.
2. Escolhes uma **fatia** de funcionalidade, constróis no sistema novo e a fachada passa a encaminhar esses pedidos para lá.
3. Repetes, fatia a fatia. O legado perde responsabilidades.
4. Quando já nada depende dele, desligas o legado e removes a fachada (ou mantém-na como adaptador para clientes antigos).

Os clientes mantêm a mesma interface e não sabem que há uma migração a decorrer.

### Quando usar e quando não usar

| Usa quando... | Não é adequado quando... |
|---|---|
| O sistema é grande e um *big bang* seria arriscado | Não consegues intercetar os pedidos ao legado |
| O legado pode continuar vivo durante muito tempo | Não tens acesso ao código nem a outro ponto de integração que possas alterar (por exemplo, a BD) |
| O negócio quer novas funcionalidades durante a transição | O sistema é pequeno e substituí-lo é simples |
| Os utilizadores devem ser pouco afetados | Precisas de desligar o original rapidamente |

### Cuidados

- A fachada **não pode** tornar-se ponto único de falha nem estrangulamento de desempenho.
- Escolher mal as fatias (fronteiras do domínio) sai caro: decompor cedo demais, com o domínio pouco claro, é um risco apontado pela AWS. Técnicas de modelação do domínio (DDD, *event storming*) ajudam a encontrar as fronteiras.
- A fachada e o código de transição são **arquitetura temporária**, com custo. Planeia a sua remoção.
- Fowler avisa que reescritas «iguais ao original» falham muitas vezes: demoram demasiado e especificar o comportamento existente é difícil. Não copies comportamento só porque existe: confirma que é necessário.

**DICA:** a ordem das fatias é uma decisão de negócio. Começa por fatias com **valor alto e risco baixo**, para ganhares confiança e mostrares resultados cedo (consulta de stock antes de faturação, por exemplo).

## Camada anticorrupção (ACL)

Durante a coexistência, o sistema novo tem de falar com o antigo (e vice-versa). Se o novo adotar o modelo de dados e as convenções do legado, **herda os seus defeitos**. A **camada anticorrupção** (anti-corruption layer, ideia do Domain-Driven Design de Eric Evans) é um tradutor entre os dois lados: cada sistema fala o seu modelo, e a camada converte.

    Portal novo (modelo novo)  -->  [ ACL ]  -->  SAP / BD legada (modelo antigo)
       "Encomenda" com ids               traduz campos,        BAPI, IDoc, tabelas,
       limpos e estados claros           códigos e estados     códigos internos

A documentação da Azure dá um exemplo conceptual: Azure API Management expõe uma fachada REST (autenticação, limites de pedidos), uma Azure Function faz o mapeamento entre o modelo novo e o modelo do legado, e Azure Monitor com Application Insights observa o sucesso e a latência da tradução. A AWS usa o mesmo conceito dentro do *strangler fig*.

| Aspeto | O que decidir |
|---|---|
| Tempo de vida | Temporária (retira-se após a migração) ou permanente (protege-te de um sistema que não controlas, como o SAP) |
| Custos | Mais latência, mais um serviço para operar, escalar e monitorizar |
| Segurança e operação | Validar entradas na fronteira; *correlation IDs* e *logs* estruturados para diagnosticar falhas de tradução |

**ATENÇÃO:** a ACL só **traduz**. Se começares a pôr regras de negócio ou orquestração lá dentro, crias um novo monólito escondido.

## Coexistência e migração de dados

Durante meses (ou anos), os dois sistemas vão coexistir. Os dados são a parte mais perigosa.

| Questão | Orientação |
|---|---|
| Quem é a fonte de verdade? | Uma só por entidade e por fase (por exemplo, «stock» no SAP até ao *cutover* dessa fatia, depois no novo serviço). Documenta-o |
| Como se sincroniza? | Carga inicial (ETL) e depois captura de alterações (*change data capture*, CDC) ou mensagens. A Azure descreve este fluxo para extrair a BD de um domínio de uma BD monolítica |
| Que consistência aceitas? | A sincronização por filas dá consistência **eventual**: a AWS aconselha tratá-la como solução tática até haver uma solução definitiva |
| Como validas? | Comparações de contagens e somas entre origem e destino, antes do *cutover* |
| E o legado que não podes alterar? | Se a lógica vive na BD (procedimentos armazenados), a BD pode emitir mensagens ou usar CDC, sem mexer no código da aplicação |

**ATENÇÃO:** escrever nos dois sistemas ao mesmo tempo («dual write») sem mecanismo de reconciliação é uma fonte clássica de dados divergentes. Prefere um sentido único de sincronização por entidade. É a regra prática mais segura, mas confirma sempre se a tua tecnologia a permite.

A rede condiciona a migração de dados: o Cloud Adoption Framework compara ExpressRoute (privado, rápido, exige instalação), VPN (seguro mas mais lento), Azure Data Box (offline, para grandes volumes, o mais lento por causa do envio) e internet pública (só para dados não sensíveis).

## Cutover e rollback

O **cutover** é o momento em que os utilizadores passam do sistema antigo para o novo. O **rollback** é o plano para voltar atrás se falhar. A regra: **o rollback define-se antes de começar, não durante o incidente.**

A documentação da Azure distingue dois métodos:

| Método | Quando | Vantagem | Desvantagem |
|---|---|---|---|
| Com paragem | Cargas não críticas; há janela de manutenção | Mais simples e rápido | Interrupção do serviço |
| Quase sem paragem | Cargas críticas, SLAs exigentes | Interrupção mínima (replicação contínua) | Mais complexo; exige testes prévios |

Para o rollback, a mesma documentação recomenda: definir o que conta como falha (testes de saúde, tempos de resposta, taxas de erro), automatizar os passos na pipeline, escrever instruções por carga de trabalho, **testar o rollback** em pré-produção e rever depois de cada utilização.

**ATENÇÃO:** existe um **ponto sem retorno**. No exemplo da BD descrito pela Azure, o rollback é fácil enquanto as tabelas do legado e a sincronização ainda existem; depois de as removeres, voltar atrás exige restaurar objetos e repetir alterações, com muito mais esforço e risco. Remover os objetos do legado é o **último** passo, só depois de o novo estar validado: carga inicial, sincronização, validação, go/no-go, cutover, período de observação (rollback ainda possível) e só depois a remoção.

## Planeamento e gestão de riscos

### Dependências, ondas e ordem

A documentação da Azure propõe descobrir **todas** as dependências antes de agrupar, e migrar em **ondas** (waves):

- Dependências diretas (baixa latência entre componentes): mover juntas.
- Dependências indiretas: podem ir em ondas separadas, se tolerarem latência.
- Dependências de negócio: agrupar sistemas e relatórios relacionados.
- Se houver dúvida, **agrupa**: separar é fácil depois.

Para prioridade, cruza **valor de negócio** com **esforço**: alto valor e baixo esforço primeiro (ganhos rápidos); baixo valor e alto esforço, evitar ou adiar. Começa por cargas simples e **ambientes de não produção**; deixa os sistemas críticos para depois de provares a competência da equipa; evita janelas críticas (fecho de contas, lançamentos, época alta).

### Registo de riscos

| Risco | Probabilidade / impacto | Mitigação | Sinal de alerta |
|---|---|---|---|
| Dependência não descoberta (ficheiro, tarefa agendada, relatório) | Alta / Alto | Descoberta com ferramentas e entrevistas; agrupar em caso de dúvida | Falha só visível em produção |
| Dados divergentes entre sistemas | Média / Alto | Uma fonte de verdade por entidade; reconciliação | Diferenças nas contagens |
| Equipa sem experiência em Azure | Média / Médio | Formação, ambientes de teste, apoio externo | Atrasos nas primeiras ondas |
| Janela de *cutover* ultrapassada | Média / Alto | Ensaio, critérios de go/no-go, rollback testado | Ensaios mais longos do que o previsto |

## Modernizar aplicações Delphi: manter, encapsular ou reescrever

As aplicações Delphi de balcão são um caso típico: funcionam e são essenciais, mas estão acopladas (frequentemente ligam-se diretamente à base de dados). Há três caminhos, que se combinam:

| Opção | O que é | Quando faz sentido | Riscos |
|---|---|---|---|
| **Manter** | Deixar como está; só correções | Estável, poucas alterações, sem pressão externa | Dívida acumula; dependência de pessoas e de versões antigas |
| **Encapsular com API** | Criar uma API estável à frente dos dados e da lógica; a app passa a usá-la (ou deixa de aceder à BD diretamente) | O valor está na lógica e nos dados; precisas de integrar com sistemas novos | É preciso desenhar a API e uma ACL; trabalho no código existente |
| **Reescrever** | Substituir por outra aplicação (web, outra tecnologia) | UI ou tecnologia bloqueia o negócio; sem código/conhecimento; requisitos mudaram muito | Maior custo e risco; perde-se comportamento não documentado |

### Critérios de decisão

| Critério | Inclina para manter | Inclina para encapsular | Inclina para reescrever |
|---|---|---|---|
| Valor de negócio atual | Estável | Alto, integração necessária | Baixo ou o processo mudou |
| Estado do código e testes | Qualquer | Razoável, modular | Inviável de manter |
| Necessidade de mudar | Baixa | Média (integrar) | Alta (novos canais, mobilidade) |
| Dependências (hardware, impressoras, balanças, versões) | Fortes | Moderadas | Fracas ou resolúveis |

Sobre o ecossistema, só o que a documentação do fabricante (Embarcadero) confirma: **VCL** é a biblioteca de componentes de interface para Windows; **FireDAC** liga a mais de 20 bases de dados; existem bibliotecas de cliente REST; e o **RAD Server** é uma plataforma de back-end que publica APIs REST/JSON a partir de lógica Delphi ou C++ e se liga a bases de dados via FireDAC (a página indica requisitos de edição e de licença: confirma).

**DICA:** encapsular não obriga a usar Delphi para a API. Podes expor a API num serviço novo (por exemplo, em Bun) com ACL para o SAP e para a BD, e deixar as apps de balcão a consumi-la através de um cliente REST. O que importa é a aplicação deixar de depender da estrutura interna dos dados.

## O SAP no caminho de migração

O SAP é o sistema central da Casa Nova e, por isso, a decisão mais condicionante. Só o que está verificado na documentação oficial:

| Cenário de transição para SAP S/4HANA | Descrição (SAP Learning) |
|---|---|
| Conversão de sistema (*system conversion*) | Processo técnico guiado de conversão 1:1 de um sistema SAP ERP existente |
| Nova implementação (*new implementation*) | Instalação nova (*greenfield*); não migra transações já concluídas |
| Transição seletiva de dados (*selective data transition*) | Abordagem assistida por ferramentas para migrar e transformar seletivamente configuração, dados mestre e transacionais |

O que isto significa para o arquiteto:

- **Descobre primeiro** a versão do SAP da empresa, se há plano de evolução e quem decide. Tudo o resto depende disto.
- Qualquer que seja o cenário, aplicações como o portal novo **não devem** acoplar-se à estrutura interna do SAP. Isola-o com uma **ACL** e integra por interfaces estáveis (OData, BAPI/RFC, IDoc, eventos: confirma em help.sap.com quais existem na tua versão). Assim, a mudança de cenário SAP não parte o resto.
- A Microsoft mantém documentação própria para cargas SAP em Azure. Não prometas detalhes (tamanhos, suporte de versões, topologias) sem os confirmar com a Microsoft e a SAP, e com um parceiro que o tenha feito.

## Migração para Azure: Azure Migrate

O **Azure Migrate** é o serviço da Microsoft para decidir, planear e executar migrações para Azure, com suporte a servidores, bases de dados, aplicações web, desktops virtuais e migração offline em larga escala (com Azure Data Box). A documentação descreve três fases:

| Fase | O que fazes | Exemplos no Azure Migrate |
|---|---|---|
| **Decidir** | Descobrir o inventário e justificar | Appliance de descoberta (ou collector, ou importação); business case com TCO, comparação anual de fluxos de caixa |
| **Planear** | Avaliar e dimensionar | Avaliações de prontidão para Azure, dimensionamento (right-sizing), estimativa de custos, análise de dependências |
| **Executar** | Migrar ou modernizar | Migração de VMs VMware (sem agente ou com agente), Hyper-V, servidores físicos; aplicações web ASP.NET para Azure App Service |

O serviço é gratuito, mas ferramentas de parceiros podem ter custos. Para bases de dados SQL, a Azure tem o **Azure Database Migration Service**, que suporta migrações online (quase sem paragem) e offline. As aplicações Delphi de balcão correm nos PCs das delegações: o que migra para Azure é o servidor e a base de dados por trás delas, não os clientes.

A documentação do Cloud Adoption Framework pressupõe uma *landing zone* Azure preparada (módulo 06) antes de migrar, e propõe cinco passos: planear, preparar, executar, otimizar e desativar a origem.

| Necessidade | Azure | Equivalente AWS |
|---|---|---|
| Descoberta e avaliação | Azure Migrate | AWS Application Discovery Service e Migration Hub (o Application Discovery Service já não aceita novos clientes; a AWS aponta o AWS Transform) |
| Migração de servidores | Azure Migrate (ferramenta de migração) | AWS Transform MGN (replicação contínua ao nível do bloco) |
| Migração de bases de dados | Azure Database Migration Service | AWS Database Migration Service |
| Fachada para *strangler* | Azure API Management (exemplo na documentação da ACL) | Amazon API Gateway |

**NOTA:** nomes de serviços e disponibilidade mudam com frequência (a AWS Migration Hub Refactor Spaces, por exemplo, já não aceita novos clientes desde novembro de 2025, segundo a documentação). Confirma sempre o estado atual na documentação.

## Modelo reutilizável

### Ficha por carga de trabalho

A Microsoft propõe um modelo de plano de adoção com os dados a recolher por carga de trabalho. Versão resumida:

    Nome, donos (técnico e de negócio), criticidade, dependências, BD envolvidas
    SLA / RTO / RPO, janelas de manutenção, conformidade, sensibilidade e residência de dados
    Estratégia escolhida (R) e gatilho para rever
    Método de cutover (com paragem / quase sem paragem) e janela
    Critérios de sucesso e de rollback; quem decide (go/no-go)
    Custo estimado e esforço

### Lista de verificação de cutover

1. Inventário e dependências validados e grupo de migração completo?
2. Fonte de verdade por entidade definida e documentada?
3. Carga inicial e sincronização validadas (contagens e somas)?
4. Ensaio feito em pré-produção, com tempo medido?
5. Critérios de falha e de rollback escritos, e rollback **testado**?
6. Janela fora de períodos críticos, responsável pelo go/no-go definido e período de observação previsto?

## Depende da empresa

| Fator | Impacto |
|---|---|
| Dimensão e equipa | Equipas pequenas fazem menos ondas e recorrem a parceiros; empresas grandes têm fábrica de migração e governação própria |
| Apetite pelo risco e cultura | Setores regulados exigem mais ensaios e aprovações; onde a mudança é lenta, o *strangler* é mais fácil de aceitar do que um *big bang* |
| Dependência de fornecedores (ERP) | Se o SAP é gerido por terceiros, o calendário não é teu |

## Erros comuns

- **Big bang sem plano de recuo:** tudo numa noite, sem rollback testado.
- **Rehost de um problema:** levar para a cloud um sistema mal desenhado e esperar que melhore.
- **Regras de negócio na ACL:** o tradutor torna-se um monólito escondido.
- **Subestimar o SAP:** tratá-lo como mais um sistema, quando condiciona tudo.

## Ligação às certificações

**Azure (AZ-305):** o guia de estudo, nas competências medidas desde 17 de abril de 2026, tem uma secção **Design migrations** dentro do domínio **Design infrastructure solutions**. Os tópicos incluem avaliar uma solução de migração que use o Cloud Adoption Framework, avaliar servidores, dados e aplicações locais, recomendar migração de cargas para IaaS e PaaS, de bases de dados e de dados não estruturados. Os temas deste módulo (os «Rs», descoberta e dependências, método de cutover, bases de dados) servem estes tópicos. Cai também em **Design business continuity solutions** (rollback, RTO e RPO) e em **Design data storage solutions** (migração de dados).

**Serviço Azure principal:** Azure Migrate (descoberta, avaliação e migração); Azure Database Migration Service para bases de dados.

**AWS:** o equivalente é a família de ferramentas de migração (AWS Transform MGN, AWS DMS, Application Discovery Service e Migration Hub) e o vocabulário dos 7 Rs. O guia do exame AWS Certified Solutions Architect indica o âmbito por domínios: confirma lá onde a migração cai, porque não o verifiquei.

**ATENÇÃO:** os domínios e tópicos mudam. Lê a lista atual no guia do exame antes de estudar.

## Exercícios

**PRATICAR:** faz os exercícios 41 a 44 do módulo 15 (classificar o portfólio pelos «Rs», desenhar um strangler com ACL, planear o cutover e os riscos de uma migração de dados, e decidir o futuro das aplicações Delphi). Guarda as respostas: vão servir ao projeto final (módulo 14).

## Fontes oficiais

- [Azure Cloud Adoption Framework: Select your cloud migration strategies](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/select-cloud-migration-strategy)
- [Azure Cloud Adoption Framework: Plan your migration](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/plan-migration)
- [Azure Cloud Adoption Framework: Cloud adoption plan template for migration](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/plan/migration-adoption-plan)
- [AWS: About the migration strategies (7 Rs)](https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html)
- [Azure Architecture Center: Strangler Fig pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)
- [Azure Architecture Center: Anti-Corruption Layer pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
- [AWS Prescriptive Guidance: Strangler fig pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)
- [Martin Fowler: Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [About Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/migrate-services-overview)
- [Azure Database Migration Service](https://learn.microsoft.com/en-us/azure/dms/dms-overview)
- [AWS Transform MGN](https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html)
- [AWS Database Migration Service](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [AWS Application Discovery Service](https://docs.aws.amazon.com/application-discovery/latest/userguide/what-is-appdiscovery.html)
- [SAP Learning: conversão para SAP S/4HANA](https://learning.sap.com/courses/sap-s-4hana-conversion-and-sap-system-upgrade/understanding-the-concept-of-an-upgrade-and-an-sap-s-4hana-conversion)
- [Microsoft: SAP on Azure](https://learn.microsoft.com/en-us/azure/sap/workloads/get-started)
- [Embarcadero: Delphi](https://www.embarcadero.com/products/delphi)
- [Embarcadero: RAD Server](https://www.embarcadero.com/products/rad-server)
- [Study guide AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)
- [AWS Certified Solutions Architect - Associate](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
