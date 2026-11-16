# 01 Conceitos e primeiros passos

No módulo 00 instalaste o Docker e correste o `hello-world`. Agora abres a caixa: o que se passou por baixo, o que é realmente uma imagem e um contentor, e o ciclo de vida básico de um contentor (criar, ver, parar, remover). Todos os comandos foram executados na máquina de teste (Docker Engine 29.9.3 no Docker Desktop, Windows 11, a correr contentores Linux). Os nomes dos contentores usam o prefixo `est-dk01-` e as portas vão de 30010 a 30019.

## Arquitetura: cliente, daemon e registo

Já sabes que o comando `docker` é o cliente e que o daemon (`dockerd`) faz o trabalho. Falta a terceira peça, o **registo** (registry), que guarda imagens. Um pedido típico percorre este caminho:

    docker run nginx:alpine
        cliente   -> envia o pedido ao daemon (API local)
        daemon    -> procura a imagem no disco; se faltar, pede-a ao registo
        registo   -> Docker Hub (por omissão) devolve as camadas da imagem
        daemon    -> cria o contentor a partir da imagem e arranca-o

| Peça | O que faz | Exemplo |
| --- | --- | --- |
| Cliente | Recebe os teus comandos e traduz em pedidos à API | O comando docker |
| Daemon | Gere imagens, contentores, redes e volumes | O processo dockerd |
| Registo | Armazena e distribui imagens | Docker Hub (docker.io) |

O cliente e o daemon podem estar em máquinas diferentes. No Docker Desktop estão: o cliente corre no Windows e o daemon dentro de uma VM Linux (viste `windows/amd64` e `linux/amd64` no módulo 00). Para saberes que daemon e que registo estás a usar:

    docker info --format "Driver={{.Driver}} Registo={{.IndexServerAddress}}"

    Driver=overlay2 Registo=https://index.docker.io/v1/

O `overlay2` é o driver de armazenamento (explicado mais abaixo) e o endereço é o do Docker Hub.

**NOTA:** em PowerShell as aspas duplas à volta do formato funcionam como acima. Em Linux, macOS e Git Bash podes usar aspas simples: `--format '{{.Driver}}'`.

## Imagem e contentor

Estes dois termos são a base de tudo, e a confusão entre eles é o erro mais comum de quem começa.

| Aspeto | Imagem | Contentor |
| --- | --- | --- |
| O que é | Modelo só de leitura com ficheiros e configuração | Instância criada a partir de uma imagem |
| Estado | Não executa nada | Pode estar a correr, parado ou criado |
| Quantas | Uma | Quantos quiseres a partir da mesma imagem |
| Alterações | Imutável: nunca muda depois de construída | Tem uma camada de escrita própria, descartável |
| Analogia | A receita, ou a classe | O prato feito, ou o objeto |
| Comando para listar | docker images | docker ps (só a correr) ou docker ps -a (todos) |

Podes criar vários contentores da mesma imagem, e cada um tem o seu próprio sistema de ficheiros de escrita. Um ficheiro criado num contentor não aparece nos outros nem na imagem. Isto é o que torna os contentores descartáveis: apagas o contentor e a imagem fica intacta, pronta para outro.

## Camadas e sistema de ficheiros em união

Uma imagem não é um ficheiro único: é uma **pilha de camadas** só de leitura. Cada camada guarda apenas as diferenças em relação à anterior (ficheiros adicionados, alterados ou apagados). Podes ver as camadas de uma imagem:

    docker image inspect nginx:alpine --format "{{len .RootFS.Layers}} camadas"
    docker image inspect alpine:3.21 --format "{{len .RootFS.Layers}} camadas"

    8 camadas
    1 camadas

A imagem `alpine:3.21` tem uma só camada; o `nginx:alpine` tem oito. O Docker identifica cada camada por um hash: se duas imagens partilham uma camada, ela é guardada e descarregada uma única vez.

