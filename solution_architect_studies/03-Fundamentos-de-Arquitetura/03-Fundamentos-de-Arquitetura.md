# 03 Fundamentos de arquitetura

## O que é um estilo de arquitetura

Um **estilo de arquitetura** é uma família de desenhos que partilham as mesmas características e os mesmos compromissos. Não depende de uma tecnologia concreta: o mesmo estilo pode ser construído em Delphi, em Bun ou em Java. O que o estilo define é **como as partes se dividem, como falam entre si e o que se ganha e se perde com isso**.

A ideia central do módulo: **não existe o melhor estilo, existe o estilo que serve os atributos de qualidade que o negócio priorizou** (módulo 02). Escolher é gerir compromissos, não seguir modas.

**NOTA:** neste módulo escolhes a forma geral da solução. A modelação com C4 e UML e o registo da decisão num ADR são o tema do módulo 04. Bases de dados, APIs e mensagens em detalhe ficam no módulo 05.

## Princípios que sustentam todos os estilos

| Princípio | O que significa | Sinal de que está a falhar |
|---|---|---|
| **Acoplamento baixo** | Uma parte depende pouco do que as outras fazem por dentro | Mudar um campo obriga a mexer em cinco sítios |
| **Coesão alta** | Dentro de uma parte, tudo trata do mesmo assunto | Um módulo «Utilitários» com tudo lá dentro |
| **Separação de responsabilidades** | Cada parte tem um motivo para mudar | A regra de preço vive no ecrã e na base de dados |
| **Ocultação de detalhes** | Outros só veem a interface, nunca o interior | Todos lêem diretamente as tabelas de todos |
| **Evolução** | A estrutura aguenta mudanças que ainda não conheces | Cada novo requisito exige reescrever |

Acoplamento e coesão são o par mais útil: **queres coisas coesas por dentro e pouco acopladas por fora**. Quase todos os estilos abaixo são formas diferentes de o conseguir, a custos diferentes.

### YAGNI versus preparar a evolução

