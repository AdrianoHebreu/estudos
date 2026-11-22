      *> ORDENAR.COB - SORT com USING/GIVING e com procedimentos
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ORDENAR.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-PRODUTOS ASSIGN TO "produtos.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-ORDENADO ASSIGN TO "porpreco.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-TRABALHO ASSIGN TO "trabalho.tmp".
       DATA DIVISION.
       FILE SECTION.
       FD  F-PRODUTOS.
       01  REG-PRODUTO             PIC X(42).
       FD  F-ORDENADO.
       01  REG-ORDENADO.
           05  ORD-ID              PIC 9(03).
           05  ORD-NOME            PIC X(25).
           05  FILLER              PIC 9(02).
           05  ORD-PRECO           PIC 9(05)V99.
           05  ORD-STOCK           PIC 9(05).
       SD  F-TRABALHO.
       01  REG-TRABALHO.
           05  TRB-ID              PIC 9(03).
           05  TRB-NOME            PIC X(25).
           05  TRB-CATEGORIA-ID    PIC 9(02).
           05  TRB-PRECO           PIC 9(05)V99.
           05  TRB-STOCK           PIC 9(05).
       WORKING-STORAGE SECTION.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-PRECO-ED             PIC ZZ9.99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           SORT F-TRABALHO
               ON ASCENDING KEY TRB-PRECO
               USING F-PRODUTOS
               GIVING F-ORDENADO
           DISPLAY "SORT 1 terminou, SORT-RETURN " SORT-RETURN
           OPEN INPUT F-ORDENADO
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ORDENADO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       MOVE ORD-PRECO TO WS-PRECO-ED
                       DISPLAY ORD-ID " " ORD-NOME WS-PRECO-ED
               END-READ
           END-PERFORM
           CLOSE F-ORDENADO
           SORT F-TRABALHO
               ON ASCENDING KEY TRB-CATEGORIA-ID
               ON DESCENDING KEY TRB-PRECO
               INPUT PROCEDURE IS SO-COM-STOCK
               OUTPUT PROCEDURE IS MOSTRAR
           STOP RUN.
       SO-COM-STOCK SECTION.
           OPEN INPUT F-PRODUTOS
           MOVE "N" TO WS-FIM
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-PRODUTOS INTO REG-TRABALHO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       IF TRB-STOCK > 0
                           RELEASE REG-TRABALHO
                       END-IF
               END-READ
           END-PERFORM
           CLOSE F-PRODUTOS.
       MOSTRAR SECTION.
           MOVE "N" TO WS-FIM
           PERFORM UNTIL FIM-DO-FICHEIRO
               RETURN F-TRABALHO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       MOVE TRB-PRECO TO WS-PRECO-ED
                       DISPLAY "cat " TRB-CATEGORIA-ID " " TRB-NOME
                               WS-PRECO-ED
               END-RETURN
           END-PERFORM.
