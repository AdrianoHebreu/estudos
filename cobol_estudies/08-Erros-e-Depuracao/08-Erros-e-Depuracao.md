# 08 Erros e depuração

Um programa COBOL de produção corre à noite, sem ninguém a olhar: o que não verificares falha em silêncio. Neste módulo aprendes a ler as mensagens do compilador e do runtime, a tratar os erros de ficheiros e de aritmética, a validar a entrada, a depurar com DISPLAY, linhas de depuração e verificações em execução, e a escrever código que o próximo colega consiga ler. Todas as saídas foram obtidas com o GnuCOBOL 3.2.0 (imagem Docker est-cb-gnucobol:estudo). No fim, o fio condutor é um programa de importação de encomendas com ficheiro de rejeições.

**NOTA:** os exemplos estão em 08-Erros-e-Depuracao/exemplos/. Copia o .cob (e o encomendas-novas.dat) para uma pasta tua e corre cobc -x -o programa programa.cob e ./programa. Em todas as execuções aparece o aviso inofensivo «Warning: program compiled against libxml 212 using older 209» (vem da imagem); omiti-o.

## Três tipos de erro

| Tipo | Quando aparece | Quem o mostra | Exemplo |
|---|---|---|---|
| Compilação | Ao correr o cobc; não é gerado executável | O compilador | Nome de variável mal escrito |
| Execução | Com o programa a correr | O runtime (libcob) ou o teu código | Ficheiro inexistente, subscrito fora da tabela |
| Lógica | O programa corre e dá o resultado errado | Só tu, a comparar com o esperado | Somar o campo errado, ciclo que salta o último registo |

Quanto mais cedo o erro aparece, mais barato é: um erro de compilação não chega à produção; um erro de lógica pode chegar. Por isso: avisos ligados, verificações em execução nos testes e validação explícita dos dados.

## Ler as mensagens do compilador

O compilador diz o ficheiro, a linha e o motivo, e mostra o código com um sinal em cima da linha em causa. Com um nome mal escrito (errcomp.cob):

    errcomp.cob: in paragraph 'PRINCIPAL':
    errcomp.cob:10: error: 'WS-TOTL' is not defined
       10 >            ADD 1 TO WS-TOTL

Há erros que apontam a linha seguinte à causa. Um DISPLAY com um literal que passa da coluna 72 (errlinha.cob) dá duas mensagens que não falam em colunas:

    errlinha.cob:9: error: continuation character expected
    errlinha.cob:8: error: invalid literal: ' unidades na loja de t ...'
    errlinha.cob:8: note: missing terminating " character

**DICA:** corrige sempre o primeiro erro e recompila: os seguintes são muitas vezes consequência dele. Perante uma mensagem estranha, verifica primeiro as colunas (código para lá da coluna 72 é cortado em silêncio) e o ponto final.

Sem opções, o cobc só se queixa de erros. Os avisos ligam-se com -Wall (a maioria) ou -W (mais avisos, com ruído). Para o avisos.cob, o -Wall mostrou:

    avisos.cob:10: warning: value size exceeds data size [-Wtruncate]
    avisos.cob:11: warning: value size exceeds data size [-Wtruncate]
    avisos.cob:14: warning: literal 'A' is alphanumeric but 'WS-TOTAL' is numeric [-Wconstant-expression]

Sem a opção, os dois MOVE (123456 para um PIC 9(04); 14 caracteres para um X(10)) compilam calados. O -W acrescenta [-Wpossible-truncate] e avisos de terminador (DISPLAY not terminated by END-DISPLAY), que são ruído. Cada aviso desliga-se com -Wno-nome.

**DICA:** compila sempre com -Wall e trata cada aviso: ou corriges, ou sabes porque o aceitas.

## Ler as mensagens do runtime

As mensagens em execução começam por libcob:. Três casos reais:

    libcob: error: module 'NAOEXISTE' not found
    libcob: error: file does not exist (status = 35) for file F-NADA ('nao-existe_dat' => nao-existe.dat)
    libcob: sujo.cob:27: error: 'WS-NUM' (Type: NUMERIC DISPLAY) not numeric: 'A12'

O primeiro é um CALL sem ON EXCEPTION para um módulo que não existe. O segundo é um OPEN sem FILE STATUS: nome interno do ficheiro (F-NADA) e nome real. O terceiro só existe com a opção -debug (ver abaixo) e indica a linha, a variável e o valor. Em todos o programa termina com código de saída 1.

## FILE STATUS, a regra de ouro

