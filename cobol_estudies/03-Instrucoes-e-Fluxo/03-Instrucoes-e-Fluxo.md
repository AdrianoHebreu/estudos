# 03 Instruções e fluxo

Até aqui os programas só declaravam e mostravam dados. Neste módulo aprendes a fazer coisas com eles: copiar valores (MOVE), calcular (ADD, COMPUTE e companhia), decidir (IF e EVALUATE) e repetir (PERFORM), e a organizar tudo em parágrafos que se lêem de cima para baixo. Todas as saídas foram obtidas com o GnuCOBOL 3.2.0 (imagem Docker est-cb-gnucobol:estudo), com valores reais de produtos.dat e linhas.dat.

**NOTA:** os exemplos estão em 03-Instrucoes-e-Fluxo/exemplos/. Copia o ficheiro .cob para uma pasta tua e compila-o como no módulo 00 (cobc -x -Wall -o programa programa.cob e depois ./programa). Todos estão no formato fixo: respeita as colunas (um DISPLAY na coluna 7 não escreve nada e o que passa da coluna 72 é cortado em silêncio). O -Wall liga os avisos extra do compilador: usa-o sempre nos estudos.

## MOVE: copiar valores

MOVE origem TO destino copia o conteúdo e adapta-o ao destino. A origem pode ser um literal, um campo elementar ou um grupo, e podes ter vários destinos (MOVE 0 TO A B C pôs os três a zero). As regras mudam com o tipo:

| Origem para destino | O que acontece |
|---|---|
| Texto para texto | Alinha à esquerda, corta à direita o que não cabe, enche de espaços o que sobra |
| Número para número | Alinha pela vírgula decimal, enche de zeros, corta o que não cabe (módulo 02) |
| Inteiro sem sinal para texto | Os dígitos passam para o texto, alinhados à esquerda |
| Texto de dígitos para número | Os dígitos passam para o número, alinhados à direita |
| Grupo para qualquer coisa | Cópia byte a byte, como se fosse texto |

Resultados de mover.cob:

    X(10) para X(05): [ABCDE]
    X(10) para X(15): [ABCDEFGHIJ     ]
    9(05) 30 para X(08): [00030   ]
    S9(03) -42 para X(08): [042     ]
    X(05) 00042 para 9(05): [00042]
    X(03) ABC para 9(05): [00000]

Repara no sinal: ao passar -42 para texto ficou 042, sem o menos. E o último caso é o perigoso: «ABC» para um campo numérico deu 00000 sem erro nenhum. Esse resultado depende do compilador: nunca o uses de propósito.

**ATENÇÃO:** um número com casas decimais não pode ser movido para um campo de texto. Com PRECO PIC 9(05)V99 e MOVE PRECO TO TEXTO (X(08)) o GnuCOBOL recusa o programa (erro-move.cob):

    erro-move.cob:10: error: invalid MOVE statement
       10 >            MOVE PRECO TO TEXTO

Para ter o preço em texto usam-se PICTURE de edição, que são o módulo 05. Já o MOVE 7 TO TEXTO (um literal numérico para um campo X) só dá um aviso do -Wall: warning: alphanumeric value is expected.

### MOVE de grupos

Um grupo é sempre tratado como texto, mesmo que tenha campos numéricos lá dentro. Se os dois grupos têm o mesmo desenho, copia bem; se não, os bytes passam sem conversão e os campos ficam desalinhados:

    01  GRUPO-A.
        05  A-ID        PIC 9(03)    VALUE 4.
        05  A-NOME      PIC X(10)    VALUE "Bluetooth".
        05  A-PRECO     PIC 9(03)V99 VALUE 49.90.
    01  GRUPO-C.
        05  C-TEXTO     PIC X(08).
        05  C-NUMERO    PIC 9(07).

    A para B (mesmo desenho): [004Bluetooth 04990]
    A para C (desenho diferente): [004Bluetooth 04]
        C-TEXTO  [004Bluet]
        C-NUMERO [ooth 04]
        C-NUMERO NAO e NUMERIC

