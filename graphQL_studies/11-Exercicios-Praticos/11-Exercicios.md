# 11 Exercícios práticos

## Como usar

Os exercícios estão numerados de 1 a 43 e seguem a ordem dos módulos. Cada aula indica os que lhe correspondem. Resolve-os no teu servidor de estudo (o do módulo 04) ou num cliente como o Apollo Sandbox. As soluções estão no módulo 13: só as consultes depois de tentares.

## Mapa exercício → módulo

| Exercícios | Módulo | Tema |
|---|---|---|
| 1 | 00 | Primeiro contacto |
| 2 a 6 | 01 | Linguagem de consulta |
| 7 a 10 | 02 | Schema e SDL |
| 11 a 14 | 03 | Mutations e subscriptions |
| 15 a 18 | 04 | Resolvers e servidor |
| 19 a 22 | 05 | Cliente GraphQL |
| 23 a 26 | 06 | Paginação e Relay |
| 27 a 30 | 07 | Erros e validação |
| 31 a 34 | 08 | Autenticação e autorização |
| 35 a 38 | 09 | Desempenho e cache |
| 39 a 42 | 10 | Tooling e produção |
| 43 | Todos | Projeto final |

## Nível inicial (módulos 00 a 03)

### Módulo 00

**Exercício 1.** Numa API pública de GraphQL à tua escolha (por exemplo, a de países indicada no módulo 00), abre o explorador e lista os campos do tipo `Query`. Depois pede o nome de três itens. Verifica que a resposta tem a forma exata da consulta.

### Módulo 01

**Exercício 2.** No servidor da biblioteca, escreve uma query com nome `ListarLivros` que devolva `id`, `titulo` e o `nome` do autor de cada livro.

**Exercício 3.** Usa **aliases** para pedir, na mesma query, os livros com id `1` e `2` como `primeiro` e `segundo`.

**Exercício 4.** Reescreve o exercício 3 com uma variável `$id: ID!` numa só query `LivroPorId`, e envia-a com `curl` ou `fetch`.

**Exercício 5.** Cria um fragment `ResumoLivro` com `id`, `titulo` e `ano`, e usa-o em duas partes da mesma consulta.

**Exercício 6.** Acrescenta `@include` e `@skip` a uma query para mostrar as críticas só quando uma variável booleana `$comCriticas` for verdadeira.

### Módulo 02

**Exercício 7.** Escreve, em SDL, os tipos `Autor`, `Livro` e `Critica` da biblioteca. Escolhe com cuidado onde usar `!` e explica porquê `[Livro!]!` nas listas.

**Exercício 8.** Acrescenta um `enum Genero` e um `input FiltroLivros` com `genero` e `anoMinimo`, e um campo `livros(filtro: FiltroLivros)` em `Query`.

**Exercício 9.** Define uma interface `Publicacao` implementada por `Livro` e `Revista`, e uma união `ResultadoPesquisa = Livro | Autor`. Escreve uma consulta que use inline fragments sobre cada uma.

**Exercício 10.** Marca o campo `Livro.nome` como obsoleto, indicando o motivo, e confirma que o Sandbox mostra o aviso.

### Módulo 03

**Exercício 11.** Escreve a mutation `criarLivro` com um argumento `input: NovoLivro!`, enviado por variáveis, que devolva `id`, `titulo` e o autor.

**Exercício 12.** Muda `criarLivro` para devolver um payload com `livro` e `erros: [ErroUtilizador!]!`. Escreve a consulta que trata os dois casos.

**Exercício 13.** Escreve numa só mutation duas criações com aliases `a` e `b`. Explica por que razão a ordem é garantida.

**Exercício 14.** Declara `Subscription.criticaAdicionada(livroId: ID!)` e escreve a subscription cliente. Indica que transporte usarias e porquê.

## Nível intermédio (módulos 04 a 07)

### Módulo 04

**Exercício 15.** Cria o servidor do módulo 04 de raiz, com `livros` e `livro(id)`. Arranca-o e consulta-o no Sandbox.

**Exercício 16.** Acrescenta o resolver `Livro.autor` e `Autor.livros`. Prevê o resultado de uma consulta que desça duas vezes entre livro e autor, e confirma.

**Exercício 17.** Põe no contexto um objeto `db` e o cabeçalho `Authorization`. Cria uma query `cabecalho` que o devolva, para confirmares que o contexto é por pedido.

