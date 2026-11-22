# 05 Bases de dados

Neste módulo ligas a API da loja a bases de dados só com o que o Bun traz: o módulo bun:sqlite (SQLite embutido, síncrono) e a API nativa Bun.sql (SQLite, PostgreSQL e MySQL com o mesmo código). No fim vês como uma rota da API documentada com OpenAPI devolve o resultado de uma consulta.

Tudo foi executado com o Bun 1.4.0 no Windows 11 (Git Bash). O SQLite é o 3.53.2 que vem dentro do Bun; o PostgreSQL 17.12 e o MySQL 8.4.13 correm em Docker (imagens postgres:17 e mysql:8.4) em 127.0.0.1, portas 35051 e 35052. A documentação online descreve versões mais recentes do que a 1.4.0: onde a 1.4.0 se comporta de outra forma, digo-o (há uma tabela de diferenças no fim). Os exemplos estão em exemplos/ e leem o loja.sql do módulo 00. O servidor HTTP já foi explicado no módulo 03 e o Swagger também: aqui só uso o mínimo.

## O que substitui

| Biblioteca npm habitual | O que o Bun já traz |
|---|---|
| better-sqlite3, sqlite3 | bun:sqlite (Database, Statement, transações, serialize) |
| pg, postgres.js | Bun.sql com postgres:// (pool, transações, LISTEN/NOTIFY, COPY) |
| mysql2, mariadb | Bun.sql com mysql:// (mariadb:// existe segundo a documentação, não o testei) |
| Um query builder para condições dinâmicas | fragmentos de Bun.sql e sql(objeto), sem esquema nem migrações |
| Uma camada de classes (mapeamento simples) | .as(Classe) do bun:sqlite |

Não testei o LISTEN/NOTIFY, o COPY, o TLS com certificados nem o MariaDB: confirma-os na documentação. O Bun não traz migrações nem um ORM. Também não escolhe a base por ti: Bun.sql sem argumentos assume PostgreSQL em localhost (confirmei: sql.options.adapter dá postgres) e só muda se existir DATABASE_URL, por exemplo sqlite://:memory:.

## Preparar o ambiente

O SQLite não precisa de nada. Para os outros dois arrancam-se dois contentores (o nome tem o prefixo est-bn05-, as portas são só do anfitrião local, o --rm apaga o contentor e o volume anónimo quando pára). A palavra-passe fictícia vem de uma variável de ambiente e nunca fica em ficheiros.

    export BN05_PW='escolhe-uma-palavra-passe-ficticia'
    docker run -d --rm --name est-bn05-pg -e POSTGRES_PASSWORD="$BN05_PW" -e POSTGRES_DB=loja -p 127.0.0.1:35051:5432 postgres:17
    docker run -d --rm --name est-bn05-mysql -e MYSQL_ROOT_PASSWORD="$BN05_PW" -e MYSQL_DATABASE=loja -p 127.0.0.1:35052:3306 mysql:8.4
    # no fim: docker stop est-bn05-pg est-bn05-mysql

**ATENÇÃO:** as portas 5432 e 3306 podem ser de outros serviços da tua máquina. Publica os contentores noutras portas (aqui 35051 e 35052) e nunca uses prune.

## bun:sqlite: ligar e consultar

O módulo bun:sqlite é síncrono: não há await. Uma base em memória, o loja.sql carregado com db.exec (que corre vários comandos de uma vez) e as quatro formas de ler:

    import { Database } from "bun:sqlite";
    const db = new Database(":memory:");   // ou new Database("loja.sqlite")
    db.exec(await Bun.file("loja.sql").text());
    const q = db.query("SELECT id, nome, preco FROM produtos WHERE categoria_id = ?1 ORDER BY id");
    q.all(2);      // [{"id":4,"nome":"Auscultadores Bluetooth","preco":49.9}, {"id":5,...}, {"id":6,...}]
    q.get(1);      // {"id":1,"nome":"Romance Policial","preco":12.9}
    q.values(3);   // [[7,"Candeeiro de Mesa",22],[8,"Conjunto de Panelas",89.9], ...]
    db.query("SELECT * FROM produtos WHERE id = -1").get();   // null

