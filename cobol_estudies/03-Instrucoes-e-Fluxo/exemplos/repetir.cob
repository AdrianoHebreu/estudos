      *> REPETIR.COB - PERFORM em todas as formas
       IDENTIFICATION DIVISION.
       PROGRAM-ID. REPETIR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  I                   PIC 9(02).
       01  J                   PIC 9(02).
       01  CONTA               PIC 9(02)    VALUE ZERO.
       01  SOMA                PIC 9(05)    VALUE ZERO.
       01  STOCKS-INICIAIS.
           05  FILLER          PIC 9(05)    VALUE 40.
           05  FILLER          PIC 9(05)    VALUE 25.
           05  FILLER          PIC 9(05)    VALUE 10.
           05  FILLER          PIC 9(05)    VALUE 30.
           05  FILLER          PIC 9(05)    VALUE 100.
       01  TAB-STOCKS          REDEFINES STOCKS-INICIAIS.
           05  STOCK-PRODUTO   PIC 9(05)    OCCURS 5 TIMES.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- PERFORM de um paragrafo ---"
           PERFORM CUMPRIMENTAR
           DISPLAY "--- PERFORM THRU ---"
           PERFORM PASSO-1 THRU PASSO-3
           DISPLAY "--- PERFORM n TIMES ---"
           PERFORM CUMPRIMENTAR 3 TIMES
           DISPLAY "--- PERFORM UNTIL (TEST BEFORE) ---"
           MOVE 1 TO I
           PERFORM UNTIL I > 3
               DISPLAY "volta " I
               ADD 1 TO I
           END-PERFORM
           DISPLAY "--- Condicao ja verdadeira ---"
           MOVE 9 TO I
           MOVE ZERO TO CONTA
           PERFORM UNTIL I > 3
               ADD 1 TO CONTA
           END-PERFORM
           DISPLAY "TEST BEFORE correu " CONTA " vezes"
           MOVE ZERO TO CONTA
           PERFORM WITH TEST AFTER UNTIL I > 3
               ADD 1 TO CONTA
           END-PERFORM
           DISPLAY "TEST AFTER correu " CONTA " vezes"
           DISPLAY "--- PERFORM VARYING ---"
           MOVE ZERO TO SOMA
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 5
               DISPLAY "stock do produto " I ": " STOCK-PRODUTO(I)
               ADD STOCK-PRODUTO(I) TO SOMA
           END-PERFORM
           DISPLAY "total " SOMA ", I no fim: " I
           DISPLAY "--- VARYING de um paragrafo ---"
           PERFORM MOSTRAR-I VARYING I FROM 10 BY -5 UNTIL I < 1
           DISPLAY "--- VARYING com AFTER (dois ciclos) ---"
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 2
                   AFTER J FROM 1 BY 1 UNTIL J > 3
               DISPLAY "I=" I " J=" J
           END-PERFORM
           STOP RUN.
       CUMPRIMENTAR.
           DISPLAY "Ola da loja".
       PASSO-1.
           DISPLAY "passo 1".
       PASSO-2.
           DISPLAY "passo 2".
       PASSO-3.
           DISPLAY "passo 3".
       MOSTRAR-I.
           DISPLAY "I vale " I.
