# 07 Segurança e conformidade

## A segurança é um requisito de arquitetura

Segurança não é uma camada que se acrescenta no fim: é um conjunto de decisões de arquitetura (quem se autentica, onde ficam os segredos, que redes existem, que dados se guardam) que custam muito mais a mudar depois de o sistema estar em produção. O arquiteto não é o especialista de segurança da empresa, mas **é quem garante que a segurança foi pensada no desenho** e que as decisões ficam registadas (módulo 04).

O modelo de base chama-se **CIA** (Confidentiality, Integrity, Availability):

| Propriedade | Pergunta | Exemplo na Casa Nova | Controlo típico |
|---|---|---|---|
| Confidencialidade | Só vê quem deve ver? | Preços negociados por cliente não podem ser vistos por outro cliente | Autenticação, autorização, cifragem |
| Integridade | Os dados só mudam de forma autorizada e detetável? | Uma encomenda não pode ser alterada em trânsito entre o portal e o SAP | Validação, assinaturas, cifragem em trânsito, registos de auditoria |
| Disponibilidade | O serviço está acessível quando é preciso? | O portal de encomendas não pode cair por causa de um pico de pedidos maliciosos | Redundância (módulo 08), limites de pedidos, proteção contra DoS |

## Princípios que orientam as decisões

| Princípio | Ideia | Como se vê no desenho |
|---|---|---|
| Menor privilégio | Cada pessoa e cada aplicação tem só o acesso de que precisa, pelo tempo de que precisa | O serviço de stock lê o stock, não tem permissão para apagar a base de dados |
| Defesa em profundidade | Várias camadas independentes: se uma falha, as outras seguram | Firewall aplicacional, autenticação, autorização na API, cifragem dos dados, registos |
| Zero Trust | «Nunca confiar, verificar sempre»: estar dentro da rede não dá confiança por si só | Cada pedido é autenticado e autorizado, mesmo entre serviços internos |

A Microsoft descreve o Zero Trust com três princípios: **verificar explicitamente**, **usar o menor privilégio** e **assumir a violação** (desenhar a pensar que um atacante pode já estar dentro, para limitar o impacto e detetar depressa). O NIST tem uma arquitetura de referência independente de fornecedor (ver fontes).

## Identidade: autenticação e autorização

Em arquiteturas modernas, a **identidade é o novo perímetro**: os ataques exploram credenciais roubadas mais do que portas abertas na rede. Por isso a identidade é a primeira decisão de segurança.

**Autenticação** responde a «quem és?» (início de sessão com a conta da empresa); **autorização** responde a «o que podes fazer?» (aprovar encomendas até 5000 euros).

### Microsoft Entra ID, SSO e protocolos

**Microsoft Entra ID** (antes chamado Azure Active Directory) é o serviço de identidade da Microsoft na cloud: guarda utilizadores, grupos e aplicações, e emite os tokens que as aplicações usam para confiar na identidade de alguém. É o **fornecedor de identidade** (identity provider, IdP) dos exemplos do curso.

**Single sign-on (SSO):** o utilizador autentica-se uma vez e acede a várias aplicações sem repetir o início de sessão. Segundo a documentação, as aplicações deixam de gerir nomes de utilizador e palavras-passe próprios, e a administração controla o acesso num só sítio. O Entra ID suporta SSO por federação com **SAML 2.0** e **OpenID Connect** (e outros métodos para aplicações antigas, como o baseado em palavra-passe).

**OAuth 2.0 e OpenID Connect (OIDC)** são os protocolos que as aplicações usam:

| Protocolo | Serve para | Resultado |
|---|---|---|
| OAuth 2.0 | **Autorização delegada**: uma aplicação obtém permissão para aceder a uma API, em nome de um utilizador ou dela própria | Access token |
| OpenID Connect | **Autenticação**: camada sobre o OAuth 2.0 que diz à aplicação quem é o utilizador | ID token (e access token) |

