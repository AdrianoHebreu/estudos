# 13 Temas avançados

## Porque existe este módulo

Este módulo alarga o horizonte: empresa inteira, evolução ao longo dos anos, dados analíticos, IA, impacto ambiental, multi-cloud e como acompanhar tendências sem seguir modas.

**ATENÇÃO:** «avançado» não quer dizer «obrigatório». Cada tema só entra numa solução se resolver um problema que a organização tem. Uma parte do trabalho do arquiteto é **dizer «ainda não» com argumentos**.

## Arquitetura empresarial

A **arquitetura empresarial** (Enterprise Architecture, EA) olha para a organização inteira: que capacidades de negócio existem, que sistemas as suportam e para onde a tecnologia deve evoluir. O Solution Architect desenha **uma solução**; o arquiteto empresarial desenha o **mapa onde as soluções se encaixam**.

| Nível | Pergunta | Exemplo na Casa Nova | Horizonte |
|---|---|---|---|
| Empresarial | Que capacidades temos e quais precisam de investimento? | O SAP continua a ser a fonte de verdade de stock? | Anos |
| Solução | Como resolvemos este problema de negócio de ponta a ponta? | Portal de encomendas com stock em tempo real | Meses |
| Software | Como se organiza o código de um sistema? | Camadas e módulos do serviço de stock | Semanas |

**NOTA:** em muitas empresas médias não existe arquiteto empresarial. O Solution Architect acaba por fazer um pouco de EA «de bolso»: manter um inventário de sistemas e um mapa de capacidades já ajuda imenso.

### TOGAF em visão geral

O **TOGAF** é um padrão da The Open Group para arquitetura empresarial. A página oficial apresenta a **10.ª edição**, dividida em Fundamental Content (conceitos e práticas centrais) e Series Guides (orientações para configurar esse conteúdo a contextos concretos). O núcleo conhecido é o **ADM** (Architecture Development Method), um ciclo de fases:

    Preliminar      preparar a organização e a capacidade de arquitetura
    A  Visão        âmbito, partes interessadas, objetivos
    B  Negócio      arquitetura de negócio
    C  Sistemas     arquitetura de dados e de aplicações
    D  Tecnologia   arquitetura tecnológica
    E  Oportunidades e soluções
    F  Planeamento da migração
    G  Governação da implementação
    H  Gestão da mudança de arquitetura
    (no centro) Gestão de requisitos, contínua em todas as fases

O ADM é **iterativo**: não é uma cascata. Adapta-se ao contexto (escolhe-se o que serve, sem cumprir todos os artefactos por cumprir).

**NOTA:** o texto integral da norma em `pubs.opengroup.org` pede início de sessão e eu não o consegui ler para este módulo. Os nomes das fases acima são os habituais; confirma-os na edição que a tua empresa usar.

O TOGAF compensa com muitos sistemas, várias áreas de negócio, fusões ou grandes programas, e quando a direção precisa de vocabulário comum; é exagero para uma equipa com um produto, ou numa cultura de autonomia e entregas rápidas em que ninguém manterá os artefactos.

### Mapas de capacidades

Uma **capacidade de negócio** descreve **o que** a empresa faz (não **como** nem com que sistema). É estável: «Gerir stock» existe há décadas, mesmo que o sistema mude três vezes. O mapa serve para decidir onde investir e que sistemas se sobrepõem.

    Casa Nova Distribuição, mapa de capacidades (extrato)

    VENDAS              LOGÍSTICA            FINANÇAS            SUPORTE
    -----------------   ------------------   -----------------   ---------------
    Gerir catálogo      Gerir stock    [!]   Faturar             Gerir clientes
    Receber encomendas  Preparar e expedir   Cobrar              Apoio ao balcão
    Preços e descontos  Gerir transporte     Contabilidade       Reclamações

    [!] = capacidade crítica com sistemas duplicados (SAP + aplicação Delphi)

**DICA:** pinta cada capacidade por maturidade ou risco (verde, amarelo, vermelho). Um mapa colorido numa só página vale mais perante a direção do que quarenta diagramas técnicos.

### ArchiMate (nota)

