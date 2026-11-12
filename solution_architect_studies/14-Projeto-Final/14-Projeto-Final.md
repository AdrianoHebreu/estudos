# 14 Projeto final

## O que vais fazer

Neste módulo juntas tudo o que aprendeste numa **solução completa**, documentada e defendida. O resultado é o teu **portfólio de arquitetura**: um conjunto de documentos que podes mostrar numa entrevista, numa revisão interna ou usar como modelo no trabalho.

Podes escolher entre dois caminhos:

| Caminho | Quando escolher | Ponto de partida |
|---|---|---|
| **A. Casa Nova Distribuição** | Queres treinar sem expor informação da empresa | O caso do módulo 00 e os requisitos do módulo 02 (RF-01 a RF-12, QA-01 a QA-08) |
| **B. Um problema real teu** | Tens um projeto concreto na empresa | Um problema de negócio atual, **anonimizado** se o partilhares fora da equipa |

**ATENÇÃO:** no caminho B, não incluas dados confidenciais, nomes de clientes, credenciais, preços de contratos nem detalhes de segurança nos documentos que partilhares fora da empresa. Confirma as regras da tua organização antes de usar um assistente de IA com esse material (módulo 07).

## O que entregas

O projeto tem sete entregáveis. Cada um corresponde a um módulo, e podes reutilizar os modelos desse módulo.

| # | Entregável | Módulo de apoio | Tamanho indicativo |
|---|---|---|---|
| 1 | **Contexto e requisitos**: stakeholders, restrições, requisitos funcionais, pelo menos cinco atributos de qualidade com cenários mensuráveis | 02 | 2 a 3 páginas |
| 2 | **Decisão de estilo arquitetural**, com alternativas consideradas, justificada pelos atributos de qualidade | 03 | 1 página (ADR) |
| 3 | **Diagramas C4** de contexto e de contentores, mais um diagrama de sequência do fluxo mais crítico | 04 | 3 diagramas |
| 4 | **Dados e integração**: onde vive cada dado, contratos das APIs principais, como se liga ao SAP e às aplicações existentes | 05 | 2 páginas |
| 5 | **Cloud, segurança e operação**: infraestrutura de destino, identidade, tratamento de dados pessoais, resiliência, recuperação, observabilidade e entrega | 06 a 09 | 3 a 4 páginas |
| 6 | **Decisão económica e plano de migração**: comparação construir/comprar, estimativa de custo com pressupostos, faseamento, riscos | 10 e 11 | 2 a 3 páginas |
| 7 | **Apresentação à direção**: uma página ou cinco slides, e um guião de dez minutos | 12 | 1 página ou 5 slides |

No fim reúnes tudo num **documento de solução** com um índice e uma lista de decisões em aberto.

## Passo a passo recomendado

Não tentes fazer tudo de uma vez. Segue esta ordem, que é a mesma que um arquiteto segue num projeto real.

| Fase | O que fazes | Pergunta de controlo |
|---|---|---|
| 1. Compreender | Entregável 1 | Consigo explicar o problema em três frases a alguém do negócio? |
| 2. Escolher o rumo | Entregáveis 2 e 3 | Cada atributo de qualidade importante tem uma decisão que o serve? |
| 3. Detalhar | Entregáveis 4 e 5 | Sei onde falha cada peça e o que acontece ao negócio quando falha? |
| 4. Provar que compensa | Entregável 6 | A solução cabe no orçamento, no prazo e sem parar o que funciona hoje? |
| 5. Convencer | Entregável 7 | Alguém que não é técnico percebe o que lhe peço e porquê? |
| 6. Rever | Critérios abaixo | Falta alguma decisão registada? |

**DICA:** escreve o entregável 7 **antes de o dares por terminado**, mesmo que em rascunho. Se não conseguires explicar a solução numa página, é sinal de que ainda há decisões por clarificar.

## Restrições do projeto

Para não desenhares no vazio, cumpre estas restrições (adapta-as no caminho B):

