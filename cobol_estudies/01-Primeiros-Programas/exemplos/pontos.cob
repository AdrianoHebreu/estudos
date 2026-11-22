       IDENTIFICATION DIVISION.
       PROGRAM-ID. PONTOS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME                PIC X(20)  VALUE "Ana Ribeiro".
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Linha 1"
           DISPLAY WS-NOME
           DISPLAY "Linha 3".
       SEGUNDO.
           DISPLAY "Estou no paragrafo SEGUNDO".
           STOP RUN.
