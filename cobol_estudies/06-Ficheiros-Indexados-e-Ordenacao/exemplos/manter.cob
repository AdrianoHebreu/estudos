      *> MANTER.COB - WRITE, REWRITE e DELETE num ficheiro indexado
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MANTER.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
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
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN I-O F-CLIENTES
           MOVE 9 TO CLI-ID
           MOVE "Ines Faria" TO CLI-NOME
           MOVE "ines.faria@exemplo.pt" TO CLI-EMAIL
           MOVE "Faro" TO CLI-CIDADE
           MOVE 20241201 TO CLI-DATA-REGISTO
           WRITE REG-CLIENTE
               INVALID KEY DISPLAY "WRITE 9 falhou: " WS-ESTADO
               NOT INVALID KEY DISPLAY "WRITE 9 ok: " WS-ESTADO
           END-WRITE
           WRITE REG-CLIENTE
               INVALID KEY DISPLAY "WRITE 9 falhou: " WS-ESTADO
               NOT INVALID KEY DISPLAY "WRITE 9 ok: " WS-ESTADO
           END-WRITE
           MOVE 8 TO CLI-ID
           READ F-CLIENTES
           MOVE "hugo.teixeira@exemplo.pt" TO CLI-EMAIL
           REWRITE REG-CLIENTE
               INVALID KEY DISPLAY "REWRITE falhou: " WS-ESTADO
               NOT INVALID KEY DISPLAY "REWRITE 8 ok: " WS-ESTADO
           END-REWRITE
           MOVE 8 TO CLI-ID
           READ F-CLIENTES
           DISPLAY "8: " CLI-NOME CLI-EMAIL
           MOVE 9 TO CLI-ID
           DELETE F-CLIENTES
               INVALID KEY DISPLAY "DELETE 9 falhou: " WS-ESTADO
               NOT INVALID KEY DISPLAY "DELETE 9 ok: " WS-ESTADO
           END-DELETE
           DELETE F-CLIENTES
               INVALID KEY DISPLAY "DELETE 9 falhou: " WS-ESTADO
               NOT INVALID KEY DISPLAY "DELETE 9 ok: " WS-ESTADO
           END-DELETE
           CLOSE F-CLIENTES
           STOP RUN.
