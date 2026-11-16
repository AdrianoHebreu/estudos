# 06 Boas práticas e diagnóstico

Já sabes construir imagens, ligar contentores e guardar dados. Falta o que separa um exemplo de aula de algo que podes pôr em produção: imagens pequenas e reproduzíveis, processos sem privilégios, segredos fora da imagem, contentores com limites, entrega por registo e, sobretudo, saber o que fazer quando algo corre mal. Todos os comandos foram executados na máquina de teste (Docker Engine 29.9.3, Docker Desktop no Windows 11, contentores Linux, Git Bash). Os nomes usam o prefixo `est-dk06-` e as portas vão de 30060 a 30069. Os ficheiros estão em `06-Boas-Praticas-e-Diagnostico/exemplos/` (o serviço de tarefas em memória do módulo 03, um Dockerfile endurecido e um `compose.segredos.yaml`).

**NOTA:** os valores de segredo desta aula são fictícios (`valor-ficticio-so-para-estudo`). Nunca ponhas um segredo real num ficheiro de exemplo, num repositório ou num comando que fique no histórico da shell.

## Imagens pequenas e reproduzíveis

Uma imagem reproduzível é aquela que, construída hoje ou daqui a seis meses, parte da mesma base. Três regras:

- Usa uma base **oficial** e do tamanho certo. `python:3.13-slim` pesa 118 MB (o módulo 03 mede as alternativas) e `python:3.13-alpine` é menor, mas usa a biblioteca musl em vez da glibc, o que pode dar problemas com pacotes Python com código compilado. Começa pela slim.
- Fixa a **tag precisa** (`3.13-slim`, nunca `latest` nem só `3`): a tag `latest` muda sem avisar.
- Fixa o **digest** quando precisares de garantia absoluta. Uma tag pode ser reapontada para outra imagem, um digest não. Vês o digest de uma imagem local assim:

    docker pull python:3.13-slim
    docker image inspect python:3.13-slim --format "{{index .RepoDigests 0}}"

    python@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90

E usa-o no Dockerfile, com a tag à frente para os humanos lerem (quando há digest, é ele que manda):

    FROM python:3.13-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90

**ATENÇÃO:** um digest fixo também fixa as vulnerabilidades dessa base. Tens de o atualizar de propósito (por exemplo com uma rotina semanal ou uma ferramenta que abra pedidos de alteração) em vez de o esquecer para sempre.

O resto do módulo 03 continua válido: `.dockerignore`, cache de camadas e multi-stage. O `.dockerignore` desta aula acrescenta `segredos/`, para que ficheiros de segredos nunca entrem no contexto de build.

## Utilizador sem privilégios

Por omissão o processo corre como root, e root dentro do contentor é root a falar com o mesmo kernel do anfitrião. O Dockerfile endurecido (`exemplos/Dockerfile`) cria um utilizador de sistema com UID fixo e usa `USER`:

    RUN groupadd --system --gid 10001 app \
     && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app
    COPY --chown=app:app app.py .
    USER app

Construí duas versões e comparei (a ingénua é o `Dockerfile.ingenua`: tag solta, `COPY . .`, tudo como root):

    docker build -t est-dk06-tarefas:ingenua -f Dockerfile.ingenua .
    docker build -t est-dk06-tarefas:1.0 .
    docker run -d --name est-dk06-api -p 127.0.0.1:30060:8000 est-dk06-tarefas:1.0
    docker exec est-dk06-api id

    uid=10001(app) gid=10001(app) groups=10001(app)

A versão ingénua deu `uid=0(root)`. Um UID numérico fixo (10001) facilita a vida a volumes e orquestradores, que muitas vezes validam "não é root" pelo número.

**NOTA:** podes abrir portas abaixo de 1024 mesmo sem ser root. Em Docker Desktop, `cat /proc/sys/net/ipv4/ip_unprivileged_port_start` dentro de um contentor deu 0, e o serviço correu com `PORT=80` sem erro. Não contes com isto noutros sistemas: a configuração vem do kernel do anfitrião.

## Segredos: nunca em ENV nem na imagem

Uma palavra-passe, um token ou uma chave de API **não pode** estar:

- num `ENV` ou `ARG` do Dockerfile (fica na imagem e no `docker history`);
- num ficheiro copiado com `COPY . .` (fica numa camada, mesmo que o apagues depois);
- numa variável `-e` que fica gravada nos metadados do contentor.

