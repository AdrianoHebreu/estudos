# 08 Qualidade operacional

## O que é qualidade operacional

Uma solução pode cumprir todos os requisitos funcionais e, mesmo assim, ser um fracasso: lenta à hora de ponta, em baixo ao fim de semana, impossível de diagnosticar ou irrecuperável depois de um erro humano. A **qualidade operacional** é o conjunto de atributos que decidem como o sistema se comporta **depois de entrar em produção**: escalabilidade, disponibilidade, resiliência, recuperação, observabilidade e desempenho.

No módulo 02 aprendeste a escrever estes atributos como requisitos mensuráveis. Aqui aprendes a **desenhar** para os cumprir e a **provar** que os cumprem. A regra de ouro: cada atributo tem um **custo**. Mais disponibilidade custa mais dinheiro e mais complexidade, por isso o número certo é o que o negócio justifica, não o maior possível.

## Escalabilidade: vertical, horizontal e sem estado

**Escalar** é aumentar a capacidade de processamento quando a carga cresce. Há duas formas.

| Aspeto | Vertical (*scale up*) | Horizontal (*scale out*) |
|---|---|---|
| O que é | Máquina maior: mais CPU, memória, disco | Mais instâncias iguais, com a carga repartida |
| Complexidade | Baixa: o desenho não muda | Mais alta: balanceamento, sessões, dados partilhados |
| Limite | O maior hardware disponível | Praticamente o orçamento e a arquitetura |
| Interrupção | Pode exigir reinício | Adiciona e remove sem parar o serviço |
| Ponto único de falha | Mantém-se | Desaparece (se houver mais de uma instância) |
| Bom para | Bases de dados relacionais, sistemas legados | Camadas web e APIs |

A documentação do Azure Monitor descreve o autoscale como escala horizontal (adicionar e remover instâncias) e refere que **não suporta escala vertical**. O mesmo princípio existe na AWS (Auto Scaling groups, com mínimo e máximo de instâncias).

**Sem estado (stateless).** Para escalar horizontalmente, qualquer instância tem de poder atender qualquer pedido. Isso só acontece se a instância **não guardar estado do utilizador na sua memória ou disco local**. O estado vai para fora: base de dados, cache partilhada ou token enviado pelo cliente.

    Com estado (não escala bem)           Sem estado (escala)

    Cliente --> Instância A [sessão]      Cliente --> Balanceador --+--> Instância A
    (se a A cair, a sessão perde-se)                                +--> Instância B
                                                                    +--> Instância C
                                          todas leem e escrevem em: cache partilhada + BD

## Disponibilidade: SLI, SLO e SLA

**Disponibilidade** é a fração do tempo em que o sistema está utilizável. Exprime-se em percentagem, e cada «nove» a mais é muito mais caro. Três siglas que não podes confundir (definições da documentação do Azure Well-Architected Framework):

| Sigla | Nome | O que é | Exemplo |
|---|---|---|---|
| **SLI** | Indicador de nível de serviço | Medição quantitativa de um aspeto do serviço | % de pedidos com resposta correta |
| **SLO** | Objetivo de nível de serviço | Meta interna, mensurável, para um SLI | 99,9% dos pedidos corretos por mês |
| **SLA** | Acordo de nível de serviço | Contrato com o cliente; falhar pode ter consequências financeiras | Compensação se ficar abaixo de 99,5% |

A documentação sublinha que SLA e SLO têm intenções diferentes e devem ser controlados **de forma independente**: o SLO costuma ser mais ambicioso do que o SLA, para reagires antes de falhar o contrato.

Quanto tempo de paragem cada percentagem permite (valores da documentação do Azure, para um mês de 30 dias):

| Disponibilidade | Paragem por mês | Paragem por ano |
|---|---|---|
| 99% | 7,2 horas | 3,65 dias |
| 99,9% | 43,2 minutos | 8,76 horas |
| 99,95% | 21,6 minutos | 4,38 horas |
| 99,99% | 4,32 minutos | 52,56 minutos |
| 99,999% | 25,9 segundos | 5,26 minutos |

**NOTA:** mede o SLI do ponto de vista do utilizador (o pedido terminou bem e a tempo?), não do servidor (o processo está vivo?). Um servidor «verde» que devolve erros não está disponível.

