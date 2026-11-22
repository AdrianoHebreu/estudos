# 07 Subprogramas e modularização

Até aqui cada programa vivia sozinho num ficheiro. Os sistemas reais são conjuntos de programas pequenos que se chamam uns aos outros: um calcula o IVA, outro formata datas, outro valida emails, e vários programas principais reutilizam-nos. Neste módulo aprendes a escrever e chamar subprogramas, a passar-lhes dados (e a perceber o que cada modo de passagem faz), a tratar a falta de um módulo, a guardar estado entre chamadas e a partilhar descrições de registos com COPY. No fim montas um pequeno sistema modular com os dados da loja.

## O ambiente

Todos os exemplos foram compilados e executados com o GnuCOBOL 3.2.0 (cobc 3.2.0) na imagem est-cb-gnucobol:estudo, como nos módulos anteriores, e estão em 07-Subprogramas-e-Modularizacao/exemplos/. Os programas que usam a loja esperam, na pasta onde os corres, as subpastas dados/ e copybooks/ copiadas de 00-Introducao. Nas saídas omiti o aviso inofensivo «Warning: program compiled against libxml 212 using older 209».

## CALL: chamar outro programa

Um subprograma é um programa COBOL sem STOP RUN que termina com GOBACK e devolve o controlo a quem o chamou. O mais pequeno possível:

           IDENTIFICATION DIVISION.
           PROGRAM-ID. SAUDAR.
           PROCEDURE DIVISION.
               DISPLAY "saudar: ola do subprograma".
               GOBACK.

O programa que o chama usa CALL com o nome do programa (o PROGRAM-ID). Pode ser um literal ou o conteúdo de uma variável:

               DISPLAY "chamar: CALL com literal".
               CALL "SAUDAR".
               DISPLAY "chamar: CALL com variavel".
               CALL WS-MODULO.
               STOP RUN.

Para compilar, o primeiro ficheiro da lista é o programa principal e os restantes são juntos ao executável:

    cobc -x -o chamar chamar.cob saudar.cob
    ./chamar
    chamar: CALL com literal
    saudar: ola do subprograma
    chamar: CALL com variavel
    saudar: ola do subprograma

## Estático ou dinâmico, e como o cobc faz módulos

O cobc -m saudar.cob gera um módulo saudar.so (sem -x) que o CALL carrega em execução. Sem o módulo (nem o SAUDAR no executável), o programa arranca e só falha quando chega ao CALL:

    rm -f *.so
    cobc -x -o chamar chamar.cob
    ./chamar
    echo $?
    chamar: CALL com literal
    libcob: error: module 'SAUDAR' not found
    1

Com o módulo na mesma pasta, funciona. Se o mudares para outra pasta, só volta a funcionar se a variável de ambiente COB_LIBRARY_PATH apontar para lá:

    cobc -m saudar.cob
    mkdir lib; mv saudar.so lib
    ./chamar
    COB_LIBRARY_PATH=lib ./chamar
    chamar: CALL com literal
    libcob: error: module 'SAUDAR' not found
    chamar: CALL com literal
    saudar: ola do subprograma
    chamar: CALL com variavel
    saudar: ola do subprograma

**ATENÇÃO:** o nome do ficheiro do módulo tem de ser igual ao PROGRAM-ID: compilei o SAUDAR com cobc -m -o lib/outronome.so e o CALL deu «module 'SAUDAR' not found», mesmo com COB_LIBRARY_PATH certo.

A opção -fstatic-call muda o CALL com literal para ligação estática: o primeiro comando abaixo falha na ligação (falta o SAUDAR) e o segundo, com o SAUDAR incluído, funciona.

    cobc -x -fstatic-call -o chamar chamar.cob
    cobc -x -fstatic-call -o chamar chamar.cob saudar.cob
    undefined reference
    chamar: CALL com literal
    saudar: ola do subprograma

## LINKAGE SECTION e modos de passagem

