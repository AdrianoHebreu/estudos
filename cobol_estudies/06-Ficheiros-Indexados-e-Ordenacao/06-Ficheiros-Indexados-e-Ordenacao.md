# 06 Ficheiros indexados e ordenação

Até aqui leste ficheiros do princípio ao fim. Para consultar o cliente 7 isso obriga a ler os seis anteriores; um ficheiro indexado vai buscá-lo directamente pela chave, como um índice remissivo num livro. Neste módulo carregas os clientes e os produtos da loja para ficheiros indexados, lês por chave, percorres por cidade, alteras e apagas registos, vês o que o GnuCOBOL cria em disco, e ordenas com SORT. Todos os exemplos foram executados com cobc (GnuCOBOL) 3.2.0 em Docker; o aviso «libxml 212 using older 209» ao executar é inofensivo e foi omitido.

Há três organizações: LINE SEQUENTIAL (do princípio ao fim, módulo 04), INDEXED (por chave) e RELATIVE (pelo número do registo). No mainframe o equivalente habitual do indexado é o VSAM (não executado aqui; confirma na documentação IBM).

## O que o GnuCOBOL cria em disco

O gestor de ficheiros indexados depende da compilação. Perguntei ao compilador:

    $ cobc --info
    sequential file handler  : built-in
    indexed file handler     : BDB

Na imagem do curso o indexado usa BDB (Berkeley DB). Depois de gravar clientes.idx, com uma chave primária e uma alternativa, apareceram dois ficheiros:

    clientes.idx      8192 bytes
    clientes.idx.1    8192 bytes

O ficheiro sem sufixo guarda a chave primária e o ficheiro .1 a chave alternativa. Só testei uma chave alternativa; confirma na documentação o que acontece com mais. Não os abras num editor: só o programa COBOL os deve ler. Trata os dois como um conjunto. O manual do GnuCOBOL tem a secção «Indexed file packages» por escrever, por isso o que aqui afirmo vem de cobc --info e das listagens.

**NOTA:** noutra instalação o gestor pode ser outro (o formato dos ficheiros muda; o código COBOL não). Corre cobc --info para saber qual tens.

## Declarar um ficheiro indexado

           SELECT F-CLIENTES ASSIGN TO "clientes.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS DYNAMIC
               RECORD KEY IS CLI-ID
               ALTERNATE RECORD KEY IS CLI-CIDADE WITH DUPLICATES
               FILE STATUS IS WS-ESTADO.

| Cláusula | Significado |
|---|---|
| RECORD KEY | Chave primária: campo do registo, única |
| ALTERNATE RECORD KEY | Segunda via de acesso; sem WITH DUPLICATES tem de ser única |
| WITH DUPLICATES | Vários registos podem ter o mesmo valor (vários clientes de Lisboa) |
| ACCESS MODE | SEQUENTIAL, RANDOM ou DYNAMIC (ver abaixo) |

As chaves são campos do registo definido no FD.

## Carregar os dados: WRITE com chave

O programa lê clientes.dat (sequencial) e grava cada registo no indexado. Excerto de carregar.cob; a descrição do FD é a do copybook do módulo 00.

           OPEN INPUT F-ENTRADA
           OPEN OUTPUT F-CLIENTES
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ENTRADA
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       WRITE REG-CLIENTE FROM REG-ENTRADA
                           INVALID KEY
                               DISPLAY "falhou " REG-ENTRADA(1:3)
                                       " estado " WS-ESTADO
                           NOT INVALID KEY ADD 1 TO WS-N
                       END-WRITE
               END-READ
           END-PERFORM

    OPEN OUTPUT indexado, estado 00
    Gravados: 08

O carregarp.cob faz o mesmo com produtos.dat (chave PRO-ID, alternativa PRO-CATEGORIA-ID com duplicados) e gravou 10. INVALID KEY dispara quando a chave é inválida; o FILE STATUS diz o que foi.

**ATENÇÃO:** com ACCESS MODE SEQUENTIAL a carga tem de seguir a ordem crescente da chave. Gravei a chave 5 e depois a 3: o WRITE do 3 devolveu estado 21. Com RANDOM ou DYNAMIC não há esta limitação.

## Ler por chave