Prova com a imagem ingénua, que tinha `ENV API_TOKEN=valor-ficticio-so-para-estudo`:

    docker inspect est-dk06-ing --format "{{json .Config.Env}}"
    docker history est-dk06-tarefas:ingenua --no-trunc --format "{{.CreatedBy}}" | grep API_TOKEN

    [...,"PORT=8000","API_TOKEN=valor-ficticio-so-para-estudo"]
    ENV API_TOKEN=valor-ficticio-so-para-estudo

Quem tiver acesso à imagem (ou ao socket do Docker) vê o valor. Duas alternativas:

**Em tempo de execução: secrets do Compose.** O Compose monta o segredo como ficheiro em `/run/secrets/NOME`, e a aplicação lê o ficheiro. Só o caminho vai para o ambiente. Em `compose.segredos.yaml`: o serviço declara `secrets: [api_token]`, o bloco `secrets` aponta para `./segredos/api_token.txt` e a variável `API_TOKEN_FILE=/run/secrets/api_token` leva só o caminho.

    docker compose -f compose.segredos.yaml up -d
    docker exec est-dk06-tarefas-1 sh -c "id; cat /run/secrets/api_token; env | grep API_TOKEN"
    docker inspect est-dk06-tarefas-1 | grep -c valor-ficticio

    uid=10001(app) gid=10001(app) groups=10001(app)
    valor-ficticio-so-para-estudo
    API_TOKEN_FILE=/run/secrets/api_token
    0

O utilizador `app` consegue ler o ficheiro e o `docker inspect` não contém o valor (zero ocorrências). O ficheiro apareceu com permissões `rwxrwxrwx` e dono root: no Docker Desktop vêm do ficheiro do anfitrião. Em Linux as permissões dependem do ficheiro de origem; ajusta-as para que só o teu utilizador (e o do contentor) as leia. Não testei em Linux. As aplicações que precisam do segredo têm de ler o ficheiro: algumas imagens oficiais aceitam variáveis terminadas em `_FILE` para isso (confirma na documentação de cada imagem).

**Em tempo de build: build secrets.** Quando o `docker build` precisa de um segredo (por exemplo uma chave para instalar um pacote privado), usa `RUN --mount=type=secret`. O segredo existe só durante essa instrução. O `exemplos/Dockerfile.buildsecret` lê-o e escreve o tamanho:

    RUN --mount=type=secret,id=token sh -c 'echo "token com $(wc -c < /run/secrets/token) caracteres"'

    docker build --no-cache --progress=plain --secret id=token,src=segredos/api_token.txt -t est-dk06-bs -f Dockerfile.buildsecret .
    docker history est-dk06-bs --no-trunc --format "{{.CreatedBy}}" | grep -c valor-ficticio

    #5 0.467 token com 29 caracteres
    #6 0.764 ls: cannot access '/run/secrets': No such file or directory
    0

A instrução seguinte já não vê o ficheiro e o valor não aparece no histórico. Sem o `--secret` o mesmo build falha (`cannot open /run/secrets/token: No such file`), o que é o comportamento certo.

## Vulnerabilidades

Uma imagem herda as falhas de segurança dos pacotes da base. Reduz a superfície com bases pequenas, sem ferramentas que não usas, e atualiza as bases com regularidade. Para analisar existe o `docker scout`: confirma a versão com `docker scout version`. Na máquina de teste está instalado (v1.28.0), mas pede `docker login` e eu não iniciei sessão com nenhuma conta, por isso **não executei nenhuma análise e não mostro resultados**. O fluxo habitual, descrito na documentação, é `docker scout quickview IMAGEM` para o resumo e `docker scout cves IMAGEM` para a lista. Confirma na documentação os limites do plano gratuito.

## Contentor só de leitura, capacidades e limites

Um contentor comprometido tenta escrever no sistema de ficheiros, ganhar privilégios e consumir tudo. Cada uma tem uma flag:

| Flag | Efeito |
| --- | --- |
| --read-only | Sistema de ficheiros raiz só de leitura |
| --tmpfs /tmp | Pasta temporária em memória, a única gravável |
| --cap-drop ALL | Remove todas as capacidades Linux (acrescentas só as que precisares) |
| --security-opt no-new-privileges | O processo não ganha mais privilégios (por exemplo através de binários setuid) |
| --memory 128m, --cpus 0.5 | Limites de memória e de CPU (módulo 02) |
| --pids-limit 100 | Máximo de processos, trava bombas de processos |

    docker run -d --name est-dk06-ro --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges -p 127.0.0.1:30062:8000 est-dk06-tarefas:1.0
    curl -s localhost:30062/saude
    docker exec est-dk06-ro sh -c "grep -E 'Cap(Eff|Prm)|NoNewPrivs' /proc/1/status"
    docker run --rm --read-only est-dk06-tarefas:1.0 python -c "open('/tmp/a','w')"

    {"estado": "ok"}
    CapPrm:	0000000000000000
    CapEff:	0000000000000000
    NoNewPrivs:	1
    OSError: [Errno 30] Read-only file system: '/tmp/a'

