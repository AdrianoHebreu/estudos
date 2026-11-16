# 8 Exercícios práticos

24 exercícios, quatro por módulo, mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. Resolve-os com o Docker a funcionar e usa sempre nomes próprios e volumes nomeados, para limpares tudo no fim. Só consultas o módulo 10 depois de tentares.

## Módulo 01 · Conceitos e primeiros passos

### Exercício 1 · O ciclo de vida de um contentor

**Nível:** Iniciante

Executa a imagem `alpine:3.21` com o nome `est-dk01-ex1` e o comando `echo "ola docker"`, sem `--rm`. Depois:

1. Confirma com `docker ps -a` que o contentor existe e em que estado está (e porque não aparece em `docker ps` sem `-a`).
2. Remove o contentor com `docker rm -v`.
3. Confirma que já não existe.

### Exercício 2 · nginx com porta publicada

**Nível:** Iniciante

1. Arranca o `nginx:alpine` em segundo plano, com o nome `est-dk01-ex2`, publicando a porta 80 do contentor na porta 30012 do anfitrião.
2. Pede a página inicial e mostra só o título (`<title>`). Pede também um caminho que não existe (`/nao-existe`) e mostra o código HTTP devolvido.
3. Com `docker logs`, mostra as linhas dos dois pedidos.
4. Pára o contentor, confirma que a porta deixou de responder e que o estado é `Exited`, e remove-o com `docker rm -v`.

### Exercício 3 · Imagem contra contentor: a camada de escrita

**Nível:** Intermédio

1. Arranca dois contentores da mesma imagem `alpine:3.21`, `est-dk01-ex3a` e `est-dk01-ex3b`, ambos com o comando `sleep 120`.
2. No primeiro, cria o ficheiro `/nota.txt` com o texto `segredo` (usa `docker exec`).
3. Lê o ficheiro no primeiro e tenta lê-lo no segundo. Compara o resultado do `docker diff` nos dois.
4. Remove os dois contentores e confirma, com um novo contentor descartável (`--rm`), que o ficheiro não existe na imagem.
5. Explica em duas frases porque é que isto acontece, usando os termos camada de escrita e imagem.

### Exercício 4 · Etiquetas, digests e limites

**Nível:** Avançado

1. Cria duas etiquetas novas para a imagem `alpine:3.21`: `est-dk01-base:v1` e `est-dk01-base:v2`. Mostra que têm o mesmo ID.
2. Remove só a etiqueta `v1` e confirma que a `v2` e a imagem original continuam lá.
3. Arranca a partir de `est-dk01-base:v2` um contentor `est-dk01-ex4` com `sleep 120` e um limite de memória de 32 MiB. Usa `docker inspect` para mostrar o limite em bytes.
4. Mostra a versão do kernel dentro do contentor com `uname -r` e explica porque é a da VM do Docker Desktop (ou do próprio Linux) e não a de um «sistema do contentor».
5. Remove o contentor e a etiqueta `v2`. Descobre o digest da imagem `alpine:3.21` e executa `echo "por digest"` a partir dele, em vez de usares a etiqueta.

## Módulo 02 · Contentores no dia a dia

### Exercício 5 · Ciclo de vida e códigos de saída

**Nível:** Iniciante

Usa a imagem alpine:3.20 e o prefixo est-dk02-. Cria (sem arrancar) um contentor chamado est-dk02-ex5 com o comando sleep 300 e confirma que o estado é Created. Arranca-o, coloca-o em pausa e confirma o estado com docker inspect. Retoma-o e mata-o com docker kill: qual é o código de saída? Remove-o. Depois provoca, com docker run, dois códigos de saída diferentes: um programa que sai com o código 3 (sh -c 'exit 3') e um comando que não existe. Em cada caso, indica o código que o docker run devolve ao terminal (código do último comando: $? no Bash, $LASTEXITCODE no PowerShell). Remove tudo com docker rm -v.

### Exercício 6 · Um nginx com porta, variáveis e limites