Os quatro papéis do OAuth 2.0, como a documentação os descreve: **servidor de autorização** (o Entra ID), **cliente** (a aplicação que pede acesso), **dono do recurso** (normalmente o utilizador) e **servidor de recursos** (normalmente uma API). Os tokens são do tipo bearer (quem o tem, usa-o) e no Entra ID são JWT. Por isso **tratam-se como segredos**: não se registam em logs, não se põem em URLs e têm validade curta. O refresh token serve para pedir novos tokens e é tratado como dado sensível.

Que fluxo usar (regra geral; confirma na documentação do teu fornecedor de identidade):

| Cenário | Fluxo habitual |
|---|---|
| Utilizador a entrar numa aplicação web, SPA ou móvel | *Authorization code* (com PKCE em clientes públicos como SPA e móvel) |
| Serviço a chamar outra API, sem utilizador | *Client credentials*, ou melhor, identidade gerida (abaixo) |

**ATENÇÃO:** não inventes autenticação própria (tabela de utilizadores com palavras-passe, tokens feitos à mão). Usa um IdP e bibliotecas oficiais. Autenticação caseira é das causas mais comuns de falhas graves.

### Autorização: RBAC

**RBAC** (role-based access control) concede acesso por **papéis** em vez de por pessoa. No **Azure RBAC**, uma atribuição de papel junta três coisas: **principal de segurança** (utilizador, grupo, service principal ou identidade gerida), **definição de papel** (conjunto de permissões, como Reader, Contributor ou Owner, ou papéis personalizados) e **âmbito** (grupo de gestão, subscrição, grupo de recursos ou recurso). O modelo é **aditivo**: as permissões efetivas são a soma das atribuições, e uma atribuição de negação (deny assignment) tem precedência.

**NOTA:** o Azure RBAC controla o acesso a **recursos Azure**. Os papéis do próprio diretório Entra (por exemplo, quem administra utilizadores) são outro sistema. E o RBAC da **tua aplicação** (quem pode aprovar encomendas) é uma decisão de desenho tua, geralmente com papéis ou grupos que chegam no token.

Boas práticas: atribuir a **grupos**, no **âmbito mais estreito** possível; separar quem pede, aprova e executa; acesso privilegiado **temporário** (no Azure, o Privileged Identity Management; confirma o licenciamento).

### Identidades geridas (para aplicações)

Uma **identidade gerida** (managed identity) dá a um recurso Azure (App Service, VM, contentor, etc.) uma identidade no Entra ID **sem credenciais para gerir**: o código pede um token à plataforma, e a rotação é feita pela Azure. Existem dois tipos:

| Tipo | Ciclo de vida | Partilha | Quando usar |
|---|---|---|---|
| Atribuída ao sistema | Criada com o recurso, apagada com ele | Um só recurso | Carga de trabalho num único recurso |
| Atribuída ao utilizador | Recurso independente, apagado explicitamente | Vários recursos | Vários recursos com as mesmas permissões, ou recursos que são recriados com frequência |

O padrão: a identidade gerida da API recebe, por RBAC, apenas os papéis de que precisa sobre a base de dados e o Key Vault. **Não há palavra-passe em ficheiro nenhum.** Na AWS, o equivalente são os **papéis IAM** atribuídos a serviços (ver «Ligação às certificações»).

## Segredos e chaves

**Segredo** = palavra-passe, chave de API, connection string, certificado, chave de cifragem. Regras de arquitetura:

1. **Nunca** em código, em repositório Git, em imagens de contentor ou em tickets.
2. Preferir **não ter segredo**: identidade gerida em vez de palavra-passe.
3. Quando é inevitável (por exemplo, a credencial do utilizador técnico do SAP), guardar num **cofre** com acesso controlado e registado.
4. Poder **rodar** o segredo sem deploy (o segredo é lido em tempo de execução, não embebido).

