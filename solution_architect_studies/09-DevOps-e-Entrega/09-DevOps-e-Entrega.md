# 09 DevOps e entrega

## Porque a entrega é uma decisão de arquitetura

Uma solução bem desenhada que demora seis semanas a chegar à produção, ou que falha de cada vez que é publicada, não serve o negócio. A **entrega** determina a rapidez com que a empresa reage, o risco de cada alteração e o esforço da equipa: o arquiteto desenha também o **caminho até à produção**.

**DevOps** é a prática de juntar desenvolvimento e operação numa responsabilidade partilhada, apoiada em automação e em feedback rápido. Não é uma ferramenta nem uma equipa: é uma forma de trabalhar. O arquiteto define o que a pipeline tem de garantir; as equipas implementam e operam.

## CI, entrega contínua e deployment contínuo

| Termo | O que faz | Quem decide a publicação |
|---|---|---|
| **Integração contínua (CI)** | Cada alteração é integrada no ramo principal com frequência, compilada e testada automaticamente | Não se aplica |
| **Entrega contínua** | Cada alteração aprovada fica sempre pronta para produção; a publicação é uma decisão humana (um clique ou uma aprovação) | Pessoa |
| **Deployment contínuo** | Cada alteração que passa todos os testes vai para produção sem passo manual | Automático |

Entrega contínua é uma **capacidade** (podes publicar a qualquer momento); deployment contínuo é uma **política**. Para sistemas ligados ao SAP e a aplicações de balcão, a entrega contínua com aprovação costuma ser o ponto de chegada realista.

Uma pipeline típica, da alteração à produção:

    commit/PR --> compilar --> testes unitários --> análise estática/segurança
                                                         |
                                            construir artefacto (uma só vez)
                                                         |
         produção <-- aprovação <-- ambiente de testes <-- ambiente de desenvolvimento
                                          |
                               testes de integração e aceitação

## Ambientes e promoção

Um **ambiente** é um destino de implantação isolado (desenvolvimento, testes, pré-produção, produção). A regra de ouro é **construir uma vez e promover o mesmo artefacto**: o que foi testado é exatamente o que vai para produção. Reconstruir por ambiente cria diferenças que ninguém testou.

O que muda entre ambientes é a **configuração** (endereços, segredos, escala), nunca o código; os segredos ficam num cofre (módulo 07).

Ambos os produtos modelam ambientes de forma nativa:

| Aspeto | Azure DevOps (Azure Pipelines) | GitHub Actions |
|---|---|---|
| Conceito | *Environment*: grupo de recursos-alvo (suporta tipos Kubernetes e máquina virtual) | *Environment*: destino nomeado com regras de proteção |
| Aprovação antes de implantar | Aprovações e verificações (*approvals and checks*) no ambiente | *Required reviewers* (até 6 pessoas ou equipas), uma aprovação basta |
| Outros controlos | Permissões por utilizador e por pipeline | Espera (*wait timer*), restrição de ramos e etiquetas que podem implantar |
| Rastreabilidade | Histórico de implantações, com *commits* e itens de trabalho que chegaram a cada ambiente | Segredos e variáveis específicos do ambiente, só visíveis aos jobs que o usam |

**ATENÇÃO:** no GitHub, as regras de proteção de ambientes em repositórios **privados** dependem do plano (o plano Free só as configura em repositórios públicos). Confirma o teu plano antes de desenhar a governação à volta delas.

## Estratégias de branching

O *branching* define como o código se organiza antes de chegar ao ramo principal. Condiciona a frequência de integração, logo a velocidade da entrega.

| Estratégia | Como funciona | Vantagens | Desvantagens | Quando usar |
|---|---|---|---|---|
| **Trunk-based** | Todos integram num ramo único (trunk) com ramos curtos (horas a poucos dias) para revisão e validação | Integração frequente, poucos conflitos; combina bem com feature flags | Exige testes automáticos fiáveis e disciplina | Equipas com CI madura, serviços novos |
| **Feature branches longos** | Cada funcionalidade vive num ramo durante semanas | Isolamento percebido | Conflitos de integração tardios («merge hell»), feedback lento | Evitar como padrão |
| **Ramos de release** | Cria-se um ramo por versão, endurecido antes de publicar e apagado depois | Permite manter várias versões em campo | Mais trabalho de fusão entre ramos | Software com várias versões suportadas em simultâneo, como as aplicações de balcão |

