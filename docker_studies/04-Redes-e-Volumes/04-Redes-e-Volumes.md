# 04 Redes e volumes

Até aqui os contentores viveram isolados e descartáveis. Neste módulo resolves as duas perguntas que aparecem logo a seguir: como é que os contentores falam uns com os outros e com o exterior (redes), e como é que os dados sobrevivem ao contentor que os criou (volumes e bind mounts). Todos os comandos foram executados na máquina de teste (Docker Engine 29.9.3 no Docker Desktop, Windows 11, contentores Linux). Os nomes usam o prefixo `est-dk04-` e as portas vão de 30040 a 30049. Para não gastar espaço, as imagens são `alpine:3.21`, `nginx:alpine` e, só na demonstração de persistência, `postgres:17`.

## Redes: o que o Docker te dá

Cada contentor tem o seu próprio espaço de rede (um namespace, módulo 01). O Docker liga-o a uma **rede** através de um **driver**. Ver as redes existentes:

    docker network ls

Aparecem sempre três redes (`bridge`, `host` e `none`) e os drivers que vais usar são estes:

| Driver | O que faz | Quando usar |
| --- | --- | --- |
| bridge | Rede privada no anfitrião; os contentores ligados falam entre si e saem para fora por NAT | Quase sempre |
| host | O contentor partilha a rede do anfitrião, sem isolamento de rede | Casos especiais de desempenho ou muitas portas |
| none | Só tem a interface de loopback | Trabalho sem rede, isolamento total |

## Bridge por omissão vs bridge definida pelo utilizador

Quando não dizes nada, o contentor entra na rede chamada `bridge` (a bridge por omissão). Tem uma limitação importante: os contentores só se encontram pelo **endereço IP**, não pelo nome. Experimenta com dois contentores:

    docker run -d --name est-dk04-a alpine:3.21 sleep 600
    docker run -d --name est-dk04-b alpine:3.21 sleep 600
    docker inspect est-dk04-b --format "{{.NetworkSettings.Networks.bridge.IPAddress}}"
    docker exec est-dk04-a ping -c 1 est-dk04-b
    docker exec est-dk04-a ping -c 1 172.17.0.4

    172.17.0.4
    ping: bad address 'est-dk04-b'
    64 bytes from 172.17.0.4: seq=0 ttl=64 time=1.510 ms

Por IP funciona; por nome falha. E os IPs mudam sempre que o contentor é recriado, por isso não servem para configurar nada.

**NOTA:** em versões antigas do Docker o IP também aparecia em `.NetworkSettings.IPAddress`. No Docker 29 esse campo já não existe (o comando dá `map has no entry for key`); usa o caminho por rede, como acima.

A solução é criar uma **rede bridge definida pelo utilizador**. Nela o Docker traz um servidor DNS interno: cada contentor é encontrado pelo seu nome (e pelo alias de rede, se o tiver).

    docker rm -f -v est-dk04-a est-dk04-b
    docker network create est-dk04-rede
    docker run -d --name est-dk04-web --network est-dk04-rede nginx:alpine
    docker run --rm --network est-dk04-rede alpine:3.21 sh -c "ping -c 1 est-dk04-web; wget -qO- http://est-dk04-web | head -4"

    PING est-dk04-web (172.19.0.2): 56 data bytes
    64 bytes from 172.19.0.2: seq=0 ttl=64 time=4.701 ms
    <!DOCTYPE html>
    <html>
    <head>
    <title>Welcome to nginx!</title>

O nome `est-dk04-web` resolveu para o IP do contentor e o pedido HTTP foi à porta 80 do nginx, **sem nenhuma porta publicada**. O contentor que faz a pergunta consulta o resolvedor interno, visível no seu `/etc/resolv.conf`:

    nameserver 127.0.0.11

| Aspeto | Bridge por omissão | Bridge definida pelo utilizador |
| --- | --- | --- |
| Resolução por nome | Não (só por IP) | Sim, DNS interno do Docker |
| Isolamento | Todos os contentores sem rede ficam juntos | Só os que ligas à rede |
| Ligar e desligar com o contentor a correr | Não | Sim, com docker network connect e disconnect |
| Como se cria | Já existe | docker network create NOME |

**DICA:** cria sempre uma rede por projeto (por exemplo, uma para o serviço de tarefas e a sua base de dados). O DNS por nome é o que permite escrever `est-dk04-pg` em vez de um IP numa variável como a `DATABASE_URL` do serviço de tarefas. No módulo 05 o Docker Compose faz isto por ti.

