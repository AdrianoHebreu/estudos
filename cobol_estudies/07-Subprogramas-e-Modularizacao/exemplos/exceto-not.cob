      * NOT ON EXCEPTION depois de um ON EXCEPTION com DISPLAY.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXCETONOT.
       PROCEDURE DIVISION.
       INICIO.
           CALL "NAOEXISTE"
               ON EXCEPTION
                   DISPLAY "excecao: modulo nao encontrado"
               NOT ON EXCEPTION
                   DISPLAY "excecao: chamada feita"
           END-CALL.
           STOP RUN.