O **Azure Key Vault** guarda **segredos, chaves e certificados**; a autenticação é feita via Entra ID e a autorização por Azure RBAC (ou por access policies, o modelo mais antigo, só para dados do cofre). O acesso pode ser registado e enviado para o Azure Monitor. Tem escalões Standard e Premium (este com chaves protegidas por HSM): confirma preços e funcionalidades na documentação. Um cofre por aplicação e ambiente limita o raio de impacto. Equivalentes na AWS: **Secrets Manager** (segredos) e **KMS** (chaves).

**ATENÇÃO:** um segredo que esteve num commit está comprometido, mesmo apagado (fica no histórico): **roda-o**.

## Segurança de rede

A rede continua a importar, mas já não é a única defesa (Zero Trust). Camadas habituais:

| Camada | Para quê | Azure | AWS |
|---|---|---|---|
| Segmentação | Separar zonas e limitar tráfego lateral | Redes virtuais e *network security groups* (NSG) | VPC, *security groups* |
| Ponto de entrada | Filtrar tráfego web malicioso | Web Application Firewall (WAF) | AWS WAF |
| Acesso privado a serviços PaaS | Base de dados e cofre sem exposição à Internet pública | Private Link / *private endpoints* | AWS PrivateLink |
| Ligação ao datacenter | Chegar ao SAP e às delegações | VPN ou ExpressRoute (módulo 06) | VPN ou Direct Connect |

Com o **Private Link**, o tráfego entre a tua rede virtual e o serviço PaaS passa pela rede interna da Microsoft e o serviço deixa de precisar de exposição pública; o private endpoint aponta para **uma instância** do recurso, o que também reduz o risco de fuga de dados.

## Modelação de ameaças com STRIDE

Modelar ameaças é perguntar, **antes de construir**: «o que pode correr mal e o que fazemos quanto a isso?». Começa com o diagrama de fluxo de dados que já tens do módulo 04 (C4 ou fluxos) e marca as **fronteiras de confiança** (onde os dados passam de uma zona de confiança para outra).

**STRIDE** é uma mnemónica da Microsoft com seis categorias:

| Letra | Ameaça | Propriedade violada | Pergunta-guia |
|---|---|---|---|
| S | *Spoofing* (falsificação de identidade) | Autenticidade | Alguém pode fingir ser outro utilizador ou serviço? |
| T | *Tampering* (adulteração) | Integridade | Os dados podem ser alterados em repouso ou em trânsito? |
| R | *Repudiation* (repúdio) | Não repúdio | Alguém pode negar que fez uma ação, sem prova em contrário? |
| I | *Information disclosure* (divulgação de informação) | Confidencialidade | Dados podem chegar a quem não devia? |
| D | *Denial of service* (negação de serviço) | Disponibilidade | Alguém pode tornar o serviço inutilizável? |
| E | *Elevation of privilege* (elevação de privilégio) | Autorização | Um utilizador comum pode ganhar permissões de administrador? |

Aplica-se **a cada elemento e a cada fluxo que atravessa uma fronteira de confiança**. O resultado é uma lista de ameaças, cada uma com decisão: mitigar, aceitar, transferir ou eliminar. As mitigações viram requisitos (módulo 02) e ADRs (módulo 04).

## OWASP Top 10

O **OWASP Top 10** é uma lista de consciencialização sobre os riscos mais críticos de aplicações web, mantida pela comunidade OWASP. A edição atual no site é **OWASP Top 10:2025**:

| ID | Categoria | Medida de arquitetura relacionada |
|---|---|---|
| A01 | Broken Access Control | Autorização no servidor em cada pedido; menor privilégio |
| A02 | Security Misconfiguration | Configuração como código; valores seguros por omissão |
| A03 | Software Supply Chain Failures | Gestão de dependências e do *pipeline* (secção abaixo) |
| A04 | Cryptographic Failures | Cifragem em trânsito e em repouso; gestão de chaves no cofre |
| A05 | Injection | Consultas parametrizadas; validação de entradas |
| A06 | Insecure Design | Modelação de ameaças; padrões seguros |
| A07 | Authentication Failures | IdP centralizado, autenticação multifator, sem autenticação caseira |
| A08 | Software or Data Integrity Failures | Artefactos assinados; verificação de integridade |
| A09 | Security Logging and Alerting Failures | Registos e alertas desenhados (secção abaixo) |
| A10 | Mishandling of Exceptional Conditions | Tratamento de erros que não revele detalhes nem abra acessos |

