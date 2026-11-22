      *> PORCIDADE.COB - READ por chave, START e READ NEXT
       IDENTIFICATION DIVISION.
       PROGRAM-ID. PORCIDADE.
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
           MOVE LOW-VALUES TO CLI-CIDADE
           START F-CLIENTES KEY IS >= CLI-CIDADE
           PERFORM UNTIL FIM-DA-LISTA
               READ F-CLIENTES NEXT
                   AT END SET FIM-DA-LISTA TO TRUE
                   NOT AT END
                       DISPLAY CLI-CIDADE " " CLI-ID " " CLI-NOME
               END-READ
           END-PERFORM
           CLOSE F-CLIENTES
           STOP RUN.
