      * BY CONTENT vale para todos os argumentos seguintes.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERROMODO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-N                   PIC 9(04) VALUE 1200.
       01  WS-R                   PIC 9(05) VALUE 0.
       PROCEDURE DIVISION.
       INICIO.
           CALL "DOBRO" USING BY CONTENT WS-N WS-R.
           DISPLAY "so BY CONTENT:     r=" WS-R.
           CALL "DOBRO" USING BY CONTENT WS-N BY REFERENCE WS-R.
           DISPLAY "com BY REFERENCE:  r=" WS-R.
           STOP RUN.
