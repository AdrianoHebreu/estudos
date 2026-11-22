      *> LERCLIENTES.COB - ler clientes.dat com leitura antecipada
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LERCLIENTES.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
       01  REG-CLIENTE.
           05  CLI-ID              PIC 9(03).
           05  CLI-NOME            PIC X(20).
           05  CLI-EMAIL           PIC X(30).
           05  CLI-CIDADE          PIC X(10).
           05  CLI-DATA-REGISTO    PIC 9(08).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-TOTAL                PIC 9(03) VALUE ZEROS.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CLIENTES
           DISPLAY "OPEN: " WS-ESTADO
           PERFORM LER-CLIENTE
           PERFORM UNTIL FIM-DO-FICHEIRO
               ADD 1 TO WS-TOTAL
               DISPLAY CLI-ID " " CLI-NOME " " CLI-CIDADE
               PERFORM LER-CLIENTE
           END-PERFORM
           DISPLAY "ultimo READ: " WS-ESTADO
           CLOSE F-CLIENTES
           DISPLAY "CLOSE: " WS-ESTADO
           DISPLAY "Lidos: " WS-TOTAL
           STOP RUN.
       LER-CLIENTE.
           READ F-CLIENTES
               AT END SET FIM-DO-FICHEIRO TO TRUE
           END-READ.
