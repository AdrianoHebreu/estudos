# 07 Operação e segurança

Até aqui o MongoDB foi um servidor aberto, no teu portátil. Em produção isso não serve: tens de impedir acessos indevidos, sobreviver à queda de uma máquina, poder recuperar de um erro humano e perceber o que o servidor está a fazer. Este módulo cobre autenticação e papéis, um replica set de 3 nós com eleição, cópias de segurança, monitorização básica e uma visão geral de atualizações e sharding. Versão do servidor: MongoDB 8.3.17 (imagem `mongo:8`), com ferramentas `mongodump` e `mongorestore` da própria imagem. Os ficheiros estão em `07-Operacao-e-Seguranca/exemplos/`. Tudo o que está marcado como executado foi corrido com estes ficheiros, em contentores próprios (prefixo `est-mg07`).

O módulo 06 já mostrou um replica set de 1 nó para transações. Aqui o foco é o que muda quando há vários nós e autenticação.

## Autenticação: ligar e criar o primeiro utilizador

Por omissão, o `mongod` aceita qualquer ligação sem credenciais. A autenticação (e a autorização, que decide o que cada utilizador pode fazer) só fica ativa quando o servidor arranca com `--auth` ou com um `keyFile`. A imagem Docker oficial liga-a sozinha quando defines as variáveis do utilizador root:

    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/root_password

A variável com sufixo `_FILE` lê a palavra-passe de um ficheiro, em vez de a pores no ambiente. O Compose entrega esse ficheiro através de secrets, e cada segredo vem de uma variável do teu terminal, não do ficheiro Compose:

    secrets:
      root_password:
        environment: MONGO_ROOT_PASSWORD

O ficheiro completo é o `compose-auth.yml`. Arranque (executado):

    export MONGO_ROOT_PASSWORD='...' MONGO_LEITOR_PASSWORD='...' MONGO_APP_PASSWORD='...'
    docker compose -p est-mg07 -f compose-auth.yml up -d

**ATENÇÃO:** as palavras-passe nunca entram no `.yml` nem no Git. Nos exemplos são fictícias e só servem para estudo local. Em produção usa o gestor de segredos da tua plataforma. Um `.env` ao lado do Compose também deve estar no `.gitignore`.

Os scripts em `docker-entrypoint-initdb.d/` correm só na primeira inicialização, com o volume de dados vazio. É por isso que mudar o script depois não tem efeito sem apagar o volume (`down -v`). O `01_criar_utilizadores.js` cria dois utilizadores na base `loja`:

    loja.createUser({ user: "app_loja", pwd: lerSegredo("app_password"),
                      roles: [{ role: "readWrite", db: "loja" }] })
    loja.createUser({ user: "leitor_loja", pwd: lerSegredo("leitor_password"),
                      roles: [{ role: "read", db: "loja" }] })

Sem credenciais, o servidor responde (executado):

    docker exec est-mg07-auth mongosh --quiet --eval 'db.getSiblingDB("loja").produtos.find().toArray()'
    # MongoServerError: Command find requires authentication

## Papéis (roles) com privilégios mínimos

Um papel é um conjunto de privilégios: ações (`find`, `insert`, `update`...) sobre recursos (uma base, uma coleção ou o cluster). Princípio do privilégio mínimo: cada utilizador recebe só o que precisa.

| Papel integrado | O que permite |
|---|---|
| read | ler todas as coleções (não de sistema) de uma base |
| readWrite | ler e escrever numa base |
| dbAdmin | tarefas de administração da base (índices, estatísticas), sem ler dados de utilizadores |
| userAdmin | criar utilizadores e papéis na base |
| backup e restore | apenas o necessário para mongodump e mongorestore |
| root | tudo: usa-o só para administração, nunca numa aplicação |

A lista completa está nos papéis integrados da documentação. Um utilizador existe numa base de autenticação (a base onde foi criado). Por isso a connection string leva `authSource`:

    mongodb://app_loja:PALAVRA_PASSE@localhost:27017/loja?authSource=loja
    mongodb://admin:PALAVRA_PASSE@localhost:27017/?authSource=admin

