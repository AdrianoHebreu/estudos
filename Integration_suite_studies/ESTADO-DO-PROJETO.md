# Estado do projeto: Mini-Curso de SAP Integration Suite

**Estado (2026-11-23): curso completo e verificado ao nível da estrutura e dos links; profundidade a melhorar.** Módulos 00 a 15 em Markdown, Word e PowerPoint, com 34 exercícios e soluções e um projeto final. O índice e os comandos dos exemplos estão no [README](README.md).

## 1. Resumo

- Curso em português europeu sobre o **SAP Integration Suite** (SAP Business Technology Platform), para developers e arquitetos de uma empresa com SAP e Azure.
- Fio condutor: a **Casa Nova Distribuição** (curso `solution_architect_studies`): encomendas entre um portal, o iFlow e um ERP simulado.
- Gerado pelo gerador Python de `bun_studies/tools` (copiado), com a consulta rápida em formato compacto.
- **Só Groovy** nos scripts (é o que a SAP recomenda). Sem JavaScript.
- Verificável num **trial** do Integration Suite (Cloud Foundry, região us10). Nenhuma credencial, chave de serviço nem identificador do tenant entra em ficheiros do curso nem no Git; os zips exportados ficam fora do repositório.

## 2. Módulos

| Módulo | Tema | Linhas | Exercícios |
|---|---|---|---|
| 00 | Introdução | 58 | n/a |
| 01 | Cloud Integration e mensagens | 59 | 1 a 3 |
| 02 | Transformações e Groovy | 88 | 4 a 6 |
| 03 | Conectividade e adaptadores | 49 | 7 a 9 |
| 04 | Padrões e erros | 59 | 10 a 12 |
| 05 | API Management | 47 | 13 a 15 |
| 06 | Segurança, monitorização e entrega | 55 | 16 a 18 |
| 07 | Eventos | 52 | 19 a 21 |
| 08 | B2B (Integration Advisor) | 49 | 22 a 24 |
| 09 | Open Connectors | 45 | 25 a 27 |
| 10 | Modernização e migração | 43 | 28 a 30 |
| 11 | S/4HANA, Azure e IA | 48 | 31 a 33 |
| 12 | Projeto final | 84 | 34 |
| 13 a 15 | Exercícios, consulta rápida e gabarito | 78, 39 e 79 | n/a |

## 3. O que foi verificado

- **Estrutura:** 16 aulas, 16 Word e 16 PowerPoint; `lint` com 0 problemas; sem carateres de controlo.
- **Teste no tenant (iFlow «Groovy_Ola»):** Start Timer, Content Modifier, Groovy e End. O monitor (Message Content) mostra a carga antes de cada passo; no End o JSON ficou em maiúsculas. O campo «Script Function» pode ficar vazio. O editor avisa «Upgrade the groovy script step to version 2.0» (o exportado usa GroovyScript 1.1.2). O zip exportado tem o fluxo em XML BPMN2 (`.iflw`), o script, `parameters.prop(def)`, `metainfo.prop`, `.project` e `META-INF/MANIFEST.MF`, que importa pacotes `org.apache.camel` e `org.apache.cxf` (motor baseado em Camel).
- **Links (2026-11-23): 35 de 35 verificados.** O `curl` não consegue validar o `help.sap.com`, porque devolve a mesma página vazia (1160 bytes) para páginas reais e inventadas. A verificação fez-se no Chrome, depois de o JavaScript renderizar: as páginas reais têm título específico do tema e uma página inventada cai no título genérico. Os 26 links do `help.sap.com` têm título correto (incluindo os com sufixos como `?q=...`), o `api.sap.com` é o SAP Business Accelerator Hub, o PDF da SAP existe, e os de `developers.sap.com`, `learning.sap.com` e `learn.microsoft.com` respondem com os títulos certos. Os endereços `127.0.0.1` são do simulador local do curso.
- **Exemplos locais:** o `ESTADO` anterior dizia que os exemplos Groovy, XML e XSLT e os cinco cenários HTTP do simulador foram verificados localmente. Esta revisão **não os reexecutou** (não há Groovy instalado nesta máquina).

## 4. Limites conhecidos

- **Profundidade:** aulas de 39 a 88 linhas (nos outros cursos, 220 a 340). Exercícios e soluções telegráficos, sem níveis.
- **Módulos 03 a 11:** sobretudo conceptuais, sem conteúdo verificado no tenant. O que se pode verificar no trial (Router, tratamento de erros, API Management, B2B, Modernize) depende de o utilizador construir e exportar os fluxos.
- A documentação da SAP muda depressa: reverificar os links e os nomes de passos periodicamente.

## 5. Como melhorar (método que funciona e custa pouco)

1. **O utilizador constrói e exporta** um fluxo por tema (zip) e/ou envia o resultado do monitor em texto.
2. O agente lê o `.iflw` e os scripts e escreve a aula sobre o que existe, com a navegação real do tenant (menus, separadores, nomes de campos) e exercícios com níveis e resultado esperado.
3. Começar pelos módulos 00 a 02 (ver o exemplo de melhoria no módulo 01) e escalar módulo a módulo, no máximo 3 agentes de cada vez.
4. Antes de gerar: `lint`, procurar carateres de controlo, apagar `_rascunho/` e regenerar só os módulos alterados (`--only`).

## 6. Regras

Português europeu e forma «tu»; callouts DICA, ATENÇÃO, NOTA e PRATICAR; código em blocos indentados com 4 espaços; sem itálico em títulos nem dentro de negrito; sem código dentro de negrito; sem `|` dentro de células; sem acento grave solto; nunca sequências de escape em texto; cada aula termina com Exercícios e Fontes oficiais (links verificados, no `help.sap.com` pelo título da página renderizada); nada afirmado sem fonte lida ou execução; no máximo 3 agentes de cada vez; nunca terminar processos por nome ou filtro; ver `CLAUDE.md` da raiz.