**NOTA:** a lista muda de edição para edição (a anterior era a de 2021). Usa-a como lista de verificação, não como lei, e confirma a edição em vigor. Para requisitos verificáveis existe o **OWASP ASVS**.

## RGPD aplicado à arquitetura

**ATENÇÃO:** esta secção explica como o RGPD (Regulamento Geral sobre a Proteção de Dados) afeta o **desenho técnico**. **Não é aconselhamento jurídico.** As decisões de base legal, avaliação de impacto e transferências devem ser tomadas com o encarregado de proteção de dados (DPO) e o departamento jurídico.

| Conceito | O que é | Impacto no desenho |
|---|---|---|
| Dado pessoal | Informação sobre uma pessoa identificada ou identificável (nome, email, NIF, IP, matrícula, localização) | Inventariar onde existe: contactos de clientes B2B também são dados pessoais |
| Categorias especiais | Dados de saúde, biométricos, filiação sindical, etc. (artigo 9.º) | Regras mais apertadas; evitar recolher |
| Base legal | Fundamento para tratar os dados (artigo 6.º): consentimento, contrato, obrigação legal, interesses vitais, interesse público, interesses legítimos | Cada finalidade tem a sua base; define o que podes fazer com o dado |
| Minimização e limitação da finalidade | Só os dados necessários, para a finalidade declarada | Não copiar a tabela de clientes inteira para o ambiente de testes |
| Privacidade desde a conceção e por omissão | Proteção desenhada de raiz (artigo 25.º) | Pseudonimização, acessos restritos, retenção definida |
| Subcontratante | Fornecedor que trata dados por conta da empresa | Contrato de subcontratação; avaliar a cloud e os fornecedores SaaS |
| Avaliação de impacto (DPIA) | Análise obrigatória quando o tratamento pode implicar risco elevado | Faz-se antes de construir (ver abaixo) |
| Notificação de violação | Comunicar à autoridade de controlo, em regra sem demora injustificada e, sempre que possível, até 72 horas (artigo 33.º) | Desenhar deteção e processo de resposta a incidentes |

**Direitos dos titulares** (artigos 15.º a 22.º): informação e acesso, retificação, apagamento, limitação, portabilidade, oposição e não ficar sujeito a decisões exclusivamente automatizadas. Para o arquiteto, cada direito é um **requisito não funcional**: tens de conseguir **encontrar, exportar, corrigir e apagar** os dados de uma pessoa em **todos** os sistemas (SAP, portal, cópias de segurança, registos, ferramentas de análise). Se os dados estão duplicados em dez sítios (problema da Casa Nova), este requisito é caro. Boa razão para o módulo 05 definir uma fonte de verdade.

**Residência de dados:** o RGPD condiciona as transferências para fora do Espaço Económico Europeu (capítulo V). Em Azure, escolhes a região e a geography onde ficam os teus dados. A Microsoft declara que não armazena nem processa dados do cliente fora da geography escolhida sem autorização, com exceções listadas (por exemplo, alguns serviços não regionais, como o próprio Microsoft Entra ID, ou serviços em pré-visualização). **Confirma, serviço a serviço, onde ficam os dados e os metadados**, incluindo cópias de segurança e serviços de IA. Região certa não é o mesmo que conformidade: continuam a ser precisos contratos e medidas.

**Quando fazer uma DPIA?** Quando o tratamento é suscetível de implicar risco elevado para os direitos das pessoas (por exemplo, monitorização sistemática em grande escala, categorias especiais, decisões automatizadas com efeitos significativos). A lista concreta vem das orientações da autoridade nacional (em Portugal, a CNPD) e do Comité Europeu para a Proteção de Dados. Na dúvida, pergunta ao DPO.

