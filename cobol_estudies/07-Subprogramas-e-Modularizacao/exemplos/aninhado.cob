      * Programas aninhados: DOBRAR vive dentro de EXTERNO.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXTERNO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-V                   PIC 9(04) VALUE 25.
       PROCEDURE DIVISION.
       INICIO.
           CALL "DOBRAR" USING WS-V.
           DISPLAY "externo: v=" WS-V.
           STOP RUN.

       IDENTIFICATION DIVISION.
       PROGRAM-ID. DOBRAR.
       DATA DIVISION.
       LINKAGE SECTION.
       01  LK-V                   PIC 9(04).
       PROCEDURE DIVISION USING LK-V.
           MULTIPLY 2 BY LK-V.
           GOBACK.
       END PROGRAM DOBRAR.
       END PROGRAM EXTERNO.