- O sistema existente **não pode parar** durante a migração.
- A equipa interna é pequena: escolhe soluções que ela consiga operar.
- A solução de destino é **Azure**, mas o desenho deve dizer o que mudaria noutro fornecedor.
- Há dados pessoais: aplica o que aprendeste no módulo 07.
- Pelo menos **uma decisão** deve ser explicitamente contra a opção «mais moderna», com o motivo registado.

## Critérios de avaliação

Usa esta grelha para te avaliares. Cada critério vale de 0 a 3 (0 = ausente, 1 = fraco, 2 = bom, 3 = muito bom).

| Critério | O que procurar |
|---|---|
| Requisitos mensuráveis | Os atributos de qualidade têm números e forma de medir, e não adjetivos |
| Rastreabilidade | Cada decisão importante liga-se a um requisito ou restrição |
| Alternativas consideradas | Pelo menos duas opções por decisão relevante, com prós e contras honestos |
| Trade-offs explícitos | O que se perde com cada escolha está escrito |
| Diagramas claros | Cada diagrama tem título, legenda e um público definido |
| Dados e integração | Fica claro quem é a fonte de verdade de cada dado e o que acontece quando uma integração falha |
| Segurança e privacidade | Identidade, segredos, dados pessoais e registos de acesso estão tratados |
| Operação | Há objetivos de disponibilidade e recuperação, monitorização e processo de entrega |
| Custo e risco | Os pressupostos da estimativa estão visíveis e os riscos têm resposta |
| Migração segura | O plano permite voltar atrás em cada fase |
| Comunicação | A página para a direção é clara, curta e pede uma decisão concreta |

Somando 11 critérios de 0 a 3, o máximo é 33. Como referência para ti: até 16 há lacunas importantes, entre 17 e 26 o trabalho está sólido, e a partir de 27 está pronto para mostrar.

## Estrutura sugerida do documento de solução

    1. Resumo executivo (uma página)
    2. Contexto, stakeholders e restrições
    3. Requisitos e atributos de qualidade
    4. Decisões de arquitetura (ADRs)
    5. Vista de contexto e de contentores (C4)
    6. Dados e integração
    7. Segurança e privacidade
    8. Resiliência, recuperação e observabilidade
    9. Entrega e operação
    10. Custos e comparação de opções
    11. Plano de migração e riscos
    12. Questões em aberto e próximos passos

## Erros comuns neste projeto

| Erro | Como evitar |
|---|---|
| Começar pelos serviços cloud em vez dos requisitos | Faz o entregável 1 primeiro e só depois escolhe tecnologia |
| Desenhar a solução «ideal» sem custo nem prazo | Começa pelo mínimo que cumpre as metas e acrescenta só com justificação |
| Diagramas com demasiados detalhes | Um diagrama, um público, uma mensagem |
| Decisões sem alternativas | Escreve sempre a opção que rejeitaste e porquê |
| Ignorar o que já existe | A migração e a convivência com o SAP e as aplicações Delphi são parte do desenho |
| Apresentação só técnica | Fala de risco, custo e prazo, que é o que a direção decide |

## Depende da empresa

- **Empresas grandes** esperam passagem por comités de arquitetura, modelos de documento obrigatórios e avaliação formal de segurança: junta essas etapas ao plano.
- **Empresas pequenas** valorizam menos papel e mais decisões rápidas: reduz cada entregável a uma página e foca-te nos ADRs.
- **Setores regulados** pedem rastreabilidade de decisões e auditoria: o registo de ADRs passa a ser obrigatório e não opcional.

## Exercícios

**PRATICAR:** o exercício 53 do módulo 15 é este projeto. Faz-o por fases e guarda cada entregável numa pasta tua. O módulo 17 traz a grelha de avaliação e um exemplo do aspeto esperado de cada entregável.

## Fontes oficiais

- [The C4 model](https://c4model.com/)
- [arc42, modelo de documentação de arquitetura](https://arc42.org/)
- [Azure Architecture Center](https://learn.microsoft.com/azure/architecture/)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Exame AZ-305](https://learn.microsoft.com/en-us/credentials/certifications/exams/az-305/)
