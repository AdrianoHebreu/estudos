# 02 Contentores no dia a dia

Neste módulo aprendes a viver com contentores: arrancá-los com as opções certas, ver o que fazem, entrar neles, medir o que consomem, perceber porque terminaram e limpar o que é teu sem estragar o que é de outros. Como a imagem do serviço de tarefas só é construída no módulo 03, usamos duas imagens pequenas e oficiais: `alpine` (cerca de 8 MB) e `nginx:alpine` (cerca de 63 MB, um servidor web). Tudo foi executado no Docker Desktop 29.9.3 (Windows 11).

## O ciclo de vida de um contentor

Um contentor passa por estados. Os que vais ver no dia a dia:

| Estado | Significado | Como lá chegas |
| --- | --- | --- |
| created | Existe mas nunca arrancou | `docker create` |
| running | O processo principal está a correr | `docker start` ou `docker run` |
| paused | Processos congelados (continuam em memória) | `docker pause` |
| exited | O processo principal terminou (com um código de saída) | `docker stop`, fim normal do programa ou falha |

Um contentor vive enquanto o seu processo principal (o comando indicado na imagem ou no `docker run`) viver. Quando esse processo termina, o contentor passa a `exited`. Experimenta o ciclo completo:

    docker create --name est-dk02-ciclo alpine:3.20 sleep 300
    docker ps -a --filter name=est-dk02 --format "{{.Names}} {{.Status}}"
    docker start est-dk02-ciclo
    docker pause est-dk02-ciclo
    docker ps -a --filter name=est-dk02 --format "{{.Names}} {{.Status}}"

Saídas reais: `Created` na primeira listagem e `Up 1 second (Paused)` na segunda. Depois de `docker unpause` e `docker stop -t 1`, o estado final foi `Exited (137) Less than a second ago`.

`docker run` é a abreviatura de `docker create` mais `docker start` (e, se faltar, `docker pull`). Um contentor `exited` pode voltar a arrancar com `docker start`, e mantém o seu sistema de ficheiros. Só `docker rm` o destrói. Remove este com `-v`, que apaga também os volumes anónimos associados (nunca deixes volumes anónimos para trás):

    docker rm -v est-dk02-ciclo

## As flags de docker run que mais vais usar

A forma geral é `docker run [OPÇÕES] IMAGEM [COMANDO] [ARGUMENTOS]`. Tudo o que vem antes da imagem são opções do Docker; o que vem depois é o comando que corre dentro do contentor.

| Opção | O que faz |
| --- | --- |
| `-d` | Corre em segundo plano (detached) e imprime o ID |
| `-i` | Mantém o stdin aberto |
| `-t` | Aloca um pseudo-terminal. Com `-it` tens uma sessão interativa |
| `--name` | Dá um nome ao contentor |
| `--rm` | Remove o contentor assim que terminar |
| `-p ANFITRIAO:CONTENTOR` | Publica uma porta do contentor numa porta do anfitrião |
| `-e VARIAVEL=valor` | Define uma variável de ambiente |
| `--env-file FICHEIRO` | Lê variáveis de ambiente de um ficheiro |
| `--restart POLITICA` | Define quando o Docker reinicia o contentor |
| `--memory` ou `-m` | Limite de memória (por exemplo 128m) |
| `--cpus` | Limite de CPU (por exemplo 0.5, metade de um núcleo) |
| `--label chave=valor` | Etiqueta o contentor (útil para filtrar e limpar) |

### Interativo ou em segundo plano

Para correr e deitar fora usa `--rm`. Com `-i` podes alimentar o contentor pelo stdin:

    echo "ola pipe" | docker run --rm -i alpine:3.20 cat
    ola pipe

Num terminal a sério (PowerShell, Terminal do macOS, shell do Linux), `docker run --rm -it alpine:3.20 sh` abre uma shell dentro do contentor; sais com `exit`. Quando o stdin não é um terminal, o `-t` falha: obtive `cannot attach stdin to a TTY-enabled container because stdin is not a terminal`.


Para serviços, usa `-d`. Este arranca o nginx com nome, porta publicada, variáveis, política de reinício e limites (a porta 30020 do anfitrião ligada à porta 80 do contentor):

    docker run -d --name est-dk02-web -p 30020:80 -e MODO=desenvolvimento -e PORT=9000 --env-file est-dk02.env --restart unless-stopped --memory 128m --cpus 0.5 nginx:alpine
    curl http://localhost:30020/

