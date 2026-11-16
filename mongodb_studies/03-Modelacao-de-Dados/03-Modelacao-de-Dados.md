# 03 Modelação de dados

No módulo 00 viste que a loja chega ao MongoDB «plana»: uma coleção por tabela, tal como no curso de SQL. Isso funciona, mas desperdiça a vantagem dos documentos. Neste módulo aprendes a decidir o que incorporar e o que referenciar, remodelas as encomendas da loja, usas `$lookup` quando precisas de juntar coleções, conheces quatro padrões de modelação, os limites do modelo (16 MiB, arrays sem fim), a validação de esquema com `$jsonSchema` e a forma certa de guardar dinheiro (`Decimal128`).

Tudo foi executado no MongoDB 8.3.17, na base `m03`, com os dados da loja. Os scripts estão em `03-Modelacao-de-Dados/exemplos/` (corre cada um com `mongosh --quiet m03 --file <ficheiro>`).

## A regra de ouro: modela para as consultas

Em SQL começas pelas entidades e normalizas. Em MongoDB, a abordagem habitual é desenhar os documentos a partir da forma como a aplicação acede aos dados. Primeiro perguntas «que consultas vou fazer, e com que frequência?»; depois desenhas os documentos para que as consultas mais comuns sejam uma só leitura.

Há duas ferramentas básicas:

- **Incorporar (embedding):** guardar os dados relacionados dentro do mesmo documento (um array de linhas dentro da encomenda).
- **Referenciar (referencing):** guardar só o identificador do outro documento (o `cliente_id`) e ir buscá-lo quando precisares.

### Critérios de decisão

| Critério | Incorporar quando | Referenciar quando |
|---|---|---|
| Cardinalidade | um para poucos (uma encomenda tem 2 a 10 linhas) | um para muitos, ou muitos para muitos (um produto está em milhares de encomendas) |
| Acesso conjunto | lês sempre os dados juntos (encomenda com as suas linhas) | lês o outro lado por si só, muitas vezes (a ficha do cliente) |
| Crescimento | o conjunto tem um limite natural e pequeno | o conjunto cresce sem fim (todas as encomendas de um cliente) |
| Atomicidade | precisas de alterar tudo de uma vez | as partes mudam de forma independente |
| Frequência de alteração | os dados copiados quase não mudam | os dados mudam muitas vezes e estão em muitos sítios |

Sobre a atomicidade: a documentação de incorporação aponta como vantagem «a capacidade de atualizar dados relacionados numa única operação de escrita atómica». Uma operação sobre um documento é atómica, mesmo que altere vários campos e elementos de arrays. Para a mesma garantia em vários documentos precisas de transações (módulo 06).

## Remodelar a loja

O modelo plano da loja (módulo 00) obriga a duas consultas para ver uma encomenda:

    db.encomendas.findOne({ id: 1 })
    db.linhas_encomenda.find({ encomenda_id: 1 })

As linhas só existem no contexto da encomenda, nunca crescem sem limite e lêem-se sempre com ela: são candidatas óbvias a incorporar. O cliente é diferente: tem identidade própria e muitas encomendas, por isso fica numa coleção e a encomenda guarda uma referência.

O script `01_remodelar_loja.js` cria a coleção `encomendas_v2` a partir das coleções planas (a encomenda 1, como o `mongosh` a mostra):

    {
      _id: 1,
      cliente_id: 1,
      data_encomenda: ISODate('2025-01-10T00:00:00.000Z'),
      estado: 'entregue',
      linhas: [
        { produto_id: 1, nome: 'Romance Policial', quantidade: 2, preco_unitario: 12.9 },
        { produto_id: 5, nome: 'Carregador USB-C', quantidade: 1, preco_unitario: 14.9 }
      ]
    }

Foram criados 12 documentos (um por encomenda, com as 26 linhas lá dentro). Repara em três decisões:

- **O identificador é o número da encomenda.** O `_id` é único e já tens um identificador natural, por isso não precisas de um `ObjectId` extra.
- **A referência ao cliente** (`cliente_id`) continua a ser só o número: o cliente não é copiado.
- **Snapshot do produto.** Cada linha guarda o `nome` e o `preco_unitario` do momento da compra. O curso de SQL já fazia o mesmo no `preco_unitario` das linhas, porque o preço atual do produto pode mudar. Experimentámos: subimos o produto 1 de 12.9 para 14.5 e a encomenda 1 continuou com `preco_unitario: 12.9`. É exatamente o que uma fatura precisa.

