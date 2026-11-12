# 03 Autenticação de utilizadores

## Como funciona

O Supabase Auth (GoTrue) gere utilizadores e sessões. Quando alguém se autentica, recebe um **JWT** de acesso e um token de renovação. O cliente envia o JWT em cada pedido, e a base de dados usa-o para saber quem está a pedir — é isso que permite o Row Level Security do módulo 04.

Os utilizadores ficam na tabela `auth.users`, que não deve ser alterada diretamente a partir da aplicação.

## Instalar o cliente

    npm install @supabase/supabase-js

    import { createClient } from '@supabase/supabase-js'

    export const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY
    )

## Email e palavra-passe

    // registo
    const { data, error } = await supabase.auth.signUp({
      email: 'ana@exemplo.pt',
      password: 'uma-palavra-passe-forte',
    })

    // login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'ana@exemplo.pt',
      password: 'uma-palavra-passe-forte',
    })

    // terminar sessão
    await supabase.auth.signOut()

Por omissão, o Supabase exige confirmação do email antes do primeiro login. Em desenvolvimento podes desligar essa exigência em Authentication, mas liga-a em produção.

## Confirmação de email e recuperação de palavra-passe

Depois do registo, o Supabase envia um email com um link de confirmação. O link devolve o utilizador ao **Site URL** configurado em Authentication → URL Configuration. Define também em **Redirect URLs** todos os endereços para onde o Auth pode redirecionar (por exemplo, `http://localhost:3000/**` em desenvolvimento).

Recuperar a palavra-passe tem dois passos:

    // 1. enviar o email de recuperação
    await supabase.auth.resetPasswordForEmail('ana@exemplo.pt', {
      redirectTo: 'https://a-minha-app.pt/nova-palavra-passe',
    })

    // 2. na página de destino, definir a nova palavra-passe
    await supabase.auth.updateUser({ password: 'nova-palavra-passe-forte' })

**NOTA:** em desenvolvimento local, os emails não saem para a internet. A CLI regista-os no Mailpit, aberto a partir dos URLs do `supabase start` (módulo 09).

## Sessões e tokens

Cada sessão tem dois tokens:

| Token | Duração | Função |
|---|---|---|
| Access token (JWT) | Curta, 1 hora por omissão | Enviado em cada pedido |
| Refresh token | Longa, uso único | Pede um novo access token |

A biblioteca renova a sessão automaticamente e guarda-a no armazenamento do browser. Em aplicações com renderização no servidor, usa o pacote `@supabase/ssr`, que guarda a sessão em cookies para o servidor a poder ler.

Podes ver o que o JWT contém, incluindo o identificador do utilizador (`sub`) e a role (`authenticated`), colando-o em jwt.io. É esse conteúdo que `auth.uid()` lê nas políticas.

## Um formulário de login completo

    const form = document.querySelector('#login')

    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = form.email.value
      const password = form.password.value

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        document.querySelector('#erro').textContent = error.message
        return
      }
      window.location.href = '/tarefas'
    })

Mostra mensagens de erro claras, mas não digas se o email existe ou não: isso ajuda quem tenta adivinhar contas.

## Outras formas de entrar

| Método | Notas |
|---|---|
| Magic link / OTP | `signInWithOtp({ email })` envia um link ou código |
| OAuth | Google, GitHub e outros, configurados em Authentication → Providers |
| Telefone | SMS por um fornecedor externo configurado |
| Anónimo | Sessão temporária sem credenciais |

Para OAuth:

    await supabase.auth.signInWithOAuth({ provider: 'github' })

Tens de registar o URL de retorno do Supabase na aplicação do fornecedor e indicar os URLs permitidos em Authentication → URL Configuration.

## Obter o utilizador e a sessão

    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    supabase.auth.onAuthStateChange((evento, sessao) => {
      console.log(evento, sessao?.user?.email)
    })

