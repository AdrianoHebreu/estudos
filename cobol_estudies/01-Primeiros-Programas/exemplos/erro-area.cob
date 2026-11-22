       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERRO-AREA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
         01  WS-NOME              PIC X(20)  VALUE "Ana Ribeiro".
       PROCEDURE DIVISION.
         PRINCIPAL.
           DISPLAY WS-NOME.
           STOP RUN.