**Nível:** Intermédio

Escreve um ficheiro est-dk02-ex6.env com PORT=8000 e AMBIENTE=estudo. Arranca em segundo plano o contentor est-dk02-ex6 a partir de nginx:alpine, com: porta 30021 do anfitrião ligada à porta 80 do contentor, o ficheiro de variáveis, mais um -e AMBIENTE=teste, limite de 64 MiB de memória, limite de 0.25 CPUs e a política de reinício on-failure com no máximo 2 tentativas. Confirma que o servidor responde com código 200. Depois mostra: (a) o valor final de PORT e AMBIENTE dentro do contentor e qual das duas fontes prevalece; (b) com docker inspect e --format, a memória, os CPUs e a política de reinício; (c) com docker stats, a memória usada face ao limite. Remove o contentor.

### Exercício 7 · Registos, exec e cp

**Nível:** Intermédio

Arranca est-dk02-ex7 (nginx:alpine, porta 30022). Cria no anfitrião um index.html com uma frase tua e copia-o para /usr/share/nginx/html/ dentro do contentor com docker cp; confirma com curl que o servidor o serve. Faz um pedido a um caminho que não existe (/tarefas) e usa docker logs para encontrar a linha do pedido, com o código 404. Com docker exec, escreve um ficheiro /tmp/nota.txt dentro do contentor e traz-o para o anfitrião com docker cp. Usa docker diff para ver as alterações. Por fim, pára e arranca o contentor: o teu index.html continua lá? E se removeres o contentor e criares outro igual? Explica o resultado.

### Exercício 8 · Limpeza segura e volumes anónimos

**Nível:** Avançado

Regista quantos volumes existem (docker volume ls -q, contados). Cria dois contentores de alpine:3.20 com sleep 300 e a etiqueta est=dk02: est-dk02-ex8a, com um volume anónimo montado em /dados, e est-dk02-ex8b, sem volumes. Lista só os teus com um filtro por etiqueta. Guarda o nome do volume anónimo (com docker inspect e --format sobre os Mounts). Pára os dois e remove o ex8a SEM a opção -v: o que aconteceu ao número de volumes? Remove o volume órfão pelo nome exato que guardaste (nunca por prune) e remove o ex8b. Repete o ciclo com um contentor est-dk02-ex8c com volume anónimo, mas usando docker rm -f -v, e mostra que não sobra volume. No fim, confirma que não há nenhum contentor com o prefixo est-dk02-. Explica porque é que este processo é mais seguro do que docker volume prune.

## Módulo 03 · Imagens e Dockerfile

### Exercício 9 · A tua primeira imagem: o serviço de tarefas

**Nível:** Iniciante

Cria uma pasta de trabalho com o `app.py` do módulo 03 (`03-Imagens-e-Dockerfile/exemplos/app.py`) e escreve um Dockerfile com estas características: base `python:3.13-slim`, pasta de trabalho `/app`, `ENV PORT=9000`, `EXPOSE 9000`, utilizador `nobody` e `CMD` na forma exec.

1. Constrói a imagem com o nome `est-dk03-ex9:1.0`.
2. Corre-a com o nome `est-dk03-ex9`, publicando a porta 30033 do anfitrião. Pede `/saude`, cria uma tarefa com POST e mostra o código HTTP de um POST com um JSON inválido (sem o campo titulo).
3. Confirma, com `docker exec`, o UID com que o processo corre e o valor de PORT.
4. Remove o contentor com `docker rm -v`, volta a corrê-lo com `-e PORT=9100` (porta 30034 no anfitrião) e confirma que responde.

### Exercício 10 · A ordem das instruções e a cache

**Nível:** Intermédio

Parte do `app.py` e do `requirements.txt` do módulo 03. Escreve dois Dockerfiles que fazem o mesmo (base `python:3.13-slim`, instalar as dependências, copiar o código): a variante A copia tudo com `COPY . .` antes do `pip install`; a variante B copia primeiro só o `requirements.txt`, instala, e só depois copia o `app.py`.