Quando arrancas um contentor, o Docker junta as camadas da imagem e acrescenta por cima uma **camada de escrita** fina. O sistema de ficheiros em união (union filesystem; no teu Docker o driver chama-se `overlay2`) mostra tudo isto ao contentor como uma única árvore de diretórios. Quando o contentor altera um ficheiro da imagem, a alteração fica só na camada de escrita. O comando `docker diff` mostra o que mudou em relação à imagem:

    docker run -d --name est-dk01-alp alpine:3.21 sleep 300
    docker exec est-dk01-alp sh -c "echo ola > /ola.txt; rm /etc/motd; mkdir /dados"
    docker diff est-dk01-alp

    A /dados
    C /etc
    D /etc/motd
    A /ola.txt

`A` é adicionado, `C` é alterado (o diretório `/etc` mudou porque perdeu um ficheiro) e `D` é apagado. O ficheiro `/etc/motd` continua dentro da imagem, só deixou de ser visível neste contentor.

**ATENÇÃO:** a camada de escrita desaparece quando removes o contentor. Dados que precisas de guardar não devem ficar lá. É para isso que existem os volumes (módulo 04). O `docker exec` que usaste acima é explicado no módulo 02; aqui serve só para mexer no contentor.

Mantém este contentor a correr: vais usá-lo já a seguir.

## Namespaces e cgroups, sem exagero

Um contentor não é uma mini-máquina virtual: é um processo normal do kernel Linux ao qual se aplicam dois mecanismos do próprio kernel.

| Mecanismo | O que faz | Exemplo visível |
| --- | --- | --- |
| Namespaces | Isolam o que o processo vê | O contentor só vê os seus processos, a sua rede e o seu nome de máquina |
| Cgroups (control groups) | Limitam o que o processo pode gastar | Um máximo de memória ou de CPU |

Os namespaces criam a ilusão de um sistema próprio. Dentro de um contentor com um `sleep` a correr, a lista de processos mostra o `sleep` como processo número 1 e mais nada do anfitrião:

    docker exec est-dk01-alp ps

    PID   USER     TIME  COMMAND
        1 root      0:00 sleep 300
       20 root      0:00 ps

Depois remove-o: `docker rm -f est-dk01-alp`.

Os ficheiros `/proc/self/ns/` mostram os namespaces do processo (`pid`, `net`, `mnt`, `ipc`, `uts`, entre outros): cada contentor tem os seus. O nome de máquina também é próprio: dentro do contentor, `hostname` devolve o início do ID do contentor (`de71deeeb1c3` na nossa execução).

Os cgroups servem para impor limites. Por omissão um contentor não tem limites; podes pedi-los ao arrancar:

    docker run -d --name est-dk01-lim --memory 64m --cpus 0.5 alpine:3.21 sleep 120
    docker inspect est-dk01-lim --format "Memory={{.HostConfig.Memory}} NanoCpus={{.HostConfig.NanoCpus}}"
    docker stats --no-stream --format "{{.Name}} mem={{.MemUsage}}" est-dk01-lim

    Memory=67108864 NanoCpus=500000000
    est-dk01-lim mem=324KiB / 64MiB

Repara no `64MiB` como máximo. O daemon traduziu as tuas opções em regras de cgroup. Os limites em detalhe ficam para o módulo 06; para já guarda a ideia: namespaces isolam, cgroups limitam.

**NOTA:** como o contentor usa o kernel do anfitrião, `uname -r` dentro de um contentor devolve o kernel da VM do Docker Desktop (na máquina de teste, `5.15.167.4-microsoft-standard-WSL2`), não o do Windows. A forma exata dos ficheiros em `/sys/fs/cgroup` depende da versão dos cgroups da VM (aqui `docker info` indica a versão 1); por isso a aula não depende deles.

Remove o contentor de teste:

    docker rm -f est-dk01-lim

## Docker Hub e imagens oficiais

