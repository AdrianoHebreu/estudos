      * CALL com literal e CALL com variavel.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CHAMAR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-MODULO              PIC X(08) VALUE "SAUDAR".
       PROCEDURE DIVISION.
       INICIO.
           DISPLAY "chamar: CALL com literal".
           CALL "SAUDAR".
           DISPLAY "chamar: CALL com variavel".
           CALL WS-MODULO.
           STOP RUN.