Um contentor pode estar em várias redes ao mesmo tempo: o `docker network connect` liga um contentor existente a outra rede e o `docker network inspect` mostra quem está em cada uma.

**ATENÇÃO:** o nome só resolve **dentro** da mesma rede. Um contentor da rede por omissão não vê `est-dk04-web` mesmo que ele exista; o exercício 13 pede-te para o confirmar.

## Redes host e none

Com `--network none` o contentor fica sem rede nenhuma, apenas com o loopback:

    docker run --rm --network none alpine:3.21 sh -c "ip addr | grep inet; wget -T 3 -qO- http://example.com"

        inet 127.0.0.1/8 scope host lo
    wget: bad address 'example.com'

Serve para processar dados sem qualquer acesso à rede. Com `--network host` o contentor usa diretamente a rede do anfitrião: não precisas de `-p`, porque a porta 80 do nginx **é** a porta 80 do anfitrião. Em Linux é assim. No Docker Desktop é diferente: segundo a documentação, o suporte a `host` existe desde a versão 4.34 e tem de ser ativado em Settings, Resources, Network ("Enable host networking"). Na máquina de teste não estava ativado e o resultado foi este:

    docker run -d --name est-dk04-h --network host nginx:alpine
    curl -s -o /dev/null -w "%{http_code}" http://localhost:80

    000

O contentor arrancou (remove-o com `docker rm -f -v est-dk04-h`), mas o Windows não chegou à porta 80. Não ativei a opção, por isso não verifiquei o comportamento com ela ligada.

**ATENÇÃO:** o modo host retira o isolamento de rede e dois contentores não podem escutar a mesma porta. Prefere sempre bridge com `-p`.

## Publicar portas com -p e as suas armadilhas

Numa rede bridge, o anfitrião não consegue chegar à porta de um contentor, a não ser que a **publiques**. Já usaste a forma curta no módulo 01. A forma completa é `-p ENDEREÇO:PORTA_DO_ANFITRIÃO:PORTA_DO_CONTENTOR`. A armadilha está no endereço:

    docker run -d --name est-dk04-web -p 30040:80 -p 127.0.0.1:30041:80 nginx:alpine
    docker port est-dk04-web

    80/tcp -> 0.0.0.0:30040
    80/tcp -> 127.0.0.1:30041
    80/tcp -> [::]:30040

| Forma | Quem consegue chegar | Quando usar |
| --- | --- | --- |
| -p 30040:80 | Todas as interfaces do anfitrião (0.0.0.0 e IPv6): também outras máquinas da rede | Serviços que devem ser públicos |
| -p 127.0.0.1:30041:80 | Só o próprio anfitrião (localhost) | Desenvolvimento, bases de dados, painéis de administração |

O teste a partir do próprio anfitrião, usando o IP da rede local (192.168.1.75 na máquina de teste), mostra a diferença:

    curl -s -o /dev/null -w "%{http_code}" http://192.168.1.75:30040
    curl -s -o /dev/null -w "%{http_code}" http://192.168.1.75:30041

    200
    000

O pedido à porta aberta em 0.0.0.0 foi respondido; o da porta presa a 127.0.0.1 não. Remove o contentor: `docker rm -f -v est-dk04-web`.

**ATENÇÃO:** publicar uma base de dados com `-p 5432:5432` expõe-na a toda a rede onde estás (café, escritório). Para desenvolvimento, publica com `127.0.0.1:`. Em Linux há uma segunda armadilha: o Docker escreve as suas próprias regras de firewall e uma porta publicada pode ficar acessível mesmo que o ufw ou o firewalld a bloqueiem. Lê a página de firewalls na secção de fontes antes de publicares algo em servidores.

Entre contentores da mesma rede usa sempre a porta do contentor (80), nunca a publicada (30040), que serve só para o exterior.

## Falar com o anfitrião: host.docker.internal

Às vezes o contentor precisa de chegar a algo que corre no anfitrião (uma base de dados instalada no teu PC, por exemplo). Dentro do contentor, `localhost` é o próprio contentor, não o anfitrião. No Docker Desktop existe o nome especial `host.docker.internal`, que resolve para o anfitrião:

    docker run --rm alpine:3.21 getent hosts host.docker.internal

    fdc4:f303:9324::254  host.docker.internal  host.docker.internal

