# 02 Dados e PICTURE

Em COBOL os dados não têm «tipos» como em Delphi ou JavaScript: cada campo tem uma descrição de tamanho e de forma, a PICTURE, e é essa descrição que decide quantos bytes ocupa, o que aceita e como aparece. Neste módulo aprendes a descrever dados (níveis, PICTURE, VALUE, nível 88, USAGE, REDEFINES, tabelas), vês o que acontece quando um valor não cabe e lês os clientes da loja para uma estrutura de grupo. Todas as saídas foram obtidas com o GnuCOBOL 3.2.0 (imagem Docker est-cb-gnucobol:estudo).

**NOTA:** os exemplos estão em 02-Dados-e-PICTURE/exemplos/. Para os correres copia o ficheiro .cob para uma pasta tua e usa o comando do módulo 00 (cobc -x -o programa programa.cob e depois ./programa). O programa cliente.cob precisa também do ficheiro clientes.dat, que está em 00-Introducao/dados/: copia-o para a mesma pasta.

## Números de nível

A WORKING-STORAGE SECTION descreve a memória do programa. Cada linha começa por um número de nível que diz o lugar do campo na hierarquia.

| Nível | Para quê |
|---|---|
| 01 | Registo ou item independente: o topo de uma estrutura, a começar na área A (coluna 8) |
| 02 a 49 | Subordinados: quanto maior o número, mais fundo na hierarquia (usa-se 05, 10, 15 para deixar espaço) |
| 66 | RENAMES, agrupa campos por outro nome (raro; não é usado neste curso) |
| 77 | Item elementar independente, que não faz parte de nenhum grupo |
| 88 | Nome de condição: dá nome a um valor (ou lista de valores) de um campo |

Um item que tem subordinados é um item de grupo; um item sem subordinados é um item elementar, e só este tem PICTURE. O grupo comporta-se sempre como texto (alfanumérico), mesmo que todos os filhos sejam numéricos, e o seu tamanho é a soma dos filhos.

    01  WS-PRODUTO.
        05  PRO-ID          PIC 9(03)    VALUE 4.
        05  PRO-NOME        PIC X(25)
                            VALUE "Auscultadores Bluetooth".
        05  PRO-CATEGORIA   PIC 9(02)    VALUE 2.
        05  PRO-PRECO       PIC 9(05)V99 VALUE 49.90.
        05  PRO-STOCK       PIC 9(05)    VALUE 30.

Aqui WS-PRODUTO é o grupo e os cinco campos são elementares. FUNCTION LENGTH(WS-PRODUTO) devolveu 42 bytes: 3 + 25 + 2 + 7 + 5. Repara que a vírgula do preço não ocupa nada.

## PICTURE: a forma do campo

A cláusula PICTURE (ou PIC) descreve, símbolo a símbolo, o que o campo guarda. Um símbolo repetido pode escrever-se com parênteses: PIC 9(05) é o mesmo que PIC 99999.

| Símbolo | Significado | Exemplo | Guarda |
|---|---|---|---|
| 9 | Um dígito | PIC 9(03) | 001 a 999 |
| X | Qualquer carácter | PIC X(20) | Texto de 20 caracteres |
| A | Letra ou espaço | PIC A(10) | Cidade «Lisboa» com espaços à direita |
| S | Sinal (não ocupa espaço extra por defeito) | PIC S9(03) | -999 a +999 |
| V | Vírgula decimal implícita (não ocupa espaço) | PIC 9(05)V99 | Preço com 2 casas |

O V é só uma marca para o compilador: o ficheiro de preços guarda 0004990 e o programa sabe que os dois últimos dígitos são os cêntimos. No preço da loja, 9(05)V99 ocupa 7 bytes e vai de 0 a 99999.99. Executei PIC 999 e PIC 9(3) e ambos ocupam 3 bytes: é a mesma PICTURE escrita de duas formas.

**NOTA:** ao fazer DISPLAY de um campo com V, o GnuCOBOL 3.2.0 mostra o ponto (00049.90). No ficheiro .dat o ponto não existe. O ponto que aparece é só a apresentação: formatar valores com vírgula, zeros à esquerda suprimidos e símbolo de moeda (as PICTURE de edição) fica para o módulo 05.

## VALUE e constantes figurativas

VALUE dá o valor inicial ao campo quando o programa arranca. Sem VALUE, o conteúdo inicial não deve ser assumido: inicializa sempre o que vais usar.

Para preencher campos há as constantes figurativas, palavras que valem um valor repetido tantas vezes quantas as que o campo precisar:

| Constante | Valor |
|---|---|
| SPACES | Espaços (em campos alfanuméricos) |
| ZEROS (ZERO, ZEROES) | Zeros |
| HIGH-VALUES | O maior valor de carácter, o byte hexadecimal FF |
| LOW-VALUES | O menor valor de carácter, o byte 00 |
| ALL "-" | O literal repetido: ALL "-" enche o campo de hífenes |

    01  WS-LIMPOS.
        05  LIMPO-TEXTO     PIC X(05)    VALUE SPACES.
        05  LIMPO-NUMERO    PIC 9(05)    VALUE ZEROS.
        05  LIMPO-ALTO      PIC X(03)    VALUE HIGH-VALUES.
        05  LIMPO-TRACOS    PIC X(10)    VALUE ALL "-".

    Limpos  : [     ] [00000] [----------]
    HIGH-VALUES em hexadecimal: FFFFFF

Os HIGH-VALUES servem para marcar «depois de tudo» em comparações e em fusões de ficheiros: nenhum texto normal é maior do que eles.

**ATENÇÃO:** o compilador avisa, mas não pára, quando o VALUE não cabe ou não combina com a PICTURE. Compilei três linhas erradas (VALUE 12345 em PIC 9(03), VALUE "ABC" em PIC 9(03) e VALUE 7 em PIC X(03), em avisos.cob) e obtive:

    avisos.cob:5: warning: value size exceeds data size [-Wothers]
    avisos.cob:6: warning: numeric value is expected [-Wothers]
    avisos.cob:7: warning: alphanumeric value is expected [-Wothers]

Um aviso do compilador em dados quase sempre é um erro teu: lê-os.

## Condições de nível 88

O nível 88 dá nome a um valor de um campo. Em vez de comparar IF ENC-ESTADO = "entregue" por todo o lado, defines o nome uma vez, junto ao campo, e o resto do programa fala a língua do negócio. Um 88 não ocupa memória e não tem PICTURE: pertence ao campo imediatamente acima.

    05  ENC-ESTADO      PIC X(10)    VALUE "enviada".
        88  ENC-PENDENTE             VALUE "pendente".
        88  ENC-ENVIADA              VALUE "enviada".
        88  ENC-ENTREGUE             VALUE "entregue".
        88  ENC-FECHADA              VALUE "entregue"
                                           "cancelada".

    IF ENC-ENVIADA
        DISPLAY "A encomenda " ENC-ID " esta enviada"
    END-IF
    IF NOT ENC-FECHADA
        DISPLAY "Ainda nao esta fechada"
    END-IF
    SET ENC-ENTREGUE TO TRUE

    A encomenda 0006 esta enviada
    Ainda nao esta fechada
    Depois do SET: [entregue  ]
    Agora esta fechada

O nome de condição é verdadeiro quando o campo tem um dos valores listados (ENC-FECHADA aceita dois). SET nome TO TRUE faz o contrário: escreve no campo o primeiro valor do 88. As instruções IF e as condições completas são tema do módulo 03; aqui basta saberes que um 88 se usa como se fosse uma pergunta de sim ou não.

## USAGE: como o número é guardado

A cláusula USAGE diz como o campo é representado na memória. A PICTURE continua a dizer quantos dígitos tem; o USAGE decide quantos bytes ocupa e em que forma.

| USAGE | Forma | Para quê |
|---|---|---|
| DISPLAY (por defeito) | Um carácter por dígito | Dados que se mostram ou vêm de ficheiros de texto |
| COMP, COMPUTATIONAL, BINARY | Inteiro binário | Contadores, índices e cálculos rápidos |
| COMP-3, PACKED-DECIMAL | Decimal empacotado: dois dígitos por byte | Dinheiro e quantidades decimais |
| COMP-1, COMP-2 | Vírgula flutuante simples e dupla | Cálculo científico, não dinheiro |

O programa usage.cob mede e mostra cada um:

    --- Tamanho em bytes (FUNCTION LENGTH) ---
    9(09) DISPLAY      : 9
    9(09) COMP         : 4
    9(09) COMP-3       : 5
    COMP-1 (simples)   : 4
    COMP-2 (dupla)     : 8
    --- Os bytes guardados (hexadecimal) ---
    DISPLAY  : 313233343536373839
    COMP     : 075BCD15
    COMP-3   : 123456789F
    -49.90 DISPLAY : 30303034393970
    -49.90 COMP-3  : 0004990D

