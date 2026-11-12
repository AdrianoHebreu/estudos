# 07 Realtime

## Três funcionalidades

O Realtime do Supabase assenta em WebSockets e oferece três mecanismos distintos:

| Funcionalidade | Para que serve |
|---|---|
| Postgres Changes | Receber inserções, atualizações e remoções de uma tabela |
| Broadcast | Enviar mensagens efémeras entre clientes (ex.: cursores) |
| Presence | Saber quem está ligado e partilhar estado de cada cliente |

## Ativar uma tabela

Para receber alterações, a tabela tem de fazer parte da publicação `supabase_realtime`. No dashboard, usa Database → Replication, ou então SQL:

    alter publication supabase_realtime add table public.tarefas;

**NOTA:** os eventos de Postgres Changes respeitam o RLS: cada cliente só recebe as linhas que a política `select` lhe permite ver. A exceção são os **`DELETE`**: o RLS não se aplica a eventos de remoção, porque o Postgres já não consegue verificar o acesso a uma linha apagada.

## Como funciona por baixo

O Postgres regista todas as alterações num registo interno (WAL). O serviço Realtime lê esse registo, filtra os eventos das tabelas da publicação `supabase_realtime`, verifica as políticas de `select` de cada cliente ligado e envia por WebSocket só o que cada um pode ver.

Isto tem uma consequência prática: cada evento obriga a verificar o RLS para cada subscritor. Com muitos clientes a ouvir a mesma tabela, a carga na base de dados cresce. Filtra o mais cedo possível e subscreve só o necessário.

## Ouvir alterações

    const canal = supabase
      .channel('tarefas-canal')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tarefas' },
        (payload) => {
          console.log(payload.eventType, payload.new, payload.old)
        }
      )
      .subscribe()

O `event` pode ser `INSERT`, `UPDATE`, `DELETE` ou `*`. Podes acrescentar `filter: 'user_id=eq.123'` para reduzir o tráfego.

Quando já não precisas do canal, fecha-o:

    supabase.removeChannel(canal)

**ATENÇÃO:** em `DELETE`, o `payload.old` traz apenas a chave primária, a menos que configures `replica identity full` na tabela. Planeia o que a interface precisa de mostrar.

## Filtros

    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'tarefas',
      filter: 'projeto_id=eq.1',
    }, tratar)

O filtro aceita `eq`, `neq`, `lt`, `lte`, `gt`, `gte` e `in` (com um máximo de 100 valores), entre outros. Podes combinar condições separadas por vírgula, que funcionam como **E**; o **OU** não é suportado. Para filtrar eventos `DELETE`, a tabela precisa de `replica identity full`.

## Manter a interface sincronizada

O padrão mais seguro é carregar o estado inicial e depois aplicar os eventos:

    let tarefas = []

    async function iniciar() {
      const { data } = await supabase.from('tarefas').select()
      tarefas = data
      desenhar()

      supabase
        .channel('tarefas-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' },
          ({ eventType, new: nova, old: antiga }) => {
            if (eventType === 'INSERT') tarefas.push(nova)
            if (eventType === 'UPDATE') tarefas = tarefas.map(t => t.id === nova.id ? nova : t)
            if (eventType === 'DELETE') tarefas = tarefas.filter(t => t.id !== antiga.id)
            desenhar()
          })
        .subscribe()
    }

**ATENÇÃO:** entre o `select` inicial e o `subscribe` podem chegar alterações que nenhum dos dois apanha. Subscreve primeiro e carrega os dados a seguir, ou volta a carregar quando o estado for `SUBSCRIBED`.

## Broadcast

Mensagens entre clientes, sem passar pela base de dados:

    const sala = supabase.channel('sala-1')

    sala
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        console.log('Cursor', payload)
      })
      .subscribe((estado) => {
        if (estado === 'SUBSCRIBED') {
          sala.send({ type: 'broadcast', event: 'cursor', payload: { x: 10, y: 20 } })
        }
      })

## Canais privados e autorização

Por omissão, qualquer cliente que conheça o nome de um canal Broadcast ou Presence pode entrar. Para restringir, usa canais **privados**, autorizados por políticas RLS sobre a tabela `realtime.messages`:

    const sala = supabase.channel('sala-1', { config: { private: true } })

    create policy "Autenticados leem a sala"
    on realtime.messages for select
    to authenticated
    using ( true );

    create policy "Autenticados escrevem na sala"
    on realtime.messages for insert
    to authenticated
    with check ( true );

Para os canais privados serem impostos, desativa também a opção **Allow public access** nas definições do Realtime. Em produção, troca `true` por uma condição real: `realtime.topic()` devolve o canal a que o cliente tenta aceder, por isso podes escrever `using ( (select realtime.topic()) = 'sala-1' )` ou cruzar com uma tabela de membros. As políticas são avaliadas quando o cliente entra no canal, por isso retirar o acesso só produz efeito quando o token expira ou é renovado.

**ATENÇÃO:** não faças `alter table realtime.messages enable row level security` nas migrations: o RLS já está ativo e o comando falha por falta de permissões, abortando o resto da migration. Também é possível emitir mensagens Broadcast a partir da base de dados, por exemplo com triggers, para alimentar interfaces sem expor tabelas.

## Presence

    const sala = supabase.channel('sala-1', { config: { presence: { key: user.id } } })

    sala
      .on('presence', { event: 'sync' }, () => {
        console.log(sala.presenceState())
      })
      .subscribe(async (estado) => {
        if (estado === 'SUBSCRIBED') {
          await sala.track({ nome: 'Ana', online_em: new Date().toISOString() })
        }
      })

`presenceState()` devolve quem está na sala neste momento. Quando alguém sai, desaparece automaticamente.

## Escolher o mecanismo

- Os dados têm de ficar guardados? Usa Postgres Changes.
- Mensagens rápidas e descartáveis? Usa Broadcast.
- Quem está online? Usa Presence.

**DICA:** a primeira carga faz-se com um `select` normal; o Realtime serve para manter a lista atualizada depois disso.

**PRATICAR:** faz o exercício 21 do módulo 11.

## Limites e boas práticas

- Existem limites de ligações simultâneas, mensagens por segundo e canais por cliente, que dependem do plano. Consulta a documentação para os valores atuais.
- Fecha os canais que já não usas com `removeChannel`.
- Dá um nome estável a cada canal e reutiliza-o.
- Não uses Postgres Changes para volumes muito altos; considera Broadcast a partir da base de dados.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Não chegam eventos | Tabela fora da publicação `supabase_realtime` |
| Só alguns clientes recebem | A política de `select` não os inclui |
| `old` só traz o `id` | Falta `replica identity full` |
| Eventos duplicados | Canal criado várias vezes sem `removeChannel` |
| Estado `CHANNEL_ERROR` ou `TIMED_OUT` | Chave inválida, rede ou limite do plano |

## Exercícios

1. Abre duas janelas do browser e confirma que uma lista de tarefas se atualiza nas duas.
2. Filtra a subscrição para um único projeto e confirma que as outras alterações não chegam.
3. Implementa um indicador de "quem está online" com Presence.
4. Cria um canal privado e demonstra que um utilizador não autenticado não consegue entrar.

## Fontes oficiais

- [Visão geral do Realtime](https://supabase.com/docs/guides/realtime)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- [Presence](https://supabase.com/docs/guides/realtime/presence)
