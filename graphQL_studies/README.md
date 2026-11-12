# Mini-Curso de GraphQL de A a Z

Curso prático de GraphQL em português europeu, do primeiro pedido à produção, com um projeto fio condutor (API de biblioteca). Cada módulo tem a aula em Markdown, o documento Word completo e um PowerPoint com os pontos principais. Os exemplos de Node foram executados com Apollo Server 5, `graphql` 16, DataLoader e Apollo Client 4; as partes não executadas estão assinaladas nas aulas.

## Percurso

| Pasta | Módulo | Aula | Word | PowerPoint | Conteúdo |
|---|---|---|---|---|---|
| [00-Introducao](00-Introducao) | 00 | [Aula](00-Introducao/00-Introducao-e-Mapa-do-Curso.md) | [Word](00-Introducao/00-Introducao-e-Mapa-do-Curso.docx) | [PowerPoint](00-Introducao/00-Introducao-e-Mapa-do-Curso.pptx) | O que é o GraphQL, GraphQL vs REST, projeto fio condutor |
| [01-Linguagem-de-Consulta](01-Linguagem-de-Consulta) | 01 | [Aula](01-Linguagem-de-Consulta/01-Linguagem-de-Consulta.md) | [Word](01-Linguagem-de-Consulta/01-Linguagem-de-Consulta.docx) | [PowerPoint](01-Linguagem-de-Consulta/01-Linguagem-de-Consulta.pptx) | Campos, argumentos, aliases, variáveis, fragments, diretivas |
| [02-Schema-e-SDL](02-Schema-e-SDL) | 02 | [Aula](02-Schema-e-SDL/02-Schema-e-SDL.md) | [Word](02-Schema-e-SDL/02-Schema-e-SDL.docx) | [PowerPoint](02-Schema-e-SDL/02-Schema-e-SDL.pptx) | Tipos, escalares, enums, interfaces, uniões, evolução do schema |
| [03-Mutations-e-Subscriptions](03-Mutations-e-Subscriptions) | 03 | [Aula](03-Mutations-e-Subscriptions/03-Mutations-e-Subscriptions.md) | [Word](03-Mutations-e-Subscriptions/03-Mutations-e-Subscriptions.docx) | [PowerPoint](03-Mutations-e-Subscriptions/03-Mutations-e-Subscriptions.pptx) | Mutations, payloads, subscriptions e transportes |
| [04-Resolvers-e-Servidor](04-Resolvers-e-Servidor) | 04 | [Aula](04-Resolvers-e-Servidor/04-Resolvers-e-Servidor.md) | [Word](04-Resolvers-e-Servidor/04-Resolvers-e-Servidor.docx) | [PowerPoint](04-Resolvers-e-Servidor/04-Resolvers-e-Servidor.pptx) | Resolvers, contexto e Apollo Server 5 |
| [05-Cliente-GraphQL](05-Cliente-GraphQL) | 05 | [Aula](05-Cliente-GraphQL/05-Cliente-GraphQL.md) | [Word](05-Cliente-GraphQL/05-Cliente-GraphQL.docx) | [PowerPoint](05-Cliente-GraphQL/05-Cliente-GraphQL.pptx) | fetch e Apollo Client 4, cache normalizada, erros |
| [06-Paginacao-e-Relay](06-Paginacao-e-Relay) | 06 | [Aula](06-Paginacao-e-Relay/06-Paginacao-e-Relay.md) | [Word](06-Paginacao-e-Relay/06-Paginacao-e-Relay.docx) | [PowerPoint](06-Paginacao-e-Relay/06-Paginacao-e-Relay.pptx) | Offset, cursores e connections do Relay |
| [07-Erros-e-Validacao](07-Erros-e-Validacao) | 07 | [Aula](07-Erros-e-Validacao/07-Erros-e-Validacao.md) | [Word](07-Erros-e-Validacao/07-Erros-e-Validacao.docx) | [PowerPoint](07-Erros-e-Validacao/07-Erros-e-Validacao.pptx) | errors, null, GraphQLError e erros de domínio |
| [08-Autenticacao-e-Autorizacao](08-Autenticacao-e-Autorizacao) | 08 | [Aula](08-Autenticacao-e-Autorizacao/08-Autenticacao-e-Autorizacao.md) | [Word](08-Autenticacao-e-Autorizacao/08-Autenticacao-e-Autorizacao.docx) | [PowerPoint](08-Autenticacao-e-Autorizacao/08-Autenticacao-e-Autorizacao.pptx) | Contexto, papéis, autorização por objeto e campo |
| [09-Desempenho-e-Cache](09-Desempenho-e-Cache) | 09 | [Aula](09-Desempenho-e-Cache/09-Desempenho-e-Cache.md) | [Word](09-Desempenho-e-Cache/09-Desempenho-e-Cache.docx) | [PowerPoint](09-Desempenho-e-Cache/09-Desempenho-e-Cache.pptx) | N+1, DataLoader, limites e cache |
| [10-Tooling-e-Producao](10-Tooling-e-Producao) | 10 | [Aula](10-Tooling-e-Producao/10-Tooling-e-Producao.md) | [Word](10-Tooling-e-Producao/10-Tooling-e-Producao.docx) | [PowerPoint](10-Tooling-e-Producao/10-Tooling-e-Producao.pptx) | Codegen, testes, federation, lista de produção |
| [11-Exercicios-Praticos](11-Exercicios-Praticos) | 11 | [Aula](11-Exercicios-Praticos/11-Exercicios.md) | [Word](11-Exercicios-Praticos/11-Exercicios.docx) | [PowerPoint](11-Exercicios-Praticos/11-Exercicios.pptx) | 43 exercícios, do nível inicial ao projeto final |
| [12-Cheat-Sheet](12-Cheat-Sheet) | 12 | [Aula](12-Cheat-Sheet/12-Consulta-Rapida.md) | [Word](12-Cheat-Sheet/12-Consulta-Rapida.docx) | [PowerPoint](12-Cheat-Sheet/12-Consulta-Rapida.pptx) | Sintaxe, Apollo e padrões numa página |
| [13-Gabarito](13-Gabarito) | 13 | [Aula](13-Gabarito/13-Solucoes.md) | [Word](13-Gabarito/13-Solucoes.docx) | [PowerPoint](13-Gabarito/13-Solucoes.pptx) | Soluções comentadas e critérios do projeto final |
| [14-Servidor-de-Estudo](14-Servidor-de-Estudo) | 14 | [Aula](14-Servidor-de-Estudo/14-Servidor-de-Estudo.md) | [Word](14-Servidor-de-Estudo/14-Servidor-de-Estudo.docx) | [PowerPoint](14-Servidor-de-Estudo/14-Servidor-de-Estudo.pptx) | Servidor completo com dados em memória e pedidos para o REST Client |

## Como estudar

1. Percorre os módulos 00 a 10 com um servidor de estudo (módulo 04).
2. Resolve os exercícios do módulo 11 sem consultar o gabarito (cada aula indica quais).
3. Usa o módulo 12 como referência e o módulo 13 para rever as soluções.
4. O módulo 14 traz um servidor pronto a correr (`14-Servidor-de-Estudo/servidor`) e pedidos `.http` para o REST Client.

## Regenerar os ficheiros Office

    pip install python-docx python-pptx
    python tools/build_course_artifacts.py
    python tools/build_course_artifacts.py --only 04,05

## Convenções

- **DICA** sugere uma forma prática de trabalhar.
- **ATENÇÃO** assinala riscos para os dados ou para a segurança.
- **NOTA** acrescenta contexto.
- **PRATICAR** remete para um exercício do módulo 11.

## Documentação oficial

- [graphql.org](https://graphql.org/learn/)
- [Especificação](https://spec.graphql.org/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server)
- [Apollo Client](https://www.apollographql.com/docs/react)