Os parâmetros recebidos descrevem-se na LINKAGE SECTION e listam-se em PROCEDURE DIVISION USING. A LINKAGE não reserva memória: descreve dados que pertencem ao chamador. O mudar.cob recebe três parâmetros, soma 1 a cada um e mostra-os:

           LINKAGE SECTION.
           01  LK-REF                 PIC 9(04).
           01  LK-CONT                PIC 9(04).
           01  LK-VAL                 PIC S9(09) COMP-5.
           PROCEDURE DIVISION USING BY REFERENCE LK-REF
                                    BY REFERENCE LK-CONT
                                    BY VALUE LK-VAL.

O chamador escolhe o modo no CALL. O passagem.cob passa três variáveis, uma de cada modo:

               CALL "MUDAR" USING BY REFERENCE WS-A
                                  BY CONTENT WS-B
                                  BY VALUE WS-C.

    cobc -x -o passagem passagem.cob mudar.cob
    ./passagem
    mudar.cob:11: warning: handling of parameters passed BY VALUE is unfinished; implementation is likely to be changed [-Wunfinished]
    antes:  a=0010 b=0020 c=+0000000030
    mudar:  ref=0011 cont=0021 val=+0000000031
    depois: a=0011 b=0020 c=+0000000030

| Modo | O que o subprograma recebe | O chamador vê a alteração |
|---|---|---|
| BY REFERENCE (por omissão) | o endereço da variável | Sim (a: 0010 passou a 0011) |
| BY CONTENT | o endereço de uma cópia | Não (b: ficou 0020) |
| BY VALUE | o valor, sem endereço | Não (c: ficou 30) |

O aviso do cobc diz que o tratamento de BY VALUE ainda não está acabado nesta versão (-Wunfinished). Usei um campo S9(09) COMP-5 (inteiro binário). Entre programas COBOL, BY REFERENCE e BY CONTENT chegam para quase tudo.

**ATENÇÃO:** o modo escrito vale para todos os argumentos seguintes, até aparecer outro. No erro-modo.cob, a variável do resultado fica também BY CONTENT e o resultado perde-se:

    cobc -x -o erromodo erro-modo.cob dobro.cob
    ./erromodo
    so BY CONTENT:     r=00000
    com BY REFERENCE:  r=02400

## RETURN-CODE e RETURNING

O RETURN-CODE é um registo especial que existe em todos os programas. O subprograma põe lá um código (por convenção 0 = sucesso, 4 = aviso, 8 = erro) e o chamador lê-o logo a seguir ao CALL. O dobro.cob devolve o resultado num parâmetro e o estado em RETURN-CODE:

           PROCEDURE DIVISION USING LK-N LK-RES.
               IF LK-N > 5000
                   MOVE 0 TO LK-RES
                   MOVE 8 TO RETURN-CODE
               ELSE
                   COMPUTE LK-RES = LK-N * 2
                   MOVE 0 TO RETURN-CODE
               END-IF.
               GOBACK.

No retorno.cob, a segunda chamada usa CALL "DOBRO" USING WS-N WS-R RETURNING WS-ESTADO e a terceira não tem RETURNING:

    cobc -x -o retorno retorno.cob dobro.cob
    ./retorno
    echo $?
    n=1200 dobro=02400 rc=+000000000
    n=7000 dobro=00000 rc=+000000000 returning=+0000000008
    sem RETURNING: rc=+000000008
    8

Com RETURNING o código passa para a variável indicada e o RETURN-CODE fica a 0. Sem RETURNING, o RETURN-CODE fica a 8 e é esse valor que o STOP RUN do principal entrega ao sistema operativo (o echo mostra 8).

**ATENÇÃO:** escrever PROCEDURE DIVISION RETURNING item no próprio subprograma compila com o aviso «program RETURNING is not implemented» e, em execução, o 3.2.0 terminou com falha de segmentação. Não o uses nesta versão: devolve resultados por parâmetros e pelo RETURN-CODE.

## GOBACK, EXIT PROGRAM e STOP RUN

