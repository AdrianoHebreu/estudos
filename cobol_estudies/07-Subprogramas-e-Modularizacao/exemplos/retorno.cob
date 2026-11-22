      * RETURN-CODE e CALL ... RETURNING vistos do chamador.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. RETORNO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-N                   PIC 9(04).
       01  WS-R                   PIC 9(05).
       01  WS-ESTADO              PIC S9(09) COMP-5.
       PROCEDURE DIVISION.
       INICIO.
           MOVE 1200 TO WS-N.
           CALL "DOBRO" USING WS-N WS-R.
           DISPLAY "n=" WS-N " dobro=" WS-R " rc=" RETURN-CODE.
           MOVE 7000 TO WS-N.
           CALL "DOBRO" USING WS-N WS-R RETURNING WS-ESTADO.
           DISPLAY "n=" WS-N " dobro=" WS-R " rc=" RETURN-CODE
                   " returning=" WS-ESTADO.
           CALL "DOBRO" USING WS-N WS-R.
           DISPLAY "sem RETURNING: rc=" RETURN-CODE.
           STOP RUN.
