      *> DECLARA.COB - DECLARATIVES com USE AFTER ERROR
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DECLARA.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLI ASSIGN TO WS-NOME-FICH
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLI.
       01  REG-CLI                 PIC X(71).
       WORKING-STORAGE SECTION.
       01  WS-NOME-FICH            PIC X(20).
       01  WS-ESTADO               PIC XX.
       01  WS-ERROS                PIC 99 VALUE ZERO.
       PROCEDURE DIVISION.
       DECLARATIVES.
       TRATA-ERROS-CLI SECTION.
           USE AFTER STANDARD ERROR PROCEDURE ON F-CLI.
       TRATA-ERRO.
           ADD 1 TO WS-ERROS
           DISPLAY "[declarative] erro no F-CLI, estado " WS-ESTADO.
       END DECLARATIVES.
       PRINCIPAL SECTION.
       INICIO.
           MOVE "nao-existe.dat" TO WS-NOME-FICH
           OPEN INPUT F-CLI
           DISPLAY "depois do OPEN, estado " WS-ESTADO
           MOVE "clientes.dat" TO WS-NOME-FICH
           OPEN INPUT F-CLI
           PERFORM 9 TIMES
              READ F-CLI
           END-PERFORM
           DISPLAY "estado do 9o READ: " WS-ESTADO
           READ F-CLI
           DISPLAY "estado do 10o READ: " WS-ESTADO
           CLOSE F-CLI
           DISPLAY "erros contados: " WS-ERROS
           STOP RUN.
