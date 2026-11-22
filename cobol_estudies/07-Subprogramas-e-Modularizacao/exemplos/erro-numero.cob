      * Erro: DOBRO espera 2 parametros e recebe 1.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERRONUM.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-N                   PIC 9(04) VALUE 1200.
       PROCEDURE DIVISION.
       INICIO.
           CALL "DOBRO" USING WS-N.
           DISPLAY "erronum: voltei".
           STOP RUN.
