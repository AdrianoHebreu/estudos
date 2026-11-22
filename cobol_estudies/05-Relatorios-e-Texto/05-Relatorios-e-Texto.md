# 05 Relatórios e texto

Um programa COBOL de negócio existe, na maior parte dos casos, para produzir listagens: colunas alinhadas, valores formatados, subtotais, páginas. Neste módulo aprendes a PICTURE de edição, montas o relatório «Encomendas por cliente» da loja (cabeçalho, detalhe, quebra de controlo, totais e paginação), manipulas texto (STRING, UNSTRING, INSPECT, referência por posição, funções intrínsecas) e trabalhas com datas. Todas as saídas foram obtidas com o GnuCOBOL 3.2.0 (imagem Docker est-cb-gnucobol:estudo); o aviso «Warning: program compiled against libxml 212 using older 209» que aparece ao executar é inofensivo.

**NOTA:** os exemplos estão em 05-Relatorios-e-Texto/exemplos/. Copia o .cob e os .dat de que precisas (em 00-Introducao/dados/) para uma pasta tua e usa o comando do módulo 00. Os programas leem os ficheiros pelo nome, na pasta onde corres.

## PICTURE de edição

No módulo 02 a PICTURE descrevia dados para calcular. Uma PICTURE de edição descreve dados para mostrar: tem símbolos que inserem espaços, vírgulas, sinais e zeros. Um campo editado serve para MOVE e para DISPLAY ou WRITE; para fazer contas usa sempre o campo numérico e edita só no fim.

| Símbolo | Efeito |
|---|---|
| Z | Dígito, mas um zero à esquerda vira espaço |
| * | Dígito, mas um zero à esquerda vira asterisco (cheques) |
| 9 | Dígito, mostrado sempre |
| . e , | Pontos de inserção: o separador decimal e o dos milhares |
| $ | Símbolo da moeda, flutuante (fica colado ao primeiro dígito) |
| + e - | Sinal: fixo no início ou flutuante; o - só aparece se o valor for negativo |
| CR e DB | Dois caracteres no fim, só aparecem se o valor for negativo |
| B | Insere um espaço |
| 0 | Insere um zero |
| / | Insere uma barra |

O programa editar.cob move três valores (1290.50, 12.90 e -49.90) para campos com cada PICTURE e mostra o resultado entre parênteses retos, para se verem os espaços. Cada linha da tabela foi obtida assim:

    01  WS-VALOR    PIC S9(05)V99 VALUE 1290.50.
    01  E-Z         PIC ZZ,ZZ9.99.
    ...
        MOVE WS-VALOR TO E-Z    DISPLAY "Z       [" E-Z "]"

| PICTURE | Valor | Resultado |
|---|---|---|
| ZZ,ZZ9.99 | 1290.50 | [ 1,290.50] |
| ZZ,ZZ9.99 | 0 | [     0.00] |
| **,**9.99 | 12.90 | [****12.90] |
| $$$,$$9.99 | 1290.50 | [ $1,290.50] |
| +ZZ,ZZ9.99 | -49.90 | [-    49.90] |
| ----9.99 | -49.90 | [  -49.90] |
| ZZ,ZZ9.99CR | 1290.50 | [ 1,290.50  ] |
| ZZ,ZZ9.99DB | -49.90 | [    49.90DB] |
| ZZ,ZZ9.99CR | -49.90 | [    49.90CR] |
| ZZ,ZZ9.99 BLANK WHEN ZERO | 0 | [         ] |
| 9999/99/99 | 20250110 | [2025/01/10] |
| 999B999B999 | 912345678 | [912 345 678] |
| 9(05)00 | 123 | [0012300] |