O **ArchiMate** é uma linguagem de modelação aberta e independente para arquitetura empresarial, mantida pela The Open Group. Segundo a página oficial, descreve processos de negócio, estruturas organizacionais, fluxos de informação, sistemas de TI e infraestrutura técnica, e as relações entre eles. Serve para ligar negócio, aplicações e tecnologia num só modelo. Para um Solution Architect, o **C4** e os ADRs (módulo 04) cobrem o dia a dia; o ArchiMate aparece quando a empresa já o usa. A página oficial indica a versão 3.1; confirma a versão atual na documentação.

## Arquitetura evolutiva e fitness functions

Uma arquitetura que ninguém consegue mudar sem medo degrada-se. Os autores de Building Evolutionary Architectures (Rebecca Parsons, Neal Ford e Patrick Kua) definem uma arquitetura evolutiva como a que suporta **mudança guiada e incremental como princípio de base**, em várias dimensões.

A «guia» é feita com **fitness functions**: mecanismos que avaliam **objetivamente** uma característica da arquitetura (desempenho, dependências permitidas, segurança). Na prática, muitas são **testes automáticos no pipeline** (módulo 09) que falham quando uma regra é violada. Assim, a arquitetura que desenhaste no papel passa a ser verificada em cada alteração.

| Tipo | O que verifica | Exemplo na Casa Nova | Onde corre |
|---|---|---|---|
| Atómica | Uma característica, isolada | O domínio não importa a infraestrutura | Pipeline, a cada pedido de integração |
| Atómica | Um limite mensurável | p95 da consulta de stock abaixo de 800 ms em teste de carga | Pipeline noturno |
| Holística | Várias características em conjunto | Com o SAP indisponível, o portal continua a aceitar encomendas | Teste de resiliência periódico |

