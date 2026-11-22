       IDENTIFICATION DIVISION.
       PROGRAM-ID. AVISOS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-TOTAL                PIC 9(04) VALUE ZERO.
       01  WS-NOME                 PIC X(10).
       01  WS-NAO-USADO            PIC 9(02).
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE 123456 TO WS-TOTAL
           MOVE "ABCDEFGHIJKLMN" TO WS-NOME
           MOVE WS-NOME TO WS-TOTAL
           DISPLAY WS-TOTAL
           IF WS-TOTAL = "A"
              DISPLAY "x"
           END-IF
           STOP RUN.