Com ACCESS RANDOM ou DYNAMIC pões a chave no campo e fazes READ. O READ lê o registo que tem essa chave, sem percorrer o ficheiro. Excerto de consultar.cob:

           MOVE 3 TO CLI-ID
           READ F-CLIENTES
               INVALID KEY DISPLAY "cliente 3 nao existe"
               NOT INVALID KEY
                   DISPLAY "READ 3: " CLI-NOME " " CLI-CIDADE
           END-READ
           MOVE 99 TO CLI-ID
           READ F-CLIENTES
               INVALID KEY DISPLAY "cliente 99 nao existe"
           END-READ
           MOVE "Porto" TO CLI-CIDADE
           READ F-CLIENTES KEY IS CLI-CIDADE

    READ 3: Carla Mendes         Braga
    cliente 99 nao existe (estado 23)
    Porto: 002 Bruno Costa

READ ... KEY IS usa a chave alternativa e devolve o primeiro registo com esse valor (o 2; o 6 também é do Porto). Sem KEY IS, usa a primária. A consulta de um cliente por chave é isto: MOVE do ID, READ, e INVALID KEY para o caso de não existir.

## START e READ NEXT: percorrer a partir de uma chave

START posiciona o ficheiro sem ler nenhum registo; READ NEXT lê o seguinte. Testei três condições: KEY IS = (primeiro registo com chave igual), KEY IS > (primeiro com chave maior) e KEY IS >= (igual ou maior). Se não houver registo que cumpra a condição, o START dá INVALID KEY (estado 23). Todos os clientes de Lisboa pela chave alternativa:

           MOVE "Lisboa" TO CLI-CIDADE
           START F-CLIENTES KEY IS = CLI-CIDADE
               INVALID KEY SET FIM-DA-LISTA TO TRUE
           END-START
           PERFORM UNTIL FIM-DA-LISTA
               READ F-CLIENTES NEXT
                   AT END SET FIM-DA-LISTA TO TRUE
                   NOT AT END
                       IF CLI-CIDADE = "Lisboa"
                           DISPLAY CLI-ID " " CLI-NOME
                       ELSE
                           SET FIM-DA-LISTA TO TRUE
                       END-IF
               END-READ
           END-PERFORM

    001 Ana Ribeiro
    004 Diogo Pires
    008 Hugo Teixeira

O READ NEXT continua para lá de Lisboa, por isso o IF pára o ciclo quando a cidade muda. Com MOVE 5 TO CLI-ID e START KEY IS > CLI-ID, o READ NEXT leu o 006. Com chave 10, START KEY IS >= CLI-ID deu estado 23.

Para listar toda a gente por ordem de cidade basta posicionar antes do primeiro (porcidade.cob):

           MOVE LOW-VALUES TO CLI-CIDADE
           START F-CLIENTES KEY IS >= CLI-CIDADE

    Braga      003 Carla Mendes
    Coimbra    005 Eva Martins
    Faro       007 Graca Nunes
    Lisboa     001 Ana Ribeiro
    ...
    Porto      006 Filipe Lopes

## WRITE, REWRITE e DELETE

Excertos de manter.cob (ACCESS RANDOM, OPEN I-O):

| Operação (cliente 9, depois o 8) | Estado obtido |
|---|---|
| WRITE do 9 | 00 |
| WRITE do 9 outra vez | 22 |
| READ do 8, mudar o email, REWRITE | 00 |
| DELETE do 9 | 00 |
| DELETE do 9 outra vez | 23 |

           MOVE 8 TO CLI-ID
           READ F-CLIENTES
           MOVE "hugo.teixeira@exemplo.pt" TO CLI-EMAIL
           REWRITE REG-CLIENTE
               INVALID KEY DISPLAY "REWRITE falhou: " WS-ESTADO
           END-REWRITE
           MOVE 9 TO CLI-ID
           DELETE F-CLIENTES
               INVALID KEY DISPLAY "DELETE 9 falhou: " WS-ESTADO
           END-DELETE

REWRITE substitui o registo actual por inteiro, por isso lê primeiro, altera os campos e regrava. O DELETE leva o nome do ficheiro (não do registo) e apaga o registo cuja chave está no campo. Não testei mudar a chave primária num REWRITE; para mudar um ID o caminho seguro é DELETE e WRITE. Mudar a chave alternativa com REWRITE funciona (exercício 23).

