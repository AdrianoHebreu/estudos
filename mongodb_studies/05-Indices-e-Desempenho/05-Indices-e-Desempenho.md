# 05 Índices e desempenho

Uma consulta lenta quase nunca precisa de mais hardware: precisa de um índice. Neste módulo crias 100 000 encomendas sintéticas, medes consultas sem índices, crias os índices certos e voltas a medir. Versão do servidor: MongoDB 8.3.17 (imagem `mongo:8`) e mongosh. Os scripts estão em `05-Indices-e-Desempenho/exemplos/`. Todos os números desta aula são saídas reais, mas os tempos mudam de máquina para máquina: compara sempre `keys` e `docs`, que são estáveis, e usa os milissegundos só como indicação.

## Preparar os dados

A loja do curso tem poucos documentos, pelo que um índice não se nota. O script `gerar_dados.js` cria na base `m05` 100 000 encomendas, 20 000 clientes e 20 000 produtos (com um gerador pseudoaleatório de semente fixa, por isso o resultado é reproduzível). Copia a pasta para o contentor do servidor de estudo e corre-o:

    docker cp exemplos est-mongo:/tmp/m05
    docker exec -w /tmp/m05 est-mongo mongosh --quiet gerar_dados.js
    # encomendas: 100000, clientes: 20000, produtos: 20000

Cada encomenda tem `numero`, `cliente_id` (1 a 20 000), `data_encomenda` (dois anos), `estado`, `cidade`, `total`, um array `etiquetas` e, em 2 % dos casos, um `cupao`. O ficheiro `plano.js` define a função `plano(titulo, cursor)`, que corre `explain("executionStats")` e imprime numa linha as fases, o índice e os números que interessam. Os scripts seguintes usam-na com `load("plano.js")` e devem ser corridos por ordem, porque cada um parte dos índices do anterior.

## O que é um índice e o que custa

Um índice é uma estrutura ordenada (uma B-tree) com os valores de um ou mais campos e um apontador para o documento. Sem ele, o MongoDB lê a coleção inteira para responder (COLLSCAN). Com ele, vai direto às chaves certas (IXSCAN) e só depois busca os documentos (FETCH). É o mesmo princípio dos índices do curso de SQL.

O índice não é grátis. Cada inserção, remoção e alteração de um campo indexado tem de atualizar todos os índices da coleção, e cada índice ocupa disco e memória. O script `06_custo_e_perfilador.js` insere 20 000 documentos numa coleção só com `_id` e noutra com mais 5 índices, sete vezes cada:

    20 000 inserções, só _id:     184 158 133 162 201 184 139  mediana 162 ms
    20 000 inserções, +5 índices: 269 278 192 187 259 247 279  mediana 259 ms

Com 5 índices extra a escrita ficou cerca de 60 % mais lenta nesta máquina. Em contrapartida, a leitura passou de 100 000 documentos examinados para 1 a 7. Um índice vale a pena quando as leituras que ele acelera compensam o que custa em cada escrita.

**NOTA:** a coleção tem sempre o índice único em `_id`, criado automaticamente. Não o podes apagar.

## Ler o explain

Chama `explain("executionStats")` num cursor para o MongoDB executar a consulta e contar o trabalho feito. Sem índices, o script `01_sem_indices.js` mostra:

    numero = 77777
        COLLSCAN  índice=null  nReturned=1  keys=0  docs=100000  ms=25
    cliente_id = 5047
        COLLSCAN  índice=null  nReturned=7  keys=0  docs=100000  ms=26
    pendentes com total >= 400, mais recentes primeiro
        SORT > COLLSCAN  índice=null  nReturned=1889  keys=0  docs=100000  ms=33

| Campo | Significado |
|---|---|
| winningPlan | O plano escolhido, como árvore de fases (aqui impresso como A > B, da fase final para a inicial) |
| COLLSCAN | Leu a coleção inteira |
| IXSCAN | Percorreu um índice |
| FETCH | Foi buscar o documento completo a partir da chave do índice |
| SORT | Ordenação em memória (o índice não deu a ordem pedida) |
| nReturned | Documentos devolvidos |
| totalKeysExamined | Chaves de índice lidas |
| totalDocsExamined | Documentos lidos |
| executionTimeMillis | Tempo de execução |

