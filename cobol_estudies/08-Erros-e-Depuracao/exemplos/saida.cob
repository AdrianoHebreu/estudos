      *> SAIDA.COB - RETURN-CODE e codigo de saida para o shell
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SAIDA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-OPCAO                PIC 9 VALUE ZERO.
       PROCEDURE DIVISION.
       PRINCIPAL.
           ACCEPT WS-OPCAO
           EVALUATE WS-OPCAO
               WHEN 1  MOVE 4 TO RETURN-CODE
               WHEN 2  STOP RUN RETURNING 8
               WHEN 3  MOVE 300 TO RETURN-CODE
           END-EVALUATE
           DISPLAY "RETURN-CODE=" RETURN-CODE
           STOP RUN.
