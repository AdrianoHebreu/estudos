# 10 Soluções e critérios

Soluções dos exercícios do módulo 8. Todas foram executadas durante a escrita do curso e os resultados mostrados são reais. Há sempre mais de uma solução correta: compara o comportamento, não o código.

## Módulo 01 · Conceitos e primeiros passos

### Exercício 1

    docker run --name est-dk01-ex1 alpine:3.21 echo "ola docker"
    docker ps -a --filter name=est-dk01-ex1
    docker rm -v est-dk01-ex1
    docker ps -a --filter name=est-dk01-ex1 -q

Resultado real:

    ola docker
    NAMES          IMAGE         STATUS
    est-dk01-ex1   alpine:3.21   Exited (0) Less than a second ago
    est-dk01-ex1

O último comando não imprime nada (zero linhas): o contentor já não existe. O contentor terminou logo (o `echo` acabou), por isso não aparece em `docker ps` simples, que lista só os que estão a correr. `Exited (0)` significa que saiu sem erro.

### Exercício 2

    docker run -d --name est-dk01-ex2 -p 30012:80 nginx:alpine
    curl -s http://localhost:30012 | grep -o "<title>.*</title>"
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:30012/nao-existe
    docker logs est-dk01-ex2
    docker stop est-dk01-ex2
    curl -s --max-time 3 -o /dev/null -w "%{http_code}\n" http://localhost:30012
    docker ps -a --filter name=est-dk01-ex2 --format "{{.Status}}"
    docker rm -v est-dk01-ex2

Resultado real (linhas dos registos filtradas para os pedidos):

    <title>Welcome to nginx!</title>
    404
    "GET / HTTP/1.1" 200 896 "-" "curl/7.85.0" "-"
    "GET /nao-existe HTTP/1.1" 404 153 "-" "curl/7.85.0" "-"
    000
    Exited (0) 1 second ago

O código `000` do `curl` significa que a ligação foi recusada: com o contentor parado, ninguém escuta na porta 30012. Em PowerShell usa `curl.exe` no lugar de `curl` e `Select-String` no lugar de `grep`. Os registos (`docker logs`) mostram também a linha de erro do nginx a explicar que o ficheiro pedido não existe.

### Exercício 3

    docker run -d --name est-dk01-ex3a alpine:3.21 sleep 120
    docker run -d --name est-dk01-ex3b alpine:3.21 sleep 120
    docker exec est-dk01-ex3a sh -c "echo segredo > /nota.txt"
    docker exec est-dk01-ex3a cat /nota.txt
    docker exec est-dk01-ex3b cat /nota.txt
    docker diff est-dk01-ex3a
    docker diff est-dk01-ex3b
    docker rm -f -v est-dk01-ex3a est-dk01-ex3b
    docker run --rm alpine:3.21 ls /nota.txt

Resultado real:

    segredo
    cat: can't open '/nota.txt': No such file or directory
    A /nota.txt
    (o diff do segundo contentor não imprime nada)
    ls: /nota.txt: No such file or directory

Cada contentor tem a sua própria camada de escrita por cima das camadas só de leitura da imagem. O ficheiro foi escrito só na camada do primeiro contentor: o segundo não o vê, a imagem não mudou, e quando o primeiro foi removido a camada desapareceu com ele.

### Exercício 4

    docker tag alpine:3.21 est-dk01-base:v1
    docker tag alpine:3.21 est-dk01-base:v2
    docker images --filter reference=est-dk01-base --format "{{.Repository}}:{{.Tag}} {{.ID}}"
    docker rmi est-dk01-base:v1
    docker run -d --name est-dk01-ex4 --memory 32m est-dk01-base:v2 sleep 120
    docker inspect est-dk01-ex4 --format "Memory={{.HostConfig.Memory}}"
    docker exec est-dk01-ex4 uname -r
    docker rm -f -v est-dk01-ex4
    docker rmi est-dk01-base:v2
    docker image inspect alpine:3.21 --format "{{index .RepoDigests 0}}"
    docker run --rm alpine@sha256:bc21487101ae47172509130ee1092cc273a831968d64b617776d1f69c81e42ab echo "por digest"

Resultado real:

    est-dk01-base:v1 e50d940e9d2c
    est-dk01-base:v2 e50d940e9d2c
    Untagged: est-dk01-base:v1
    Memory=33554432
    5.15.167.4-microsoft-standard-WSL2
    Untagged: est-dk01-base:v2
    alpine@sha256:bc21487101ae47172509130ee1092cc273a831968d64b617776d1f69c81e42ab
    por digest

As duas etiquetas apontam para o mesmo ID, por isso `rmi` de uma etiqueta só a «desetiqueta» (`Untagged`) e a imagem fica. O limite de 32 MiB aparece como 33554432 bytes (32 x 1024 x 1024). O `uname -r` devolve o kernel do anfitrião Linux (aqui a VM WSL2 do Docker Desktop): os contentores partilham esse kernel, não trazem o seu. O digest é o do teu pull e pode diferir do mostrado se a imagem tiver sido atualizada.

