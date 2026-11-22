       IDENTIFICATION DIVISION.
       PROGRAM-ID. SEMST.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS CLI-ID
               ALTERNATE RECORD KEY IS CLI-CIDADE WITH DUPLICATES.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
       01  REG-CLIENTE.
           05  CLI-ID              PIC 9(03).
           05  CLI-NOME            PIC X(20).
           05  CLI-EMAIL           PIC X(30).
           05  CLI-CIDADE          PIC X(10).
           05  CLI-DATA-REGISTO    PIC 9(08).
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN I-O F-CLIENTES
           MOVE 1 TO CLI-ID
           WRITE REG-CLIENTE
           DISPLAY "chegou aqui"
           STOP RUN.