**YAGNI** (You Aren't Gonna Need It) diz para não construir o que ainda ninguém pediu. Preparar a evolução diz para não fechar portas caras de reabrir. Parecem contraditórios, mas distinguem-se assim:

| Aspeto | Aplica YAGNI | Prepara a evolução |
|---|---|---|
| Funcionalidade que talvez venha | Não construas | Não construas |
| Fronteira entre módulos (interfaces) | Mantém-na simples | Mantém-na limpa, é barata hoje e cara depois |
| Escolha de infraestrutura | Não montes o que não precisas | Evita decisões irreversíveis sem necessidade |
| Regra prática | Adia o que é **fácil de mudar** | Decide cedo o que é **difícil de mudar** |

**DICA:** o arquiteto gasta tempo nas decisões difíceis de reverter (fronteiras, dados partilhados, contratos externos) e deixa o resto para quando houver informação.

## Os estilos, um a um

### Monólito

Uma única aplicação, implementada e executada como um todo. A comunicação entre partes é uma chamada de função, simples e rápida. É o ponto de partida natural e, para muitos problemas, o ponto de chegada certo.

### Monólito modular

Continua a ser **uma só aplicação implementada em conjunto**, mas dividida por dentro em módulos com fronteiras estritas (cada módulo esconde os seus dados e expõe uma interface). Dá a disciplina dos serviços sem o custo de rede e de operação.

### Camadas (N-tier)

Divide a aplicação em camadas com responsabilidades distintas (apresentação, lógica de negócio, acesso a dados), em que cada camada só chama a que está por baixo. A documentação do Azure Architecture Center refere que se adequa bem à migração de aplicações que já usam camadas, e que a divisão horizontal dificulta mudanças que atravessam várias camadas.

### Hexagonal (portas e adaptadores)

O núcleo (regras de negócio) fica no centro e só conhece **portas**, interfaces que ele próprio define. O mundo exterior (HTTP, base de dados, SAP, ficheiros) liga-se por **adaptadores** que implementam essas portas. A dependência aponta sempre para dentro, o que facilita testar e trocar tecnologias.

### SOA (arquitetura orientada a serviços)

Sistemas grandes expõem capacidades de negócio como **serviços reutilizáveis**, normalmente ligados por um barramento ou camada de integração central. É o estilo clássico das integrações empresariais e a origem de muita integração com ERP.

### Microsserviços

A aplicação é decomposta em serviços pequenos e autónomos, cada um com uma capacidade de negócio, os seus próprios dados, e implementação e escala independentes. A documentação do Azure Architecture Center resume bem o preço: mais partes móveis, consistência de dados entre serviços e necessidade de práticas de DevOps maduras.

### Orientada a eventos

Produtores publicam **eventos** («stock alterado», «encomenda confirmada») e consumidores reagem, sem se conhecerem. Dá desacoplamento e escala, mas traz desafios de entrega garantida, ordem dos eventos e **consistência eventual**.

### Serverless

O código corre em funções ou serviços geridos que a cloud escala e cobra por utilização. Bom para cargas irregulares e para tarefas pontuais (ex.: *Azure Functions*, *AWS Lambda*); pede atenção ao arranque a frio, aos limites de execução e à dependência do fornecedor (confirma limites atuais na documentação).

## Comparação dos estilos

| Estilo | Maior vantagem | Maior custo | Equipa e maturidade pedidas | Quando faz sentido |
|---|---|---|---|---|
| Monólito | Simplicidade de construir e operar | Cresce em complexidade se não houver disciplina | Baixa | Produto novo, equipa pequena |
| Monólito modular | Fronteiras claras sem custo de rede | Exige disciplina para respeitar as fronteiras | Baixa a média | Equipa pequena, domínio ainda a clarificar |
| Camadas | Familiar, fácil de explicar | Mudanças atravessam todas as camadas | Baixa | Aplicações de gestão, migrações |
| Hexagonal | Núcleo testável e independente da tecnologia | Mais interfaces e indireção | Média | Muitas integrações externas e tecnologia a mudar |
| SOA | Reutilização de capacidades da empresa | Barramento central vira gargalo e dependência | Média a alta | Integração entre muitos sistemas empresariais |
| Microsserviços | Equipas e escala independentes | Complexidade distribuída | Alta | Várias equipas, domínio estável e bem conhecido |
| Orientada a eventos | Desacoplamento e reação em tempo real | Depuração difícil, consistência eventual | Média a alta | Fluxos assíncronos, vários consumidores |
| Serverless | Sem servidores para gerir, paga-se pelo uso | Limites, arranque a frio, dependência do fornecedor | Média | Cargas irregulares, tarefas orientadas a eventos |

**ATENÇÃO:** estes estilos **combinam-se**. É comum ter um monólito modular hexagonal que publica eventos e tem uma função serverless para um trabalho pontual. Não escolhes um rótulo para o sistema inteiro: escolhes por parte.

## Consistência e teorema CAP (introdução honesta)

Quando os dados vivem em vários sítios, deixa de ser óbvio que todos veem o mesmo valor ao mesmo tempo. O **teorema CAP** (Brewer; demonstrado por Gilbert e Lynch) descreve uma limitação num sistema distribuído:

- **C** (consistência): todos leem o valor mais recente escrito.
- **A** (disponibilidade): cada pedido recebe resposta.
- **P** (tolerância a partições): o sistema continua a funcionar mesmo que a rede entre nós falhe.

A leitura correta, muitas vezes simplificada em «escolhe 2 de 3», é esta: **partições de rede acontecem, por isso, quando uma acontece, tens de escolher entre consistência e disponibilidade**. Se não há partição, podes ter as duas. O próprio Brewer escreveu mais tarde que o «2 de 3» induz em erro, porque a escolha é fina e varia por operação.

| Em caso de partição, privilegias | Resultado | Exemplo no caso Casa Nova |
|---|---|---|
| Consistência | Recusas ou atrasas pedidas até haver certeza | Reserva de stock da última unidade: melhor recusar que vender duas vezes |
| Disponibilidade | Respondes sempre, mas talvez com valor desatualizado | Mostrar «stock aproximado» no portal e corrigir depois |

Fora das falhas, a escolha continua a existir como compromisso entre latência e consistência (a documentação do Azure Cosmos DB refere o modelo **PACELC**, e oferece cinco níveis de consistência, de strong a eventual, para ajustares o compromisso).

**ATENÇÃO:** CAP não é uma etiqueta para classificar produtos («esta base de dados é CP»). Serve para fazeres a pergunta certa a cada operação: **aqui, prefiro bloquear ou prefiro responder com informação possivelmente velha?** Consistência eventual aceita-se onde o negócio o aceita; transações financeiras raramente a aceitam.

## Como escolher um estilo a partir dos atributos de qualidade

Parte sempre dos **atributos de qualidade priorizados no módulo 02**, e não do estilo. O processo:

1. Lista os 3 a 5 atributos mais importantes e dá-lhes uma meta mensurável (ex.: «consulta de stock em 2 s ou menos para 95% dos pedidos, com 200 utilizadores simultâneos, como no QA-01 da Casa Nova»).
2. Para cada estilo candidato, pergunta como ele ajuda ou prejudica cada atributo.
3. Considera as **restrições** (equipa, orçamento, sistemas que não podem mudar).
4. Escolhe o estilo mais simples que cumpre as metas e regista o porquê.

Matriz de decisão de arranque (quanto mais «+», mais favorece o atributo; é uma ferramenta de conversa, não uma verdade):

| Atributo de qualidade | Monólito modular | Camadas | Microsserviços | Orientada a eventos | Serverless |
|---|---|---|---|---|---|
| Simplicidade operacional | ++ | ++ | -- | - | + |
| Escalabilidade por parte | - | - | ++ | ++ | ++ |
| Modificabilidade independente | + | - | ++ | + | + |
| Desempenho de chamadas internas | ++ | ++ | - | + | - |
| Consistência forte entre dados | ++ | ++ | -- | - | - |
| Autonomia de equipas | - | - | ++ | + | + |
| Custo com equipa pequena | ++ | ++ | -- | - | + |

**DICA:** uma matriz serve para descobrir os desacordos, não para somar pontos. Se duas pessoas pontuam o mesmo estilo de forma diferente, descobriste um requisito ou uma premissa por esclarecer.

## Quando microsserviços são um erro

Microsserviços resolvem problemas de **organização e de escala**. Se não tens esses problemas, ficas só com o custo. Sinais de que é um erro:

| Sinal | Porquê |
|---|---|
| Equipa de 3 a 6 pessoas | Mais serviços do que pessoas para os operar |
| Domínio ainda mal compreendido | Fronteiras erradas, difíceis de corrigir porque agora são redes e contratos |
| Sem CI/CD, monitorização e *logs* centralizados | Não consegues operar nem diagnosticar dezenas de serviços |
| Transações que atravessam muitos serviços | Terás de gerir consistência eventual e compensações (padrão *saga*) |
| Motivação «porque a Netflix usa» | Contexto, equipas e problemas diferentes dos teus |
| Pretendes escalar por desempenho, mas o gargalo é a base de dados | Dividir o código não resolve |

Martin Fowler defende há anos o **«monólito primeiro»** (MonolithFirst) e fala do **prémio dos microsserviços** (Microservice Premium): só compensa o custo quando a complexidade do sistema é suficientemente alta. O custo vê-se logo: a **chamada de função** passa a **chamada de rede** (latência e falhas), **uma transação** passa a **vários passos** e **um sítio onde ver erros** passa a **muitos**.

**ATENÇÃO:** um «monólito distribuído» é o pior dos mundos: serviços separados que têm de ser implementados juntos e partilham a base de dados. Tens o custo de rede sem a autonomia.

## Exemplo trabalhado: Casa Nova Distribuição

**Situação:** o SAP é o sistema central de stock e encomendas; as aplicações Delphi de balcão ligam-se diretamente à base de dados ou a ficheiros; quer-se um portal de encomendas e stock em tempo real. A equipa interna tem poucas pessoas (módulo 00).

**Atributos priorizados (resumo do módulo 02):** disponibilidade do portal, desempenho na consulta de stock, modificabilidade do portal, **sem parar o SAP nem o balcão**, custo contido.

**Decisão em passos:**

1. **Não mexer no núcleo SAP.** É a fonte de verdade e o risco de o alterar é alto. O novo vive ao lado.
2. **Serviços novos em Bun/TypeScript**, poucos e grossos: um **serviço de stock** (leitura rápida) e um **portal/API de encomendas**. Começar como **monólito modular** (dois módulos com fronteira clara) é mais barato do que dois serviços.
3. **Hexagonal nas fronteiras com o SAP**: o domínio fala com uma porta `LeitorStock`; um adaptador traduz o formato SAP. Se o SAP mudar de versão, mudas o adaptador.
4. **Eventos para o stock em tempo real**: quando o stock muda no SAP, um evento atualiza a vista de leitura do serviço de stock. O portal lê dessa vista e não sobrecarrega o SAP.
5. **Delphi continua a funcionar** e passa a falar com o novo serviço por API REST nos pontos que importam, em vez de ler diretamente o SAP. Uma **camada anticorrupção** impede que o modelo antigo contamine o novo.

Diagrama de contexto (texto):

    [Cliente Web] --> [Portal / API de encomendas (Bun)] --> [Serviço de stock (Bun)]
                                   |                              ^
                                   | pedidos de encomenda         | eventos "StockAtualizado"
                                   v                              |
                           [Adaptador SAP] ---------------> [SAP S/4HANA]
                                   ^
    [Apps Delphi de balcão] -------+  (API REST via camada anticorrupção)

Núcleo do adaptador hexagonal em TypeScript (testado com Bun):

    interface LeitorStock {
      quantidade(sku: string, delegacao: string): Promise<number>;
    }

    class StockViaSap implements LeitorStock {
      async quantidade(sku: string, delegacao: string): Promise<number> {
        // Aqui: chamar o SAP e traduzir para o nosso modelo (omitido).
        return sku === "P-100" ? 42 : 0;
      }
    }

    async function podeVender(l: LeitorStock, sku: string, delegacao: string, pedido: number) {
      return (await l.quantidade(sku, delegacao)) >= pedido;
    }

    Bun.serve({
      port: 3100,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/stock/disponivel") {
          const sku = url.searchParams.get("sku") ?? "";
          const qtd = Number(url.searchParams.get("qtd") ?? "1");
          return Response.json({ sku, disponivel: await podeVender(new StockViaSap(), sku, "LIS", qtd) });
        }
        return new Response("Não encontrado", { status: 404 });
      },
    });

