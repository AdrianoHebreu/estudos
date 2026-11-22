      * Erros de tipo e de tamanho nos parametros de DOBRO.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERROTIPO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-TXT                 PIC X(04) VALUE "AB12".
       01  WS-R                   PIC 9(05) VALUE 0.
       01  WS-N                   PIC 9(04) VALUE 1200.
       01  WS-GRUPO.
           05  WS-CURTO           PIC 9(02) VALUE 0.
           05  WS-VIZINHO         PIC X(03) VALUE "ABC".
       PROCEDURE DIVISION.
       INICIO.
           CALL "DOBRO" USING WS-TXT WS-R.
           DISPLAY "texto: r=" WS-R.
           CALL "DOBRO" USING WS-N WS-CURTO.
           DISPLAY "curto: " WS-CURTO " vizinho: " WS-VIZINHO.
           STOP RUN.