Exemplo mínimo em Bun (testado com Bun 1.4.0): falha se algum ficheiro do domínio importar da infraestrutura.

    import { Glob } from "bun";

    // Regra: o domínio não pode importar nada da infraestrutura.
    const infra = /from\s+["'][^"']*\/infra\//;
    const falhas: string[] = [];

    for (const ficheiro of new Glob("src/dominio/**/*.ts").scanSync(".")) {
      const texto = await Bun.file(ficheiro).text();
      if (infra.test(texto)) falhas.push(ficheiro);
    }

    if (falhas.length > 0) {
      console.error("FALHA: o domínio depende da infraestrutura em:", falhas);
      process.exit(1);
    }
    console.log("OK: o domínio não depende da infraestrutura");

**DICA:** liga cada fitness function a um **ADR** (módulo 04). A decisão diz «o domínio é independente da infraestrutura»; a função garante que continua verdade daqui a dois anos, quando já ninguém se lembra do ADR.

## Plataformas de dados

No módulo 05 escolheste bases de dados para **operações** (OLTP). Aqui falamos de dados para **análise**: relatórios, indicadores, ciência de dados. A regra de ouro é **não analisar em cima do sistema transacional**: uma consulta pesada ao SAP ou à base do portal não pode atrasar o balcão.

| Abordagem | Ideia | Ponto forte | Ponto fraco |
|---|---|---|---|
| *Data warehouse* | Dados estruturados e modelados para relatórios (SQL) | Qualidade e desempenho para BI | Rígido perante dados novos ou não estruturados |
| *Data lake* | Armazenamento barato de dados em bruto, de qualquer formato | Flexível | Sem disciplina vira «pântano» de dados |
| *Lakehouse* | Lake com capacidades de warehouse sobre os mesmos dados | Uma só cópia para engenharia e análise | Plataforma mais recente, escolhe com cuidado |
| *Data mesh* | Abordagem organizacional: cada domínio é dono dos seus dados analíticos | Escala com muitas equipas | Exige maturidade e governação federada |

Na documentação do Microsoft Fabric, um lakehouse combina a escalabilidade de um lake com a capacidade de consulta de um warehouse, guarda os dados em formato **Delta** e permite aceder-lhes com Spark e com SQL. A mesma página compara: o lakehouse é indicado para engenharia e ciência de dados e arquiteturas em camadas (medallion); o warehouse para relatórios de BI e modelação dimensional, com T-SQL. Os conceitos valem noutras plataformas; o produto muda, a decisão não.

O **data mesh**, descrito por Zhamak Dehghani num artigo publicado por Martin Fowler, assenta em quatro princípios: propriedade descentralizada dos dados orientada ao domínio, dados como produto, infraestrutura de dados em autosserviço e governação computacional federada.

**NOTA:** o data mesh responde a um problema de **organização** (uma equipa central de dados que é gargalo), não de tecnologia. Numa empresa com uma equipa interna pequena, como a Casa Nova, quase nunca é o ponto de partida.

### Exemplo: indicadores da Casa Nova

A direção quer ver vendas, rutura de stock e margem por delegação. O SAP é a fonte de verdade; o portal e as aplicações Delphi geram dados próprios.

    SAP ----------\
    Portal (BD) ---+--> Ingestão --> Bruto --> Limpo --> Indicadores --> BI
    Apps Delphi ---/    (diária,     (cópia    (regras    (por           (direção,
                         com CDC      fiel)     de         delegação)     delegações)
                         se viável)             negócio)

Decisão proposta (CDC = captura de alterações): **um lakehouse ou warehouse simples, numa só equipa**, com a camada «Indicadores» a cargo de quem conhece o negócio. Data mesh fica registado num ADR como «não agora», com o critério para reavaliar (por exemplo, três ou mais equipas de domínio a produzir dados).

Confirma na documentação da SAP os mecanismos de extração suportados pela versão da empresa e o que o licenciamento permite; não o assumas.

## IA nas soluções

Há **duas coisas muito diferentes** a que se chama «IA na empresa». Confundi-las é o erro mais caro deste tema.

| | IA como ferramenta da equipa | IA dentro do produto |
|---|---|---|
| Exemplos | Claude Code, Codex | Assistente de apoio ao balcão, pesquisa em linguagem natural |
| Quem usa | Developers | Clientes e colaboradores |
| Onde está o risco | Código, segredos e dependências que entram no repositório | Respostas erradas, fuga de dados, custo por pedido |
| Quem decide | Equipa de engenharia, com regras de arquitetura | Arquitetura, segurança, jurídico e negócio |
| Prazo de falha | Apanha-se na revisão e nos testes | Pode chegar ao cliente |

### Claude Code e Codex como ferramentas de equipa

O Claude Code é, segundo a documentação, uma ferramenta de programação com agentes que lê o código, edita ficheiros e executa comandos, disponível no terminal, em IDEs, na aplicação desktop e no browser. Lê um ficheiro `CLAUDE.md` na raiz do projeto, onde se podem registar normas de código, decisões de arquitetura e listas de revisão, e pode ser corrido em CI. O Codex, da OpenAI, está disponível em CLI, extensão de IDE e na cloud, e a documentação inclui secções sobre permissões, *sandboxing*, aprovações e um ficheiro `AGENTS.md` de configuração do agente. Em ambos, confirma na documentação o que cada plano e versão permitem.

O que isto muda para o arquiteto, **sem exagerar**:

- O que está escrito no repositório (regras, ADRs, fitness functions) passa a **orientar o agente** e não só os humanos. A arquitetura documentada rende mais.
- A revisão de código e os testes ficam **mais importantes**, não menos: gera-se código mais depressa do que se revê.
- Decide a política: que dados podem sair para o fornecedor, que comandos o agente pode correr sem pedir aprovação, quem revê. (Segurança: módulo 07.)
- Decisões de arquitetura continuam **tuas**. Um agente propõe; não conhece as restrições políticas, contratuais e de equipa da empresa.

### RAG, agentes e escolha do padrão

**RAG** (Retrieval-Augmented Generation) é o padrão que fundamenta as respostas de um modelo de linguagem **no conteúdo da tua empresa**: procura-se informação relevante e entrega-se ao modelo junto com a pergunta. A documentação do Azure AI Search resume cinco desafios: perceber a intenção da pergunta, aceder a várias fontes, caber no limite de tokens, responder em tempo útil e **controlar quem pode ver o quê**.

Para um agente, a distinção útil (do texto da Anthropic sobre agentes) é esta: num **workflow**, o modelo e as ferramentas seguem caminhos definidos no código; num **agente**, o modelo decide dinamicamente os passos e as ferramentas. O conselho é começar pela solução mais simples e só subir de complexidade quando melhora o resultado, porque os agentes trocam latência e custo por desempenho e podem acumular erros.

| Padrão | Quando serve | Custo e latência | Risco principal |
|---|---|---|---|
| Uma chamada ao modelo | Resumir, classificar, reescrever | Baixos | Respostas inventadas |
| RAG | Perguntas sobre documentos da empresa | Médios (pesquisa + modelo) | Fuga de dados por permissões mal aplicadas |
| Workflow com ferramentas | Passos fixos que consultam APIs | Previsíveis | Falha numa ferramenta a meio |
| Agente | Tarefas abertas, passos imprevisíveis | Altos e variáveis | Ações indevidas (*excessive agency*), custo sem limite |

### Custo, latência, risco, avaliação e governação

| Dimensão | Pergunta de arquitetura | Prática |
|---|---|---|
| Custo | Quanto custa **um pedido** e quantos esperamos? | Custo por pedido = tokens de entrada × preço + tokens de saída × preço + pesquisa. Preços: ver sempre a página do fornecedor |
| Latência | Que tempo de resposta o utilizador tolera? | Respostas em *streaming*, contexto curto, cache de pedidos repetidos (ver a documentação de *prompt caching* do fornecedor) |
| Risco | Que dano uma resposta errada causa? | Lista OWASP Top 10 para aplicações LLM (2025): injeção de prompt, divulgação de informação sensível, agência excessiva, consumo ilimitado, etc. |
| Avaliação | Como sabemos que melhorou ou piorou? | Conjunto de perguntas reais com resposta esperada, corrido a cada alteração de modelo, *prompt* ou dados |
| Governação | Quem responde pelo sistema? | Dono do sistema, registo de utilização, revisão humana nos casos críticos, quadro de risco (NIST AI RMF: Govern, Map, Measure, Manage) |
| Regulação | Em que categoria cai o uso? | Regulamento (UE) 2024/1689 (AI Act): risco inaceitável, alto, limitado (transparência) e mínimo. Os prazos de aplicação têm sido ajustados: confirma o calendário atual |

**ATENÇÃO:** modelos mudam e são descontinuados. Isola o fornecedor atrás de uma interface tua (módulo 03), guarda a versão do modelo usada e acompanha a política de descontinuação do fornecedor.

### Serviços Azure para IA

Só o que está confirmado na documentação consultada: o **Azure AI Search** suporta padrões de RAG com pesquisa híbrida (palavras-chave e vetorial), classificação semântica e limitação de resultados por permissões (herdando metadados do Microsoft Entra ID em conteúdo do Azure Storage); a página menciona também a **recuperação agêntica** (parte descrita como preview) e o **Azure OpenAI** como fonte de vetorização. O portal e os agentes aparecem como **Microsoft Foundry**. As orientações do Well-Architected Framework para cargas de IA cobrem desenho da aplicação, dados de fundamentação, MLOps e GenAIOps, testes e avaliação e IA responsável. Os nomes e o estado (preview ou disponível) mudam depressa: confirma-os antes de os pôr num ADR.

### Exemplo trabalhado: assistente de apoio ao balcão

**Pedido:** «O balcão perde tempo a procurar regras de devolução e a confirmar stock. Queremos um assistente.»

| Pergunta | Decisão |
|---|---|
| O que é conhecimento documental? | Regras de devolução, garantias, fichas técnicas: **RAG** sobre documentos |
| O que é dado vivo? | Stock e preço: **nunca** por RAG (ficaria desatualizado). O assistente chama a API de stock do módulo 05 como ferramenta |
| Padrão | **Workflow com ferramentas**, não agente: dois passos fixos |
| Permissões | Cada pessoa só recebe documentos da sua delegação e função (limitação por permissões na pesquisa) |
| Risco | Não faz encomendas nem altera preços: só lê. Injeção de prompt em documentos de fornecedores tratada como ameaça (módulo 07) |
| Avaliação | 50 perguntas reais do balcão com resposta validada por quem as faz todos os dias |
| Custo | Estimar pedidos por dia × custo por pedido, com limite diário configurado |
| Governação | Dono: responsável de operações. Revisão mensal de respostas más |

## Sustentabilidade

A arquitetura define muito do consumo de energia da solução: máquinas ligadas sem uso, dados guardados para sempre, tráfego desnecessário. O guia de sustentabilidade do Azure Well-Architected Framework trata-a como uma propriedade a equilibrar com fiabilidade, segurança e desempenho, e organiza as recomendações pelos pilares que já conheces. A Green Software Foundation mantém a especificação **SCI** (Software Carbon Intensity), referida nesse guia, para medir a intensidade de carbono de uma aplicação.

| Decisão de arquitetura | Efeito ambiental | Efeito colateral |
|---|---|---|
| Desligar ambientes de teste fora de horas | Menos recursos ativos | Poupa dinheiro (módulo 10) |
| Dimensionar à medida e escalar com a procura | Menos capacidade ociosa | Exige boa monitorização (módulo 08) |
| Retenção de dados e de logs | Menos armazenamento | Ajuda o RGPD (minimização) |
| Duplicar tudo por várias regiões | **Mais** recursos | Tensão com a resiliência: justifica pelo RTO e RPO |
| Usar um modelo de IA grande para tudo | Consumo elevado por pedido | Custo e latência maiores. Escolhe o modelo mais pequeno que cumpre a avaliação |

## Multi-cloud e portabilidade

**Multi-cloud** é usar mais de um fornecedor de cloud público; **cloud híbrida** é combinar cloud pública com infraestrutura própria (a Casa Nova, durante a migração do SAP); **portabilidade** é poder mudar de fornecedor com custo e prazo aceitáveis. Dependência (lock-in) existe sempre em algum grau: é um custo de saída a conhecer.

Multi-cloud **ativo** (a mesma carga em dois fornecedores) tem custos reais, muitas vezes subestimados:

| Custo | Porquê |
|---|---|
| Denominador comum | Para ser portátil, evitas as funcionalidades específicas que justificavam o fornecedor |
| Competências | A equipa tem de dominar duas plataformas: identidade, rede, segurança, custos |
| Operação duplicada | Dois conjuntos de monitorização, políticas e processos de incidente |
| Transferência de dados | O tráfego entre fornecedores costuma ser cobrado: confirma as tarifas atuais |

Há razões legítimas: exigência regulatória ou de cliente, um serviço só disponível num fornecedor, fusões que herdam outra cloud. O que existe para **gerir** ambientes mistos é real: o **Azure Arc**, segundo a documentação, estende a gestão e a governação do Azure a servidores, clusters Kubernetes e serviços de dados fora do Azure (no local ou noutras clouds). Isto reduz o esforço de gestão; não elimina as diferenças entre fornecedores.

A alternativa mais barata ao multi-cloud ativo é a **portabilidade planeada** (saída em vez de duplicação):

Contentores e Kubernetes onde o justifiquem, infraestrutura como código com módulos que isolam o específico do fornecedor (módulo 06), **OpenTelemetry** para telemetria, protocolos abertos em bases de dados e mensagens quando o serviço gerido o permite e, sobretudo, uma **estimativa de custo de saída** (em semanas de trabalho) registada nos ADRs das escolhas mais proprietárias.

Na Casa Nova: Azure como destino único, sem multi-cloud ativo. Cada ADR de serviço proprietário inclui uma linha «custo de saída» e o que o reduziria.

## Acompanhar tendências sem seguir modas

O campo muda a um ritmo que não dá para ler tudo. O objetivo não é saber tudo; é **saber o que merece atenção**.

As fontes habituais (o Radar da Thoughtworks, a documentação e os guias de arquitetura dos fornecedores) têm todas um viés: o Radar é a opinião de uma empresa e dos seus clientes; os fornecedores promovem os produtos que vendem. Cruza sempre mais de uma.

O Radar organiza as entradas em quatro anéis, no estado atual da página: **Adopt**, **Trial**, **Assess** e **Caution**, e em quatro quadrantes (técnicas, plataformas, ferramentas, linguagens e frameworks). Podes copiar o formato para o **radar interno** da tua empresa: o que está em uso, em experiência, em estudo e a evitar.

    Filtro para uma tecnologia nova (cinco perguntas)
    1. Que problema NOSSO resolve? (se não há problema, é moda)
    2. Qual é a alternativa mais simples que já temos?
    3. Quem na equipa a consegue operar daqui a dois anos?
    4. Qual o custo de saída se correr mal?
    5. Que experiência pequena e com prazo prova ou refuta isto?

**DICA:** reserva uma percentagem fixa do tempo (por exemplo, uma tarde por quinzena) para **experiências com prazo e critério de sucesso** escritos antes de começar. E regista as recusas em ADRs («não agora, porque…, reavaliar quando…»): evitam rediscutir o mesmo tema todos os trimestres.

## Modelo reutilizável: ficha de avaliação de um tema avançado

- Qual é o problema de negócio concreto e quem o sente?
- Qual é a solução mais simples que já resolve 80 % do problema?
- Que atributos de qualidade (módulo 02) melhora, e quais piora?
- Custo total de adoção: licenças, competências, operação, saída.
- Que **fitness function** garante que a decisão se mantém válida?
- Quem é o dono depois de entrar em produção?
- Para IA: dados que saem da empresa, avaliação definida, limite de custo, categoria regulatória.
- Critério e data para reavaliar.

## Depende da empresa

| Aspeto | Empresa pequena | Empresa grande ou regulada |
|---|---|---|
| EA | Inventário de sistemas e mapa de capacidades numa página | Gabinete de EA, TOGAF ou equivalente, repositório de modelos |
| Fitness functions | Poucas, no pipeline | Conjunto por domínio, com dono |
| Dados | Um warehouse ou lakehouse simples | Várias plataformas; data mesh se houver maturidade de domínios |
| IA | Poucos casos, fornecedor único | Comité de IA, catálogo de casos, avaliação de risco formal |

## Erros comuns

- **Adotar por moda:** escolher a tecnologia da conferência antes de definir o problema.
- **EA como burocracia:** produzir artefactos que ninguém consulta.
- **Fitness functions a mais ou sem dono:** regras que falham sempre acabam desativadas.
- **Analisar em cima do sistema transacional**, ou construir um data lake sem dono nem catálogo.
- **IA para tudo:** usar RAG ou agentes onde uma regra de negócio ou uma consulta SQL resolvia.
- **Pôr dados vivos em RAG** (stock, preços) em vez de os ir buscar à API, ou esquecer avaliação, permissões e limite de custo.
- **Multi-cloud «por segurança»** sem calcular o custo real e sem plano de operação.

## Exercícios

**PRATICAR:** faz os exercícios 49 a 52 do módulo 15 (mapa de capacidades e plataforma de dados, fitness functions, assistente com IA, multi-cloud e filtro de tendências).

## Fontes oficiais

- The Open Group, TOGAF Standard: https://www.opengroup.org/togaf
- The Open Group, ArchiMate Forum: https://www.opengroup.org/archimate-forum/archimate-overview
- Thoughtworks, Building Evolutionary Architectures: https://www.thoughtworks.com/insights/books/building-evolutionary-architectures
- Microsoft Fabric, o que é um lakehouse: https://learn.microsoft.com/fabric/data-engineering/lakehouse-overview
- Martin Fowler, princípios do data mesh: https://martinfowler.com/articles/data-mesh-principles.html
- Claude Code, visão geral: https://code.claude.com/docs/en/overview
- Codex, documentação: https://developers.openai.com/codex
- Anthropic, Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, modelos: https://platform.claude.com/docs/en/about-claude/models/overview
- Anthropic, prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Anthropic, descontinuação de modelos: https://platform.claude.com/docs/en/about-claude/model-deprecations
- Azure AI Search, RAG: https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview
- Azure Well-Architected, cargas de IA: https://learn.microsoft.com/azure/well-architected/ai/
- OWASP Top 10 para aplicações LLM: https://genai.owasp.org/llm-top-10/
- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- Comissão Europeia, quadro regulatório da IA: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- Azure Well-Architected, sustentabilidade: https://learn.microsoft.com/azure/well-architected/sustainability/
- Green Software Foundation: https://greensoftware.foundation/
- Azure Arc, visão geral: https://learn.microsoft.com/azure/azure-arc/overview
- OpenTelemetry: https://opentelemetry.io/docs/
- Thoughtworks Technology Radar: https://www.thoughtworks.com/radar