**ATENÇÃO:** os SLAs que os fornecedores publicam (por exemplo, os de cada serviço Azure) entram no teu cálculo, mas **não os uses sem perceber o âmbito do que cobrem**. Confirma sempre o número atual em azure.microsoft.com/support/legal/sla. Os números das contas abaixo são **ilustrativos**, não são os SLAs reais de nenhum serviço.

## Exemplo trabalhado: SLA composto no portal da Casa Nova

Quando um pedido atravessa vários componentes **em série**, todos têm de funcionar, e a disponibilidade total é o **produto** das individuais. Quando há componentes **redundantes em paralelo**, só falha se falharem todos ao mesmo tempo: a indisponibilidade total é o produto das indisponibilidades.

    Em série:    A_total = A1 x A2 x ... x An
    Em paralelo: A_total = 1 - (1 - A1) x (1 - A2) x ...   (falhas independentes)

O fluxo «confirmar encomenda» no portal da Casa Nova, com o SLO de **99,9%** (43,2 min/mês). Disponibilidades ilustrativas: web 99,95%, API 99,95%, base de dados 99,99%, fila de mensagens 99,9%, SAP em servidores próprios 99,5%.

| Passo | Alteração ao desenho | Cálculo | Disponibilidade | Paragem/mês |
|---|---|---|---|---|
| A | Tudo síncrono: web, API, BD, fila e SAP em série | 0,9995 x 0,9995 x 0,9999 x 0,999 x 0,995 | 99,29% | 306 min (5,1 h) |
| B | A encomenda é aceite sem esperar pelo SAP (envio assíncrono) | tira o SAP da conta | 99,79% | 91 min |
| C | A encomenda grava-se na BD e o envio para o SAP fica fora do caminho crítico (ver módulo 05) | 0,9995 x 0,9995 x 0,9999 | 99,89% | 48 min |
| D | Duas instâncias da API em zonas diferentes | API = 1 - 0,0005^2 = 99,999975% | 99,94% | 26 min |

Só o passo D cumpre o SLO. A lição: **a cadeia é tão fraca como o elo mais fraco, e a maior melhoria costuma ser tirar dependências do caminho crítico**, não comprar «mais nove» a um componente. O SAP continua a ter de estar disponível para a encomenda chegar ao armazém, mas o cliente já não espera por ele.

**ATENÇÃO:** a fórmula do paralelo assume **falhas independentes**. Duas instâncias na mesma máquina, no mesmo datacenter ou atrás de um único balanceador partilham o destino. As **zonas de disponibilidade** do Azure (agrupamentos de datacenters fisicamente separados dentro de uma região, desenhados para que uma falha numa não afete as outras) existem para dar essa independência.

## Resiliência: aguentar falhas sem cair

Num sistema distribuído, as falhas **vão acontecer**: redes lentas, serviços sobrecarregados, dependências em manutenção. A **resiliência** é a capacidade de continuar a servir (por vezes de forma reduzida) em vez de falhar em cadeia. Os padrões abaixo estão descritos no catálogo de padrões do Azure Architecture Center.

| Padrão | O que faz | Risco se for mal usado |
|---|---|---|
| **Timeout** | Desiste de uma chamada que demora demais | Demasiado longo: threads presas; demasiado curto: falsos erros |
| **Retry com *backoff*** | Repete falhas transitórias com esperas crescentes | Tempestade de repetições a esmagar um serviço já doente |
| **Circuit breaker** | Deixa de chamar um serviço que está a falhar | Limiares mal calibrados abrem ou fecham em falso |
| **Bulkhead** | Isola recursos por consumidor ou dependência | Recursos subaproveitados se as partições forem pequenas |
| **Degradação graciosa** | Oferece uma versão reduzida da função em vez de erro | Utilizador enganado se não souber que os dados são antigos |

**Timeouts.** Toda a chamada de rede precisa de um limite. Sem ele, um serviço lento prende threads e ligações até esgotar o sistema. Define um **orçamento de tempo** para o pedido completo e reparte-o pelas camadas.