Lê assim: em DISPLAY cada dígito é um byte (o carácter 1 é o byte hexadecimal 31). Em COMP o número é um inteiro binário (hexadecimal 075BCD15 é 123456789; aqui, com o byte mais significativo primeiro). Em COMP-3 cada byte guarda dois dígitos, e o último meio-byte guarda o sinal: F num número sem sinal, D num negativo (no exemplo, 0004990D é -49.90). Daí a conta: o tamanho de um COMP-3 é (dígitos + 1) a dividir por 2, arredondado para cima.

O tamanho do COMP segue a PICTURE. Com a configuração por defeito do GnuCOBOL 3.2.0 (binary-size 1-2-4-8, confirmada no manual) executei 9(02) = 1 byte, 9(04) = 2, 9(05) e 9(09) = 4, 9(10) e 9(18) = 8.

Estes tamanhos são os do GnuCOBOL com a configuração por defeito. Em compiladores de mainframe (IBM Enterprise COBOL) a regra é parecida, mas não a executei: confirma-a na documentação do compilador que usares.

## Porque o dinheiro é decimal e nunca vírgula flutuante

Os números de vírgula flutuante (COMP-1 e COMP-2) guardam valores em binário, e muitas frações decimais simples, como 0,10, não têm representação binária exata. O erro é pequeno, mas acumula-se. Somei 0,10 dez vezes de duas maneiras:

    ADD 0.1 TO F-DUPLA       (F-DUPLA é COMP-2)
    ADD 0.10 TO D-TOTAL      (D-TOTAL é PIC 9(03)V99)

    --- Somar 0.10 dez vezes ---
    COMP-2 (virgula flutuante): 0.9999999999999998
    9(03)V99 (decimal)        : 001.00
    COMP-2 menos 1 (devia ser 0): -2.220446049250313E-16

A soma decimal dá 1,00 exatos. A soma em vírgula flutuante dá 0,9999999999999998: falta uma migalha. Num total de uma fatura, numa reconciliação com o banco ou num somatório de milhares de linhas, essa migalha vira uma diferença de cêntimos que ninguém consegue explicar.

Repara ainda que no GnuCOBOL 3.2.0 a comparação F-DUPLA = 1.0 deu verdadeiro neste teste (COMP-2 igual a 1.0: sim), apesar da diferença acima: não confies em comparações com flutuantes.

A regra do COBOL, e de qualquer sistema financeiro, é guardar dinheiro como inteiro de cêntimos ou como decimal com casas fixas (PIC S9(05)V99, em DISPLAY ou COMP-3). Cada dígito é exato, e a soma de dez parcelas de 0,10 dá 1,00.

## REDEFINES: a mesma memória, duas vistas

REDEFINES dá um segundo nome e uma segunda estrutura à mesma zona de memória. Não cria bytes novos. O caso típico é partir um campo composto, como a data de registo do cliente (AAAAMMDD):

    01  CLI-DATA-REGISTO    PIC 9(08) VALUE 20240115.
    01  CLI-DATA-PARTES REDEFINES CLI-DATA-REGISTO.
        05  CLI-ANO         PIC 9(04).
        05  CLI-MES         PIC 9(02).
        05  CLI-DIA         PIC 9(02).

    Data: 20240115
    Ano=2024 Mes=01 Dia=15

**ATENÇÃO:** o REDEFINES tem de vir logo a seguir ao item que redefine (se puseres outro campo pelo meio, o compilador recusa: «REDEFINES must follow the original definition»). Escrever num dos nomes altera o outro, porque a memória é a mesma.

## Tabelas com OCCURS

OCCURS repete um campo (ou um grupo) um número fixo de vezes: é o array do COBOL. Os elementos acedem-se com o nome seguido do número entre parênteses, e a contagem começa em 1, não em 0.

    01  TAB-CATEGORIAS.
        05  CATEGORIA OCCURS 3 TIMES INDEXED BY IX-CAT.
            10  CAT-ID      PIC 9(02).
            10  CAT-NOME    PIC X(15).

A tabela tem 3 elementos de 17 bytes. Um truque clássico é construir uma tabela de constantes juntando VALUE, REDEFINES e OCCURS: escrevem-se os valores em linhas FILLER e depois redefine-se o grupo como tabela. Foi assim que fiz a tabela dos 12 meses (9 bytes cada, 108 no total) e usei o mês do cliente como subscrito:

    DISPLAY "Registou-se em " CLI-DIA " de "
            NOME-MES(CLI-MES) "de " CLI-ANO

    Registou-se em 15 de Janeiro  de 2024

Há duas formas de endereçar um elemento:

| Forma | Declaração | Uso |
|---|---|---|
| Subscrito | Um campo numérico qualquer, por exemplo PIC 9(02) | CAT-NOME(WS-SUBSCRITO) |
| Índice | INDEXED BY IX-CAT no OCCURS | CAT-NOME(IX-CAT) |

