# 05 Modelação e DDL

Até aqui só consultaste e alteraste dados em tabelas que já existiam. Neste módulo passas para o outro lado: desenhas as tabelas da loja, escolhes os tipos de dados, defines chaves e restrições e aprendes a alterar a estrutura depois de a base estar em uso. A este conjunto de comandos (CREATE, ALTER, DROP) chama-se DDL, de Data Definition Language.

Todos os exemplos foram executados em SQLite 3.45.3, PostgreSQL 17, MySQL 8.4 e SQL Server 2025, numa base chamada m05 com o ficheiro loja.sql carregado.

## Modelar: entidades e relações

Modelar é decidir que «coisas» a base guarda (entidades), que propriedades têm (colunas) e como se ligam. Na loja as entidades são categorias, clientes, produtos e encomendas. Há três tipos de relação:

| Relação | Exemplo na loja | Como se implementa |
|---|---|---|
| 1:1 | cliente e o seu perfil | chave estrangeira com UNIQUE |
| 1:N | uma categoria tem muitos produtos | chave estrangeira no lado «muitos» (produtos.categoria_id) |
| N:M | uma encomenda tem muitos produtos e um produto está em muitas encomendas | tabela de ligação com duas chaves estrangeiras |

Uma N:M nunca cabe numa só coluna: precisas de uma terceira tabela. A loja já tem uma, linhas_encomenda, que além de ligar guarda dados da própria ligação (quantidade e preço). Vamos criar outra, mais simples, para etiquetar produtos («oferta», «novo»):

    CREATE TABLE etiquetas (
        id INTEGER PRIMARY KEY,
        nome VARCHAR(30) NOT NULL UNIQUE
    );
    CREATE TABLE produto_etiqueta (
        produto_id INTEGER NOT NULL,
        etiqueta_id INTEGER NOT NULL,
        PRIMARY KEY (produto_id, etiqueta_id),
        FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE CASCADE,
        FOREIGN KEY (etiqueta_id) REFERENCES etiquetas (id) ON DELETE CASCADE
    );

A chave primária composta (produto_id, etiqueta_id) impede etiquetar duas vezes o mesmo produto com a mesma etiqueta. Depois de inserir as etiquetas 1 (oferta) e 2 (novo) e as ligações (1,1), (1,2) e (4,2), a consulta com dois JOIN devolve o mesmo nos quatro sistemas:

    produto                  etiqueta
    Auscultadores Bluetooth  novo
    Romance Policial         novo
    Romance Policial         oferta

## Normalização: 1FN, 2FN e 3FN

Normalizar é arrumar os dados para que cada facto fique guardado num só sítio. Imagina uma tabela «plana» de encomendas (exemplo conceptual, não executado):

    encomenda_id  cliente  cidade   produtos
    1             Ana      Lisboa   Romance Policial, Atlas Mundial
    2             Ana      Lisboa   Carregador USB-C

- 1FN (primeira forma normal): cada célula tem um único valor e não há grupos repetidos. A coluna produtos viola-a, porque tem uma lista. Solução: uma linha por encomenda e produto (a tabela linhas_encomenda).
- 2FN: já na 1FN e, quando a chave é composta, cada coluna depende da chave inteira. Se a chave fosse (encomenda_id, produto_id), o nome do produto dependeria só de produto_id. Solução: mover o nome para a tabela produtos.
- 3FN: já na 2FN e nenhuma coluna não-chave depende de outra coluna não-chave. Aqui a cidade depende do cliente, não da encomenda: repeti-la em cada encomenda obriga a corrigi-la em vários sítios (anomalia de atualização). Solução: guardar a cidade só em clientes.

O resultado é o esquema da loja: cada informação vive numa tabela e as outras apontam para ela por chave.

**NOTA:** a regra prática é «cada facto num só lugar». Se mudares o nome de um produto e tiveres de atualizar mais do que uma tabela, falta normalizar.

Quando desnormalizar? Quando a leitura pesa mais do que a escrita e os JOIN custam demasiado: relatórios, tabelas de resumo, ou guardar o preco_unitario em linhas_encomenda (a loja já o faz, e bem: o preço de catálogo pode mudar, o da encomenda não). Desnormaliza de propósito e só depois de medires; nunca por preguiça.

## CREATE TABLE, ALTER TABLE e DROP TABLE

O esqueleto padrão, que corre nos quatro sistemas, já o viste em loja.sql:

    CREATE TABLE nome (
        coluna tipo [restrições],
        ...
        restrições de tabela
    );

    ALTER TABLE nome ADD COLUMN ...;   -- altera a estrutura
    DROP TABLE nome;                   -- apaga a tabela e os dados