Saída real do exemplo 01-sqlite-basico.ts: all devolve três objetos, get devolve um objeto (ou null sem linhas) e values devolve linhas como arrays. O preço 79.00 aparece como 79: o SQLite guarda decimais em vírgula flutuante.

- query() compila e guarda o Statement em cache (20 por omissão, Database.MAX_QUERY_CACHE_SIZE). prepare() cria um novo sem cache.
- run() serve para escritas e devolve changes e lastInsertRowid: {"changes":1,"lastInsertRowid":4}.
- iterate() lê linha a linha e toString() mostra o SQL com os valores já ligados (SELECT id, nome, preco FROM produtos WHERE categoria_id = 3 ORDER BY id).
- Um ficheiro abre-se com new Database(caminho); { readonly: true } recusa escritas (SQLITE_READONLY, attempt to write a readonly database) e { readwrite: true, create: false } num ficheiro em falta dá SQLITE_CANTOPEN, unable to open database file.

### Parâmetros: posicionais e nomeados

Posicionais usam ?, ?1 ou ?2. Nomeados usam $nome, :nome ou @nome, e a chave do objeto leva o prefixo.

    const q = db.query("SELECT nome FROM clientes WHERE cidade = $cidade AND data_registo >= :desde");
    q.all({ $cidade: "Lisboa", ":desde": "2024-03-01" });   // Diogo Pires, Hugo Teixeira
    q.all({ cidade: "Lisboa", desde: "2024-03-01" });        // []  (sem erro!)

**ATENÇÃO:** na 1.4.0, sem o prefixo, o parâmetro fica NULL em silêncio e a consulta devolve zero linhas. A documentação atual diz que a chave pode levar ou não o prefixo; não foi isso que executei. Se a tua instalação for mais recente, testa. Com strict: true passa-se o contrário (ver adiante): a chave sem prefixo.

## Transações, PRAGMAs e erros

Os erros reais do SQLite (exemplo 02), todos da classe SQLiteError com code e errno:

| Situação | code | errno | mensagem |
|---|---|---|---|
| Tabela inexistente | SQLITE_ERROR | 1 | no such table: clientess |
| Sintaxe | SQLITE_ERROR | 1 | near "SELEC": syntax error |
| Chave primária repetida | SQLITE_CONSTRAINT_PRIMARYKEY | 1555 | UNIQUE constraint failed: categorias.id |
| NOT NULL | SQLITE_CONSTRAINT_NOTNULL | 1299 | NOT NULL constraint failed: categorias.nome |
| Chave estrangeira | SQLITE_CONSTRAINT_FOREIGNKEY | 787 | FOREIGN KEY constraint failed |

**ATENÇÃO:** o último erro só aparece depois de PRAGMA foreign_keys = ON. O bun:sqlite abre as ligações com as chaves estrangeiras desligadas (PRAGMA foreign_keys devolve 0) e um produto com categoria_id 99 entra sem erro. Liga o PRAGMA em cada ligação que abres.

Uma transação é uma função: db.transaction(fn) devolve uma função que faz BEGIN, chama fn e faz COMMIT; se fn lançar um erro, faz ROLLBACK e o erro continua a subir. O exemplo vende produtos e devolve tudo se um deles não tiver stock:

    const vender = db.transaction((enc, itens) => {
        for (const it of itens) {
            const r = abate.run({ $id: it.id, $qtd: it.qtd });   // UPDATE ... AND stock >= $qtd
            if (r.changes === 0) throw new Error(`stock insuficiente do produto ${it.id}`);
            novaLinha.run({ $enc: enc, $prod: it.id, $qtd: it.qtd, $preco: it.preco });
        }
        return itens.length;
    });
    vender(12, [{ id: 1, qtd: 2, preco: 12.9 }]);                              // 1; stock do produto 1: 40 -> 38
    vender(12, [{ id: 1, qtd: 5, preco: 12.9 }, { id: 6, qtd: 1, preco: 79 }]); // lança: stock insuficiente do produto 6