## Módulo 02 · Contentores no dia a dia

### Exercício 5

    docker create --name est-dk02-ex5 alpine:3.20 sleep 300
    docker ps -a --filter name=est-dk02-ex5 --format "{{.Names}} {{.Status}}"
    docker start est-dk02-ex5
    docker pause est-dk02-ex5
    docker inspect --format "{{.State.Status}}" est-dk02-ex5
    docker unpause est-dk02-ex5
    docker kill est-dk02-ex5
    docker inspect --format "exit={{.State.ExitCode}} oom={{.State.OOMKilled}}" est-dk02-ex5
    docker rm -v est-dk02-ex5
    docker run --name est-dk02-ex5a alpine:3.20 sh -c 'exit 3'; echo "host=$?"
    docker run --name est-dk02-ex5b alpine:3.20 comando-inexistente; echo "host=$?"
    docker ps -a --filter name=est-dk02-ex5 --format "{{.Names}} {{.Status}}"
    docker rm -v est-dk02-ex5a est-dk02-ex5b

Resultado real:

    est-dk02-ex5 Created
    paused
    exit=137 oom=false
    host=3
    host=127
    est-dk02-ex5b Created
    est-dk02-ex5a Exited (3) 1 second ago

O kill dá 137 (128 mais 9, SIGKILL) com OOMKilled=false. O programa que sai com 3 devolve 3. O comando inexistente devolve 127 e, como nem chegou a arrancar, o contentor fica em Created (e não em Exited). No PowerShell, usa $LASTEXITCODE em vez de $?.

### Exercício 6

    printf 'PORT=8000\nAMBIENTE=estudo\n' > est-dk02-ex6.env
    docker run -d --name est-dk02-ex6 -p 30021:80 --env-file est-dk02-ex6.env -e AMBIENTE=teste --memory 64m --cpus 0.25 --restart on-failure:2 nginx:alpine
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:30021/
    docker exec est-dk02-ex6 env
    docker inspect --format "mem={{.HostConfig.Memory}} nano={{.HostConfig.NanoCpus}} restart={{.HostConfig.RestartPolicy.Name}}:{{.HostConfig.RestartPolicy.MaximumRetryCount}}" est-dk02-ex6
    docker stats --no-stream --format "{{.Name}} {{.MemUsage}}" est-dk02-ex6
    docker rm -f -v est-dk02-ex6

Resultado real (do env, só PORT e AMBIENTE):

    200
    PORT=8000
    AMBIENTE=teste
    mem=67108864 nano=250000000 restart=on-failure:2
    est-dk02-ex6 7.465MiB / 64MiB

O valor do -e (teste) prevalece sobre o do ficheiro (estudo); PORT vem do ficheiro. A memória está em bytes (64 MiB = 67108864) e os CPUs em milionésimos de núcleo (250000000 = 0.25). No PowerShell, o printf não existe: cria o ficheiro com um editor.

### Exercício 7

    docker run -d --name est-dk02-ex7 -p 30022:80 nginx:alpine
    echo "<h1>Servico de tarefas em construcao</h1>" > index-ex7.html
    docker cp index-ex7.html est-dk02-ex7:/usr/share/nginx/html/index.html
    curl -s http://localhost:30022/
    curl -s -o /dev/null http://localhost:30022/tarefas
    docker logs est-dk02-ex7 2>&1 | grep "GET /tarefas"
    docker exec est-dk02-ex7 sh -c 'echo "linha do exec" > /tmp/nota.txt'
    docker cp est-dk02-ex7:/tmp/nota.txt ./nota-ex7.txt
    docker diff est-dk02-ex7
    docker stop est-dk02-ex7 ; docker start est-dk02-ex7
    curl -s http://localhost:30022/
    docker rm -f -v est-dk02-ex7
    docker run -d --name est-dk02-ex7 -p 30022:80 nginx:alpine
    curl -s http://localhost:30022/

Resultado real (resumido):

    <h1>Servico de tarefas em construcao</h1>
    2026/11/13 19:08:30 [error] 31#31: *2 open() "/usr/share/nginx/html/tarefas" failed (2: No such file or directory), ...
    172.17.0.1 - - [13/Nov/2026:19:08:30 +0000] "GET /tarefas HTTP/1.1" 404 153 "-" "curl/7.85.0" "-"
    A /tmp/nota.txt
    C /usr/share/nginx/html/index.html
    <h1>Servico de tarefas em construcao</h1>      (depois de stop e start)
    <!DOCTYPE html>                                 (contentor novo: a página original do nginx)

O ficheiro nota-ex7.txt trazido para o anfitrião contém a linha do exec. As alterações vivem na camada de escrita do contentor: sobrevivem a stop e start, mas desaparecem com rm, e o contentor novo parte da imagem limpa. Para dados duradouros usam-se volumes (módulo 04); para alterações repetíveis, um Dockerfile (módulo 03).

