export const typeDefs = `#graphql
  enum Genero { FICCAO NAO_FICCAO POESIA TEATRO }
  enum Papel { LEITOR ADMIN }

  type Utilizador { id: ID! nome: String! papel: Papel! }

  type Autor {
    id: ID!
    nome: String!
    nascimento: String
    livros: [Livro!]!
  }

  type Livro {
    id: ID!
    titulo: String!
    ano: Int
    genero: Genero!
    autor: Autor!
    criticas: [Critica!]!
    mediaNotas: Float
  }

  type Critica {
    id: ID!
    nota: Int!
    comentario: String
    livro: Livro!
  }

  type PageInfo { hasNextPage: Boolean! endCursor: String }
  type LivroEdge { cursor: String! node: Livro! }
  type LivroConnection { edges: [LivroEdge!]! pageInfo: PageInfo! totalCount: Int! }

  input FiltroLivros { genero: Genero anoMinimo: Int texto: String }
  input NovoLivro { titulo: String! ano: Int genero: Genero! autorId: ID! }
  input AtualizacaoLivro { titulo: String ano: Int genero: Genero }
  input NovaCritica { livroId: ID! nota: Int! comentario: String }

  type ErroValidacao { campo: String! mensagem: String! }
  union CriarLivroResultado = Livro | ErroValidacao

  type Query {
    eu: Utilizador
    livros(filtro: FiltroLivros, first: Int = 10, after: String): LivroConnection!
    livro(id: ID!): Livro
    autores: [Autor!]!
    autor(id: ID!): Autor
  }

  type Mutation {
    criarAutor(nome: String!, nascimento: String): Autor!
    criarLivro(input: NovoLivro!): CriarLivroResultado!
    atualizarLivro(id: ID!, input: AtualizacaoLivro!): Livro!
    apagarLivro(id: ID!): Boolean!
    criarCritica(input: NovaCritica!): Critica!
    reiniciarDados: Boolean!
  }
`
