# 10 Decisões, custos e negócio

Uma boa arquitetura que ninguém consegue pagar, comprar ou justificar à direção não sai do papel. Neste módulo aprendes a transformar decisões técnicas em números e argumentos de negócio: construir, comprar ou configurar, custo total (TCO), avaliação de fornecedores, RFI/RFP, *lock-in*, FinOps, ROI, dívida técnica, roadmap e estimativas.

**NOTA:** todos os valores em euros deste módulo são **fictícios** e servem só para mostrar o método. Nunca os uses como referência de preços reais: usa as tuas propostas, os teus contratos e a calculadora do fornecedor.

## Construir, comprar ou configurar

Antes de desenhar, decide **de onde vem a solução**. São três caminhos, e o terceiro é o mais esquecido por quem vem do desenvolvimento.

| Opção | O que é | Quando faz sentido | Risco principal |
|---|---|---|---|
| **Construir** | Código à medida, feito pela equipa ou por um parceiro | O processo é um diferenciador do negócio e nada no mercado serve | Custo de manutenção para sempre; depende de pessoas-chave |
| **Comprar** | Produto de mercado (SaaS ou instalado) usado como está | O processo é comum a muitas empresas (faturação, RH, CRM) | Adaptação do processo ao produto; lock-in; preço da licença |
| **Configurar** | Estender uma plataforma que já tens (por exemplo o ERP) com parametrização e extensões | A plataforma já cobre a maior parte e é a fonte de verdade dos dados | Ficar preso à plataforma e às suas limitações |

Perguntas que ajudam a decidir:

- Este processo é o que nos distingue da concorrência, ou é uma **comodidade** (commodity)?
- Quanto do requisito é coberto sem alterações? (Regra prática: quanto mais personalização, mais te aproximas do custo de construir sem teres o controlo.)
- Temos equipa para manter o que construirmos durante cinco anos?
- Qual é o custo de **sair** daqui a cinco anos?

**DICA:** documenta a decisão num ADR (módulo 04) com as três opções e o motivo de rejeitar as outras. Daqui a dois anos, alguém vai perguntar porque não se comprou.

## TCO: o custo total ao longo da vida

O preço de compra (ou de desenvolvimento) é a ponta do icebergue. O **TCO** (Total Cost of Ownership) soma tudo o que a solução custa durante um horizonte definido, normalmente três a cinco anos.

| Categoria | Exemplos |
|---|---|
| Aquisição / implementação | Desenvolvimento, licenças iniciais, parceiro de integração, migração de dados |
| Infraestrutura | Cloud (computação, armazenamento, rede), ambientes de teste |
| Operação e suporte | Pessoas, monitorização, *backups*, suporte do fornecedor |
| Evolução | Correções, novas funcionalidades, atualizações de versão |
| Segurança e conformidade | Testes de intrusão, auditorias, RGPD |
| Formação e mudança | Treino de utilizadores, gestão da mudança |
| **Saída** | Custo de migrar para outra solução no fim (muitas vezes ignorado) |

### Exemplo trabalhado (valores fictícios): portal de encomendas da Casa Nova

A Casa Nova compara três opções para o portal de encomendas, num horizonte de **5 anos**. Todos os números abaixo são **inventados para o exercício**.

| Linha (€) | A. Construir (Bun + Azure) | B. Comprar (SaaS B2B) | C. Configurar (extensão do SAP + portal simples) |
|---|---|---|---|
| Implementação inicial | 240 000 | 90 000 | 150 000 |
| Formação (única) | 5 000 | 8 000 | 6 000 |
| **Custo inicial** | **245 000** | **98 000** | **156 000** |
| Licenças por ano | 0 | 70 000 | 25 000 |
| Cloud por ano | 24 000 | 0 | 6 000 |
| Equipa de manutenção por ano | 48 000 (0,8 pessoa) | 18 000 (0,3 pessoa) | 30 000 (0,5 pessoa) |
| Segurança e extras por ano | 8 000 | 10 000 | 0 |
| **Custo recorrente por ano** | **80 000** | **98 000** | **61 000** |
| Recorrente em 5 anos | 400 000 | 490 000 | 305 000 |
| **TCO a 5 anos** | **645 000** | **588 000** | **461 000** |