Depois da segunda chamada o produto 1 continua com 38 (o abate de 5 foi desfeito) e a tabela de linhas continua com 27. Uma transação dentro de outra vira um savepoint: o exemplo inseriu a categoria 40 e a interna (categoria 50) lançou um erro; ficou só a 40. Existem também vender.deferred, vender.immediate e vender.exclusive, que mudam o BEGIN.

**ATENÇÃO:** a função de db.transaction tem de ser síncrona. Com async, o COMMIT acontece no primeiro await: o exemplo inseriu as categorias 60 e 61, lançou um erro depois do await e ficaram AS DUAS na base. Faz o trabalho assíncrono antes e passa os resultados.

### PRAGMAs e WAL

Os PRAGMAs são comandos do SQLite que se correm com query ou run. Num ficheiro, o modo de diário por omissão é delete; PRAGMA journal_mode = WAL liga o write-ahead log (leitores e um escritor em paralelo), e PRAGMA synchronous = NORMAL acelera os commits.

    disco.query("PRAGMA journal_mode").get();        // {"journal_mode":"delete"}
    disco.query("PRAGMA journal_mode = WAL").get();  // {"journal_mode":"wal"}
    // enquanto está aberta existem est-bn05-wal.sqlite-wal e -shm; depois de close() desapareceram (Windows)

No Windows os ficheiros -wal e -shm foram removidos no close(); a documentação diz que no macOS persistem. PRAGMA integrity_check devolveu ok e PRAGMA user_version guarda um número teu (usei 3) para versionar o esquema.

## Tipos, classes e serialização

Exemplo 03. Quatro coisas que convém saber:

- Mapear linhas para uma classe com .as(Classe): as linhas ganham os métodos e getters da classe, mas o construtor e os inicializadores NÃO correm. Com produtos.query(...).as(Produto), todos[0] instanceof Produto deu true, comIva(12.90) deu 15.87, o getter semStock encontrou o Teclado Mecânico e a propriedade valorStock = -1 não existia.
- Decimais: preco é DECIMAL(10,2) mas typeof preco é number e 1.23 vezes 29.99 dá 36.887699999999995. Para dinheiro, trabalha em cêntimos inteiros (sum de round(preco vezes 100) deu 35809).
- Inteiros grandes: sem opções, 2^53 + 1 volta como 9007199254740992 (perdeu 1). Com new Database(":memory:", { safeIntegers: true }) volta um bigint (9007199254740993n, e também 5n para pequenos); por Statement usa .safeIntegers(true). Um bigint fora dos 64 bits lança RangeError: BigInt value ... is out of range.
- strict: true (new Database(":memory:", { strict: true })): a chave do objeto leva o nome SEM prefixo e um parâmetro em falta lança Error: Missing parameter "mensagem". Sem strict, o mesmo erro de escrita dá {"m":null}.

O SQLite só aceita string, TypedArray, boolean, number, bigint ou null: um Date lança TypeError: Binding expected string, TypedArray, boolean, number, bigint or null. Guarda datas com toISOString(); o booleano true ficou 1 (typeof integer) e um Uint8Array voltou como BLOB (Uint8Array).

db.serialize() devolve os bytes da base (na 1.4.0 um Buffer, a documentação diz Uint8Array) e Database.deserialize(bytes) cria uma cópia independente: apagar os 10 produtos da cópia deixou o original com 10. Um ficheiro também se importa com import("file:///...", { with: { type: "sqlite" } }), que devolve um Database. No Windows, com um caminho absoluto com barras normais (C:/Users/...) falhou com Cannot find module ... from ''; funcionaram o caminho com barras invertidas e o URL file:// (pathToFileURL). O using fecha a ligação no fim do bloco.

**NOTA:** extensões e funções: db.loadExtension("nao-existe") deu Error: Impossível localizar o módulo especificado. Não carreguei nenhuma extensão real (precisava de uma DLL SQLite, que não instalei), por isso confirma o resto na documentação. Também db.function e db.aggregate, que a documentação atual descreve, não existem na 1.4.0 (typeof dá undefined).

## Bun.sql: uma API para três bases