Agora as consultas:

    db.encomendas_v2.findOne({ _id: 1 })                      // uma leitura, encomenda completa
    db.encomendas_v2.find({ "linhas.produto_id": 10 }, { _id: 1 }).sort({ _id: 1 })
    // [ { _id: 3 }, { _id: 7 }, { _id: 9 }, { _id: 10 }, { _id: 12 } ]

A segunda usa notação de ponto para pesquisar dentro do array (aprofundas as consultas em arrays no módulo 02 e os índices que as aceleram no módulo 05).

A atomicidade também se vê: passar a encomenda 8 de `pendente` para `enviada` e acrescentar-lhe uma linha numa só operação:

    db.encomendas_v2.updateOne(
      { _id: 8, estado: "pendente" },
      { $set: { estado: "enviada" },
        $push: { linhas: { produto_id: 10, nome: "Caneca de Cerâmica", quantidade: 1, preco_unitario: 6.5 } } })
    // matchedCount: 1, modifiedCount: 1

**DICA:** o filtro `estado: "pendente"` junta verificação e alteração: se outro processo já mudou o estado, `matchedCount` vem a 0.

### Comparação com o modelo relacional

No curso de SQL, o ficheiro `loja.sql` define cinco tabelas, com `FOREIGN KEY` de `encomendas` para `clientes` e de `linhas_encomenda` para `encomendas` e `produtos`, e o preço como `DECIMAL(10,2)`. Para ler a encomenda 1 com as linhas e o cliente, escreves um JOIN (SQL escrito à mão, não executado aqui):

    SELECT e.id, c.nome, l.produto_id, l.quantidade, l.preco_unitario
    FROM encomendas e
    JOIN clientes c ON c.id = e.cliente_id
    JOIN linhas_encomenda l ON l.encomenda_id = e.id
    WHERE e.id = 1;

| Aspeto | SQL (loja.sql) | MongoDB (encomendas_v2) |
|---|---|---|
| Linhas da encomenda | tabela própria, ligada por chave estrangeira | array dentro da encomenda |
| Integridade referencial | o motor impede linhas órfãs | nada impede um `produto_id` inexistente |
| Ler uma encomenda completa | JOIN de 2 ou 3 tabelas | uma leitura |
| Preço de uma linha | copiado para `linhas_encomenda.preco_unitario` | copiado para o elemento do array |
| Dinheiro | `DECIMAL(10,2)`, exato | `Decimal128` se quiseres exatidão (ver abaixo) |

Nenhum é «o certo»: a remodelação ganha quando a leitura da encomenda é o caso dominante, e perde quando cruzas linhas de todas as encomendas (vendas por produto) ou precisas de integridade referencial garantida pelo motor.

## $lookup: o JOIN do MongoDB (introdução)

O `$lookup` é uma fase do aggregation pipeline (módulo 04). A documentação descreve-o como um left outer join com uma coleção da mesma base de dados: acrescenta a cada documento um array com os documentos correspondentes. Para juntar o cliente a cada encomenda:

    db.encomendas_v2.aggregate([
      { $match: { _id: { $in: [1, 4] } } },
      { $lookup: { from: "clientes", localField: "cliente_id", foreignField: "id", as: "cliente" } },
      { $project: { estado: 1, "cliente.nome": 1, "cliente.cidade": 1 } }
    ])
    // { _id: 1, estado: 'entregue', cliente: [ { nome: 'Ana Ribeiro', cidade: 'Lisboa' } ] }
    // { _id: 4, estado: 'cancelada', cliente: [ { nome: 'Carla Mendes', cidade: 'Braga' } ] }

O resultado em `cliente` é sempre um array, mesmo quando só há um cliente. Se `localField` for um array (as `linhas.produto_id`), cada elemento é comparado com o `foreignField`; a documentação refere que dispensa o `$unwind`. Na encomenda 3 devolveu os produtos atuais `Caneca de Cerâmica` (6.5) e `Livro de Receitas` (18.5), numa ordem que não é a das linhas.

**ATENÇÃO:** a documentação avisa que o desempenho do `$lookup` depende de haver um índice no `foreignField`; sem ele, junções em coleções grandes são lentas. O `$lookup` serve para consultas ocasionais, não para a leitura principal. Se a usas em todos os pedidos, é sinal de que devias incorporar. Os índices são o tema do módulo 05.