A regra de ouro: `totalDocsExamined` deve ser próximo de `nReturned`. Procurar 1 documento lendo 100 000 é o sinal clássico de que falta um índice. Para ver também os planos rejeitados usa `explain("allPlansExecution")`. Em vez de `explain` ao cursor, podes escrever `db.encomendas.explain("executionStats").find({ ... })`.

## Índices simples

`createIndex` recebe os campos e a direção (1 ascendente, -1 descendente). Num índice de um só campo a direção não importa, porque pode ser percorrido nos dois sentidos. Do script `02_simples_e_compostos.js`:

    db.encomendas.createIndex({ numero: 1 })        // devolve "numero_1"
    db.encomendas.createIndex({ cliente_id: 1 })    // devolve "cliente_id_1"

    numero = 77777 (com índice)
        FETCH > IXSCAN  índice=numero_1  nReturned=1  keys=1  docs=1  ms=0
    cliente_id = 5047 (com índice)
        FETCH > IXSCAN  índice=cliente_id_1  nReturned=7  keys=7  docs=7  ms=0

De 100 000 documentos examinados passou-se para 1 e 7. O nome do índice é gerado a partir dos campos; podes escolher o teu com `{ name: "..." }`. Construir um índice sobre os 100 000 documentos demorou menos de um segundo nesta máquina, mas em coleções grandes é uma operação pesada: planeia-a.

## Índices compostos e a regra ESR

Um índice composto cobre vários campos, e a ordem dos campos conta. Serve consultas que usem os primeiros campos (o prefixo), mas não as que só usam os últimos. O guia oficial recomenda a regra ESR: primeiro os campos de igualdade (Equality), depois os de ordenação (Sort), por fim os de intervalo (Range). Isso evita a ordenação em memória.

Consulta: encomendas pendentes com `total >= 400`, mais recentes primeiro. Criei os dois índices possíveis: `estado_total_data` (igualdade, intervalo, ordenação) e `estado_data_total` (igualdade, ordenação, intervalo, a ordem ESR):

    db.encomendas.createIndex({ estado: 1, total: 1, data_encomenda: -1 }, { name: "estado_total_data" })
    db.encomendas.createIndex({ estado: 1, data_encomenda: -1, total: 1 }, { name: "estado_data_total" })

    sem limit, hint estado_total_data (E R S)
        FETCH > SORT > IXSCAN  índice=estado_total_data  nReturned=1889  keys=1889  docs=1889  ms=4
    sem limit, hint estado_data_total (E S R)
        FETCH > IXSCAN  índice=estado_data_total  nReturned=1889  keys=9137  docs=1889  ms=12
    limit 20, hint estado_total_data (E R S)
        FETCH > SORT > IXSCAN  índice=estado_total_data  nReturned=20  keys=1889  docs=20  ms=1
    limit 20, hint estado_data_total (E S R)
        LIMIT > FETCH > IXSCAN  índice=estado_data_total  nReturned=20  keys=100  docs=20  ms=0

O resultado não é «ESR ganha sempre». Sem `limit`, o índice ESR lê 9 137 chaves (todas as pendentes, já por ordem) e o outro lê só 1 889 mas precisa de uma fase SORT. Com `limit 20`, o ESR pára ao fim de 100 chaves e o outro continua a ter de ler 1 889 e ordenar tudo. A documentação diz exatamente isto: se evitar ordenações em memória é crítico, usa ESR; se o intervalo for muito seletivo, pode compensar pô-lo antes da ordenação (ERS). Decide com `explain`, não de cabeça. O `hint` do exemplo força um índice e serve para comparar; não o deixes no código da aplicação sem razão.

Prefixo na prática:

    só estado (prefixo)
        FETCH > IXSCAN  índice=estado_data_total  nReturned=9137  keys=9137  docs=9137  ms=9
    só total (sem o prefixo)
        COLLSCAN  índice=null  nReturned=20434  keys=0  docs=100000  ms=24

O índice `estado_data_total` serve consultas só por `estado`, mas não ajuda quando falta o primeiro campo. Por isso, em vez de um índice por campo, pensa nas consultas reais e cria poucos índices compostos bem ordenados. Um índice `{ a: 1, b: 1 }` torna dispensável um índice `{ a: 1 }`.

**DICA:** a direção só importa em compostos que ordenam por vários campos. O índice `{ a: 1, b: -1 }` serve `sort({ a: 1, b: -1 })` e o inverso exato `sort({ a: -1, b: 1 })`, mas não `sort({ a: 1, b: 1 })`.