O DROP TABLE é irreversível (fora de uma transação ou de uma cópia de segurança). Se a tabela é referenciada por outra, os quatro sistemas recusam. Com a loja carregada, DROP TABLE categorias dá:

    PostgreSQL: ERROR: cannot drop table categorias because other objects depend on it
    MySQL:      ERROR 3730: Cannot drop table 'categorias' referenced by a foreign key constraint 'produtos_ibfk_1' on table 'produtos'.
    SQL Server: Msg 3726: Could not drop object 'categorias' because it is referenced by a FOREIGN KEY constraint.
    SQLite:     FOREIGN KEY constraint failed (só com as chaves estrangeiras ativas, ver abaixo)

**DICA:** DROP TABLE IF EXISTS nome corre nos quatro (testado). Em PostgreSQL, DROP TABLE nome CASCADE remove também as chaves estrangeiras que dependem da tabela.

## Tipos de dados por dialeto

O SQL padrão define tipos como INTEGER, DECIMAL(p,s), VARCHAR(n), DATE, TIMESTAMP e BOOLEAN, mas cada sistema acrescenta os seus. Criámos uma tabela com um tipo de cada família em cada sistema e lemos os tipos reais:

| Família | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Inteiro | INTEGER (até 8 bytes) | SMALLINT, INTEGER, BIGINT | TINYINT, INT, BIGINT | TINYINT, SMALLINT, INT, BIGINT |
| Dinheiro | DECIMAL(10,2) guarda REAL | NUMERIC(10,2) | DECIMAL(10,2) | DECIMAL(10,2) |
| Texto | TEXT | TEXT ou VARCHAR(n) | VARCHAR(n), TEXT | VARCHAR(n), NVARCHAR(n) |
| Data e hora | sem tipo próprio: guarda texto | TIMESTAMPTZ | DATETIME | DATETIME2 |
| Booleano | inteiro 0 ou 1 | BOOLEAN | BOOLEAN (é TINYINT(1)) | BIT |
| JSON | texto com funções json_ | JSONB | JSON | JSON (novo no SQL Server 2025) |
| UUID | texto | UUID | CHAR(36) com UUID() | UNIQUEIDENTIFIER |

Os tipos que cada servidor reportou para a mesma tabela:

    PostgreSQL (pg_typeof):   integer, bigint, numeric, text, timestamp with time zone, boolean, jsonb, uuid
    MySQL (COLUMN_TYPE):      int, bigint, decimal(10,2), varchar(100), datetime, tinyint(1), json, char(36)
    SQL Server (DATA_TYPE):   int, bigint, decimal, nvarchar, datetime2, bit, json, uniqueidentifier
    SQLite (typeof):          integer, real, text, text, integer, text, (texto de 32 carateres hexadecimais)

Pontos a reter:

- Dinheiro: nunca uses FLOAT ou REAL. Em PostgreSQL, MySQL e SQL Server, 0.1e0 + 0.2e0 dá 0.30000000000000004, enquanto com decimais exatos (0.1 + 0.2) dá 0.3. O SQLite não tem decimais exatos: DECIMAL(10,2) só dá a coluna afinidade numérica e o 19.99 ficou guardado como real. No SQLite, guarda dinheiro em cêntimos inteiros.
- Texto: o NVARCHAR do SQL Server guarda Unicode (o literal leva o prefixo N, como em N'Olá'). O PostgreSQL aceita TEXT sem limite e VARCHAR(n) com limite.
- Booleano: o SQL Server não tem literal TRUE, e WHERE TRUE dá Msg 4145 («expression of non-boolean type»). Usa BIT com 1 e 0.
- UUID: PostgreSQL tem gen_random_uuid(); MySQL tem UUID() (usado como DEFAULT (UUID()), com parênteses); SQL Server tem NEWID(); o SQLite não tem função: usei lower(hex(randomblob(16))).

**ATENÇÃO:** o SQLite tem tipagem flexível: o tipo da coluna é só uma sugestão. INSERT INTO tipos_demo (inteiro) VALUES ('abc') numa coluna INTEGER foi aceite e guardou texto (typeof devolveu text). Para tipagem rígida cria a tabela com STRICT (desde o 3.37): o mesmo INSERT dá «cannot store TEXT value in INTEGER column». Os outros três recusam logo: PostgreSQL «invalid input syntax for type integer», MySQL «Incorrect integer value: 'abc'» (modo estrito, que é o predefinido) e SQL Server «Msg 245: Conversion failed».