Repara em quatro coisas. O valor zero mostrou 0.00: o Z apaga os zeros à esquerda, mas o 9 antes do ponto e os dois 9 dos decimais forçam esses dígitos. BLANK WHEN ZERO apaga o campo todo quando o valor é zero. O CR e o DB deixam dois espaços quando o valor é positivo, para as colunas ficarem alinhadas. Os símbolos flutuantes ($, + e -) ocupam uma posição cada, por isso ----9.99 só tem três dígitos inteiros úteis. O 0 e o B inserem caracteres que não existem no valor: o 9(05)00 mostrou 0012300, os dois zeros finais foram acrescentados.

**ATENÇÃO:** a PICTURE tem de ter posições suficientes para o maior valor. Se não tiver, os dígitos mais à esquerda perdem-se em silêncio, tal como no módulo 02.

## Vírgula decimal e símbolo da moeda

Em Portugal o separador decimal é a vírgula. A SPECIAL-NAMES (na CONFIGURATION SECTION) troca os papéis do ponto e da vírgula, e define o símbolo da moeda. O programa vir.cob:

           SPECIAL-NAMES.
               DECIMAL-POINT IS COMMA
               CURRENCY SIGN IS "#".
           ...
           01  WS-VALOR    PIC 9(05)V99 VALUE 1290,50.
           01  E-PT        PIC ZZ.ZZ9,99.
           01  E-MOEDA     PIC ###.##9,99.

    virgula [ 1.290,50]
    moeda   [ #1.290,50]
    interno [01290,50]

Com DECIMAL-POINT IS COMMA tudo muda: o literal passa a 1290,50, a PICTURE usa o ponto para os milhares e a vírgula para o decimal, e até o DISPLAY de um campo com V mostra o separador decimal como vírgula (a última linha). O CURRENCY SIGN troca o $ por outro símbolo. A minha primeira tentativa foi com a letra E, que o compilador recusou:

    vir.cob:8: error: invalid character 'E' in currency symbol
    vir.cob:13: error: invalid PICTURE character 'E'

**NOTA:** o símbolo da moeda é um único carácter. Não testei o sinal do euro, que em UTF-8 ocupa mais do que um byte; confirma na documentação do compilador antes de o usares. Usei o # só para mostrar o mecanismo.

## Relatório de colunas: Encomendas por cliente

O relatório junta três ficheiros: clientes.dat (o nome), encomendas.dat (data e estado) e linhas.dat (preços). Desenho: (1) carregar os 8 nomes numa tabela em memória indexada pelo id do cliente; (2) ler linhas.dat uma vez, somando quantidade vezes preço numa tabela de 12 posições indexada pelo id da encomenda; (3) ler as encomendas ordenadas por cliente e imprimir detalhe, subtotal por cliente e total geral.

O passo 3 é uma quebra de controlo: um campo (o cliente) muda de valor e isso dispara uma ação (o subtotal). Só funciona se os dados estiverem ordenados pelo campo de controlo. O encomendas.dat está por número de encomenda, por isso ordenei-o por cliente com o comando sort do Linux (dentro do contentor); o módulo 06 ensina o verbo SORT do próprio COBOL. O sort é estável (-s), por isso as encomendas de um cliente mantêm a ordem original.

    sort -s -k1.5,1.7 encomendas.dat > enc-por-cli.dat

O esqueleto da quebra de controlo é sempre o mesmo (o excerto está simplificado; no ficheiro há guardas para o caso de o ficheiro vir vazio): ler o primeiro registo e guardar o valor de controlo; em cada registo, se o valor mudou, fechar o grupo anterior; processar o detalhe; no fim, fechar o último grupo.

    PRINCIPAL.
        ...
        READ ARQ-ENC AT END SET FIM-FICHEIRO TO TRUE END-READ
        MOVE ENC-CLIENTE TO WS-CLI-ANT
        PERFORM UNTIL FIM-FICHEIRO
            IF ENC-CLIENTE NOT = WS-CLI-ANT
                PERFORM IMPRIMIR-SUBTOTAL
                MOVE ENC-CLIENTE TO WS-CLI-ANT
            END-IF
            PERFORM IMPRIMIR-DETALHE
            READ ARQ-ENC AT END SET FIM-FICHEIRO TO TRUE END-READ
        END-PERFORM
        PERFORM IMPRIMIR-SUBTOTAL

O detalhe vai para um grupo com as colunas já editadas (cada MOVE aplica a edição) e é escrito com WRITE ... FROM ... AFTER ADVANCING. O total de cada encomenda usa a tabela do passo 2; as encomendas canceladas aparecem na lista mas não entram nos totais.

    01  LIN-DETALHE.
        05  DET-CLIENTE     PIC X(20).
        ...
        05  DET-DATA        PIC 9999/99/99.
        ...
        05  DET-TOTAL       PIC ZZZ.ZZ9,99.
    ...
    IMPRIMIR-DETALHE.
        IF WS-LIN >= WS-MAX-LIN
            PERFORM IMPRIMIR-CABECALHO
        END-IF
        MOVE NOME-CLI(ENC-CLIENTE) TO DET-CLIENTE
        MOVE TOTAL-ENC(ENC-ID) TO DET-TOTAL
        WRITE REG-REL FROM LIN-DETALHE AFTER ADVANCING 1 LINE
        ADD 1 TO WS-LIN
        IF ENC-ESTADO NOT = "cancelada"
            ADD TOTAL-ENC(ENC-ID) TO WS-SUB-CLI
        END-IF.

A paginação é manual: o contador WS-LIN conta as linhas já escritas na página e, quando chega ao máximo (8, para o exemplo ficar curto), imprime um novo cabeçalho com o número de página. O WS-LIN começa em 99 para forçar o cabeçalho antes da primeira linha. Na primeira página o cabeçalho usa AFTER ADVANCING 1 LINE; nas seguintes usa AFTER ADVANCING PAGE.

Resultado (cat -v relatorio.txt; o ^L é o carácter de mudança de página):

    ENCOMENDAS POR CLIENTE              Pagina   1
    Cliente              Enc   Data        Estado
    Ana Ribeiro          0001  2025/01/10  entregue        40,70
    Ana Ribeiro          0003  2025/02/02  entregue        44,50
    Ana Ribeiro          0008  2025/04/15  pendente        99,80
    Total Ana Ribeiro         .......................    185,00
    Bruno Costa          0002  2025/01/18  entregue        64,80
    Bruno Costa          0006  2025/03/22  enviada         86,89^L
    ENCOMENDAS POR CLIENTE              Pagina   2
    Cliente              Enc   Data        Estado
    (...)
    Eva Martins          0007  2025/04/01  enviada         47,50
    Total Eva Martins         .......................     47,50
    Filipe Lopes         0009  2025/04/20  pendente        35,00
    Total Filipe Lopes        .......................     35,00

    TOTAL GERAL                                          915,59

O total geral bate com a soma dos subtotais (185,00 + 296,69 + 158,90 + 192,50 + 47,50 + 35,00 = 915,59): a encomenda 4, cancelada, ficou de fora. Duas observações sobre o que o GnuCOBOL 3.2.0 escreveu, que vi no ficheiro: a primeira linha do ficheiro é uma linha em branco (o AFTER ADVANCING 1 LINE avança antes de escrever), e a mudança de página aparece como um ^L no fim da linha anterior, não numa linha própria.

**ATENÇÃO:** o primeiro erro que apanhei neste programa foi o grupo LIN-GERAL com 62 bytes escritos num registo de 60: o valor total saiu cortado («915,5») sem erro nenhum. Confere sempre que a soma das colunas não excede o tamanho do registo.

## LINAGE: a paginação feita pelo ficheiro

Em vez de contares linhas, podes declarar a página no FD com LINAGE e deixar o sistema detetar o fim de página. O programa linage.cob usa páginas de 3 linhas, escreve os clientes com WRITE ... AT END-OF-PAGE e conta as páginas:

    FD  ARQ-REL
        LINAGE IS 3 LINES.
    ...
    WRITE REG-REL FROM WS-LINHA AFTER ADVANCING 1 LINE
        AT END-OF-PAGE
            ADD 1 TO WS-PAGINAS
            DISPLAY "fim de pagina apos " L-ID
    END-WRITE.

    fim de pagina apos 003
    fim de pagina apos 006
    paginas: 02 LINAGE-COUNTER: 0000000003

O AT END-OF-PAGE dispara na última linha da página (após os clientes 3 e 6) e é aí que imprimirias o rodapé e prepararias o cabeçalho da seguinte. O LINAGE-COUNTER é um registo especial com a linha corrente da página. O LINAGE também aceita WITH FOOTING, LINES AT TOP e LINES AT BOTTOM; tentei-os e a interação entre as margens e o END-OF-PAGE não foi óbvia, por isso não os descrevo: confirma-os no manual do GnuCOBOL antes de os usares.

## STRING, UNSTRING e INSPECT

STRING junta pedaços de texto num campo; UNSTRING parte um texto em campos; INSPECT conta e substitui caracteres. O programa texto.cob usa o nome e o email da cliente 1. Em todos, DELIMITED BY diz onde cada pedaço acaba: SIZE usa o campo inteiro, SPACE corta no primeiro espaço, e um literal («  », dois espaços) corta nesse literal.

    STRING WS-NOME DELIMITED BY SPACE
        " <" DELIMITED BY SIZE
        WS-EMAIL DELIMITED BY SPACE
        ">" DELIMITED BY SIZE
        INTO WS-SAIDA
    END-STRING

    STRING 1 [Ana <ana.ribeiro@exemplo.pt>            ]
    STRING 2 [Ana Ribeiro <ana.ribeiro@exemplo.pt>    ]

Na primeira, DELIMITED BY SPACE cortou o nome em «Ana» (parou no espaço entre os dois nomes); na segunda, com dois espaços como delimitador, o nome ficou inteiro. O STRING não limpa o campo de destino: só escreve os caracteres que junta e o resto fica como estava (num teste à parte, juntar «AB» a um campo cheio de X deu «ABXXXXXXXX»). Se reutilizares o campo, faz MOVE SPACES antes.

Com WITH POINTER controlas a posição onde se começa a escrever; com ON OVERFLOW apanhas o caso de o texto não caber:

    STRING "ABC-" DELIMITED BY SIZE WS-NOME DELIMITED BY SIZE
        INTO WS-CURTO WITH POINTER WS-PTR
        ON OVERFLOW DISPLAY "STRING 3 transbordou, ponteiro " WS-PTR
    END-STRING

    STRING 3 transbordou, ponteiro 13
    STRING 3 [ABC-Ana Ribe]

O WS-CURTO tem 12 posições: o texto foi cortado e o ponteiro ficou em 13. Sem ON OVERFLOW o corte seria silencioso. O ponteiro tem de ser inicializado por ti (MOVE 1 TO WS-PTR).

O UNSTRING faz o contrário. Aqui o email é partido em «@» ou «.», para dois campos, e o TALLYING conta os campos preenchidos (o contador tem de começar a zero):

    UNSTRING WS-EMAIL DELIMITED BY "@" OR "."
        INTO WS-UTILIZADOR WS-DOMINIO
        TALLYING IN WS-N
    END-UNSTRING

    UNSTRING [ana                 ] [ribeiro             ] 02 campos

O primeiro delimitador encontrado foi o ponto de «ana.ribeiro», por isso os dois campos de destino receberam «ana» e «ribeiro», e o resto («@exemplo.pt») não coube em nenhum: perdeu-se. Um UNSTRING só preenche os campos que lhe dás. Com DELIMITED BY ALL SPACE, ALL trata vários espaços seguidos como um só delimitador (partiu «Ana Ribeiro» em «Ana» e «Ribeiro»).

O INSPECT tem três usos, todos sobre o texto «gestao de stock da loja»:

    INSPECT WS-FRASE TALLYING WS-CONTA FOR ALL "t"
    INSPECT WS-FRASE TALLYING WS-CONTA FOR CHARACTERS BEFORE INITIAL " "
    INSPECT WS-FRASE REPLACING FIRST "o" BY "0"
    INSPECT WS-FRASE REPLACING ALL "s" BY "$"
    INSPECT WS-FRASE CONVERTING "abcdefghijklmnopqrstuvwxyz"
        TO "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    t:02
    antes do 1o espaco: 06
    FIRST    [gesta0 de stock da loja ]
    ALL      [ge$ta0 de $tock da loja ]
    CONVERT  [GE$TA0 DE $TOCK DA LOJA ]

TALLYING conta e soma ao contador (num teste à parte, um contador a 5 acabou em 13 depois de 8 X; põe-no a zero tu); REPLACING troca ocorrências (FIRST a primeira, ALL todas); CONVERTING troca carácter a carácter segundo duas listas do mesmo tamanho, e é a forma clássica de passar a maiúsculas (só letras sem acento). Também testei INSPECT ... REPLACING ALL "-" BY "/" no código «A-12-B-34», que passou a «A/12/B/34».

## Referência por posição

Qualquer campo alfanumérico pode ser cortado com campo(início:comprimento), contando a partir de 1. Podes ler e escrever nessa fatia. Com o email «ana.ribeiro@exemplo.pt»:

    DISPLAY "email(1:3)  [" WS-EMAIL(1:3) "]"
    DISPLAY "email(5:7)  [" WS-EMAIL(5:7) "]"
    DISPLAY "email(12:)  [" WS-EMAIL(12:) "]"
    MOVE "XY" TO WS-EMAIL(1:2)

    email(1:3)  [ana]
    email(5:7)  [ribeiro]
    email(12:)  [@exemplo.pt        ]
    alterado    [XYa.ribeiro@exemplo.pt        ]

Sem comprimento (12:) vai até ao fim do campo. É assim que se extrai o ano de uma data AAAAMMDD guardada em texto, ou o prefixo de um código.

**ATENÇÃO:** não verifiquei o que acontece quando início e comprimento saem do campo (por exemplo, um (30:10) num campo de 30 bytes). Trata sempre de que a fatia cabe; as verificações do compilador (-debug) ficam para o módulo 08.

## Funções intrínsecas

As funções chamam-se com FUNCTION nome(argumentos) e podem aparecer onde caiba um valor. O programa funcoes.cob usa o texto «  Ana Ribeiro» (dois espaços à frente, num campo de 20) e os preços 12.90, 49.90 e 6.50:

    TRIM [Ana Ribeiro]
    REVERSE [oriebiR anA]
    NUMVAL 00012.90
    MAX 00049.90
    MIN 00006.50
    MOD 17 5  000000002
    MOD -17 5 000000003
    REM -17 5 -000000002

| Função | O que faz |
|---|---|
| LENGTH(x) | Número de bytes do campo (20 mesmo com texto mais curto) |
| TRIM(x) | Tira os espaços dos dois lados; com LEADING só do início (o que executei) |
| UPPER-CASE(x) e LOWER-CASE(x) | Maiúsculas e minúsculas |
| REVERSE(x) | Inverte o texto (aqui, depois de um TRIM, senão os espaços vão para a frente) |
| NUMVAL(x) | Converte texto em número: «12.90» deu 12.90 |
| MAX e MIN | O maior e o menor dos argumentos |
| MOD(a b) | Resto com o sinal do divisor: MOD(-17 5) deu 3 |
| REM(a b) | Resto com o sinal do dividendo: REM(-17 5) deu -2 |
| CURRENT-DATE | Data e hora atuais em 21 caracteres |

O CURRENT-DATE devolveu «2026111912435568+0000»: AAAAMMDD, HHMMSS, centésimos e desvio horário (+HHMM), neste caso do contentor. O LENGTH com TRIM devolveu 000000011 (com nove zeros), enquanto o LENGTH simples mostrou 20: o formato de saída varia entre as duas chamadas, por isso põe o resultado num campo teu e edita-o. Tentei MAX(PRECO(ALL)) para percorrer uma tabela e o compilador deu erro de sintaxe; não está validado neste módulo.

## Datas

A loja guarda datas como inteiros AAAAMMDD. As funções INTEGER-OF-DATE e DATE-OF-INTEGER convertem entre isso e um número de dias seguido (INTEGER-OF-DATE(20250110) é um inteiro cuja diferença para outro dá os dias entre as datas). O programa datas.cob lê encomendas.dat e para cada uma mostra o dia da semana (o resto da divisão do inteiro por 7 indexa uma tabela: 0 é domingo, 1 é segunda, e assim por diante) e a data de vencimento a 30 dias:

    COMPUTE WS-INTEIRO = FUNCTION INTEGER-OF-DATE(ENC-DATA)
    COMPUTE WS-DIA-SEMANA = FUNCTION MOD(WS-INTEIRO 7)
    COMPUTE WS-VENCE = FUNCTION DATE-OF-INTEGER(WS-INTEIRO + 30)
    DISPLAY ENC-ID " " WS-DATA-TXT " "
        NOME-DIA(WS-DIA-SEMANA + 1) " vence " WS-VENCE

    0001 2025/01/10 sexta   vence 20250209
    0002 2025/01/18 sabado  vence 20250217
    0003 2025/02/02 domingo vence 20250304
    (...)
    0012 2025/06/01 domingo vence 20250701

Confirmei o dia da semana com o comando date do Linux nos casos 10/01/2025 (sexta) e 01/06/2025 (domingo). O vencimento soma 30 dias reais (1 de junho mais 30 dá 1 de julho). A diferença entre datas é uma subtração; o resultado tem de caber num campo com sinal, porque a ordem trocada dá negativo:

    dias entre 2024-01-15 e 2025-01-10: +00361
    ordem trocada: -00361

Duas validações: uma data inexistente devolve zero no INTEGER-OF-DATE, e a função TEST-DATE-YYYYMMDD devolve 0 para uma data válida e outro valor para uma inválida.

    29 fev 2024:   000154557
    29 fev 2025:   000000000
    TEST-DATE 20250229: 000000003
    TEST-DATE 20240229: 000000000

**DICA:** valida as datas lidas de ficheiros antes de fazer contas com elas. Um zero silencioso do INTEGER-OF-DATE numa subtração dá um resultado absurdo e nenhum erro. O que significam os outros valores do TEST-DATE-YYYYMMDD (aqui apareceu 3 para o dia 29 de fevereiro de 2025) não o verifiquei: consulta o manual.

## Exercícios

**PRATICAR:** faz os exercícios 17 a 20 do módulo de exercícios (11-Exercicios-Praticos): uma tabela de stock formatada, fichas de cliente com STRING e UNSTRING, encomendas atrasadas com datas, e um relatório de stock por categoria com quebra de controlo e paginação.

## Fontes oficiais

- GnuCOBOL 3.2, manual do programador (instruções, funções intrínsecas, LINAGE): https://gnucobol.sourceforge.io/doc/gnucobol.html
- GnuCOBOL, Programmer's Guide (HTML): https://gnucobol.sourceforge.io/HTML/gnucobpg.html
- IBM Enterprise COBOL for z/OS 6.4, cláusula PICTURE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-picture-clause
- IBM Enterprise COBOL for z/OS 6.4, cláusula LINAGE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-linage-clause
- IBM Enterprise COBOL for z/OS 6.4, instrução WRITE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statement-write
- IBM Enterprise COBOL for z/OS 6.4, instrução STRING (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statement-string
- IBM Enterprise COBOL for z/OS 6.4, instrução UNSTRING (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=statement-unstring
- IBM Enterprise COBOL for z/OS 6.4, função INTEGER-OF-DATE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=functions-integer-date