O `curl` devolve a página de boas-vindas do nginx (código 200). No PowerShell, `curl` pode ser um alias de outro comando: usa `curl.exe` ou `Invoke-WebRequest`. Para continuar uma linha no PowerShell usa o acento grave no fim; no Bash e no Linux usa a barra invertida.

**NOTA:** o formato de `-p` é anfitrião primeiro, contentor depois. `-p 30020:80` significa que o que chega à porta 30020 do teu computador vai para a porta 80 do contentor. As redes ficam para o módulo 04.

### Variáveis de ambiente

As variáveis de ambiente são a forma de configurar o mesmo contentor em sítios diferentes (a variável `PORT` do serviço de tarefas, por exemplo). O ficheiro `est-dk02.env` do exemplo tinha este conteúdo:

    PORT=8000
    MODO=estudo
    # comentario
    SEGREDO=abc 123

Cada linha é `NOME=valor`, sem aspas, e as linhas com `#` são comentários. Vê o que o contentor recebeu:

    docker exec est-dk02-web env
    SEGREDO=abc 123
    MODO=desenvolvimento
    PORT=9000

Repara: o ficheiro dizia `PORT=8000` e `MODO=estudo`, mas o contentor tem `9000` e `desenvolvimento`, os valores dados com `-e`. Foi o que observei: o `-e` prevalece sobre o `--env-file`. Confirma na documentação se dependes desta regra.

Uma variável só com o nome (`-e MODO`, sem valor) copia o valor do terminal onde corres o comando. Se a variável não existir no anfitrião, não é definida no contentor:

    docker run --rm -e MODO alpine:3.20 sh -c 'echo "[$MODO]"'
    []          (MODO não existia no terminal)
    [do-anfitriao]   (depois de definir MODO=do-anfitriao no terminal)

**ATENÇÃO:** as variáveis de ambiente não são um cofre. Quem corre `docker inspect` ou `docker exec ... env` vê-as, e aparecem no inspect do contentor. Os segredos a sério ficam para o módulo 06.

### Política de reinício

| Política | Comportamento |
| --- | --- |
| no | Nunca reinicia (predefinição) |
| on-failure:N | Reinicia se sair com erro, no máximo N vezes |
| always | Reinicia sempre, e volta a arrancar quando o Docker arranca |
| unless-stopped | Como always, mas respeita um `docker stop` manual |

Um programa que falha sempre, com `on-failure:3`:

    docker run -d --name est-dk02-rest --restart on-failure:3 alpine:3.20 sh -c 'echo arranque; exit 1'
    docker inspect --format "status={{.State.Status}} exit={{.State.ExitCode}} reinicios={{.RestartCount}}" est-dk02-rest
    status=exited exit=1 reinicios=3

O programa correu 4 vezes (a original e 3 reinícios), e o `docker logs` mostrou a palavra `arranque` quatro vezes. Depois o Docker desistiu. Detalhes sobre as políticas na documentação oficial.

### Limites de memória e de CPU

    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.PIDs}}" est-dk02-web
    NAME           CPU %     MEM USAGE / LIMIT   MEM %     PIDS
    est-dk02-web   0.00%     7.664MiB / 128MiB   5.99%     9

O limite de 128 MiB aparece na coluna MEM USAGE / LIMIT. Sem `--memory` o limite é a memória disponível para o Docker (na máquina de teste, 8 GB partilhados). Para ver o `--cpus` em ação, corri um ciclo infinito com `--cpus 0.5`:

    docker run -d --name est-dk02-cpu --cpus 0.5 alpine:3.20 sh -c 'while :; do :; done'
    docker stats --no-stream --format "{{.Name}} {{.CPUPerc}}" est-dk02-cpu
    est-dk02-cpu 49.90%

O contentor queria 100% de um núcleo e ficou limitado a cerca de 50%. A memória é diferente: quem ultrapassa o limite é morto. Provoquei-o com um programa que enche a memória (`tail /dev/zero` acumula linhas sem parar), limitado a 16 MiB:

    docker run --name est-dk02-oom --memory 16m --memory-swap 16m alpine:3.20 tail /dev/zero
    docker inspect --format "exit={{.State.ExitCode}} oom={{.State.OOMKilled}}" est-dk02-oom
    exit=137 oom=true