O C-NUMERO ficou com letras e um espaço dentro de um campo numérico. Pior: MOVE SPACES TO grupo também enche de espaços os campos numéricos, e IF B-ID IS NUMERIC passa a dar falso. Para limpar um grupo com campos de vários tipos usa INITIALIZE, que põe os numéricos a zero e os de texto a espaços: o grupo B ficou [000          00000].

### MOVE CORRESPONDING

MOVE CORRESPONDING origem TO destino (ou MOVE CORR) copia só os campos que têm o mesmo nome nos dois grupos, cada um com a conversão do seu tipo, qualquer que seja a ordem. Os campos que só existem de um dos lados não são tocados. Em mover.cob, ENC-ENTRADA tem ID-ENC PIC 9(04), CLIENTE-ID PIC 9(03) e ESTADO PIC X(10); ENC-SAIDA tem os mesmos nomes por outra ordem (ESTADO X(12) e ID-ENC 9(06)) e mais um campo SO-NA-SAIDA.

    MOVE CORRESPONDING ENC-ENTRADA TO ENC-SAIDA
    DISPLAY "ID-ENC     : [" ID-ENC OF ENC-SAIDA "]"

    ID-ENC     : [000012]
    CLIENTE-ID : [002]
    ESTADO     : [pendente    ]
    SO-NA-SAIDA: [---] (ficou como estava)

Quando o mesmo nome existe em dois grupos qualificas com OF (ID-ENC OF ENC-SAIDA). O ID-ENC passou de 4 para 6 dígitos com zeros à esquerda e o ESTADO de 10 para 12 caracteres com espaços à direita: cada campo seguiu a regra do seu tipo.

## Aritmética

Cada operação tem a sua instrução. Todas calculam com decimais exatos e guardam o resultado com a PICTURE do destino.

| Instrução | Exemplo | Significa |
|---|---|---|
| ADD | ADD 1 TO CONTADOR | CONTADOR = CONTADOR + 1 |
| ADD GIVING | ADD QTD CONTADOR GIVING TOTAL | TOTAL = QTD + CONTADOR |
| SUBTRACT | SUBTRACT 1 FROM CONTADOR | CONTADOR = CONTADOR - 1 |
| MULTIPLY | MULTIPLY QTD BY PRECO GIVING TOTAL | TOTAL = QTD x PRECO |
| DIVIDE | DIVIDE DIVISOR INTO DIVIDENDO GIVING Q | Q = DIVIDENDO / DIVISOR |
| COMPUTE | COMPUTE TOTAL = PRECO + IVA - DESCONTO | Expressão completa |

Sem GIVING o resultado vai para o último operando (ADD QTD CONTADOR TO CONTADOR altera CONTADOR; MULTIPLY 2 BY QTD altera QTD). Com GIVING o destino é um campo à parte e os operandos ficam intactos. DIVIDE aceita as duas ordens: DIVIDE A INTO B e DIVIDE B BY A dividem B por A. Saídas de aritmetica.cob:

    ADD QTD CONTADOR TO CONTADOR: 007
    SUBTRACT 100 FROM CONTADOR GIVING LIQUIDO: -0000094.00
    QTD x PRECO GIVING TOTAL: 0000149.70
    (6 x 49.90) - 10.00: 0000289.40

O COMPUTE aceita parênteses e a precedência habitual, e tem o operador de potência (duplo asterisco): COMPUTE TOTAL = 2 ** 10 deu 1024. Usa COMPUTE quando a conta tem mais de uma operação.

**ATENÇÃO:** o destino tem de caber o resultado. LIQUIDO é S9(07)V99 e recebeu -94.00: um campo sem S perde o sinal (módulo 02), por isso o dinheiro que possa ficar negativo precisa de S.

### DIVIDE com resto

DIVIDE ... GIVING quociente REMAINDER resto devolve a divisão inteira e o resto: é a ferramenta da paginação e dos ciclos «de N em N».

    DIVIDE DIVISOR INTO DIVIDENDO GIVING QUOCIENTE
           REMAINDER RESTO

    17 / 5: quociente 003 resto 002

O quociente tem a PICTURE do destino (9(03), sem decimais). Com um destino de 2 decimais, DIVIDE 17 BY 5 GIVING TOTAL deu 3.40.

### ROUNDED

