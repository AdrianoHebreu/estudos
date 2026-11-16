# 00 Introdução e mapa do curso

## O que é o Docker e que problema resolve

O Docker é uma plataforma aberta para **construir, distribuir e executar aplicações em contentores**. Um **contentor** é um processo (ou um grupo de processos) isolado do resto do sistema, que leva consigo tudo o que a aplicação precisa para correr: o programa, as bibliotecas, as dependências e a configuração base.

O problema clássico é o «na minha máquina funciona»:

- A aplicação precisa de Python 3.13 e de uma biblioteca numa versão exata, mas o servidor tem outra versão instalada.
- Um colega tem o PostgreSQL 15 e tu tens o 17, e o comportamento difere.
- Instalar um novo projeto obriga a seguir um documento de vinte passos que já está desatualizado.
- Duas aplicações no mesmo servidor precisam de versões incompatíveis da mesma dependência.

Com Docker, descreves o ambiente num ficheiro (o **Dockerfile**, módulo 03), constróis uma **imagem** e executas essa imagem em qualquer sítio onde o Docker exista. O ambiente deixa de depender do que está instalado no anfitrião (o computador onde o Docker corre).

O Docker tem duas peças principais. O **cliente** (o comando `docker`) recebe as tuas ordens. O **daemon** (`dockerd`) faz o trabalho pesado: constrói imagens, cria e executa contentores e gere redes e volumes. Falam entre si por uma API, normalmente num socket local, mas o daemon pode estar noutra máquina. As imagens são guardadas em **registos**; o **Docker Hub** é o registo público por omissão.

**NOTA:** o Docker não é a única ferramenta de contentores (existem, por exemplo, o Podman e o containerd usado diretamente), mas é a referência e a que este curso usa.

## Contentores vs máquinas virtuais

Ambos isolam aplicações, mas de formas diferentes. Uma **máquina virtual** (VM) simula um computador inteiro, com o seu próprio sistema operativo. Um contentor **partilha o kernel** do sistema anfitrião e isola apenas os processos, o sistema de ficheiros e a rede.

| Aspeto | Máquina virtual | Contentor |
| --- | --- | --- |
| O que inclui | Sistema operativo completo | Aplicação e dependências, sem kernel próprio |
| Isolamento | Forte (hardware virtualizado) | Mais leve (isolamento de processos no mesmo kernel) |
| Tamanho típico | Gigabytes | Megabytes (varia muito) |
| Arranque | Segundos a minutos | Normalmente segundos ou menos |
| Consumo de recursos | Mais alto: cada VM reserva memória para o seu sistema | Mais baixo: só o que a aplicação usa |
| Portabilidade | Imagem de disco grande, ligada ao hipervisor | Imagem pequena, igual em qualquer anfitrião com Docker |
| Bom para | Executar sistemas operativos diferentes, isolamento forte | Empacotar e escalar aplicações |

Como o contentor usa o kernel do anfitrião, um contentor Linux precisa de um kernel Linux. É por isso que no Windows e no macOS o Docker Desktop corre uma pequena VM Linux por baixo: os teus contentores continuam a ser leves, mas vivem dentro dessa VM.

**ATENÇÃO:** os contentores não são uma fronteira de segurança tão forte como uma VM. Para código realmente hostil, a VM continua a ser a opção mais segura. Este curso foca contentores Linux; os contentores Windows não são abordados.

## Docker Desktop vs Docker Engine

Há dois nomes que se confundem com facilidade.

| Aspeto | Docker Engine | Docker Desktop |
| --- | --- | --- |
| O que é | O motor: daemon, cliente e componentes de base | Aplicação completa para o teu computador, que inclui o motor |
| Onde corre | Linux (nativo) | Windows, macOS e Linux |
| Como usas | Linha de comandos | Linha de comandos e interface gráfica |
| Extras | Instalas à parte o Compose e o Buildx | Traz Compose, Buildx e outras ferramentas |
| VM por baixo | Não | Sim (no Windows e no macOS; também no Linux) |
| Licença | Código aberto (Apache 2.0) | Gratuito em certos casos, subscrição noutros |