O campo `OOMKilled=true` confirma que foi falta de memória (OOM, out of memory) e não um `docker kill`.

## Ver o que se passa: logs, exec, top e stats

### docker logs

O Docker guarda tudo o que o processo principal escreve em stdout e stderr. Depois de dois pedidos ao nginx (um com sucesso e um a um caminho inexistente):

    docker logs --tail 3 est-dk02-web
    172.17.0.1 - - [13/Nov/2026:19:05:09 +0000] "GET / HTTP/1.1" 200 896 "-" "curl/7.85.0" "-"
    2026/11/13 19:05:09 [error] 31#31: *3 open() "/usr/share/nginx/html/nao-existe" failed (2: No such file or directory), ...
    172.17.0.1 - - [13/Nov/2026:19:05:09 +0000] "GET /nao-existe HTTP/1.1" 404 153 "-" "curl/7.85.0" "-"

| Opção | Efeito |
| --- | --- |
| `--tail N` | Só as últimas N linhas |
| `-f` | Segue o registo em direto (sai com Ctrl+C, o contentor continua) |
| `-t` | Acrescenta a hora a cada linha |
| `--since 10m` | Só o que apareceu nos últimos 10 minutos |

**DICA:** uma aplicação bem feita para contentores escreve os registos em stdout e stderr, não em ficheiros. É assim que o `docker logs` os apanha.

### docker exec

`docker exec` corre um comando adicional dentro de um contentor que já está a correr. Não cria um contentor novo:

    docker exec est-dk02-web nginx -v
    nginx version: nginx/1.31.8

    docker exec est-dk02-web cat /etc/os-release
    NAME="Alpine Linux"
    ID=alpine

Com `-it` abres uma shell (`docker exec -it est-dk02-web sh`; as imagens alpine têm `sh`, e muitas imagens mínimas não têm `bash`). Só funciona em contentores `running`: num `exited` usa `docker logs` ou arranca um novo.

**ATENÇÃO:** no Git Bash do Windows, caminhos que começam por `/` em argumentos (como `/usr/share/...`) podem ser convertidos em caminhos do Windows antes de chegarem ao Docker. Define `export MSYS_NO_PATHCONV=1` antes do comando. No PowerShell e no Linux isto não acontece.

### docker top e docker stats

`docker top` mostra os processos do contentor, vistos do anfitrião (os PID são os do anfitrião):

    docker top est-dk02-web
    UID    PID    PPID   C   STIME   TTY   TIME       CMD
    root   36826  36801  0   19:05   ?     00:00:00   nginx: master process nginx -g daemon off;
    (mais 8 linhas de processos worker, abreviado)

O primeiro processo é o principal: se ele terminar, o contentor termina. O `docker stats` (já visto acima) mostra o consumo em tempo real; `--no-stream` tira uma só fotografia. Sem esta opção, atualiza continuamente até carregares em Ctrl+C.

## docker inspect e --format

`docker inspect` devolve um grande documento JSON com tudo sobre o objeto. Raramente o queres inteiro: com `--format` (ou `-f`) extrais o que precisas, usando a linguagem de templates do Go:

    docker inspect --format "{{.State.Status}} {{.HostConfig.RestartPolicy.Name}} mem={{.HostConfig.Memory}} nano={{.HostConfig.NanoCpus}}" est-dk02-web
    running unless-stopped mem=134217728 nano=500000000

Repara nas unidades: a memória vem em bytes (128 MiB = 134217728) e os CPUs em milionésimos de núcleo (`NanoCpus` 500000000 = 0.5). Outros exemplos úteis:

| Pergunta | Comando |
| --- | --- |
| Que portas estão publicadas? | `docker inspect --format "{{json .NetworkSettings.Ports}}" NOME` |
| Qual o IP na rede predefinida? | `docker inspect --format "{{.NetworkSettings.Networks.bridge.IPAddress}}" NOME` |
| Que variáveis tem? | `docker inspect --format "{{range .Config.Env}}{{println .}}{{end}}" NOME` |