## Padrões de modelação

A documentação do MongoDB agrupa os padrões de modelação em famílias (computar valores, agrupar dados, versionar documentos, arquivar e outras). Quatro são úteis na loja. O nome «extended reference» não aparece como página própria na documentação que consultámos; a ideia está descrita na página de duplicação de dados, e usamos o nome por ser o corrente na comunidade.

| Padrão | Ideia | Custo |
|---|---|---|
| Subset | no documento principal ficam só os elementos mais usados de um array grande, o resto vai para outra coleção | duas coleções para manter |
| Bucket | agrupar muitos registos pequenos em poucos documentos maiores | lógica de escrita mais complexa |
| Computed | guardar um valor calculado (total, contagem) em vez de o recalcular | manter o valor em sincronia |
| Extended reference | copiar para o documento alguns campos do documento referenciado | cópias podem ficar desatualizadas |

### Subset

Um produto pode ter centenas de avaliações, mas a página só mostra as últimas três. A documentação descreve o subset como a técnica para quando tens «um grande array de itens» mas só precisas de um subconjunto, e refere que o objetivo é reduzir o conjunto de trabalho. No script `03_padroes.js`, cada avaliação vai para a coleção `avaliacoes` (histórico completo) e uma cópia entra em `ultimas_avaliacoes` do produto, limitada a 3 e ordenada por data:

    db.produtos.updateOne({ id: 6 }, {
      $push: { ultimas_avaliacoes: { $each: [av], $sort: { data: -1 }, $slice: 3 } } })

Depois de 8 avaliações, o produto 6 tinha `cliente8`, `cliente7` e `cliente6`, e a coleção `avaliacoes` tinha as 8.

### Bucket

Para registos que se acumulam (alterações de preço, leituras de um sensor), um documento por registo gera uma coleção enorme. No bucket, cada documento guarda até N registos. Com baldes de 3, sete alterações de preço do produto 1 produziram três documentos, com 3, 3 e 1 alterações:

    db.historico_precos.updateOne(
      { produto_id: 1, contagem: { $lt: 3 } },              // balde com espaço
      { $push: { alteracoes: { data: d, preco: p } }, $inc: { contagem: 1 } },
      { upsert: true })                                      // sem balde livre, cria um novo

A página do padrão na documentação nota que as coleções de séries temporais aplicam o bucket automaticamente e servem a maioria dos casos. Em dados temporais, começa por elas.

### Computed

O total de uma encomenda calcula-se com as linhas, mas se o mostras em todas as listagens, é melhor guardá-lo. A documentação recomenda o padrão quando as leituras são muito mais frequentes do que as escritas, e avisa que o valor guardado tem de ser mantido em sincronia. O script acrescenta `n_linhas` e `total` com uma atualização por pipeline (a encomenda 1 ficou com `n_linhas: 2` e `total: 40.7`) e, ao acrescentar uma linha, atualiza tudo na mesma operação:

    db.encomendas_v2.updateOne({ _id: 12 }, {
      $push: { linhas: { produto_id: 5, nome: "Carregador USB-C", quantidade: 1, preco_unitario: 14.9 } },
      $inc: { n_linhas: 1, total: 14.9 } })

### Extended reference

Para listar encomendas com o nome do cliente sem `$lookup`, copia-se para a encomenda o essencial do cliente:

    cliente: { id: 1, nome: 'Ana Ribeiro', cidade: 'Lisboa' }

Assim, `db.encomendas_v2.countDocuments({ "cliente.cidade": "Lisboa" })` deu 5 sem juntar nada. A página de duplicação de dados dá o exemplo equivalente (copiar alguns campos do produto para a encomenda) e justifica-o porque «a aplicação só precisa de um subconjunto». O custo: mudámos o nome da cliente 1 para `Ana Ribeiro Silva` e a encomenda 1 continuou com `Ana Ribeiro`. Copia só o que muda raramente, e se mudar, tens de atualizar as cópias (um `updateMany`).

**DICA:** a diferença entre snapshot e extended reference é a intenção. O snapshot do preço deve ficar congelado (é o que foi faturado). A cópia do nome do cliente deve acompanhar a realidade e por isso precisa de ser atualizada.

## O limite de 16 MiB e os arrays sem fim