Sem FILE STATUS, um erro de ficheiro mata o programa (o segundo caso acima). Com FILE STATUS, o programa continua e és tu quem decide: o campo PIC XX recebe um código de dois dígitos depois de cada OPEN, READ, WRITE, REWRITE e CLOSE. Regra: todo o ficheiro tem FILE STATUS e todo o acesso é verificado. Em vez de espalhar IF por todo o lado, escreve uma rotina central que traduz o código em mensagem (estados.cob, que abre, lê e fecha de propósito mal):

           VERIFICA-ESTADO.
               EVALUATE WS-ESTADO
                   WHEN "00" MOVE "sucesso" TO WS-MENSAGEM
    ...
                   WHEN OTHER MOVE "estado nao previsto" TO WS-MENSAGEM
               END-EVALUATE
               DISPLAY WS-OPERACAO " estado=" WS-ESTADO " " WS-MENSAGEM.

Cada código desta tabela foi produzido pelo programa acima (por exemplo, a linha OPEN INPUT estado=35 ficheiro nao existe):

| Estado | Significado | Causa típica |
|---|---|---|
| 00 | Sucesso | |
| 10 | Fim do ficheiro | Último READ |
| 22 | Chave duplicada | WRITE num ficheiro indexado |
| 23 | Registo não encontrado | READ por chave inexistente |
| 35 | Ficheiro não existe | OPEN INPUT de nome errado |
| 41 | Ficheiro já aberto | Dois OPEN seguidos |
| 42 | Ficheiro não aberto | CLOSE sem OPEN |
| 46 | Leitura depois do fim | READ após o estado 10 |
| 47 | Leitura sem OPEN adequado | READ num ficheiro aberto para OUTPUT ou fechado |
| 48 | Escrita sem OPEN adequado | WRITE num ficheiro aberto para INPUT |

**ATENÇÃO:** a tabela é só do que verifiquei. Existem mais códigos (os ficheiros indexados e os erros de disco têm outros): consulta o manual do GnuCOBOL antes de os tratares. A rotina central tem sempre um WHEN OTHER, para o código que não previste.

## AT END, INVALID KEY, ON SIZE ERROR, ON EXCEPTION

São quatro cláusulas condicionais, uma por família de problema. Cada uma só vale na instrução a que a escreves.

| Cláusula | Em que instruções | Dispara quando |
|---|---|---|
| AT END | READ sequencial | Não há mais registos (estado 10) |
| INVALID KEY | READ, WRITE, REWRITE, DELETE, START em ficheiros indexados e relativos | Chave inexistente ou duplicada (23, 22) |
| ON SIZE ERROR | ADD, SUBTRACT, MULTIPLY, DIVIDE, COMPUTE | Estouro ou divisão por zero |
| ON EXCEPTION | CALL | O módulo não foi encontrado |

O revisao.cob usa as quatro (o ficheiro indexado é assunto do módulo 06; aqui só interessa o estado). Mostro as três últimas, as outras são análogas:

               ADD 20 TO WS-PEQUENO
                  ON SIZE ERROR DISPLAY "estouro, WS-PEQUENO=" WS-PEQUENO
               END-ADD
               DIVIDE WS-DIV BY WS-ZERO GIVING WS-DIV
                  ON SIZE ERROR DISPLAY "divisao por zero, WS-DIV=" WS-DIV
               END-DIVIDE
               CALL "MODULO-FANTASMA"
                  ON EXCEPTION DISPLAY "CALL falhou (ON EXCEPTION)"
                  END-DISPLAY
                  NOT ON EXCEPTION DISPLAY "CALL ok" END-DISPLAY
               END-CALL

    chave duplicada, estado 22
    chave 09 nao existe, estado 23
    estouro, WS-PEQUENO=90
    divisao por zero, WS-DIV=07
    CALL falhou (ON EXCEPTION)

Em ambos os casos de ON SIZE ERROR o destino ficou como estava (90 e 07): o resultado errado não é gravado. Sem a cláusula, o estouro dá 00 em silêncio e a divisão por zero deixa o destino na mesma e o código 0.

**ATENÇÃO:** o DISPLAY também tem ON EXCEPTION e NOT ON EXCEPTION. No meu primeiro teste escrevi o CALL ... ON EXCEPTION DISPLAY "falhou" NOT ON EXCEPTION DISPLAY "ok" sem terminadores e apareceram as duas mensagens: o NOT ON EXCEPTION foi agarrado pelo DISPLAY (que correu bem), não pelo CALL. Termina sempre a instrução interior com END-DISPLAY (ou usa uma instrução sem cláusulas de exceção).

## DECLARATIVES: um tratador de erros comum

