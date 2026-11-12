# 08 Autenticação e autorização

## Duas perguntas diferentes

| Conceito | Pergunta | Exemplo |
|---|---|---|
| **Autenticação** | Quem és? | Validar um token e obter o utilizador |
| **Autorização** | O que podes fazer? | Só um administrador apaga livros |

O GraphQL **não define** nenhuma das duas. A especificação trata apenas de consultas e execução; segurança é responsabilidade da aplicação.

## Autenticação: à entrada, não nos resolvers

Há um princípio simples: **autentica-se uma vez por pedido, no contexto**, e os resolvers só leem o resultado. Nunca no schema GraphQL em si (nada de `login` que devolva o estado da sessão por cookies à mão).

O fluxo habitual:

1. O cliente obtém um token (JWT, token de sessão) por um mecanismo próprio: formulário de login, OAuth, fornecedor externo.
2. Envia o token em cada pedido, no cabeçalho `Authorization: Bearer <token>`.
3. O servidor valida o token ao criar o contexto e guarda o utilizador.

    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        const token = (req.headers.authorization ?? '').replace('Bearer ', '')
        const utilizador = await validarToken(token) // devolve o utilizador ou null
        return { utilizador }
      },
    })

`validarToken` é a tua função: verifica a assinatura e a validade de um JWT (com `jose` ou `jsonwebtoken`) ou procura a sessão na base de dados.

**DICA:** se o token for inválido, devolve `utilizador: null` e deixa os resolvers decidirem. Assim, os campos públicos continuam a funcionar para anónimos.

**ATENÇÃO:** nunca confies em dados que o cliente envia para dizer quem é (um argumento `utilizadorId`, por exemplo). A identidade vem **sempre** do token validado.

No cliente Apollo, junta o cabeçalho no `HttpLink`:

    const link = new HttpLink({
      uri: 'http://localhost:4000/',
      headers: { authorization: `Bearer ${token}` },
    })

## Erros de autenticação e de autorização

Reutiliza os códigos do módulo 07 de forma consistente:

| Situação | Código |
|---|---|
| Sem token ou token inválido | `UNAUTHENTICATED` |
| Token válido, sem permissão | `FORBIDDEN` |

Uma função de apoio reduz a repetição (executada e validada):

    import { GraphQLError } from 'graphql'

    const exigir = (ctx, ...papeis) => {
      if (!ctx.utilizador) {
        throw new GraphQLError('Sem sessão', { extensions: { code: 'UNAUTHENTICATED' } })
      }
      if (papeis.length && !papeis.includes(ctx.utilizador.papel)) {
        throw new GraphQLError('Sem permissão', { extensions: { code: 'FORBIDDEN' } })
      }
    }

    Mutation: {
      apagarLivro: (_p, { id }, ctx) => {
        exigir(ctx, 'ADMIN')
        // apagar...
        return true
      },
    },

Resultado verificado: sem token, `UNAUTHENTICATED`; com o token de um leitor, `FORBIDDEN`; com o de um administrador, a mutation tem sucesso.

## Onde autorizar

| Nível | Exemplo | Vantagem | Risco |
|---|---|---|---|
| **Resolver** | `exigir(ctx, 'ADMIN')` em cada mutation | Simples e explícito | Fácil esquecer num resolver novo |
| **Camada de serviço / dados** | `livros.apagar(utilizador, id)` valida lá dentro | Uma só lógica para toda a aplicação | Exige disciplina de arquitetura |
| **Diretivas no schema** | `apagarLivro(id: ID!): Boolean! @auth(papel: ADMIN)` | Visível no schema | Precisa de implementação própria |
| **Middleware** (`graphql-shield`) | Regras num ficheiro central | Regras agrupadas | Mais uma camada para aprender |

**DICA:** coloca a regra o mais perto possível dos **dados**, não só do GraphQL. Se amanhã surgir um endpoint REST ou uma tarefa agendada, a mesma regra aplica-se sem duplicação.

## Autorização por objeto e por campo

Muitas regras dependem do **recurso**, não só do papel: um utilizador só vê as **suas** críticas.

    Query: {
      minhasCriticas: (_p, _a, ctx) => {
        exigir(ctx)
        return criticas.filter((c) => c.utilizadorId === ctx.utilizador.id)
      },
    },
    Critica: {
      // campo sensível: só o autor ou um administrador
      emailAutor: (c, _a, ctx) => {
        exigir(ctx)
        if (ctx.utilizador.id !== c.utilizadorId && ctx.utilizador.papel !== 'ADMIN') {
          throw new GraphQLError('Sem permissão', { extensions: { code: 'FORBIDDEN' } })
        }
        return c.emailAutor
      },
    },

**ATENÇÃO:** em GraphQL, o mesmo objeto pode ser alcançado por **vários caminhos** (`livro { criticas { utilizador } }`, `utilizador { criticas }`). Proteger só o ponto de entrada deixa passar os outros: autoriza no tipo ou nos dados, não só nas queries de topo.

## Proteger a API contra abuso

Autenticar não basta. Uma consulta aninhada pode ser muito cara mesmo para utilizadores legítimos:

| Medida | Para quê |
|---|---|
| Limite de **profundidade** | Impedir `autor { livros { autor { livros ... } } }` |
| Limite de **complexidade** | Atribuir custo a campos e rejeitar pedidos caros |
| Limite de `first` / `limite` | Evitar listas gigantes (módulo 06) |
| Limite de taxa (*rate limiting*) | Por utilizador ou IP, no gateway |
| Tamanho máximo do pedido | Recusar corpos enormes |

Os pormenores de desempenho ficam no módulo 09.

## Introspeção em produção

A introspeção ajuda no desenvolvimento, mas expõe todo o schema. O Apollo Server desativa-a automaticamente quando `NODE_ENV=production`. Se a tua API é privada, mantém-na desligada.

**ATENÇÃO:** esconder o schema **não é** segurança. Quem conhece o contrato pode adivinhar campos, e as mensagens de erro podem dar sugestões de nomes. A autorização real tem de existir sempre.

## Lista de verificação de segurança

- [ ] A identidade vem do token validado, nunca de argumentos
- [ ] Cada mutation e cada campo sensível tem uma regra explícita
- [ ] Os resolvers de relação respeitam as mesmas regras
- [ ] Há limites de profundidade, complexidade e tamanho de página
- [ ] `NODE_ENV=production` em produção (sem stacktraces nem introspeção)
- [ ] CORS limitado às origens esperadas
- [ ] Tokens só viajam por HTTPS

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Um utilizador acede a dados de outro | Falta a verificação do dono no resolver ou nos dados |
| Campos protegidos visíveis por outro caminho | Autorização só nas queries de topo |
| Anónimos recebem erro em campos públicos | O contexto lança exceção quando não há token |
| `UNAUTHENTICATED` mesmo com token | Esquema do cabeçalho errado (falta `Bearer`) |
| O browser bloqueia o pedido | CORS não permite o cabeçalho `Authorization` |
| Token expirado depois de algum tempo | Sem renovação no cliente |

## Exercícios

**PRATICAR:** exercícios 31 a 34 do módulo 11 (contexto com utilizador, `exigir`, regra por objeto, cabeçalho no cliente).

## Fontes oficiais

- [Autorização no GraphQL](https://graphql.org/learn/authorization/)
- [Autenticação e autorização no Apollo Server](https://www.apollographql.com/docs/apollo-server/security/authentication)
- [Boas práticas de segurança](https://graphql.org/learn/security/)
