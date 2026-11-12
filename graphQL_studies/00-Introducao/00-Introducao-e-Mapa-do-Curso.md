# 00 Introdução e mapa do curso

## O que é o GraphQL

O GraphQL é uma **linguagem de consulta para APIs** e um **runtime** que executa essas consultas contra os teus dados. Foi criado pelo Facebook em 2012, tornado público em 2015 e hoje é mantido pela GraphQL Foundation, com uma [especificação aberta](https://spec.graphql.org/).

A ideia central: **o cliente descreve exatamente os dados de que precisa e o servidor devolve só isso**, num único pedido. Não é uma base de dados nem uma biblioteca: é um contrato entre cliente e servidor, independente da linguagem e do armazenamento.

## GraphQL vs REST

| Aspeto | REST | GraphQL |
|---|---|---|
| Endpoints | Vários (`/livros`, `/autores/1`) | Normalmente um só (`/graphql`) |
| Forma da resposta | Fixa, decidida pelo servidor | Decidida pelo cliente em cada pedido |
| Over-fetching | Comum (vêm campos que não usas) | Evitado: pedes só os campos necessários |
| Under-fetching | Comum (vários pedidos em cadeia) | Evitado: relações num só pedido |
| Contrato | OpenAPI, opcional | Schema tipado, obrigatório |
| Versões | `/v1`, `/v2` | Evolução do schema (campos novos, `@deprecated`) |
| Cache HTTP | Simples (GET + URL) | Mais trabalhoso (ver módulo 09) |

**NOTA:** GraphQL não substitui REST em todos os casos. Para APIs simples, uploads de ficheiros ou cache HTTP agressivo, REST continua a ser uma escolha muito razoável.

## Como as peças se ligam

Um pedido GraphQL percorre sempre o mesmo caminho:

1. O cliente envia uma **operação** (query, mutation ou subscription) em texto, normalmente por `POST` com JSON.
2. O servidor **analisa** o texto e **valida-o** contra o schema.
3. O servidor **executa** a operação: para cada campo pedido chama um **resolver**.
4. A resposta é JSON com a mesma forma da consulta, em `data`, e eventuais problemas em `errors`.

Um pedido e a sua resposta:

    # pedido
    query {
      livro(id: "1") {
        titulo
        autor { nome }
      }
    }

    // resposta
    {
      "data": {
        "livro": {
          "titulo": "Ensaio sobre a Cegueira",
          "autor": { "nome": "José Saramago" }
        }
      }
    }

Repara que a resposta tem **exatamente a forma da consulta**. Esta previsibilidade é o maior atrativo do GraphQL.

## Os três tipos de operação

| Operação | Para quê | Executa |
|---|---|---|
| `query` | Ler dados | Campos em paralelo |
| `mutation` | Criar, alterar ou apagar dados | Campos de topo em série, um de cada vez |
| `subscription` | Receber eventos em tempo real | Fica aberta (WebSocket ou SSE) |

## O que vais precisar

- **Node.js 20 ou superior** (`node --version`).
- Um editor, como o VS Code.
- Noções de JavaScript ou TypeScript (funções, `async/await`, objetos). Não é preciso saber GraphQL.
- Um cliente para experimentar: o **Apollo Sandbox** (no browser, quando o servidor Apollo está a correr), o **GraphiQL**, ou o Postman, que tem suporte nativo para GraphQL.

Verifica o ambiente:

    node --version
    npm --version

## O projeto fio condutor

Ao longo do curso construis uma API de **biblioteca**, com estas entidades:

| Tipo | Campos principais |
|---|---|
| `Autor` | `id`, `nome`, `nascimento`, `livros` |
| `Livro` | `id`, `titulo`, `ano`, `genero`, `autor`, `criticas` |
| `Critica` | `id`, `nota` (1 a 5), `comentario`, `livro` |

Cada módulo acrescenta uma peça: primeiro consultas (módulo 01), depois o schema (02), as escritas (03), o servidor (04) e assim sucessivamente, até segurança, desempenho e produção.

## Percurso do curso

| Módulo | Tema |
|---|---|
| 00 | Introdução e mapa do curso |
| 01 | Linguagem de consulta: campos, argumentos, aliases, fragments, variáveis, diretivas |
| 02 | Schema e SDL: tipos, escalares, enums, interfaces, uniões |
| 03 | Mutations e subscriptions |
| 04 | Resolvers e servidor (Apollo Server) |
| 05 | Cliente GraphQL |
| 06 | Paginação e Relay |
| 07 | Erros e validação |
| 08 | Autenticação e autorização |
| 09 | Desempenho e cache (N+1, DataLoader) |
| 10 | Tooling e produção (codegen, federation, testes) |
| 11 a 13 | Exercícios, cheat sheet e gabarito |

## Glossário rápido

| Termo | Significado |
|---|---|
| Schema | Descrição de todos os tipos e operações que a API suporta |
| SDL | Schema Definition Language, a sintaxe para escrever o schema |
| Operação | Um pedido: query, mutation ou subscription |
| Campo | Uma propriedade que podes pedir num tipo |
| Resolver | Função que obtém o valor de um campo |
| Introspeção | Capacidade de consultar o próprio schema |
| Fragment | Conjunto reutilizável de campos |

## Como estudar

1. Lê cada aula e **escreve os exemplos** no teu cliente: não os copies às cegas.
2. Muda um detalhe e prevê o resultado antes de executar.
3. Os exercícios do módulo 11 estão referenciados com **PRATICAR** ao longo das aulas.
4. Só consultes o gabarito (módulo 13) depois de tentares.

**DICA:** a API pública `https://countries.trevorblades.com/graphql` permite praticar consultas já neste módulo, sem instalar nada. Confirma que continua disponível antes de a usares.

**PRATICAR:** exercício 1 do módulo 11.

## Fontes oficiais

- [Introdução ao GraphQL](https://graphql.org/learn/)
- [Especificação do GraphQL](https://spec.graphql.org/)
- [Boas práticas](https://graphql.org/learn/best-practices/)