O subscrito é um número que o programa calcula como qualquer outro. O índice é um campo especial, criado pelo compilador (não tem PICTURE), que guarda a posição da tabela. Só se altera com SET:

    SET IX-CAT TO 1
    DISPLAY "Primeira: " CAT-NOME(IX-CAT)
    SET IX-CAT UP BY 2
    DISPLAY "Depois de UP BY 2: " CAT-NOME(IX-CAT)
    SET IX-CAT DOWN BY 1
    DISPLAY "Depois de DOWN BY 1: " CAT-NOME(IX-CAT)
    SET WS-SUBSCRITO TO IX-CAT

    Primeira: Livros
    Depois de UP BY 2: Casa
    Depois de DOWN BY 1: Eletronica
    Posicao do indice como numero: 02

SET IX TO 1 posiciona o índice, UP BY e DOWN BY somam e subtraem, e SET número TO índice converte o índice para um campo numérico normal. Para percorrer a tabela com um subscrito usei PERFORM VARYING (matéria do módulo 03): o exemplo imprime 01: 01 Livros, 02: 02 Eletronica e 03: 03 Casa.

**ATENÇÃO:** por defeito o compilador não verifica se o subscrito está dentro da tabela. Em limites.cob a tabela tem 3 elementos e pedi o 4.º: sem opções o programa não protestou, imprimiu bytes de memória vizinha (sete bytes a zero) e terminou com código 0. Compilado com -debug o mesmo programa pára com o erro certo:

    libcob: limites.cob:15: error: subscript of 'DIA-NOME' out of bounds: 4
    note: maximum subscript for 'DIA-NOME': 3

Um erro silencioso destes é pior do que um erro com mensagem. A depuração fica para o módulo 08; por agora, guarda o -debug para quando um programa se portar de forma estranha.

## Campos com sinal

Com S na PICTURE o campo guarda o sinal. Em DISPLAY o sinal não ocupa um byte extra: vai misturado no último dígito (a «sobreposição»). Em truncar.cob guardei -42 num campo S9(03):

    01  SALDO           PIC S9(03)     VALUE -42.
    01  SALDO-BRUTO     REDEFINES SALDO PIC X(03).
    01  SALDO-SEP       PIC S9(03) SIGN IS LEADING SEPARATE
                                       VALUE -42.

    S9(03) com -42, DISPLAY : -042
    S9(03) com -42, bytes   : [04r] 303472
    SIGN LEADING SEPARATE   : -042

O DISPLAY do GnuCOBOL mostra -042, mas o que está lá guardado são os bytes 30 34 72: o carácter r (hexadecimal 72) é o último dígito, 2, marcado como negativo. Com SIGN IS LEADING SEPARATE CHARACTER o sinal passa a ocupar um byte próprio, à frente. Quem lê um ficheiro de largura fixa tem de saber qual das duas formas foi usada para o escrever.

Sem S, o sinal perde-se. Executei MOVE -42 TO SEM-SINAL (PIC 9(03)) e ficou 042: o valor absoluto. E com um campo S9(03), -42 + 100 deu +058 (o GnuCOBOL mostra o + nos positivos).

**ATENÇÃO:** um campo de dinheiro que possa ficar negativo (um saldo, uma nota de crédito) tem de ter S na PICTURE. Sem ele o -49.90 vira 49.90 sem qualquer aviso.

## Truncamento ao mover

Mover um valor para um campo mais pequeno não dá erro: o COBOL corta. E corta de forma diferente em texto e em números:

| Tipo | Regra do MOVE |
|---|---|
| Texto (X) | Alinha à esquerda; corta à direita o que não cabe; preenche com espaços o que sobra |
| Número | Alinha pela vírgula decimal; corta à esquerda os dígitos inteiros que não cabem e à direita as casas a mais (sem arredondar); preenche com zeros o resto |

Resultados obtidos com NUM-ORIGEM PIC 9(05)V99 a valer 12345.67 e TXT-ORIGEM com «Auscultadores Bluetooth»:

    Origem 9(05)V99         : 12345.67
    Para 9(03)              : 345
    Para 9(03)V9            : 345.6
    Para 9(07)V9999         : 0012345.6700
    99 + 1 em PIC 99        : 00
    Para X(10)  : [Auscultado]
    Para X(30)  : [Auscultadores Bluetooth       ]

Repara em quatro coisas. Primeiro, 12345.67 em 9(03) ficou 345: perdeu os dígitos mais importantes, o que é um erro muito mais grave do que perder os menos importantes. Segundo, em 9(03)V9 as casas decimais foram cortadas (.67 virou .6), não arredondadas. Terceiro, em ADD 1 TO CONTADOR com CONTADOR a valer 99 e PIC 99 o resultado foi 00, sem erro. Quarto, o texto cortou-se sem avisar: «Auscultadores Bluetooth» virou «Auscultado».