### Exercício 8

    docker volume ls -q | wc -l
    docker run -d --name est-dk02-ex8a --label est=dk02 -v /dados alpine:3.20 sleep 300
    docker run -d --name est-dk02-ex8b --label est=dk02 alpine:3.20 sleep 300
    docker ps --filter label=est=dk02 --format "{{.Names}} {{.Status}}"
    VOL=$(docker inspect --format '{{range .Mounts}}{{.Name}}{{end}}' est-dk02-ex8a)
    docker volume ls -q | wc -l
    docker stop -t 1 est-dk02-ex8a est-dk02-ex8b
    docker rm est-dk02-ex8a
    docker volume ls -q | wc -l
    docker volume rm $VOL
    docker rm -v est-dk02-ex8b
    docker run -d --name est-dk02-ex8c -v /dados alpine:3.20 sleep 300
    docker volume ls -q | wc -l
    docker rm -f -v est-dk02-ex8c
    docker volume ls -q | wc -l
    docker ps -a --filter name=est-dk02-

Resultado real (contagens de volumes, pela ordem):

    2    (antes)
    est-dk02-ex8b Up Less than a second
    est-dk02-ex8a Up 1 second
    3    (com o volume anónimo do ex8a)
    3    (depois de docker rm SEM -v: o volume ficou órfão)
    (docker volume rm com o nome guardado: apagou só esse volume)
    3    (ex8c a correr, com o seu volume anónimo)
    2    (depois de docker rm -f -v: voltou ao número inicial)

Sem -v o volume anónimo fica órfão. Como guardaste o nome exato antes de remover o contentor, apagas só esse volume. O docker volume prune apagaria todos os volumes sem contentor, incluindo dados de outros projetos. Os valores 2 e 3 são os desta máquina de teste (a tua contagem será outra); o que conta é a diferença.

## Módulo 03 · Imagens e Dockerfile

### Exercício 9

Dockerfile:

    FROM python:3.13-slim
    WORKDIR /app
    COPY app.py .
    ENV PORT=9000
    EXPOSE 9000
    USER nobody
    CMD ["python", "app.py"]

Comandos:

    docker build -t est-dk03-ex9:1.0 .
    docker run -d --name est-dk03-ex9 -p 30033:9000 est-dk03-ex9:1.0
    curl -s localhost:30033/saude
    curl -s -X POST -H "Content-Type: application/json" -d '{"titulo":"Estudar Dockerfile"}' localhost:30033/tarefas
    curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" -d '{"x":1}' localhost:30033/tarefas
    docker exec est-dk03-ex9 id -u
    docker exec est-dk03-ex9 printenv PORT
    docker stop est-dk03-ex9 && docker rm -v est-dk03-ex9
    docker run -d --name est-dk03-ex9 -e PORT=9100 -p 30034:9100 est-dk03-ex9:1.0
    curl -s localhost:30034/saude

Resultado real:

    {"estado":"ok"}
    {"id":1,"titulo":"Estudar Dockerfile"}
    400
    65534
    9000
    {"estado":"ok"}

O JSON sem o campo titulo devolve 400. O UID 65534 é o do utilizador `nobody`. Com `-e PORT=9100` o `ENV` do Dockerfile é substituído, e o `-p` tem de acompanhar a nova porta interna (30034:9100). No fim: `docker stop est-dk03-ex9` e `docker rm -v est-dk03-ex9`.

### Exercício 10

Variante A (`COPY . .` primeiro) e variante B (`COPY requirements.txt .`, `RUN pip install`, `COPY app.py .`):

    docker build --progress=plain -f Dockerfile.a -t est-dk03-ex10:a .
    docker build --progress=plain -f Dockerfile.b -t est-dk03-ex10:b .
    echo "# mudança" >> app.py
    docker build --progress=plain -f Dockerfile.a -t est-dk03-ex10:a .
    docker build --progress=plain -f Dockerfile.b -t est-dk03-ex10:b .

Resultado real (passo do pip depois de editar o app.py):

    variante A:  #8 [4/4] RUN pip install --no-cache-dir -r requirements.txt
                 #8 DONE 5.1s
    variante B:  #8 [4/5] RUN pip install --no-cache-dir -r requirements.txt
                 #8 CACHED

Na A, o `COPY . .` inclui o `app.py`, que mudou, por isso essa camada e todas as seguintes (incluindo o pip) são refeitas. Na B, o `pip install` só depende do `requirements.txt`, que não mudou, e só se refaz o último `COPY app.py .`. A variante B também refaria o pip se editasses o `requirements.txt` (ou se a imagem base mudasse).

### Exercício 11

Dockerfile.exec:

    FROM python:3.13-slim
    WORKDIR /app
    COPY app.py .
    ENTRYPOINT ["python"]
    CMD ["app.py"]