| Estado | Significado (observado) |
|---|---|
| 00 | Sucesso |
| 21 | Chave fora de ordem (WRITE sequencial) |
| 22 | Chave duplicada |
| 23 | Registo não existe |
| 35 | OPEN I-O de ficheiro que não existe |
| 48 | Operação não permitida pelo modo de abertura |

**ATENÇÃO:** sem FILE STATUS e sem INVALID KEY, um WRITE com chave duplicada pára o programa. O libcob escreveu:

    libcob: error: record key already exists (status = 22) for file F-CLIENTES ('clientes_idx' => clientes.idx)

e o programa terminou com código 1 sem chegar ao DISPLAY seguinte. Declara sempre FILE STATUS.

## Modos de acesso

| ACCESS MODE | O que permite |
|---|---|
| SEQUENTIAL (por omissão) | Ler pela ordem da chave; escrever com chaves crescentes |
| RANDOM | READ, WRITE, REWRITE e DELETE por chave |
| DYNAMIC | RANDOM e também START e READ NEXT |

**ATENÇÃO:** como SEQUENTIAL é o valor por omissão, esquecer o ACCESS MODE com OPEN I-O e fazer WRITE dá estado 48 («WRITE not allowed»). Num programa de manutenção usa DYNAMIC ou RANDOM.

## Ficheiros relativos (introdução)

Num ficheiro relativo o registo é identificado pelo número da posição (RELATIVE KEY), sem índice. Em relativo.cob usei o ID do produto como número do registo:

           SELECT F-REL ASSIGN TO "produtos.rel"
               ORGANIZATION IS RELATIVE
               ACCESS MODE IS DYNAMIC
               RELATIVE KEY IS WS-NUM

    registo 007: Candeeiro de Mesa
    registo 3: estado 23
    a seguir ao 2: 004 Auscultadores Bluetooth

O DELETE do registo 3 deixou um buraco: o READ do 3 deu 23 e o READ NEXT a seguir ao 2 saltou-o. Em disco criou-se um só ficheiro, produtos.rel, de 500 bytes para 10 registos de 42 (50 por registo; não verifiquei a razão dos 8 bytes extra). A chave relativa é um campo da WORKING-STORAGE, fora do registo. Só executei esta introdução; usa o indexado quando precisas de chaves com significado.

## SORT: ordenar

O SORT ordena um ficheiro por uma ou mais chaves. O ficheiro de trabalho declara-se com SD (sort description) em vez de FD, e o ASSIGN é um nome temporário. Ordenar os produtos por preço (ordenar.cob):

           SORT F-TRABALHO
               ON ASCENDING KEY TRB-PRECO
               USING F-PRODUTOS
               GIVING F-ORDENADO
           DISPLAY "SORT 1 terminou, SORT-RETURN " SORT-RETURN

    SORT 1 terminou, SORT-RETURN +000000000
    010 Caneca de Ceramica         6.50
    001 Romance Policial          12.90
    ...
    008 Conjunto de Panelas       89.90

USING lê o ficheiro de entrada inteiro, GIVING escreve o resultado; o ficheiro de trabalho (trabalho.tmp) não ficou em disco no fim. O registo do SD tem de ter o mesmo tamanho que o de entrada, e SORT-RETURN fica a 0 se correu bem. Vários níveis de ordenação juntam-se com ON ASCENDING KEY e ON DESCENDING KEY por ordem de importância.

## INPUT e OUTPUT PROCEDURE

Quando precisas de filtrar antes ou formatar depois, trocas USING e GIVING por procedimentos. O INPUT PROCEDURE lê e dá registos ao sort com RELEASE; o OUTPUT PROCEDURE recebe-os, já ordenados, com RETURN. Produtos com stock, por categoria e, dentro de cada uma, do mais caro ao mais barato:

           SORT F-TRABALHO
               ON ASCENDING KEY TRB-CATEGORIA-ID
               ON DESCENDING KEY TRB-PRECO
               INPUT PROCEDURE IS SO-COM-STOCK
               OUTPUT PROCEDURE IS MOSTRAR
       SO-COM-STOCK SECTION.
           ...
               READ F-PRODUTOS INTO REG-TRABALHO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       IF TRB-STOCK > 0
                           RELEASE REG-TRABALHO
                       END-IF
               END-READ
       MOSTRAR SECTION.
               RETURN F-TRABALHO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END DISPLAY ...
               END-RETURN

    cat 01 Atlas Mundial             29.99
    cat 01 Livro de Receitas         18.50
    cat 01 Romance Policial          12.90
    cat 02 Auscultadores Bluetooth   49.90
    cat 02 Carregador USB-C          14.90
    ...

