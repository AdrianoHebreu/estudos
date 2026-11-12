import { startStandaloneServer } from '@apollo/server/standalone'
import { criarStore } from './dados.mjs'
import { criarServidor, criarContexto } from './servidor.mjs'

const porta = Number(process.env.PORT ?? 4000)
const store = criarStore()
const server = criarServidor()

const { url } = await startStandaloneServer(server, {
  listen: { port: porta },
  context: async ({ req }) => criarContexto(store, req.headers.authorization ?? ''),
})
console.log(`Servidor GraphQL pronto em ${url}  (dados em memória; Ctrl+C para parar)`)

// encerramento limpo
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, async () => {
    await server.stop()
    process.exit(0)
  })
}
