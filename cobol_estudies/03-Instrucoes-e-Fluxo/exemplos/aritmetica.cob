      *> ARITMETICA.COB - ADD, SUBTRACT, MULTIPLY, DIVIDE, COMPUTE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ARITMETICA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  QTD                 PIC 9(03)    VALUE 3.
       01  PRECO               PIC 9(05)V99 VALUE 49.90.
       01  TOTAL               PIC 9(07)V99 VALUE ZERO.
       01  DESCONTO            PIC 9(05)V99 VALUE 10.00.
       01  LIQUIDO             PIC S9(07)V99.
       01  CONTADOR            PIC 9(03)    VALUE ZERO.
       01  DIVIDENDO           PIC 9(03)    VALUE 17.
       01  DIVISOR             PIC 9(03)    VALUE 5.
       01  QUOCIENTE           PIC 9(03).
       01  RESTO               PIC 9(03).
       01  IVA-TAXA            PIC 9V99     VALUE 0.23.
       01  IVA-VALOR           PIC 9(05)V99.
       01  PRECO-1             PIC 9(05)V99 VALUE 12.90.
       01  IVA-TRUNC           PIC 9(05)V99.
       01  IVA-ARRED           PIC 9(05)V99.
       01  PEQUENO             PIC 99       VALUE 99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- ADD ---"
           ADD 1 TO CONTADOR
           ADD 1 TO CONTADOR
           DISPLAY "ADD 1 TO CONTADOR duas vezes: " CONTADOR
           ADD QTD CONTADOR TO CONTADOR
           DISPLAY "ADD QTD CONTADOR TO CONTADOR: " CONTADOR
           ADD QTD CONTADOR GIVING TOTAL
           DISPLAY "ADD QTD CONTADOR GIVING TOTAL: " TOTAL
           DISPLAY "--- SUBTRACT ---"
           SUBTRACT 1 FROM CONTADOR
           DISPLAY "SUBTRACT 1 FROM CONTADOR: " CONTADOR
           SUBTRACT 100 FROM CONTADOR GIVING LIQUIDO
           DISPLAY "SUBTRACT 100 FROM CONTADOR GIVING LIQUIDO: "
                   LIQUIDO
           DISPLAY "--- MULTIPLY ---"
           MULTIPLY QTD BY PRECO GIVING TOTAL
           DISPLAY "QTD x PRECO GIVING TOTAL: " TOTAL
           MULTIPLY 2 BY QTD
           DISPLAY "MULTIPLY 2 BY QTD (o resultado fica em QTD): " QTD
           DISPLAY "--- DIVIDE ---"
           DIVIDE DIVISOR INTO DIVIDENDO GIVING QUOCIENTE
                  REMAINDER RESTO
           DISPLAY "17 / 5: quociente " QUOCIENTE " resto " RESTO
           DIVIDE DIVIDENDO BY DIVISOR GIVING TOTAL
           DISPLAY "DIVIDE 17 BY 5 GIVING TOTAL: " TOTAL
           DISPLAY "--- COMPUTE ---"
           COMPUTE TOTAL = (QTD * PRECO) - DESCONTO
           DISPLAY "(6 x 49.90) - 10.00: " TOTAL
           COMPUTE TOTAL = 2 ** 10
           DISPLAY "2 ** 10: " TOTAL
           COMPUTE LIQUIDO = DESCONTO - QTD * PRECO
           DISPLAY "10.00 - 6 x 49.90 (S9(07)V99): " LIQUIDO
           DISPLAY "--- ROUNDED ---"
           COMPUTE IVA-TRUNC = PRECO-1 * IVA-TAXA
           COMPUTE IVA-ARRED ROUNDED = PRECO-1 * IVA-TAXA
           DISPLAY "12.90 x 0.23 sem ROUNDED: " IVA-TRUNC
           DISPLAY "12.90 x 0.23 com ROUNDED: " IVA-ARRED
           DISPLAY "--- Estouro SEM ON SIZE ERROR ---"
           ADD 1 TO PEQUENO
           DISPLAY "99 + 1 em PIC 99: " PEQUENO
           MOVE 99 TO PEQUENO
           COMPUTE PEQUENO = 99 + 1
           DISPLAY "COMPUTE 99 + 1 em PIC 99: " PEQUENO
           DISPLAY "--- Estouro COM ON SIZE ERROR ---"
           MOVE 99 TO PEQUENO
           ADD 1 TO PEQUENO
               ON SIZE ERROR
                   DISPLAY "Estouro apanhado, PEQUENO fica: " PEQUENO
               NOT ON SIZE ERROR
                   DISPLAY "Somou bem: " PEQUENO
           END-ADD
           COMPUTE PEQUENO = 60 + 50
               ON SIZE ERROR
                   DISPLAY "COMPUTE 60 + 50: estouro, fica " PEQUENO
           END-COMPUTE
           DISPLAY "--- Divisao por zero ---"
           MOVE ZERO TO DIVISOR
           DIVIDE DIVISOR INTO DIVIDENDO GIVING QUOCIENTE
               ON SIZE ERROR
                   DISPLAY "Divisao por zero apanhada"
           END-DIVIDE
           STOP RUN.