Resultados reais, com os utilizadores criados (executado):

    # leitor_loja: lê mas não escreve
    db.produtos.countDocuments()        // 2
    db.produtos.insertOne({x: 1})       // Unauthorized: not authorized on loja to execute command { insert: "produtos" ... }

    # app_loja: escreve em loja, mas não vê utilizadores nem outras bases
    db.produtos.updateOne({id: 1}, {$inc: {stock: -1}}).modifiedCount   // 1
    db.getSiblingDB("admin").system.users.find()    // Unauthorized: not authorized on admin ...
    db.getSiblingDB("outra").x.insertOne({a: 1})    // Unauthorized

    # palavra-passe errada
    // MongoServerError: Authentication failed.

Nos logs, a falha fica registada como `Failed to authenticate`, com utilizador, base e mecanismo (SCRAM-SHA-256), sem a palavra-passe.

### Papéis à medida

Quando os integrados são demasiado largos, cria um papel com os privilégios exatos. O `02_papeis_e_utilizadores.js` cria o papel `gestor_stock`, que só pode `find` e `update` em `loja.produtos`:

    loja.createRole({
      role: "gestor_stock",
      privileges: [{ resource: { db: "loja", collection: "produtos" },
                     actions: ["find", "update"] }],
      roles: []
    })
    loja.createUser({ user: "armazem", pwd: "...",
                      roles: [{ role: "gestor_stock", db: "loja" }] })

Verificação (executada): o utilizador `armazem` consegue `updateOne` (modifiedCount 1) mas o `insertOne` falha com `Unauthorized`. Para ajustar depois, usa `grantRolesToUser`, `revokeRolesFromUser` e `updateUser`. Para ver o que um utilizador tem: `db.getUser("armazem")` e `db.getRole("gestor_stock", { showPrivileges: true })`.

**NOTA:** a autenticação não cifra o tráfego: liga também TLS e considera cifra em repouso (não executei isto; vê a documentação).

## Replica set de 3 nós

Um replica set é um grupo de processos `mongod` com os mesmos dados: o primário recebe as escritas e os secundários replicam-nas (e podem servir leituras). Se o primário falhar, a maioria elege outro, sem intervenção. Com 3 nós a maioria é 2, por isso toleras a perda de 1; com 2 nós, perder um deixa o conjunto sem primário.

Com autenticação ligada, os nós autenticam-se uns aos outros. A forma mais simples é um keyFile partilhado (a documentação de autenticação interna também descreve certificados X.509 como alternativa). O ficheiro `compose-replset-auth.yml` faz isto:

1. Gera-se o keyFile fora do Git: `openssl rand -base64 756 > "$KEYFILE_PATH"`.
2. O Compose monta-o como secret. O `mongod` exige que o ficheiro pertença ao utilizador `mongodb` e tenha permissões 400, por isso o entrypoint copia o segredo para `/tmp`, ajusta dono e permissões, e só depois entrega ao entrypoint da imagem.
3. O utilizador root é criado só no `mongo1`. Os outros nós recebem-no na sincronização inicial.
4. Um contentor de uma só execução (`iniciar`) corre o `04_iniciar_replica_set.js`, que chama `rs.initiate` com os três membros e termina.

    export KEYFILE_PATH="$HOME/segredos/est-mg07.key"
    mkdir -p "$(dirname "$KEYFILE_PATH")" && openssl rand -base64 756 > "$KEYFILE_PATH"
    export MONGO_ROOT_PASSWORD='...'
    docker compose -p est-mg07 -f compose-replset-auth.yml up -d

O `04_iniciar_replica_set.js` chama `rs.initiate({ _id: "rs0", members: [...] })` com `mongo1` (priority 2), `mongo2` e `mongo3`, todos na porta 27017 da rede do Compose.

**ATENÇÃO:** os membros anunciam-se pelo nome (`mongo1:27017`), que só existe dentro da rede do Compose. Por isso os exemplos usam `docker exec ... mongosh`. A partir do anfitrião (portas 31071 a 31073) a ligação a um nó teria de ser direta (`directConnection=true`; não testei a partir do anfitrião); um cliente com `replicaSet=rs0` tentaria resolver `mongo1` e falharia. Em produção, usa nomes DNS que os clientes consigam resolver.

Estado do conjunto (executado, `rs.status()`):

    0 mongo1:27017 PRIMARY
    1 mongo2:27017 SECONDARY
    2 mongo3:27017 SECONDARY