1. Constrói as duas com `docker build --progress=plain`.
2. Acrescenta uma linha de comentário ao `app.py` e volta a construir as duas.
3. Para cada variante, indica se o passo `RUN pip install` foi refeito ou aproveitado da cache (procura `CACHED` na saída).
4. Explica, numa frase, porque é que o resultado difere, e diz quando é que a variante B também refaria o `pip install`.

### Exercício 11 · CMD, ENTRYPOINT e as formas exec e shell

**Nível:** Intermédio

1. Escreve um Dockerfile com `ENTRYPOINT ["python"]` e `CMD ["app.py"]` (forma exec) e outro com `ENTRYPOINT python app.py` (forma shell), ambos sobre `python:3.13-slim` com o `app.py` do módulo 03. Constrói as duas imagens (`est-dk03-ex11:exec` e `est-dk03-ex11:shell`).
2. Corre cada uma em segundo plano (portas 30035 e 30036) e mostra o processo com PID 1 em cada contentor (`/proc/1/cmdline`). Confirma que ambas respondem em `/saude`.
3. Pára cada contentor, mede o tempo que `docker stop` demora e mostra o código de saída (`docker inspect`). Remove os contentores com `docker rm -v`.
4. Na imagem exec, usa o que escreves depois do nome da imagem para correr `-c "import sys; print(sys.version_info[:2])"`. Explica o que acontece com a mesma tentativa na imagem shell.

### Exercício 12 · .dockerignore, multi-stage e tamanhos

**Nível:** Avançado

Numa pasta nova, junta o `app.py`, o `requirements.txt`, um ficheiro `dados.bin` de 20 MB (por exemplo, `head -c 20000000 /dev/zero > dados.bin`), um ficheiro `.env` com texto qualquer e uma pasta `.venv`.

1. Escreve `Dockerfile.single` (base `python:3.13`, `COPY . .`, `pip install`) e constrói-o. Anota o tamanho do contexto enviado (`transferring context`) e lista o conteúdo de `/app` na imagem.
2. Cria um `.dockerignore` que deixe de fora o ficheiro grande, o `.env`, a `.venv` e os Dockerfiles. Reconstrói e compara o contexto e o conteúdo de `/app`.
3. Escreve `Dockerfile.multi` (fase builder em `python:3.13` com `pip install --prefix=/instalado`, fase final em `python:3.13-slim` com `COPY --from=builder`). Constrói-o.
4. Compara os tamanhos das duas imagens com `docker images` e usa `docker history` na final para ver quanto ocupa a camada das dependências.

## Módulo 04 · Redes e volumes

### Exercício 13 · DNS entre contentores

**Nível:** Iniciante

Cria uma rede bridge chamada est-dk04-rede13 e um contentor nginx:alpine chamado est-dk04-web, sem publicar portas e fora dessa rede (na rede por omissão). Prova que um contentor alpine:3.21 consegue ou não fazer um pedido HTTP a est-dk04-web por nome em dois casos: (a) a partir da rede por omissão; (b) a partir da rede est-dk04-rede13. Quando o caso (b) falhar, repara no que falta e corrige-o sem recriar o nginx. Mostra por fim em que redes está o est-dk04-web e remove tudo.

### Exercício 14 · Publicar portas só para o localhost

**Nível:** Iniciante

Arranca um nginx:alpine chamado est-dk04-web e publica a porta 80 do contentor na porta 30041 do anfitrião, mas só no endereço 127.0.0.1. Usa um comando do Docker para mostrar o mapeamento e confirma com curl que responde em localhost. Descobre o IP da tua máquina na rede local e confirma que por esse IP o pedido à porta 30041 falha. Explica numa frase porque é que esta forma é a mais segura para uma base de dados em desenvolvimento.

### Exercício 15 · Perder e manter dados com PostgreSQL

**Nível:** Intermédio