Verificação: A = 245 000 + 5 × 80 000; B = 98 000 + 5 × 98 000; C = 156 000 + 5 × 61 000.

**ATENÇÃO:** o TCO mais baixo não é automaticamente a melhor opção. A opção C é a mais barata mas só cobre parte dos requisitos funcionais. O TCO responde a «quanto custa», não a «serve?». Para isso serve a matriz abaixo.

**NOTA:** este cálculo não aplica taxa de desconto. Se a área financeira pedir o valor atualizado líquido (VAL ou NPV), aplicas a taxa que ela indicar a cada ano. Em sensibilidade, varia os pressupostos mais incertos (preço da licença, dimensão da equipa) e vê se a ordem das opções muda.

## Matriz de avaliação ponderada

Para comparar opções ou fornecedores com vários critérios, usa uma **matriz ponderada**: cada critério tem um peso (a soma dá 100) e cada opção recebe uma nota de 1 a 5. Pontuação = soma de (nota × peso) a dividir por 100.

| Critério | Peso | A. Construir | B. Comprar | C. Configurar |
|---|---|---|---|---|
| Aderência funcional | 30 | 5 | 4 | 2 |
| Integração com o SAP | 20 | 4 | 3 | 5 |
| TCO a 5 anos | 20 | 2 | 3 | 5 |
| Segurança e RGPD | 15 | 3 | 4 | 4 |
| Risco de *lock-in* / saída | 10 | 4 | 2 | 2 |
| Capacidade da equipa | 5 | 2 | 4 | 4 |
| **Total ponderado** | 100 | **3,65** | **3,40** | **3,60** |

A e C ficam quase empatadas. Isto não é um defeito: é a informação mais útil da matriz. Faz uma **análise de sensibilidade**: o que acontece se o TCO pesar 30 e a aderência funcional 20?

    Pesos alternativos: aderência 20, TCO 30 (os restantes iguais)
    A = 3,35    B = 3,30    C = 3,90
    -> C passa a ganhar com folga. A decisão depende de quem define os pesos.

**DICA:** define os **pesos antes** de pontuar as opções, de preferência com os stakeholders (módulo 02). Se os pesos forem escolhidos depois de se ver o resultado, a matriz serve para justificar uma decisão já tomada, e não para a tomar.

## RFI, RFP e a escolha de fornecedores

Quando a decisão envolve fornecedores externos, o processo costuma ter três documentos:

| Documento | Significado | Objetivo | Quando |
|---|---|---|---|
| **RFI** | Request for Information | Conhecer o mercado e reduzir a lista de candidatos | Início, quando ainda não sabes quem existe |
| **RFP** | Request for Proposal | Pedir propostas detalhadas (solução, preço, prazos, condições) | Com requisitos claros e 3 a 5 candidatos |
| **RFQ** | Request for Quotation | Pedir só o preço de algo bem definido | Quando o produto já está escolhido |

Fases típicas: requisitos e critérios (com pesos) → RFI → lista curta → RFP → demonstrações e provas de conceito → pontuação com a matriz → negociação → contrato.

Estrutura mínima de um RFP:

    1. Contexto da empresa e do problema (sem revelar segredos)
    2. Requisitos funcionais e não funcionais (priorizados: obrigatório / desejável)
    3. Restrições: integração com SAP, RGPD, localização dos dados, prazos
    4. Formato obrigatório da resposta (para poderes comparar)
    5. Critérios de avaliação e pesos (transparentes)
    6. Preço no formato que definires (licenças, serviços, suporte, saída)
    7. Prazos do processo e contacto único para dúvidas

