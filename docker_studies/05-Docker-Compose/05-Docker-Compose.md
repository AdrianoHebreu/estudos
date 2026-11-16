# 05 Docker Compose

Nos módulos anteriores montaste a aplicação à mão: uma rede, um volume, um `docker run` comprido para a base de dados, outro para a API. Funciona, mas ninguém se lembra daquilo tudo daqui a um mês. O **Docker Compose** descreve o conjunto num ficheiro e levanta-o com um comando. Neste módulo juntas o serviço de tarefas (módulo 03) ao PostgreSQL 17 (módulo 04) num único `compose.yaml`. Tudo foi executado na máquina de teste (Docker Engine 29.9.3 e Compose 5.7.0, Docker Desktop, Windows 11, Git Bash). Os nomes usam o prefixo `est-dk05` e as portas vão de 30050 a 30059. O PowerShell e o Linux ou macOS não foram executados: onde o comando difere, está assinalado.

## O que o Compose resolve

O Compose é um plugin do cliente `docker` (comando `docker compose`, com espaço). Lê um ficheiro YAML, cria as redes, os volumes e os contentores descritos e liga-os pela ordem certa. Não é um motor novo: por baixo continua a ser o mesmo daemon, com os mesmos contentores que vês em `docker ps`.

| Sem Compose | Com Compose |
| --- | --- |
| Vários docker run, docker network create e docker volume create | Um ficheiro, um docker compose up |
| A configuração vive no histórico do terminal | A configuração vive no Git, ao lado do código |
| Tens de te lembrar da ordem de arranque | depends_on e healthcheck tratam disso |
| Limpar é apagar peça a peça | docker compose down apaga o que o ficheiro criou |

O nome de ficheiro preferido é `compose.yaml` (o `docker-compose.yml` antigo também é aceite). Não precisas da linha `version:` no topo.

## Os ficheiros do exemplo

A pasta `exemplos/` deste módulo tem tudo o que vais usar. O serviço de tarefas é o do módulo 03, com uma diferença: se existir `DATABASE_URL`, guarda as tarefas no PostgreSQL (com a biblioteca psycopg); senão, em memória, como antes. O contrato é o de sempre: `GET /saude`, `GET /tarefas`, `POST /tarefas`, variável `PORT`.

| Ficheiro | Papel |
| --- | --- |
| compose.yaml | A definição: serviços api e db (mais o psql, de um perfil) |
| compose.override.yaml | Ajustes de desenvolvimento, lidos automaticamente |
| compose.prod.yaml | Ajustes de produção, só com -f explícito |
| Dockerfile, app.py, requirements.txt | A imagem do serviço de tarefas |
| app.env | Variáveis do serviço api (sem segredos) |
| exemplo.env | Modelo para o teu .env, com as variáveis do próprio Compose |

Cria o `.env` a partir do modelo (o Git ignora-o, porque é onde ficam os segredos reais):

    cp exemplo.env .env

O conteúdo é este (valores fictícios, só para estudo local):

    API_PORT=30050
    POSTGRES_USER=tarefas
    POSTGRES_PASSWORD=Estudo_2026!
    POSTGRES_DB=tarefas

**ATENÇÃO:** num projeto a sério o `.env` nunca vai para o Git e a palavra-passe não é esta. Aqui é um valor de demonstração.

## O compose.yaml, secção a secção

O ficheiro tem os blocos de topo `services`, `volumes` e `networks`. Começa pelo serviço `api`:

    services:
      api:
        build: .
        image: est-dk05-tarefas:1.0
        ports:
          - "${API_PORT:-30050}:8000"
        env_file:
          - app.env
        environment:
          PORT: "8000"
          DATABASE_URL: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
        depends_on:
          db:
            condition: service_healthy
        networks:
          - backend

### image contra build

| Chave | Significado |
| --- | --- |
| image | Usa (ou descarrega) esta imagem. Ex.: postgres:17 |
| build | Constrói a partir de um Dockerfile na pasta indicada (aqui, a atual) |
| build e image juntos | Constrói e dá este nome e etiqueta à imagem resultante |

