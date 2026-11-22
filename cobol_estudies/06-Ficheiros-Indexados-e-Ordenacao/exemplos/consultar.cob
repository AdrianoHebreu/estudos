      *> CONSULTAR.COB - READ por chave, START e READ NEXT
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CONSULTAR.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS DYNAMIC
               RECORD KEY IS CLI-ID
               ALTERNATE RECORD KEY IS CLI-CIDADE WITH DUPLICATES
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
       01  WS-CIDADE               PIC X(10) VALUE "Lisboa".
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DA-LISTA                  VALUE "S".
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CLIENTES
           MOVE 3 TO CLI-ID
           READ F-CLIENTES
               INVALID KEY DISPLAY "cliente 3 nao existe"
               NOT INVALID KEY
                   DISPLAY "READ 3: " CLI-NOME " " CLI-CIDADE
           END-READ
           DISPLAY "estado " WS-ESTADO
           MOVE 99 TO CLI-ID
           READ F-CLIENTES
               INVALID KEY DISPLAY "cliente 99 nao existe"
           END-READ
           DISPLAY "estado " WS-ESTADO
           MOVE "Porto" TO CLI-CIDADE
           READ F-CLIENTES KEY IS CLI-CIDADE
               INVALID KEY DISPLAY "sem clientes no Porto"
               NOT INVALID KEY
                   DISPLAY "Porto: " CLI-ID " " CLI-NOME
           END-READ
           DISPLAY "estado " WS-ESTADO
           MOVE WS-CIDADE TO CLI-CIDADE
           START F-CLIENTES KEY IS = CLI-CIDADE
               INVALID KEY SET FIM-DA-LISTA TO TRUE
           END-START
           PERFORM UNTIL FIM-DA-LISTA
               READ F-CLIENTES NEXT
                   AT END SET FIM-DA-LISTA TO TRUE
                   NOT AT END
                       IF CLI-CIDADE = WS-CIDADE
                           DISPLAY "Lisboa: " CLI-ID " " CLI-NOME
                                   " estado " WS-ESTADO
                       ELSE
                           SET FIM-DA-LISTA TO TRUE
                       END-IF
               END-READ
           END-PERFORM
           MOVE 5 TO CLI-ID
           START F-CLIENTES KEY IS > CLI-ID
               INVALID KEY DISPLAY "START > falhou"
           END-START
           READ F-CLIENTES NEXT
           DISPLAY "a seguir ao 5: " CLI-ID " " CLI-NOME
           MOVE 10 TO CLI-ID
           START F-CLIENTES KEY IS >= CLI-ID
               INVALID KEY DISPLAY "START >= 10: estado " WS-ESTADO
           END-START
           CLOSE F-CLIENTES
           STOP RUN.