## Auditoria e registos

Os registos respondem a três perguntas: **quem fez o quê, a quê e quando**. Servem a segurança (deteção), a conformidade (prova) e as operações (diagnóstico, módulo 08).

| Tipo de registo | Exemplo | No Azure |
|---|---|---|
| Plano de gestão | Quem criou ou apagou um recurso | *Activity log* |
| Plano de dados | Quem leu um segredo do cofre | *Resource logs* (precisam de *diagnostic settings*) |
| Identidade | Inícios de sessão e alterações no diretório | Registos do Entra ID |
| Aplicação | Quem aprovou a encomenda 123 | Registos da própria aplicação |

Pontos de desenho: o activity log é recolhido por omissão e retido **90 dias**; para mais tempo, exporta-se (por exemplo, para um Log Analytics workspace ou para armazenamento). Os registos do plano de dados não são recolhidos por omissão. O activity log **não** é um registo de tentativas de autenticação falhadas. Centraliza os registos num sítio com acesso restrito, define **retenção** (equilíbrio entre prova e RGPD: registos com dados pessoais também têm prazo), e **não registes segredos nem dados pessoais desnecessários**. Para deteção e resposta, existem plataformas de SIEM (no Azure, o Microsoft Sentinel; na AWS, por exemplo CloudTrail e GuardDuty).

## Cadeia de fornecimento de software

O teu código é uma pequena parte do que corre: bibliotecas, imagens base, ferramentas de *build*, *pipelines*, plugins. Um ataque a qualquer um deles entra no teu sistema. O OWASP 2025 passou a ter uma categoria própria (A03).

| Risco | Medida de arquitetura |
|---|---|
| Dependência com vulnerabilidade conhecida | Análise automática de dependências no CI; política de atualização |
| Pacote malicioso ou adulterado | Ficheiro de *lock* com versões e integridade; registo privado/espelho; rever novas dependências |
| Scripts de instalação | Desativar ou restringir (ver Bun abaixo) |
| *Pipeline* comprometido | Menor privilégio nos *runners* e nos segredos; ambientes separados (módulo 09) |
| Não saber o que está em produção | **SBOM** (lista de componentes) gerada a cada build |
| Artefacto não verificável | Proveniência e assinatura; referência: **SLSA**, framework de níveis crescentes para a integridade do build |

No **Bun**, o `bun.lock` fixa as versões; por omissão o Bun **não executa** os scripts de ciclo de vida (como `postinstall`) das dependências, salvo as listadas em `trustedDependencies` (e uma lista interna de pacotes populares); o comando `bun audit` procura vulnerabilidades conhecidas a partir do `bun.lock`. É um bom ponto de partida, mas **não substitui** uma política de dependências na empresa.

## Governação do uso de assistentes de IA de programação

Claude Code e Codex são ferramentas que **leem o teu código, propõem alterações e podem executar comandos**. A sua adoção é uma decisão de arquitetura e de governação, não só de produtividade. Três perguntas: **que dados saem? quem revê o que é produzido? que segredos ficam expostos?**

**1. Que dados saem.** Segundo a documentação do Claude Code, os pedidos enviam ao modelo os prompts e as saídas (e, na prática, o conteúdo dos ficheiros que a ferramenta lê para trabalhar), cifrados em trânsito. Pontos a decidir com a segurança e o DPO:

| Aspeto | O que a documentação diz (Claude Code) | Decisão para a empresa |
|---|---|---|
| Treino | Em planos comerciais (Team, Enterprise, API), a Anthropic não treina modelos com código ou *prompts*, salvo opt-in; nos planos individuais há uma definição que o utilizador controla | Usar contas da empresa, não contas pessoais |
| Retenção | Comercial: 30 dias por omissão; retenção zero disponível para contas elegíveis | Confirmar o contrato |
| Fornecedor | Pode ser usado via Amazon Bedrock, Google Cloud ou Microsoft Foundry | Escolher onde os dados são processados (residência, módulo 06) |

