       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERRCOMP.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-TOTAL                PIC 9(04) VALUE ZERO.
       01  WS-NOME                 PIC X(10).
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE 5 TO WS-TOTAL
           ADD 1 TO WS-TOTL
           MOVE "ABC" TO WS-NOME
           DISPLAY WS-TOTAL
           STOP RUN.
