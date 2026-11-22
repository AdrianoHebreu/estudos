      *> REVISAO.COB - AT END, INVALID KEY, SIZE ERROR, ON EXCEPTION
       IDENTIFICATION DIVISION.
       PROGRAM-ID. REVISAO.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CAT ASSIGN TO "categorias.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-IDX ASSIGN TO "cat.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS IDX-ID
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CAT.
       01  REG-CAT.
           05  CAT-ID              PIC 9(02).
           05  CAT-NOME            PIC X(15).
       FD  F-IDX.
       01  REG-IDX.
           05  IDX-ID              PIC 9(02).
           05  IDX-NOME            PIC X(15).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       01  WS-PEQUENO              PIC 99 VALUE 90.
       01  WS-DIV                  PIC 99 VALUE 7.
       01  WS-ZERO                 PIC 99 VALUE 0.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CAT
           OPEN OUTPUT F-IDX
           READ F-CAT
              AT END DISPLAY "vazio"
              NOT AT END WRITE REG-IDX FROM REG-CAT
           END-READ
           WRITE REG-IDX FROM REG-CAT
              INVALID KEY DISPLAY "chave duplicada, estado " WS-ESTADO
           END-WRITE
           CLOSE F-IDX
           OPEN INPUT F-IDX
           MOVE 9 TO IDX-ID
           READ F-IDX
              INVALID KEY DISPLAY "chave 09 nao existe, estado "
                  WS-ESTADO
           END-READ
           CLOSE F-IDX F-CAT
           ADD 20 TO WS-PEQUENO
              ON SIZE ERROR DISPLAY "estouro, WS-PEQUENO=" WS-PEQUENO
           END-ADD
           DIVIDE WS-DIV BY WS-ZERO GIVING WS-DIV
              ON SIZE ERROR DISPLAY "divisao por zero, WS-DIV=" WS-DIV
           END-DIVIDE
           CALL "MODULO-FANTASMA"
              ON EXCEPTION DISPLAY "CALL falhou (ON EXCEPTION)"
              END-DISPLAY
              NOT ON EXCEPTION DISPLAY "CALL ok" END-DISPLAY
           END-CALL
           STOP RUN.
