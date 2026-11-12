# 09 CLI e desenvolvimento local

## Porquê trabalhar localmente

Alterar o esquema diretamente no dashboard de produção é rápido, mas difícil de repetir, rever e desfazer. Com a CLI do Supabase corres a stack inteira no teu computador, guardas as alterações de esquema como **migrations** em ficheiros e versionas tudo no Git.

## Instalar e iniciar

Precisas de Docker em execução. A CLI pode ser usada com `npx`:

    npx supabase --version
    npx supabase init

`init` cria a pasta `supabase/` com a configuração. Depois arranca a stack local:

    npx supabase start

No fim, a CLI imprime os URLs locais e as chaves: API, Studio (o dashboard local), base de dados e o serviço de emails de teste (Mailpit). Para parar:

    npx supabase stop

## O que `supabase start` cria

Os contentores arrancam os mesmos serviços do projeto remoto:

| Serviço | Utilização local |
|---|---|
| API | Endereço da Data API e do Auth |
| Studio | Dashboard local |
| Base de dados | Postgres local, acessível por qualquer cliente |
| Mailpit | Caixa de email de teste para confirmações e recuperações |

Executa `npx supabase status` para voltares a ver os URLs e as chaves locais. As chaves locais são de desenvolvimento e diferentes das do projeto remoto: usa-as num ficheiro `.env.local` próprio.

**NOTA:** a primeira execução descarrega várias imagens Docker e pode demorar. As seguintes são rápidas.

## Migrations

Cada migration é um ficheiro SQL com data e hora no nome, guardado em `supabase/migrations/`.

    npx supabase migration new criar_tarefas

Edita o ficheiro criado com o teu SQL e aplica-o à base de dados local, repondo-a do zero:

    npx supabase db reset

`db reset` recria a base local, corre todas as migrations por ordem e depois o ficheiro `supabase/seed.sql` com dados de exemplo.

## Dados iniciais com seed

O ficheiro `supabase/seed.sql` corre depois das migrations em cada `db reset`. Serve para dados de exemplo:

    insert into public.projetos (nome, user_id)
    values ('Casa', '00000000-0000-0000-0000-000000000001');

Cria os utilizadores de teste pela API de administração ou pelo Studio local, e mantém o seed sem dados reais.

## Testar a base de dados

A CLI inclui verificações para apanhares erros antes de publicar:

    npx supabase db lint       # procura problemas em funções e esquema
    npx supabase test db       # corre testes pgTAP em supabase/tests

Um teste pgTAP simples:

    begin;
    select plan(1);
    select has_table('public', 'tarefas', 'a tabela tarefas existe');
    select * from finish();
    rollback;

Guarda-o em `supabase/tests/tarefas.test.sql`. Podes também testar as políticas RLS trocando de role dentro do teste, como no módulo 04.

## Capturar alterações feitas no Studio

Se mexeste no esquema através do Studio local, gera uma migration com a diferença:

    npx supabase db diff -f nome_da_alteracao

Revê sempre o SQL gerado antes de o guardar.

## Ligar ao projeto remoto

    npx supabase login
    npx supabase link --project-ref <ref>
    npx supabase db push

`db push` aplica ao projeto remoto as migrations que ainda lá não estão. Para trazer o esquema existente de um projeto remoto:

    npx supabase db pull

**ATENÇÃO:** `db reset` apaga os dados da base **local**. Nunca o dirijas a uma base remota; para produção usa apenas `db push`.

## Várias pessoas, uma base de dados

Quando mais de uma pessoa altera o esquema:

- Cada alteração é uma migration nova, nunca editas uma já aplicada.
- As migrations entram no Git através de pull requests e são revistas como código.
- Depois de um `git pull`, corre `supabase db reset` para recriar a base local com as novas migrations.
- Se duas pessoas criarem migrations ao mesmo tempo, resolve a ordem pelo nome (a data e hora) e testa de novo.

**ATENÇÃO:** editar uma migration já aplicada em produção não tem efeito lá e deixa os ambientes diferentes. Corrige com uma migration nova.

## Publicar com CI

Um fluxo no GitHub Actions pode aplicar as migrations quando o código chega à branch principal:

    name: Deploy Supabase
    on:
      push:
        branches: [main]
    jobs:
      deploy:
        runs-on: ubuntu-latest
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        steps:
          - uses: actions/checkout@v4
          - uses: supabase/setup-cli@v1
          - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          - run: supabase db push

Guarda o token e a palavra-passe como segredos do repositório. Confirma a versão atual das ações na documentação.

## Funções e tipos no mesmo fluxo

- `supabase functions deploy` publica as Edge Functions, que podes juntar ao mesmo fluxo.
- `supabase gen types typescript --local > database.types.ts` gera tipos a partir da base local, sem depender do projeto remoto.

## Fluxo recomendado

1. `supabase start` e trabalha localmente.
2. Escreve uma migration e testa com `db reset`.
3. Faz commit das migrations no Git.
4. Aplica com `db push` (ou através de CI) ao projeto remoto.

**DICA:** guarda a configuração em `supabase/config.toml`, que inclui portas, provedores de login e definições das funções, e versiona-a também.

**PRATICAR:** faz os exercícios 24 e 25 do módulo 11.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Cannot connect to the Docker daemon` | Docker não está em execução |
| Porta já em uso ao arrancar | Outra stack Supabase ou serviço usa essa porta; usa `supabase stop` |
| `db push` pede palavra-passe | Falta `SUPABASE_DB_PASSWORD` ou o `link` |
| Migration falha na base remota | Dados existentes violam a nova restrição |
| `db reset` falha a meio | Erro de SQL numa migration; corrige o ficheiro e repete |
| Tipos gerados desatualizados | Regenera depois de cada alteração de esquema |

## Exercícios

1. Inicia a stack local e confirma os URLs com `supabase status`.
2. Cria uma migration que acrescenta uma coluna e aplica-a com `db reset`.
3. Escreve um teste pgTAP que verifica a existência de `tarefas` e corre-o.
4. Descreve o fluxo que usarias para publicar uma alteração de esquema sem perder dados.

## Fontes oficiais

- [Desenvolvimento local](https://supabase.com/docs/guides/local-development)
- [Migrations da base de dados](https://supabase.com/docs/guides/deployment/database-migrations)
- [Referência da CLI](https://supabase.com/docs/reference/cli/introduction)