| Instrução | Num subprograma | No programa principal |
|---|---|---|
| GOBACK | devolve o controlo ao chamador | termina o programa (e entrega o RETURN-CODE) |
| EXIT PROGRAM | devolve o controlo ao chamador | não faz nada: a execução continua |
| STOP RUN | termina a execução inteira | termina a execução inteira |

O saidas.cob chama o SUBEXIT (que termina com EXIT PROGRAM) e depois executa o EXIT PROGRAM no próprio principal:

    cobc -x -o saidas saidas.cob subexit.cob
    ./saidas
      subexit: a devolver com EXIT PROGRAM
    saidas: voltei de SUBEXIT
    saidas: depois do EXIT PROGRAM no principal

O texto depois do EXIT PROGRAM do SUBEXIT não apareceu, mas o do principal apareceu: no principal o EXIT PROGRAM foi ignorado. Regra prática: GOBACK em tudo o que possa ser chamado.

## ON EXCEPTION: o programa não existe

Sem proteção, um CALL a um módulo em falta termina o programa com um erro do libcob. O semexcecao.cob (só com CALL "NAOEXISTE") dá:

    cobc -x -o semexcecao semexcecao.cob
    ./semexcecao
    echo $?
    semexcecao: vou chamar NAOEXISTE
    libcob: error: module 'NAOEXISTE' not found
    1

Com ON EXCEPTION, o programa decide o que fazer:

               CALL "NAOEXISTE"
                   ON EXCEPTION
                       MOVE "S" TO WS-ERRO
               END-CALL.

    cobc -x -o exceto exceto.cob
    ./exceto
    exceto: NAOEXISTE nao encontrado
    exceto: o programa continua

**ATENÇÃO:** não contes com NOT ON EXCEPTION. Com um DISPLAY dentro do ON EXCEPTION, o 3.2.0 executou os dois ramos (exceto-not.cob). No C gerado (cobc -C), o DISPLAY repõe o código de exceção a zero e a condição do NOT ON EXCEPTION é avaliada depois disso. Usa só ON EXCEPTION e um interruptor, como acima.

    cobc -x -o exceto-not exceto-not.cob
    ./exceto-not
    excecao: modulo nao encontrado
    excecao: chamada feita

## Estado entre chamadas: WORKING-STORAGE, INITIAL e CANCEL

A WORKING-STORAGE de um subprograma é inicializada na primeira chamada e depois mantém-se: o valor da chamada anterior ainda lá está. O contar.cob soma 1 a um contador com VALUE 0. O contai.cob é igual mas com PROGRAM-ID. CONTAI IS INITIAL, que repõe os valores iniciais em cada chamada. O estado.cob chama cada um três vezes, faz CANCEL ao CONTAR e chama-o outra vez:

    cobc -x -o estado estado.cob contar.cob contai.cob
    ./estado
    contar:  chamada 0001
    contar:  chamada 0002
    contar:  chamada 0003
    contai:  chamada 0001
    contai:  chamada 0001
    contai:  chamada 0001
    estado: CANCEL CONTAR
    contar:  chamada 0001

CANCEL descarrega o subprograma da memória: a chamada seguinte começa do zero, como a primeira. Num sistema real isto liberta memória e permite reinicializar o estado.

## Programas aninhados

Um programa pode conter outros, entre o seu fim e o END PROGRAM. O aninhado.cob tem o EXTERNO, que faz CALL "DOBRAR", e o DOBRAR escrito dentro dele (depois do STOP RUN do EXTERNO, entre o PROGRAM-ID DOBRAR e END PROGRAM DOBRAR), tudo num só ficheiro e numa só compilação:

    cobc -x -o aninhado aninhado.cob
    ./aninhado
    externo: v=0050

Cada programa aninhado tem os seus próprios dados: só vê os do programa que o contém se forem declarados GLOBAL (não testei). Serve para organizar uma rotina auxiliar no mesmo ficheiro; para reutilizar entre programas, usa ficheiros separados.

## COPY e copybooks

