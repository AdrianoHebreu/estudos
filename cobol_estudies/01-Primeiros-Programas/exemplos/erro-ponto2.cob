       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERRO-PONTO2.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME                PIC X(20)  VALUE "Ana Ribeiro".
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "A mostrar o cliente"
           DISPLAY WS-NOME
       FIM.
           STOP RUN.