Com os dois, o Compose constrói e chama `est-dk05-tarefas:1.0` à imagem, em vez de inventar um nome a partir do projeto e do serviço.

### ports, environment e env_file

- `ports` é o `-p` do `docker run`, no formato `ANFITRIÃO:CONTENTOR`. O contentor ouve na 8000 e o anfitrião na 30050. Lembra-te do módulo 04: sem prefixo de endereço, a porta fica exposta a toda a rede; para uma base de dados em desenvolvimento usa `127.0.0.1:30051:5432`.
- `environment` define variáveis diretamente (lista ou mapa, como acima).
- `env_file` lê variáveis de um ficheiro. Serve para não encher o `compose.yaml` e para separar ficheiros por serviço.

Quando a mesma variável aparece nos dois, ganha o `environment`. Foi o que se viu com a variável `MENSAGEM`: o `app.env` diz `configurado por env_file` e o `compose.override.yaml` diz `override de desenvolvimento`; o contentor recebeu a segunda.

**NOTA:** `env_file` entrega as variáveis ao contentor. Não serve para substituir `${...}` dentro do `compose.yaml`: isso é o ficheiro `.env` (mais abaixo). Os dois nomes confundem toda a gente.

### O serviço db: volumes e healthcheck

    db:
      image: postgres:17
      environment:
        POSTGRES_USER: ${POSTGRES_USER}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?define POSTGRES_PASSWORD no ficheiro .env}
        POSTGRES_DB: ${POSTGRES_DB}
      volumes:
        - dados:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
        interval: 3s
        timeout: 3s
        retries: 20
        start_period: 10s
      networks:
        - backend

    volumes:
      dados:

    networks:
      backend:

O volume `dados` está declarado no bloco `volumes` de topo e usado no serviço pelo nome. É um **volume nomeado** (módulo 04): o Compose cria-o como `est-dk05_dados` (projeto, sublinhado, nome) e ele sobrevive aos contentores. A rede `backend` funciona como a bridge definida pelo utilizador do módulo 04: os serviços encontram-se pelo nome (a `api` liga-se a `db:5432`) sem publicar nada.

**NOTA:** o `-h 127.0.0.1` no `pg_isready` força a ligação por TCP. Durante a inicialização a imagem corre um servidor temporário que só aceita o socket Unix; sem o `-h`, o teste daria "saudável" cedo de mais.

## Levantar, ver e parar

O argumento `-p est-dk05` dá o nome ao projeto (por omissão seria o nome da pasta). Dentro da pasta `exemplos/`:

    docker compose -p est-dk05 up -d --build
    docker compose -p est-dk05 ps

    Container est-dk05-db-1 Healthy
    Container est-dk05-api-1 Started
    NAME             IMAGE                  SERVICE   STATUS                   PORTS
    est-dk05-api-1   est-dk05-tarefas:1.0   api       Up 2 seconds             0.0.0.0:30050->8000/tcp
    est-dk05-db-1    postgres:17            db        Up 5 seconds (healthy)   127.0.0.1:30051->5432/tcp

Repara que a `db` está `(healthy)` e que a `api` só arrancou depois de `Healthy`. Testa o serviço:

    curl -s localhost:30050/saude
    curl -s -X POST -H "Content-Type: application/json" -d '{"titulo":"aprender Compose"}' localhost:30050/tarefas
    curl -s localhost:30050/tarefas

    {"estado": "ok", "mensagem": "override de desenvolvimento"}
    {"id": 1, "titulo": "aprender Compose"}
    [{"id": 1, "titulo": "aprender Compose"}]

**NOTA:** em PowerShell o `curl` é um alias de `Invoke-WebRequest`; usa `curl.exe` ou `Invoke-RestMethod` (não testei).

Os comandos que vais usar todos os dias:

