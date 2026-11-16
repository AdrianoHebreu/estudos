# 03 Imagens e Dockerfile

Até aqui usaste imagens feitas por outros (`nginx`, `alpine`, `python`). Neste módulo escreves a tua: vais **containerizar o serviço de tarefas**. Aprendes o Dockerfile instrução a instrução, porque a ordem das instruções muda o tempo de build, como excluir lixo com `.dockerignore`, como reduzir uma imagem com multi-stage e como medir tudo. Todos os comandos foram executados na máquina de teste (Docker Engine 29.9.3, Docker Desktop no Windows 11, contentores Linux). As imagens construídas usam o prefixo `est-dk03-` e as portas vão de 30030 a 30039.

## O serviço de tarefas, versão em memória

Segue o contrato do módulo 00 (GET /saude, GET /tarefas, POST /tarefas, variável PORT). Nesta versão não há base de dados: as tarefas vivem numa lista Python, e só usa a **biblioteca padrão** (`http.server`), por isso não precisas de instalar nada para a correr. O código está em `03-Imagens-e-Dockerfile/exemplos/app.py`, junto dos Dockerfiles deste módulo. Com `FROM python:3.13-slim` já tens tudo o que o serviço precisa.

**NOTA:** o `exemplos/requirements.txt` tem uma única dependência de demonstração (`requests`). O serviço não a usa: serve só para os exemplos de cache e de multi-stage terem um `pip install` real para medir.

## O contexto de build e o docker build

Construir uma imagem é dar ao Docker uma **receita** (o Dockerfile) e uma pasta de **contexto** (os ficheiros que a receita pode copiar). O comando mais comum:

    docker build -t est-dk03-tarefas:1.0 .

| Parte | Significado |
| --- | --- |
| docker build | Constrói uma imagem (usa o BuildKit, o motor de build atual) |
| -t est-dk03-tarefas:1.0 | Nome e etiqueta (tag) da imagem resultante |
| . (o ponto final) | O contexto: a pasta atual. O Dockerfile é procurado nela |
| -f ficheiro | Usa outro Dockerfile em vez do que se chama Dockerfile |

Só os ficheiros dentro do contexto podem ser usados por `COPY`. O ponto final no fim é o erro de principiante mais frequente: sem ele o comando falha.

## O Dockerfile, instrução a instrução

Este é o Dockerfile final do serviço (`exemplos/Dockerfile`):

    # ARG antes do FROM: só existe para escolher a imagem base
    ARG BASE=python:3.13-slim
    FROM ${BASE}

    WORKDIR /app
    COPY app.py .

    ENV PORT=8000
    EXPOSE 8000

    # Não correr como root
    USER nobody

    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
      CMD ["python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ['PORT'] + '/saude', timeout=2)"]

    # Forma exec: o Python fica com o PID 1 e recebe o SIGTERM
    CMD ["python", "app.py"]

| Instrução | O que faz | Cria camada com dados |
| --- | --- | --- |
| FROM | Define a imagem base. Todo o Dockerfile começa aqui (ARG pode vir antes) | Herda as da base |
| WORKDIR | Define (e cria, se faltar) a pasta de trabalho para as instruções seguintes | Não, só metadados |
| COPY | Copia ficheiros do contexto para a imagem | Sim |
| RUN | Executa um comando durante o build (instalar pacotes, compilar) | Sim |
| ENV | Define uma variável de ambiente, também disponível quando o contentor corre | Não |
| ARG | Define uma variável só para o build | Não |
| EXPOSE | Documenta a porta em que o serviço escuta | Não |
| USER | Define o utilizador com que o contentor corre | Não |
| HEALTHCHECK | Diz ao Docker como testar se o serviço está saudável | Não |
| CMD | Comando por omissão ao arrancar o contentor | Não |
| ENTRYPOINT | O executável fixo do contentor | Não |

**ATENÇÃO:** `EXPOSE 8000` não publica nada no anfitrião. É só documentação (e usada por `docker run -P`). Quem abre a porta é o `-p` no `docker run`.