Dockerfile.shell: igual, mas a última linha é `ENTRYPOINT python app.py` (sem CMD).

    docker build -f Dockerfile.exec -t est-dk03-ex11:exec .
    docker build -f Dockerfile.shell -t est-dk03-ex11:shell .
    docker run -d --name est-dk03-ex11a -p 30035:8000 est-dk03-ex11:exec
    docker run -d --name est-dk03-ex11b -p 30036:8000 est-dk03-ex11:shell
    docker exec est-dk03-ex11a cat /proc/1/cmdline
    docker exec est-dk03-ex11b cat /proc/1/cmdline
    docker stop est-dk03-ex11a
    docker stop est-dk03-ex11b
    docker inspect est-dk03-ex11a --format "exit={{.State.ExitCode}}"
    docker inspect est-dk03-ex11b --format "exit={{.State.ExitCode}}"
    docker rm -v est-dk03-ex11a est-dk03-ex11b
    docker run --rm est-dk03-ex11:exec -c "import sys; print(sys.version_info[:2])"

Resultado real:

    PID 1 (exec):   python app.py
    PID 1 (shell):  /bin/sh -c python app.py
    (os dois respondem {"estado":"ok"} em /saude)
    docker stop exec:   1,5 s, exit=0
    docker stop shell:  4,6 s, exit=137
    (3, 13)

Na forma exec o Python é o PID 1, recebe o SIGTERM e sai com 0. Na forma shell o PID 1 é o `sh`, o sinal não chega ao Python e o Docker acaba por matar com SIGKILL (137). Os tempos absolutos variam com a máquina; o que conta é o código de saída. Na imagem shell, o ENTRYPOINT fica como `/bin/sh -c python app.py` e os argumentos escritos depois da imagem são ignorados: ao tentar o mesmo `-c "..."` o contentor arrancou o servidor e ficou a correr (tive de o parar). O `docker inspect` confirma: Entrypoint=[python] Cmd=[app.py] na exec e Entrypoint=[/bin/sh -c python app.py] Cmd=[] na shell.

### Exercício 12

Ficheiros: `Dockerfile.single` (FROM python:3.13, WORKDIR /app, COPY . ., RUN pip install, CMD), `Dockerfile.multi`:

    FROM python:3.13 AS builder
    WORKDIR /build
    COPY requirements.txt .
    RUN pip install --no-cache-dir --prefix=/instalado -r requirements.txt

    FROM python:3.13-slim
    WORKDIR /app
    COPY --from=builder /instalado /usr/local
    COPY . .
    CMD ["python", "app.py"]

e o `.dockerignore`:

    dados.bin
    .env
    .venv
    Dockerfile*
    __pycache__/

Comandos:

    docker build --progress=plain -f Dockerfile.single -t est-dk03-ex12:single .
    docker run --rm est-dk03-ex12:single ls -a /app
    (criar o .dockerignore)
    docker build --progress=plain -f Dockerfile.single -t est-dk03-ex12:single .
    docker build --progress=plain -f Dockerfile.multi -t est-dk03-ex12:multi .
    docker run --rm est-dk03-ex12:multi ls -a /app
    docker images est-dk03-ex12
    docker history est-dk03-ex12:multi

Resultado real:

    sem .dockerignore:  transferring context: 20.01MB
    /app: .env  .venv  Dockerfile.multi  Dockerfile.single  app.py  dados.bin  requirements.txt
    com .dockerignore:  transferring context: 147B
    /app: .dockerignore  app.py  requirements.txt     (nas duas imagens)
    multi   121MB
    single  1.12GB
    COPY /instalado /usr/local # buildkit   3.05MB

Sem `.dockerignore` o contexto enviado foi de 20 MB e o `.env` (que podia ter segredos) acabou dentro da imagem. Com ele, o contexto é de 147 B. O próprio `.dockerignore` também é copiado por `COPY . .`. O multi-stage deixa de fora tudo o que a fase builder usou, e a imagem final (121 MB) assenta na slim, em vez dos 1,12 GB da imagem de uma fase sobre a base completa. A camada das dependências ocupa 3,05 MB.

## Módulo 04 · Redes e volumes

### Exercício 13

    docker network create est-dk04-rede13
    docker run -d --name est-dk04-web nginx:alpine
    docker run --rm alpine:3.21 wget -T 3 -qO- http://est-dk04-web
    docker run --rm --network est-dk04-rede13 alpine:3.21 wget -T 3 -qO- http://est-dk04-web
    docker network connect est-dk04-rede13 est-dk04-web
    docker run --rm --network est-dk04-rede13 alpine:3.21 wget -qO- http://est-dk04-web
    docker inspect est-dk04-web --format "{{range $n,$c := .NetworkSettings.Networks}}{{$n}} {{end}}"
    docker rm -f -v est-dk04-web
    docker network rm est-dk04-rede13