**NOTA:** o exemplo mostra a **forma** da fronteira, não uma integração real. Como o SAP expõe stock e eventos (APIs, IDoc, eventos) depende da versão, do modelo de implementação (cloud ou instalado nos teus servidores) e da configuração. O módulo 05 trata a integração e a confirmação na documentação do SAP é obrigatória.

**Consistência neste caso:** a vista de stock do portal é **eventualmente consistente** com o SAP. Para mostrar disponibilidade basta; para **confirmar a última unidade**, a encomenda faz a reserva no SAP (consistência forte) e o portal aceita que a reserva possa ser recusada.

**Porque não microsserviços já:** equipa pequena, domínio ainda a clarificar, sem plataforma de operação madura. Revê-se quando houver várias equipas ou partes com escalas muito diferentes (módulo 11 trata a migração gradual).

**Uso de assistentes de IA (Claude Code, Codex):** podem ajudar a gerar adaptadores e testes das portas, mas as **fronteiras** (o que é módulo, o que é porta, o que é evento) decide-as o arquiteto. Um assistente que não conhece as regras do projeto tende a criar atalhos que atravessam as fronteiras.

## Modelo reutilizável: escolher um estilo

Preenche esta lista antes de propor um estilo:

1. Quais são os 3 a 5 atributos de qualidade prioritários, com meta mensurável?
2. Que restrições tens (equipa, orçamento, prazo, sistemas intocáveis)?
3. Quantas equipas vão construir e operar? Têm CI/CD e observabilidade?
4. O domínio está estável e compreendido, ou ainda a mudar?
5. Que operações exigem consistência forte e quais toleram consistência eventual?
6. Qual é o estilo **mais simples** que cumpre as metas?
7. O que obriga a mudar de estilo no futuro (gatilho mensurável)?
8. Que decisão difícil de reverter estás a tomar agora, e quem a aprova?