A documentação da OpenAI para o Codex indica que, por omissão, o agente corre com o **acesso à rede desligado** num sandbox, com modos `read-only`, `workspace-write` e `danger-full-access`, e políticas de aprovação; refere ainda que os registos locais guardam transcrições e recomenda não registar prompts que contenham código ou dados sensíveis. **Os detalhes mudam depressa: confirma a documentação atual antes de definires a política.**

**2. Revisão humana.** O código gerado é **código de um desconhecido**: revê-se como qualquer pull request, com atenção redobrada a autenticação, autorização, validação de entradas e novas dependências. A documentação do Claude Code é explícita: a responsabilidade de rever comandos e alterações antes de aprovar é do utilizador. Regras de arquitetura: o assistente não faz merge nem deploy sozinho; as proteções de ramo e o CI aplicam-se igualmente; quem submete responde pelo código.

**3. Segredos e permissões.**

- Nunca coloques segredos em *prompts*, em ficheiros que a ferramenta leia, nem em `CLAUDE.md`/instruções do projeto.
- O Claude Code permite regras de permissão do tipo `Read(./.env)` em deny, mas a documentação avisa que são tentativas de melhor esforço para as ferramentas de ficheiros e comandos reconhecidos; **para impor o bloqueio ao nível do sistema operativo usa o sandbox**. As regras avaliam-se na ordem negar, perguntar, permitir.
- A configuração gerida (*managed settings*) permite impor padrões da organização, e a utilização pode ser monitorizada por OpenTelemetry.
- Dá ao assistente credenciais de **desenvolvimento com menor privilégio**, nunca de produção. Dados reais de clientes não entram em prompts: usa dados fictícios ou anonimizados.
- Ferramentas externas (servidores MCP, *plugins*) são cadeia de fornecimento: só aprovadas.
- Atenção à **injeção de prompt**: texto malicioso em ficheiros, páginas ou issues pode tentar manipular o agente. As permissões e o sandbox existem para limitar este risco.

## Exemplo trabalhado: segurança do portal de encomendas da Casa Nova

Desenho do módulo 06 (resumido): clientes B2B acedem ao portal; uma API de encomendas e outra de stock correm em Azure; ligam por integração ao SAP no datacenter; as aplicações Delphi de balcão consomem a API de stock.

    Cliente B2B --HTTPS--> [WAF] --> [Portal / API Encomendas]
                                          |  identidade gerida
                           +--------------+--------------+
                           v              v              v
                      [Key Vault]   [Base de dados]  [Integração -> SAP]
                      (private ep.) (private ep.)    (VPN/ExpressRoute)
    Funcionários --SSO (Entra ID)--> Portal interno / Apps Delphi via API

**Decisões, uma a uma:**

| Tema | Decisão | Porquê |
|---|---|---|
| Identidade interna | Funcionários com Entra ID e SSO; autenticação multifator; acesso condicional | Um sítio para entrar e para revogar |
| Identidade de clientes | Utilizadores externos com um serviço de identidade de clientes (confirma o produto atual na documentação) | Não guardar palavras-passe no portal |
| Autorização | Papéis na aplicação (comprador, aprovador); a API valida o token e o papel em **cada** pedido | A01: Broken Access Control |
| Serviço a serviço | Identidades geridas; sem palavras-passe na configuração | Sem segredos para vazar |
| Segredos inevitáveis | Credencial do utilizador técnico do SAP no Key Vault, acesso por RBAC, rotação planeada | Cofre auditável |
| Rede | Só o WAF é público; base de dados e cofre com *private endpoint* | Defesa em profundidade |
| Apps Delphi | Passam a usar a API (com token) e não ligam diretamente à base de dados | Fim da conta de base de dados partilhada nos postos |
| Registos | *Activity log* e registos de dados do cofre exportados para um workspace central; retenção definida | Auditoria sem guardar dados pessoais a mais |
| Dados pessoais | Inventário: contactos de clientes, dados de colaboradores; ambiente de testes com dados fictícios | Minimização |
| Dependências | `bun audit` e SBOM no CI | Cadeia de fornecimento |

