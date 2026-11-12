import { ApolloServer } from '@apollo/server'
import DataLoader from 'dataloader'
import { typeDefs } from './schema.mjs'
import { resolvers } from './resolvers.mjs'
import { utilizadores } from './dados.mjs'

export function criarServidor() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    // sem stacktrace nas respostas, mesmo fora de produção
    formatError: (formatado) => {
      const { stacktrace, ...extensoes } = formatado.extensions ?? {}
      return { ...formatado, extensions: extensoes }
    },
  })
}

// Contexto novo a cada pedido: utilizador, dados e loaders (cache por pedido).
export function criarContexto(store, authorization = '') {
  const token = authorization.replace(/^Bearer\s+/i, '')
  return {
    store,
    utilizador: utilizadores[token] ?? null,
    loaders: {
      autor: new DataLoader(async (ids) => {
        const porId = new Map(store.autores.map((a) => [a.id, a]))
        return ids.map((id) => porId.get(id))
      }),
      criticas: new DataLoader(async (livroIds) => {
        const grupos = new Map(livroIds.map((id) => [id, []]))
        for (const c of store.criticas) grupos.get(c.livroId)?.push(c)
        return livroIds.map((id) => grupos.get(id))
      }),
    },
  }
}