| Comando | O que faz |
| --- | --- |
| docker compose up -d | Cria o que falta e arranca em segundo plano |
| docker compose up -d --build | Reconstrói as imagens com build antes de arrancar |
| docker compose ps | Lista os contentores do projeto (ps -a inclui os parados) |
| docker compose logs -f api | Segue os registos de um serviço (sem nome, de todos) |
| docker compose exec db psql ... | Corre um comando num contentor já a correr |
| docker compose build | Só constrói as imagens |
| docker compose stop e start | Pára e volta a arrancar, sem remover nada |
| docker compose down | Pára e remove contentores e redes (os volumes ficam) |
| docker compose config | Mostra o ficheiro final, depois de juntar ficheiros e substituir variáveis |

Os `logs` juntam os serviços, com o nome à esquerda:

    docker compose -p est-dk05 logs api --tail 3

    api-1  | A escutar em 0.0.0.0:8000 (base de dados: PostgreSQL)
    api-1  | 172.19.0.1 - - [16/Nov/2026 08:47:45] "GET /saude HTTP/1.1" 200 -
    api-1  | 172.19.0.1 - - [16/Nov/2026 08:47:45] "POST /tarefas HTTP/1.1" 201 -

E o `exec` usa o nome do **serviço** (`db`), não o do contentor:

    docker compose -p est-dk05 exec db psql -U tarefas -d tarefas -tc "SELECT * FROM tarefa"

      1 | aprender Compose

**NOTA:** o `docker compose stop` foi rápido porque o `app.py` trata o SIGTERM (módulo 03) e a `api` saiu com código 0. Sem isso, o Docker esperava o tempo limite e acabava com um SIGKILL.

## depends_on e o healthcheck

`depends_on` define a ordem. Na forma curta (`depends_on: [db]`) o Compose só espera que o contentor da `db` **tenha arrancado**, não que o PostgreSQL aceite ligações (é o que a documentação descreve; não testei a falha). A forma longa, usada acima, espera pelo estado de saúde:

| condition | O Compose espera que a dependência |
| --- | --- |
| service_started | Tenha arrancado (o comportamento por omissão) |
| service_healthy | Passe o healthcheck |
| service_completed_successfully | Termine com código 0 (útil para migrações) |

O healthcheck da `db` é que diz ao Compose quando o serviço está pronto. Depois de um `down` e de um novo `up` viste a sequência `Waiting`, `Healthy`, e só então a `api` a arrancar. Com `service_healthy` a `api` nunca encontra a base de dados meio inicializada.

**DICA:** `docker compose up -d --wait` espera que os serviços fiquem prontos antes de devolver o terminal. Não o executei; confirma na documentação do `up`.

## Variáveis e o ficheiro .env

Há duas camadas diferentes e convém não as misturar.

| Mecanismo | Para que serve | Onde se vê |
| --- | --- | --- |
| Ficheiro .env na pasta do projeto | Preenche os marcadores ${VARIÁVEL} dentro do compose.yaml | docker compose config |
| env_file e environment | Variáveis que o contentor recebe | docker inspect, dentro do contentor |

O `.env` é lido sozinho pelo Compose. As variáveis do teu terminal ganham ao `.env`: com `API_PORT=30052` no ambiente, o `config` mostrou a porta 30052 e não a do ficheiro.

    API_PORT=30052 docker compose -p est-dk05 config | grep -A1 published

            published: "30052"

Em PowerShell: `$env:API_PORT = "30052"` antes do comando (não executado). A sintaxe de substituição tem variantes úteis:

| Forma | Quando a variável não existe |
| --- | --- |
| ${VAR} | Fica vazia (com aviso) |
| ${VAR:-valor} | Usa o valor por omissão (como ${API_PORT:-30050}) |
| ${VAR:?mensagem} | Falha e mostra a mensagem |

Sem a palavra-passe definida, o `config` falha em vez de criar uma base de dados sem segurança:

    error while interpolating services.db.environment.POSTGRES_PASSWORD: required variable POSTGRES_PASSWORD is missing a value: define POSTGRES_PASSWORD no ficheiro .env

**ATENÇÃO:** o `docker compose config` imprime os valores substituídos, **palavras-passe incluídas**. Não colas essa saída em issues, chats ou registos de CI.

## Perfis: serviços opcionais