Em vez de verificar o FILE STATUS depois de cada operação, podes registar um parágrafo que corre sempre que há erro num ficheiro. Fica no início da PROCEDURE DIVISION, e o resto do programa tem de passar a SECTIONs (declara.cob):

           DECLARATIVES.
           TRATA-ERROS-CLI SECTION.
               USE AFTER STANDARD ERROR PROCEDURE ON F-CLI.
           TRATA-ERRO.
               ADD 1 TO WS-ERROS
               DISPLAY "[declarative] erro no F-CLI, estado " WS-ESTADO.
           END DECLARATIVES.

Com um OPEN de ficheiro inexistente e depois o ciclo de leituras até ao fim, a saída foi:

    [declarative] erro no F-CLI, estado 35
    [declarative] erro no F-CLI, estado 10
    [declarative] erro no F-CLI, estado 46
    erros contados: 03

Duas observações verificadas: o fim de ficheiro (10) também dispara o tratador quando o READ não tem AT END; com AT END escrito no READ, o 10 deixa de o disparar e só ficam os erros 35 e 46 (erros contados: 02). Em resumo, o tratador não substitui o FILE STATUS: serve para centralizar o registo e a contagem; quem decide o que fazer continua a ser o programa.

## RETURN-CODE e códigos de saída

O RETURN-CODE é um registo especial (inteiro) cujo valor o programa entrega ao sistema ao terminar. No shell lê-se com $?; em scripts, JCL no mainframe ou agendadores, é assim que o passo seguinte sabe se pode correr. Em saida.cob, a opção lida do teclado faz MOVE 4 TO RETURN-CODE (opção 1), STOP RUN RETURNING 8 (opção 2) ou MOVE 300 TO RETURN-CODE (opção 3):

| Entrada | Saída do DISPLAY RETURN-CODE | Código no shell |
|---|---|---|
| 0 | RETURN-CODE=+000000000 | 0 |
| 1 | RETURN-CODE=+000000004 | 4 |
| 2 | (o STOP RUN termina antes do DISPLAY) | 8 |
| 3 | RETURN-CODE=+000000300 | 44 |

O código 300 chegou ao shell como 44: o sistema só guarda 8 bits (300 mod 256). Mantém os valores entre 0 e 255. Uma convenção do mundo mainframe (não é regra da linguagem), que também é boa fora dele: 0 correu bem, 4 avisos (por exemplo houve rejeições), 8 erro, 12 erro grave (ficheiro em falta), 16 erro fatal.

## Validar a entrada e dados sujos

Os dados de fora (ficheiros de outros sistemas, ACCEPT) são sujos até prova em contrário. Valida antes de usar: classe (IF campo IS NUMERIC), intervalo, data válida (FUNCTION TEST-DATE-YYYYMMDD devolve 0 se a data é válida) e divisor diferente de zero. O que acontece sem validar? Em sujo.cob um campo PIC 9(03) recebe cinco textos e cada um é somado ao total:

    [012] numerico         WS-NUM=012  total=00012
    [A12] NAO numerico     WS-NUM=A12  total=00124
    [   ] NAO numerico     WS-NUM=     total=00124
    [ 12] NAO numerico     WS-NUM= 12  total=00136
    [1.5] NAO numerico     WS-NUM=1.5  total=00381

O programa não parou e o total ficou com lixo: o A12 somou 112 (o A conta como 1), os espaços somaram 0, o " 12" somou 12 e o 1.5 somou 245 (o ponto conta como 14). Os teus números nunca foram o que pensavas, e o programa nem se queixou. Compilado com -debug, o mesmo programa pára no primeiro:

    libcob: sujo.cob:27: error: 'WS-NUM' (Type: NUMERIC DISPLAY) not numeric: 'A12'
     Last statement of "SUJO" was ADD

**ATENÇÃO:** espaços num campo numérico não são zero: o IF NUMERIC dá falso. Se o teu ficheiro usa espaços para «sem valor», testa IF campo = SPACES antes de IF NUMERIC e trata cada caso.

## Depurar: DISPLAY, linhas de depuração, verificações e traço

O DISPLAY de rastreio é a ferramenta mais simples: escreve as variáveis antes e depois do ponto suspeito. O inconveniente é ter de os apagar depois. As linhas de depuração resolvem isso: uma linha com D na coluna 7 só é compilada se o modo de depuração estiver ligado (depurar.cob):

           SOURCE-COMPUTER. PC WITH DEBUGGING MODE.
    ...
          D    DISPLAY "D> antes: preco=" WS-PRECO " qtd=" WS-QTD
               COMPUTE WS-TOTAL = WS-PRECO * WS-QTD
          D    DISPLAY "D> depois: total=" WS-TOTAL

