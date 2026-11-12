# 00 Introdução e mapa do curso

## O que vais aprender

O Supabase é uma plataforma de backend construída sobre o **Postgres**. Num único projeto recebes uma base de dados relacional, autenticação de utilizadores, uma API gerada automaticamente a partir das tuas tabelas, armazenamento de ficheiros, atualizações em tempo real e funções que correm no servidor. Em vez de montares e ligares cada peça, usas uma base de dados verdadeira e ferramentas que a rodeiam.

Este curso leva-te do primeiro projeto até uma aplicação com dados protegidos, ficheiros, tempo real e funções, passando pelo desenvolvimento local com a CLI e pelas verificações antes de ir para produção.

## Os blocos do Supabase

| Bloco | Para que serve |
|---|---|
| Database | Postgres completo, com SQL, extensões e relações |
| Auth | Registo, login, sessões e provedores externos |
| Data API | API REST gerada pelo PostgREST a partir do esquema |
| Storage | Ficheiros em buckets, com regras de acesso |
| Realtime | Alterações da base de dados e mensagens em tempo real |
| Edge Functions | Código TypeScript executado perto do utilizador (Deno) |

## Porquê Postgres e não uma base própria

Muitas plataformas "backend como serviço" escondem os dados num formato proprietário. O Supabase faz o contrário: o que recebes é um Postgres normal, com SQL, transações, chaves estrangeiras e extensões. Isto traz três vantagens práticas:

- **Portabilidade.** Podes exportar a base de dados e ligar-te com qualquer cliente Postgres, como `psql` ou DBeaver.
- **Código aberto.** Os componentes do Supabase são open source e podem ser executados em local ou alojados por ti.
- **Competências reutilizáveis.** O que aprendes de SQL e de modelação serve fora do Supabase.

## Como as peças se ligam

Um pedido típico percorre este caminho:

1. A aplicação (browser, telemóvel ou servidor) usa `supabase-js` com o URL e a chave do projeto.
2. O pedido chega ao gateway do Supabase, que encaminha para o serviço certo (API, Auth, Storage, Realtime ou Functions).
3. Quando há utilizador autenticado, o pedido leva um token JWT.
4. A base de dados Postgres recebe a consulta, aplica as políticas de Row Level Security com base nesse token e devolve só as linhas permitidas.

A consequência é importante: **a base de dados é o ponto central de autorização**. Os restantes serviços consultam-na ou apoiam-se nela.

## Projeto fio condutor

Ao longo do curso constróis uma pequena aplicação de **tarefas partilhadas**. Cada módulo acrescenta uma camada:

| Módulo | O que acrescentas à aplicação |
|---|---|
| 02 | Tabelas `projetos` e `tarefas` |
| 03 | Utilizadores com login e perfis |
| 04 | Regras para cada pessoa ver só os seus dados |
| 05 | Leitura e escrita a partir do código |
| 06 | Anexos às tarefas |
| 07 | Lista atualizada ao vivo |
| 08 | Função que envia um aviso por email |
| 09 | Tudo versionado em migrations |
| 10 | Verificações antes de publicar |

Podes seguir esta aplicação à letra ou adaptá-la a uma ideia tua. O importante é manter o mesmo projeto até ao fim.

## Glossário rápido

| Termo | Significado |
|---|---|
| Esquema (schema) | Agrupamento de tabelas dentro da base; `public` é o habitual |
| RLS | Row Level Security: regras que filtram linhas por utilizador |
| JWT | Token assinado que identifica o utilizador em cada pedido |
| Migration | Ficheiro SQL que descreve uma alteração do esquema |
| PostgREST | Servidor que gera a API REST a partir do esquema |
| Edge Function | Função TypeScript executada no servidor, em Deno |
| Bucket | Contentor de ficheiros no Storage |

## O que precisas

- Uma conta Supabase (o plano gratuito chega para o curso).
- Node.js instalado e um editor de código.
- Noções básicas de JavaScript e de bases de dados. SQL elementar ajuda, mas o curso explica o que usa.
- Para os módulos 08 e 09: Docker Desktop instalado (a CLI usa contentores para correr o Supabase localmente).

## Mapa de aprendizagem

| Etapa | Pergunta respondida |
|---|---|
| Projeto e Dashboard | O que é criado quando abro um projeto e que chaves existem? |
| Base de dados | Como modelo tabelas e relações em Postgres? |
| Autenticação | Como identifico utilizadores? |
| Row Level Security | Como garanto que cada utilizador só vê os seus dados? |
| API e cliente | Como leio e escrevo dados a partir da aplicação? |
| Storage, Realtime e Functions | Como junto ficheiros, eventos e lógica de servidor? |
| CLI e produção | Como trabalho localmente e publico com segurança? |

## Uma regra para todo o curso

**Uma tabela sem Row Level Security é uma tabela exposta.** A API do Supabase é pública por desenho: a segurança vive na base de dados. Sempre que criares uma tabela no esquema `public`, ativa o RLS e escreve políticas. O módulo 04 explica como.

## Como estudar cada módulo

1. Lê a aula e executa cada exemplo no teu projeto de estudo.
2. Altera um detalhe e prevê o resultado antes de correr de novo.
3. Resolve os exercícios indicados em **PRATICAR**.
4. Só depois consulta o módulo 13.

**NOTA:** os planos, limites e preços do Supabase mudam. O curso não os fixa; consulta a página de preços e a documentação para os valores atuais.

## Preparar um espaço de prática

Cria uma pasta de trabalho e confirma as ferramentas:

    node --version
    npm --version
    docker --version

**DICA:** usa um projeto Supabase só para estudo. Podes apagá-lo no fim sem consequências.

**PRATICAR:** antes de avançar, confirma que tens conta Supabase e que consegues abrir o dashboard em supabase.com/dashboard.

## Fontes oficiais

- [Documentação do Supabase](https://supabase.com/docs)
- [Visão geral dos produtos](https://supabase.com/docs/guides/getting-started/features)
