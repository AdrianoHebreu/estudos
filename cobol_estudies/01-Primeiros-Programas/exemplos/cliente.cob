      * Mostra o primeiro cliente da loja (valores escritos a mao).
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CLIENTE.

       ENVIRONMENT DIVISION.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-CLI-ID              PIC 9(03)  VALUE 1.
       01  WS-CLI-NOME            PIC X(20)  VALUE "Ana Ribeiro".
       01  WS-CLI-CIDADE          PIC X(10)  VALUE "Lisboa".

       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Cliente numero: " WS-CLI-ID.
           DISPLAY "Nome:           " WS-CLI-NOME.
           DISPLAY "Cidade:         " WS-CLI-CIDADE.
           STOP RUN.