O sítio de referência do *trunk-based development* descreve os ramos de release como criados a partir do *trunk* à medida da necessidade, e as equipas que publicam diretamente do *trunk* podem dispensá-los.

## Infraestrutura como código em pipelines

O módulo 06 apresentou a infraestrutura como código (IaC): descrever a infraestrutura em ficheiros versionados. Na pipeline, isso traduz-se em:

- **Pipeline ou etapa própria** para infraestrutura, com a mesma revisão do código.
- **Pré-visualização antes de aplicar**: a maioria das ferramentas de IaC mostra o que vai mudar antes de executar (confirma o comando exato na documentação da ferramenta que usares, por exemplo o Bicep).
- **Aprovação humana** antes de alterar produção, sobretudo em recursos com dados.
- **Identidade sem segredos de longa duração**: o GitHub Actions autentica-se no Azure com OIDC (o job pede um token de curta duração e o Azure valida-o contra uma credencial federada numa aplicação do Microsoft Entra ID). Só ficam guardados identificadores (cliente, inquilino, subscrição), não palavras-passe.

## Testes na pipeline

A **pirâmide de testes** (descrita por Martin Fowler) organiza os testes por granularidade: muitos testes unitários rápidos na base, menos testes de integração no meio, poucos testes de interface ou ponta a ponta no topo, porque são lentos e frágeis. Se um teste alto falha e nenhum teste baixo o apanha, acrescenta-se um teste mais abaixo. A forma invertida («cone de gelado») dá uma suite lenta e cara.

| Nível | Corre quando | Velocidade típica | Exemplo no caso |
|---|---|---|---|
| Unitários | Em cada commit/PR | Segundos | Regra de arredondamento de preços |
| Integração | Em cada PR ou no ramo principal | Minutos | API de stock contra uma base de dados de teste |
| Contrato | Em cada PR de quem expõe ou consome | Minutos | Portal e API de stock acordam o formato da resposta |
| Ponta a ponta | Após implantar em testes | Minutos a dezenas de minutos | Encomenda completa no portal, com o SAP de testes |

Os **testes de contrato** verificam que fornecedor e consumidor concordam na interface; são a defesa natural contra quebras entre equipas (módulo 05).

## Estratégias de release

Separa dois conceitos: **implantar** (deploy, o código está em produção) e **lançar** (release, os utilizadores veem a funcionalidade). As feature flags permitem separá-los.

| Estratégia | Como funciona | Rollback | Custo/complexidade | Ponto de atenção |
|---|---|---|---|---|
| **Tudo de uma vez** (runOnce) | Substitui a versão atual | Reimplantar a anterior | Mínimo | Janela de risco e de indisponibilidade |
| **Rolling** | Substitui por lotes de instâncias, com verificação de saúde entre lotes | Parar e reverter | Baixo | Duas versões convivem durante a implantação |
| **Blue/green** | Dois ambientes idênticos; trocas o tráfego da versão atual para a nova | Voltar a trocar | Ambiente duplicado durante a troca | Base de dados partilhada: o esquema tem de servir as duas versões |
| **Canary** | Envia uma pequena percentagem do tráfego para a nova versão e aumenta se estiver saudável | Retirar o tráfego | Requer métricas e encaminhamento de tráfego | Sem métricas fiáveis, o canary não protege nada |
| **Feature flags** | Código novo implantado mas desligado; ativas por utilizador, grupo ou percentagem | Desligar a flag | Código com ramos e dívida de flags | Flags antigas acumulam-se se ninguém as remove |

Como se concretiza nas duas nuvens (valores e limites: confirma sempre na documentação):

| Estratégia | Azure | AWS |
|---|---|---|
| Blue/green | *Deployment slots* do App Service (escalões Standard, Premium ou Isolated): implantas no *slot* de teste, aqueces e fazes *swap*; para reverter, repetes o *swap* | CodeDeploy, tipo de implantação *blue/green* (EC2, Lambda e ECS) |
| Canary | Pipeline com estratégia `canary` (percentagens por incremento, nos recursos suportados), ou encaminhamento de uma percentagem de tráfego para um *slot* | CodeDeploy com configuração *canary*, *linear* ou *all-at-once* em Lambda e ECS |
| Feature flags | Gestão de funcionalidades do Azure App Configuration (cenários *Switch*, *Rollout* e *Experiment*) | Confirma o serviço equivalente na documentação AWS |