Um serviço com `profiles` só arranca quando pedes esse perfil. É ideal para ferramentas de apoio que não fazem parte da aplicação. O `psql` do exemplo é um cliente PostgreSQL com o `entrypoint` já ligado à base de dados:

    docker compose -p est-dk05 config --services
    docker compose -p est-dk05 --profile ferramentas config --services

    db
    api
    db
    api
    psql

O primeiro comando (sem perfil) lista só a `db` e a `api`: o `up` normal nunca arranca o `psql`. Para o usares, como contentor descartável:

    docker compose -p est-dk05 --profile ferramentas run --rm psql -c "SELECT * FROM tarefa"

     id |      titulo
    ----+------------------
      1 | aprender Compose
    (1 row)

O `run --rm` cria um contentor novo para correr o comando e remove-o no fim. Como a imagem `postgres:17` declara `VOLUME` em `/var/lib/postgresql/data`, cada contentor criado dela ganharia um volume anónimo. Por isso o serviço `psql` monta um `tmpfs` nesse caminho: depois do comando, `docker volume ls` só mostrava `est-dk05_dados`.

**ATENÇÃO:** volumes anónimos são o lixo mais comum do Docker. Em Compose, dá sempre nome ao volume ou neutraliza o `VOLUME` da imagem (como acima), e usa `docker compose rm -v` ou `down -v` quando quiseres mesmo apagá-los.

## Vários ficheiros: override e produção

O Compose consegue juntar vários ficheiros. Dois padrões que vais usar:

1. **compose.override.yaml**: se existir ao lado do `compose.yaml`, o Compose lê-o **automaticamente** a seguir. Serve para o que é só do teu ambiente de desenvolvimento.
2. **Ficheiros com -f explícito**: `-f compose.yaml -f compose.prod.yaml`. Quando usas `-f`, o override automático **não** é lido.

O `compose.override.yaml` do exemplo muda a mensagem, publica a base de dados só no localhost (`127.0.0.1:30051`) e define a regra do `watch` (próxima secção). O `compose.prod.yaml` só acrescenta reinício automático e outra mensagem:

    services:
      api:
        restart: unless-stopped
        environment:
          MENSAGEM: "produção"
      db:
        restart: unless-stopped

Valores simples do último ficheiro ganham; mapas (como `environment`) juntam-se chave a chave; listas como `ports` somam-se. Confirma o resultado com `config`, que é a forma de ver o que o Compose vai realmente fazer:

    docker compose -p est-dk05 -f compose.yaml -f compose.prod.yaml config | grep -E "restart|MENSAGEM|published"

        restart: unless-stopped
          MENSAGEM: produção
            published: "30050"
        restart: unless-stopped

Em modo produção a `db` já não publica a porta 30051 (vinha do override, que não foi lido). Ao levantar com os dois ficheiros, o `docker inspect` mostrou a política `unless-stopped` nos dois contentores e a API respondeu `{"estado": "ok", "mensagem": "produção"}`.

| Comando | Ficheiros lidos |
| --- | --- |
| docker compose up | compose.yaml e compose.override.yaml |
| docker compose -f compose.yaml -f compose.prod.yaml up | Só os dois indicados |

**NOTA:** esta é a forma simples de separar ambientes e serve para perceberes a junção de ficheiros. Não é uma estratégia de produção completa.

## docker compose watch

Em desenvolvimento não queres reconstruir a imagem a cada linha de código. O `develop.watch` (no override) diz ao Compose que ficheiros observar e o que fazer:

    develop:
      watch:
        - action: sync+restart
          path: ./app.py
          target: /app/app.py
        - action: rebuild
          path: ./requirements.txt

Com `sync+restart`, uma alteração em `app.py` é copiada para o contentor e este reinicia; com `rebuild`, a imagem é reconstruída. Experimenta, com o projeto já a correr, e deixa o comando num terminal:

    docker compose -p est-dk05 watch --no-up