Por defeito o COBOL corta as casas a mais; ROUNDED depois do destino pede o arredondamento. O IVA a 23% da linha 15 de linhas.dat (4 unidades do produto 4 a 49.90, ou seja 199.60):

    COMPUTE IVA-CORTADO = TOTAL-LINHA * TAXA-IVA
    COMPUTE IVA ROUNDED = TOTAL-LINHA * TAXA-IVA

    IVA sem ROUNDED : 0000045.90
    IVA com ROUNDED : 0000045.91

199.60 x 0.23 dá 45.908: sem ROUNDED guardou 45.90, com ROUNDED 45.91. Numa fatura, esse cêntimo é a diferença entre um total certo e um errado. Experimentei também modos: ROUNDED MODE IS NEAREST-EVEN deu 2 para 2.5 (o ROUNDED simples deu 3) e ROUNDED MODE IS TRUNCATION corta. Confirma na documentação do teu compilador os modos que ele aceita.

### ON SIZE ERROR: o estouro silencioso

Quando o resultado não cabe no destino, sem proteção não acontece nada: o valor é cortado e o programa segue. Com PEQUENO PIC 99 a valer 99, ADD 1 TO PEQUENO deixou 00. Com ON SIZE ERROR o programa apanha o estouro, o destino fica como estava e podes reagir; NOT ON SIZE ERROR corre no caso contrário. A instrução fecha com END-ADD, END-COMPUTE, END-DIVIDE...

    ADD 1 TO PEQUENO
        ON SIZE ERROR
            DISPLAY "Estouro apanhado, PEQUENO fica: " PEQUENO
        NOT ON SIZE ERROR
            DISPLAY "Somou bem: " PEQUENO
    END-ADD

    Estouro apanhado, PEQUENO fica: 99

A divisão por zero é igual. Sem a cláusula, DIVIDE ZERO INTO 17 GIVING Q deixou Q com o valor que já tinha (555) e terminou com código 0, sem mensagem. Com ON SIZE ERROR obtive «Divisao por zero apanhada».

**ATENÇÃO:** em COBOL as contas não falham de forma visível. Em qualquer cálculo em que o resultado possa não caber, ou o divisor possa ser zero, escreve ON SIZE ERROR.

## Condições com IF

A forma completa é IF condição ... ELSE ... END-IF. Usa sempre o END-IF e deixa o ponto final para o fim do parágrafo: um ponto fecha todos os IF abertos.

    IF PRO-STOCK > 0
        DISPLAY "Ha stock: " PRO-STOCK
    ELSE
        DISPLAY "Sem stock"
    END-IF

Os operadores relacionais escrevem-se por símbolo ou por extenso: = (EQUAL TO), > (GREATER THAN), < (LESS THAN), >= (GREATER THAN OR EQUAL TO), <= (LESS THAN OR EQUAL TO), e NOT = ou <> para o diferente (o GnuCOBOL aceita as duas formas). O que se compara depende dos tipos. Resultados de condicoes.cob:

| Comparação | Resultado |
|---|---|
| 49.90 = 49.9 (campos numéricos com casas diferentes) | Iguais: comparam-se pelo valor |
| X(10) e X(06) ambos com «Lisboa» | Iguais: o mais curto é completado com espaços |
| «Lisboa» e «lisboa» | Diferentes: as maiúsculas contam |
| Campos de texto «9 » e «10» | O 9 é maior (compara-se carácter a carácter) |
| Campos numéricos 9 e 10 | O 9 é menor |

**ATENÇÃO:** o último par é a armadilha clássica. Números comparam-se como números; texto compara-se como texto, da esquerda para a direita. Se lês dígitos de um ficheiro para campos X, passa-os para um campo numérico (MOVE) antes de os comparar.

### Condições de classe e de nível 88

IS NUMERIC e IS ALPHABETIC testam o conteúdo de um campo. NUMERIC aceita só dígitos; ALPHABETIC aceita letras e espaços. Usa-os para validar o que vem de fora antes de calcular com isso.

    IF CODIGO IS NUMERIC
        DISPLAY "e numerico"
    ELSE
        DISPLAY "NAO e numerico"
    END-IF

    12A4 NAO e numerico
    1204 e numerico
    Ana Maria e alfabetico (espacos contam)
    Bloco 7 NAO e alfabetico