## Índices multikey (arrays)

Quando indexas um campo que é um array, o MongoDB cria uma entrada por elemento: é um índice multikey, e não precisas de o declarar. Do script `03_multikey_e_texto.js`:

    db.encomendas.createIndex({ etiquetas: 1 })
    etiquetas = urgente (multikey)
        FETCH > IXSCAN  índice=etiquetas_1  nReturned=23197  keys=23197  docs=23197  ms=18
    etiquetas = urgente, COLLSCAN forçado
        COLLSCAN  índice=null  nReturned=23197  keys=0  docs=100000  ms=29
    isMultiKey: true

Repara que a etiqueta «urgente» aparece em 23 % das encomendas: o índice poupa pouco (18 ms contra 29 ms) porque devolve muitos documentos. Um índice paga-se quando a consulta é seletiva. Combinada com a cidade, num composto `{ cidade: 1, etiquetas: 1 }`, a consulta examina só 2 906 documentos, todos devolvidos, em 2 ms.

Limite: um índice composto só pode ter um campo array por documento. Inserir `{ a: [1, 2], b: [3, 4] }` com índice `{ a: 1, b: 1 }` falha com `cannot index parallel arrays [b] [a]`.

## Índice de texto

Um índice de texto permite pesquisar palavras com `$text`, com tratamento de raízes e palavras vazias do idioma. Cada coleção só pode ter um índice de texto (que pode cobrir vários campos):

    db.produtos.createIndex({ nome: "text", descricao: "text" },
                            { name: "texto_produtos", default_language: "portuguese" })
    db.produtos.find({ $text: { $search: "teclado ergonómico" } },
                     { _id: 0, nome: 1, score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } }).limit(2)
    // [ { nome: 'teclado ergonómico 14171', score: 2.533333333333333 }, ... ]

    $text teclado ergonómico
        TEXT_MATCH > FETCH > OR > IXSCAN > IXSCAN  índice=texto_produtos  nReturned=4641  keys=4921  docs=4641

Várias palavras funcionam como «ou» (4 641 produtos têm «teclado» ou «ergonómico»). Para uma expressão exata usa aspas e para excluir usa o sinal menos: `"\"teclado premium\" -rato"`. O índice de texto não é um motor de pesquisa completo (sem tolerância a erros nem sugestões); para isso existem soluções dedicadas, por exemplo o Atlas Search, que não vemos neste curso.

## Índices únicos

Com `unique: true` o MongoDB recusa valores repetidos. É assim que garantes, por exemplo, um email único (script `04_unico_parcial_esparso.js`):

    db.clientes.createIndex({ email: 1 }, { unique: true })
    db.clientes.insertOne({ id: 99999, nome: "Duplicado", email: "cliente1@exemplo.pt" })
    // E11000 duplicate key error collection: m05.clientes index: email_1 dup key: { email: "cliente1@exemplo.pt" }

    db.clientes.createIndex({ cidade: 1 }, { unique: true })
    // DuplicateKey: já existem cidades repetidas, o índice não é criado

Documentos sem o campo contam como valor `null`, e só um deles é permitido. Para um campo opcional e único combina `unique` com um índice parcial (a seguir).

## Índices parciais e esparsos

Um índice parcial só inclui os documentos que cumprem um filtro (`partialFilterExpression`). Fica mais pequeno e mais barato de manter. Um índice esparso (`sparse: true`) só inclui os documentos que têm o campo. Sobre os mesmos dados:

    cupao_completo: 368 KiB        // todos os 100 000 documentos
    cupao_parcial:   36 KiB        // só os 2 026 com cupão
    data_completo:  1116 KiB
    data_pendentes:  124 KiB       // só estado "pendente"

A consulta tem de incluir o filtro do índice parcial para o poder usar:

    pendentes recentes, índice parcial
        FETCH > IXSCAN  índice=data_pendentes  nReturned=352  keys=352  docs=352  ms=1
    pendentes recentes, índice completo
        FETCH > IXSCAN  índice=data_completo  nReturned=352  keys=4070  docs=4070  ms=8
    recentes de qualquer estado (sem estado na query)
        FETCH > IXSCAN  índice=data_completo  nReturned=4070  keys=4070  docs=4070  ms=4