**Retry com backoff e jitter.** A documentação do Azure distingue cancelar, repetir de imediato e repetir após espera, com atrasos incrementais ou exponenciais. O artigo do AWS Builders' Library acrescenta o **jitter** (aleatoriedade na espera) para que milhares de clientes não repitam todos ao mesmo tempo. Só repetes o que é **seguro repetir**: operações idempotentes (ver módulo 05), caso contrário uma resposta perdida pode criar uma encomenda duplicada. Exemplo em TypeScript (testado em Bun 1.4.0):

    async function comRetry<T>(
      operacao: (sinal: AbortSignal) => Promise<T>,
      { tentativas = 4, baseMs = 200, tetoMs = 5000, timeoutMs = 2000 } = {},
    ): Promise<T> {
      for (let n = 1; ; n++) {
        try {
          return await operacao(AbortSignal.timeout(timeoutMs));
        } catch (erro) {
          if (n >= tentativas) throw erro;
          const maximo = Math.min(tetoMs, baseMs * 2 ** (n - 1));
          await Bun.sleep(Math.random() * maximo); // jitter completo
        }
      }
    }

Repara no custo: com 4 tentativas e 2 s de timeout, o pior caso é 4 x 2 s + esperas (até 0,2 + 0,4 + 0,8 s) = **9,4 s**. Se o utilizador só espera 5 s, este retry está mal calibrado: o **orçamento de tempo** tem de mandar.

**Circuit breaker.** Segundo a documentação do Azure, funciona como uma máquina de três estados:

    Fechado --(falhas > limiar num período)--> Aberto
       ^                                          |
       |                                  (termina o tempo de espera)
       +--(chamadas de teste com sucesso)-- Meio-aberto
                                                  |
                              (uma chamada falha) --> volta a Aberto

Em **Fechado** os pedidos passam e contam-se as falhas; em **Aberto** falham de imediato, sem tocar no serviço; em **Meio-aberto** deixa-se passar um número limitado de pedidos para testar a recuperação. Serve um propósito diferente do retry: o retry insiste, o circuit breaker **desiste a tempo**.

**Bulkhead.** Como os compartimentos estanques de um navio: separa recursos (por exemplo, um pool de ligações por dependência) para que uma dependência lenta não consuma tudo o que as outras usam.

**Degradação graciosa.** Decide **antes** o que o sistema faz quando uma dependência cai. Se o SAP não responde, o portal mostra o último stock conhecido com a indicação «atualizado há 12 minutos» e aceita a encomenda para envio posterior, em vez de devolver um erro.

**DICA:** combina os padrões na ordem certa: timeout em cada chamada, retry limitado só para falhas transitórias, circuit breaker à volta da dependência e bulkhead para não contaminar o resto. E **retries só numa camada**: se três camadas repetirem 3 vezes cada, uma falha amplifica-se 4 x 4 x 4 = 64 chamadas ao serviço no fundo.

## RPO e RTO

Dois números definem o que o negócio aceita perder num incidente (definições da documentação do Azure Well-Architected Framework):

| Sigla | Nome | Pergunta | Exemplo |
|---|---|---|---|
| **RPO** | Recovery Point Objective | Quanto trabalho (dados) aceitamos perder? | 15 minutos |
| **RTO** | Recovery Time Objective | Quanto tempo aceitamos estar em baixo? | 2 horas |

    Última cópia/replicação      Incidente               Serviço recuperado
          |<------ RPO ------------>|<--------- RTO ---------->|
    ------+-------------------------+---------------------------+----> tempo
       dados até aqui           dados perdidos            a partir daqui voltas a servir

RPO baixo exige cópias ou replicação frequentes. RTO baixo exige infraestrutura de recuperação pronta. Ambos custam dinheiro, por isso **não são decididos pela equipa técnica**: são requisitos de negócio que o arquiteto ajuda a quantificar (módulo 02) com a pergunta «quanto custa uma hora de paragem e uma hora de dados perdidos?».

## Backup e recuperação de desastres

**Backup** e **recuperação de desastres (DR)** não são a mesma coisa:

| Aspeto | Backup | Recuperação de desastres |
|---|---|---|
| Protege de | Apagamento, corrupção, ransomware, erro humano | Perda de uma zona, região ou datacenter |
| Mecanismo | Cópias pontuais, com retenção | Replicação contínua e *failover* para outro local |
| RPO típico | Horas a um dia | Segundos a minutos |
| RTO típico | Horas | Minutos a horas |
| Serviço Azure | **Azure Backup** | **Azure Site Recovery** |
| Equivalente AWS | AWS Backup | AWS Elastic Disaster Recovery |

