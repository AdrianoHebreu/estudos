      *> STOCK.COB - abater o stock por chave, linha a linha
       IDENTIFICATION DIVISION.
       PROGRAM-ID. STOCK.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-LINHAS ASSIGN TO "linhas.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-PRODUTOS ASSIGN TO "produtos.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS PRO-ID
               ALTERNATE RECORD KEY IS PRO-CATEGORIA-ID
                   WITH DUPLICATES
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-LINHAS.
       01  REG-LINHA.
           05  LIN-ID              PIC 9(04).
           05  LIN-ENCOMENDA-ID    PIC 9(04).
           05  LIN-PRODUTO-ID      PIC 9(03).
           05  LIN-QUANTIDADE      PIC 9(03).
           05  LIN-PRECO-UNITARIO  PIC 9(05)V99.
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
       PROCEDURE DIVISION.
       0000-PRINCIPAL.
           OPEN INPUT F-LINHAS
           OPEN I-O F-PRODUTOS
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-LINHAS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       IF LIN-ENCOMENDA-ID = 5 OR LIN-ENCOMENDA-ID = 8
                           PERFORM 1000-ABATER
                       END-IF
               END-READ
           END-PERFORM
           CLOSE F-LINHAS F-PRODUTOS
           STOP RUN.
       1000-ABATER.
           MOVE LIN-PRODUTO-ID TO PRO-ID
           READ F-PRODUTOS
               INVALID KEY
                   DISPLAY "produto " PRO-ID " inexistente"
               NOT INVALID KEY
                   IF PRO-STOCK < LIN-QUANTIDADE
                       DISPLAY "encomenda " LIN-ENCOMENDA-ID " "
                               PRO-NOME " sem stock (" PRO-STOCK ")"
                   ELSE
                       DISPLAY PRO-NOME " stock " PRO-STOCK
                               " -> " WITH NO ADVANCING
                       SUBTRACT LIN-QUANTIDADE FROM PRO-STOCK
                       REWRITE REG-PRODUTO
                       DISPLAY PRO-STOCK
                   END-IF
           END-READ.