**Exercício 18.** Implementa a mutation `criarLivro` que devolve o novo livro, e confirma que `livros` o inclui a seguir.

### Módulo 05

**Exercício 19.** Escreve a função `gql(query, variables)` com `fetch` que lança um erro quando `errors` existe. Testa-a com uma consulta inexistente.

**Exercício 20.** Cria um `ApolloClient` com `HttpLink` e `InMemoryCache` e faz uma query e uma mutation a partir de Node.

**Exercício 21.** Pede um campo que não existe, primeiro com a política por omissão e depois com `errorPolicy: 'all'`. Descreve as duas diferenças.

**Exercício 22.** Depois de criar um livro, faz a lista atualizar de duas formas: com `refetchQueries` e com `fetchPolicy: 'network-only'`.

### Módulo 06

**Exercício 23.** Acrescenta `limite` e `deslocamento` a `livros`. Mostra como um livro novo entre dois pedidos pode repetir um item na página seguinte.

**Exercício 24.** Converte `livros` para uma connection (`edges`, `node`, `cursor`, `pageInfo`) com `first` e `after`.

**Exercício 25.** Percorre todos os livros com um ciclo que reenvia `endCursor` enquanto `hasNextPage` for verdadeiro.

**Exercício 26.** Limita `first` a um máximo de 50 e devolve um erro `BAD_USER_INPUT` para valores negativos ou acima do limite.

### Módulo 07

**Exercício 27.** Lança um `GraphQLError` com `code: 'NOT_FOUND'` quando `livro(id)` não existe, e mostra a resposta completa.

**Exercício 28.** Faz um resolver devolver `null` num campo `!`, vê a propagação e corrige o schema para limitar o estrago.

**Exercício 29.** Transforma `criarLivro` para devolver uma união `Livro | TituloInvalido`, com `__resolveType`, e consulta os dois casos.

**Exercício 30.** Usa `formatError` para remover o `stacktrace` das extensões e confirma o resultado.

## Nível avançado (módulos 08 a 10)

### Módulo 08

**Exercício 31.** No contexto, lê o `Authorization` e devolve o utilizador de uma tabela de tokens de teste, ou `null`.

**Exercício 32.** Escreve `exigir(ctx, ...papeis)` e protege `apagarLivro` para o papel `ADMIN`. Testa os três casos: sem token, leitor e administrador.

**Exercício 33.** Cria `minhasCriticas`, que só devolve as do utilizador autenticado, e um campo sensível `emailAutor` visível só para o dono ou para o `ADMIN`.

**Exercício 34.** Configura o cabeçalho `Authorization` no `HttpLink` do Apollo Client e confirma que o servidor o recebe.

### Módulo 09

**Exercício 35.** Conta quantas vezes `Livro.autor` é chamado para uma lista de 10 livros, com um contador no resolver. Explica o resultado.

**Exercício 36.** Resolve o N+1 com `DataLoader` no contexto e confirma que a função de lote corre uma só vez.

**Exercício 37.** Faz a função de lote devolver os resultados por ordem de chegada da base de dados (de propósito) e mostra o erro. Corrige-a com um `Map` por `id`.

**Exercício 38.** Acrescenta uma regra que rejeita consultas com profundidade superior a 6.

### Módulo 10

**Exercício 39.** Escreve três testes com `executeOperation`: caminho feliz, `NOT_FOUND` e `FORBIDDEN` (com `contextValue`).

**Exercício 40.** Configura o GraphQL Code Generator (`codegen.ts`) e gera tipos para uma consulta tua.

**Exercício 41.** Lista cinco alterações do schema que partem clientes e cinco que não partem, e explica o processo de remover um campo.

**Exercício 42.** Preenche a lista de verificação para produção do módulo 10 para o teu projeto e identifica o que falta.

## Projeto final

**Exercício 43.** Constrói a API completa da biblioteca com:

- schema com `Autor`, `Livro` e `Critica`, enum `Genero` e inputs;
- queries, mutations e subscription de críticas;
- paginação por connection em `livros` e `criticas`;
- erros com `extensions.code` e erros de domínio em união;
- autenticação por token e autorização por papel e por dono;
- DataLoader nas relações;
- testes automáticos com `executeOperation`.

Critérios de sucesso: nenhum N+1 numa lista de 50 livros, `NODE_ENV=production` sem stacktraces, e pelo menos dez testes a passar.