## Chaves primárias e auto-incremento

Uma chave primária (PRIMARY KEY) identifica cada linha: é única e nunca nula. Para não inventares os ids à mão, cada sistema gera-os de forma diferente:

| Sistema | Sintaxe |
|---|---|
| SQLite | id INTEGER PRIMARY KEY AUTOINCREMENT |
| PostgreSQL | id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY (ou SERIAL, mais antigo) |
| MySQL | id INT AUTO_INCREMENT PRIMARY KEY |
| SQL Server | id INT IDENTITY(1,1) PRIMARY KEY |

Em todos, inserir sem indicar o id dá 1 e 2:

    INSERT INTO cli_demo (nome) VALUES ('Rui');
    INSERT INTO cli_demo (nome) VALUES ('Sara');
    -- id 1 Rui, id 2 Sara

Se tentares impor um id, os sistemas com identidade protegem-te:

    PostgreSQL: ERROR: cannot insert a non-DEFAULT value into column "id" (HINT: Use OVERRIDING SYSTEM VALUE)
    SQL Server: Msg 544: Cannot insert explicit value for identity column ... when IDENTITY_INSERT is set to OFF.

O MySQL e o SQLite aceitam o id explícito. O SERIAL do PostgreSQL também funcionou (id 1), mas é um atalho antigo; prefere GENERATED ... AS IDENTITY. No SQLite, INTEGER PRIMARY KEY sozinho já gera ids; o AUTOINCREMENT só impede a reutilização de ids apagados.

## Restrições

As restrições (constraints) fazem a base de dados recusar dados inválidos, seja qual for a aplicação que escreve. Criámos a tabela avaliacoes com todas:

    CREATE TABLE avaliacoes (
        id INTEGER PRIMARY KEY,
        produto_id INTEGER NOT NULL,
        cliente_id INTEGER NOT NULL,
        nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
        comentario VARCHAR(200),
        criada_em DATE NOT NULL DEFAULT CURRENT_DATE,
        UNIQUE (produto_id, cliente_id),
        FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE CASCADE,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    );

- NOT NULL: a coluna não aceita NULL.
- UNIQUE: não há dois valores iguais (aqui, um cliente só avalia um produto uma vez).
- CHECK: uma condição que cada linha tem de cumprir.
- FOREIGN KEY: o valor tem de existir na tabela referida.
- DEFAULT: valor usado quando a coluna não é indicada no INSERT.

Depois de uma avaliação válida (produto 1, cliente 1, nota 5), tentámos quatro INSERT inválidos. As mensagens reais:

    Nota 9 (CHECK)
      SQLite:      CHECK constraint failed: nota BETWEEN 1 AND 5
      PostgreSQL:  new row for relation "avaliacoes" violates check constraint "avaliacoes_nota_check"
      MySQL:       ERROR 3819: Check constraint 'avaliacoes_chk_1' is violated.
      SQL Server:  Msg 547: The INSERT statement conflicted with the CHECK constraint "CK__avaliacoes__nota__..."
    Par repetido (UNIQUE)
      SQLite:      UNIQUE constraint failed: avaliacoes.produto_id, avaliacoes.cliente_id
      PostgreSQL:  duplicate key value violates unique constraint "avaliacoes_produto_id_cliente_id_key"
      MySQL:       ERROR 1062: Duplicate entry '1-1' for key 'avaliacoes.produto_id'
      SQL Server:  Msg 2627: Violation of UNIQUE KEY constraint ...
    Nota NULL (NOT NULL)
      SQLite:      NOT NULL constraint failed: avaliacoes.nota
      PostgreSQL:  null value in column "nota" of relation "avaliacoes" violates not-null constraint
      MySQL:       ERROR 1048: Column 'nota' cannot be null
      SQL Server:  Msg 515: Cannot insert the value NULL into column 'nota'
    Produto 99 inexistente (FOREIGN KEY)
      PostgreSQL:  insert or update on table "avaliacoes" violates foreign key constraint "avaliacoes_produto_id_fkey"
      MySQL:       ERROR 1452: Cannot add or update a child row: a foreign key constraint fails
      SQL Server:  Msg 547: The INSERT statement conflicted with the FOREIGN KEY constraint ...
      SQLite:      aceitou a linha! (ver a seguir)

