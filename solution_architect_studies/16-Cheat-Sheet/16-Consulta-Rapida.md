# 16 Consulta rápida

Uma página por tema para usares no dia a dia. Os detalhes estão nos módulos indicados.

## As perguntas do arquiteto (módulos 01 e 02)

| Pergunta | Para quê |
|---|---|
| Que problema de negócio estamos a resolver, e como saberemos que ficou resolvido? | Evitar construir a coisa errada |
| Quem é afetado e quem decide? | Mapa de stakeholders |
| O que **não pode** mudar? | Restrições |
| O que aceitamos perder para ganhar o essencial? | Trade-offs |
| O que acontece quando isto falha? | Resiliência |
| Quanto custa ter e manter, e não só construir? | TCO |
| Como voltamos atrás? | Reversibilidade |

## Requisitos (módulo 02)

| Tipo | Pergunta-guia | Exemplo de forma mensurável |
|---|---|---|
| Funcional | O que o sistema faz? | «O cliente consulta o stock de um artigo por delegação» |
| Desempenho | Com que carga, em quanto tempo? | «Com 200 utilizadores, ≤ 2 s para 95% dos pedidos» |
| Disponibilidade | Quanto tempo pode estar em baixo? | «99,9% por mês» |
| Recuperação | Quanto tempo e quantos dados posso perder? | «RTO 4 h, RPO 15 min» |
| Segurança | Quem acede a quê, e fica registado? | «Cada utilizador só vê o seu perfil; acessos registados» |
| Modificabilidade | Quanto custa mudar? | «Novo método de entrega em ≤ 5 dias úteis» |

**Cenário de qualidade:** fonte do estímulo, estímulo, ambiente, artefacto, resposta e medida de resposta.

**Priorização (MoSCoW):** Must, Should, Could, Won't (desta vez).

## Estilos de arquitetura (módulo 03)

| Estilo | Quando faz sentido | Cuidado |
|---|---|---|
| Monólito (modular) | Equipa pequena, domínio ainda a ser descoberto | Fronteiras internas difusas |
| Camadas | Aplicações de negócio clássicas | Camadas que só repassam chamadas |
| Hexagonal | Muitas integrações; isolar o domínio | Mais abstração para manter |
| SOA / serviços | Reutilizar capacidades entre sistemas | Governação pesada |
| Microsserviços | Várias equipas autónomas, escala diferenciada | Custo operacional alto; erro comum numa equipa pequena |
| Orientada a eventos | Reagir a mudanças, desacoplar sistemas | Ordem, duplicados, depuração |
| Serverless | Cargas irregulares, pouca operação | Limites do serviço, dependência do fornecedor |

**Regra:** escolhe o estilo **mais simples** que cumpre as metas e regista o porquê. Quando uma operação precisa de consistência forte, não a trates como eventual.

## Documentar (módulo 04)

| Modelo C4 | O que mostra |
|---|---|
| 1. Contexto | O sistema, os utilizadores e os sistemas vizinhos |
| 2. Contentores | Aplicações e armazenamentos que o compõem |
| 3. Componentes | Partes internas de um contentor |
| 4. Código | Só quando útil |

**Modelo de ADR:**

    Título: ADR-NNN <decisão em poucas palavras>
    Estado: proposto / aceite / substituído por ADR-MMM
    Contexto: o problema e as forças em jogo
    Opções consideradas: A, B, C (com prós e contras)
    Decisão: o que escolhemos
    Consequências: o que ganhamos, o que perdemos, o que fica por fazer
    Gatilho de revisão: quando voltamos a olhar para isto

## Dados e integração (módulo 05)

| Escolha | Perguntas |
|---|---|
| Armazenamento | Estrutura fixa ou flexível? Transações? Leitura vs escrita? Consistência exigida? |
| API | Quem consome? Contrato escrito (OpenAPI)? Como se versiona? |
| Síncrono vs assíncrono | O chamador precisa de resposta agora? O destino aguenta a carga? |
| Mensagens | Ordem importa? Pode haver duplicados? A operação é idempotente? |
| Fonte de verdade | Qual sistema é o dono de cada dado? |

## Cloud (módulo 06)

