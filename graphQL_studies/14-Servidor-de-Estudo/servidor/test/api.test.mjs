import test from 'node:test'
import assert from 'node:assert/strict'
import { criarStore } from '../src/dados.mjs'
import { criarServidor, criarContexto } from '../src/servidor.mjs'

const server = criarServidor()
await server.start()
test.after(() => server.stop())

async function exec(store, query, { variables, token } = {}) {
  const r = await server.executeOperation(
    { query, variables },
    { contextValue: criarContexto(store, token ? `Bearer ${token}` : '') },
  )
  assert.equal(r.body.kind, 'single')
  return r.body.singleResult
}

const codigo = (r) => r.errors[0].extensions.code

test('lista livros com autor', async () => {
  const r = await exec(criarStore(), '{ livros { totalCount edges { node { titulo autor { nome } } } } }')
  assert.equal(r.data.livros.totalCount, 5)
  assert.equal(r.data.livros.edges[0].node.autor.nome, 'José Saramago')
})

test('filtra por género', async () => {
  const r = await exec(criarStore(), '{ livros(filtro: { genero: POESIA }) { totalCount } }')
  assert.equal(r.data.livros.totalCount, 2)
})

test('pagina com cursores até ao fim', async () => {
  const s = criarStore()
  const q = 'query($d:String){ livros(first:2, after:$d){ edges{node{id}} pageInfo{hasNextPage endCursor} } }'
  const p1 = await exec(s, q)
  assert.deepEqual(p1.data.livros.edges.map((e) => e.node.id), ['1', '2'])
  const p2 = await exec(s, q, { variables: { d: p1.data.livros.pageInfo.endCursor } })
  const p3 = await exec(s, q, { variables: { d: p2.data.livros.pageInfo.endCursor } })
  assert.deepEqual(p3.data.livros.edges.map((e) => e.node.id), ['5'])
  assert.equal(p3.data.livros.pageInfo.hasNextPage, false)
})

test('first acima do máximo e cursor inválido são recusados', async () => {
  const s = criarStore()
  assert.equal(codigo(await exec(s, '{ livros(first: 500) { totalCount } }')), 'BAD_USER_INPUT')
  assert.equal(codigo(await exec(s, '{ livros(after: "lixo") { totalCount } }')), 'BAD_USER_INPUT')
})

test('criarLivro exige ADMIN', async () => {
  const m = 'mutation { criarLivro(input:{titulo:"X",genero:POESIA,autorId:"1"}) { __typename } }'
  const s = criarStore()
  assert.equal(codigo(await exec(s, m)), 'UNAUTHENTICATED')
  assert.equal(codigo(await exec(s, m, { token: 'tok-leitor' })), 'FORBIDDEN')
  assert.equal((await exec(s, m, { token: 'tok-admin' })).data.criarLivro.__typename, 'Livro')
})

test('criarLivro devolve erro de domínio como dados', async () => {
  const r = await exec(
    criarStore(),
    'mutation { criarLivro(input:{titulo:"X",genero:POESIA,autorId:"99"}) { __typename ... on ErroValidacao { campo mensagem } } }',
    { token: 'tok-admin' },
  )
  assert.equal(r.data.criarLivro.__typename, 'ErroValidacao')
  assert.equal(r.data.criarLivro.campo, 'autorId')
})

test('crítica valida a nota e atualiza a média', async () => {
  const s = criarStore()
  const m = 'mutation($n:Int!){ criarCritica(input:{livroId:"2",nota:$n}) { id } }'
  assert.equal(codigo(await exec(s, m, { token: 'tok-leitor', variables: { n: 9 } })), 'BAD_USER_INPUT')
  await exec(s, m, { token: 'tok-leitor', variables: { n: 4 } })
  const r = await exec(s, '{ livro(id:"2") { mediaNotas criticas { nota } } }')
  assert.equal(r.data.livro.mediaNotas, 4)
})

test('atualizarLivro inexistente dá NOT_FOUND', async () => {
  const r = await exec(criarStore(), 'mutation { atualizarLivro(id:"99", input:{titulo:"Y"}) { id } }', { token: 'tok-admin' })
  assert.equal(codigo(r), 'NOT_FOUND')
})

test('apagar livro remove também as críticas', async () => {
  const s = criarStore()
  const r = await exec(s, 'mutation { apagarLivro(id:"1") }', { token: 'tok-admin' })
  assert.equal(r.data.apagarLivro, true)
  assert.equal(s.criticas.some((c) => c.livroId === '1'), false)
})

test('reiniciarDados repõe o estado inicial', async () => {
  const s = criarStore()
  await exec(s, 'mutation { apagarLivro(id:"1") }', { token: 'tok-admin' })
  await exec(s, 'mutation { reiniciarDados }', { token: 'tok-admin' })
  assert.equal(s.livros.length, 5)
})

test('o DataLoader agrupa: um só carregamento de autores por pedido', async () => {
  const s = criarStore()
  let chamadas = 0
  const original = s.autores.map.bind(s.autores)
  s.autores.map = (...a) => { chamadas++; return original(...a) }
  await exec(s, '{ livros { edges { node { autor { nome } } } } }')
  assert.equal(chamadas, 1)
})