O Docker Hub (https://hub.docker.com) é o registo público por omissão: quando escreves `nginx`, o Docker procura em `docker.io/library/nginx`. Dentro dele há três tipos de conteúdo que convém distinguir:

| Tipo | Quem mantém | Confiança |
| --- | --- | --- |
| Docker Official Image | Curadoria do Docker, com documentação e atualizações | Ponto de partida recomendado |
| Verified Publisher | Empresas parceiras verificadas pelo Docker | Boa, confirma o publicador |
| Imagem de um utilizador | Qualquer pessoa (nome do tipo utilizador/imagem) | Só se souberes o que estás a descarregar |

As imagens oficiais não têm prefixo de utilizador: `nginx`, `alpine`, `postgres`, `python`. Uma imagem de terceiros tem a forma `utilizador/imagem`.

**ATENÇÃO:** uma imagem executa código na tua máquina. Lê a página da imagem no Docker Hub antes de a usar e desconfia de nomes parecidos com os das oficiais.

## O teu primeiro docker run, em três versões

### hello-world (confirmar que funciona)

    docker run --rm --name est-dk01-hello hello-world

Já o conheces do módulo 00. A opção `--rm` remove o contentor assim que termina. Se a imagem não existir localmente, o Docker descarrega-a primeiro (`Unable to find image 'hello-world:latest' locally`).

### nginx com porta publicada (um serviço)

O `nginx:alpine` é um servidor web numa imagem pequena (cerca de 63 MB em disco). Um contentor escuta numa porta que só existe dentro do seu espaço de rede, por isso, para lhe chegares do anfitrião, **publicas** a porta com `-p PORTA_DO_ANFITRIAO:PORTA_DO_CONTENTOR`:

    docker run -d --name est-dk01-web -p 30010:80 nginx:alpine

O `-d` (detached) corre o contentor em segundo plano e imprime o seu ID. Verifica e testa:

    docker ps --filter name=est-dk01
    curl http://localhost:30010

    CONTAINER ID   IMAGE          STATUS         PORTS                                       NAMES
    526c40f870e2   nginx:alpine   Up 2 seconds   0.0.0.0:30010->80/tcp, [::]:30010->80/tcp   est-dk01-web

    <!DOCTYPE html>
    <html>
    <head>
    <title>Welcome to nginx!</title>

Em PowerShell o `curl` pode ser um alias do `Invoke-WebRequest`; usa `curl.exe http://localhost:30010` ou abre o endereço no browser. Com `docker logs est-dk01-web` vês o pedido que acabaste de fazer (`GET / HTTP/1.1" 200`).

Se a porta do anfitrião já estiver ocupada, o Docker recusa:

    docker: Error response from daemon: ... Bind for 0.0.0.0:30010 failed: port is already allocated

Nesse caso escolhe outra porta do anfitrião ou pára o contentor que a usa. Nota que o contentor falhado fica criado (estado `Created`): remove-o.

**DICA:** a porta do contentor (80, à direita) é decidida pela imagem; a do anfitrião (30010, à esquerda) escolhes tu. Podes ter dois contentores nginx desde que usem portas de anfitrião diferentes.

### alpine interativo (entrar num sistema)

O Alpine é uma distribuição Linux minúscula (cerca de 8 MB). Com `-it` ligas o teu teclado ao contentor e obténs uma shell:

    docker run -it --rm --name est-dk01-alp alpine:3.21 sh

    / # cat /etc/os-release
    NAME="Alpine Linux"
    / # whoami
    root
    / # exit

O `-i` mantém a entrada aberta e o `-t` atribui um terminal. Ao sair, o processo `sh` termina e, como pediste `--rm`, o contentor desaparece. Um contentor vive enquanto o seu processo principal viver: é a regra que explica a maior parte dos comportamentos que vais ver.

**ATENÇÃO:** no Git Bash do Windows, o `-it` pode falhar com a mensagem `the input device is not a TTY`. Usa PowerShell, Windows Terminal ou prefixa o comando com `winpty`. Sem `-t` (só `-i`), a shell lê comandos da entrada, como num pipe, e também funciona.

## Nomes e etiquetas (tags)

O nome completo de uma imagem tem esta forma:

    [registo/][utilizador/]repositório[:etiqueta]
    docker.io/library/nginx:alpine

| Parte | Exemplo | Por omissão |
| --- | --- | --- |
| Registo | docker.io | Docker Hub |
| Utilizador | library | library (imagens oficiais) |
| Repositório | nginx | obrigatório |
| Etiqueta | alpine | latest |

A **etiqueta** identifica uma variante ou versão (`3.21`, `alpine`, `latest`). Quando a omites, o Docker assume `latest`. Mas `latest` é só um nome: não significa «a mais recente», e quem mantém a imagem pode movê-lo quando quiser.

**ATENÇÃO:** em projetos e em produção fixa uma versão (`alpine:3.21`, não `alpine`). O que `latest` aponta hoje pode ser outra coisa amanhã e estragar um ambiente que funcionava.

Uma mesma imagem pode ter várias etiquetas. O `docker tag` só cria um novo nome para a mesma imagem (o ID é o mesmo) e o `docker rmi` de uma etiqueta remove só essa etiqueta:

    docker tag alpine:3.21 est-dk01-alp:v1
    docker images --filter reference=est-dk01-alp --filter reference=alpine --format "{{.Repository}}:{{.Tag}} {{.ID}}"
    docker rmi est-dk01-alp:v1

    alpine:3.21 e50d940e9d2c
    est-dk01-alp:v1 e50d940e9d2c
    Untagged: est-dk01-alp:v1

A forma mais precisa de apontar para uma imagem é o **digest** (hash do conteúdo), por exemplo `alpine@sha256:bc2148...`. Ao contrário das etiquetas, um digest nunca muda. Vês o digest de uma imagem local com `docker image inspect alpine:3.21 --format "{{index .RepoDigests 0}}"`.

## docker pull e docker images

O `docker pull` descarrega uma imagem sem criar contentor. É útil para preparar, atualizar ou verificar uma etiqueta:

    docker pull alpine:3.21

    3.21: Pulling from library/alpine
    871d48e9bf6b: Pull complete
    Digest: sha256:bc21487101ae47172509130ee1092cc273a831968d64b617776d1f69c81e42ab
    Status: Downloaded newer image for alpine:3.21
    docker.io/library/alpine:3.21

Cada linha com hash é uma camada. Se já a tiveres, aparece `Already exists` e não é descarregada de novo. Se a etiqueta não existir, o erro é claro:

    docker pull alpine:nao-existe
    Error response from daemon: manifest for alpine:nao-existe not found: manifest unknown: manifest unknown

O `docker images` lista as imagens locais:

    docker images

    IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
    alpine:3.21          e50d940e9d2c       7.79MB             0B
    hello-world:latest   e2ac70e7319a       10.1kB             0B
    nginx:alpine         7cac34a4d72b         63MB             0B   U

As colunas e os valores variam com a versão do Docker. O que importa: o nome com etiqueta, o ID e o tamanho.

## Ciclo de vida: ps, stop, start, rm

Um contentor passa por vários estados. Os que vais ver:

| Estado | Significa | Como lá chegas |
| --- | --- | --- |
| Created | Existe mas nunca arrancou | docker create, ou um docker run que falhou ao arrancar |
| Up | A correr | docker run, docker start |
| Exited (0) | Terminou. O número é o código de saída, e zero significa sem erro | O processo acabou, ou docker stop |
| Removido | Já não existe | docker rm |

O `docker ps` lista os que estão a correr e o `docker ps -a` lista todos, incluindo os parados. Parar e remover são passos distintos:

    docker stop est-dk01-web
    docker ps -a --filter name=est-dk01
    docker start est-dk01-web
    docker stop est-dk01-web
    docker rm -v est-dk01-web

    NAMES          STATUS
    est-dk01-web   Exited (0) 1 second ago

O `docker stop` pede ao processo principal para terminar (envia o sinal de paragem da imagem; o nginx usa `SIGQUIT`, como mostra `docker history nginx:alpine`) e, passado um tempo de tolerância, força o fim. O `docker start` volta a arrancar o mesmo contentor, com o mesmo nome e a mesma configuração (incluindo a porta). O `docker rm` remove o contentor parado; para um contentor ainda a correr é preciso pará-lo antes (ou usar `docker rm -f`).

Se tentares reutilizar um nome, o Docker recusa:

    docker: Error response from daemon: Conflict. The container name "/est-dk01-web" is already in use by container "526c40f8...". You have to remove (or rename) that container to be able to reuse that name.

**ATENÇÃO:** o `-v` no `docker rm -v` remove também os volumes anónimos criados com o contentor. As imagens que usaste aqui não os criam, mas é um bom hábito: volumes anónimos esquecidos ocupam espaço sem teres um nome para os reconhecer (módulo 04). Neste curso usa sempre `docker rm -v` nos contentores soltos.

As imagens só se removem com `docker rmi`, depois de removeres os contentores que as usam. Nunca uses `docker system prune` e os restantes `prune` para limpar: apagam coisas que não criaste.

**DICA:** adquire o hábito de dar `--name` a tudo. Sem nome, o Docker inventa um (por exemplo `quirky_turing`) e depois não sabes o que é teu.

## Resumo dos comandos

| Comando | Para que serve |
| --- | --- |
| docker run IMAGEM | Cria e arranca um contentor (descarrega a imagem se faltar) |
| docker run -d -p 30010:80 IMAGEM | Em segundo plano, com a porta publicada |
| docker run -it IMAGEM sh | Interativo, com shell |
| docker pull IMAGEM:TAG | Descarrega uma imagem |
| docker images | Lista as imagens locais |
| docker ps e docker ps -a | Lista os contentores a correr ou todos |
| docker stop NOME e docker start NOME | Pára e volta a arrancar um contentor |
| docker rm -v NOME | Remove um contentor parado e os seus volumes anónimos |
| docker rmi IMAGEM | Remove uma imagem local (ou só uma etiqueta) |
| docker diff NOME | Mostra o que mudou em relação à imagem |
| docker tag ORIGEM DESTINO | Cria outro nome para a mesma imagem |

## Exercícios

**PRATICAR:** resolve os exercícios 1 a 4 (ciclo de vida de um contentor, nginx com porta publicada, imagem contra contentor e camada de escrita, etiquetas e limites). Estão no módulo de exercícios e as soluções no gabarito.

## Fontes oficiais

- Visão geral do Docker (arquitetura): https://docs.docker.com/get-started/docker-overview/
- O que é uma imagem: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/
- O que é um contentor: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
- Drivers de armazenamento: https://docs.docker.com/engine/storage/drivers/
- Driver OverlayFS: https://docs.docker.com/engine/storage/drivers/overlayfs-driver/
- Limites de recursos (cgroups): https://docs.docker.com/engine/containers/resource_constraints/
- Docker Hub: https://docs.docker.com/docker-hub/
- Conteúdo de confiança no Docker Hub (imagens oficiais): https://docs.docker.com/docker-hub/image-library/trusted-content/
- Imagem alpine: https://hub.docker.com/_/alpine
- Imagem nginx: https://hub.docker.com/_/nginx
- docker container run: https://docs.docker.com/reference/cli/docker/container/run/
- docker image pull: https://docs.docker.com/reference/cli/docker/image/pull/
- docker container ls: https://docs.docker.com/reference/cli/docker/container/ls/
- docker container stop: https://docs.docker.com/reference/cli/docker/container/stop/
- docker container rm: https://docs.docker.com/reference/cli/docker/container/rm/
- docker image ls: https://docs.docker.com/reference/cli/docker/image/ls/
- docker container diff: https://docs.docker.com/reference/cli/docker/container/diff/
- docker image tag: https://docs.docker.com/reference/cli/docker/image/tag/