O índice parcial é 9 vezes mais pequeno e examina só 352 documentos. Sem `estado` na consulta, o planeador não o pode usar, porque não sabe se faltam documentos. O esparso tem uma armadilha: um `sort` com `hint` num índice esparso devolve só os documentos que têm o campo:

    sort por cupao, índice completo: 100000 documentos
    sort por cupao, índice esparso:  2026 documentos

**ATENÇÃO:** a documentação indica que os índices parciais podem fazer o papel dos esparsos e permitem filtros mais precisos. Prefere parciais nos projetos novos.

## Índices TTL

Um índice TTL (time to live) apaga automaticamente os documentos quando o campo de data passa `expireAfterSeconds`. É ideal para sessões, tokens e registos temporários. O campo tem de ser uma data (ou um array de datas). Script `07_ttl.js`:

    db.sessoes.createIndex({ criado_em: 1 }, { expireAfterSeconds: 30 })

Inseri três documentos: dois já fora do prazo (criados há 120 s e 60 s) e um novo, que só expiraria aos 30 s. O script espreita a coleção de 5 em 5 segundos:

    inseridos: 3
    aos 35 s restam 0 []

Aos 30 s ainda estavam os três e aos 35 s já não havia nenhum. Nesta execução, o primeiro ciclo de limpeza só aconteceu depois de o terceiro expirar, por isso não vimos a remoção em duas fases.

A remoção é feita por uma tarefa em segundo plano, não ao segundo: um documento expirado pode ficar visível até ao ciclo seguinte, e a documentação avisa que a remoção pode demorar mais com a carga elevada.

## Consultas cobertas

Uma consulta coberta responde só com o índice, sem ler os documentos (`totalDocsExamined` igual a 0). Tem de se pedir só campos que estão no índice e excluir o `_id` da projeção se ele não fizer parte do índice. Script `05_cobertas_e_regex.js`, com o índice `{ cliente_id: 1, total: 1 }`:

    projeção com _id e total
        PROJECTION_SIMPLE > FETCH > IXSCAN  índice=cliente_id_1  nReturned=7  keys=7  docs=7  ms=0
    projeção _id:0, só campos do índice
        PROJECTION_COVERED > IXSCAN  índice=cliente_total  nReturned=7  keys=7  docs=0  ms=0
    projeção com campo fora do índice
        PROJECTION_SIMPLE > FETCH > IXSCAN  índice=cliente_id_1  nReturned=7  keys=7  docs=7  ms=0

Procura `PROJECTION_COVERED` e `docs=0`. A mesma coisa acontece com `find({ cliente_id: 5047 }, { _id: 0, total: 1 }).sort({ total: -1 })`: continua coberta.

**DICA:** uma consulta que só precisa de dois campos pode ganhar muito com um índice composto que os contenha, mas não alargues os índices só para cobrir tudo: cada campo a mais engorda o índice.

## Gerir índices

    db.encomendas.getIndexes()                 // lista os índices e as suas opções
    db.encomendas.dropIndex("cupao_completo")  // apaga pelo nome (ou pelo padrão: { cupao: 1 })
    db.encomendas.aggregate([{ $indexStats: {} }])   // quantas vezes cada índice foi usado

O `$indexStats` conta os acessos desde o último arranque do servidor (campo `accesses.ops`). Depois de duas consultas reais no fim do script `06_custo_e_perfilador.js`, os únicos índices usados foram `cupao_esparso` e `cliente_id_1`, com 1 acesso cada, e os outros 8 índices da coleção estavam a 0. Um índice sem acessos durante um período representativo é candidato a remoção, mas confirma antes de apagar, porque o contador volta a zero quando o servidor reinicia. Para um índice que apoia restrições únicas, nem pensar.

## O perfilador

O perfilador regista operações lentas na coleção `system.profile` da base de dados. O nível 0 desliga, o 1 regista as operações mais lentas do que `slowms` (omissão 100 ms) e o 2 regista tudo. Em estudo usa o nível 2; em produção, o 1, porque o nível 2 tem custo. Script `06_custo_e_perfilador.js`:

    db.setProfilingLevel(2)
    db.encomendas.find({ total: { $lt: 5.3 } }).toArray()
    db.encomendas.find({ cliente_id: 5047 }).toArray()
    db.setProfilingLevel(0)
    db.system.profile.find({ ns: "m05.encomendas", op: "query" },
        { _id: 0, millis: 1, planSummary: 1, keysExamined: 1, docsExamined: 1, nreturned: 1 })

    { keysExamined: 0, docsExamined: 100000, nreturned: 50, millis: 38, planSummary: 'COLLSCAN' }
    { keysExamined: 7, docsExamined: 7, nreturned: 7, millis: 0, planSummary: 'IXSCAN { cliente_id: 1 }' }

