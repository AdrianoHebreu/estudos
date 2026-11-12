# 08 Edge Functions

## O que são

As Edge Functions são funções **TypeScript** executadas no servidor, em Deno, perto do utilizador. Servem para lógica que não deve correr no browser: chamar APIs de terceiros com segredos, receber webhooks, enviar emails ou processar pagamentos.

Cada função é um pequeno servidor HTTP com um URL próprio:

    https://<ref>.supabase.co/functions/v1/<nome>

## Criar a primeira função

Com a CLI (módulo 09):

    npx supabase functions new ola

Isto cria `supabase/functions/ola/index.ts`:

    Deno.serve(async (req) => {
      const { nome } = await req.json()
      return new Response(
        JSON.stringify({ mensagem: `Olá, ${nome}!` }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    })

## Quando usar uma função

| Situação | Porquê uma função |
|---|---|
| Chamar uma API com chave secreta (email, pagamentos, IA) | A chave nunca chega ao browser |
| Receber webhooks | Precisa de um URL público que corre código |
| Lógica com várias etapas | Mais fácil de testar do que SQL longo |
| Tarefas assíncronas | Evita bloquear o pedido do utilizador |

Se a lógica só mexe em dados da base, uma função SQL ou o RLS costumam ser mais simples. Usa funções quando precisas de sair da base de dados.

## Organização e dependências

Cada função fica na sua pasta dentro de `supabase/functions/`. Pastas que comecem com `_` guardam código partilhado:

    supabase/
      functions/
        _shared/
          cors.ts
        ola/
          index.ts
        avisar-tarefa/
          index.ts

    import { cors } from '../_shared/cors.ts'

Dependências vêm de `npm:` ou `jsr:`, com a versão indicada, por exemplo `npm:@supabase/supabase-js@2`.

## Testar e publicar

    npx supabase functions serve          # corre localmente
    npx supabase functions deploy ola     # publica no projeto

Chamada a partir da aplicação:

    const { data, error } = await supabase.functions.invoke('ola', {
      body: { nome: 'Ana' },
    })

O `invoke` envia automaticamente o JWT do utilizador autenticado.

## Segredos

Guarda chaves de terceiros como segredos, nunca no código:

    npx supabase secrets set STRIPE_KEY=sk_test_...
    npx supabase secrets list

Na função:

    const chave = Deno.env.get('STRIPE_KEY')

O Supabase disponibiliza ainda `SUPABASE_URL` e a chave publicável como variáveis de ambiente dentro da função.

## Agir como o utilizador

Para respeitar o RLS, cria o cliente com o cabeçalho de autorização do pedido:

    import { createClient } from 'npm:@supabase/supabase-js@2'

    Deno.serve(async (req) => {
      const chaves = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')!)
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        chaves.default,
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      )
      const { data } = await supabase.from('tarefas').select()
      return Response.json(data)
    })

**ATENÇÃO:** usar a chave `service_role` dentro da função ignora o RLS. Faz-o só quando é mesmo necessário e valida antes quem está a pedir.

## Exemplo: avisar por email

No projeto fio condutor, quando uma tarefa é concluída enviamos um aviso por email através de um serviço externo (aqui, um serviço genérico via HTTP):

    Deno.serve(async (req) => {
      const { tarefa, email } = await req.json()
      if (!tarefa || !email) {
        return new Response('Dados em falta', { status: 400 })
      }

      const resposta = await fetch('https://api.servico-email.exemplo/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('EMAIL_API_KEY')}`,
        },
        body: JSON.stringify({
          para: email,
          assunto: `Tarefa concluída: ${tarefa}`,
        }),
      })

      return Response.json({ ok: resposta.ok }, { status: resposta.ok ? 200 : 502 })
    })

Valida sempre os dados recebidos, devolve códigos HTTP corretos e nunca incluas o segredo na resposta nem nos registos.

## Chamar a função a partir da base de dados

Com a extensão `pg_net`, um trigger pode chamar a função quando uma tarefa muda:

    create function public.avisar_conclusao()
    returns trigger
    language plpgsql
    as $$
    begin
      if new.concluida and not old.concluida then
        perform net.http_post(
          url := 'https://<ref>.supabase.co/functions/v1/avisar-tarefa',
          headers := jsonb_build_object('Content-Type', 'application/json'),
          body := jsonb_build_object('tarefa', new.titulo)
        );
      end if;
      return new;
    end;
    $$;

    create trigger tarefas_avisar
      after update on public.tarefas
      for each row execute function public.avisar_conclusao();