O Fowler agrupa as feature toggles em quatro categorias com vidas diferentes: **release** (curtas, de dias a poucas semanas), **experiment** (o tempo de uma experiência), **ops** (interruptores de emergência, às vezes permanentes) e **permissioning** (por tipo de cliente, podem durar anos). Trata-as como inventário a reduzir: cria a tarefa de remoção quando crias a flag.

**ATENÇÃO:** blue/green e canary tornam fácil reverter o **código**, não os **dados**. Alterações de esquema e migrações destrutivas exigem a técnica expand and contract: primeiro acrescentas (compatível com as duas versões), só depois removes o que ficou obsoleto.

## Métricas DORA

O programa DORA (DevOps Research and Assessment) mede o desempenho da entrega de software com cinco métricas, em dois grupos:

| Grupo | Métrica | O que mede |
|---|---|---|
| Débito (*throughput*) | Tempo de espera de uma alteração (*change lead time*) | Do *commit* até estar em produção |
| Débito | Frequência de implantação | Com que frequência se implanta |
| Débito | Tempo de recuperação de implantação falhada | Quanto tempo se demora a recuperar de uma implantação que exigiu intervenção urgente |
| Instabilidade | Taxa de falha das alterações (*change fail rate*) | Percentagem de implantações que precisam de correção imediata (reversão, *hotfix*) |
| Instabilidade | Taxa de retrabalho das implantações | Percentagem de implantações não planeadas, causadas por incidentes em produção |

O modelo evoluiu das «quatro métricas-chave» originais para estas cinco: se leres material antigo, vais encontrar quatro.

**ATENÇÃO:** as métricas servem para **melhorar o sistema**, não para avaliar pessoas ou comparar equipas. Quando se transformam em meta individual, passam a ser manipuladas (por exemplo, partir implantações em pedaços para subir a frequência). Compara cada equipa consigo própria ao longo do tempo.

## Engenharia de plataforma (noções)

Quando há muitas equipas, cada uma reinventa a sua pipeline, os seus ambientes e a sua observabilidade. A **engenharia de plataforma** responde com uma **plataforma interna**: uma camada de serviços que dá às equipas uma forma consistente e de autosserviço de obter e ligar recursos comuns.

O documento de referência da CNCF sobre plataformas insiste em ideias úteis para o arquiteto:

- Trata a plataforma como **produto**: tem utilizadores (as equipas), feedback e prioridades guiadas por necessidades reais.
- Foca os **casos de uso partilhados**, com portais, linha de comandos e APIs, documentação e modelos de arranque (os «caminhos dourados», golden paths).
- Mantém-na **opcional e composável**: se for imposta e rígida, as equipas contornam-na.

**NOTA:** uma equipa pequena não precisa de uma equipa de plataforma, mas sim de um bom modelo de pipeline reutilizável e de IaC partilhada.

## Azure DevOps vs GitHub Actions

Ambos automatizam CI/CD. A escolha raramente é técnica: depende de onde o código já está e do que a empresa já paga e opera.

| Critério | Azure DevOps (Azure Pipelines) | GitHub Actions |
|---|---|---|
| Âmbito | Suite (repositórios, quadros de trabalho, pipelines, artefactos); também existe versão instalável em servidor próprio (Azure DevOps Server) | Pipelines integradas na plataforma GitHub, ao lado do código |
| Pipelines em YAML | Sim; **etapas** (stages) no próprio ficheiro, `dependsOn` | Sim; sem etapas: separas fluxos em ficheiros, `needs` entre jobs |
| Máquinas de execução | Agentes (hospedados pela Microsoft ou próprios), escolhidos por capacidades | *Runners* (hospedados ou próprios), escolhidos por etiquetas |
| Implantação com estratégias | Jobs de implantação com `runOnce`, `rolling` e `canary` | Sem estratégias nativas equivalentes: constróis com ambientes, jobs e scripts (verifica a tua versão) |