Um copybook é um ficheiro de texto com declarações de dados que o COPY insere na compilação. É a forma de a loja ter uma só descrição de cada registo: os copybooks de 00-Introducao/copybooks/ (cliente.cpy, produto.cpy, encomenda.cpy, linha.cpy, categoria.cpy). O copia.cob usa o do cliente duas vezes: no FD tal como está, e na WORKING-STORAGE com REPLACING, para ter uma cópia dos dados do cliente anterior:

           FD  F-CLIENTES.
               COPY "cliente.cpy".
           WORKING-STORAGE SECTION.
               COPY "cliente.cpy"
                   REPLACING LEADING ==CLI-== BY ==ANT-==
                             ==REG-CLIENTE== BY ==REG-ANTERIOR==.

O COPY procura o ficheiro na pasta atual e nas pastas indicadas. O cliente.cpy está noutra pasta, por isso sem indicar onde o cobc não o encontra. As duas formas de indicar são a opção -I e a variável COB_COPY_DIR:

    cobc -x -o copia copia.cob
    cobc -x -I copybooks -o copia copia.cob
    ./copia
    copia.cob:12: error: cliente.cpy: No such file or directory
    001 Ana Ribeiro          (antes:                     )
    002 Bruno Costa          (antes: Ana Ribeiro         )
    003 Carla Mendes         (antes: Bruno Costa         )
    004 Diogo Pires          (antes: Carla Mendes        )
    COB_COPY_DIR tambem compilou

A opção -E mostra o texto depois do pré-processamento. Com REPLACING LEADING ==CLI-== BY ==ANT-==, todos os nomes que começam por CLI- passaram a ANT- e o REG-CLIENTE passou a REG-ANTERIOR:

    cobc -E -I copybooks copia.cob -o copia.pp
    sed -n "/REG-ANTERIOR[.]/,/ANT-DATA/p" copia.pp
     01 REG-ANTERIOR.
     05 ANT-ID PIC 9(03).
     05 ANT-NOME PIC X(20).
     05 ANT-EMAIL PIC X(30).
     05 ANT-CIDADE PIC X(10).
     05 ANT-DATA-REGISTO PIC 9(08).

**DICA:** o COPY serve também para a interface de um subprograma: um copybook com o bloco de parâmetros, copiado na WORKING-STORAGE do chamador e na LINKAGE do subprograma, garante que os dois descrevem os dados da mesma maneira. Vês isto no exemplo da loja, mais abaixo.

## Erros reais nos parâmetros

O compilador não confere os parâmetros entre programas: cada ficheiro compila isoladamente e só vê o seu CALL e a sua LINKAGE. Os erros aparecem tarde, ou nunca. Com o DOBRO (que espera 9(04) e 9(05)), o erro-tipo.cob passa-lhe um texto AB12 e, depois, um campo de 2 dígitos (dentro de um grupo, antes de um campo ABC) para o resultado:

    cobc -x -o erro-tipo erro-tipo.cob dobro.cob
    ./erro-tipo
    texto: r=02424
    curto: 02 vizinho: 400

Tipo errado: o texto AB12 foi tratado como número e o resultado (02424) é lixo, sem qualquer erro. Tamanho errado: o DOBRO escreveu 5 dígitos num campo de 2 e os 3 dígitos em excesso (400) foram parar ao campo vizinho, que devia conter ABC. A compilação com -debug apanha o primeiro caso em execução:

    cobc -x -debug -o erro-tipo2 erro-tipo.cob dobro.cob
    ./erro-tipo2
    libcob: dobro.cob:14: error: 'LK-N' (Type: NUMERIC DISPLAY) not numeric: 'AB12'

Número de parâmetros errado: o erro-numero.cob chama o DOBRO com um só parâmetro, mas o DOBRO usa também o segundo:

    cobc -x -o erro-numero erro-numero.cob dobro.cob
    ./erro-numero
    attempt to reference invalid memory address (signal)
    Segmentation fault (core dumped)

    cobc -x -debug -o erro-numero2 erro-numero.cob dobro.cob
    ./erro-numero2
    libcob: dobro.cob:9: error: LINKAGE item LK-RES not passed by caller

Sem -debug, falha de segmentação (endereço inválido); com -debug, uma mensagem que nomeia o parâmetro em falta. O módulo 08 volta a este tipo de erros.

