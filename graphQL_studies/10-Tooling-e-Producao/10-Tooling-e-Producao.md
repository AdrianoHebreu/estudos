# 10 Tooling e produção

## Ferramentas do dia a dia

| Ferramenta | Para quê |
|---|---|
| **Apollo Sandbox** / GraphiQL | Explorar o schema e testar consultas no browser |
| **Postman** | Coleções de pedidos GraphQL, com variáveis e testes |
| **GraphQL Code Generator** | Gerar tipos TypeScript a partir do schema e das consultas |
| **ESLint (`@graphql-eslint`)** | Verificar consultas e schema no editor e no CI |
| **Apollo Rover / GraphOS** | Verificar alterações do schema e orquestrar federation |

## Schema primeiro ou código primeiro

| Abordagem | Como funciona | Quando |
|---|---|---|
| **Schema-first** | Escreves a SDL e depois os resolvers | Equipas que partilham o contrato, o estilo deste curso |
| **Code-first** | Defines os tipos em código (Pothos, Nexus, TypeGraphQL) e o schema é gerado | Quem quer segurança de tipos de ponta a ponta no servidor |

Nenhuma é melhor em geral. Em ambas, a SDL final é o contrato que os clientes vêem.

## Tipos TypeScript com Code Generator

O **GraphQL Code Generator** lê o schema e as consultas do cliente e escreve tipos TypeScript, de modo que um campo mal escrito falha **na compilação**.

    npm install -D @graphql-codegen/cli @graphql-codegen/client-preset

    // codegen.ts
    import type { CodegenConfig } from '@graphql-codegen/cli'

    const config: CodegenConfig = {
      schema: 'http://localhost:4000/',
      documents: ['src/**/*.tsx'],
      generates: { './src/gql/': { preset: 'client' } },
    }
    export default config

    npx graphql-codegen

**NOTA:** a configuração acima segue a documentação do Code Generator e não foi executada neste curso; confirma os nomes dos pacotes na versão atual antes de a usares.

**DICA:** corre o codegen no CI e falha o build se os ficheiros gerados ficarem diferentes dos versionados. Assim, ninguém publica um cliente desatualizado em relação ao schema.

## Testar a API

O Apollo Server permite executar operações **sem HTTP**, com `executeOperation`. É rápido e ideal para testes automáticos (executado e verificado):

    const server = new ApolloServer({ typeDefs, resolvers })
    await server.start()

    const resposta = await server.executeOperation(
      { query: 'query ($id: ID!) { livro(id: $id) { titulo } }', variables: { id: '1' } },
      { contextValue: { utilizador: { id: 'u1', papel: 'ADMIN' } } },
    )

    // resposta.body.kind === 'single'
    const { data, errors } = resposta.body.singleResult

O segundo argumento permite **injetar o contexto**, por exemplo um utilizador de teste. Assim testas permissões sem tokens reais. Testa, no mínimo:

- consultas e mutations principais (caminho feliz);
- os erros esperados (`NOT_FOUND`, `FORBIDDEN`);
- as regras de autorização;
- a paginação nos limites (lista vazia, última página).

## Evolução segura do schema

Alterações **compatíveis** (acrescentar campos, tipos e argumentos opcionais) não partem clientes. As **incompatíveis** (módulo 02) partem. Antes de publicar:

1. compara o schema novo com o atual (por exemplo, com `graphql-inspector` ou `rover`);
2. consulta quais campos os clientes usam (métricas por operação);
3. marca com `@deprecated` e dá prazo antes de remover.

## Federation e schemas grandes

Quando uma API cresce, vários serviços podem contribuir com partes do mesmo grafo. Duas abordagens:

| Abordagem | Ideia |
|---|---|
| **Federation** (Apollo) | Cada subgrafo declara a sua parte; um *router* junta-as num supergrafo único para o cliente |
| **Schema stitching** | Um servidor compõe os schemas de outros serviços |

Exemplo de entidade partilhada em Federation 2: o serviço de críticas acrescenta campos ao `Livro` do serviço de catálogo:

    # subgrafo de catálogo
    type Livro @key(fields: "id") {
      id: ID!
      titulo: String!
    }

    # subgrafo de críticas
    type Livro @key(fields: "id") {
      id: ID!
      criticas: [Critica!]!
    }

**NOTA:** federation traz custo operacional (router, composição, observabilidade). Para uma equipa e uma base de código, um único servidor GraphQL costuma bastar.

## Observabilidade

Em produção, precisas de saber o que acontece. O mínimo:

| Sinal | O que registar |
|---|---|
| Registos | Nome da operação, duração, erros com `path` e `code` |
| Métricas | Pedidos por operação, taxa de erros, latência (p50, p95, p99) |
| Traces | Tempo por resolver, para encontrar N+1 |

Dá **nome a todas as operações** nos clientes: sem nome, não consegues distinguir pedidos nos painéis.

## Lista de verificação para produção

- [ ] `NODE_ENV=production` (sem stacktraces nem introspeção)
- [ ] Autenticação no contexto e autorização por campo e por objeto (módulo 08)
- [ ] Limites de profundidade, complexidade e tamanho de página (módulos 06 e 09)
- [ ] DataLoader nas relações (módulo 09)
- [ ] Erros consistentes com `extensions.code` (módulo 07)
- [ ] CORS e HTTPS configurados
- [ ] Verificação do schema no CI contra alterações incompatíveis
- [ ] Testes com `executeOperation`
- [ ] Registos, métricas e traces por nome de operação
- [ ] Encerramento limpo do servidor (`await server.stop()`) em *deploys*

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Tipos gerados desatualizados | Codegen não corre no CI |
| `executeOperation` devolve `body.kind` diferente de `single` | Resposta incremental; confirma `kind` antes de ler `singleResult` |
| Clientes partem depois de um deploy | Alteração incompatível sem verificação do schema |
| Não se sabe quem causa a lentidão | Operações sem nome e sem traces |
| Ambiente de teste com utilizadores reais | Contexto não injetável nos testes |
| Introspeção ativa em produção | `NODE_ENV` não definido |

## Exercícios

**PRATICAR:** exercícios 39 a 42 do módulo 11 (testes com `executeOperation`, tipos gerados, schema check, lista de produção).

## Fontes oficiais

- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [Testar com Apollo Server](https://www.apollographql.com/docs/apollo-server/testing/testing)
- [Federation do Apollo](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/federation)
- [GraphQL Inspector](https://the-guild.dev/graphql/inspector)