O Supabase também oferece **Database Webhooks** no dashboard, que montam isto sem escreveres o trigger. Em qualquer caso, protege o URL da função, por exemplo com um segredo partilhado verificado no código.

## Variáveis de ambiente por omissão

Em cada função estão disponíveis, sem configuração:

| Variável | Conteúdo |
|---|---|
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_PUBLISHABLE_KEYS` | JSON com as chaves publicáveis, indexadas por nome (normalmente `default`) |
| `SUPABASE_SECRET_KEYS` | JSON com as chaves secretas, que ignoram o RLS |
| `SUPABASE_DB_URL` | Ligação direta ao Postgres |

As variáveis antigas `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` continuam a existir, mas trazem as chaves legadas e a documentação desaconselha lê-las. Os segredos que definires não podem começar por `SUPABASE_`.

## CORS

Se a função for chamada a partir do browser, responde ao pedido `OPTIONS` e inclui os cabeçalhos CORS:

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    Deno.serve(async (req) => {
      if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    })

Em produção, troca o `*` pelo domínio da tua aplicação. Nas versões recentes do `supabase-js` (2.95 ou superior) podes importar os cabeçalhos já prontos com `import { corsHeaders } from 'npm:@supabase/supabase-js@^2/cors'`, que incluem também os métodos permitidos e os cabeçalhos de rastreio.

## Webhooks

Uma função pode receber chamadas de serviços externos, como pagamentos. Nesses casos o emissor não tem JWT do Supabase, por isso desativa a verificação de JWT só para essa função, na configuração:

    [functions.stripe-webhook]
    verify_jwt = false

Localmente existe também `functions serve --no-verify-jwt`. A documentação avisa que, sem JWT, qualquer pessoa pode invocar a função: valida a assinatura do webhook no teu código.

**DICA:** consulta os registos de cada função em Edge Functions → Logs quando algo falhar.

**PRATICAR:** faz os exercícios 22 e 23 do módulo 11.

## Limites e desempenho

- Segundo a documentação atual: **256 MB** de memória, **2 s de CPU** por pedido (a espera por I/O não conta), tempo máximo de **150 s** no plano gratuito e **400 s** nos pagos, e um código de até **20 MB** (compilado com a CLI). Confirma sempre os valores atuais, que mudam com os planos.
- O primeiro pedido depois de um período parado pode demorar mais (arranque a frio); funções pequenas arrancam mais depressa.
- Para trabalho longo, responde depressa ao cliente e continua em segundo plano, ou divide o trabalho em passos.

## Ver registos e depurar

No dashboard, abre Edge Functions → a função → **Logs**. Localmente, o terminal onde corre `supabase functions serve` mostra os `console.log`. Regista o suficiente para diagnosticar, mas nunca segredos nem dados pessoais.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `401 Invalid JWT` | Falta o cabeçalho `Authorization` ou o token expirou |
| Erro de CORS no browser | Falta responder ao `OPTIONS` ou os cabeçalhos CORS |
| `Deno.env.get` devolve `undefined` | Segredo não definido no projeto remoto |
| Função funciona local, falha publicada | Segredos só definidos localmente |
| `Module not found` | Falta o prefixo `npm:` ou a versão |
| Webhook externo recusado | `verify_jwt` ainda ativo para essa função |

## Exercícios

1. Cria a função `avisar-tarefa` e testa-a localmente com `curl`.
2. Guarda uma chave de teste como segredo e usa-a sem a devolver.
3. Chama a função a partir da aplicação com `functions.invoke`.
4. Descreve como evitarias que qualquer pessoa acione o webhook da base de dados.

## Fontes oficiais

- [Visão geral das Edge Functions](https://supabase.com/docs/guides/functions)
- [Início rápido](https://supabase.com/docs/guides/functions/quickstart)
- [Segredos e variáveis de ambiente](https://supabase.com/docs/guides/functions/secrets)
- [CORS](https://supabase.com/docs/guides/functions/cors)