Usa postgres:17 (variáveis POSTGRES_PASSWORD e POSTGRES_DB=tarefas). Primeiro sem volume nomeado: cria a tabela tarefa com uma linha, mostra o volume anónimo que o Docker criou, remove o contentor com docker rm -v e prova que a lista de volumes não tem lixo e que os dados se perderam. Depois repete com o volume nomeado est-dk04-pgdados em /var/lib/postgresql/data: insere a linha, remove o contentor, cria outro com o mesmo volume e mostra que a linha continua lá. No fim remove o volume.

### Exercício 16 · Cópia de segurança e restauro de um volume

**Nível:** Avançado

Cria o volume est-dk04-notas e escreve nele dois ficheiros (a.txt e b.txt) usando um contentor alpine:3.21 descartável. Faz uma cópia de segurança para um ficheiro notas.tar.gz numa pasta do anfitrião (monta o volume de origem só de leitura). Remove o volume, restaura os dados para um volume novo chamado est-dk04-notas2 e mostra o conteúdo. Por fim, monta o volume restaurado só de leitura e prova que não consegues criar um ficheiro novo. Indica o comando para PowerShell e para Git Bash ou Linux.

## Módulo 05 · Docker Compose

### Exercício 17 · O teu primeiro compose.yaml

**Nível:** Iniciante

Numa pasta nova e vazia, escreve um compose.yaml com um único serviço chamado web, que usa a imagem nginx:alpine e publica a porta 80 do contentor na porta 30053 do anfitrião, só no endereço 127.0.0.1. Usa sempre o projeto est-dk05 (docker compose -p est-dk05). Mostra o ficheiro final com docker compose config, levanta o serviço em segundo plano, lista-o com ps, confirma com curl que responde 200, mostra as duas últimas linhas dos registos e a versão do nginx com exec. No fim, remove o projeto e prova que não ficou nenhum contentor nem rede com o prefixo est-dk05.

### Exercício 18 · Variáveis, .env e env_file

**Nível:** Intermédio

Numa pasta nova, escreve um compose.yaml com dois serviços: web (nginx:alpine, porta 30054 por omissão do lado do anfitrião, em 127.0.0.1, controlada pela variável PORTA) e eco (alpine:3.21, num perfil chamado ferramentas, com env_file eco.env, a variável TITULO obrigatória no ambiente do serviço e o comando que escreve TITULO e MENSAGEM). Cria o eco.env com MENSAGEM e TITULO, e um ficheiro .env com PORTA=30056 e TITULO. Prova, só com docker compose config e run: (a) que a porta vem do .env; (b) que uma variável do terminal ganha ao .env; (c) que, quando a mesma variável está no env_file e no environment, o contentor recebe a do environment; (d) que, sem TITULO no .env, o Compose falha com a tua mensagem de erro. Explica numa frase a diferença entre o .env e o env_file.

### Exercício 19 · service_started contra service_healthy

**Nível:** Intermédio

Escreve um compose.base.yaml com dois serviços que usam postgres:17: db (com POSTGRES_PASSWORD, um healthcheck com pg_isready por TCP e um tmpfs em /var/lib/postgresql/data para não criar volumes anónimos) e cliente (com um entrypoint que corre psql contra o serviço db e faz um SELECT simples; também com tmpfs no mesmo caminho). Cria dois ficheiros pequenos que só acrescentam o depends_on do cliente: um com condition service_started e outro com service_healthy. Levanta o projeto est-dk05 com cada combinação (-f base -f variante), espera uns segundos e mostra o estado final dos serviços e os registos do cliente. Explica a diferença de resultado. Remove sempre o projeto com down -v entre as duas experiências.

### Exercício 20 · Dados, down e down -v

**Nível:** Avançado