Resultado obtido:

    wget: bad address 'est-dk04-web'      (caso a, rede por omissão)
    wget: bad address 'est-dk04-web'      (caso b, antes do connect)
    <!DOCTYPE html> ... <title>Welcome to nginx!</title>      (depois do connect)
    bridge est-dk04-rede13

O nginx estava só na rede por omissão, e o DNS por nome funciona apenas dentro da mesma rede definida pelo utilizador. O `docker network connect` liga o contentor em execução à segunda rede, sem o recriar. O contentor ficou em duas redes ao mesmo tempo.

### Exercício 14

    docker run -d --name est-dk04-web -p 127.0.0.1:30041:80 nginx:alpine
    docker port est-dk04-web
    curl -s -o /dev/null -w "localhost:%{http_code}\n" http://localhost:30041
    curl -s -o /dev/null -w "LAN:%{http_code}\n" --max-time 4 http://192.168.1.75:30041
    docker rm -f -v est-dk04-web

O IP local obtém-se com `ipconfig` (Windows) ou `ip addr` (Linux); na máquina de teste era 192.168.1.75, o teu será outro. Resultado obtido:

    80/tcp -> 127.0.0.1:30041
    localhost:200
    LAN:000

Com `127.0.0.1:` o Docker só escuta no loopback do anfitrião, por isso outras máquinas da rede (e o próprio IP da rede local) não chegam à porta. Para uma base de dados em desenvolvimento isso evita expô-la a quem estiver na mesma rede.

### Exercício 15

    docker run -d --name est-dk04-pg -e POSTGRES_PASSWORD=Estudo_2026! -e POSTGRES_DB=tarefas postgres:17
    docker inspect est-dk04-pg --format "{{range .Mounts}}{{.Type}} {{.Name}}{{end}}"
    docker exec est-dk04-pg psql -U postgres -d tarefas -c "CREATE TABLE tarefa(id serial primary key, titulo text); INSERT INTO tarefa(titulo) VALUES ('estudar volumes');"
    docker rm -f -v est-dk04-pg
    docker volume ls

    docker volume create est-dk04-pgdados
    docker run -d --name est-dk04-pg -e POSTGRES_PASSWORD=Estudo_2026! -e POSTGRES_DB=tarefas -v est-dk04-pgdados:/var/lib/postgresql/data postgres:17
    docker exec est-dk04-pg psql -U postgres -d tarefas -c "CREATE TABLE tarefa(id serial primary key, titulo text); INSERT INTO tarefa(titulo) VALUES ('estudar volumes');"
    docker rm -f -v est-dk04-pg
    docker run -d --name est-dk04-pg -e POSTGRES_PASSWORD=Estudo_2026! -e POSTGRES_DB=tarefas -v est-dk04-pgdados:/var/lib/postgresql/data postgres:17
    docker exec est-dk04-pg psql -U postgres -d tarefas -tc "SELECT * FROM tarefa"
    docker rm -f -v est-dk04-pg
    docker volume rm est-dk04-pgdados

(Espera uns segundos pelo arranque do PostgreSQL antes de cada `docker exec`; `docker exec est-dk04-pg pg_isready` indica quando está pronto.) Resultado obtido:

    volume 8f676ad8...ada1                  (volume anónimo criado pela imagem)
    (docker volume ls: sem volumes anónimos depois do docker rm -v; os dados perderam-se)
      1 | estudar volumes                   (com volume nomeado, no segundo contentor)

A imagem declara `/var/lib/postgresql/data` como volume, e sem `-v` nomeado o Docker cria um anónimo, apagado pelo `docker rm -v` (e os dados com ele). Com o volume nomeado os dados sobrevivem ao contentor e o segundo arranque reconhece a base existente.

### Exercício 16