## Pipelines para serviços Bun e builds Delphi

**Serviços Bun.** O Bun documenta um fluxo para GitHub Actions que usa a ação `oven-sh/setup-bun` e `bun install --frozen-lockfile`, que falha se o `bun.lock` não bater com o `package.json`, para que o CI nunca altere dependências em silêncio. Um esqueleto, com a implantação protegida por ambiente e OIDC:

    name: stock-api
    on:
      pull_request:
      push:
        branches: [main]
    jobs:
      ci:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: oven-sh/setup-bun@v2
            with:
              bun-version: 1.3.3          # fixa a versão
          - run: bun install --frozen-lockfile
          - run: bun test
      deploy-testes:
        needs: ci
        if: github.ref == 'refs/heads/main'
        runs-on: ubuntu-latest
        environment: testes
        permissions:
          id-token: write                 # só neste job, para o OIDC
          contents: read
        steps:
          - uses: azure/login@<sha-fixo>
            with:
              client-id: ${{ secrets.AZURE_CLIENT_ID }}
              tenant-id: ${{ secrets.AZURE_TENANT_ID }}
              subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # ...implantar o artefacto no ambiente de testes

**Builds Delphi.** O que consegui confirmar: o Delphi compila a partir da linha de comandos com o MSBuild sobre o ficheiro de projeto `.dproj`, depois de correr o `rsvars.bat` (na pasta `bin` da instalação) para definir as variáveis de ambiente. A sintaxe documentada é `MSBuild <projeto> [/t:<alvo>] [/p:config=<configuração>] [/p:platform=<plataforma>]`:

    call "<pasta-do-RAD-Studio>\bin\rsvars.bat"
    MSBuild CasaNovaBalcao.dproj /t:Build /p:Config=Release /p:platform=Win32

Como o `rsvars.bat` vive na instalação do Delphi, a pipeline precisa de uma máquina Windows **com o Delphi instalado**: o mais provável é um **agente próprio** (não assumas que os agentes hospedados o trazem; confirma). Não consegui confirmar nesta aula as regras de **licenciamento do compilador em servidores de build** nem ferramentas específicas para testes automáticos em Delphi: valida-as com a Embarcadero ou com o teu gestor de licenças antes de desenhar.

**ATENÇÃO:** o `rsvars.bat` e o nome do parâmetro de configuração têm armadilhas conhecidas entre versões do Delphi. Testa o comando na versão exata da empresa (por exemplo o 10.3 Rio).

## Assistentes de IA no fluxo da equipa

O Claude Code e o Codex são assistentes de programação com IA. Entram no fluxo de três formas: na máquina do developer, **como colega nos pedidos de alteração** (via GitHub Actions) e **em scripts de CI** (modo não interativo). Para o arquiteto, a pergunta é como os integrar **sem perder controlo, qualidade ou rastreabilidade**.

| Aspeto | Claude Code | Codex |
|---|---|---|
| Execução não interativa | `claude -p "<tarefa>"`; saída em `text`, `json` ou `stream-json`; `--bare` recomendado em CI para não depender da configuração da máquina | `codex exec "<tarefa>"`; por omissão, ambiente só de leitura (*read-only*); `--sandbox workspace-write` permite editar |
| Controlo de permissões | `--allowedTools` e modos de permissão (por exemplo `dontAsk` para execuções sem supervisão) | Níveis de *sandbox* (leitura, escrita no espaço de trabalho, acesso total só em ambientes isolados) |
| Integração GitHub | Ação `anthropics/claude-code-action`: responde a `@claude` ou corre com um *prompt* num evento | Ação `openai/codex-action`, com estratégia de segurança configurável (por omissão remove o `sudo`) |
| Autenticação em CI | Segredo do repositório (`ANTHROPIC_API_KEY`) ou token OAuth; há também federação de identidade | Variável `CODEX_API_KEY`; não a definas ao nível de job em fluxos que correm código do repositório |

**Regras de revisão e rastreabilidade** (uma política mínima que podes propor à equipa):