O Teclado Mecânico (stock 0, categoria 02) ficou de fora. Escrevi os procedimentos como SECTION; o RETURN tem AT END como o READ. O INPUT PROCEDURE abre e fecha o ficheiro de entrada: o SORT não o faz por ti (com USING é automático). Um OUTPUT PROCEDURE é também o sítio certo para uma quebra de controlo (exercício 24).

## MERGE: juntar ficheiros já ordenados

O MERGE combina dois ou mais ficheiros que já estão ordenados pela mesma chave, sem reordenar. Em juntar.cob juntei porpreco.dat (os produtos ordenados acima) com novos.dat (dois produtos novos, também por preço crescente: 8.50 e 60.00):

           MERGE F-TRABALHO
               ON ASCENDING KEY TRB-PRECO
               USING F-A F-B
               OUTPUT PROCEDURE IS MOSTRAR

    010 Caneca de Ceramica         6.50
    011 Pilhas AA                  8.50
    001 Romance Policial          12.90
    ...
    012 Mochila                   60.00

A sintaxe é parecida com a do SORT, mas o MERGE pressupõe ficheiros já ordenados pela chave indicada; confirma na documentação as diferenças. Só executei este caso simples.

## Na loja: abater o stock por chave

Para cada linha de encomenda lês o produto pela chave, verificas o stock e regravas. Em stock.cob processei as linhas das encomendas 5 e 8 (produtos.idx acabado de carregar):

       1000-ABATER.
           MOVE LIN-PRODUTO-ID TO PRO-ID
           READ F-PRODUTOS
               INVALID KEY
                   DISPLAY "produto " PRO-ID " inexistente"
               NOT INVALID KEY
                   IF PRO-STOCK < LIN-QUANTIDADE
                       DISPLAY "encomenda " LIN-ENCOMENDA-ID " "
                               PRO-NOME " sem stock (" PRO-STOCK ")"
                   ELSE
                       SUBTRACT LIN-QUANTIDADE FROM PRO-STOCK
                       REWRITE REG-PRODUTO
                   END-IF
           END-READ.

    encomenda 0005 Teclado Mecanico          sem stock (00000)
    Carregador USB-C          stock 00100 -> 00098
    Romance Policial          stock 00040 -> 00039
    Livro de Receitas         stock 00025 -> 00023
    Auscultadores Bluetooth   stock 00030 -> 00029

Os valores ficaram gravados no indexado: corre carregarp outra vez para repor o stock original antes de repetires o exemplo.

**DICA:** o padrão «ler por chave, testar, mudar, REWRITE» é o centro de quase todos os programas de manutenção. O produtos.dat original não mudou: só o indexado foi alterado.

## Resumo

| Queres | Usa |
|---|---|
| Aceder a um registo pela chave | ORGANIZATION IS INDEXED, MOVE da chave e READ |
| Percorrer a partir de um valor | ACCESS DYNAMIC, START e READ NEXT |
| Listar por outra ordem | ALTERNATE RECORD KEY WITH DUPLICATES e START >= |
| Detectar duplicado ou em falta | INVALID KEY e FILE STATUS 22 e 23 |
| Alterar e apagar | READ, REWRITE e DELETE |
| Ordenar um ficheiro | SORT com SD, USING e GIVING |
| Filtrar ou totalizar ao ordenar | INPUT e OUTPUT PROCEDURE com RELEASE e RETURN |

## Exercícios

**PRATICAR:** faz os exercícios 21 a 24 do módulo 11: carregar as encomendas para um indexado e consultá-las (21), a ficha de um cliente com as suas encomendas (22), a manutenção de clientes com alteração da chave alternativa (23) e os totais por produto com SORT e OUTPUT PROCEDURE (24).

## Fontes oficiais

- Manual do programador do GnuCOBOL: https://gnucobol.sourceforge.io/doc/gnucobol.html
- FAQ do GnuCOBOL: https://gnucobol.sourceforge.io/faq/index.html
- IBM Enterprise COBOL for z/OS 6.4, documentação (o COBOL de mainframe; não executado aqui): https://www.ibm.com/docs/en/cobol-zos/6.4