**ATENÇÃO:** no código de servidor, valida o utilizador com `getUser()`, que confirma o token junto do Auth. `getSession()` lê o que está guardado no cliente e não deve ser a base de decisões de segurança.

## Metadados do utilizador

O Auth guarda dois tipos de metadados no utilizador:

| Campo | Quem pode alterar | Uso seguro em políticas? |
|---|---|---|
| `user_metadata` | O próprio utilizador | **Não** |
| `app_metadata` | Apenas o servidor (chave secreta) | Sim |

    await supabase.auth.signUp({
      email, password,
      options: { data: { nome: 'Ana' } },   // fica em user_metadata
    })

**ATENÇÃO:** nunca uses `user_metadata` para decidir permissões, como "é administrador". O utilizador pode editá-lo. Guarda papéis em `app_metadata` ou numa tabela própria protegida por RLS.

## Perfis de utilizador

Como `auth.users` é gerida pelo Supabase, guarda dados da aplicação numa tabela própria e cria-a automaticamente com um trigger:

    create table public.perfis (
      id uuid primary key references auth.users (id) on delete cascade,
      nome text
    );

    create schema if not exists private;

    create function private.criar_perfil()
    returns trigger
    language plpgsql
    security definer set search_path = ''
    as $$
    begin
      insert into public.perfis (id) values (new.id);
      return new;
    end;
    $$;

    create trigger ao_criar_utilizador
      after insert on auth.users
      for each row execute function private.criar_perfil();

**NOTA:** `security definer` executa a função com os direitos de quem a criou. Define sempre `search_path` vazio e nomes completos (`public.perfis`), como acima. Guarda estas funções num esquema que **não** esteja exposto pela API, aqui `private`: no esquema `public`, a Data API poderia chamá-las através de `rpc`.

**PRATICAR:** faz os exercícios 8 a 10 do módulo 11.

## Mais segurança

- **Palavras-passe fortes:** define o comprimento mínimo e os requisitos em Authentication → Sign In / Providers.
- **MFA:** o Auth suporta um segundo fator por aplicação autenticadora (TOTP).
- **Limites de pedidos:** com o SMTP por omissão do Supabase, o envio de emails do Auth é muito limitado (na documentação atual, **2 emails por hora**) e serve apenas para testes. Para utilizadores reais, configura o teu próprio servidor SMTP em Authentication. Há ainda limites para OTP, verificações e renovação de tokens.
- **Termina sessões:** `signOut({ scope: 'global' })` termina a sessão em todos os dispositivos.

## Administrar utilizadores a partir do servidor

Com a chave secreta, e só em código de servidor, podes gerir utilizadores:

    import { createClient } from '@supabase/supabase-js'

    const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

    await admin.auth.admin.createUser({
      email: 'equipa@exemplo.pt',
      password: 'palavra-passe-temporaria',
      email_confirm: true,
    })
    await admin.auth.admin.deleteUser('<id-do-utilizador>')

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Email not confirmed` | O utilizador ainda não abriu o link de confirmação |
| Redireciona para `localhost` em produção | Site URL por atualizar |
| `Invalid login credentials` | Email ou palavra-passe errados |
| Sessão perdida ao recarregar a página (SSR) | Falta guardar a sessão em cookies |
| `getUser()` devolve `null` | Sem sessão ou token expirado |

## Exercícios

1. Regista um utilizador, confirma o email e inicia sessão.
2. Implementa a recuperação de palavra-passe de ponta a ponta.
3. Guarda o nome do utilizador em `user_metadata` e lê-o de volta.
4. Explica por que razão um papel "admin" não pode viver em `user_metadata`.

## Fontes oficiais

- [Visão geral do Auth](https://supabase.com/docs/guides/auth)
- [Login com palavra-passe](https://supabase.com/docs/guides/auth/passwords)
- [Login social (OAuth)](https://supabase.com/docs/guides/auth/social-login)
- [Gerir dados de utilizador](https://supabase.com/docs/guides/auth/managing-user-data)