Ligar a um replica set com autenticação: a connection string lista os membros, o nome do conjunto e a base de autenticação.

    mongodb://app_loja:PALAVRA_PASSE@mongo1:27017,mongo2:27017,mongo3:27017/loja?authSource=loja&replicaSet=rs0

### Leituras no secundário

Por omissão, leitura e escrita vão ao primário. Com read preference `secondary` (ou `secondaryPreferred`) as leituras podem ir aos secundários. Os dados de um secundário podem estar ligeiramente atrasados em relação ao primário.

    # connection string com preferência por secundários (executado)
    mongodb://app_loja:...@mongo1:27017,mongo2:27017,mongo3:27017/loja?authSource=loja&replicaSet=rs0&readPreference=secondary

    db.produtos.countDocuments()                  // 2, servido por um secundário
    db.produtos.insertOne({x: 1})                 // MongoServerError: not primary   (numa ligação direta a um secundário)

O atraso vê-se com `rs.printSecondaryReplicationInfo()`: no teste mostrou `0 secs (0 hrs) behind the primary` nos dois secundários.

### Eleição: parar o primário

Pára o primário e vê o que acontece (executado):

    docker stop est-mg07-mongo1
    # passados cerca de 12 segundos, num dos outros nós:
    rs.status().members.forEach(m => print(m._id, m.name, m.stateStr, m.health))
    # 0 mongo1:27017 (not reachable/healthy) 0
    # 1 mongo2:27017 PRIMARY 1
    # 2 mongo3:27017 SECONDARY 1
    # term 2

O conjunto elegeu o `mongo2` e o termo (term) passou a 2. Uma ligação com a connection string do conjunto encontra o novo primário sozinha: a escrita seguinte (`updateOne` com `$inc` no stock) funcionou sem mudar nada. Ao arrancar o `mongo1` outra vez (`docker start est-mg07-mongo1`), ele voltou como PRIMARY, porque tem priority 2 e o conjunto volta a eleger o nó preferido, e o stock lido num secundário já mostrava o valor escrito durante a falha (39).

**DICA:** as aplicações devem tolerar uns segundos sem primário: usa os retries do driver e write concern majority (módulo 06).

## Cópias de segurança: mongodump e mongorestore

O `mongodump` lê os dados e escreve ficheiros BSON; o `mongorestore` volta a carregá-los. É simples e serve para bases pequenas e médias. Para bases muito grandes, a documentação de backups descreve alternativas (snapshots do sistema de ficheiros, ferramentas geridas): consulta-a.

O `03_utilizador_backup.js` cria um utilizador com os papéis `backup` e `restore`, em vez de usares o root. Em produção usa dois utilizadores diferentes. Depois (executado):

    export MSYS_NO_PATHCONV=1
    U='mongodb://copias:PALAVRA_PASSE@localhost:27017/?authSource=admin'
    docker exec est-mg07-auth mongodump --uri="$U" --db=loja --gzip --archive=/copias/loja.gz
    # done dumping `loja.produtos` (2 documents)
    # -rw-r--r-- 1 root root 425 /copias/loja.gz

    # simular o desastre: apagar os dados
    db.getSiblingDB("loja").produtos.deleteMany({})     // contagem 0

    docker exec est-mg07-auth mongorestore --uri="$U" --gzip --archive=/copias/loja.gz --nsInclude='loja.*'
    # finished restoring `loja.produtos` (2 documents, 0 failures)
    # 2 document(s) restored successfully. 0 document(s) failed to restore.

| Opção | Para quê |
|---|---|
| --gzip | comprime a saída (e tens de a repetir no restore) |
| --archive=ficheiro | escreve um único ficheiro em vez de uma pasta por base |
| --db e --collection | limita o que copias (sem --archive, escreve ficheiros .bson por coleção) |
| --nsInclude | no restore, limita ao que queres (ex.: loja.*) |
| --oplog | num replica set, inclui as escritas durante a cópia, para um instantâneo consistente |
| --drop | no restore, apaga a coleção antes de a repor |

Num replica set, a cópia consistente de todo o conjunto usa `--oplog` e o restore usa `--oplogReplay` (executado, lendo de um secundário):

    mongodump --uri="mongodb://admin:...@mongo1:27017,mongo2:27017,mongo3:27017/?authSource=admin&replicaSet=rs0&readPreference=secondary" --gzip --oplog --archive=/tmp/tudo.gz
    # dumped 1 oplog entry
    mongorestore --uri="mongodb://admin:...@mongo1:27017/?authSource=admin" --gzip --oplogReplay --archive=/tmp/tudo.gz
    # applied 0 oplog entries ... 2 document(s) restored successfully.

