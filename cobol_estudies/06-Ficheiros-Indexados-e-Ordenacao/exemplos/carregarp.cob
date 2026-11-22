      *> CARREGARP.COB - produtos.dat para indexado
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CARREGARP.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENTRADA ASSIGN TO "produtos.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-PRODUTOS ASSIGN TO "produtos.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS SEQUENTIAL
               RECORD KEY IS PRO-ID
               ALTERNATE RECORD KEY IS PRO-CATEGORIA-ID
                   WITH DUPLICATES
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENTRADA.
       01  REG-ENTRADA             PIC X(42).
       FD  F-PRODUTOS.
       01  REG-PRODUTO.
           05  PRO-ID              PIC 9(03).
           05  PRO-NOME            PIC X(25).
           05  PRO-CATEGORIA-ID    PIC 9(02).
           05  PRO-PRECO           PIC 9(05)V99.
           05  PRO-STOCK           PIC 9(05).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-N                    PIC 99    VALUE 0.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-ENTRADA
           OPEN OUTPUT F-PRODUTOS
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ENTRADA
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       WRITE REG-PRODUTO FROM REG-ENTRADA
                           INVALID KEY
                               DISPLAY "falhou " REG-ENTRADA(1:3)
                                       " estado " WS-ESTADO
                           NOT INVALID KEY ADD 1 TO WS-N
                       END-WRITE
               END-READ
           END-PERFORM
           DISPLAY "Gravados: " WS-N
           CLOSE F-ENTRADA F-PRODUTOS
           STOP RUN.