Na pasta exemplos/ deste módulo (com o .env criado a partir de exemplo.env), levanta o projeto est-dk05 com a variável API_PORT=30055 definida no terminal. Cria duas tarefas pelo POST /tarefas. Faz docker compose down e mostra que o volume est-dk05_dados continua a existir; levanta de novo e prova que as duas tarefas sobreviveram. Compara quantas vezes aparece a porta 30051 na saída do config normal e na do config com -f compose.yaml -f compose.prod.yaml, e explica porquê. Por fim faz down -v, prova que o volume desapareceu e que, ao levantar outra vez, a lista de tarefas está vazia. Remove tudo no fim e indica dois cuidados a ter antes de usar down -v num projeto real.

## Módulo 06 · Boas práticas e diagnóstico

### Exercício 21 · Endurecer uma imagem

**Nível:** Iniciante

Parte do ficheiro app.py do módulo 06 (pasta exemplos) e escreve um Dockerfile para o serviço de tarefas que: use python:3.13-slim fixado por digest, crie um utilizador sem privilégios com UID 10001 e corra com ele. Constrói a imagem como est-dk06-ex21:1.0 e arranca-a com o sistema de ficheiros só de leitura, sem capacidades Linux, com no-new-privileges, memória limitada a 64 MB, no máximo 50 processos e a porta publicada só em 127.0.0.1:30061. Prova com comandos que (a) o serviço responde em /saude, (b) o processo não é root, (c) não é possível escrever em /app e (d) o docker inspect mostra os limites. Remove tudo no fim.

### Exercício 22 · Segredos sem fugas

**Nível:** Intermédio

Cria um ficheiro token.txt com um valor fictício. (a) Escreve um compose.yaml (projeto est-dk06ex22) que passe esse ficheiro ao serviço como secret do Compose, com a variável TOKEN_FILE a apontar para o caminho. Mostra o conteúdo lido dentro do contentor e prova, com docker inspect e grep, que o valor não aparece nos metadados. (b) Escreve um Dockerfile com base alpine:3.21 que use um build secret numa instrução RUN (por exemplo para mostrar o tamanho do ficheiro), constrói-o com --secret e prova com docker history que o valor não ficou na imagem. Explica numa frase porque é que um ENV não serviria.

### Exercício 23 · Registo local

**Nível:** Intermédio

Com um registo registry:2 chamado est-dk06-registry na porta 30060 (volume nomeado est-dk06-regdados, nunca anónimo), envia a tua imagem com duas etiquetas, 1.0 e 1.1. Lista as etiquetas pela API HTTP do registo, repara no digest de cada envio e diz o que concluis. Apaga as etiquetas locais, arranca um contentor a partir do digest (não da etiqueta) e confirma que responde. Explica porque é que referenciar por digest é mais seguro do que por etiqueta num ambiente de produção.

### Exercício 24 · Diagnóstico de três avarias

**Nível:** Avançado

Executa cada comando, diagnostica a causa com docker logs, docker inspect, docker port e curl, e corrige sem alterar a imagem est-dk06-tarefas:1.0 (a do módulo, construída a partir de exemplos). (a) docker run -d --name est-dk06-qa -p 127.0.0.1:30065:8000 -e PORT=9000 est-dk06-tarefas:1.0 e depois o curl a localhost:30065/saude falha. (b) docker run --name est-dk06-qb -e PORT=abc est-dk06-tarefas:1.0 termina logo: indica o código de saída e a causa. (c) docker run --rm -v est-dk06-qvol:/dados est-dk06-tarefas:1.0 python -c "open('/dados/x','w')" dá erro de permissão num volume novo: corrige sem fazer a aplicação correr como root. Para cada avaria escreve o sintoma, a causa e a correção. Remove contentores e volume no fim.

## Projeto final

### Exercício 25 · Aplicação de tarefas completa em Docker Compose

**Nível:** Avançado

Põe o serviço de tarefas a correr em Docker Compose com um proxy, a API e o PostgreSQL, seguindo o módulo 07: imagem multi-stage com utilizador sem privilégios e healthcheck, redes separadas, volume nomeado, segredo do Compose, overrides por ambiente, prova de persistência e as três falhas diagnosticadas.

**PRATICAR:** faz o projeto por fases e usa a grelha do módulo 7 e a consulta rápida do módulo 9.