Bun.sql usa tagged templates: cada valor entre chaves vira um parâmetro, nunca texto colado ao SQL. Importa SQL e cria uma instância por base; o adaptador escolhe-se pela URL.

    import { SQL } from "bun";
    const lite = new SQL(":memory:");                                       // ou sqlite://ficheiro.db
    const pg = new SQL(`postgres://postgres:${pw}@127.0.0.1:35051/loja`);
    const my = new SQL(`mysql://root:${pw}@127.0.0.1:35052/loja`, { allowPublicKeyRetrieval: true });

No MySQL 8.4 sem esta opção a ligação falha: ERR_MYSQL_PUBLIC_KEY_RETRIEVAL_NOT_ALLOWED, The server requested RSA public key retrieval to complete authentication, which is not allowed over an insecure connection. Duas soluções que testei: allowPublicKeyRetrieval: true (aceitável numa base local de estudo) ou tls: "require". O parâmetro na URL (?allowPublicKeyRetrieval=true) NÃO resolveu, tem de ir nas opções. Também testei mysql2:// (aceite) e o objeto com adapter, hostname, port, database, username e password.

O resto é igual nos três (exemplo 04, em SQLite):

    const r = await sql.file("loja.sql");                       // corre o ficheiro todo; r.command é "CREATE"
    await sql`SELECT id, nome, preco FROM produtos WHERE categoria_id = ${2} ORDER BY id`;   // objetos
    await sql`SELECT id, nome FROM categorias ORDER BY id`.values();   // [[1,"Livros"],[2,"Eletrónica"],[3,"Casa"]]
    await sql`INSERT INTO categorias ${sql({ id: 4, nome: "Jardim" })}`;          // colunas e valores do objeto
    await sql`INSERT INTO categorias ${sql([{ id: 6, nome: "Desporto" }, { id: 7, nome: "Moda" }])}`;   // várias linhas
    await sql`INSERT INTO categorias ${sql(novo, "id", "nome")}`;                  // só estas colunas
    await sql`UPDATE categorias SET ${sql({ nome: "Jardinagem" })} WHERE id = ${4}`;
    await sql`SELECT id FROM categorias WHERE id IN ${sql([1, 3, 8])}`;           // lista dinâmica
    await sql`SELECT count(*) AS n FROM ${sql("clientes")}`;                      // identificador entre aspas

Os fragmentos são consultas parciais que se compõem. O exemplo constrói o WHERE de um filtro com condições opcionais, sempre com parâmetros:

    function procurar(f: { maxPreco?: number; categoria?: number }) {
        const cond = [sql`stock > ${0}`];
        if (f.maxPreco !== undefined) cond.push(sql`preco <= ${f.maxPreco}`);
        if (f.categoria !== undefined) cond.push(sql`categoria_id = ${f.categoria}`);
        return sql`SELECT id, nome FROM produtos WHERE ${cond.reduce((a, c) => sql`${a} AND ${c}`)} ORDER BY id`;
    }
    await procurar({ maxPreco: 15 });   // 1 Romance Policial, 5 Carregador USB-C, 10 Caneca de Cerâmica

As consultas são preguiçosas: só correm quando fazes await (ou .execute()). O resultado é um array com metadados: count, affectedRows, lastInsertRowid e command. Para listas em PostgreSQL existe sql.array(valores, "INT"), usado em ANY(...) (ver as diferenças abaixo).

### Transações e savepoints

sql.begin dá-te um cliente tx ligado à transação: faz COMMIT se o callback acabar e ROLLBACK se lançar. tx.savepoint desfaz só uma parte. Executei isto nos três motores com o mesmo resultado:

    await sql.begin(async tx => {
        await tx`INSERT INTO categorias ${tx({ id: 30, nome: "Mantida" })}`;
        try {
            await tx.savepoint(async sp => {
                await sp`INSERT INTO categorias ${sp({ id: 31, nome: "Desfeita" })}`;
                throw new Error("desfazer só isto");
            });
        } catch {}
        await tx`INSERT INTO categorias ${tx({ id: 32, nome: "Também mantida" })}`;
    });
    // ids >= 30: [30, 32]. Com uma chave repetida dentro de begin: ROLLBACK e a categoria 21 não existe.

