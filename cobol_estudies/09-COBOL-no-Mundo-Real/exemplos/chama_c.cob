      *> CHAMA_C.COB - COBOL chama funcoes escritas em C
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CHAMAC.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CENTIMOS             BINARY-LONG VALUE 1290.
       01  WS-TAXA                 BINARY-LONG VALUE 23.
       01  WS-RES                  BINARY-LONG.
       01  WS-NOME                 PIC X(17) VALUE "Romance Policial".
       01  WS-TAM                  BINARY-LONG.
       01  WS-ED                   PIC Z(5)9.
       PROCEDURE DIVISION.
       PRINCIPAL.
           CALL "iva_c" USING BY VALUE WS-CENTIMOS WS-TAXA
               RETURNING WS-RES
           MOVE WS-RES TO WS-ED
           DISPLAY "1290 centimos + 23% = " WS-ED " centimos"
           MOVE LENGTH OF WS-NOME TO WS-TAM
           CALL "maiusculas_c" USING WS-NOME BY VALUE WS-TAM
               RETURNING WS-RES
           MOVE WS-RES TO WS-ED
           DISPLAY WS-NOME " (" WS-ED " carateres)"
           STOP RUN.