**STRIDE sobre o fluxo «cliente cria encomenda»:**

| Ameaça | Cenário | Mitigação |
|---|---|---|
| S | Atacante usa o token roubado de um cliente | Tokens de curta duração; autenticação multifator; deteção de comportamento anómalo |
| T | Cliente altera o preço no pedido | O preço vem do servidor, nunca do cliente |
| R | Cliente nega ter feito a encomenda | Registo de auditoria com identidade, hora e conteúdo |
| I | Cliente A vê as encomendas do cliente B | Autorização por objeto: filtrar por cliente em cada consulta |
| D | Inundação de pedidos ao portal | Limites de pedidos no WAF/gateway; escala automática (módulo 08) |
| E | Utilizador comum chama a API de administração | Papéis verificados no servidor; APIs administrativas separadas |

**RGPD:** o portal trata dados pessoais de contactos de clientes (base legal provável: execução de contrato; **confirma com o DPO**). Requisitos derivados: exportar e apagar dados de um contacto no portal **e** no SAP; retenção definida para registos; região europeia; contrato com cada subcontratante. A DPIA a sério só seria preciso se, por exemplo, se acrescentasse localização contínua dos motoristas: nesse caso, falar com o DPO **antes** de desenhar.

## Modelo reutilizável: lista de verificação de segurança do desenho

    IDENTIDADE: IdP central e SSO? Cada API valida token e autorização em cada pedido?
      Identidades geridas em vez de palavras-passe? Acessos a grupos, âmbito estreito, privilégio temporário?
    SEGREDOS E DADOS: nenhum segredo em código, Git, imagens ou prompts? Plano de rotação?
      Cifragem em trânsito e em repouso? Dados pessoais inventariados, com base legal, retenção e região?
      Consigo encontrar, exportar e apagar os dados de uma pessoa em todos os sistemas?
    REDE E AMEAÇAS: só o ponto de entrada é público? PaaS com acesso privado?
      STRIDE nas fronteiras de confiança, com decisão registada (ADR)? OWASP Top 10 em vigor verificado?
    REGISTOS E CADEIA: quem fez o quê, a quê e quando, com retenção e acesso restrito?
      Resposta a incidentes (incluindo violação de dados)? Dependências analisadas, SBOM gerada?
    ASSISTENTES DE IA: ferramentas e contas aprovadas, dados proibidos definidos, revisão humana
      obrigatória, permissões e sandbox configurados, sem segredos acessíveis?

## Depende da empresa

| Fator | Como muda |
|---|---|
| Dimensão | Empresa pequena: usa os serviços geridos (Entra ID, Key Vault) e poucas regras bem aplicadas. Grande: equipa de segurança, SIEM, políticas centrais |
| Setor regulado | Banca, saúde ou setor público trazem normas e auditorias adicionais; confirma com a conformidade |
| IA | Algumas empresas proíbem assistentes externos, outras impõem contas corporativas ou fornecedores em cloud própria |

## Erros comuns

- Deixar a segurança para a fase final, quando já só há remendos.
- Segredos em ficheiros de configuração, no Git ou em *prompts*.
- Atribuir papéis amplos (Owner ou Contributor da subscrição) «para despachar».
- Confiar na rede interna: sem autenticação entre serviços porque «é interno».
- Tratar o RGPD como um problema só jurídico, sem requisitos técnicos (apagar, exportar, retenção).
- Registos sem retenção definida, ou com dados pessoais e segredos lá dentro.
- Adotar assistentes de IA sem política, com contas pessoais e sem revisão.

## Ligação às certificações