| Compilação | Linhas D |
|---|---|
| WITH DEBUGGING MODE no SOURCE-COMPUTER | Executam |
| Sem a cláusula e sem opção | Ignoradas (só sai o «Total: 00051.60») |
| Sem a cláusula, com cobc -fdebugging-line | Executam |

Para testar a segunda e a terceira linha da tabela, apaga WITH DEBUGGING MODE do exemplo. Com a linha D ligada a saída é D> antes: preco=00012.90 qtd=004, D> depois: total=00051.60 e Total: 00051.60.

**ATENÇÃO:** o D tem de estar na coluna 7. No meu primeiro teste pus-o na coluna 1, a linha deixou de ser de depuração e o DISPLAY correu sempre, sem aviso.

### A opção -debug

A opção -debug do cobc liga todas as verificações em execução (e as linhas D). Em limites.cob, uma tabela de 3 elementos é acedida com o subscrito 5, e uma referência por posição ultrapassa o campo. Sem -debug nada é detetado (e escrever fora de uma tabela pode estragar outras variáveis, como verás no exercício 31):

    subscrito 5 aceite
    HIJ^@^@        (^@ é o byte zero: WS-NOME (8:5) leu 2 bytes para lá do campo)

Com -debug, três erros reais, cada um com a linha:

    libcob: limites.cob:19: error: subscript of 'WS-CIDADE' out of bounds: 5
    note: maximum subscript for 'WS-CIDADE': 3
    libcob: limites.cob:22: error: length of 'WS-NOME' out of bounds: 5, starting at: 8, maximum: 10
    libcob: limites.cob:24: error: offset of 'WS-NOME' out of bounds: 0

O compilador apanha o que é constante: WS-NOME (0:5) com o literal 0 é recusado na compilação (offset of 'WS-NOME' out of bounds: 0), por isso usei variáveis. Os dois últimos, e o campo não numérico visto acima, só aparecem com -debug. Faz o programa trabalhar mais em cada acesso: usa-o nos testes, não na produção.

**DICA:** acrescenta -fdump=WS e, quando o programa abortar por um destes erros, o runtime imprime o estado da WORKING-STORAGE:

    01  WS-I                            5
    01  WS-NOME                        'ABCDEFGHIJ'
    01  WS-CHECK                       'intacto'

### Traço de execução

Compilado com -ftrace (parágrafos) ou -ftraceall (todas as instruções), o programa só escreve o traço se executares com a variável COB_SET_TRACE=Y; sem ela, o resultado é igual ao normal. O traço vai para o stderr (ou para o ficheiro de COB_TRACE_FILE). Com -ftraceall (comprimi os espaços das colunas):

    Program-Id:  DEPURB   Paragraph: PRINCIPAL   Line: 13
    Program-Id:  DEPURB   COMPUTE                Line: 15
    Program-Id:  DEPURB   DISPLAY                Line: 17
    Program-Id:  DEPURB   STOP RUN               Line: 18

### Ver os bytes

Quando um campo «parece» certo e não se comporta, olha para os bytes. FUNCTION HEX-OF (hexa.cob) mostra-os em hexadecimal:

    texto A12 = 413132
    com sinal -012 = 303172
    binario +0258 = 0102

O A12 são os bytes 41 31 32. O -012 tem o sinal embutido no último dígito (72, ou seja a letra r, em vez de 32). O COMP 258 são os dois bytes 01 02. Num ficheiro, od -c ficheiro.dat faz o mesmo fora do COBOL.

**NOTA:** a opção -g (informação de depuração para o gdb) existe, mas a imagem do curso não tem gdb e por isso não a executei. Confirma na documentação do GnuCOBOL.

## Boas práticas de legibilidade

Depurar menos começa por escrever código que se lê.