**ATENÇÃO:** é o contrário do que fazem as linguagens modernas, que lançam uma exceção. Em COBOL o corte é silencioso: dimensiona sempre os campos para o maior valor possível e, nos cálculos, usa ON SIZE ERROR (matéria do módulo 03) para apanhar o excesso. O resultado de 99 + 1 sem ON SIZE ERROR, aqui 00, é o do GnuCOBOL 3.2.0; confirma na documentação de cada compilador.

## Ler os registos da loja para um grupo

Juntando tudo: o registo de cliente, de largura fixa, descreve-se como um grupo. Cada campo do ficheiro vira um item elementar, e o REDEFINES parte a data. O programa cliente.cob lê clientes.dat linha a linha para REG-CLIENTE e mostra os campos. Os ficheiros (SELECT, OPEN, READ, CLOSE) são o tema do módulo 04: aqui só interessa que a linha de 71 bytes é copiada para o grupo com um MOVE.

    01  REG-CLIENTE.
        05  CLI-ID              PIC 9(03).
        05  CLI-NOME            PIC X(20).
        05  CLI-EMAIL           PIC X(30).
        05  CLI-CIDADE          PIC X(10).
        05  CLI-DATA-REGISTO    PIC 9(08).
        05  CLI-DATA-PARTES REDEFINES CLI-DATA-REGISTO.
            10  CLI-ANO         PIC 9(04).
            10  CLI-MES         PIC 9(02).
            10  CLI-DIA         PIC 9(02).

    MOVE LINHA-CLIENTE TO REG-CLIENTE
    DISPLAY "Cliente " CLI-ID ": " CLI-NOME
    DISPLAY "    cidade " CLI-CIDADE " desde "
            CLI-DIA "/" CLI-MES "/" CLI-ANO
    IF CLI-EMAIL = SPACES
        DISPLAY "    email: (sem email)"
    ELSE
        DISPLAY "    email: " CLI-EMAIL
    END-IF

    Tamanho do registo REG-CLIENTE: 71 bytes
    Cliente 001: Ana Ribeiro
        cidade Lisboa     desde 15/01/2024
        email: ana.ribeiro@exemplo.pt
    (...)
    Cliente 008: Hugo Teixeira
        cidade Lisboa     desde 20/11/2024
        email: (sem email)
    Clientes lidos: 008

Foram lidos os oito clientes (mostro só o primeiro e o último; os espaços à direita dos campos de texto fazem parte do valor). O 71 bate certo com 3 + 20 + 30 + 10 + 8, e o REDEFINES da data não aumenta o tamanho. O cliente 8, sem email, tem o campo cheio de espaços, e a comparação com SPACES apanha-o. É o equivalente COBOL do NULL do SQL: não existe «ausente», existe «em branco».

**DICA:** mantém sempre a soma dos tamanhos das PICTURE igual ao tamanho do registo do ficheiro (aqui 71). Se não bater, os campos ficam deslocados e tudo o que vem a seguir é lixo, sem erro nenhum.

## Exercícios

**PRATICAR:** faz os exercícios 5 a 8 do módulo de exercícios (11-Exercicios-Praticos): contas com PICTURE e tamanhos, um 88 para os estados da loja, a ler os produtos para um grupo e a tabela de categorias.

## Fontes oficiais

- GnuCOBOL 3.2, manual do programador (compilador, opções -debug e binary-size, tabelas de funções): https://gnucobol.sourceforge.io/doc/gnucobol.html
- GnuCOBOL, Programmer's Guide (HTML): https://gnucobol.sourceforge.io/HTML/gnucobpg.html
- GnuCOBOL, página do projeto: https://gnucobol.sourceforge.io/
- IBM Enterprise COBOL for z/OS 6.4, cláusula PICTURE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-picture-clause
- IBM Enterprise COBOL for z/OS 6.4, cláusula USAGE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-usage-clause
- IBM Enterprise COBOL for z/OS 6.4, cláusula REDEFINES (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-redefines-clause
- IBM Enterprise COBOL for z/OS 6.4, cláusula OCCURS (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-occurs-clause
- IBM Enterprise COBOL for z/OS 6.4, números de nível (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-level-numbers
- IBM Enterprise COBOL for z/OS 6.4, cláusula VALUE (não executado): https://www.ibm.com/docs/en/cobol-zos/6.4?topic=entry-value-clause
