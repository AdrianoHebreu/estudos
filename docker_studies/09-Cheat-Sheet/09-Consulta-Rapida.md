# 09 Consulta rápida

Uma página para consultar no dia a dia. Os comandos foram executados no curso com o Docker 29.9.3 e o Compose v5.7.0, em Docker Desktop no Windows com Git Bash. Para o detalhe, vê o módulo indicado.

## Contentores (módulos 01 e 02)

| Tarefa | Comando |
|---|---|
| Correr em segundo plano | docker run -d --name nome -p 8080:80 imagem |
| Correr e apagar no fim | docker run --rm imagem |
| Interativo | docker run -it imagem sh |
| Listar | docker ps (só os ativos) e docker ps -a (todos) |
| Parar, iniciar, reiniciar | docker stop nome, docker start nome, docker restart nome |
| Remover com os volumes anónimos | docker rm -v nome |
| Logs | docker logs -f nome |
| Entrar num contentor a correr | docker exec -it nome sh |
| Inspecionar com filtro | docker inspect --format "{{.State.ExitCode}}" nome |
| Recursos | docker stats e docker top nome |
| Copiar ficheiros | docker cp nome:/caminho ./destino |

| Flag de docker run | Para quê |
|---|---|
| -e VAR=valor e --env-file ficheiro | Variáveis de ambiente (o -e prevalece) |
| --restart on-failure:3 | Política de reinício |
| --memory e --cpus | Limites de recursos |
| -p anfitrião:contentor | Publicar uma porta (127.0.0.1:porta:porta para ficar só local) |

**ATENÇÃO:** o `docker rm` sem `-v` deixa órfão um volume anónimo. Imagens como o postgres criam um sozinhas.

| Código de saída | Significado |
|---|---|
| 0 | Terminou bem |
| 126 e 127 | Comando sem permissão ou inexistente |
| 137 | Terminado à força (SIGKILL), por exemplo no docker stop quando o processo ignora o SIGTERM, ou por falta de memória |

**DICA:** na forma exec do CMD o `docker stop` demorou 2,6 s e saiu com 0. Na forma shell demorou 5,9 s e saiu com 137, porque o shell não passa o sinal.

## Imagens e Dockerfile (módulo 03)

| Tarefa | Comando |
|---|---|
| Construir | docker build -t nome:tag . |
| Listar e apagar | docker images e docker rmi nome:tag |
| Ver as camadas | docker history nome:tag |
| Etiquetar | docker tag origem destino |

| Instrução | Para quê |
|---|---|
| FROM | Imagem base, com a tag fixa |
| WORKDIR, COPY, RUN | Pasta de trabalho, copiar ficheiros, executar na construção |
| ENV e ARG | Variável do contentor e variável só do build |
| CMD e ENTRYPOINT | Comando por omissão e executável fixo (forma exec, com parênteses retos) |
| USER | Utilizador sem privilégios |
| HEALTHCHECK | Como saber se está saudável |
| EXPOSE | Documenta a porta (não a publica) |

**Regra da cache:** põe primeiro o que muda pouco (dependências) e só depois o código. Medido no curso: depois de editar o código, 4,8 s com a ordem má e 2,1 s com a ordem boa. O `.dockerignore` reduziu o contexto de 30 MB para 63 B.

| Imagem base | Tamanho medido |
|---|---|
| python:3.13 | 1.11 GB |
| python:3.13-slim | 118 MB |
| python:3.13-alpine | 45.7 MB |

## Redes e volumes (módulo 04)

| Tarefa | Comando |
|---|---|
| Criar uma rede | docker network create nome |
| Ligar um contentor | docker run --network nome ... |
| Volume nomeado | docker volume create nome e -v nome:/caminho |
| Bind mount | -v "$(pwd -W)":/caminho no Git Bash do Windows |
| Ver o IP (Docker 29) | docker inspect --format "{{.NetworkSettings.Networks.nome.IPAddress}}" contentor |

