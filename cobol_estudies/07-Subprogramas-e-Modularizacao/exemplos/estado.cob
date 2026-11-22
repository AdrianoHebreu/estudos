      * Estado entre chamadas: normal, INITIAL e CANCEL.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ESTADO.
       PROCEDURE DIVISION.
       INICIO.
           CALL "CONTAR". CALL "CONTAR". CALL "CONTAR".
           CALL "CONTAI". CALL "CONTAI". CALL "CONTAI".
           DISPLAY "estado: CANCEL CONTAR".
           CANCEL "CONTAR".
           CALL "CONTAR".
           STOP RUN.