O Docker Desktop é gratuito para pequenas empresas (menos de 250 funcionários e menos de 10 milhões de dólares de receita anual), uso pessoal, educação e projetos de código aberto não comerciais. Exige subscrição paga para uso profissional em organizações maiores. Confirma sempre as condições atuais em https://docs.docker.com/subscription/desktop-license/ antes de o usares no trabalho.

**DICA:** em servidores Linux usa o Docker Engine. No teu portátil Windows ou macOS usa o Docker Desktop. Os comandos `docker` são os mesmos nos dois casos, que é o que torna este curso independente do sistema.

No Docker Desktop, o comando `docker` pode apontar para diferentes motores através de **contextos**. Na máquina onde este curso foi testado, `docker context ls` mostra o contexto `desktop-linux` (assinalado com asterisco). No Linux com Docker Engine, o contexto é `default`.

## Onde se usa

| Cenário | Como o Docker ajuda |
| --- | --- |
| Desenvolvimento local | Arrancas uma base de dados ou um serviço com um comando, sem instalar nada no sistema |
| Ambientes iguais para toda a equipa | Todos correm a mesma imagem, com as mesmas versões |
| Integração contínua (CI) | Os testes correm num ambiente limpo e reprodutível |
| Produção | Servidores, plataformas de nuvem e orquestradores executam as mesmas imagens |
| Experimentar software | Testas uma ferramenta nova e apagas tudo no fim, sem deixar lixo no sistema |
| Ensino | Cada aluno tem exatamente o mesmo ambiente de laboratório |

**NOTA:** este curso cobre o essencial para um developer: contentores, imagens, redes, volumes e Docker Compose. A orquestração (Swarm, Kubernetes) aparece só numa visão geral, sem executar nada. Não usamos GPU.

## Instalar o Docker

Os requisitos mudam com as versões. O que se segue resume as páginas oficiais; **confirma sempre os requisitos atuais** nas ligações da secção «Fontes oficiais».

### Windows

O Docker Desktop para Windows suporta três motores internos (backends): **WSL 2**, **Hyper-V** e **Docker VMM** (beta). O WSL 2 é o predefinido e o que serve a maioria das pessoas.

| Aspeto | WSL 2 | Hyper-V |
| --- | --- | --- |
| O que é | Subsistema Windows para Linux, versão 2 | Hipervisor do Windows |
| Instalação | Por utilizador, sem administrador (recomendada) | Só com a instalação para todos os utilizadores |
| Requisito do WSL | WSL 2.1.5 ou posterior | Ativar as funcionalidades Hyper-V e Contentores do Windows |

Requisitos indicados na documentação: Windows 11 (Enterprise, Pro ou Education, versão 23H2, compilação 22631, ou superior) ou Windows 10 (Enterprise, Pro ou Education, versão 22H2, compilação 19045); processador de 64 bits com SLAT; 8 GB de RAM; virtualização ativada na BIOS/UEFI. Confirma na página oficial se a tua edição do Windows é suportada.

Para verificar a versão do WSL, num PowerShell:

    wsl --version

Se não aparecerem detalhes de versão, estás provavelmente com a versão antiga do WSL. Atualiza (num PowerShell como administrador):

    wsl --install
    wsl --update

Depois descarrega o instalador na página oficial (ligação em «Fontes oficiais»), executa-o, mantém o WSL 2 selecionado e inicia o Docker Desktop. O motor só funciona enquanto o Docker Desktop estiver a correr.

### macOS

Requisitos da documentação: uma versão suportada do macOS (a atual e as duas anteriores) e pelo menos 4 GB de RAM. Há instaladores separados para Apple silicon e para Intel. Descarrega o ficheiro `Docker.dmg`, abre-o e arrasta o ícone do Docker para a pasta Aplicações. Abre depois `/Applications/Docker.app`.

### Linux

No Linux tens duas opções, e podem coexistir:

- **Docker Engine** (recomendado em servidores): instala-se a partir do repositório do Docker para a tua distribuição. Há guias oficiais para Ubuntu, Debian, Fedora, RHEL, CentOS e outras. Nas distribuições Debian e Ubuntu, os pacotes são `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin` e `docker-compose-plugin`.
- **Docker Desktop para Linux**: precisa de virtualização KVM, QEMU 5.2 ou posterior, systemd e 4 GB de RAM. Corre numa VM com o seu próprio contexto (`desktop-linux`): as imagens e os contentores do Docker Engine instalado antes **não** aparecem lá.

