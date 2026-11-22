      *> ATUALIZAR.COB - OPEN I-O e REWRITE num ficheiro sequencial
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ATUALIZAR.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CAT ASSIGN TO "cat-io.dat"
               ORGANIZATION IS SEQUENTIAL
               ACCESS MODE IS SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CAT.
       01  REG-CAT.
           05  CAT-ID              PIC 9(02).
           05  CAT-NOME            PIC X(15).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN I-O F-CAT
           DISPLAY "OPEN I-O: " WS-ESTADO
           READ F-CAT
           READ F-CAT
           MOVE "ELETRONICA" TO CAT-NOME
           REWRITE REG-CAT
           DISPLAY "REWRITE: " WS-ESTADO
           MOVE "TROCA" TO CAT-NOME
           WRITE REG-CAT
           DISPLAY "WRITE em I-O: " WS-ESTADO
           CLOSE F-CAT
           STOP RUN.