**ATENÇÃO:** uma cópia que nunca restauraste não é uma cópia: testa o restore num ambiente à parte e guarda as cópias fora do servidor.

**NOTA:** o restore repõe documentos e recria os índices a partir da definição guardada (no teste só havia o índice de _id). Ao copiar a base admin (como no dump do conjunto, sem --db), os utilizadores vêm no dump: no teste, depois de apagar a base loja, o utilizador app_loja existia de novo após o restore.

## Monitorização básica

Três fontes de informação que já tens à mão.

| Fonte | Responde a |
|---|---|
| db.serverStatus() | estado global: versão, uptime, ligações, contadores de operações, memória, replicação |
| db.currentOp() | o que está a correr agora, há quanto tempo |
| profiler e logs | que operações foram lentas e porquê (plano usado) |
| rs.status() e rs.printSecondaryReplicationInfo() | saúde dos nós e atraso de replicação |

Exemplo de `serverStatus` (executado, campos selecionados):

    s = db.serverStatus()
    s.version                       // '8.3.17'
    s.connections                   // { current: 4, available: 99785, totalCreated: 83, ... }
    s.opcounters                    // { insert: 5, query: 15, update: 4, delete: 1, getmore: 0, command: 185 }
    s.mem.resident                  // 215  (MB)

Vigia sobretudo as ligações (`connections.current` contra `available`), os contadores (taxa de operações), a memória e, num replica set, o atraso.

Para uma operação lenta, `currentOp` mostra-a enquanto corre e `killOp` termina-a (executado, com uma consulta forçada a demorar 6 segundos):

    db.currentOp({ active: true, ns: "loja.produtos" }).inprog
    // { opid: 79877, op: 'query', ns: 'loja.produtos', secs_running: 2, appName: 'mongosh 2.14.2' }
    db.killOp(79877)               // { info: 'attempting to kill op', ok: 1, ... }

O profiler regista operações numa coleção `system.profile` da base. O nível 1 regista as mais lentas que `slowms`; o nível 2 regista todas (caro: só em diagnóstico). Com `slowms: 0` para o teste (executado):

    db.setProfilingLevel(1, { slowms: 0 })
    db.produtos.find({ id: 1 }).toArray()
    db.system.profile.find({ ns: "loja.produtos", op: "query" }, { millis: 1, planSummary: 1 })
    // { op: 'query', ns: 'loja.produtos', millis: 0, planSummary: 'COLLSCAN' }
    db.setProfilingLevel(0)

O `planSummary` de COLLSCAN indica que a consulta leu a coleção inteira: é o sinal para criares um índice (módulo 05). Os logs do contentor (`docker logs`) estão em JSON, uma linha por evento, com os campos `s` (severidade), `c` (componente) e `msg`. Confirma na documentação do profiler como as operações lentas são registadas nos logs (o limiar é o `slowms`). Num servidor real, envia-os para um sistema central e filtra com `jq`.

## Atualizar a versão (visão geral, não executada)

Não executei uma atualização de versão neste módulo. O resumo seguinte vem da documentação de atualização do MongoDB 8.0; confirma sempre o procedimento da tua versão antes de atualizares:

1. Lê as notas de versão e as compatibilidades (drivers, funcionalidades removidas) e faz uma cópia de segurança.
2. Num replica set, atualiza os secundários um a um; depois, no primário, usa `rs.stepDown()` para forçar uma eleição e atualiza esse nó por último. O conjunto fica disponível durante o processo.
3. Só depois de todos os nós estarem na nova versão, altera o featureCompatibilityVersion (FCV) com `db.adminCommand({ setFeatureCompatibilityVersion: "8.0", confirm: true })`. Enquanto o FCV estiver na versão antiga, ainda podes recuar.
4. Testa a aplicação contra a versão nova antes, num ambiente de teste.

Neste servidor, o FCV atual é `8.3` (consultado com `getParameter`).

**ATENÇÃO:** fixa a tag da imagem em produção (mongo:8 move-se) e não confundas trocar o binário com mudar o FCV.