**ATENÇÃO:** uma demonstração comercial mostra o melhor caminho. Pede uma **prova de conceito** com um cenário real da tua empresa (por exemplo, uma encomenda com o teu SAP) e referências de clientes parecidos.

## Licenciamento e dependência de fornecedor (lock-in)

O **lock-in** é o custo de mudar de fornecedor. Não é sempre mau: aceita-se lock-in quando o benefício compensa, mas deve ser uma decisão consciente e medida.

| Tipo | Onde nasce | Como reduzir |
|---|---|---|
| Técnico | APIs e serviços proprietários | Preferir normas abertas onde o custo for baixo; isolar o acesso por uma camada própria |
| De dados | Formatos fechados, exportação difícil | Exigir exportação em formato aberto; testar a exportação no início |
| Contratual | Prazos longos, penalizações de saída | Negociar saída, prazos e preços de renovação |
| Comercial / licenciamento | Descontos que só existem com compromisso | Medir o compromisso contra o uso real |
| De competências | Só uma equipa sabe operar o produto | Formação e documentação |

Modelos de licenciamento comuns: por utilizador, por núcleo/capacidade, por consumo, subscrição anual e licença perpétua com manutenção. Cada um muda o TCO de forma diferente quando a empresa cresce.

**NOTA:** na Azure há benefícios de licenciamento que usam licenças que já tens. O Azure Hybrid Benefit para Windows Server exige licenças com Software Assurance ou subscrições qualificadas, e tem regras mínimas por VM. Confirma sempre as condições do teu contrato antes de contares com a poupança. Para SAP, o modelo depende do contrato da empresa: pergunta ao gestor de licenças.

**ATENÇÃO:** evitar lock-in a todo o custo também tem preço: camadas de abstração a mais, funcionalidades que não usas e prazos maiores. Compara o custo de abstrair com o custo provável de sair.

## FinOps e Azure Cost Management

O **FinOps** é uma prática cultural e operacional que junta engenharia, finanças e negócio para tirar o máximo valor da tecnologia, com responsabilidade partilhada pelo custo. Não é «cortar custos»: é perceber o que se gasta, porquê, e se o valor justifica.

O ciclo do FinOps Foundation tem três fases iterativas:

| Fase | Pergunta | Exemplos |
|---|---|---|
| **Inform** | Quanto gastamos e quem gasta? | Alocação por equipa/produto, relatórios, previsão |
| **Optimize** | Onde podemos gastar melhor? | Ajustar dimensão, desligar o que não se usa, compromissos de preço |
| **Operate** | Como mantemos isto? | Políticas, orçamentos, revisões regulares |

No Azure, o **Microsoft Cost Management** é o conjunto de ferramentas de FinOps. O que podes usar:

| Necessidade | Ferramenta no Azure |
|---|---|
| Estimar antes de criar | *Azure pricing calculator*; *Azure Migrate* para avaliar cargas atuais |
| Analisar o gasto | *Cost analysis*, Power BI, exportações e Cost Details API |
| Controlar | *Budgets* com alertas de custo real ou previsto, alertas de anomalias |
| Alocar custos | *Tags* (com herança de tags) e regras de alocação de custos |
| Reduzir | Recomendações de custo do *Azure Advisor*, reservas, planos de poupança |

Pontos que costumam surpreender:

- Um **orçamento** (budget) gera alertas quando os limiares são ultrapassados, **mas não para os recursos nem bloqueia consumo**.
- **Reservas** (reservations) e **planos de poupança** (savings plans) são compromissos de um ou três anos que dão desconto sobre o preço pay-as-you-go. A reserva fixa recurso, tamanho e região; o plano de poupança compromete um valor por hora e aplica-se a vários serviços elegíveis. Comprometer-se só compensa com uso estável e previsível.
- A governação de custo precisa de **organização**: grupos de gestão, subscrições e etiquetas bem definidas (módulo 06 e 07).