**ATENÇÃO:** no Linux, a documentação pós-instalação sugere adicionar o teu utilizador ao grupo `docker` para não teres de escrever `sudo` em cada comando. Esse grupo dá privilégios equivalentes aos de root no anfitrião. Fá-lo só em máquinas pessoais e percebe o impacto antes de o fazeres. Os guias oficiais usam `sudo docker ...` até esse passo.

**NOTA:** instalar o Docker a partir dos pacotes da própria distribuição (por exemplo, `docker.io`) é possível, mas esses pacotes são mantidos pela distribuição e não pelo Docker, pelo que podem diferir do que o curso mostra.

## Verificar a instalação

Com o Docker em execução, abre um terminal (PowerShell, Terminal do macOS ou shell do Linux) e corre:

    docker version

O comando mostra duas partes: **Client** (o cliente `docker`) e **Server** (o daemon). Se aparecer apenas a parte Client com um erro de ligação, o motor não está a correr (no Docker Desktop, abre a aplicação e espera que fique pronta). Saída real, abreviada, na máquina de teste:

    Client:
     Version:           29.9.3
     API version:       1.56
     OS/Arch:           windows/amd64
     Context:           desktop-linux

    Server: Docker Desktop 4.99.0 (245822)
     Engine:
      Version:          29.9.3
      API version:      1.56 (minimum version 1.40)
      OS/Arch:          linux/amd64

Repara que o cliente corre em `windows/amd64` e o servidor em `linux/amd64`: o motor vive na VM Linux do Docker Desktop. No Linux nativo, os dois mostram `linux`. As tuas versões vão diferir das aqui mostradas; o importante é aparecerem as duas partes.

Para o Docker Compose (módulo 05), que vem incluído no Docker Desktop:

    docker compose version

Na máquina de teste devolveu `Docker Compose version v5.7.0`.

## O teu primeiro contentor: hello-world

A imagem `hello-world` é oficial, minúscula e serve só para confirmar que tudo funciona. O comando seguinte dá-lhe um nome (o curso usa sempre nomes explícitos) e executa-a:

    docker run --name est-dk00-hello hello-world

Na primeira vez, o Docker não encontra a imagem localmente, descarrega-a do Docker Hub e só depois cria e executa o contentor. Saída real:

    Unable to find image 'hello-world:latest' locally
    latest: Pulling from library/hello-world
    4f55086f7dd0: Pull complete
    Digest: sha256:cf1b20a0c89a666b6950fecda7ccbc1b1a86520e7c53f908f3a21e79d0d60458
    Status: Downloaded newer image for hello-world:latest

    Hello from Docker!
    This message shows that your installation appears to be working correctly.

A mensagem completa explica o que se passou, em quatro passos: o cliente contactou o daemon, o daemon descarregou a imagem do Docker Hub, criou um contentor a partir dela e enviou a saída para o teu terminal. O resumo vale a pena memorizar:

    comando docker run  ->  cliente  ->  daemon  ->  (descarrega a imagem, se faltar)  ->  cria e arranca o contentor

O contentor mostrou a mensagem e terminou. Contentores que terminaram ficam guardados até os removeres. Vê-lo com `docker ps -a` (o `-a` inclui os parados):

    docker ps -a --filter name=est-dk00

    CONTAINER ID   IMAGE         COMMAND    CREATED              STATUS                          PORTS     NAMES
    528b1724bfe6   hello-world   "/hello"   About a minute ago   Exited (0) About a minute ago             est-dk00-hello

O estado `Exited (0)` significa que o programa terminou sem erros. Para limpar o que criaste, remove o contentor pelo nome:

    docker rm est-dk00-hello

A imagem `hello-world` continua guardada no teu computador (ocupa cerca de 10 kB) e uma próxima execução já não a descarrega. Mais tarde aprendes a gerir imagens com cuidado (módulo 01 em diante).

**DICA:** quando só queres executar e deitar fora, usa `docker run --rm hello-world`. A opção `--rm` remove o contentor assim que ele termina.

