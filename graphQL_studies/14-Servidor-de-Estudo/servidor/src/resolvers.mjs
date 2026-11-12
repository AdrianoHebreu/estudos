import { GraphQLError } from 'graphql'

const erro = (mensagem, code, extra = {}) =>
  new GraphQLError(mensagem, { extensions: { code, ...extra } })

const exigir = (ctx, ...papeis) => {
  if (!ctx.utilizador) throw erro('Sem sessão', 'UNAUTHENTICATED')
  if (papeis.length && !papeis.includes(ctx.utilizador.papel)) throw erro('Sem permissão', 'FORBIDDEN')
}

const MAX_PAGINA = 50
const codificar = (id) => Buffer.from(`livro:${id}`).toString('base64url')
const descodificar = (c) => {
  const texto = Buffer.from(c, 'base64url').toString()
  if (!texto.startsWith('livro:')) throw erro('Cursor inválido', 'BAD_USER_INPUT')
  return texto.slice(6)
}

function paginar(lista, first, after) {
  if (first < 0 || first > MAX_PAGINA) {
    throw erro(`first tem de estar entre 0 e ${MAX_PAGINA}`, 'BAD_USER_INPUT')
  }
  let inicio = 0
  if (after) {
    const pos = lista.findIndex((l) => l.id === descodificar(after))
    if (pos === -1) throw erro('Cursor inválido', 'BAD_USER_INPUT')
    inicio = pos + 1
  }
  const fatia = lista.slice(inicio, inicio + first)
  return {
    edges: fatia.map((node) => ({ cursor: codificar(node.id), node })),
    pageInfo: {
      hasNextPage: inicio + first < lista.length,
      endCursor: fatia.length ? codificar(fatia.at(-1).id) : null,
    },
    totalCount: lista.length,
  }
}

export const resolvers = {
  CriarLivroResultado: {
    __resolveType: (o) => (o.mensagem !== undefined ? 'ErroValidacao' : 'Livro'),
  },

  Query: {
    eu: (_p, _a, ctx) => ctx.utilizador,
    livros: (_p, { filtro = {}, first, after }, { store }) => {
      const texto = filtro.texto?.toLowerCase()
      const lista = store.livros.filter(
        (l) =>
          (!filtro.genero || l.genero === filtro.genero) &&
          (filtro.anoMinimo == null || (l.ano ?? 0) >= filtro.anoMinimo) &&
          (!texto || l.titulo.toLowerCase().includes(texto)),
      )
      return paginar(lista, first, after)
    },
    livro: (_p, { id }, { store }) => store.livros.find((l) => l.id === id) ?? null,
    autores: (_p, _a, { store }) => store.autores,
    autor: (_p, { id }, { store }) => store.autores.find((a) => a.id === id) ?? null,
  },

  Mutation: {
    criarAutor: (_p, { nome, nascimento }, ctx) => {
      exigir(ctx, 'ADMIN')
      const autor = { id: ctx.store.proximoId('autor'), nome, nascimento: nascimento ?? null }
      ctx.store.autores.push(autor)
      return autor
    },
    criarLivro: (_p, { input }, ctx) => {
      exigir(ctx, 'ADMIN')
      if (!input.titulo.trim()) return { campo: 'titulo', mensagem: 'O título não pode ser vazio' }
      if (!ctx.store.autores.some((a) => a.id === input.autorId)) {
        return { campo: 'autorId', mensagem: `Autor ${input.autorId} não existe` }
      }
      const livro = {
        id: ctx.store.proximoId('livro'),
        titulo: input.titulo.trim(),
        ano: input.ano ?? null,
        genero: input.genero,
        autorId: input.autorId,
      }
      ctx.store.livros.push(livro)
      return livro
    },
    atualizarLivro: (_p, { id, input }, ctx) => {
      exigir(ctx, 'ADMIN')
      const livro = ctx.store.livros.find((l) => l.id === id)
      if (!livro) throw erro('Livro não encontrado', 'NOT_FOUND', { id })
      // campo ausente = manter; null = limpar (só permitido em "ano")
      for (const campo of ['titulo', 'ano', 'genero']) {
        if (input[campo] === undefined) continue
        if (input[campo] === null && campo !== 'ano') {
          throw erro(`${campo} não pode ser null`, 'BAD_USER_INPUT', { campo })
        }
        livro[campo] = input[campo]
      }
      return livro
    },
    apagarLivro: (_p, { id }, ctx) => {
      exigir(ctx, 'ADMIN')
      const pos = ctx.store.livros.findIndex((l) => l.id === id)
      if (pos === -1) return false
      ctx.store.livros.splice(pos, 1)
      ctx.store.criticas = ctx.store.criticas.filter((c) => c.livroId !== id)
      return true
    },
    criarCritica: (_p, { input }, ctx) => {
      exigir(ctx)
      if (input.nota < 1 || input.nota > 5) {
        throw erro('A nota tem de estar entre 1 e 5', 'BAD_USER_INPUT', { campo: 'nota' })
      }
      if (!ctx.store.livros.some((l) => l.id === input.livroId)) {
        throw erro('Livro não encontrado', 'NOT_FOUND', { id: input.livroId })
      }
      const critica = {
        id: ctx.store.proximoId('critica'),
        livroId: input.livroId,
        nota: input.nota,
        comentario: input.comentario ?? null,
      }
      ctx.store.criticas.push(critica)
      return critica
    },
    reiniciarDados: (_p, _a, ctx) => {
      exigir(ctx, 'ADMIN')
      ctx.store.reiniciar()
      return true
    },
  },

  Autor: {
    livros: (a, _args, { store }) => store.livros.filter((l) => l.autorId === a.id),
  },
  Livro: {
    autor: (l, _a, { loaders }) => loaders.autor.load(l.autorId),
    criticas: (l, _a, { loaders }) => loaders.criticas.load(l.id),
    mediaNotas: async (l, _a, { loaders }) => {
      const criticas = await loaders.criticas.load(l.id)
      if (!criticas.length) return null
      return criticas.reduce((soma, c) => soma + c.nota, 0) / criticas.length
    },
  },
  Critica: {
    livro: (c, _a, { store }) => store.livros.find((l) => l.id === c.livroId),
  },
}