O comando do IP devolveu `172.17.0.2`. Nesta versão do Docker (29.9.3), o atalho `{{.NetworkSettings.IPAddress}}` deu erro (`map has no entry for key "IPAddress"`), por isso aprende o caminho completo pela rede. O `{{json ...}}` imprime a parte escolhida como JSON, o que ajuda a descobrir a estrutura. Para só veres as portas há ainda `docker port NOME`, que devolveu `80/tcp -> 0.0.0.0:30020`.

## Copiar ficheiros: docker cp

`docker cp` copia entre o anfitrião e o contentor, em qualquer sentido, mesmo com o contentor parado:

    docker cp ola.html est-dk02-web:/usr/share/nginx/html/ola.html
    curl http://localhost:30020/ola.html
    <h1>Ola do anfitriao</h1>

    docker cp est-dk02-web:/etc/nginx/nginx.conf ./nginx-copia.conf

A forma é sempre `origem destino`, e o lado do contentor leva o prefixo `NOME:`. Para ver o que mudou no sistema de ficheiros do contentor face à imagem usa `docker diff NOME`: o ficheiro novo apareceu como `A /usr/share/nginx/html/ola.html` (A de acrescentado, C de alterado).

**ATENÇÃO:** o que copias para um contentor vive na camada de escrita desse contentor. Sobrevive a `docker stop` e `docker start` (confirmei: depois de parar e arrancar, `ola.html` continuou a devolver 200), mas desaparece com `docker rm`. Para dados que têm de durar, usa volumes (módulo 04). Para alterar uma imagem de forma repetível, usa um Dockerfile (módulo 03).

## Códigos de saída

Quando o processo principal termina, o Docker guarda o código de saída. Vê-se em `docker ps -a` (`Exited (N)`) e em `docker inspect`. O `docker run` em primeiro plano devolve o mesmo código ao teu terminal:

| Código | Significado | O que observei |
| --- | --- | --- |
| 0 | Terminou sem erro | O contentor `hello-world` do módulo 00 |
| 1 a 125 (exceto os abaixo) | Erro definido pelo programa | `sh -c 'exit 3'` devolveu 3 |
| 125 | O próprio docker run falhou | Documentado; não o provoquei |
| 126 | O comando existe mas não pode ser executado | `/etc/hostname` como comando: permission denied, código 126 |
| 127 | O comando não foi encontrado | `nao-existe` como comando: código 127 |
| 137 | Morto com SIGKILL (128 mais 9) | `docker kill`, falta de memória, ou `docker stop` que esgotou o tempo |
| 143 | Terminou com SIGTERM (128 mais 15) | Convenção 128 mais o número do sinal; não o provoquei |

A regra geral: um código acima de 128 significa que o processo foi terminado por um sinal (código menos 128). O 137 é o mais famoso. Tem três causas habituais: um `docker kill`, o OOM (confirma com `OOMKilled=true`), ou um `docker stop` em que o programa ignorou o pedido de terminar com calma.

O `docker stop` envia SIGTERM e, passado o tempo de tolerância (por omissão 10 segundos, ajustável com `-t`), envia SIGKILL. Um programa que corre como processo número 1 do contentor e não trata o SIGTERM não reage a ele, como o `sleep 300`: o `docker stop` demorou cerca de 4 segundos e o `docker inspect` deu `exit=137`.

**DICA:** se o `docker stop` da tua aplicação demora sempre, e o código final é 137, a aplicação não está a tratar o SIGTERM. Corrige a aplicação (ou usa a opção `--init`, que a documentação descreve) em vez de aumentares o tempo de espera.

## Nomes automáticos

Se não usares `--name`, o Docker inventa um nome aleatório, da forma adjetivo_apelido. O contentor de teste chamou-se `fervent_leakey`. O nome serve para tudo (`docker logs fervent_leakey`), mas é impossível de prever e de limpar com segurança: com `docker ps -a` não sabes de quem é. Em aulas, scripts e projetos dá sempre um nome, e se o nome vier de um prefixo (como `est-dk02-`) consegues listar e apagar só o teu:

    docker ps -a --filter name=est-dk02-

## Limpeza responsável

Contentores parados continuam a ocupar disco, e os que nunca removes acumulam-se. Mas a limpeza é a parte do Docker onde mais se perdem dados, por isso segue estas regras.