Um begin que falha rejeita com o erro da base (SQLITE_CONSTRAINT_PRIMARYKEY, ERR_POSTGRES_SERVER_ERROR ou ERR_MYSQL_SERVER_ERROR).

## O mesmo código nos três motores

O exemplo 05-sql-tres-motores.ts muda só a ligação (argumento sqlite, postgres ou mysql) e corre a mesma consulta. O que mudou nos resultados:

| Valor | SQLite | PostgreSQL | MySQL |
|---|---|---|---|
| preco (DECIMAL) | number 29.99 | string "29.99" | string "29.99" |
| contagem (count de linhas) | number 1 | string "1" | number 1 |
| sum(stock) | number 10 | string "10" | string "10" |
| avg(preco) | number 29.99 | string "29.9900000000000000" | string "29.990000" |
| data_registo (DATE) | string "2024-01-15" | Date, 2024-01-15T00:00:00.000Z | Date, igual |
| 9007199254740993 literal | number 9007199254740992 | string "9007199254740993" | string "9007199254740993" |

Regras: numeric e DECIMAL chegam como string para não perderem precisão; bigint (e o resultado de count e sum em PostgreSQL) chega como string; no MySQL um BIGINT dentro dos 32 bits chega como número. Com new SQL({ ..., bigint: true }) os bigint passam a BigInt (em PostgreSQL até a contagem de linhas: 3n; no MySQL só os grandes). As datas DATE de PostgreSQL e MySQL vêm como Date à meia-noite UTC. A API devolve o que o motor diz, por isso converte à saída (Number para preços, cêntimos inteiros para dinheiro).

| Escrita (INSERT e UPDATE de uma linha) | SQLite | PostgreSQL | MySQL |
|---|---|---|---|
| count | 1 | 1 | 0 |
| affectedRows | null | null | 1 |
| lastInsertRowid | 4 | null | 0 |
| command | INSERT | INSERT | null |
| RETURNING | funciona | funciona | erro 1064 (o MySQL 8.4 não tem) |

**ATENÇÃO:** na 1.4.0 as linhas escritas não aparecem no mesmo campo: usa affectedRows ?? count. A documentação atual promete affectedRows como número em todos; não foi o que vi no SQLite nem no PostgreSQL.

Outras diferenças que executei: uma data como objeto Date num parâmetro (new Date("2024-06-01T00:00:00Z") comparado com a coluna DATE) funciona no MySQL, dá TypeError no SQLite (usa toISOString()) e no PostgreSQL falha com o erro 22007 invalid input syntax for type date: "Sat Jun 01 2024 01:00:00 GMT+0100 (...)". Passa a data como texto ISO. A sql.array([1, 2]) sem tipo falhou no PostgreSQL com operator does not exist: integer = json, e um array JavaScript simples em ANY(...) deu insufficient data left in message; com sql.array([1, 2], "INT") funciona. No SQLite e no MySQL dá Error: SQLite doesn't support arrays (idem MySQL).

## Erros reais

Todos os erros de Bun.sql são SQLError, e a subclasse diz o motor: SQL.SQLiteError, SQL.PostgresError ou SQL.MySQLError. O code é o do Bun (ERR_POSTGRES_SERVER_ERROR) e o errno é o da base (o SQLSTATE no PostgreSQL, o número no MySQL).

| Situação | SQLite | PostgreSQL | MySQL |
|---|---|---|---|
| Tabela inexistente | SQLITE_ERROR 1, no such table: clientess | 42P01, relation "clientess" does not exist | 1146 (42S02), Table 'loja.clientess' doesn't exist |
| Chave repetida | SQLITE_CONSTRAINT_PRIMARYKEY 1555 | 23505, duplicate key value violates unique constraint "categorias_pkey" | 1062, Duplicate entry '1' for key 'categorias.PRIMARY' |
| NOT NULL | SQLITE_CONSTRAINT_NOTNULL 1299 | 23502, null value in column "nome" ... violates not-null constraint | 1048, Column 'nome' cannot be null |
| Chave estrangeira | só com o PRAGMA ligado: 787 | 23503, violates foreign key constraint "produtos_categoria_id_fkey" | 1452, Cannot add or update a child row ... |
| Sintaxe (SELEC 1) | SQLITE_ERROR, near "SELEC" | ERR_POSTGRES_SYNTAX_ERROR 42601 | ERR_MYSQL_SYNTAX_ERROR 1064 |

