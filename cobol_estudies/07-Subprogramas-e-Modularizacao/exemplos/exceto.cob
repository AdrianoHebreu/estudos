      * ON EXCEPTION: o programa chamado nao existe.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXCETO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-ERRO                PIC X     VALUE "N".
       PROCEDURE DIVISION.
       INICIO.
           CALL "NAOEXISTE"
               ON EXCEPTION
                   MOVE "S" TO WS-ERRO
           END-CALL.
           IF WS-ERRO = "S"
               DISPLAY "exceto: NAOEXISTE nao encontrado"
           END-IF.
           DISPLAY "exceto: o programa continua".
           STOP RUN.