O serviço continuou a funcionar sem nenhuma capacidade e sem escrever em disco. Se uma aplicação precisar de gravar, dá-lhe um volume nomeado ou um `--tmpfs` só para essa pasta. O `docker diff est-dk06-ro` não listou nenhuma alteração ao sistema de ficheiros.

**NOTA:** o `--memory` e o `--cpus` já foram demonstrados no módulo 02 (inclui o `OOMKilled=true`). O `compose.segredos.yaml` combina tudo em ficheiro (`read_only`, `tmpfs`, `cap_drop`, `security_opt`, `mem_limit`, `cpus`, `pids_limit`) e o `docker inspect` confirmou `ro=true mem=134217728 nano=500000000 pids=100 caps=[ALL]`.

## Logs que não enchem o disco

Com o driver por omissão (`json-file`), os logs de cada contentor crescem **sem limite** num ficheiro no anfitrião. Em produção isso acaba em disco cheio. Define sempre rotação:

    docker run -d --name est-dk06-log --log-opt max-size=10k --log-opt max-file=3 est-dk06-tarefas:1.0 sh -c 'i=0; while [ $i -lt 2000 ]; do echo "linha $i com algum texto"; i=$((i+1)); done; sleep 30'
    docker logs est-dk06-log | wc -l
    docker logs --tail 1 est-dk06-log

    293
    linha 1999 com algum texto para encher o ficheiro

Escreveu 2000 linhas e só ficaram as últimas 293: o resto foi rodado e apagado. Em Compose é `logging: options: max-size / max-file` (está no ficheiro de exemplo). Para ler: `docker logs -f`, `--tail N`, `--since 10m` e `-t` (hora de cada linha). A aplicação deve escrever para o stdout e stderr, não para ficheiros dentro do contentor. Para um driver de logs central (syslog, Loki, etc.), vê a documentação.

## Registos e entrega de imagens

Uma imagem só chega a outra máquina se estiver num **registo**. O nome completo é `registo/repositório:tag`. Sem registo no nome, o Docker assume o Docker Hub:

    docker push est-dk06-tarefas:1.0

    denied: requested access to the resource is denied

O Docker tentou enviar para `docker.io/library/est-dk06-tarefas` (sem permissão). Para enviar para outro destino, **re-etiqueta** a imagem com o nome do registo. Para praticar sem contas, sobe o teu registo local com a imagem oficial `registry:2`, com volume nomeado (a imagem declara um volume, e sem nome ficaria anónimo):

    docker volume create est-dk06-regdados
    docker run -d --name est-dk06-registry -p 127.0.0.1:30060:5000 -v est-dk06-regdados:/var/lib/registry registry:2
    docker tag est-dk06-tarefas:1.0 localhost:30060/est-dk06-tarefas:1.0
    docker push localhost:30060/est-dk06-tarefas:1.0

    1.0: digest: sha256:e43091efc057ab0db17f82fc4a27f7a607234ec7f1fe202284216a6bcea79d5d size: 1780

O registo tem uma API HTTP. Confirma o que lá está, apaga a cópia local e puxa-a de volta:

    curl -s localhost:30060/v2/_catalog
    curl -s localhost:30060/v2/est-dk06-tarefas/tags/list
    docker rmi localhost:30060/est-dk06-tarefas:1.0
    docker pull localhost:30060/est-dk06-tarefas:1.0

    {"repositories":["est-dk06-tarefas"]}
    {"name":"est-dk06-tarefas","tags":["1.0"]}
    Status: Downloaded newer image for localhost:30060/est-dk06-tarefas:1.0

**ATENÇÃO:** o `localhost` funciona sem TLS porque o Docker o trata como seguro. Um registo noutra máquina precisa de HTTPS (ou de configuração explícita de registo inseguro, que não deves usar fora de testes). Este registo também não tem autenticação nenhuma: serve só para estudo. Em produção usa o teu fornecedor (Docker Hub, GitHub Container Registry, registos das clouds) com `docker login` e credenciais de acesso limitadas.

## CI: visão geral (não executada)