**DICA:** na Casa Nova, impõe desde o primeiro dia as etiquetas `centro-custo`, `ambiente` e `responsavel` (por política, não por boa vontade). Sem elas, a primeira fatura de cloud vira uma discussão sobre quem gastou o quê.

## ROI e business case

O **business case** é o documento que justifica o investimento: problema, opções, custos, benefícios, riscos e recomendação. O **ROI** (return on investment) é a forma mais pedida de resumir: (benefícios − custos) ÷ custos.

### Exemplo trabalhado (valores fictícios): a opção C da Casa Nova

Benefícios previstos por ano em regime pleno: menos trabalho manual de introdução de encomendas 96 000 €, vendas recuperadas por falhas de stock 60 000 €, menos erros e devoluções 24 000 €. Total 180 000 €/ano, com 50% no primeiro ano (arranque). Custo: o da opção C (inicial 156 000 €, 61 000 €/ano).

| Ano | Benefício | Custo | Fluxo líquido | Acumulado |
|---|---|---|---|---|
| 0 | 0 | 156 000 | −156 000 | −156 000 |
| 1 | 90 000 | 61 000 | +29 000 | −127 000 |
| 2 | 180 000 | 61 000 | +119 000 | −8 000 |
| 3 | 180 000 | 61 000 | +119 000 | +111 000 |
| 4 | 180 000 | 61 000 | +119 000 | +230 000 |
| 5 | 180 000 | 61 000 | +119 000 | +349 000 |

    Benefícios totais = 90 000 + 4 x 180 000 = 810 000
    Custos totais     = 461 000 (o TCO de C)
    ROI               = (810 000 - 461 000) / 461 000 = 75,7 %
    Retorno (payback) = no início do 3.º ano (falta 8 000 após o ano 2)

**ATENÇÃO:** o ROI é sensível aos pressupostos de benefício, que são as partes mais incertas e mais difíceis de medir. Pede aos donos do negócio (não à TI) que validem os benefícios e que assumam o compromisso de os medir depois. Benefícios «qualitativos» (imagem, satisfação) entram no texto, não na conta.

Estrutura de um business case curto:

    1. Resumo (uma página): decisão pedida, custo, retorno, risco principal
    2. Problema e impacto no negócio (com números)
    3. Opções consideradas (incluindo "não fazer nada")
    4. Custos (TCO) e benefícios, com pressupostos explícitos
    5. Riscos e como os mitigar
    6. Recomendação, calendário e marcos de decisão

**DICA:** inclui sempre a opção «não fazer nada» com o seu custo (encomendas perdidas, equipa a trabalhar à mão). É a referência contra a qual as outras se medem.

## Dívida técnica e como priorizá-la

A **dívida técnica** é o custo futuro acumulado por atalhos e decisões do passado: tal como uma dívida financeira, paga-se com «juros» (mais tempo em cada alteração, mais falhas) até ser amortizada. Nem toda a dívida é má: um atalho consciente para cumprir um prazo pode ser razoável, desde que seja **registado** e pago.

Priorizar por **impacto × probabilidade ÷ esforço**, com escalas de 1 a 5:

| Dívida (Casa Nova, exemplo) | Impacto | Probabilidade | Esforço | Pontuação |
|---|---|---|---|---|
| Credenciais da base de dados em ficheiros de configuração | 5 | 3 | 1 | 15,0 |
| Sem testes automáticos no cálculo de preços | 4 | 5 | 2 | 10,0 |
| Integrações Delphi-SAP por ficheiros partilhados, sem monitorização | 5 | 4 | 3 | 6,7 |
| Documentação desatualizada | 2 | 4 | 2 | 4,0 |
| Componente Delphi de terceiros sem suporte | 3 | 2 | 4 | 1,5 |