1. **Revisão humana obrigatória.** O assistente propõe, uma pessoa aprova. Proteção de ramo com revisão exigida: o assistente nunca faz push para o ramo principal.
2. **Autoria visível.** Alterações feitas com assistente ficam identificadas (ramo, etiqueta ou texto do PR), e o autor humano continua responsável por elas. A rastreabilidade para o requisito (issue, item de trabalho) é a mesma de qualquer alteração.
3. **Privilégio mínimo.** Permissões do fluxo limitadas ao necessário; ferramentas permitidas listadas explicitamente; nada de acesso a segredos nem a ambientes de produção (por omissão, ambas as ações só aceitam quem tem permissão de escrita no repositório).
4. **A pipeline não confia no assistente.** O código gerado passa pelos mesmos testes, análises e aprovações que qualquer outro.
5. **Dados e confidencialidade.** Define que código e dados da empresa podem sair para o fornecedor; consulta as páginas de privacidade e retenção dos produtos e o RGPD (módulo 07).
6. **Custos controlados.** Limita turnos e tempo de execução: cada execução gasta minutos de CI e consumo de API.

**ATENÇÃO:** um assistente não é um substituto de arquiteto nem de revisor. Pode produzir código plausível e errado, e quando corre em CI com permissões amplas passa a ser mais uma identidade com acesso ao repositório. Trata-o como um colaborador júnior muito rápido: útil, mas revisto.

## Exemplo trabalhado: a entrega na Casa Nova Distribuição

A Casa Nova vai ter o portal de encomendas (Bun/TypeScript), uma API de stock (Bun) a ler do SAP, e as aplicações de balcão em Delphi nas 12 delegações. A equipa interna é pequena.

**Decisões e justificação:**

| Tema | Decisão | Porquê |
|---|---|---|
| Branching | Trunk-based com ramos curtos nos serviços Bun; ramos de release nas aplicações Delphi | Os serviços publicam com frequência; as aplicações de balcão têm ciclos mais lentos e versões em campo |
| Pipeline dos serviços | GitHub Actions (ou Azure Pipelines, conforme onde estiver o código): CI em cada PR, artefacto construído uma vez | Reuso do mesmo artefacto em todos os ambientes |
| Ambientes | desenvolvimento, testes, produção; testes liga a um SAP de testes (se existir) | Não testar contra o SAP de produção |
| Promoção | Automática até testes; aprovação humana para produção | Equipa pequena, sistema que não pode parar |
| Release da API de stock | Blue/green com *slots* se for App Service; esquema com *expand and contract* | Reversão em segundos |
| Release do portal | Implantar com *flag* desligada, ligar por percentagem de clientes | Testar com tráfego real sem expor todos |
| IaC | Pipeline própria para a infraestrutura, com pré-visualização e aprovação | A infraestrutura não muda sem revisão |
| Delphi | Agente Windows próprio com o Delphi; artefacto instalável publicado como artefacto da pipeline | O compilador tem de estar instalado onde se compila (licenciamento a confirmar) |
| Assistentes de IA | Permitidos em PRs com revisão obrigatória, sem acesso a produção | Ganho de produtividade sem perder controlo |

**Métricas de partida** (fictícias): publicação do portal de 4 em 4 semanas e 20% de implantações com hotfix. Objetivo no primeiro semestre: publicar quinzenalmente e reduzir os hotfixes para metade, comparando a equipa **consigo própria**.

## Modelo reutilizável: lista de verificação da entrega

Usa estas perguntas ao desenhar ou rever o caminho até à produção:

1. O mesmo artefacto é promovido por todos os ambientes? O que muda é só a configuração?
2. Que testes correm em cada fase, e qual o tempo total até feedback?
3. Quem aprova a produção, e como se reverte (incluindo os dados)?
4. Há *flags*? Quem as remove, e quando?
5. A infraestrutura passa pela mesma revisão que o código?
6. A identidade da pipeline tem o privilégio mínimo? Há segredos de longa duração?
7. Medes as métricas DORA, e alguém age sobre elas?
8. Há política para assistentes de IA (revisão, permissões, dados, custo)?

## Depende da empresa