Ao acrescentar um campo à resposta do `/saude` e gravar o ficheiro:

    Watch enabled
    Syncing service "api" after 1 changes were detected
     Container est-dk05-api-1 Restarting
     Container est-dk05-api-1 Started
    service(s) ["api"] restarted

    curl -s localhost:30050/saude
    {"estado": "ok", "versao": 2, "mensagem": "override de desenvolvimento"}

Pára o `watch` com Ctrl+C.

**NOTA:** só testei `sync+restart`. Existem outras ações (`sync`, `sync+exec`, `rebuild`): confirma-as na documentação do file watch.

## down, down -v e os seus riscos

`docker compose down` remove contentores e redes mas **mantém os volumes**: depois de um `down` e de um novo `up`, a lista de tarefas continuava lá (`[{"id": 1, "titulo": "aprender Compose"}]`). É a razão de existirem os volumes nomeados.

    docker compose -p est-dk05 down -v

    Volume est-dk05_dados Removing
    Volume est-dk05_dados Removed

Com `-v`, o Compose apaga também os volumes **nomeados declarados no ficheiro**. Depois de um novo `up`, `curl localhost:30050/tarefas` devolveu `[]`: a base de dados foi criada de novo, vazia.

| Comando | Contentores | Redes | Volumes nomeados |
| --- | --- | --- | --- |
| docker compose stop | Parados | Ficam | Ficam |
| docker compose down | Removidos | Removidas | Ficam |
| docker compose down -v | Removidos | Removidas | Apagados (dados perdidos) |

**ATENÇÃO:** `down -v` é irreversível e é um erro comum de quem só queria "limpar". Antes de o usares, vê com `docker volume ls` o que vai desaparecer e confirma o nome do projeto com `-p`. Para um projeto de estudo é exatamente o comando certo; para uma base de dados com dados que importam, faz antes a cópia de segurança do módulo 04. Nunca uses `docker volume prune` como atalho.

## Resumo

- O Compose descreve o conjunto num ficheiro; `docker compose -p NOME up -d --build` levanta tudo.
- Usa `service_healthy` com um healthcheck real; a forma curta de `depends_on` só espera pelo arranque.
- O `.env` preenche `${...}` no ficheiro; `env_file` e `environment` entregam variáveis ao contentor.
- Perfis escondem serviços opcionais; `compose.override.yaml` é automático, `-f` é explícito.
- `docker compose config` é o teu amigo, mas imprime segredos.
- Volumes sempre com nome; `down -v` apaga os dados.

## Exercícios

**PRATICAR:** resolve os exercícios 17 a 20 (um serviço com depends_on e healthcheck, variáveis e .env, perfis e override, ciclo de vida com down e down -v). Estão no módulo de exercícios e as soluções no gabarito.

## Fontes oficiais

- Visão geral do Compose: https://docs.docker.com/compose/
- Começar com o Compose: https://docs.docker.com/compose/gettingstarted/
- Referência do ficheiro Compose: https://docs.docker.com/reference/compose-file/
- Serviços (image, build, ports, env_file, depends_on, healthcheck, profiles): https://docs.docker.com/reference/compose-file/services/
- Redes: https://docs.docker.com/reference/compose-file/networks/
- Volumes: https://docs.docker.com/reference/compose-file/volumes/
- Definir variáveis de ambiente: https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/
- Precedência das variáveis: https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/
- Interpolação de variáveis: https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/
- Ordem de arranque: https://docs.docker.com/compose/how-tos/startup-order/
- Perfis: https://docs.docker.com/compose/how-tos/profiles/
- Juntar ficheiros Compose: https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/
- Compose watch: https://docs.docker.com/compose/how-tos/file-watch/
- docker compose (CLI): https://docs.docker.com/reference/cli/docker/compose/
- docker compose up: https://docs.docker.com/reference/cli/docker/compose/up/
- docker compose down: https://docs.docker.com/reference/cli/docker/compose/down/
- docker compose config: https://docs.docker.com/reference/cli/docker/compose/config/
- docker compose exec: https://docs.docker.com/reference/cli/docker/compose/exec/
- docker compose run: https://docs.docker.com/reference/cli/docker/compose/run/
- docker compose watch: https://docs.docker.com/reference/cli/docker/compose/watch/
