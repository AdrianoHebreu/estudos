      *> CARREGAR.COB - clientes.dat e produtos.dat para indexados
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CARREGAR.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENTRADA ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-CLIENTES ASSIGN TO "clientes.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS SEQUENTIAL
               RECORD KEY IS CLI-ID
               ALTERNATE RECORD KEY IS CLI-CIDADE WITH DUPLICATES
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENTRADA.
       01  REG-ENTRADA             PIC X(71).
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
       01  WS-N                    PIC 99    VALUE 0.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-ENTRADA
           OPEN OUTPUT F-CLIENTES
           DISPLAY "OPEN OUTPUT indexado, estado " WS-ESTADO
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ENTRADA
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       WRITE REG-CLIENTE FROM REG-ENTRADA
                           INVALID KEY
                               DISPLAY "falhou " REG-ENTRADA(1:3)
                                       " estado " WS-ESTADO
                           NOT INVALID KEY ADD 1 TO WS-N
                       END-WRITE
               END-READ
           END-PERFORM
           DISPLAY "Gravados: " WS-N
           CLOSE F-ENTRADA F-CLIENTES
           STOP RUN.