Integração contínua (CI) é uma máquina que, a cada alteração ao código, faz build da imagem, testa e publica. **Esta secção não foi executada**: é só o esboço de um fluxo do GitHub Actions. As versões das ações do Docker são as da página oficial no dia em que a consultei (confirma sempre as atuais):

    on:
      push:
        tags: ["v*"]
    jobs:
      imagem:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: docker/login-action@v4
            with:
              username: ${{ secrets.DOCKERHUB_USERNAME }}
              password: ${{ secrets.DOCKERHUB_TOKEN }}
          - uses: docker/build-push-action@v7
            with:
              push: true
              tags: o-teu-utilizador/tarefas:${{ github.ref_name }}

As credenciais ficam nos secrets do repositório, nunca no ficheiro. O fluxo típico: build, testes dentro de um contentor, análise de vulnerabilidades, push só quando tudo passa.

## Orquestração: visão geral (não executada)

Um Docker simples corre numa máquina. Para muitas máquinas, reinícios automáticos, atualizações sem paragem e escala, usam-se orquestradores. **Não os executei nem os ensino aqui**; cada um merece um curso:

O **Docker Swarm** é o modo cluster incluído no Docker (`docker swarm init`), mais simples e com conceitos próximos do Compose. O **Kubernetes** é uma plataforma separada, o padrão da indústria, com vocabulário próprio (pods, deployments, services). Ambos substituem tarefas que falham os healthchecks.

Tudo o que aprendeste (imagens pequenas, utilizador não root, segredos como ficheiros, healthchecks, logs no stdout) é exatamente o que os orquestradores esperam de ti.

## Diagnóstico passo a passo

Antes de mexeres em nada, faz sempre a mesma pergunta pela mesma ordem: o contentor está a correr (`docker ps -a`)? O que diz o `docker logs`? Qual o código de saída (`docker inspect --format "{{.State.ExitCode}}"`, ver módulo 02)? Só depois testas a rede. Cada caso abaixo foi reproduzido.

### 1. O contentor sai logo

    docker run --name est-dk06-d1 est-dk06-tarefas:1.0 python nao_existe.py
    docker inspect est-dk06-d1 --format "exit={{.State.ExitCode}} oom={{.State.OOMKilled}}"
    docker run --name est-dk06-d1c est-dk06-tarefas:1.0 pyhton app.py
    docker inspect est-dk06-d1c --format "exit={{.State.ExitCode}}"

    python: can't open file '/app/nao_existe.py': [Errno 2] No such file or directory
    exit=2 oom=false
    exit=127

| Sintoma | Causa provável | Verificação |
| --- | --- | --- |
| Exited (2) com mensagem do programa | Erro do próprio programa (aqui, ficheiro em falta) | docker logs |
| Exited (127) e erro do Docker | Comando inexistente (aqui, erro de escrita em pyhton) | docker logs e o texto do CMD |
| Exited (137) com OOMKilled true | Falta de memória | limite --memory, ver módulo 02 |

### 2. A porta não responde

O contentor está de pé, mas o `curl` falha. Servi uma página com o servidor HTTP do Python preso a 127.0.0.1:

    docker run -d --name est-dk06-d2 -p 127.0.0.1:30063:8000 python:3.13-slim python -m http.server --bind 127.0.0.1 8000
    curl -s -m 5 -o /dev/null -w "http=%{http_code}\n" localhost:30063/
    docker exec est-dk06-d2 python -c "import urllib.request;print(urllib.request.urlopen('http://127.0.0.1:8000').status)"

    http=000
    200

Por dentro responde (200), por fora não (000, o `curl` terminou com o código 52, resposta vazia). A aplicação só escuta a interface de loopback **do contentor**, e as ligações que chegam pela porta publicada entram por outra interface. Corrige a aplicação para escutar em `0.0.0.0` (`--bind 0.0.0.0`): o `curl` passou a dar `http=200`. Outra causa clássica é o mapeamento errado: com `-p 127.0.0.1:30063:80` e a aplicação na 8000, o `docker port` mostra `80/tcp -> 127.0.0.1:30063` e o `curl` falha com 000. Compara sempre a porta publicada (`docker port`) com a porta em que o programa escuta. Se a porta do anfitrião estiver ocupada, o `docker run` falha com `port is already allocated`.

### 3. Sem espaço em disco

O sintoma é `No space left on device`. Pode ser o disco do anfitrião (imagens, volumes, cache de build) ou um sistema de ficheiros do contentor. Reproduzi o segundo caso com um tmpfs de 1 MB:

    docker run --rm --tmpfs /dados:size=1m est-dk06-tarefas:1.0 sh -c "dd if=/dev/zero of=/dados/enche bs=1k count=2000; df -h /dados"

    dd: error writing '/dados/enche': No space left on device
    tmpfs           1.0M  1.0M     0 100% /dados