**PRATICAR:** corre `docker version` e `docker run --name est-dk00-hello hello-world` na tua máquina. Confirma com `docker ps -a` que o contentor aparece como `Exited (0)` e remove-o com `docker rm est-dk00-hello`.

## O projeto fio condutor: o serviço de tarefas

Ao longo do curso trabalhas sempre sobre o mesmo projeto: o **serviço de tarefas**, uma API pequena escrita em Python 3.13. Cada módulo escreve a versão mínima de que precisa (biblioteca padrão, ou FastAPI e uvicorn onde fizer sentido) e diz-te qual usou. O que nunca muda é o **contrato**:

| Pedido | Corpo | O que faz |
| --- | --- | --- |
| GET /saude | nenhum | Devolve o JSON com o estado do serviço: {"estado":"ok"} |
| GET /tarefas | nenhum | Devolve a lista de tarefas |
| POST /tarefas | JSON com o título: {"titulo": "..."} | Cria uma tarefa |

E a configuração é feita por variáveis de ambiente:

| Variável | Obrigatória | Efeito |
| --- | --- | --- |
| PORT | Não (por omissão 8000) | Porta em que o serviço escuta |
| DATABASE_URL | Não | Se existir, as tarefas são guardadas em PostgreSQL. Se não existir, ficam em memória |

Esta configuração por variáveis de ambiente é uma prática central em contentores: a **mesma imagem** corre em ambientes diferentes, e só as variáveis mudam.

**NOTA:** não precisas de escrever código Python neste módulo. A API é escrita nos módulos seguintes, e a ligação ao PostgreSQL só mais à frente. Aqui basta conheceres o contrato.

## Mapa dos módulos

| Módulo | Título | O que aprendes |
| --- | --- | --- |
| 00 | Introdução e mapa do curso | O que é o Docker, instalação, primeiro contentor, o projeto |
| 01 | Conceitos e primeiros passos | Imagens, contentores, registos, ciclo de vida básico |
| 02 | Contentores no dia a dia | Executar, parar, ver registos, entrar num contentor, publicar portas |
| 03 | Imagens e Dockerfile | Construir as tuas imagens, camadas, cache, versões |
| 04 | Redes e volumes | Ligar contentores entre si e guardar dados de forma persistente |
| 05 | Docker Compose | Descrever várias peças (serviço e base de dados) num só ficheiro |
| 06 | Boas práticas e diagnóstico | Imagens pequenas e seguras, resolução de problemas |
| 07 | Projeto final | Juntar tudo no serviço de tarefas |
| 08 | Exercícios práticos | Todos os exercícios do curso reunidos |
| 09 | Cheat sheet | Resumo dos comandos e dos ficheiros |
| 10 | Gabarito | Soluções dos exercícios |

Os módulos 01 a 07 têm aulas com exercícios (numerados de forma global, do 1 ao 25, com o projeto final como exercício 25). O módulo 08 reúne-os todos e o módulo 10 traz as soluções. Cada aula acompanha-se de um `.docx` (referência completa) e de um `.pptx` (resumo visual).

## Glossário

| Termo | Significado |
| --- | --- |
| Anfitrião (host) | O computador onde o Docker corre |
| Cliente | O comando `docker`, que envia ordens ao daemon |
| Daemon | O processo `dockerd` que gere imagens, contentores, redes e volumes |
| Imagem | Modelo só de leitura com a aplicação e as suas dependências, a partir do qual se criam contentores |
| Contentor | Instância em execução (ou parada) de uma imagem |
| Camada (layer) | Cada passo de uma imagem; as camadas são reutilizadas entre imagens |
| Registo (registry) | Serviço que guarda imagens. O Docker Hub é o registo público por omissão |
| Etiqueta (tag) | Nome de uma versão de uma imagem, como `latest` |
| Dockerfile | Ficheiro de texto com os passos para construir uma imagem |
| Volume | Armazenamento gerido pelo Docker que sobrevive ao contentor |
| Rede | Canal virtual através do qual os contentores comunicam |
| Docker Compose | Ferramenta que descreve e executa várias peças num ficheiro YAML |
| Orquestração | Gestão de muitos contentores em vários servidores (Swarm, Kubernetes), fora do âmbito |

## Como estudar