**ATENÇÃO:** no SQLite as chaves estrangeiras vêm desligadas. Sem configurar nada, PRAGMA foreign_keys devolve 0, o INSERT com o produto 99 passou e até um DELETE FROM clientes WHERE id = 1 apagou um cliente com encomendas, deixando linhas órfãs. Tens de executar PRAGMA foreign_keys = ON em cada ligação nova (não fica gravado na base). Com o PRAGMA ligado, o INSERT passou a dar «FOREIGN KEY constraint failed».

### ON DELETE

O que acontece às linhas filhas quando apagas a linha pai? Por omissão, os quatro recusam o DELETE (comportamento NO ACTION). Com ON DELETE CASCADE as filhas desaparecem juntas. Criámos o produto 100 com uma avaliação e apagámo-lo:

    SELECT COUNT(*) FROM avaliacoes WHERE produto_id = 100;   -- 1
    DELETE FROM produtos WHERE id = 100;
    SELECT COUNT(*) FROM avaliacoes WHERE produto_id = 100;   -- 0

Já DELETE FROM produtos WHERE id = 1, com linhas em linhas_encomenda (sem CASCADE), foi recusado nos quatro: PostgreSQL «violates foreign key constraint linhas_encomenda_produto_id_fkey», MySQL «ERROR 1451: Cannot delete or update a parent row», SQL Server «Msg 547: The DELETE statement conflicted with the REFERENCE constraint». As outras ações (SET NULL, SET DEFAULT, RESTRICT) existem na sintaxe padrão; não as executámos.

**NOTA:** CASCADE é prático e perigoso. Usa-o em dados «de dentro» do pai (etiquetas e avaliações de um produto) e evita-o em dados que devem sobreviver, como encomendas.

### Valores por omissão

O DEFAULT para a data de hoje é onde os dialetos mais divergem: DEFAULT CURRENT_DATE funcionou em SQLite, PostgreSQL e SQL Server 2025; no MySQL deu erro de sintaxe e tem de ser entre parênteses, DEFAULT (CURRENT_DATE). Em todos, a avaliação inserida sem criada_em ficou com data.

## ALTER TABLE por dialeto

Criámos alt_demo (id, nome, obs) com uma linha e fizemos as alterações habituais:

| Operação | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Adicionar coluna | ADD COLUMN | ADD COLUMN | ADD COLUMN | ADD (sem a palavra COLUMN) |
| Renomear coluna | RENAME COLUMN a TO b | RENAME COLUMN a TO b | RENAME COLUMN a TO b | EXEC sp_rename 'tabela.a', 'b', 'COLUMN' |
| Mudar o tipo | não existe | ALTER COLUMN c TYPE t | MODIFY COLUMN c t | ALTER COLUMN c t |
| Acrescentar restrição | não existe | ADD CONSTRAINT | ADD CONSTRAINT | ADD CONSTRAINT |
| Apagar coluna | DROP COLUMN (com limites) | DROP COLUMN | DROP COLUMN | DROP COLUMN (com limites) |
| Renomear tabela | RENAME TO | RENAME TO | RENAME TO | EXEC sp_rename |

Erros reais de sintaxe que não existe:

    SQLite:     near "ALTER": syntax error        (ALTER COLUMN ... TYPE)
    SQLite:     near "CONSTRAINT": syntax error   (ADD CONSTRAINT)
    MySQL:      ERROR 1064: ... near 'TYPE VARCHAR(100)'
    SQL Server: Msg 156: Incorrect syntax near the keyword 'COLUMN'   (ADD COLUMN)
    SQL Server: Msg 102: Incorrect syntax near 'RENAME'              (RENAME COLUMN)

Três limitações para saberes:

- SQLite: não muda o tipo nem acrescenta restrições a uma tabela existente. O processo recomendado é criar a tabela nova, copiar os dados com INSERT ... SELECT, apagar a antiga e renomear a nova. O DROP COLUMN existe, mas recusa colunas de chave primária: DROP COLUMN id deu «cannot drop PRIMARY KEY column: "id"».
- SQL Server: ao adicionar uma coluna com DEFAULT que aceita NULL, as linhas que já existiam ficam com NULL (a nossa linha ficou com pais NULL), ao contrário do SQLite, PostgreSQL e MySQL, que preenchem com 'PT'. Para preencher, acrescenta WITH VALUES ou declara a coluna NOT NULL (testado nos dois casos). Além disso, DROP COLUMN de uma coluna com DEFAULT falha com «Msg 5074: The object DF__alt_demo__pais__... is dependent on column» e «Msg 4922»: apaga primeiro a restrição DEFAULT.
- MySQL: MODIFY COLUMN reescreve a definição inteira da coluna; se omitires o NOT NULL ou o DEFAULT, perdes essas propriedades.

