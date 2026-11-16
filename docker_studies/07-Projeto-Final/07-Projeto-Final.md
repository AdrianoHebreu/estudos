# 07 Projeto final

## O que vais fazer

Vais pôr o **serviço de tarefas** a correr como uma aplicação completa em Docker Compose: a API, uma base de dados PostgreSQL e um proxy à frente, tudo com imagens pequenas, utilizador sem privilégios, segredos fora das imagens, volumes nomeados e verificações de saúde. O projeto junta tudo o que aprendeste: imagens, redes, volumes, Compose, boas práticas e diagnóstico.

**NOTA:** o projeto é aberto. O módulo 10 traz uma grelha para te avaliares, e não um código para copiar.

## Arquitetura pedida

    cliente  ->  proxy (nginx)  ->  api (serviço de tarefas)  ->  base de dados (PostgreSQL 17)
                  porta publicada       só na rede interna          volume nomeado

Só o proxy publica uma porta no anfitrião. A API e a base de dados ficam numa rede interna.

## Requisitos

### 1. Imagem da API (módulos 03 e 06)

- Dockerfile com build em várias fases (multi-stage), tag fixa na imagem base e `.dockerignore`.
- Corre com um utilizador que não é root.
- Tem um `HEALTHCHECK` que consulta `GET /saude`.
- A imagem final é pequena: compara o tamanho com uma versão ingénua e regista os dois valores.

### 2. Compose (módulo 05)

- Um `compose.yaml` com três serviços: `proxy`, `api` e `db`.
- `depends_on` com `condition: service_healthy`, para a API só arrancar quando a base de dados responde.
- Um ficheiro de override para desenvolvimento (porta e variáveis) e outro para a configuração de produção.
- Variáveis de ambiente fora do ficheiro principal.

### 3. Dados e redes (módulo 04)

- Um volume nomeado para os dados do PostgreSQL.
- Duas redes: uma pública, só com o proxy, e uma interna, com a API e a base de dados.
- Prova que a base de dados **não** é acessível a partir do anfitrião.
- Prova que os dados sobrevivem a `docker compose down` e se perdem com `down -v`.

### 4. Segredos (módulo 06)

- A palavra-passe da base de dados vem de um segredo do Compose, e não de uma variável escrita no ficheiro.
- Nenhum segredo fica na imagem nem no repositório. Verifica com `docker history` e `docker inspect`.

### 5. Diagnóstico (módulo 06)

Provoca estas três falhas e escreve como as diagnosticaste:

1. A API arranca antes da base de dados e falha.
2. A porta publicada não responde.
3. O contentor sai logo ao arrancar.

## Entregáveis

| Entregável | Conteúdo |
|---|---|
| Imagem | Dockerfile, `.dockerignore` e a tabela de tamanhos |
| Compose | `compose.yaml` e os ficheiros de override |
| Segredos | O mecanismo usado e a prova de que não há segredos na imagem |
| Persistência | O teste de `down` contra `down -v` |
| Diagnóstico | As três falhas, com sintoma, causa e correção |
| README | Como arrancar, parar e limpar, e as limitações |

## Passo a passo

| Fase | O que fazes |
|---|---|
| 1 | Containeriza a API e mede o tamanho, antes e depois das melhorias |
| 2 | Escreve o Compose só com a API e a base de dados |
| 3 | Acrescenta as redes, o volume e os healthchecks |
| 4 | Passa a palavra-passe para um segredo |
| 5 | Acrescenta o proxy e fecha as portas desnecessárias |
| 6 | Faz os testes de persistência e as três falhas |

**DICA:** faz `docker compose config` em cada fase. Mostra o ficheiro final já com as variáveis resolvidas e apanha muitos erros antes de arrancar.

## Grelha de avaliação

Cada critério vale de 0 a 3 (0 = ausente, 1 = fraco, 2 = bom, 3 = muito bom).

| Critério | O que procurar |
|---|---|
| Imagem | Multi-stage, tag fixa, utilizador sem privilégios e tamanho medido |
| Saúde | Healthchecks que funcionam e `service_healthy` a ordenar o arranque |
| Redes | Só o proxy está exposto; a base de dados não é acessível de fora |
| Dados | Volume nomeado, com teste de `down` contra `down -v` |
| Segredos | Nada na imagem nem no repositório, e prova disso |
| Configuração | Overrides por ambiente, sem duplicar o ficheiro principal |
| Diagnóstico | As três falhas com causa real e correção |
| Limpeza | Um comando deixa tudo limpo, sem volumes anónimos órfãos |
| Documentação | Alguém consegue correr o projeto só com o README |

Somando 9 critérios de 0 a 3, o máximo é 27. Até 13 há lacunas importantes; de 14 a 22 o trabalho está sólido; a partir de 23 está pronto para mostrar.

## Erros comuns

| Erro | Como evitar |
|---|---|
| Publicar a porta da base de dados | Deixa-a só na rede interna |
| Palavra-passe em ENV no Dockerfile | Usa segredos e confirma com `docker history` |
| Usar a tag latest | Fixa a versão da imagem |
| Esquecer o volume nomeado | O PostgreSQL cria um volume anónimo que fica órfão |
| `depends_on` sem healthcheck | Só espera que o contentor arranque, e não que esteja pronto |
| Fazer `down -v` sem pensar | Apaga os dados: usa-o só quando o queres |

## Depende do ambiente

- **Windows com Docker Desktop:** os caminhos dos bind mounts e o `host.docker.internal` comportam-se de forma diferente do Linux (módulo 04).
- **Linux:** pode ser preciso adicionar o utilizador ao grupo `docker` e confirmar as regras da firewall para as portas publicadas.
- **Produção:** este projeto é de estudo. Num ambiente real há ainda cópias de segurança da base de dados, monitorização, TLS no proxy e um orquestrador, que ficam fora deste curso.

## Exercícios

**PRATICAR:** o exercício 25 do módulo 08 é este projeto. O módulo 10 traz a grelha de avaliação.

## Fontes oficiais

- [Documentação do Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Boas práticas para Dockerfiles](https://docs.docker.com/build/building/best-practices/)
- [Segredos no Compose](https://docs.docker.com/compose/how-tos/use-secrets/)
- [Imagem oficial do PostgreSQL](https://hub.docker.com/_/postgres)
