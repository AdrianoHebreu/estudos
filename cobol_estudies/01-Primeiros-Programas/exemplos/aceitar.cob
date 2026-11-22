       IDENTIFICATION DIVISION.
       PROGRAM-ID. ACEITAR.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME                PIC X(20).
       01  WS-CIDADE              PIC X(10).

       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Nome do cliente: " WITH NO ADVANCING.
           ACCEPT WS-NOME.
           DISPLAY "Cidade: " WITH NO ADVANCING.
           ACCEPT WS-CIDADE.
           DISPLAY "Registado: [" WS-NOME "] de [" WS-CIDADE "]".
           STOP RUN.