## Sharding (visão geral, não executado)

Não executei sharding. Sharding é a distribuição horizontal de uma coleção por vários replica sets (shards), com um `mongos` a encaminhar os pedidos e servidores de configuração a guardar os metadados. Cada shard é, ele próprio, um replica set. A coleção é dividida pela shard key, e a escolha dessa chave (cardinalidade, distribuição das escritas) é a decisão mais difícil e mais difícil de corrigir.

**ATENÇÃO:** não comeces por sharding: a maioria das aplicações cabe num replica set bem indexado.

## Lista de verificação de produção

| Área | Verifica |
|---|---|
| Autenticação | autenticação ligada; sem utilizador root nas aplicações; um utilizador por aplicação com papel mínimo |
| Segredos | palavras-passe e keyFile fora do Git e do Compose; rotação possível |
| Rede | porta só acessível a quem precisa (aqui o mapeamento usa 127.0.0.1); TLS ligado |
| Alta disponibilidade | replica set com 3 nós ou mais, em máquinas diferentes; connection string com todos os membros e replicaSet |
| Cópias | mongodump (ou snapshots) agendados, guardados fora do servidor, e restore testado |
| Monitorização | ligações, memória, atraso de replicação e espaço em disco com alertas |
| Dados | volumes nomeados e persistentes; tag de imagem fixa; índices revistos (módulo 05) |
| Atualizações | procedimento ensaiado em teste; FCV só no fim |
| Write concern | w majority para dados que não podes perder |

## Quando não usar

Um servidor único sem replica set serve para desenvolvimento, mas é um ponto único de falha. Se não tens quem opere o conjunto, as cópias e as atualizações, um serviço gerido (como o Atlas) pode compensar; não comparo preços aqui. O `mongodump` não serve para bases enormes nem para recuperação a um ponto no tempo: vê a documentação de backups. No fim, limpa tudo com `docker compose -p est-mg07 -f <ficheiro> down -v`.

## Exercícios

**PRATICAR:** exercícios 25 a 28 do módulo de exercícios (utilizadores com papéis mínimos, cópia e restauro com gzip, replica set com eleição, monitorização com currentOp e profiler).

## Fontes oficiais

- Autenticação: https://www.mongodb.com/docs/manual/core/authentication/
- Ativar a autenticação: https://www.mongodb.com/docs/manual/tutorial/enable-authentication/
- Papéis integrados: https://www.mongodb.com/docs/manual/core/security-built-in-roles/
- Autenticação interna e keyFile: https://www.mongodb.com/docs/manual/core/security-internal-authentication/
- Cifra de transporte (TLS): https://www.mongodb.com/docs/manual/core/security-transport-encryption/
- Cifra em repouso: https://www.mongodb.com/docs/manual/core/security-encryption-at-rest/
- Replicação: https://www.mongodb.com/docs/manual/replication/
- Implementar um replica set: https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set/
- Eleições: https://www.mongodb.com/docs/manual/core/replica-set-elections/
- Read preference: https://www.mongodb.com/docs/manual/core/read-preference/
- mongodump: https://www.mongodb.com/docs/database-tools/mongodump/
- mongorestore: https://www.mongodb.com/docs/database-tools/mongorestore/
- Métodos de backup: https://www.mongodb.com/docs/manual/core/backups/
- serverStatus: https://www.mongodb.com/docs/manual/reference/command/serverStatus/
- db.currentOp: https://www.mongodb.com/docs/manual/reference/method/db.currentOp/
- Profiler da base de dados: https://www.mongodb.com/docs/manual/tutorial/manage-the-database-profiler/
- Atualizar um replica set para a 8.0: https://www.mongodb.com/docs/manual/release-notes/8.0-upgrade-replica-set/
- setFeatureCompatibilityVersion: https://www.mongodb.com/docs/manual/reference/command/setFeatureCompatibilityVersion/
- Sharding: https://www.mongodb.com/docs/manual/sharding/
- Lista de verificação de produção, operação: https://www.mongodb.com/docs/manual/administration/production-checklist-operations/
- Lista de verificação de produção, desenvolvimento: https://www.mongodb.com/docs/manual/administration/production-checklist-development/
- Imagem Docker oficial: https://hub.docker.com/_/mongo
- Docker Compose, secrets: https://docs.docker.com/compose/how-tos/use-secrets/