Modelo de ADR resumido para o registo (o formato completo vem no módulo 04):

    Título: Estilo da solução de encomendas online
    Contexto: atributos prioritários e restrições
    Opções: monólito modular / microsserviços / outra
    Decisão: ...
    Consequências: ganhos, custos, riscos
    Gatilho de revisão: ex. "mais de 3 equipas ou gargalo de escala numa parte"

## Depende da empresa

| Fator | Efeito na escolha |
|---|---|
| Tamanho e número de equipas | Várias equipas autónomas justificam serviços separados; uma equipa raramente |
| Cultura de plataforma | Se há equipa de plataforma, o custo operacional dos serviços baixa |
| ERP central (SAP) | Empurra para integração por camada de adaptação e eventos, não para mexer no núcleo |
| Regulação e auditoria | Pode exigir consistência forte e rastreabilidade em certas operações |
| Competências existentes | Uma equipa Delphi/SAP precisa de tempo para dominar sistemas distribuídos |
| Orçamento de cloud e licenças | Mais serviços significam mais custos de operação e de observabilidade |

## Erros comuns

- Escolher o estilo pela moda e não pelos atributos de qualidade.
- Começar com microsserviços numa equipa pequena e num domínio ainda mal compreendido.
- Criar serviços que partilham a mesma base de dados (monólito distribuído).
- Tratar CAP como «escolhe 2 de 3» e rotular produtos, em vez de decidir por operação.
- Ignorar a consistência eventual e prometer ao negócio dados «sempre atualizados».
- Dividir pela técnica (serviço de «base de dados», serviço de «validação») em vez de pela capacidade de negócio.
- Introduzir eventos sem tratar duplicação, ordem e falhas na entrega.
- Aplicar YAGNI a fronteiras e contratos externos, que depois são caros de corrigir.
- Não registar o **gatilho** que levaria a rever a decisão.