Ligações falhadas, medidas com o contentor ligado: porta fechada dá ERR_POSTGRES_CONNECTION_REFUSED (ou ERR_MYSQL_CONNECTION_REFUSED), Failed to connect, em menos de 25 ms; palavra-passe errada dá ERR_POSTGRES_SERVER_ERROR 28P01 (password authentication failed for user "postgres") ou ERR_MYSQL_SERVER_ERROR 1045 (Access denied for user ...); uma base inexistente dá 3D000 (database "nao_existe" does not exist).

## sql.unsafe e o perigo de injeção

sql.unsafe corre texto SQL tal como o escreveste. Com texto colado, a entrada de um utilizador vira SQL. O exemplo 06 usa a entrada x' OR '1'='1 e corre nos três motores:

    const entrada = "x' OR '1'='1";
    await sql.unsafe(`SELECT id, nome FROM clientes WHERE nome = '${entrada}'`);   // 8 linhas (devia ser 0)
    await sql`SELECT id, nome FROM clientes WHERE nome = ${entrada}`;                // 0 linhas

Pior: sem parâmetros, sql.unsafe aceita vários comandos. A entrada x'; DROP TABLE linhas_encomenda; -- apagou a tabela nos três (depois: no such table: linhas_encomenda; relation ... does not exist; Table 'loja.linhas_encomenda' doesn't exist). Com parâmetros e dois comandos o resultado depende do motor: o PostgreSQL recusa (cannot insert multiple commands into a prepared statement), o MySQL recusa (erro de sintaxe 1064) e o SQLite correu os dois. Não confies nisto como proteção: no SQLite 1.4.0 também vi que, quando o primeiro comando devolve linhas, os seguintes não correm, o que depende da forma do SQL.

**ATENÇÃO:** identificadores (tabela, coluna, ORDER BY) não são parâmetros. sql("nome") põe o nome entre aspas e evita a injeção, mas não limita a que coluna ou tabela chegas: valida contra uma lista (new Set(["id", "nome", "preco", "stock"])) antes de o usar. No exemplo, ordenar por texto livre devolve coluna não permitida.

## Pool e limites

O PostgreSQL e o MySQL usam um pool de ligações (max: 10 por omissão), aberto só na primeira consulta. As opções são max, idleTimeout, maxLifetime e connectionTimeout (em segundos). Medição com max: 2 e cinco consultas em paralelo com pg_sleep(0.3): abriram-se duas ligações (onconnect correu duas vezes), houve dois PIDs diferentes no servidor e a espera total foi 919 ms (cerca de três rondas de 0,3 s). Com sql.begin a transação reserva uma ligação; sql.close() espera pelas consultas e fecha tudo. O SQLite não tem pool: cada SQL é uma única ligação. Dois limites que a documentação indica: 65535 parâmetros por consulta no PostgreSQL e 1024 (PostgreSQL) ou 256 (MySQL) statements preparados por ligação.

## bun:sqlite ou Bun.sql?

| Critério | bun:sqlite | Bun.sql |
|---|---|---|
| Motores | só SQLite | SQLite, PostgreSQL, MySQL e MariaDB |
| Execução | síncrona | assíncrona (promessas) |
| Sem linhas | get devolve null | array vazio |
| Escrita | run devolve changes | count e affectedRows (ver acima) |
| Transação | db.transaction (função síncrona) | sql.begin (async) e savepoints |
| Erros | SQLiteError, não é instância de SQL.SQLiteError | SQL.SQLiteError, PostgresError, MySQLError |
| Extras do SQLite | serialize, .as, strict, safeIntegers, WAL | só opções básicas |

Medi 20000 leituras por chave primária em memória (exemplo 08, duas execuções): bun:sqlite 20 ms e 39 ms; Bun.sql sobre SQLite 307 ms e 343 ms, entre 9 e 16 vezes mais. É uma medição indicativa de uma máquina, não um benchmark rigoroso. Regra prática: SQLite local e simples, usa bun:sqlite; código que pode trocar de motor, usa Bun.sql.