Constrói e corre:

    docker build -t est-dk03-tarefas:1.0 .
    docker run -d --name est-dk03-api -p 30030:8000 est-dk03-tarefas:1.0

    curl http://localhost:30030/saude
    curl -X POST -H "Content-Type: application/json" -d '{"titulo":"Aprender Docker"}' http://localhost:30030/tarefas
    curl http://localhost:30030/tarefas

    {"estado":"ok"}
    {"id":1,"titulo":"Aprender Docker"}
    [{"id":1,"titulo":"Aprender Docker"}]

O `-p 30030:8000` liga a porta 30030 do anfitrião à 8000 do contentor. Tens o serviço a funcionar, a partir de uma imagem tua.

**NOTA:** em PowerShell usa `curl.exe` (o `curl` é um alias de `Invoke-WebRequest`) e a continuação de linha é o acento grave (backtick) em vez de `\`. O envio do JSON em PowerShell tem regras de aspas próprias (por exemplo `Invoke-RestMethod`); os comandos deste módulo foram executados em Git Bash e não testei o POST em PowerShell.

## ARG contra ENV

Os dois definem variáveis, mas em momentos diferentes.

| Aspeto | ARG | ENV |
| --- | --- | --- |
| Existe durante o build | Sim | Sim (depois de definida) |
| Existe no contentor em execução | Não | Sim |
| Muda-se com | docker build --build-arg NOME=valor | docker run -e NOME=valor |
| Serve para | Escolher versões, bases, opções de build | Configuração do serviço (PORT) |

Testei as duas. O `ARG BASE` permite trocar a imagem base sem editar o ficheiro, e o `ENV PORT` pode ser substituído ao arrancar:

    docker build --build-arg BASE=python:3.13-alpine -t est-dk03-tarefas:alpine .
    docker run --rm est-dk03-tarefas:alpine cat /etc/os-release
    docker run --rm -e PORT=9000 est-dk03-tarefas:1.0 python -c "import os;print(os.environ['PORT'])"

    NAME="Alpine Linux"
    ID=alpine
    9000

**ATENÇÃO:** nunca ponhas palavras-passe em ARG ou ENV: ficam visíveis em `docker history` e `docker inspect`. Os segredos vêm mais tarde no curso.

## CMD, ENTRYPOINT e as duas formas

**Forma exec** é uma lista JSON: `CMD ["python", "app.py"]`. O Docker executa o programa diretamente. **Forma shell** é texto livre: `CMD python app.py`. O Docker executa `/bin/sh -c "python app.py"`. Parece igual, mas muda quem é o processo principal (PID 1), e é o PID 1 que recebe os sinais de `docker stop`.

Testei o mesmo serviço nas duas formas (`Dockerfile.shell` usa `CMD python app.py && echo terminou`):

    docker exec est-dk03-sh cat /proc/1/cmdline
    /bin/sh -c python app.py && echo terminou

    docker exec est-dk03-api cat /proc/1/cmdline
    python app.py

    docker stop est-dk03-sh    # forma shell
    real 0m5.924s   código de saída 137

    docker stop est-dk03-api   # forma exec
    real 0m2.623s   código de saída 0

Na forma shell, o PID 1 é o `sh`, que não passa o SIGTERM ao Python. O Docker espera pelo limite (por omissão 10 segundos) e acaba por matar com SIGKILL, daí o código 137. Na forma exec, o Python é o PID 1, recebe o SIGTERM e sai com código 0. Os tempos absolutos dependem da máquina; o que importa é o código de saída e quem é o PID 1.

**NOTA:** o `app.py` regista um tratador de SIGTERM porque, como PID 1 num contentor, o Python não encerra por omissão com esse sinal. Sem o tratador, mesmo a forma exec seria morta pelo SIGKILL.

Quando usar cada instrução:

| Instrução | Papel | Substitui-se com |
| --- | --- | --- |
| ENTRYPOINT | O programa fixo do contentor | docker run --entrypoint |
| CMD | Os argumentos ou comando por omissão | Tudo o que escreves depois do nome da imagem |

Com `ENTRYPOINT ["python"]` e `CMD ["app.py"]` (`Dockerfile.entrypoint`), o que escreves depois da imagem substitui só o CMD:

    docker run --rm est-dk03-tarefas:ep -c "print('olá do python')"
    docker run --rm --entrypoint python est-dk03-tarefas:ep --version

    olá do python
    Python 3.13.18

**DICA:** na dúvida, usa só CMD na forma exec. Reserva o ENTRYPOINT para imagens que se comportam como um comando (por exemplo, uma ferramenta de linha de comandos).

## USER e HEALTHCHECK

Por omissão, o processo corre como **root** dentro do contentor. Para o serviço de tarefas isso é desnecessário, por isso o Dockerfile termina com `USER nobody`. Confirmei:

    docker exec est-dk03-api id
    uid=65534(nobody) gid=65534(nogroup) groups=65534(nogroup)

A porta 8000 é maior que 1024, por isso um utilizador sem privilégios pode escutar nela.

O `HEALTHCHECK` corre um comando dentro do contentor a cada 30 segundos. Aqui o comando faz um pedido a `/saude` com o Python (a imagem slim não tem `curl`). Se o comando falhar, o estado passa a `unhealthy`:

    docker ps --filter name=est-dk03 --format "{{.Names}} {{.Status}}"
    est-dk03-api Up 13 seconds (healthy)

    docker inspect est-dk03-api --format "{{.State.Health.Status}}"
    healthy

**NOTA:** o Docker só **assinala** o estado. Sozinho, não reinicia um contentor que fique `unhealthy`. Quem age sobre isso são os orquestradores (visão geral mais à frente).

## Etiquetas (tags) nas tuas imagens

Já viste que `nome:tag` identifica uma imagem. Ao construir, escolhe tu a etiqueta, e podes dar vários nomes à mesma imagem sem a duplicar:

    docker tag est-dk03-tarefas:1.0 est-dk03-tarefas:latest
    docker tag est-dk03-tarefas:1.0 est-dk03-tarefas:1
    docker images est-dk03-tarefas

    REPOSITORY         TAG        IMAGE ID       SIZE
    est-dk03-tarefas   1          51d426f1c2c3   118MB
    est-dk03-tarefas   1.0        51d426f1c2c3   118MB
    est-dk03-tarefas   latest     51d426f1c2c3   118MB

O ID é o mesmo: são três nomes para uma imagem. Boa prática: etiquetas de versão (`1.0`, `1`) para uso real, e lembra-te de que `latest` é só uma etiqueta como as outras, que ninguém atualiza por ti.

## A cache de camadas e a ordem das instruções

Cada instrução que altera ficheiros gera uma camada. O Docker guarda o resultado e, no build seguinte, **reutiliza** a camada se a instrução e os seus ficheiros não mudaram. Regra importante: quando uma camada muda, **todas as seguintes** são refeitas.

Compara dois Dockerfiles. O ingénuo copia tudo antes de instalar as dependências:

    FROM python:3.13-slim
    WORKDIR /app
    COPY . .
    RUN pip install --no-cache-dir -r requirements.txt
    CMD ["python", "app.py"]

O bom copia primeiro só o `requirements.txt` (`Dockerfile.cache`):

    FROM python:3.13-slim
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    COPY app.py .
    CMD ["python", "app.py"]

Medi os tempos com `docker build --progress=plain`, primeiro sem alterações e depois com uma linha acrescentada ao `app.py`:

| Cenário | Dockerfile ingénuo | Dockerfile com ordem boa |
| --- | --- | --- |
| Primeiro build | 5,8 s | 5,0 s |
| Build sem alterações | 1,8 s (tudo CACHED) | tudo CACHED |
| Build depois de editar app.py | 4,8 s: o pip install corre outra vez | 2,1 s: o pip install fica CACHED |

No ingénuo, a saída mostra o `COPY . .` refeito e o passo seguinte também (`RUN pip install ... DONE 2.7s`). No bom, só se refaz o último `COPY app.py .`, e o `pip install` aparece como `CACHED`.

A diferença aqui é pequena porque a dependência é minúscula. Com dependências reais (dezenas de pacotes), o `pip install` demora minutos, e é aí que esta ordem poupa o teu tempo todos os dias.

**DICA:** ordena do que muda menos para o que muda mais: base, dependências do sistema, ficheiros de dependências, instalação, e só no fim o teu código.

## O ficheiro .dockerignore

O `.dockerignore` fica na raiz do contexto e lista o que **não** é enviado ao Docker. Serve para três coisas: build mais rápido, imagens mais pequenas e não copiar segredos (como o `.env`) por engano. O deste módulo:

    .git
    .venv
    __pycache__/
    *.pyc
    .env
    Dockerfile*
    .dockerignore

Para ver o efeito, criei um ficheiro de 30 MB no contexto e construí com `COPY . .`:

| Situação | Contexto enviado | Conteúdo de /app na imagem |
| --- | --- | --- |
| Sem entrada para o ficheiro grande | 30,01 MB | inclui o ficheiro de 30 MB |
| Com a entrada no .dockerignore | 63 B | só app.py e requirements.txt |

Sem `.dockerignore` nenhum, a imagem leva também os Dockerfiles e tudo o que estiver na pasta.

**NOTA:** com `COPY app.py .` (cópia de um só ficheiro) o BuildKit também só envia o necessário. O `.dockerignore` faz a diferença sobretudo com `COPY . .`.

## Multi-stage builds

Num build multi-stage há várias instruções `FROM`, cada uma é uma **fase**. Podes instalar e compilar numa fase com ferramentas pesadas e copiar só o resultado para uma fase final pequena (`Dockerfile.multistage`):

    # Fase 1: "builder" instala as dependências (aqui poderias ter compiladores)
    FROM python:3.13 AS builder
    WORKDIR /build
    COPY requirements.txt .
    RUN pip install --no-cache-dir --prefix=/instalado -r requirements.txt

    # Fase 2: imagem final, só com o necessário
    FROM python:3.13-slim
    WORKDIR /app
    COPY --from=builder /instalado /usr/local
    COPY app.py .
    ENV PORT=8000
    USER nobody
    CMD ["python", "app.py"]

A fase `builder` foi construída sobre a imagem completa (mais de 1 GB), mas **nada dela** fica na imagem final, além do que o `COPY --from=builder` copiou. Confirmei que as dependências chegaram:

    docker run --rm est-dk03-tarefas:multi python -c "import requests;print(requests.__version__)"
    2.32.5

O ganho real aparece quando a fase de build precisa de compiladores e cabeçalhos que o programa já pronto não usa. No serviço de tarefas a dependência é só Python puro, por isso o ganho é pequeno. Compara com construir tudo numa só fase sobre `python:3.13` (`Dockerfile.fullsingle`), e vê a tabela da secção seguinte.

## Tamanho da imagem: a base conta mais que o teu código

Construí o mesmo serviço sobre as três variantes oficiais do Python e mediu-se com `docker images`:

| Imagem | Tamanho | Observação |
| --- | --- | --- |
| python:3.13 (base completa) | 1.11 GB | Traz compiladores e muitas ferramentas |
| est-dk03-tarefas:full (uma fase, base completa) | 1.12 GB | O teu código quase não acrescenta nada |
| python:3.13-slim (base) | 118 MB | Debian reduzido, sem compiladores |
| est-dk03-tarefas:1.0 (slim) | 118 MB | O serviço de tarefas |
| est-dk03-tarefas:multi (multi-stage, com requests) | 121 MB | Inclui a dependência de demonstração |
| python:3.13-alpine (base) | 45.7 MB | Alpine Linux |
| est-dk03-tarefas:alpine | 45.7 MB | O mesmo serviço, base alpine |

O código do serviço pesa 1,84 kB, por isso quase todo o tamanho vem da base. Escolher bem a base reduz mais que qualquer outra otimização.

**ATENÇÃO:** o Alpine usa a biblioteca musl em vez da glibc. É mais pequeno, mas alguns pacotes Python com código compilado podem não ter versões prontas para ele e exigir compilação. Para começar, `slim` é a escolha segura. Confirma sempre na documentação da imagem.

## docker history

O `docker history` mostra as camadas de uma imagem e a instrução que criou cada uma:

    docker history est-dk03-tarefas:1.0

    IMAGE          CREATED BY                                      SIZE
    51d426f1c2c3   CMD ["python" "app.py"]                         0B
    <missing>      HEALTHCHECK {Test:[CMD python -c import os, …   0B
    <missing>      USER nobody                                     0B
    <missing>      EXPOSE [8000/tcp]                               0B
    <missing>      ENV PORT=8000                                   0B
    <missing>      COPY app.py . # buildkit                        1.84kB
    <missing>      WORKDIR /app                                    0B
    <missing>      CMD ["python3"]                                 0B
    <missing>      RUN /bin/sh -c set -eux; for src in idle3 p…   36B
    <missing>      RUN /bin/sh -c set -eux; savedAptMark=...      35.7MB
    <missing>      ENV PYTHON_VERSION=3.13.18                      0B
    <missing>      RUN /bin/sh -c set -eux; apt-get update; ...    3.81MB
    <missing>      # debian.sh --arch 'amd64' out/ 'trixie' ...    78.9MB

(Cortei algumas colunas e linhas de variáveis de ambiente.) Lê de baixo para cima: as linhas de baixo são da imagem base (78,9 MB de Debian, 35,7 MB do Python), as de cima são as tuas. Vês que as tuas instruções somam 1,84 kB. As linhas `<missing>` são normais: significam que essas camadas vieram da base e não foram construídas localmente.

**DICA:** usa `docker history` para descobrir porque é que uma imagem é grande: procura a linha com o tamanho maior.

## Limpar o que construíste

Imagens e contentores de estudo acumulam-se. Remove só o que é teu, pelo nome, e nunca uses comandos de limpeza global:

    docker rm -v est-dk03-api
    docker rmi est-dk03-tarefas:1.0 est-dk03-tarefas:latest est-dk03-tarefas:1

O `-v` apaga também os volumes anónimos do contentor, para não deixares lixo para trás.

## Resumo

| Tema | Ideia a reter |
| --- | --- |
| docker build -t nome:tag . | Constrói a partir do Dockerfile e do contexto |
| Ordem das instruções | Do que muda menos para o que muda mais |
| CMD e ENTRYPOINT | Usa a forma exec para o Python ser o PID 1 |
| USER | Não corras como root sem necessidade |
| .dockerignore | Contexto pequeno, sem segredos |
| Multi-stage | Constrói numa fase, entrega noutra |
| Base da imagem | É o que mais pesa: slim ou alpine |

## Exercícios

**PRATICAR:** resolve os exercícios 9 a 12 (construir e correr a imagem do serviço, cache e ordem das instruções, exec contra shell e ENTRYPOINT, e .dockerignore com multi-stage e tamanhos). Estão no módulo de exercícios e as soluções no gabarito.

## Fontes oficiais

- Referência do Dockerfile: https://docs.docker.com/reference/dockerfile/
- Boas práticas para construir imagens: https://docs.docker.com/build/building/best-practices/
- Cache de build: https://docs.docker.com/build/cache/
- Otimizar a cache: https://docs.docker.com/build/cache/optimize/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Contexto de build e .dockerignore: https://docs.docker.com/build/concepts/context/
- Variáveis de build (ARG) e de ambiente: https://docs.docker.com/build/building/variables/
- docker buildx build: https://docs.docker.com/reference/cli/docker/buildx/build/
- docker image build: https://docs.docker.com/reference/cli/docker/image/build/
- docker image history: https://docs.docker.com/reference/cli/docker/image/history/
- docker container stop: https://docs.docker.com/reference/cli/docker/container/stop/
- Imagem oficial python: https://hub.docker.com/_/python