**ATENÇÃO:** a fórmula ajuda a conversar, não decide sozinha. Riscos de segurança e de conformidade têm prioridade por si, independentemente da pontuação. E dívida num componente que vais descontinuar (módulo 11) não compensa pagar.

Formas de a pagar sem parar o negócio: reservar uma percentagem fixa de cada ciclo para dívida; resolver a dívida **quando se toca** no código por outro motivo; ligar cada item a um risco ou a uma funcionalidade de negócio para que a direção perceba o valor. Medir ajuda: tempo médio para alterar um módulo, número de incidentes por componente.

## Roadmap, estimativas e incerteza

Um **roadmap** mostra a direção e a ordem das entregas, não um contrato de datas. Um formato útil para público não técnico é **Agora / A seguir / Mais tarde**:

    AGORA (0-3 meses)       A SEGUIR (3-9 meses)        MAIS TARDE (9+ meses)
    - Stock em tempo real   - Portal de encomendas      - Retirar as aplicações de
    - Monitorização das     - Integração SAP por          balcão Delphi
      integrações             eventos                   - Previsão de procura
    - Corrigir credenciais  - Pipeline CI/CD completo

O detalhe diminui com a distância: o que está longe é intenção, não promessa. Cada bloco deve ligar-se a um resultado de negócio.

**Estimativas.** Raramente é possível acertar um número, por isso estima com **intervalos** e diz que pressupostos os sustentam. Uma técnica simples é a estimativa de três pontos: otimista (O), mais provável (M) e pessimista (P).

    Estimativa = (O + 4 x M + P) / 6        Incerteza aproximada = (P - O) / 6
    Exemplo: O = 60 dias, M = 90, P = 150
    Estimativa = (60 + 360 + 150) / 6 = 95 dias    Incerteza = 15 dias

No início de um projeto a incerteza é maior e vai diminuindo à medida que se aprende (é o chamado cone da incerteza). Por isso, comunica uma **gama larga** no início e reduz-a por marcos, em vez de fixar um número que vais falhar.

**DICA:** quem pede «uma data» está normalmente a pedir confiança. Responde com: «entre X e Y, e na próxima revisão reduzo o intervalo». E nunca contes o esforço de integração com o SAP como «igual aos outros»: é onde as estimativas mais falham.

## Depende da empresa

| Fator | Empresa pequena | Empresa grande |
|---|---|---|
| Aprovação | Decisão do dono ou de um diretor, rápida | Comité, procurement obrigatório, RFP formal |
| Rigor do business case | Uma página basta | Modelo da empresa, validação por Finanças |
| FinOps | Revisão mensal da fatura por uma pessoa | Equipa dedicada, alocação por centro de custo, *chargeback* |
| Licenciamento | Poucos contratos, negociação direta | Acordos corporativos que condicionam as opções |
| Dívida técnica | Gerida de forma informal | Registo formal e percentagem de capacidade reservada |
| Horizonte | 2 a 3 anos | 5 anos ou mais, com planeamento orçamental anual |

Na Casa Nova (400 pessoas, equipa interna pequena) funciona um meio-termo: business case curto, matriz ponderada para as decisões grandes e uma revisão mensal da fatura de cloud.

## Erros comuns

- Comparar só o preço de compra e esquecer manutenção, formação e saída.
- Escolher os pesos da matriz depois de saber quem ganha.
- Tratar o ROI como verdade: os benefícios são hipóteses, e quem os assina deve ser o negócio.
- Confiar na demonstração comercial sem prova de conceito.
- Assumir que «comprar» elimina o esforço de integração e de personalização.
- Subestimar o custo de saída e a dependência de um único fornecedor.
- Deixar a fatura de cloud sem etiquetas, sem orçamento e sem dono.
- Dar uma estimativa pontual, sem intervalo e sem pressupostos.
- Tratar toda a dívida técnica como urgente, ou nenhuma como importante.
- Esconder a opção «não fazer nada» no business case.

## Ligação às certificações