A documentação do Azure é explícita: o Azure Backup foca-se em proteção de dados (cópia e restauro); para orquestração de recuperação e failover usa-se o Azure Site Recovery. As réplicas **não substituem** o backup: se alguém apagar uma tabela, a réplica apaga-a também.

A documentação do Well-Architected descreve estratégias de DR em duas regiões, que escolhes consoante o RTO e o custo:

| Estratégia | Segunda região | RTO | Custo |
|---|---|---|---|
| Ativo-passivo **frio** (cold standby) | Praticamente sem infraestrutura até ao desastre | Mais longo | Mais baixo |
| Ativo-passivo **morno** (warm standby) | Infraestrutura parcial a correr com capacidade reduzida | Intermédio | Intermédio |
| Ativo-ativo | Duas regiões a servir tráfego | Mais curto | Mais alto |

Um plano de DR só vale se for **testado**: a documentação fala em exercícios de DR (DR drills), critérios claros para declarar o desastre e failback. Um backup nunca restaurado é uma esperança, não um backup.

## Observabilidade: perceber o sistema por dentro

**Monitorização** responde a «está a funcionar?». **Observabilidade** responde a «porque é que não está?», incluindo a perguntas que não previste. Assenta em três tipos de sinal, mais os alertas que os transformam em ação:

| Sinal | O que é | Responde a | Exemplo |
|---|---|---|---|
| **Logs** | Registos de eventos com contexto | O que aconteceu? | «Encomenda 8812 rejeitada: stock insuficiente» |
| **Métricas** | Números agregados ao longo do tempo | Quanto? Com que tendência? | Latência p95, pedidos/s, % de erros |
| **Traços** (traces) | O caminho de um pedido por vários serviços | Onde se perdeu o tempo? | Portal -> API -> SAP: 3,2 s, dos quais 2,9 s no SAP |
| **Alertas** | Notificação quando uma condição se verifica | Quem tem de agir, e já? | Erros acima de 2% durante 5 minutos |

**No Azure.** O **Azure Monitor** é descrito na documentação como o serviço unificado de observabilidade que reúne métricas, logs, traços e eventos de ambientes cloud e híbridos. As peças que vais encontrar:

| Peça | Papel |
|---|---|
| **Application Insights** | Monitorização de desempenho de aplicações (APM) dentro do Azure Monitor, com suporte a OpenTelemetry; inclui mapa da aplicação, métricas em direto, vista de falhas, de desempenho e de disponibilidade |
| **Log Analytics** | Ferramenta para consultar os logs guardados no Azure Monitor com a linguagem KQL |
| **Alertas e grupos de ação** | Regras sobre métricas ou logs que disparam notificações (email, SMS) ou automatismos |
| **Azure Monitor autoscale** | Escala automática com base em métricas ou horários |

**NOTA:** o OpenTelemetry é uma norma aberta e independente de fornecedor, o que reduz o acoplamento. Para as aplicações em **Bun/TypeScript**, confirma na documentação do Application Insights e do OpenTelemetry se o teu runtime e bibliotecas são suportados antes de prometeres traços ponta a ponta. Nas aplicações **Delphi**, o realista é começar por logs estruturados e pelos registos das chamadas REST; não assumas instrumentação automática.

Equivalentes AWS: **Amazon CloudWatch** (métricas, logs, alarmes, painéis) e **AWS X-Ray** (traços de pedidos).

**Alertas que prestam.** Alerta sobre **sintomas que o utilizador sente** (taxa de erros, latência, indisponibilidade do SLO), não sobre cada causa possível (CPU a 80%). Cada alerta tem de ter dono e ação definida: um alerta sem acção é ruído, e o ruído faz as pessoas ignorarem o alerta que importa. Os alertas do Azure Monitor ficam guardados 30 dias (confirma na documentação se precisas de mais).

## Desempenho, capacidade e testes de carga

**Desempenho** é a rapidez com que o sistema responde, medida com percentis (p95, p99) e não só com médias, que escondem a cauda lenta. Começa pelo requisito do módulo 02: «95% das pesquisas de stock em menos de 1 segundo, com 200 utilizadores simultâneos».