## Exemplo modular na loja

Três peças: IVALINHA valida uma linha de encomenda e calcula o total sem IVA e com IVA (RETURN-CODE 4 se a quantidade ou o preço forem zero); FMTDATA transforma AAAAMMDD em DD/MM/AAAA (RETURN-CODE 4 e ??/??/???? se a data for inválida); LOJA07 lê as encomendas, totaliza as linhas de cada uma e chama os dois. O bloco de parâmetros do IVALINHA está num copybook (pariva.cpy):

           01  PAR-LINHA.
               05  PAR-QTD             PIC 9(03).
               05  PAR-PRECO           PIC 9(05)V99.
               05  PAR-IVA-PERC        PIC 9(02).
               05  PAR-SEM-IVA         PIC 9(08)V99.
               05  PAR-COM-IVA         PIC 9(08)V99.

O IVALINHA recebe-o na LINKAGE (COPY "pariva.cpy") e o LOJA07 tem-no na WORKING-STORAGE; para cada linha da encomenda corrente, o LOJA07 preenche-o e faz CALL "IVALINHA" USING PAR-LINHA. O corpo do IVALINHA:

               MOVE ZEROS TO PAR-SEM-IVA PAR-COM-IVA
               IF PAR-QTD = 0 OR PAR-PRECO = 0
                   MOVE 4 TO RETURN-CODE
               ELSE
                   COMPUTE PAR-SEM-IVA = PAR-QTD * PAR-PRECO
                   COMPUTE PAR-COM-IVA ROUNDED =
                       PAR-SEM-IVA * (100 + PAR-IVA-PERC) / 100
                   MOVE 0 TO RETURN-CODE
               END-IF
               GOBACK.

Compilação e resultado, com IVA a 23 por cento (o IVA é calculado linha a linha, com ROUNDED):

    cobc -x -I copybooks -o loja07 loja07.cob ivalinha.cob fmtdata.cob
    ./loja07
    0001 10/01/2025 entregue      40.70     50.06
    0002 18/01/2025 entregue      64.80     79.71
    0003 02/02/2025 entregue      44.50     54.74
    0004 14/02/2025 cancelada     89.90    110.58
    0005 05/03/2025 entregue     108.80    133.82
    0006 22/03/2025 enviada       86.89    106.88
    0007 01/04/2025 enviada       47.50     58.43
    0008 15/04/2025 pendente      99.80    122.76
    0009 20/04/2025 pendente      35.00     43.05
    0010 03/05/2025 entregue      83.70    102.95
    0011 12/05/2025 enviada      158.90    195.45
    0012 01/06/2025 pendente     145.00    178.35
    Total geral com IVA:   1236.78
    linha com quantidade 0: rc=+000000004
    data 20251345: ??/??/???? rc=+000000004

Conferência da encomenda 1: duas linhas, 2 x 12.90 = 25.80 e 1 x 14.90 = 14.90, total 40.70; o IVA linha a linha dá 31.73 e 18.33, em soma 50.06. As duas últimas linhas da saída vêm de testes ao RETURN-CODE com valores inválidos (quantidade 0 e a data 20251345). A encomenda 4 está cancelada e entra no total geral: filtrar por estado ficaria no principal, não nos subprogramas.

## Exercícios

**PRATICAR:** faz os exercícios 25 a 28 do módulo 11 (preço com desconto e modos de passagem, validar emails, estatísticas que persistem entre chamadas, módulo dinâmico com tratamento de falhas).

## Fontes oficiais

- GnuCOBOL Programmer's Guide (CALL, módulos, COB_LIBRARY_PATH, COB_COPY_DIR): https://gnucobol.sourceforge.io/doc/gnucobol.html
- Página do projeto GnuCOBOL: https://gnucobol.sourceforge.io/

**NOTA:** a comparação com o COBOL de mainframe (IBM Enterprise COBOL, onde RETURNING e a passagem BY VALUE seguem as regras do produto) não foi executada aqui: confirma na documentação da IBM.