- Nomes que dizem o quê: WS-TOTAL-ENCOMENDA, não WS-T1. Prefixos por origem (WS- para trabalho, ENT- para o ficheiro de entrada, REJ- para rejeições) mostram de onde vem cada campo.
- Parágrafos curtos, um propósito e um nome de verbo (VALIDAR-REGISTO, GRAVAR-REJEICAO). O parágrafo principal só chama os outros: lê-se como um índice.
- Uma saída por parágrafo: cada parágrafo termina no fim (sem GO TO para o meio de outro) e é chamado com PERFORM.
- Evita GO TO e, sobretudo, ALTER (altera em execução o destino de um GO TO: o programa deixa de ler-se de cima para baixo). Não os testei com -Wall; evita-os por legibilidade.
- Constantes com nome: nível 78 para números (MAX-CLIENTE) e nível 88 para condições (ESTADO-VALIDO, FIM-FICHEIRO), em vez de 8 e de "S" espalhados.
- Comentários: o porquê, não o quê. Uma linha com asterisco na coluna 7 é comentário (os exemplos usam o asterisco seguido de maior).
- EVALUATE TRUE em vez de IF aninhados. O legivel.cob classifica um valor das duas maneiras (três IF dentro de IF, ou um EVALUATE com um WHEN por caso) e ambas escrevem medio para o valor 35; o EVALUATE lê-se como uma tabela de decisão e acrescentar um caso é acrescentar uma linha (ver VALIDAR-REGISTO abaixo).

## Exemplo da loja: importação de encomendas com rejeições

O importa.cob lê encomendas-novas.dat (o mesmo desenho do encomendas.dat: ID 9(04), cliente 9(03), data 9(08), estado X(10)), valida cada registo, grava os bons em encomendas-aceites.dat e os maus em rejeicoes.dat com o motivo. Aplica tudo o que viste: FILE STATUS partilhado e rotina central, níveis 88 e 78, EVALUATE, parágrafos curtos, SIZE ERROR e RETURN-CODE. A validação, por ordem de gravidade, pára na primeira regra que falha:

           VALIDAR-REGISTO.
               MOVE SPACES TO WS-MOTIVO
               EVALUATE TRUE
                   WHEN ENT-ID NOT NUMERIC
                       MOVE "id nao numerico" TO WS-MOTIVO
                   WHEN ENT-CLIENTE-ID NOT NUMERIC
                       MOVE "cliente nao numerico" TO WS-MOTIVO
                   WHEN ENT-CLIENTE-ID < 1
                        OR ENT-CLIENTE-ID > MAX-CLIENTE
                       MOVE "cliente fora do intervalo" TO WS-MOTIVO
                   WHEN ENT-DATA NOT NUMERIC
                       MOVE "data nao numerica" TO WS-MOTIVO
                   WHEN FUNCTION TEST-DATE-YYYYMMDD (ENT-DATA) NOT = 0
                       MOVE "data invalida" TO WS-MOTIVO
                   WHEN NOT ESTADO-VALIDO
                       MOVE "estado desconhecido" TO WS-MOTIVO
               END-EVALUATE.

O fim do programa tem o resumo (com ON SIZE ERROR na percentagem) e a rotina central VERIFICAR-ESTADO, igual à de estados.cob mas que, perante qualquer estado diferente de 00, escreve o contexto («ERRO 35 em OPEN entrada»), põe RETURN-CODE a 12 e termina.

Com 8 linhas (2 boas, 6 com erros de propósito) o resultado foi:

    lidos=008 aceites=002 rejeitados=006 (075.0%)

    001400220250230enviada    | data invalida
    00A500320250620pendente   | id nao numerico
    001600920250621entregue   | cliente fora do intervalo
    001700420250622perdida    | estado desconhecido
    00190  20250626pendente   | cliente nao numerico
    002000620251301pendente   | data invalida

O código de saída foi 4 (houve rejeições). Os outros caminhos, executados:

| Situação | Saída | Código |
|---|---|---|
| Ficheiro de entrada em falta | ERRO 35 em OPEN entrada | 12 |
| Ficheiro de entrada vazio | lidos=000 ... (000.0%) | 0 |
| Entrada sem erros | (resumo sem rejeições) | 0 |

O ficheiro vazio só não rebenta porque o ON SIZE ERROR do COMPUTE apanha a divisão por zero (0 / 0). Repara que o ficheiro de rejeições guarda a linha original intacta e o motivo: quem o recebe vê logo o que corrigir e pode reenviar só essas linhas.

## Exercícios

**PRATICAR:** faz os exercícios 29 a 32 do módulo 11 (Exercícios práticos) e confere com o módulo 13 (Gabarito).

## Fontes oficiais

- GnuCOBOL, página do projeto: https://gnucobol.sourceforge.io/
- GnuCOBOL Programmer's Guide (opções do cobc, variáveis de ambiente de execução, mensagens): https://gnucobol.sourceforge.io/doc/gnucobol.html
- Guias e manuais do GnuCOBOL: https://gnucobol.sourceforge.io/guides.html
- IBM Enterprise COBOL for z/OS (referência de COBOL de mainframe; não executado aqui): https://www.ibm.com/docs/en/cobol-zos/6.4