Procura entradas com `planSummary: 'COLLSCAN'` ou com `docsExamined` muito superior a `nreturned`: são as candidatas a um índice novo. Para ajustar o limiar: `db.setProfilingLevel(1, { slowms: 20 })`, e `db.getProfilingStatus()` mostra o estado (`was: 1, slowms: 20`).

## Armadilhas

| Armadilha | Consequência | O que fazer |
|---|---|---|
| Um índice por campo, «por via das dúvidas» | Escritas mais lentas, mais memória | Índices compostos para as consultas reais; usa o perfilador |
| Ordem errada dos campos no composto | O índice não serve a consulta | ESR e `explain` |
| Índice em campo pouco seletivo (como etiquetas com 23 %) | Quase nenhum ganho | Combina com outro campo ou não indexes |
| Regex sem âncora ou com `i` | Lê todas as chaves do índice | Regex ancorada com `^`, sensível a maiúsculas |
| Índice criado em hora de ponta | Carga no servidor | Cria fora de horas |
| Fiar-se só no tempo da primeira execução | Cache e ruído | Compara `keys` e `docs` |

O caso da regex, com um índice em `nome` (20 000 clientes):

    regex sem âncora /Cliente 123/
        FETCH > IXSCAN  índice=nome_1  nReturned=111  keys=20000  docs=111  ms=10
    regex ancorada /^Cliente 123/
        FETCH > IXSCAN  índice=nome_1  nReturned=111  keys=112  docs=111  ms=0
    regex ancorada mas com /i
        FETCH > IXSCAN  índice=nome_1  nReturned=111  keys=20000  docs=111  ms=13

Todas usam o índice, mas só a regex ancorada o aproveita: os limites do índice passam a ser `["Cliente 123", "Cliente 124")` e lê 112 chaves em vez de 20 000. Nas outras o índice é percorrido por inteiro. A documentação chama a isto «prefix expression». Se precisas de pesquisa por qualquer parte do texto, o índice de texto é mais adequado.

**DICA:** quando vires `SORT` no plano de uma consulta frequente, pergunta-te se um índice pode dar a ordem pedida, como o ESR do exemplo com `limit 20`.

## Exercícios

**PRATICAR:** exercícios 17 a 20 do módulo de exercícios (ler um explain e criar o índice certo, aplicar a regra ESR com limit, índices parciais e únicos, consulta coberta e regex com o perfilador).

## Fontes oficiais

- Índices: https://www.mongodb.com/docs/manual/indexes/
- Índices compostos: https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
- Regra ESR: https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/
- Índices multikey: https://www.mongodb.com/docs/manual/core/indexes/index-types/index-multikey/
- Índices de texto: https://www.mongodb.com/docs/manual/core/indexes/index-types/index-text/
- Propriedades dos índices: https://www.mongodb.com/docs/manual/core/indexes/index-properties/
- Índices únicos: https://www.mongodb.com/docs/manual/core/index-unique/
- Índices parciais: https://www.mongodb.com/docs/manual/core/index-partial/
- Índices esparsos: https://www.mongodb.com/docs/manual/core/index-sparse/
- Índices TTL: https://www.mongodb.com/docs/manual/core/index-ttl/
- Resultados do explain: https://www.mongodb.com/docs/manual/reference/explain-results/
- Analisar o plano de uma consulta: https://www.mongodb.com/docs/manual/tutorial/analyze-query-plan/
- Criar índices que suportam consultas: https://www.mongodb.com/docs/manual/tutorial/create-indexes-to-support-queries/
- Medir a utilização de índices: https://www.mongodb.com/docs/manual/tutorial/measure-index-use/
- $indexStats: https://www.mongodb.com/docs/manual/reference/operator/aggregation/indexStats/
- db.setProfilingLevel: https://www.mongodb.com/docs/manual/reference/method/db.setProfilingLevel/
- Gerir o perfilador: https://www.mongodb.com/docs/manual/tutorial/manage-the-database-profiler/
- Operador $regex: https://www.mongodb.com/docs/manual/reference/operator/query/regex/