O AZ-305 não tem um domínio só para custos: o raciocínio aparece **dentro** dos domínios e no Azure Well-Architected Framework, que o exame refere no perfil do arquiteto.

| Tema do módulo | Onde aparece no AZ-305 | Serviço / referência Azure | Equivalente AWS |
|---|---|---|---|
| Governação e organização de custos | Domínio de identidade, governação e monitorização: estrutura de grupos de gestão, subscrições e grupos de recursos, e estratégia de etiquetas | Management groups, tags, Azure Policy, Cost Management | AWS Organizations e cost allocation tags |
| Equilíbrio entre funcionalidades, desempenho e custo | Domínio de armazenamento de dados: recomendar uma solução que equilibre funcionalidades, desempenho e custos | Níveis de armazenamento e de serviço, reservas | Classes de armazenamento, Savings Plans |
| Estimar e avaliar migrações | Domínio de infraestrutura: avaliar servidores, dados e aplicações para migração, com o Cloud Adoption Framework | Azure Migrate, pricing calculator | AWS Pricing Calculator |
| Orçamentos, análise e otimização | Transversal, via pilar Cost Optimization do Well-Architected | Cost Management, Advisor | AWS Cost Explorer, AWS Budgets |

**Azure Well-Architected Framework.** Tem cinco pilares: Reliability, Security, Cost Optimization, Operational Excellence e Performance Efficiency. Os princípios do pilar de custo são: desenvolver disciplina de gestão de custos, desenhar com mentalidade de eficiência de custo, desenhar para otimização de uso, desenhar para otimização de tarifa e monitorizar e otimizar ao longo do tempo. A AWS tem um pilar equivalente (Cost Optimization) no seu Well-Architected Framework.

**NOTA:** a lista de competências do exame muda. Confirma sempre o guia de estudo atual do AZ-305 (a versão consultada refere competências em vigor desde 17 de abril de 2026). Como treino de raciocínio (não como previsão do exame), pratica decidir com requisitos de custo e de disponibilidade em conflito: a boa resposta cumpre os requisitos com o menor custo, não é a mais barata nem a mais robusta.

## Exercícios

**PRATICAR:** faz os exercícios 37 a 40 do módulo 15 (construir/comprar/configurar com TCO, matriz de fornecedores e RFP, business case e ROI, priorização de dívida técnica com roadmap). Antes disso, aplica o método a uma decisão real da tua empresa: lista as três opções, estima o TCO a 3 anos de cada uma e escreve uma matriz com pesos definidos antes de pontuar.

## Fontes oficiais

- [Azure Well-Architected Framework: pilares](https://learn.microsoft.com/en-us/azure/well-architected/pillars)
- [Cost Optimization: princípios de desenho](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/principles)
- [Cost Optimization: lista de verificação](https://learn.microsoft.com/en-us/azure/well-architected/cost-optimization/checklist)
- [O que é o Microsoft Cost Management](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/overview-cost-management)
- [Tutorial: criar e gerir orçamentos](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [Azure Reservations](https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations)
- [Azure savings plans](https://learn.microsoft.com/en-us/azure/cost-management-billing/savings-plan/savings-plan-compute-overview)
- [Azure Hybrid Benefit para VMs Windows](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/hybrid-use-benefit-licensing)
- [Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/overview)
- [Azure Advisor: recomendações de custo](https://learn.microsoft.com/en-us/azure/advisor/advisor-cost-recommendations)
- [Azure pricing calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Azure Migrate](https://learn.microsoft.com/en-us/azure/migrate/migrate-services-overview)
- [FinOps Foundation: o que é FinOps](https://www.finops.org/introduction/what-is-finops/)
- [FinOps Foundation: fases do framework](https://www.finops.org/framework/phases/)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)
- [AWS Well-Architected: pilar Cost Optimization](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)
- [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/)
- [AWS Pricing Calculator](https://calculator.aws/)