| Pergunta | Notas |
|---|---|
| Quem gere o quê? | IaaS, PaaS e SaaS dividem responsabilidades de forma diferente |
| Onde corre? | Região e zonas de disponibilidade |
| Como se liga ao on-premises? | VPN ou ligação dedicada |
| Como se governa? | Subscrições, políticas, etiquetas, custos |
| Como se repete? | Infraestrutura como código |

## Segurança (módulo 07)

| Princípio | Em prática |
|---|---|
| Menor privilégio | Cada identidade só tem o acesso de que precisa |
| Defesa em profundidade | Várias barreiras, nenhuma única |
| Segredos fora do código | Cofre de segredos e identidades geridas |
| Modelar ameaças (STRIDE) | Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege |
| Dados pessoais | Finalidade, minimização, acesso registado, retenção definida |

## Operação (módulo 08)

| Conceito | Definição curta |
|---|---|
| SLI | O que medimos |
| SLO | O objetivo interno sobre o SLI |
| SLA | O compromisso contratual |
| RTO | Tempo máximo para recuperar |
| RPO | Perda máxima de dados, medida em tempo |

**SLA composto:** componentes em série multiplicam as disponibilidades, por isso o conjunto fica **abaixo** do pior componente. Padrões de resiliência: timeout, retry com espera crescente, circuit breaker, bulkhead, degradação graciosa.

## Entrega (módulo 09)

| Prática | Para quê |
|---|---|
| CI | Cada alteração é compilada e testada |
| CD | Cada versão aprovada pode ser implantada por pipeline |
| Blue/green, canary, feature flags | Reduzir o risco de uma versão nova |
| Métricas DORA | Medir a capacidade de entrega da equipa |
| Revisão humana de código gerado por IA | Quem aprova responde pelo resultado |

## Decisão e custo (módulo 10)

| Ferramenta | Uso |
|---|---|
| Construir / comprar / configurar | Decisão de base |
| TCO | Custo total ao longo da vida, e não só o custo inicial |
| Matriz ponderada | Comparar opções com critérios e pesos explícitos |
| Business case | Custo, benefício, prazo de retorno e risco |
| Dívida técnica | Registar, estimar o custo de a manter e priorizar |

## Migração (módulo 11)

| Ideia | Resumo |
|---|---|
| Estratégias | Manter, retirar, mover como está, adaptar, reescrever, substituir. A terminologia difere entre Azure e AWS |
| Strangler fig | Substituir por partes, desviando o tráfego aos poucos |
| Camada anti-corrupção | Proteger o desenho novo do modelo do sistema antigo |
| Cutover | Plano de passagem com **ponto de regresso** em cada fase |

## Comunicação (módulo 12)

| Público | O que precisa |
|---|---|
| Direção | Decisão pedida, custo, risco, prazo |
| Negócio | Impacto nos processos e no cliente |
| Equipas técnicas | Contexto, restrições e margem para decidir |
| Segurança e conformidade | Dados, acessos, riscos e controlos |

**Regra:** começa pela conclusão e pelo pedido, e só depois explica o raciocínio.

## Certificações (módulos 03 a 11)

| Azure | AWS |
|---|---|
| Azure Solutions Architect Expert (exame AZ-305; exige também o AZ-104) | AWS Certified Solutions Architect (Associate e Professional) |

Domínios do AZ-305: identidade, governação e monitorização; armazenamento de dados; continuidade de negócio; infraestrutura.

**ATENÇÃO:** os exames mudam. Confirma a lista de competências atual nas páginas oficiais.

## Lista de verificação antes de apresentar uma solução

1. O problema e o resultado esperado estão escritos?
2. Cada requisito de qualidade tem um número?
3. Cada decisão importante tem alternativas e um ADR?
4. Está claro quem é a fonte de verdade de cada dado?
5. Sei o que acontece quando cada integração falha?
6. Segurança e dados pessoais estão tratados?
7. Há objetivos de recuperação e monitorização?
8. O custo tem pressupostos visíveis?
9. A migração permite voltar atrás?
10. Quem decide sabe o que lhe peço?

## Exercícios

**PRATICAR:** usa a lista de verificação final para rever o teu projeto (módulo 14) antes de o apresentares.

## Fontes oficiais

- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [The C4 model](https://c4model.com/)
- [Exame AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/exams/az-305/)
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/)