**Azure AZ-305.** Segundo o guia de estudo do exame (confirma a versão em vigor), o domínio **Design identity, governance, and monitoring solutions** inclui, entre outros: recomendar uma solução de **autenticação**, de **gestão de identidades**, de **autorização de acesso a recursos Azure e on-premises**, de **gestão de segredos, certificados e chaves**, de **conformidade**, de **governação de identidades** e de **registo e monitorização**. A segurança de rede aparece no domínio de infraestrutura («optimize network security»). Este módulo cobre sobretudo o primeiro domínio.

| Tema do módulo | Serviço Azure principal | Equivalente AWS |
|---|---|---|
| Diretório e SSO | Microsoft Entra ID | AWS IAM Identity Center (força de trabalho); Amazon Cognito (utilizadores de aplicações) |
| Autorização a recursos | Azure RBAC | AWS IAM (políticas e papéis) |
| Identidade de aplicações | Identidades geridas | Papéis IAM para serviços |
| Segredos e chaves | Azure Key Vault | AWS Secrets Manager; AWS KMS |
| Rede privada e proteção web | Private Link, NSG, WAF | PrivateLink, security groups, AWS WAF |
| Governação e conformidade | Azure Policy, grupos de gestão, Microsoft Defender for Cloud | AWS Organizations, AWS Config, Security Hub |
| Registos e auditoria | Azure Monitor, activity log, Microsoft Sentinel | AWS CloudTrail, CloudWatch, GuardDuty |

## Exercícios

**PRATICAR:** faz os exercícios **25 a 28** do módulo 15: rever um desenho de identidade e segredos (25), aplicar STRIDE a um fluxo (26), traduzir requisitos do RGPD em requisitos técnicos (27) e escrever uma política de governação de assistentes de IA com um ADR (28).

## Fontes oficiais

- [Microsoft Entra ID: o que é](https://learn.microsoft.com/entra/fundamentals/what-is-entra)
- [OAuth 2.0 e OpenID Connect na plataforma de identidade da Microsoft](https://learn.microsoft.com/entra/identity-platform/v2-protocols)
- [Single sign-on no Microsoft Entra ID](https://learn.microsoft.com/entra/identity/enterprise-apps/what-is-single-sign-on)
- [Azure RBAC: visão geral](https://learn.microsoft.com/azure/role-based-access-control/overview)
- [Identidades geridas para recursos Azure](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview)
- [Azure Key Vault: visão geral](https://learn.microsoft.com/azure/key-vault/general/overview)
- [Zero Trust como base de segurança (Microsoft)](https://learn.microsoft.com/security/zero-trust/zero-trust-overview)
- [Azure Well-Architected: princípios de segurança](https://learn.microsoft.com/azure/well-architected/security/principles)
- [Modelo STRIDE (Microsoft Threat Modeling Tool)](https://learn.microsoft.com/azure/security/develop/threat-modeling-tool-threats)
- [Azure Private Link](https://learn.microsoft.com/azure/private-link/private-link-overview)
- [Azure Monitor: activity log](https://learn.microsoft.com/azure/azure-monitor/essentials/activity-log)
- [Azure: residência de dados](https://azure.microsoft.com/explore/global-infrastructure/data-residency/)
- [OWASP Top 10:2025](https://top10.owasp.org/2025)
- [Bun: scripts de ciclo de vida e trustedDependencies](https://bun.sh/docs/install/lifecycle)
- [Bun: bun audit](https://bun.sh/docs/install/audit)
- [SLSA: sobre](https://slsa.dev/spec/v1.0/about)
- [NIST SP 800-207, Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final)
- [Comité Europeu para a Proteção de Dados (EDPB)](https://www.edpb.europa.eu/edpb_pt)
- [EDPB: orientações e boas práticas](https://www.edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_pt)
- [Claude Code: segurança](https://code.claude.com/docs/en/security)
- [Claude Code: utilização de dados](https://code.claude.com/docs/en/data-usage)
- [Claude Code: permissões](https://code.claude.com/docs/en/permissions)
- [Codex: aprovações e segurança](https://developers.openai.com/codex/agent-approvals-security)
- [Guia de estudo do exame AZ-305](https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-305)
- [AWS IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)