**Planeamento de capacidade** (definição do Well-Architected) é prever os recursos de que a carga precisa para cumprir os objetivos, evitando faltar (degradação) e sobrar (custo). Faz-se **antes** das mudanças previsíveis: campanhas, sazonalidade, novos clientes. O método:

1. Mede a carga atual e o crescimento esperado.
2. Descobre a **capacidade por instância** num teste de carga (pedidos/s a uma utilização aceitável, por exemplo 70% de CPU).
3. Calcula instâncias = carga de pico / capacidade por instância, **mais margem** para falhas.
4. Valida com um novo teste e recalibra após cada mudança relevante.

**Testes de carga.** Simulam utilizadores concorrentes para encontrar o ponto de rutura e os gargalos. O **Azure Load Testing** é um serviço gerido que corre testes baseados em Apache JMeter ou Locust e integra-se em pipelines de CI/CD com critérios de falha. Distingue os tipos: **carga** (esperada), **esforço** (acima do esperado, até partir), **resistência** (horas, para ver fugas de memória) e **picos** (subida brusca). Testa num ambiente parecido com a produção, nunca contra o SAP de produção.

A **engenharia do caos** (Azure Chaos Studio, em pré-visualização pública à data da consulta) simula falhas para validar que a resiliência desenhada funciona.

## Runbooks e operação

Um **runbook** é um procedimento escrito, passo a passo, para uma situação operacional recorrente: reiniciar um serviço, fazer failover, reprocessar uma fila de mensagens com erro. Existe para que a recuperação à 3 da manhã não dependa da memória de uma só pessoa.

    Runbook: Fila de encomendas para o SAP a crescer
    Gatilho:      alerta «mensagens pendentes > 500 há 10 min»
    Impacto:      encomendas aceites mas não chegam ao armazém
    Verificar:    1) SAP responde? 2) circuit breaker aberto? 3) erro nos logs?
    Atuar:        SAP em baixo -> confirmar com a equipa SAP; aguardar e reprocessar
                  erro de dados -> mover mensagem para a fila de erros e abrir ticket
    Escalar:      se > 1 hora sem resolução, contactar o responsável do serviço
    Confirmar:    fila a esvaziar; registar causa e duração
    Depois:       revisão pós-incidente sem culpas; atualizar este runbook

Boas práticas de operação: definir **quem está de prevenção** e como se escala; registar incidentes e fazer **revisões pós-incidente sem culpados**, com ações concretas; medir o MTTR (tempo médio de recuperação); tratar o runbook como código (versionado, revisto, testado em exercício). Quanto mais um runbook for repetido, mais deve ser **automatizado** (os grupos de ação do Azure Monitor podem acionar automatismos).

## Modelo reutilizável: lista de verificação de qualidade operacional

| Área | Pergunta de revisão |
|---|---|
| Escalabilidade | A camada de aplicação é *stateless*? Onde está o gargalo (BD, SAP, rede)? |
| Disponibilidade | Qual é o SLO por fluxo crítico? O cálculo composto cumpre-o? |
| Resiliência | Toda a chamada externa tem timeout, retry limitado, circuit breaker? Há degradação definida? |
| Recuperação | RPO e RTO acordados com o negócio? Backup e DR por sistema? Já se testou o restauro? |
| Observabilidade | Logs estruturados, métricas, traços? Alertas sobre sintomas, com dono? |
| Capacidade | Há plano para o pico? Quando foi o último teste de carga? |
| Operação | Runbooks para os 5 incidentes mais prováveis? Revisões pós-incidente? |

## Depende da empresa

| Fator | O que muda |
|---|---|
| Dimensão e orçamento | Uma empresa de 400 pessoas raramente justifica multirregião ativo-ativo; frio ou morno costuma bastar |
| Criticidade do negócio | Retalho com vendas online sofre com paragens; um relatório interno pode esperar um dia |
| Legado (SAP, Delphi) | Quem tem os servidores próprios define o que é possível: a disponibilidade do SAP é um dado, não uma escolha tua |

## Erros comuns