## Schemas e namespaces

Um schema agrupa tabelas sob um nome (vendas.metas). O significado difere muito:

| Sistema | O que é um schema | Exemplo executado |
|---|---|---|
| PostgreSQL | pasta dentro da base; o predefinido é public | CREATE SCHEMA vendas; CREATE TABLE vendas.metas (...) |
| SQL Server | pasta dentro da base; o predefinido é dbo | CREATE SCHEMA vendas (num lote próprio) |
| MySQL | é sinónimo de base de dados | CREATE SCHEMA m05_extra criou outra base |
| SQLite | não há; usas ATTACH DATABASE para juntar outro ficheiro com um nome | ATTACH DATABASE ':memory:' AS vendas |

No PostgreSQL, current_schema() devolveu public e information_schema.tables mostrou as tabelas de public e a de vendas; no SQL Server, SCHEMA_NAME() devolveu dbo. No SQLite, CREATE SCHEMA dá «near "SCHEMA": syntax error». No SQL Server, CREATE SCHEMA tem de ser a primeira instrução do lote (em sqlcmd, separa com GO).

## Nos outros dialetos

| Tema | SQLite 3.45 | PostgreSQL 17 | MySQL 8.4 | SQL Server 2025 |
|---|---|---|---|---|
| Auto-incremento | AUTOINCREMENT | IDENTITY ou SERIAL | AUTO_INCREMENT | IDENTITY(1,1) |
| Tipo de dinheiro | sem decimais exatos | NUMERIC | DECIMAL | DECIMAL |
| Tipagem | flexível (STRICT opcional) | rígida | rígida (modo estrito) | rígida |
| Booleano | 0 e 1 | BOOLEAN | TINYINT(1) | BIT |
| Chaves estrangeiras | desligadas por omissão (PRAGMA) | sempre ativas | sempre ativas (InnoDB) | sempre ativas |
| CHECK | aplicado | aplicado | aplicado (confirmado no 8.4) | aplicado |
| DEFAULT de data | CURRENT_DATE | CURRENT_DATE | (CURRENT_DATE) | CURRENT_DATE |
| Mudar tipo de coluna | não existe | ALTER COLUMN TYPE | MODIFY COLUMN | ALTER COLUMN |
| Schema | só ATTACH | schema real | = base de dados | schema real |

Oracle e SAP HANA (não executado, não há instância): o Oracle usa tipos próprios como NUMBER e VARCHAR2 e o HANA tem as suas particularidades; confirma na documentação. Consulta a documentação do Oracle em Fontes oficiais e a da SAP no portal help.sap.com antes de portares estes scripts.

**DICA:** quando escreves DDL portável, fica pelo núcleo comum (INTEGER, DECIMAL, VARCHAR, DATE, PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK) e isola num ficheiro à parte o que é de cada dialeto: auto-incremento, JSON, UUID e ALTER.

## Exercícios

**PRATICAR:** faz os exercícios 17 a 20 do módulo de exercícios (modelar uma N:M com o seu DDL, escolher tipos e restrições, observar o PRAGMA do SQLite e fazer um ALTER em dois dialetos).

## Fontes oficiais

- SQLite, CREATE TABLE: https://www.sqlite.org/lang_createtable.html
- SQLite, chaves estrangeiras: https://www.sqlite.org/foreignkeys.html
- SQLite, tipos de dados: https://www.sqlite.org/datatype3.html
- SQLite, ALTER TABLE: https://www.sqlite.org/lang_altertable.html
- PostgreSQL, definição de dados: https://www.postgresql.org/docs/17/ddl.html
- PostgreSQL, tipos de dados: https://www.postgresql.org/docs/17/datatype.html
- PostgreSQL, colunas de identidade: https://www.postgresql.org/docs/17/ddl-identity-columns.html
- PostgreSQL, schemas: https://www.postgresql.org/docs/17/ddl-schemas.html
- MySQL, CREATE TABLE: https://dev.mysql.com/doc/refman/8.4/en/create-table.html
- MySQL, tipos de dados: https://dev.mysql.com/doc/refman/8.4/en/data-types.html
- MySQL, restrições CHECK: https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html
- SQL Server, CREATE TABLE: https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql
- SQL Server, tipos de dados: https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql
- SQL Server, ALTER TABLE: https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-transact-sql
- Oracle, CREATE TABLE: https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/CREATE-TABLE.html
