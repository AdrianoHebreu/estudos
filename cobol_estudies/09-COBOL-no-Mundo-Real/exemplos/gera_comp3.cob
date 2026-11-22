      *> GERA_COMP3.COB - produtos.dat para produtos.bin (COMP-3, COMP)
       IDENTIFICATION DIVISION.
       PROGRAM-ID. GERACOMP3.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENTRADA ASSIGN TO "produtos.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-SAIDA ASSIGN TO "produtos.bin"
               ORGANIZATION IS SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENTRADA.
       01  REG-ENTRADA.
           05  ENT-ID              PIC 9(03).
           05  ENT-NOME            PIC X(25).
           05  ENT-CATEGORIA-ID    PIC 9(02).
           05  ENT-PRECO           PIC 9(05)V99.
           05  ENT-STOCK           PIC 9(05).
       FD  F-SAIDA.
       01  REG-SAIDA.
           05  SAI-ID              PIC 9(03).
           05  SAI-NOME            PIC X(25).
           05  SAI-CATEGORIA-ID    PIC 9(02).
           05  SAI-PRECO           PIC S9(05)V99 COMP-3.
           05  SAI-STOCK           PIC S9(05) COMP.
       WORKING-STORAGE SECTION.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-N                    PIC 99    VALUE 0.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-ENTRADA OUTPUT F-SAIDA
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ENTRADA
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       MOVE ENT-ID           TO SAI-ID
                       MOVE ENT-NOME         TO SAI-NOME
                       MOVE ENT-CATEGORIA-ID TO SAI-CATEGORIA-ID
                       MOVE ENT-PRECO        TO SAI-PRECO
                       MOVE ENT-STOCK        TO SAI-STOCK
                       WRITE REG-SAIDA
                       ADD 1 TO WS-N
               END-READ
           END-PERFORM
           CLOSE F-ENTRADA F-SAIDA
           DISPLAY WS-N " registos, " LENGTH OF REG-SAIDA " bytes cada"
           STOP RUN.
