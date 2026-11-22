      *> NOMES.COB - como o ASSIGN encontra o ficheiro
       IDENTIFICATION DIVISION.
       PROGRAM-ID. NOMES.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO CLIENTES
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
       01  REG-CLIENTE             PIC X(71).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CLIENTES
           DISPLAY "OPEN: " WS-ESTADO
           IF WS-ESTADO = "00"
               READ F-CLIENTES
               DISPLAY REG-CLIENTE(1:23)
               CLOSE F-CLIENTES
           END-IF
           STOP RUN.
