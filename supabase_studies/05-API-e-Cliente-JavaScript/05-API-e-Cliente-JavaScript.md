# 05 API e cliente JavaScript

## A API gerada

O Supabase usa o **PostgREST** para transformar o esquema `public` numa API REST. A biblioteca `supabase-js` esconde os pedidos HTTP e dá-te uma interface encadeada. Todas as chamadas respeitam o RLS do utilizador autenticado.

Cada chamada devolve `{ data, error }`. Verifica sempre `error`:

    const { data, error } = await supabase.from('tarefas').select()
    if (error) throw error

## Tratar erros

O erro devolvido traz uma mensagem, um código e, por vezes, uma sugestão:

    const { data, error } = await supabase.from('tarefas').select()

    if (error) {
      console.error(error.code, error.message, error.hint)
      return
    }

Os erros do Postgres chegam com o código SQL: `23505` indica violação de `unique`, `23503` de chave estrangeira e `42501` falta de permissão. Mostra ao utilizador uma mensagem amigável e regista o detalhe técnico.

**NOTA:** um pedido bloqueado por RLS num `select` não devolve erro, só uma lista vazia. Um `insert` bloqueado devolve erro `42501`.

## Ler dados

    // todas as colunas
    const { data } = await supabase.from('tarefas').select('*')

    // colunas escolhidas
    const { data } = await supabase.from('tarefas').select('id, titulo')

    // uma única linha
    const { data } = await supabase.from('tarefas').select().eq('id', 1).single()

## Filtros, ordem e paginação

| Método | Equivalente SQL |
|---|---|
| `.eq('col', v)` | `col = v` |
| `.neq('col', v)` | `col <> v` |
| `.gt`, `.gte`, `.lt`, `.lte` | `>`, `>=`, `<`, `<=` |
| `.like('col', '%x%')`, `.ilike` | `like`, sem distinção de maiúsculas |
| `.in('col', [1, 2])` | `col in (1, 2)` |
| `.is('col', null)` | `col is null` |
| `.order('col', { ascending: false })` | `order by col desc` |
| `.limit(n)`, `.range(0, 9)` | `limit`, paginação |

Exemplo combinado:

    const { data } = await supabase
      .from('tarefas')
      .select('id, titulo')
      .eq('concluida', false)
      .order('criada_em', { ascending: false })
      .range(0, 9)

## Contar, paginar e ler mais do que 1000 linhas

A API devolve no máximo **1000 linhas** por pedido por omissão (configurável no projeto). Para listas grandes, pagina:

    const tamanho = 20
    const pagina = 2

    const { data, count } = await supabase
      .from('tarefas')
      .select('id, titulo', { count: 'exact' })
      .order('id')
      .range(pagina * tamanho, pagina * tamanho + tamanho - 1)

`count: 'exact'` devolve o total sem trazer todas as linhas. Para apenas contar, junta `head: true` e não vêm linhas:

    const { count } = await supabase
      .from('tarefas')
      .select('*', { count: 'exact', head: true })
      .eq('concluida', false)

## Filtros mais avançados

    // OU entre condições
    .or('concluida.eq.true,titulo.ilike.%urgente%')

    // dentro de um array ou JSON
    .contains('etiquetas', ['urgente'])

    // pesquisa de texto
    .textSearch('titulo', 'pao & leite')

    // negação
    .not('concluida', 'is', null)

Combina vários filtros encadeando: por omissão são todos obrigatórios (E).

## Escrever dados

    // inserir
    const { data, error } = await supabase
      .from('tarefas')
      .insert({ titulo: 'Rever o módulo 05' })
      .select()

    // atualizar
    await supabase.from('tarefas').update({ concluida: true }).eq('id', 1)

    // inserir ou atualizar
    await supabase.from('tarefas').upsert({ id: 1, titulo: 'Novo título' })

    // apagar
    await supabase.from('tarefas').delete().eq('id', 1)

Sem `.select()` no fim, `insert` e `update` não devolvem as linhas afetadas.