| Regra | Nota |
|---|---|
| DNS entre contentores | Só funciona em redes definidas pelo utilizador, pelo nome do contentor |
| Porta publicada | 0.0.0.0 expõe a toda a rede; 127.0.0.1 só ao anfitrião |
| Dados | Volume nomeado para dados; bind mount para código em desenvolvimento |
| Do contentor ao anfitrião | host.docker.internal no Docker Desktop; no Linux precisa de --add-host |

**ATENÇÃO:** no Git Bash do Windows, com `MSYS_NO_PATHCONV=1`, `$(pwd)` monta uma pasta vazia sem erro. Usa `pwd -W`. E o `.NetworkSettings.IPAddress` já não existe no Docker 29.

## Docker Compose (módulo 05)

| Tarefa | Comando |
|---|---|
| Arrancar | docker compose -p projeto up -d --build |
| Estado e logs | docker compose -p projeto ps e logs -f serviço |
| Entrar num serviço | docker compose -p projeto exec serviço sh |
| Ver a configuração final | docker compose -p projeto config |
| Parar e remover (os volumes ficam) | docker compose -p projeto down |
| Remover também os volumes | docker compose -p projeto down -v (apaga os dados) |

| Ficheiro ou opção | Para quê |
|---|---|
| compose.yaml | Serviços, redes e volumes |
| compose.override.yaml | Lido automaticamente por cima (desenvolvimento) |
| -f compose.yaml -f compose.prod.yaml | Override explícito (produção) |
| .env | Variáveis para o próprio Compose |
| depends_on com condition: service_healthy | Espera que o serviço esteja pronto (com service_started deu Connection refused) |
| profiles | Serviços opcionais |
| ${VAR:?mensagem} | Falha com mensagem se faltar a variável |

## Boas práticas e segurança (módulo 06)

| Prática | Em concreto |
|---|---|
| Imagem reproduzível | Tag fixa, ou digest, e imagem base oficial |
| Utilizador sem privilégios | USER no Dockerfile (nos testes, uid 10001) |
| Segredos | Nunca em ENV nem na imagem: secrets do Compose, ou build secrets (--secret) |
| Contentor endurecido | read_only, tmpfs, cap_drop ALL, no-new-privileges |
| Limites | Memória, CPU e pids |
| Logs | Rotação, para não encher o disco |
| Entrega | docker tag e docker push para um registry; prefixo do registry no nome |
| Rede | Publica só o necessário e prefere 127.0.0.1 |

**ATENÇÃO:** um segredo em ENV aparece em `docker inspect` e em `docker history`. Um segredo do Compose não aparece no inspect.

## Diagnóstico (módulo 06)

| Sintoma | Causa provável | Como confirmar |
|---|---|---|
| O contentor sai logo | O comando falha: códigos 2, 127 ou 1 | docker logs e docker inspect do código de saída |
| A porta não responde | Presa a 127.0.0.1, ou porta mapeada errada | docker ps e docker port |
| Disco ou tmpfs cheio | Logs sem rotação, ou tmpfs pequeno | docker system df e docker exec df |
| Um serviço não encontra outro | Estão em redes diferentes | docker network inspect |
| Erro de permissões num volume | O utilizador do contentor não é o dono | Correção com chown no Dockerfile |

## Regras de segurança ao experimentar

1. Dá prefixo e nome aos teus recursos e usa volumes nomeados.
2. Nunca corras prune sem leres o que remove: apaga recursos que podem não ser teus.
3. Remove o que criaste no fim: contentores com `docker rm -v`, e depois redes, volumes e imagens.
4. Não uses portas ocupadas por serviços locais.

## Exercícios

**PRATICAR:** usa esta página para resolver os exercícios do módulo 08 sem abrir a documentação.

## Fontes oficiais

- [Documentação do Docker](https://docs.docker.com/)
- [Referência da linha de comandos](https://docs.docker.com/reference/cli/docker/)
- [Referência do Dockerfile](https://docs.docker.com/reference/dockerfile/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Boas práticas para Dockerfiles](https://docs.docker.com/build/building/best-practices/)