PowerShell (na pasta onde queres o ficheiro; para Git Bash troca `${PWD}` por `$(pwd -W)` e para Linux por `$(pwd)`, e `\` por `/`):

    docker volume create est-dk04-notas
    docker run --rm -v est-dk04-notas:/dados alpine:3.21 sh -c "echo 'nota 1' > /dados/a.txt; echo 'nota 2' > /dados/b.txt"
    docker run --rm -v est-dk04-notas:/dados:ro -v "${PWD}:/backup" alpine:3.21 tar czf /backup/notas.tar.gz -C /dados .
    docker volume rm est-dk04-notas
    docker volume create est-dk04-notas2
    docker run --rm -v est-dk04-notas2:/dados -v "${PWD}:/backup:ro" alpine:3.21 tar xzf /backup/notas.tar.gz -C /dados
    docker run --rm -v est-dk04-notas2:/dados:ro alpine:3.21 sh -c "ls /dados; cat /dados/b.txt; touch /dados/c"
    docker volume rm est-dk04-notas2

Resultado obtido (executado em PowerShell e também em Git Bash com `$(pwd -W)`, com o mesmo resultado):

    a.txt
    b.txt
    nota 2
    touch: /dados/c: Read-only file system

O arquivo `notas.tar.gz` ficou na pasta do anfitrião, sobreviveu à remoção do volume e permitiu recriar os dados num volume novo. Com `:ro` o contentor não consegue escrever. Apaga o ficheiro `notas.tar.gz` quando terminares.

## Módulo 05 · Docker Compose

### Exercício 17

compose.yaml:

    services:
      web:
        image: nginx:alpine
        ports:
          - "127.0.0.1:30053:80"

Comandos:

    docker compose -p est-dk05 config
    docker compose -p est-dk05 up -d
    docker compose -p est-dk05 ps --format "{{.Service}} {{.Status}} {{.Ports}}"
    curl -s -o /dev/null -w "%{http_code}\n" localhost:30053
    docker compose -p est-dk05 logs web --tail 2
    docker compose -p est-dk05 exec web nginx -v
    docker compose -p est-dk05 down
    docker ps -a --format "{{.Names}}" | grep est-dk05
    docker network ls --format "{{.Name}}" | grep est-dk05

Resultado obtido:

    web Up 3 seconds 127.0.0.1:30053->80/tcp
    200
    web-1  | 172.21.0.1 - - [16/Nov/2026:08:55:11 +0000] "GET / HTTP/1.1" 200 896 "-" "curl/7.85.0" "-"
    nginx version: nginx/1.31.8
     Container est-dk05-web-1 Removed
     Network est-dk05_default Removed
    (os dois grep sem resultados)

Sem declarares redes, o Compose cria uma rede por omissão (est-dk05_default) e liga lá o serviço. O down remove o contentor e essa rede. No Windows, no lugar do grep usa findstr ou Select-String (não testado).

### Exercício 18

compose.yaml:

    services:
      web:
        image: nginx:alpine
        ports:
          - "127.0.0.1:${PORTA:-30054}:80"
      eco:
        image: alpine:3.21
        profiles: ["ferramentas"]
        env_file:
          - eco.env
        environment:
          TITULO: ${TITULO:?define TITULO no ficheiro .env}
        command: ["sh", "-c", "echo TITULO=$$TITULO; echo MENSAGEM=$$MENSAGEM"]

Ficheiros: eco.env com MENSAGEM=do env_file e TITULO=do env_file; .env com PORTA=30056 e TITULO=do .env. Comandos:

    docker compose -p est-dk05 config | grep published
    PORTA=30057 docker compose -p est-dk05 config | grep published
    docker compose -p est-dk05 --profile ferramentas run --rm eco
    rm .env
    docker compose -p est-dk05 config

Resultado obtido:

    published: "30056"                  (a, vem do .env)
    published: "30057"                  (b, o terminal ganha ao .env)
    TITULO=do .env                      (c, o environment ganha ao env_file)
    MENSAGEM=do env_file
    error while interpolating services.eco.environment.TITULO: required variable TITULO is missing a value: define TITULO no ficheiro .env      (d)

O $$ no command impede o Compose de substituir a variável: o sh dentro do contentor é que a lê. O .env alimenta as substituições ${...} do compose.yaml (e o Compose lê-o sozinho); o env_file entrega variáveis ao contentor. Em PowerShell, o caso (b) usa $env:PORTA = "30057" antes do comando (não testado).

### Exercício 19

compose.base.yaml:

    services:
      db:
        image: postgres:17
        environment:
          POSTGRES_PASSWORD: Estudo_2026!
        volumes:
          - type: tmpfs
            target: /var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U postgres"]
          interval: 2s
          timeout: 3s
          retries: 20
      cliente:
        image: postgres:17
        entrypoint: ["psql", "postgresql://postgres:Estudo_2026!@db:5432/postgres", "-c", "SELECT 'cliente ligado' AS estado"]
        volumes:
          - type: tmpfs
            target: /var/lib/postgresql/data

compose.started.yaml e compose.healthy.yaml (só muda a condição):

    services:
      cliente:
        depends_on:
          db:
            condition: service_started

Comandos (para cada variante, trocando started por healthy):

    docker compose -p est-dk05 -f compose.base.yaml -f compose.started.yaml up -d
    sleep 12
    docker compose -p est-dk05 -f compose.base.yaml -f compose.started.yaml ps -a --format "{{.Service}} {{.Status}}"
    docker compose -p est-dk05 -f compose.base.yaml -f compose.started.yaml logs cliente
    docker compose -p est-dk05 -f compose.base.yaml -f compose.started.yaml down -v

Resultado obtido com service_started:

    cliente Exited (2) 15 seconds ago
    db Up 11 seconds (healthy)
    cliente-1  | psql: error: connection to server at "db" (172.19.0.2), port 5432 failed: Connection refused

Resultado obtido com service_healthy:

    cliente Exited (0) 14 seconds ago
    db Up 17 seconds (healthy)
    cliente-1  |  cliente ligado
    cliente-1  | (1 row)

Com service_started o cliente arrancou assim que o contentor da db existia, antes de o PostgreSQL aceitar ligações TCP, e falhou com código 2. Com service_healthy o Compose esperou pelo healthcheck e o cliente ligou à primeira. O tmpfs evita o volume anónimo da imagem postgres:17 (depois do down -v não sobrou nenhum volume nem contentor est-dk05). Em Linux ou macOS o sleep é igual; em PowerShell usa Start-Sleep 12 (não testado).

### Exercício 20

Na pasta exemplos/ (Git Bash; em PowerShell define antes $env:API_PORT = "30055", não testado):

    export API_PORT=30055
    docker compose -p est-dk05 up -d --build
    curl -s -X POST -H "Content-Type: application/json" -d '{"titulo":"estudar"}' localhost:30055/tarefas
    curl -s -X POST -H "Content-Type: application/json" -d '{"titulo":"aprender"}' localhost:30055/tarefas
    docker compose -p est-dk05 down
    docker volume ls --format "{{.Name}}" | grep est-dk05
    docker compose -p est-dk05 up -d
    curl -s localhost:30055/tarefas
    docker compose -p est-dk05 -f compose.yaml -f compose.prod.yaml config | grep -c 30051
    docker compose -p est-dk05 config | grep -c 30051
    docker compose -p est-dk05 down -v
    docker volume ls --format "{{.Name}}" | grep est-dk05
    docker compose -p est-dk05 up -d
    curl -s localhost:30055/tarefas
    docker compose -p est-dk05 down -v
    unset API_PORT

Resultado obtido:

    {"id": 1, "titulo": "estudar"}
    {"id": 2, "titulo": "aprender"}
    est-dk05_dados                                   (depois do down, o volume continua)
    [{"id": 1, "titulo": "estudar"}, {"id": 2, "titulo": "aprender"}]
    0                                                (config com -f compose.prod.yaml)
    1                                                (config normal)
     Volume est-dk05_dados Removed                   (down -v)
    (grep sem resultados)
    []                                               (base de dados nova, vazia)

A porta 30051 vem do compose.override.yaml, lido automaticamente no config normal; com -f explícito o override não é lido, por isso a produção não publica a base de dados. O down mantém o volume nomeado e o down -v apaga-o, com os dados. Cuidados antes de usar down -v num projeto real: confirmar com docker volume ls (e com -p) que o volume é mesmo do projeto certo, e ter uma cópia de segurança (módulo 04, ou pg_dump) de tudo o que importa.

## Módulo 06 · Boas práticas e diagnóstico

### Exercício 21

    # Dockerfile (pasta com app.py)
    FROM python:3.13-slim@sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90
    RUN useradd --system --uid 10001 --no-create-home app
    WORKDIR /app
    COPY --chown=app app.py .
    USER app
    CMD ["python", "app.py"]

    docker build -t est-dk06-ex21:1.0 .
    docker run -d --name est-dk06-ex21 --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges --memory 64m --pids-limit 50 -p 127.0.0.1:30061:8000 est-dk06-ex21:1.0
    curl -s localhost:30061/saude
    docker exec est-dk06-ex21 id -u
    docker exec est-dk06-ex21 sh -c "touch /app/x"
    docker inspect est-dk06-ex21 --format "ro={{.HostConfig.ReadonlyRootfs}} mem={{.HostConfig.Memory}} caps={{.HostConfig.CapDrop}}"
    docker rm -f -v est-dk06-ex21
    docker rmi est-dk06-ex21:1.0

Resultado real:

    {"estado": "ok"}
    10001
    touch: cannot touch '/app/x': Read-only file system
    ro=true mem=67108864 caps=[ALL]

O UID 10001 prova que não é root, o erro de escrita prova o sistema de ficheiros só de leitura e o inspect confirma os limites (64 MB são 67108864 bytes).

### Exercício 22

    # compose.yaml
    name: est-dk06ex22
    services:
      api:
        image: est-dk06-ex21:1.0
        secrets: [meu_token]
        environment:
          TOKEN_FILE: /run/secrets/meu_token
    secrets:
      meu_token:
        file: ./token.txt

    printf 'ficticio-ex22' > token.txt
    docker compose up -d
    docker exec est-dk06ex22-api-1 cat /run/secrets/meu_token
    docker inspect est-dk06ex22-api-1 | grep -c ficticio-ex22
    docker compose down -v

    # Dockerfile.bs
    FROM alpine:3.21
    RUN --mount=type=secret,id=chave sh -c 'wc -c < /run/secrets/chave'

    docker build --no-cache --progress=plain --secret id=chave,src=token.txt -t est-dk06-ex22bs -f Dockerfile.bs .
    docker history est-dk06-ex22bs --no-trunc --format "{{.CreatedBy}}" | grep -c ficticio-ex22

Resultado real:

    ficticio-ex22
    0
    #5 0.449 13
    0

O contentor lê o segredo como ficheiro, o inspect não o contém (0) e no build o RUN viu os 13 caracteres sem que o valor ficasse no histórico (0). Um ENV fica gravado nos metadados da imagem e visível a quem a puxar ou a inspecionar.

### Exercício 23

    docker volume create est-dk06-regdados
    docker run -d --name est-dk06-registry -p 127.0.0.1:30060:5000 -v est-dk06-regdados:/var/lib/registry registry:2
    docker tag est-dk06-ex21:1.0 localhost:30060/est-dk06-ex23:1.0
    docker tag est-dk06-ex21:1.0 localhost:30060/est-dk06-ex23:1.1
    docker push localhost:30060/est-dk06-ex23:1.0
    docker push localhost:30060/est-dk06-ex23:1.1
    curl -s localhost:30060/v2/est-dk06-ex23/tags/list
    docker rmi localhost:30060/est-dk06-ex23:1.0 localhost:30060/est-dk06-ex23:1.1
    docker run -d --name est-dk06-ex23 -p 127.0.0.1:30066:8000 localhost:30060/est-dk06-ex23@sha256:3c1ceb45a4801b4aefc4f1440d17d3b8b969636b066dd2b315612866fc6b1127
    curl -s localhost:30066/saude

Resultado real (o digest é o do meu build, o teu será outro):

    1.0: digest: sha256:3c1ceb45a4801b4aefc4f1440d17d3b8b969636b066dd2b315612866fc6b1127 size: 1780
    1.1: digest: sha256:3c1ceb45a4801b4aefc4f1440d17d3b8b969636b066dd2b315612866fc6b1127 size: 1780
    {"name":"est-dk06-ex23","tags":["1.1","1.0"]}
    {"estado": "ok"}

As duas etiquetas têm o mesmo digest: são dois nomes para o mesmo conteúdo. Uma etiqueta pode ser reapontada para outra imagem, o digest identifica sempre o mesmo conteúdo, por isso o deploy por digest é reproduzível.

### Exercício 24

(a) Sintoma: o curl devolve http=000. Diagnóstico:

    docker logs est-dk06-qa
    docker port est-dk06-qa

    A ouvir em 0.0.0.0:9000
    8000/tcp -> 127.0.0.1:30065

Causa: a aplicação escuta na 9000 (por causa de PORT=9000) mas a porta publicada aponta para a 8000. Correção: recriar com -p 127.0.0.1:30065:9000, e o curl devolveu {"estado": "ok"}.

(b) Sintoma: o contentor sai logo.

    docker run --name est-dk06-qb -e PORT=abc est-dk06-tarefas:1.0
    docker inspect est-dk06-qb --format "exit={{.State.ExitCode}} {{.State.Status}}"

    ValueError: invalid literal for int() with base 10: 'abc'
    exit=1 exited

Causa: PORT não é um número, a aplicação falha ao arrancar (código 1, erro do programa). Correção: PORT com um valor numérico.

(c) Sintoma e causa: o volume novo pertence a root e a aplicação corre como 10001.

    docker run --rm -v est-dk06-qvol:/dados est-dk06-tarefas:1.0 python -c "open('/dados/x','w')"
    docker run --rm -v est-dk06-qvol:/dados --user root est-dk06-tarefas:1.0 chown 10001:10001 /dados
    docker run --rm -v est-dk06-qvol:/dados est-dk06-tarefas:1.0 python -c "open('/dados/x','w');print('escreveu')"

    PermissionError: [Errno 13] Permission denied: '/dados/x'
    escreveu

Correção: corrigir o dono uma só vez com um contentor temporário (root só para o chown), mantendo a aplicação sem privilégios. Alternativa definitiva: criar a pasta com chown no Dockerfile antes da primeira montagem.

## Projeto final · Exercício 25

O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 07 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Imagem | Multi-stage, tag fixa, utilizador sem privilégios e tamanho medido contra a versão ingénua | Tag latest, utilizador root, sem medição |
| Saúde | HEALTHCHECK a funcionar e depends_on com service_healthy | A API arranca antes da base de dados |
| Redes | Só o proxy publica porta; a base de dados não responde a partir do anfitrião | Porta do PostgreSQL publicada |
| Dados | Volume nomeado; testaste down contra down -v | Volume anónimo ou dados perdidos sem teres percebido |
| Segredos | Palavra-passe vinda de um segredo e nada na imagem (docker history e docker inspect limpos) | Palavra-passe em ENV |
| Configuração | Override de desenvolvimento e de produção sem duplicar o ficheiro principal | Dois ficheiros quase iguais |
| Diagnóstico | Três falhas provocadas, com sintoma, causa e correção | Só descreves, sem reproduzir |

**DICA:** pede a um colega que arranque o projeto só com o README e confirma que um único comando o deixa limpo no fim.