Para o disco do anfitrião, começa por ver quem ocupa o espaço com `docker system df` (só leitura, seguro): mostra imagens, contentores, volumes e cache de build, com a coluna RECLAIMABLE. Na máquina de teste havia 3,685 GB em imagens e 240,8 MB de cache de build.

Remove **por nome** o que tiver sido tu a criar (`docker rmi`, `docker rm -v`, `docker volume rm`). Evita os comandos `prune` com volumes: apagam coisas de outros projetos. Os logs sem rotação (secção anterior) são outra causa frequente. No Docker Desktop o disco virtual pode não encolher sozinho depois de apagares dados: confirma na documentação do Docker Desktop.

### 4. DNS entre contentores

O nome de outro contentor não resolve. Dois contentores em redes diferentes não se veem, mesmo com a rede definida pelo utilizador:

    docker network create est-dk06-redea
    docker network create est-dk06-redeb
    docker run -d --name est-dk06-api --network est-dk06-redea est-dk06-tarefas:1.0
    docker run --rm --network est-dk06-redeb python:3.13-slim python -c "import urllib.request;urllib.request.urlopen('http://est-dk06-api:8000/saude')"
    docker network connect est-dk06-redeb est-dk06-api
    docker run --rm --network est-dk06-redeb python:3.13-slim python -c "import urllib.request;print(urllib.request.urlopen('http://est-dk06-api:8000/saude').read())"

    urllib.error.URLError: <urlopen error [Errno -3] Temporary failure in name resolution>
    b'{"estado": "ok"}'

Primeiro falhou com `name resolution`; depois de ligar o `est-dk06-api` também à segunda rede, funcionou. Lista de verificação: os dois estão na **mesma** rede (`docker inspect --format` às redes)? É uma rede definida por ti, não a bridge por omissão (módulo 04)? O nome está certo? Dentro do contentor, usa a porta **interna** (8000), não a publicada.

### 5. Permissões em volumes

A aplicação (utilizador 10001) tenta escrever num volume nomeado novo, que pertence a root:

    docker run --rm -v est-dk06-vol1:/dados est-dk06-tarefas:1.0 python -c "open('/dados/a','w')"

    PermissionError: [Errno 13] Permission denied: '/dados/a'

O módulo 04 corrigiu isto com um `chown` num contentor temporário. A solução melhor é criar a pasta no Dockerfile com o dono certo (`exemplos/Dockerfile.dados`): um volume nomeado **vazio** herda o dono e as permissões da pasta da imagem na primeira montagem.

    RUN mkdir /dados && chown app:app /dados

    docker build -t est-dk06-dados:1.0 -f Dockerfile.dados .
    docker run --rm -v est-dk06-vol2:/dados est-dk06-dados:1.0 sh -c "touch /dados/a && ls -ln /dados"

    -rw-r--r-- 1 10001 10001 0 Nov 16 08:55 a

Isto só vale para volumes novos e vazios. Um volume que já existia com dono root mantém-no. Nos bind mounts em Linux, o dono vem do anfitrião (módulo 04).

## Limpeza

Remove só o que criaste, pelo nome (`docker rm -f -v`, `docker volume rm`, `docker rmi`) e confirma com `docker volume ls` que não ficaram volumes anónimos.

## Exercícios

**PRATICAR:** resolve os exercícios 21 a 24 (endurecer uma imagem, segredos, registo local, diagnóstico). Estão no módulo de exercícios e as soluções no gabarito.

## Fontes oficiais

- Boas práticas para Dockerfiles: https://docs.docker.com/build/building/best-practices/
- Segurança do Docker Engine: https://docs.docker.com/engine/security/
- Build secrets: https://docs.docker.com/build/building/secrets/
- Secrets no Compose: https://docs.docker.com/compose/how-tos/use-secrets/
- Limites de recursos: https://docs.docker.com/engine/containers/resource_constraints/
- Configurar drivers de logs: https://docs.docker.com/engine/logging/configure/
- docker image push: https://docs.docker.com/reference/cli/docker/image/push/
- O que é um registo: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/
- Imagem oficial registry: https://hub.docker.com/_/registry
- Docker Scout: https://docs.docker.com/scout/
- GitHub Actions com Docker: https://docs.docker.com/build/ci/github-actions/
- Docker Swarm: https://docs.docker.com/engine/swarm/
- Kubernetes (visão geral): https://kubernetes.io/docs/concepts/overview/