Um documento BSON não pode passar de 16 MiB (módulo 00). Mediu-se o tamanho com `bsonsize`: uma linha de encomenda ocupa 88 bytes, e uma encomenda com 10 000 linhas ocupa 0,90 MiB, com 100 000 linhas 9,05 MiB e com 300 000 linhas 27,36 MiB. Uma encomenda real nunca chega lá, mas uma lista que só cresce chega.

Pôs-se à prova com um documento de 100 000 linhas. Foi inserido; mas acrescentar mais 50 000 linhas duas vezes com `$push` deu, no segundo passo, este erro do servidor:

    MongoServerError: Plan executor error during update :: caused by :: Resulting document after update is larger than 16777216

O driver recusa o documento ainda antes de ir para o servidor. Em pymongo 4.20.0, inserir um valor de 17 MiB deu:

    DocumentTooLarge - BSON document too large (17825928 bytes) - the connected server supports BSON document sizes up to 16793598 bytes.

(O servidor aceita 16 MiB mais uma pequena margem, 16 793 598 bytes. `db.hello().maxBsonObjectSize` indica 16 777 216.) No `mongosh` o mesmo teste falhou com um `RangeError` de serialização do próprio cliente, e não com um erro do servidor.

### Anti-padrão: array sem limite

Guardar numa lista dentro do documento algo que cresce para sempre (todas as encomendas de um cliente em `clientes.encomendas`, todas as avaliações dentro do livro) é o anti-padrão que a documentação chama «unbounded array». Os problemas, segundo ela: o documento pode ultrapassar os 16 MiB e o array pode degradar a eficiência dos índices. As soluções que a documentação propõe são o padrão subset (guardar só alguns elementos) e a referência (cada elemento no seu documento, com o identificador do pai). Foi o que fizemos com as encomendas: cada uma é um documento com `cliente_id`, não um elemento de `clientes`.

## Validação de esquema com $jsonSchema

O esquema flexível não impede erros. Podes impor regras com um validador `$jsonSchema`, ao criar a coleção ou depois com `collMod`. Com o script `06_validacao.js`:

    const esquema = {
      bsonType: "object",
      required: ["id", "nome", "preco", "stock"],
      properties: {
        id:    { bsonType: "int" },
        nome:  { bsonType: "string", minLength: 1 },
        preco: { bsonType: "decimal", minimum: 0 },
        stock: { bsonType: "int", minimum: 0 }
      }
    }
    db.createCollection("pv", { validator: { $jsonSchema: esquema },
                                validationLevel: "strict", validationAction: "error" })

Resultados reais (código de erro 121, `DocumentValidationFailure`):

    preço double:    erro 121 - Document failed validation
    stock negativo:  erro 121 - Document failed validation
    falta o nome:    erro 121 - Document failed validation
    documento válido: aceite

A mensagem curta não diz o motivo. O detalhe vem em `e.errInfo.details.schemaRulesNotSatisfied`. Para o preço `1.5` (double, não decimal):

    [ { operatorName: 'properties',
        propertiesNotSatisfied: [ { propertyName: 'preco',
          details: [ { operatorName: 'bsonType', specifiedAs: { bsonType: 'decimal' },
                       reason: 'type did not match', consideredValue: 1.5, consideredType: 'double' } ] } ] } ]

**ATENÇÃO:** o `mongosh` envia os números sem tipo como `double`. Para o `bsonType: "int"` e `"decimal"` tens de escrever `NumberInt(40)` e `Decimal128("12.90")`. Sem isso, o documento «certo» é recusado.

### validationLevel e validationAction

| Opção | Valor | Efeito (comprovado no script) |
|---|---|---|
| validationLevel | strict (por defeito) | valida todos os inserts e todos os updates |
| validationLevel | moderate | valida inserts e updates a documentos que já cumprem as regras; documentos antigos inválidos podem ser atualizados |
| validationAction | error (por defeito) | rejeita a escrita |
| validationAction | warn | aceita a escrita e regista um aviso no log do servidor |

Existe também `validationLevel: "off"`; confirma-o na documentação. Para uma coleção que já tem dados, o caminho seguro é o `collMod`. Copiaram-se os 10 produtos (todos com preço `double`, portanto fora do esquema) para duas coleções, uma `moderate` e outra `strict`:

    db.runCommand({ collMod: "pm", validator: { $jsonSchema: esquema }, validationLevel: "moderate" })

    moderate: atualizar documento antigo inválido: aceite
    strict:   atualizar documento antigo inválido : erro 121 - Plan executor error during update :: caused by :: Document failed validation
    moderate: inserir documento novo inválido     : erro 121 - Document failed validation