1. Lê a aula **com o terminal aberto** e executa cada comando. Os contentores só se entendem a usar.
2. Segue a ordem dos módulos: cada um assume o anterior.
3. Dá nomes aos teus contentores, redes e volumes (nos exemplos, o prefixo `est-dk` seguido do número do módulo). Assim sabes sempre o que é teu e o que podes apagar.
4. Faz os exercícios antes de consultar o gabarito (módulo 10).
5. Quando um comando falhar, lê a mensagem de erro até ao fim. No Docker, quase sempre diz o que está mal.
6. Quando não tiveres a certeza de uma opção, usa `docker <comando> --help` ou a documentação oficial.

**DICA:** os comandos do curso funcionam em PowerShell, Linux e macOS. Onde diferem (caminhos, aspas, continuação de linha), a aula mostra as duas variantes.

## Avisos de segurança

O Docker é poderoso e, por isso, também perigoso quando usado sem cuidado.

**ATENÇÃO:** não corras imagens que não conheces. Uma imagem executa código na tua máquina. Prefere imagens oficiais (assinaladas como Docker Official Image ou Verified Publisher no Docker Hub), lê a página da imagem e desconfia de nomes parecidos com os oficiais. O contentor não é uma fronteira de segurança perfeita.

**ATENÇÃO:** não coloques palavras-passe nem chaves dentro de imagens nem as envies para repositórios. Mais à frente vês como passar segredos de forma mais segura.

O Docker também pode **apagar dados**. Conhece os comandos com mais impacto:

| Comando | O que pode apagar |
| --- | --- |
| docker rm NOME | O contentor (e o que estava só dentro dele) |
| docker rm -v NOME | O contentor e os volumes anónimos associados |
| docker rmi IMAGEM | A imagem (obriga a descarregar ou a construir de novo) |
| docker volume rm NOME | O volume e todos os dados que tinha |
| docker container prune, image prune, volume prune | Todos os contentores parados, imagens sem uso ou volumes sem uso |
| docker system prune | Vários tipos de objetos de uma só vez (com a opção --volumes, também volumes anónimos) |

Os comandos prune apagam em massa, incluindo coisas que foram criadas por outros projetos ou por ti noutro dia. Esta máquina de teste, por exemplo, já tinha 20 imagens, 11 contentores e 15 volumes de outros trabalhos, e `docker system df` (só leitura) mostra o espaço ocupado:

    docker system df

    TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
    Images          20        6         9.598GB   5.361GB (55%)
    Containers      11        7         204.6MB   0B (0%)
    Local Volumes   15        12        2.091GB   110.6MB (5%)
    Build Cache     14        10        3.558kB   778B

**ATENÇÃO:** antes de apagares seja o que for, lista (`docker ps -a`, `docker volume ls`, `docker images`) e confirma que o nome é teu. Os volumes guardam dados reais, como bases de dados. Apagar um volume é irreversível. Neste curso só usas o comando `rm` com nomes explícitos, e nunca os `prune`.

**NOTA:** o Docker usa muito espaço em disco com o tempo (imagens, camadas, cache). Isso é normal; aprende primeiro a ver o que ocupa espaço com `docker system df` e só depois a limpar.

## Fontes oficiais

- Visão geral do Docker: https://docs.docker.com/get-started/docker-overview/
- O que é um contentor: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/
- Docker Desktop: https://docs.docker.com/desktop/
- Docker Desktop no Windows: https://docs.docker.com/desktop/setup/install/windows-install/
- Docker Desktop no macOS: https://docs.docker.com/desktop/setup/install/mac-install/
- Docker Desktop no Linux: https://docs.docker.com/desktop/setup/install/linux/
- Docker Engine (instalação no Linux): https://docs.docker.com/engine/install/
- Docker Engine no Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Passos pós-instalação no Linux: https://docs.docker.com/engine/install/linux-postinstall/
- Docker Desktop e WSL 2: https://docs.docker.com/desktop/features/wsl/
- Licença do Docker Desktop: https://docs.docker.com/subscription/desktop-license/
- Segurança do Docker Engine: https://docs.docker.com/engine/security/
- Imagem hello-world no Docker Hub: https://hub.docker.com/_/hello-world
- Referência do docker container run: https://docs.docker.com/reference/cli/docker/container/run/
- Docker Compose: https://docs.docker.com/compose/