Com um servidor HTTP do Python a escutar só em 127.0.0.1:30042 no Windows, o contentor chegou-lhe por esse nome (`wget http://host.docker.internal:30042` devolveu a página). Em Linux (Docker Engine), segundo a documentação, o nome não existe por omissão: adiciona-o com `--add-host`, usando o valor especial `host-gateway`, descrito na documentação do `docker run`:

    docker run --rm --add-host=host.docker.internal:host-gateway alpine:3.21 getent hosts host.docker.internal

Corri-o no Docker Desktop, com o mesmo resultado. Não testei em Linux: confirma na documentação.

## Os dados morrem com o contentor

Já sabes, do módulo 01, que a camada de escrita desaparece com o contentor. Três mecanismos guardam dados fora dela:

| Mecanismo | Onde vive | Gerido por | Típico |
| --- | --- | --- | --- |
| Volume nomeado | Área do Docker (no Docker Desktop, dentro da VM) | Docker | Bases de dados, dados da aplicação |
| Bind mount | Uma pasta tua do anfitrião | Tu | Código em desenvolvimento, ficheiros de configuração |
| tmpfs | Memória RAM do anfitrião | Docker | Segredos, caches temporárias |

Na forma abreviada usas `-v ORIGEM:DESTINO[:ro]`. Na forma longa, `--mount type=...,src=...,dst=...`, que é mais explícita. Distingue-se pela origem: um nome simples (`est-dk04-dados`) é um volume; um caminho (`/home/...` ou `C:\...`) é um bind mount.

## Volumes nomeados e a demonstração com PostgreSQL

Vais ver os dados desaparecerem e depois sobreviverem. O PostgreSQL guarda os dados em `/var/lib/postgresql/data`. A imagem `postgres:17` declara essa pasta como volume, e isto tem uma consequência traiçoeira. **Sem volume nomeado:**

    docker run -d --name est-dk04-pg -e POSTGRES_PASSWORD=Estudo_2026! -e POSTGRES_DB=tarefas postgres:17
    docker inspect est-dk04-pg --format "{{range .Mounts}}{{.Type}} {{.Name}}{{end}}"
    docker exec est-dk04-pg psql -U postgres -d tarefas -c "CREATE TABLE tarefa(id serial primary key, titulo text); INSERT INTO tarefa(titulo) VALUES ('estudar volumes');"

    volume 8f676ad87e5efa48a7e03aba7a8eed2e5779021f369bfe4a3ab9a81ad143ada1

O Docker criou um **volume anónimo** (nome de 64 caracteres hexadecimais) sem tu pedires. Se removeres o contentor com `docker rm`, ele fica órfão, ocupa espaço e ninguém sabe de quem é. Se usares `docker rm -v`, é removido com o contentor e os dados perdem-se:

    docker rm -f -v est-dk04-pg
    docker volume ls

O volume anónimo já não aparece na lista: foi apagado com o contentor e os dados foram com ele.

**ATENÇÃO:** é por isso que neste curso dás sempre nome aos volumes e usas `docker rm -v` nos contentores soltos. Volumes anónimos são o lixo mais comum de um ambiente Docker.

**Com volume nomeado**, os dados sobrevivem. Cria o volume e monta-o no mesmo sítio:

    docker volume create est-dk04-pgdados
    docker run -d --name est-dk04-pg -e POSTGRES_PASSWORD=Estudo_2026! -e POSTGRES_DB=tarefas -v est-dk04-pgdados:/var/lib/postgresql/data postgres:17
    docker exec est-dk04-pg psql -U postgres -d tarefas -c "CREATE TABLE tarefa(id serial primary key, titulo text); INSERT INTO tarefa(titulo) VALUES ('estudar volumes');"
    docker rm -f -v est-dk04-pg

Removeste o contentor (e, com `-v`, só os anónimos: o nomeado não é tocado). Cria outro contentor, novo, com o mesmo volume:

    docker run -d --name est-dk04-pg -e POSTGRES_PASSWORD=Estudo_2026! -e POSTGRES_DB=tarefas -v est-dk04-pgdados:/var/lib/postgresql/data postgres:17
    docker exec est-dk04-pg psql -U postgres -d tarefas -tc "SELECT * FROM tarefa"
    docker logs est-dk04-pg 2>&1 | grep Skipping

      1 | estudar volumes
    PostgreSQL Database directory appears to contain a database; Skipping initialization