Com `validationAction: "warn"`, um documento inválido foi aceite e o log do servidor (`getLog`) registou a mensagem `Document would fail validation`, nível `W`. O `collMod` não revalida os documentos que já existem: para os encontrar usa `db.pm.find({ $nor: [{ $jsonSchema: esquema }] })`, que devolveu os 10. Por fim, o comando `insert` com `bypassDocumentValidation: true` inseriu um documento inválido; é uma permissão que deves reservar para migrações.

**DICA:** a estratégia habitual numa base com dados: `warn` primeiro, corrigir os documentos que aparecem no log, e só depois passar a `error`. Os pormenores das opções estão nas páginas «Specify Validation Level» e «Handle Invalid Documents», ligadas a partir da página de validação de esquema.

## Decimal128 para dinheiro

O `double` não representa 0,1 com exatidão. Resultado real:

    soma de 0.1 + 0.2 (double):     0.30000000000000004
    1.1 x 3 (double):               3.3000000000000003
    soma de dez 0.1 (double):       0.9999999999999999
    soma de dez 0.1 (Decimal128):   Decimal128('1.0')

Com `Decimal128("0.1")` os mesmos cálculos dão `0.3`, `3.3` e `1.0`. A documentação sobre dados monetários diz que o decimal é preferível ao método do fator de escala (guardar cêntimos como inteiros) e que não aproxima valores decimais. Nos 12 totais da loja nenhum teve ruído antes de arredondar (0 de 12), porque os preços são curtos; o problema aparece com somas longas e multiplicações por percentagens.

Ao converter preços existentes, o modo de conversão importa:

    original: 12.9
    $toDecimal: "$preco"                       ->  Decimal128('12.9000000000000')
    $toDecimal: { $toString: "$preco" }        ->  Decimal128('12.9')

A conversão direta de um double dá 15 dígitos significativos (`12.9000000000000`); passar pelo texto dá o valor curto, que é o que os dados originais pretendiam. A documentação avisa para testar a conversão antes: depois de gravar decimais, os ficheiros de dados deixam de ser compatíveis com versões antigas.

| Opção | Vantagem | Desvantagem |
|---|---|---|
| double | simples, rápido, legível | aproxima; mau para somas e comparações de dinheiro |
| Decimal128 | exato, aritmética decimal no servidor | tem de ser escrito com `Decimal128(...)`; mais espaço |
| inteiro em cêntimos | exato e simples | tens de lembrar a escala em toda a aplicação |

Em SQL, `DECIMAL(10,2)` resolve isto no esquema; em MongoDB a exatidão é uma escolha tua, a que o validador acima pode obrigar (`bsonType: "decimal"`).

## Exercícios

**PRATICAR:** faz os exercícios 9 a 12 do módulo de exercícios (9 incorporar a categoria, 10 `$lookup` e comparação com o JOIN, 11 validação de esquema, 12 `Decimal128` e totais).

## Fontes oficiais

- Modelação de dados: https://www.mongodb.com/docs/manual/data-modeling/
- Incorporar dados: https://www.mongodb.com/docs/manual/data-modeling/embedding/
- Referenciar dados: https://www.mongodb.com/docs/manual/data-modeling/referencing/
- Duplicação de dados: https://www.mongodb.com/docs/manual/data-modeling/handle-duplicate-data/
- Padrões de desenho: https://www.mongodb.com/docs/manual/data-modeling/design-patterns/
- Subset: https://www.mongodb.com/docs/manual/data-modeling/design-patterns/group-data/subset-pattern/
- Bucket: https://www.mongodb.com/docs/manual/data-modeling/design-patterns/group-data/bucket-pattern/
- Computed: https://www.mongodb.com/docs/manual/data-modeling/design-patterns/computed-values/computed-schema-pattern/
- Arrays sem limite: https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/
- Limites do MongoDB: https://www.mongodb.com/docs/manual/reference/limits/
- $lookup: https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/
- Validação de esquema: https://www.mongodb.com/docs/manual/core/schema-validation/
- Operador $jsonSchema: https://www.mongodb.com/docs/manual/reference/operator/query/jsonSchema/
- collMod: https://www.mongodb.com/docs/manual/reference/command/collMod/
- Dados monetários: https://www.mongodb.com/docs/manual/tutorial/model-monetary-data/