**ATENÇÃO:** o Docker é global à máquina. Todos os contentores, volumes e imagens de todos os teus projetos (e de outras pessoas, num servidor partilhado) aparecem nos mesmos comandos. Só removes o que reconheces como teu.

### Remover: por nome, e só o que é teu

Um contentor a correr não se remove sem o parar (`docker rm` devolve `cannot remove container ... container is running`); `docker rm -f` força, mas mata sem aviso. A opção `-v` apaga os volumes anónimos do contentor; sem ela ficam órfãos e acumulam-se sem que dês por isso. Os volumes nomeados (módulo 04) não são tocados pelo `-v`.

Com o prefixo no nome, lista primeiro, confirma, e só depois apaga:

    docker ps -a --filter name=est-dk02- --format "{{.Names}} {{.Status}}"
    docker rm -v est-dk02-web est-dk02-cpu

Sem o `--filter` apanharias tudo: nunca uses `docker rm -f -v $(docker ps -aq)`.

### Os comandos prune e os seus riscos

Os comandos `prune` apagam em massa:

| Comando | O que remove (resumo) |
| --- | --- |
| docker container prune | Todos os contentores parados |
| docker image prune | Imagens sem etiqueta e sem uso (com a opção -a, todas as que nenhum contentor usa) |
| docker volume prune | Volumes que nenhum contentor usa |
| docker system prune | Contentores parados, redes sem uso, imagens sem etiqueta e cache de construção; volumes só com a opção --volumes |

O risco: um contentor parado não significa um contentor inútil. Podes ter parado uma base de dados para a retomar amanhã, e o `container prune` apaga-a; o `volume prune` (ou o `system prune --volumes`) apaga volumes que parecem sem uso só porque o contentor que os usa está parado. Os dados desaparecem sem remédio. Nunca os corras como hábito, e nunca em máquinas partilhadas ou de trabalho sem leres antes o que existe.

Neste curso, os prune não foram executados em momento algum. Se os quiseres usar de forma consciente, a documentação oficial descreve filtros (por exemplo, por etiqueta ou por idade, com `until`) que limitam o alcance, e o `docker system df` mostra o espaço ocupado sem apagar nada. Confirma a sintaxe dos filtros na documentação antes de os usares. A prática mais segura continua a ser a que usámos: nomes com prefixo, `docker ps -a --filter`, e `docker rm -v` com os nomes à vista.

### Verificar que não sobrou nada

No fim de cada aula, confirma que `docker ps -a --filter name=est-dk02-` vem vazio e que `docker volume ls` e `docker network ls` mostram só o que já lá estava. As imagens (`alpine`, `nginx:alpine`) podes mantê-las, ou removê-las com `docker rmi IMAGEM` se precisares de espaço.

## Exercícios

**PRATICAR:** faz os exercícios 5 a 8 do módulo de exercícios: ciclo de vida e códigos de saída, um nginx com portas, variáveis e limites, registos e inspeção, e uma limpeza segura por prefixo.

## Fontes oficiais

- docker container run: https://docs.docker.com/reference/cli/docker/container/run/
- docker container logs: https://docs.docker.com/reference/cli/docker/container/logs/
- docker container exec: https://docs.docker.com/reference/cli/docker/container/exec/
- docker container inspect: https://docs.docker.com/reference/cli/docker/container/inspect/
- docker container stats: https://docs.docker.com/reference/cli/docker/container/stats/
- docker container top: https://docs.docker.com/reference/cli/docker/container/top/
- docker container cp: https://docs.docker.com/reference/cli/docker/container/cp/
- docker container ls: https://docs.docker.com/reference/cli/docker/container/ls/
- docker container rm: https://docs.docker.com/reference/cli/docker/container/rm/
- docker container pause: https://docs.docker.com/reference/cli/docker/container/pause/
- docker container prune: https://docs.docker.com/reference/cli/docker/container/prune/
- docker system prune: https://docs.docker.com/reference/cli/docker/system/prune/
- Política de reinício: https://docs.docker.com/engine/containers/start-containers-automatically/
- Limites de recursos: https://docs.docker.com/engine/containers/resource_constraints/
- Limpar objetos não usados: https://docs.docker.com/engine/manage-resources/pruning/
- Formatar a saída (templates Go): https://docs.docker.com/config/formatting/