| Fator | Se for assim... | ...muda isto |
|---|---|---|
| Regulação e auditoria | Segregação de funções obrigatória | Aprovações de produção por quem não escreveu o código; registos de auditoria |
| Legado (SAP, Delphi) | Ciclos de alteração lentos e janelas de manutenção | Releases menos frequentes nessas peças; contratos estáveis entre elas e os serviços novos |
| Política de IA | Restrições de dados a fornecedores | Assistentes só em repositórios autorizados, ou desativados |

## Erros comuns

- Pipelines que reconstroem o artefacto por ambiente, e depois «em produção não funciona».
- Segredos em variáveis de pipeline de longa duração, em vez de identidade federada.
- Blue/green sem tratar a base de dados: a versão antiga parte com o esquema novo.
- Canary sem métricas, ou flags que nunca se removem.
- Usar as métricas DORA para avaliar pessoas ou comparar equipas.
- Dar a um assistente de IA acesso de escrita à produção, ou deixá-lo fazer *merge* sem revisão.

## Ligação às certificações

O tema cai sobretudo no domínio **Design infrastructure solutions (30-35%)**, subtópico Design an application architecture, do AZ-305: o guia atual inclui «Recommend an automated deployment solution for applications» e «Recommend an application configuration management solution». O perfil do candidato exige ainda experiência com processos DevOps. A monitorização e o feedback ligam-se a Design identity, governance, and monitoring solutions (25-30%), na parte de registo e monitorização.

| Tema da aula | Onde cai no AZ-305 | Serviço Azure principal | Equivalente AWS |
|---|---|---|---|
| CI/CD e implantação automatizada | Infraestrutura: arquitetura de aplicações | Azure Pipelines (Azure DevOps) ou GitHub Actions | AWS CodePipeline (entrega contínua) |
| Estratégias de release (blue/green, canary) | Infraestrutura: soluções de computação e implantação | App Service *deployment slots*; estratégias de implantação do Azure Pipelines | AWS CodeDeploy (blue/green, canary, linear) |
| Feature flags e configuração | Infraestrutura: gestão de configuração de aplicações | Azure App Configuration | Confirma na documentação AWS |
| IaC em pipelines | Infraestrutura | Bicep (confirma o âmbito na documentação) | AWS CloudFormation |

**NOTA:** o AZ-305 **não** é o exame de DevOps. A certificação centrada neste tema é a **DevOps Engineer Expert** (exame **AZ-400**), cujo peso maior está em «Design and implement build and release pipelines». Os domínios e percentagens mudam: confirma a página do exame antes de estudar.

## Exercícios

**PRATICAR:** faz os exercícios **33 a 36** do módulo 15 (pipeline e ambientes, estratégia de release, análise de métricas DORA, política de assistentes de IA).

## Fontes oficiais

- [DORA: as métricas de desempenho da entrega](https://dora.dev/guides/dora-metrics/)
- [Azure Pipelines: o que é](https://learn.microsoft.com/en-us/azure/devops/pipelines/get-started/what-is-azure-pipelines)
- [Azure Pipelines: ambientes](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/environments)
- [Azure Pipelines: jobs de implantação e estratégias (runOnce, rolling, canary)](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/deployment-jobs)
- [Azure App Service: slots de implantação](https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots)
- [Azure App Configuration: gestão de funcionalidades](https://learn.microsoft.com/en-us/azure/azure-app-configuration/concept-feature-management)
- [Bicep: visão geral](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)
- [GitHub Actions: gerir ambientes](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [GitHub Actions: OIDC no Azure](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-azure)
- [GitHub: migrar do Azure Pipelines para o GitHub Actions](https://docs.github.com/en/actions/migrating-to-github-actions/manually-migrating-to-github-actions/migrating-from-azure-pipelines-to-github-actions)
- [Bun: Bun em CI/CD (GitHub Actions)](https://bun.sh/guides/runtime/cicd)
- [Embarcadero: Delphi](https://www.embarcadero.com/products/delphi)
- [Claude Code: GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Claude Code: execução programática](https://code.claude.com/docs/en/headless)
- [Codex: modo não interativo](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Martin Fowler: Feature Toggles](https://martinfowler.com/articles/feature-toggles.html)
- [Martin Fowler: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [CNCF: Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/)
- [AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
- [AWS CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305)
- [Exame AZ-400](https://learn.microsoft.com/en-us/credentials/certifications/exams/az-400/)