As condições de nível 88 (módulo 02) usam-se como perguntas de sim ou não e aceitam intervalos com THRU. A classificação do stock da loja fica auto-explicativa:

    01  PRO-STOCK           PIC 9(05)    VALUE 15.
        88  SEM-STOCK                    VALUE 0.
        88  STOCK-BAIXO                  VALUE 1 THRU 19.
        88  STOCK-NORMAL                 VALUE 20 THRU 99999.

    IF SEM-STOCK ... ELSE IF STOCK-BAIXO ...

    classe: stock baixo

### AND, OR e NOT

Liga condições com AND, OR e NOT. O AND liga mais forte do que o OR (o exemplo seguinte mostra-o) e os parênteses tiram dúvidas. Com PRO-CATEGORIA a 1 e PRO-STOCK a 15 (SEM-STOCK é falso):

    IF PRO-CATEGORIA = 1 OR PRO-CATEGORIA = 2 AND SEM-STOCK
    IF (PRO-CATEGORIA = 1 OR PRO-CATEGORIA = 2) AND SEM-STOCK

    sem parenteses: verdadeiro
    com parenteses: falso

Na primeira lê-se «categoria 1, ou (categoria 2 e sem stock)»: a categoria é 1, logo é verdadeira. Na segunda exige-se também SEM-STOCK, que é falso. Usa parênteses sempre que misturas AND e OR. O COBOL aceita também condições abreviadas, em que o sujeito se repete sozinho (IF PRO-STOCK > 0 AND < 20; IF PRO-CATEGORIA = 1 OR 2): funcionam, mas confundem à primeira leitura.

## EVALUATE: o switch do COBOL

EVALUATE escolhe entre vários casos e é mais legível do que uma cascata de IF. Em avaliar.cob:

    EVALUATE PRO-CATEGORIA
        WHEN 1
            MOVE "Livros" TO NOME-CAT
        WHEN 2
            MOVE "Eletronica" TO NOME-CAT
        WHEN OTHER
            MOVE "(desconhecida)" TO NOME-CAT
    END-EVALUATE

- Não há queda nem break: só corre o primeiro WHEN verdadeiro. Com WHEN PRO-STOCK > 0 seguido de WHEN PRO-STOCK > 10 e stock 15, só correu o primeiro.
- Dois WHEN seguidos partilham as instruções que vêm a seguir: WHEN "pendente" e WHEN "enviada" deram ambos «em curso».
- WHEN 1 THRU 19 aceita um intervalo (extremos incluídos). WHEN OTHER apanha o resto; sem ele, um valor que nenhum WHEN cubra não faz nada (testado: o programa seguiu em frente sem aviso).
- EVALUATE TRUE substitui o IF encadeado, com uma condição completa em cada WHEN. Com ALSO testas dois sujeitos de uma vez.

    EVALUATE TRUE
        WHEN PRO-STOCK = 0
            DISPLAY "esgotado"
        WHEN PRO-STOCK < 20 AND PRO-PRECO > 40
            DISPLAY "stock baixo num produto caro"
        WHEN OTHER
            DISPLAY "stock normal"
    END-EVALUATE

    EVALUATE PRO-CATEGORIA ALSO TRUE
        WHEN 2 ALSO PRO-STOCK < 20
            DISPLAY "eletronica com stock baixo"

    stock baixo num produto caro
    eletronica com stock baixo

**NOTA:** as mensagens movidas para campos X trazem espaços à direita («Eletronica     »): um campo de texto tem sempre o tamanho todo.

## PERFORM: repetir e chamar

O PERFORM é a instrução de repetição e também a de chamada a um parágrafo. Em repetir.cob executei todas as formas:

| Forma | Efeito |
|---|---|
| PERFORM PARAGRAFO | Executa o parágrafo uma vez e volta |
| PERFORM A THRU C | Executa do parágrafo A ao C, pela ordem em que estão escritos |
| PERFORM PARAGRAFO 3 TIMES | Repete 3 vezes |
| PERFORM UNTIL condição | Repete até a condição ser verdadeira |
| PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5 | Ciclo com contador |
| PERFORM ... END-PERFORM | Forma inline: o corpo está dentro da instrução |

