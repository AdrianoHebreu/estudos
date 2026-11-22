       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERRO-PONTO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME                PIC X(20)  VALUE "Ana Ribeiro"
       01  WS-CIDADE              PIC X(10)  VALUE "Lisboa".
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY WS-NOME.
           STOP RUN.
