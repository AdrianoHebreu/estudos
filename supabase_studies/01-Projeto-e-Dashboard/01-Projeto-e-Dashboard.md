# 01 Projeto e Dashboard

## Criar um projeto

No dashboard, escolhe **New project** dentro de uma organização. Define:

- **Nome** do projeto.
- **Palavra-passe da base de dados** — guarda-a num gestor de palavras-passe; é a palavra-passe do utilizador `postgres` e não é mostrada de novo.
- **Região** — escolhe a mais próxima dos teus utilizadores para reduzir a latência.

O projeto demora alguns minutos a ficar disponível. Cada projeto é uma instância Postgres dedicada, com os restantes serviços ligados a ela.

## Organizações e projetos

Os projetos vivem dentro de **organizações**. Uma organização agrupa membros, faturação e projetos; podes convidar colegas e atribuir-lhes papéis. Para estudo basta a organização pessoal criada com a conta.

Cada projeto tem um **identificador de referência** (`ref`) de 20 letras. Aparece no URL do projeto e é o valor que a CLI pede em `supabase link --project-ref`.

**NOTA:** em planos gratuitos, projetos com pouca atividade durante cerca de **7 dias** podem ser **pausados**. Os dados mantêm-se e podes retomar o projeto no dashboard, mas a API fica indisponível até lá. Passar a um plano pago evita as pausas por inatividade.

## Percorrer o dashboard

| Secção | O que contém |
|---|---|
| Table Editor | Vista tipo folha de cálculo das tabelas e das linhas |
| SQL Editor | Editor para correr SQL e guardar consultas |
| Authentication | Utilizadores, provedores e modelos de email |
| Storage | Buckets e ficheiros |
| Edge Functions | Funções publicadas e respetivos registos |
| Database | Extensões, roles, replicação, backups e migrations |
| Logs | Registos da API, da base de dados e da autenticação |
| Project Settings | Chaves de API, ligações e configuração geral |

## URL e chaves de API

Cada projeto tem um **URL** do tipo `https://<ref>.supabase.co` e chaves para o aceder. No dashboard, o botão **Connect** mostra o URL e a chave publicável já preparados para a tua framework, e Settings → API Keys lista todas as chaves:

| Chave | Onde usar | Cuidados |
|---|---|---|
| Chave publicável (anon / publishable) | Código do browser e da app | Pública por desenho; só funciona dentro das regras de RLS |
| Chave secreta (service_role / secret) | Apenas em servidores e funções | Ignora o RLS; nunca vai para o browser nem para o Git |

**ATENÇÃO:** a chave `service_role` tem acesso total aos dados e ignora o Row Level Security. Se a colocares num ficheiro de frontend, qualquer visitante pode lê-la e apagar tudo.

**NOTA:** o Supabase está a substituir as chaves JWT `anon` e `service_role` pelas chaves `sb_publishable_...` e `sb_secret_...`, e a documentação oficial prevê descontinuar as antigas até ao fim de 2026. O papel de cada uma é o mesmo. Criar chaves novas não revoga as antigas: ambas funcionam até desativares as antigas em Settings → API Keys. Nos exemplos do curso usamos os nomes novos; se o teu projeto ainda mostra `anon`, usa essa chave no mesmo sítio.

## Ligar diretamente à base de dados

Além da API, podes ligar-te ao Postgres com qualquer cliente. Em Project Settings → Database (ou no botão **Connect**) encontras as cadeias de ligação:

| Tipo | Quando usar |
|---|---|
| Ligação direta (`db.<ref>.supabase.co:5432`) | Servidores persistentes, migrations e ferramentas administrativas; usa IPv6, ou IPv4 com o add-on pago |
| Pooler em modo sessão (porta 5432) | Quando só tens IPv4 e precisas de ligações longas; suporta prepared statements |
| Pooler em modo transação (porta 6543) | Serverless e funções com muitas ligações curtas; sem estado de sessão nem prepared statements |

Exemplo com `psql` pela ligação direta (substitui os valores pelos do teu projeto). Com o pooler, o utilizador passa a ser `postgres.<ref>` e o endereço `aws-...pooler.supabase.com`, que o botão **Connect** mostra já preenchido:

    psql "postgresql://postgres:<palavra-passe>@db.<ref>.supabase.co:5432/postgres"

**ATENÇÃO:** a palavra-passe da base de dados dá acesso total. Se a perderes, redefine-a em Project Settings → Database em vez de a pedires a terceiros ou de a escreveres em ficheiros partilhados.

## Primeira tabela pelo Table Editor

1. Abre **Table Editor** e escolhe **New table**.
2. Dá o nome `tarefas`.
3. Mantém ativa a opção de **Row Level Security** (verás porquê no módulo 04).
4. Adiciona as colunas `titulo` (`text`) e `concluida` (`bool`, valor por omissão `false`).
5. Guarda e acrescenta duas linhas manualmente.

Depois abre o **SQL Editor** e corre `select * from tarefas;` para veres as mesmas linhas por SQL. O Table Editor e o SQL Editor mostram a mesma base de dados.

## Guardar a configuração

Numa aplicação, guarda o URL e a chave publicável em variáveis de ambiente, não no código:

    # .env.local
    SUPABASE_URL=https://abcdefgh.supabase.co
    SUPABASE_PUBLISHABLE_KEY=chave-publicavel-aqui

Acrescenta o ficheiro `.env.local` ao `.gitignore`. Os nomes exatos das variáveis dependem da framework (por exemplo, `NEXT_PUBLIC_` ou `VITE_` como prefixo para expor ao browser).

## Primeiro contacto com a API

Cada tabela do esquema `public` fica disponível em `/rest/v1/<tabela>`. Depois de criares uma tabela no módulo 02 podes testar:

    curl "https://<ref>.supabase.co/rest/v1/tarefas?select=*" -H "apikey: <chave-publicavel>"

**DICA:** na secção API Docs do dashboard, o Supabase gera documentação da API com exemplos já preenchidos para as tuas tabelas.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `Invalid API key` | Chave copiada incompleta ou de outro projeto |
| A API devolve `[]` | RLS ativo sem política, ou tabela vazia |
| Erro de ligação ao Postgres | Rede só IPv4 com ligação direta; usa o pooler |
| Pedido do browser falha por CORS | Endereço errado ou função sem cabeçalhos CORS |
| Projeto não responde | Projeto pausado por inatividade |

**DICA:** quando algo falha, abre **Logs** no dashboard. A maior parte dos erros de API e de autenticação aparece lá com a mensagem exata.

## Exercícios

1. Cria um projeto de estudo e anota a região escolhida.
2. Localiza o URL do projeto e a chave publicável.
3. Explica por que motivo a chave secreta nunca pode estar numa aplicação web.
4. Cria um `.env.local` com o URL e a chave e confirma que está no `.gitignore`.

## Fontes oficiais

- [Começar com o Supabase](https://supabase.com/docs/guides/getting-started)
- [Chaves de API](https://supabase.com/docs/guides/api/api-keys)
- [Gerir projetos](https://supabase.com/docs/guides/platform)