A forma inline é a mais usada nos ciclos curtos; com parágrafo é melhor quando o corpo é grande ou se reutiliza.

    PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5
        ADD STOCK-PRODUTO(I) TO SOMA
    END-PERFORM

    total 00205, I no fim: 06

O ciclo terminou com I a valer 6: o contador chega ao valor que torna a condição verdadeira. VARYING também chama parágrafos (PERFORM MOSTRAR-I VARYING I FROM 10 BY -5 UNTIL I < 1 mostrou 10 e 5) e AFTER acrescenta um ciclo interior, que roda mais depressa:

    PERFORM VARYING I FROM 1 BY 1 UNTIL I > 2
            AFTER J FROM 1 BY 1 UNTIL J > 3
        DISPLAY "I=" I " J=" J
    END-PERFORM

    I=01 J=01 ... I=01 J=03, I=02 J=01 ... I=02 J=03   (6 voltas)

### TEST BEFORE e TEST AFTER

Por defeito a condição UNTIL é testada antes de cada volta (TEST BEFORE), como o while. Com WITH TEST AFTER é testada depois, como o do-while: o corpo corre pelo menos uma vez. Com I a 9 e a condição I > 3 logo verdadeira:

    TEST BEFORE correu 00 vezes
    TEST AFTER correu 01 vezes

**ATENÇÃO:** o PERFORM UNTIL não protege contra ciclos infinitos: se nada no corpo muda a condição, o programa nunca termina. Confirma sempre que o contador avança.

## Parágrafos e secções

A PROCEDURE DIVISION organiza-se em parágrafos (um nome na área A seguido de ponto) e, opcionalmente, em secções (SECTION) que agrupam parágrafos. O PERFORM de uma secção executa todos os parágrafos que ela contém, pela ordem. Em seccoes.cob a secção PREPARAR tem dois parágrafos e o PERFORM PREPARAR correu os dois:

    PRINCIPAL SECTION.
    INICIO.
        PERFORM PREPARAR
        PERFORM PROCESSAR
        PERFORM TERMINAR
        STOP RUN.
    PREPARAR SECTION.
    PREP-ZERAR.
        ...
    PREP-AVISAR.
        ...

    principal: INICIO
      preparar: zerar o total
      preparar: segundo paragrafo da mesma seccao
      processar: somar
      terminar: total 00010

Neste curso usamos parágrafos simples; as secções aparecem em código legado e convém reconheceres a sintaxe.

**ATENÇÃO:** o fluxo não pára no fim de um parágrafo: cai no seguinte. Em queda.cob o PRINCIPAL chama o AUXILIAR com PERFORM e não tem STOP RUN:

    no principal
    no auxiliar
    no auxiliar
    no perigoso (ninguem o chamou)

O AUXILIAR correu duas vezes (PERFORM e queda) e o PERIGOSO correu sem ninguém o chamar. A regra: o parágrafo principal acaba sempre com STOP RUN (ou GOBACK) e cada parágrafo faz uma só coisa.

## GO TO e porque se evita

GO TO salta para um parágrafo e não volta. Em salto.cob escrevi o mesmo ciclo com GO TO (dois parágrafos, um teste e um salto para trás) e com PERFORM VARYING (quatro linhas em linha reta). Ambos mostraram volta 01, 02 e 03.

    CICLO.
        IF I > 3
            GO TO FIM-CICLO
        END-IF
        DISPLAY "volta " I
        ADD 1 TO I
        GO TO CICLO.
    FIM-CICLO.

O problema é que o fluxo deixa de ler-se de cima para baixo: o leitor segue os saltos de cabeça e uma alteração num ponto parte outro. Há duas formas que ainda vês em código real:

- GO TO A B C DEPENDING ON campo: salta para o 1.º, 2.º ou 3.º parágrafo conforme o valor (com OPCAO a 2 correu a ação 2; com 5 não saltou e seguiu para a instrução seguinte). Hoje faz-se com EVALUATE.
- GO TO para o último parágrafo de um PERFORM THRU, para sair mais cedo de uma validação. É o uso mais tolerado: o salto não sai do bloco que o PERFORM delimita.

    PERFORM VALIDAR THRU VALIDAR-SAIDA
    VALIDAR.
        IF PRO-STOCK = 0
            GO TO VALIDAR-SAIDA
        END-IF
        ...
    VALIDAR-SAIDA.
        EXIT.