A linha da tarefa continua lá e o PostgreSQL reconheceu a base existente e saltou a inicialização. Um volume tem ciclo de vida próprio: só desaparece com `docker volume rm`. O `docker volume ls` lista-os e o `docker volume inspect NOME` mostra o `Mountpoint` (aqui, `/var/lib/docker/volumes/est-dk04-pgdados/_data`).

**NOTA:** esse caminho está dentro da VM do Docker Desktop, não no teu disco Windows. Não é para mexeres lá à mão: acede aos dados por contentores, como na secção de cópias de segurança. O Docker recusa remover um volume em uso (`volume is in use`).

## Cópias de segurança de volumes

O volume não é uma pasta tua, por isso copias os dados com um contentor descartável que monta o volume (só de leitura) e uma pasta do anfitrião, e corre o `tar`. A pasta `backup` do diretório atual recebe o ficheiro. Em PowerShell:

    docker run --rm -v est-dk04-pgdados:/dados:ro -v "${PWD}\backup:/backup" alpine:3.21 tar czf /backup/pgdados.tar.gz -C /dados .

Em Git Bash usa `$(pwd -W)/backup` (caminho com letra de unidade, como `C:/...`) e em Linux ou macOS `$(pwd)/backup`, no lugar de `${PWD}\backup`. O resultado foi um ficheiro de 6553347 bytes. Para **restaurar**, cria um volume novo e extrai lá o arquivo:

    docker volume create est-dk04-pgcopia
    docker run --rm -v est-dk04-pgcopia:/dados -v "${PWD}\backup:/backup:ro" alpine:3.21 tar xzf /backup/pgdados.tar.gz -C /dados

Um PostgreSQL novo montado em `est-dk04-pgcopia` devolveu a mesma linha `estudar volumes`, o que prova que a cópia ficou boa.

**ATENÇÃO:** copiar os ficheiros de uma base de dados a correr pode dar uma cópia inconsistente. Para bases a sério pára o contentor antes, ou usa a ferramenta da própria base (`pg_dump`, no caso do PostgreSQL). Aqui o contentor já estava removido.

## Bind mounts

Um bind mount liga uma pasta do anfitrião a um caminho do contentor. É o que se usa para trabalhar no código sem reconstruir a imagem. Cria `site/index.html` e serve-o:

    docker run -d --name est-dk04-web -p 30040:80 -v "${PWD}\site:/usr/share/nginx/html:ro" nginx:alpine
    curl.exe http://localhost:30040
    (edita o site/index.html no anfitrião)
    curl.exe http://localhost:30040

    <h1>ola do anfitriao</h1>
    <h1>versao 2</h1>

A segunda resposta mostra o ficheiro alterado, sem reiniciar o contentor. Com `:ro`, o contentor não pode escrever (`touch: ...: Read-only file system`). O `docker inspect` confirma `bind RW=false`. Remove com `docker rm -f -v est-dk04-web`.

Um bind mount **esconde** o conteúdo que a imagem tivesse nessa pasta. Já um volume nomeado **vazio**, montado numa pasta que a imagem tem, é preenchido com o conteúdo da imagem na primeira vez:

    docker run --rm -v est-dk04-html:/usr/share/nginx/html nginx:alpine ls /usr/share/nginx/html

    50x.html
    index.html

Se a pasta de origem não existir, a documentação diz que o `-v` a cria e que o `--mount` dá erro. No Docker Desktop da máquina de teste, nenhum dos dois deu erro (ambos criaram a pasta). Não dependas disto: cria a pasta antes.

**ATENÇÃO:** um bind mount dá ao contentor acesso de escrita aos teus ficheiros. Um `rm -rf` dentro do contentor apaga a pasta real. Usa `:ro` sempre que o contentor só precise de ler.

## tmpfs

O tmpfs vive na RAM e desaparece quando o contentor pára. Serve para dados que nunca devem tocar no disco:

    docker run -d --name est-dk04-t --mount type=tmpfs,dst=/cache,tmpfs-size=16m alpine:3.21 sleep 300
    docker exec est-dk04-t sh -c "echo segredo > /cache/x; df -h /cache | tail -1"

    (resultado: tmpfs 16.0M 4.0K 16.0M 0% /cache)

Depois de um `docker restart`, a pasta `/cache` estava vazia. O limite de 16 MB impede que consuma toda a memória. Remove com `docker rm -f -v est-dk04-t`.

## Permissões