## Ligar à API documentada

No módulo 03 a API da loja tem uma tabela de rotas que gera o Bun.serve e o OpenAPI. Aqui só trocas a fonte dos dados por uma consulta (exemplo 07, porta 35050): a rota GET /produtos aceita ?categoria=N, a resposta é descrita num esquema Produto e confirmei-a com um pedido real ao servidor.

    const consulta = (c?: number) =>
        sql`SELECT id, nome, categoria_id, preco, stock FROM produtos ${c ? sql`WHERE categoria_id = ${c}` : sql``} ORDER BY id`;
    // GET /produtos?categoria=2 -> 200 application/json;charset=utf-8 | 3 produtos | erros do esquema: 0
    // GET /produtos?categoria=abc -> 400 {"erro":"categoria: devia ser inteiro >= 1"}

O esquema apanhou um problema real: sem conversão, o SQLite cumpre type: number, mas o PostgreSQL e o MySQL devolvem preco como string e a verificação dá 3 erros (preco: devia ser número, veio string "49.90"). A rota converte à saída com Number(preco) e passa a ter 0 erros nos três. O validador completo, os testes do contrato e o Swagger UI estão no módulo 03; aqui o esquema é conferido com uma função de cerca de dez linhas que só trata type e required.

## Diferenças entre a 1.4.0 e a documentação atual

| Tema | Documentação | O que executei na 1.4.0 |
|---|---|---|
| bun:sqlite, chave sem prefixo | funciona | NULL em silêncio (sem strict); com strict só sem prefixo |
| sql.unsafe com parâmetros nomeados | com ou sem prefixo | só com prefixo: {id: 3} devolveu zero linhas, {":id": 3} funcionou |
| serialize() | Uint8Array | Buffer |
| db.function e db.aggregate | existem | não existem (undefined) |
| affectedRows | número | null no SQLite e no PostgreSQL; count 0 no MySQL |
| sql.array sem tipo, array simples, Date em DATE (PostgreSQL) | funcionam | erro (ver acima) |
| MySQL 8.4 em TCP | allowPublicKeyRetrieval ou TLS | confirmado; na URL não funciona |

**NOTA:** Windows: o único problema que me afetou foi o import com type sqlite e caminho absoluto com barras normais. Não usei Bun.$ nem a opção cwd neste módulo. O auto-install não foi problema: os exemplos só importam bun, bun:sqlite e módulos node:.

## Exercícios

**PRATICAR:** faz os exercícios 17 a 20 do módulo 13 (relatório com bun:sqlite, transação de encomenda, o mesmo código em três motores e uma rota de encomendas protegida contra injeção). As soluções estão no módulo 15.

No fim, pára e confirma que não ficou nada teu (contentores com o prefixo est-bn05-, nenhuma porta 35050 a 35059 em escuta, nada que o Docker tenha criado além das imagens).

## Fontes oficiais

- [Bun: SQL (Bun.sql)](https://bun.com/docs/runtime/sql)
- [Bun: SQLite (bun:sqlite)](https://bun.com/docs/runtime/sqlite)
- [SQLite: PRAGMA](https://www.sqlite.org/pragma.html)
- [SQLite: write-ahead logging](https://www.sqlite.org/wal.html)
- [SQLite: chaves estrangeiras](https://www.sqlite.org/foreignkeys.html)
- [SQLite: códigos de resultado](https://www.sqlite.org/rescode.html)
- [PostgreSQL 17: tipos numéricos](https://www.postgresql.org/docs/17/datatype-numeric.html)
- [PostgreSQL 17: extended query, protocolo](https://www.postgresql.org/docs/17/protocol-flow.html)
- [MySQL 8.4: autenticação sha256](https://dev.mysql.com/doc/refman/8.4/en/sha256-pluggable-authentication.html)
- [Imagem Docker postgres](https://hub.docker.com/_/postgres)
- [Imagem Docker mysql](https://hub.docker.com/_/mysql)
- [OWASP: SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [Especificação OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3)
