      *> JUNTAR.COB - MERGE de dois ficheiros ja ordenados por preco
       IDENTIFICATION DIVISION.
       PROGRAM-ID. JUNTAR.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-A ASSIGN TO "porpreco.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-B ASSIGN TO "novos.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-TRABALHO ASSIGN TO "trabalho.tmp".
       DATA DIVISION.
       FILE SECTION.
       FD  F-A.
       01  REG-A                   PIC X(42).
       FD  F-B.
       01  REG-B                   PIC X(42).
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
           MERGE F-TRABALHO
               ON ASCENDING KEY TRB-PRECO
               USING F-A F-B
               OUTPUT PROCEDURE IS MOSTRAR
           STOP RUN.
       MOSTRAR SECTION.
           PERFORM UNTIL FIM-DO-FICHEIRO
               RETURN F-TRABALHO
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       MOVE TRB-PRECO TO WS-PRECO-ED
                       DISPLAY TRB-ID " " TRB-NOME WS-PRECO-ED
               END-RETURN
           END-PERFORM.