- **Prometer «cinco noves»** sem custo, medição ou acordo do negócio.
- **Retry em todas as camadas**, sem backoff nem jitter, que transforma um soluço numa avalanche.
- **Confundir réplica com backup** e **nunca testar o restauro**.
- **Monitorizar o servidor e não o utilizador**: tudo «verde» e o cliente sem conseguir comprar.

## Ligação às certificações

No **AZ-305** (Azure Solutions Architect Expert), segundo o guia de estudo oficial (competências medidas a 17 de abril de 2026), este módulo toca em dois domínios:

| Domínio do AZ-305 | Onde cai este módulo | Serviço Azure principal |
|---|---|---|
| **Design business continuity solutions** (continuidade de negócio) | «Design solutions for backup and disaster recovery» (recuperação que cumpre os objetivos de recuperação, para computação, bases de dados e dados não estruturados) e «Design for high availability» (computação, dados relacionais, dados semiestruturados e não estruturados) | Azure Backup, Azure Site Recovery, zonas de disponibilidade |
| **Design identity, governance, and monitoring solutions** (monitorização) | «Design solutions for logging and monitoring»: recomendar uma solução de logs, de encaminhamento de logs e de monitorização | Azure Monitor (Log Analytics, Application Insights, alertas) |

Há também pontos de contacto com o domínio de infraestrutura (cache, balanceamento e encaminhamento, desempenho de rede) e com o de armazenamento de dados (escalabilidade de bases de dados), tratados nos módulos 05 e 06.

Equivalentes AWS: Amazon CloudWatch e AWS X-Ray (observabilidade), Amazon EC2 Auto Scaling (escala), AWS Backup, AWS Elastic Disaster Recovery e o pilar de fiabilidade do AWS Well-Architected Framework.

**ATENÇÃO:** as percentagens e a lista de competências mudam. Confirma-as na página do exame antes de estudar. Para o exame, treina sobretudo a **escolha justificada**: dado um RPO/RTO e um orçamento, que combinação de backup, DR e alta disponibilidade serve?

## Exercícios

**PRATICAR:** faz os exercícios 29 a 32 do módulo 15 (SLA composto, RPO/RTO e estratégia de DR, análise de resiliência e plano de observabilidade e capacidade) e compara com o módulo 17.

## Fontes oficiais

- [Azure Well-Architected Framework: pilar de fiabilidade](https://learn.microsoft.com/azure/well-architected/reliability/)
- [Definir metas de fiabilidade (SLO, SLI, SLA, RTO, RPO)](https://learn.microsoft.com/azure/well-architected/reliability/metrics)
- [Recuperação de desastres no Well-Architected](https://learn.microsoft.com/azure/well-architected/reliability/disaster-recovery)
- [Planeamento de capacidade](https://learn.microsoft.com/azure/well-architected/performance-efficiency/capacity-planning)
- [Padrão Retry](https://learn.microsoft.com/azure/architecture/patterns/retry)
- [Padrão Circuit Breaker](https://learn.microsoft.com/azure/architecture/patterns/circuit-breaker)
- [Padrão Bulkhead](https://learn.microsoft.com/azure/architecture/patterns/bulkhead)
- [Zonas de disponibilidade no Azure](https://learn.microsoft.com/azure/reliability/availability-zones-overview)
- [Azure Monitor: visão geral](https://learn.microsoft.com/azure/azure-monitor/fundamentals/overview)
- [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Alertas do Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-overview)
- [Azure Monitor autoscale](https://learn.microsoft.com/azure/azure-monitor/autoscale/autoscale-overview)
- [Azure Backup](https://learn.microsoft.com/azure/backup/backup-overview)
- [Azure Site Recovery](https://learn.microsoft.com/azure/site-recovery/site-recovery-overview)
- [Azure Load Testing](https://learn.microsoft.com/azure/load-testing/overview-what-is-azure-load-testing)
- [Azure Chaos Studio](https://learn.microsoft.com/azure/chaos-studio/chaos-studio-overview)
- [SLAs dos serviços Microsoft](https://azure.microsoft.com/support/legal/sla/)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)
- [Google SRE Book: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [AWS Builders' Library: timeouts, retries e backoff com jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [AWS Well-Architected: pilar de fiabilidade](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)
- [Amazon CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)
- [Amazon EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [AWS Backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)
- [AWS Elastic Disaster Recovery](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html)