## Ligação às certificações

**Microsoft AZ-305 (Azure Solutions Architect Expert):** a página de competências avaliadas divide-se em quatro domínios: identidade, governação e monitorização; armazenamento de dados; continuidade de negócio; infraestrutura. Este módulo não é um domínio por si, mas dá o raciocínio de base para várias decisões:

| Tema do módulo | Onde cai no AZ-305 | Serviço Azure principal | Equivalente AWS |
|---|---|---|---|
| Aplicações em contentores / microsserviços | Infraestrutura (computação) | Azure Container Apps, AKS | Amazon ECS, EKS |
| Serverless | Infraestrutura (computação) | Azure Functions | AWS Lambda |
| Camadas / aplicações web geridas | Infraestrutura (computação) | Azure App Service | AWS Elastic Beanstalk |
| Orientada a eventos e mensagens | Armazenamento de dados (integração de dados) e infraestrutura | Event Grid, Service Bus, Event Hubs | EventBridge, SQS/SNS, Kinesis |
| Consistência e escolha de dados | Armazenamento de dados | Azure Cosmos DB (níveis de consistência) | Amazon DynamoDB |
| Exposição de APIs | Infraestrutura | Azure API Management | Amazon API Gateway |

**NOTA:** o domínio de continuidade de negócio liga-se à escolha entre consistência e disponibilidade (módulo 08 aprofunda). Os nomes e as percentagens dos domínios mudam; confirma a lista atual na página oficial do exame. Na AWS, o equivalente de pensamento de estilos está no Well-Architected Framework e no whitepaper de microsserviços.

## Exercícios

**PRATICAR:** faz os exercícios **9 a 12** do módulo 15: classificar acoplamento e coesão num desenho, escolher e justificar um estilo para o caso Casa Nova, decidir onde a consistência forte é obrigatória, e avaliar uma proposta de microsserviços.

## Fontes oficiais

- [Azure Architecture Center: estilos de arquitetura](https://learn.microsoft.com/azure/architecture/guide/architecture-styles/)
- [Azure Architecture Center: microsserviços](https://learn.microsoft.com/azure/architecture/guide/architecture-styles/microservices)
- [Azure Architecture Center: arquitetura orientada a eventos](https://learn.microsoft.com/azure/architecture/guide/architecture-styles/event-driven)
- [Azure Architecture Center: N-tier](https://learn.microsoft.com/azure/architecture/guide/architecture-styles/n-tier)
- [Azure Architecture Center: padrão Anti-Corruption Layer](https://learn.microsoft.com/azure/architecture/patterns/anti-corruption-layer)
- [Azure Architecture Center: padrão Saga](https://learn.microsoft.com/azure/architecture/patterns/saga)
- [Azure Cosmos DB: níveis de consistência](https://learn.microsoft.com/azure/cosmos-db/consistency-levels)
- [Azure Functions: visão geral](https://learn.microsoft.com/azure/azure-functions/functions-overview)
- [Azure Container Apps: visão geral](https://learn.microsoft.com/azure/container-apps/overview)
- [Azure Event Grid: visão geral](https://learn.microsoft.com/azure/event-grid/overview)
- [Azure Service Bus: visão geral](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-305)
- [AWS: microsserviços na AWS (whitepaper)](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html)
- [AWS: arquitetura orientada a eventos](https://aws.amazon.com/event-driven-architecture/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Martin Fowler: Microservices](https://martinfowler.com/articles/microservices.html)
- [Martin Fowler: MonolithFirst](https://martinfowler.com/bliki/MonolithFirst.html)
- [Martin Fowler: Microservice Premium](https://martinfowler.com/bliki/MicroservicePremium.html)
- [Martin Fowler: Yagni](https://martinfowler.com/bliki/Yagni.html)
- [Alistair Cockburn: Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Eric Brewer: CAP Twelve Years Later](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)
- [Bun: documentação](https://bun.sh/docs)
- [SAP Integration Suite (SAP Help Portal)](https://help.sap.com/docs/integration-suite)