Um volume nomeado novo pertence ao `root`. Um processo que não corra como root não consegue escrever lá:

    docker run --rm --user 1000:1000 -v est-dk04-perm:/dados alpine:3.21 sh -c "touch /dados/a"

    touch: /dados/a: Permission denied

Corrige o dono uma só vez, com um contentor temporário que corre como root, e volta a tentar:

    docker run --rm -v est-dk04-perm:/dados alpine:3.21 chown 1000:1000 /dados
    docker run --rm --user 1000:1000 -v est-dk04-perm:/dados alpine:3.21 sh -c "touch /dados/a && ls -l /dados"

    -rw-r--r--    1 1000     1000             0 Nov 13 19:10 a

Nos bind mounts o comportamento depende do sistema. No Docker Desktop (Windows) a pasta aparecia no contentor como root com permissões abertas (drwxrwxrwx) e um utilizador 1000 conseguiu escrever lá, ficando os ficheiros com o dono 1000. Em Linux os números de utilizador e grupo do anfitrião passam tal e qual, e é o problema clássico dos ficheiros de root na tua pasta de trabalho; corre o contentor com `--user "$(id -u):$(id -g)"` para ficarem teus (não testado aqui, a máquina é Windows).

## Caminhos dos bind mounts em Windows e Linux

O caminho de origem escreve-se de forma diferente em cada terminal:

| Terminal | Pasta atual | Exemplo |
| --- | --- | --- |
| PowerShell | ${PWD} | -v "${PWD}\site:/usr/share/nginx/html" (também funciona com /) |
| Git Bash | $(pwd -W) | -v "$(pwd -W)/site:/usr/share/nginx/html" |
| Linux e macOS | $(pwd) | -v "$(pwd)/site:/usr/share/nginx/html" |

Regras práticas:

- Põe o caminho entre aspas: contas de utilizador com espaços (`C:\Users\Ana Silva`) partem o comando.
- O Git Bash converte automaticamente argumentos que parecem caminhos Unix (`/usr/share/...`) em caminhos do Windows, o que estraga comandos como `docker exec ... ls /opt/x`. A solução é `export MSYS_NO_PATHCONV=1` antes do comando. O contrário também morde: com essa variável ligada e `$(pwd)` (que dá `/c/Users/...`), o contentor montou uma pasta vazia em vez da tua e o `ls` não listou nada, sem erro. Com `MSYS_NO_PATHCONV=1`, usa `pwd -W`.
- No Docker Desktop com WSL2, a documentação do Docker Desktop recomenda guardar os ficheiros de projeto no sistema de ficheiros do WSL 2, por desempenho. Não medi isso aqui; confirma na documentação.

## Limpeza

**ATENÇÃO:** remove só o que criaste, pelo nome (`docker rm -f -v`, `docker network rm`, `docker volume rm`). Nunca uses `docker volume prune` nem `docker system prune --volumes`: apagam volumes de outros projetos. O Docker recusa remover uma rede com contentores ligados e um volume em uso.

## Exercícios

**PRATICAR:** resolve os exercícios 13 a 16 (DNS entre contentores, publicação de portas, persistência com PostgreSQL, cópia de segurança de um volume). Estão no módulo de exercícios e as soluções no gabarito.

## Fontes oficiais

- Redes (visão geral): https://docs.docker.com/engine/network/
- Driver bridge (por omissão vs definida pelo utilizador): https://docs.docker.com/engine/network/drivers/bridge/
- Driver host: https://docs.docker.com/engine/network/drivers/host/
- Driver none: https://docs.docker.com/engine/network/drivers/none/
- Publicação de portas: https://docs.docker.com/engine/network/port-publishing/
- Firewalls e filtragem de pacotes: https://docs.docker.com/engine/network/packet-filtering-firewalls/
- Ligar a serviços do anfitrião no Docker Desktop (host.docker.internal): https://docs.docker.com/desktop/features/networking/networking-how-tos/
- Armazenamento (visão geral): https://docs.docker.com/engine/storage/
- Volumes: https://docs.docker.com/engine/storage/volumes/
- Bind mounts: https://docs.docker.com/engine/storage/bind-mounts/
- tmpfs: https://docs.docker.com/engine/storage/tmpfs/
- docker network create: https://docs.docker.com/reference/cli/docker/network/create/
- docker volume create: https://docs.docker.com/reference/cli/docker/volume/create/
- docker container run: https://docs.docker.com/reference/cli/docker/container/run/
- Imagem postgres: https://hub.docker.com/_/postgres