**ATENÇÃO:** `update` e `delete` sem filtro afetam todas as linhas que o RLS permitir. A biblioteca exige um filtro em muitas versões, mas não dependas disso.

## Relações numa só chamada

Se existir uma chave estrangeira, podes pedir dados ligados:

    const { data } = await supabase
      .from('projetos')
      .select('nome, tarefas ( id, titulo )')

O resultado traz cada projeto com um array `tarefas`. Isto substitui vários pedidos e faz o equivalente a um `join`.

## Filtrar por dados relacionados

Para devolver apenas os projetos que têm tarefas abertas, usa `!inner`, que se comporta como um `inner join`:

    const { data } = await supabase
      .from('projetos')
      .select('nome, tarefas!inner ( id, titulo )')
      .eq('tarefas.concluida', false)

Sem `!inner`, o filtro só reduz as tarefas devolvidas, mas todos os projetos continuam na lista.

## Inserir em lote e upsert

    // vários registos de uma vez
    await supabase.from('tarefas').insert([
      { titulo: 'A', projeto_id: 1 },
      { titulo: 'B', projeto_id: 1 },
    ])

    // upsert por uma coluna única
    await supabase.from('perfis').upsert(
      { id: user.id, nome: 'Ana' },
      { onConflict: 'id' }
    )

Um `insert` em lote é uma única transação: se uma linha falhar, nenhuma é gravada.

## Funções da base de dados (RPC)

Para lógica que não cabe num pedido simples, cria uma função SQL e chama-a:

    create function public.contar_abertas()
    returns bigint
    language sql
    security invoker
    as $$ select count(*) from public.tarefas where concluida = false $$;

    const { data } = await supabase.rpc('contar_abertas')

Com `security invoker` a função respeita o RLS de quem a chama.

## Tipos TypeScript

A CLI gera tipos a partir do esquema:

    # projeto remoto
    npx supabase gen types typescript --project-id <ref> --schema public > database.types.ts

    # base de dados local
    npx supabase gen types typescript --local > database.types.ts

    import type { Database } from './database.types'
    const supabase = createClient<Database>(url, chave)

Assim, nomes de tabelas e colunas passam a ser verificados pelo compilador.

**PRATICAR:** faz os exercícios 15 a 18 do módulo 11.

## Exemplo: lista de tarefas

    async function carregarTarefas() {
      const { data, error } = await supabase
        .from('tarefas')
        .select('id, titulo, concluida, projetos ( nome )')
        .order('criada_em', { ascending: false })

      if (error) return mostrarErro(error.message)

      const lista = document.querySelector('#tarefas')
      lista.innerHTML = ''
      for (const t of data) {
        const li = document.createElement('li')
        li.textContent = `${t.titulo} (${t.projetos?.nome ?? 'sem projeto'})`
        lista.append(li)
      }
    }

Usa `textContent` e não `innerHTML` com dados do utilizador, para evitar injeção de HTML.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Could not find the table in the schema cache` | Tabela inexistente, nome errado ou esquema não exposto |
| `Could not find a relationship` | Falta a chave estrangeira entre as tabelas |
| `data` é `null` com `.single()` | Zero ou mais de uma linha; usa `.maybeSingle()` |
| Só chegam 1000 linhas | Limite por omissão; pagina com `range` |
| Colunas novas não aparecem | Cache do esquema; recarrega-o nas definições da API |
| Pedido do browser bloqueado | Rede, CORS ou chave errada |

## Exercícios

1. Escreve uma função que pagina as tarefas de 10 em 10 e mostra o total.
2. Obtém apenas os projetos com tarefas por concluir, usando `!inner`.
3. Insere três tarefas num só pedido e confirma que uma falha impede todas.
4. Troca `.single()` por `.maybeSingle()` e explica a diferença quando não há resultados.

## Fontes oficiais

- [Referência JavaScript](https://supabase.com/docs/reference/javascript/introduction)
- [Consultar dados](https://supabase.com/docs/reference/javascript/select)
- [Funções da base de dados](https://supabase.com/docs/guides/database/functions)
- [Tipos TypeScript gerados](https://supabase.com/docs/guides/api/rest/generating-types)