EXIT é uma instrução que não faz nada: serve só para o último parágrafo ter conteúdo. Em código novo usa IF, EVALUATE e PERFORM.

## Estrutura de um programa legível

O primeiro parágrafo diz o que o programa faz, em poucas linhas, e chama os outros pela ordem; cada parágrafo faz uma coisa e tem um nome que a descreve. Uma convenção comum é numerar os parágrafos (0000, 1000, 1100...): a numeração mostra a hierarquia. O programa loja.cob calcula a encomenda 8 com IVA a 23% e classifica o stock dos 10 produtos:

    0000-PRINCIPAL.
        PERFORM 1000-CALCULAR-ENCOMENDA
        PERFORM 2000-CLASSIFICAR-STOCK
        PERFORM 3000-MOSTRAR-RESUMO
        STOP RUN.
    1100-CALCULAR-LINHA.
        COMPUTE WS-LINHA-TOTAL =
                LIN-QTD(WS-INDICE) * LIN-PRECO(WS-INDICE)
        COMPUTE WS-LINHA-IVA ROUNDED =
                WS-LINHA-TOTAL * WS-IVA-TAXA
            ON SIZE ERROR
                DISPLAY "IVA nao cabe na linha " WS-INDICE
        END-COMPUTE
        ADD WS-LINHA-TOTAL TO WS-SOMA-SEM-IVA
        ADD WS-LINHA-IVA   TO WS-SOMA-IVA
        ...

    produto 001 qtd 001 total 0000012.90 iva 0000002.97
    produto 002 qtd 002 total 0000037.00 iva 0000008.51
    produto 004 qtd 004 total 0000199.60 iva 0000045.91
    Sem IVA : 0000249.50
    IVA 23% : 0000057.39
    Com IVA : 0000306.89
    esgotados: 01
    baixos   : 03
    normais  : 06

O 1000-CALCULAR-ENCOMENDA percorre as 3 linhas com PERFORM VARYING e chama o 1100 por cada uma. O 2000-CLASSIFICAR-STOCK percorre os 10 stocks (40, 25, 10, 30, 100, 0, 15, 8, 20 e 200) e um EVALUATE TRUE com os três 88 incrementa o contador certo: 1 esgotado (o teclado), 3 baixos (10, 15 e 8) e 6 normais.

**NOTA:** os valores aparecem com zeros à esquerda e ponto (0000249.50) porque ainda não sabemos formatar: as máscaras de edição são o módulo 05. Ler linhas.dat e produtos.dat em vez de escrever os valores no programa é o módulo 04.

## Exercícios

**PRATICAR:** faz os exercícios 9 a 12 do módulo de exercícios (11-Exercicios-Praticos): o total da linha com IVA e o estouro, os portes por escalão com EVALUATE, a validação com NUMERIC e MOVE CORRESPONDING, e a paginação com DIVIDE REMAINDER.

## Fontes oficiais

- GnuCOBOL 3.2, manual do programador (instruções, ROUNDED, ON SIZE ERROR, opções do compilador): https://gnucobol.sourceforge.io/doc/gnucobol.html
- GnuCOBOL, Programmer's Guide (HTML): https://gnucobol.sourceforge.io/HTML/gnucobpg.html
- IBM Enterprise COBOL for z/OS 6.4, instrução MOVE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-move-statement
- IBM Enterprise COBOL for z/OS 6.4, instrução COMPUTE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-compute-statement
- IBM Enterprise COBOL for z/OS 6.4, instrução DIVIDE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-divide-statement
- IBM Enterprise COBOL for z/OS 6.4, instrução IF (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-if-statement
- IBM Enterprise COBOL for z/OS 6.4, instrução EVALUATE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-evaluate-statement
- IBM Enterprise COBOL for z/OS 6.4, instrução PERFORM (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-perform-statement
- IBM Enterprise COBOL for z/OS 6.4, instrução GO TO (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statements-go-statement
