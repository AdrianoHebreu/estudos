      *> ESTADOS.COB - codigos de FILE STATUS observados
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ESTADOS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CAT ASSIGN TO "categorias.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
           SELECT F-NADA ASSIGN TO "nao-existe.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
           SELECT F-SEMPASTA ASSIGN TO "/nada/saida.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CAT.
       01  REG-CAT                 PIC X(17).
       FD  F-NADA.
       01  REG-NADA                PIC X(10).
       FD  F-SEMPASTA.
       01  REG-SEMPASTA            PIC X(10).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-NADA
           DISPLAY "OPEN INPUT de ficheiro inexistente: " WS-ESTADO
           OPEN OUTPUT F-SEMPASTA
           DISPLAY "OPEN OUTPUT numa pasta inexistente: " WS-ESTADO
           READ F-CAT
           DISPLAY "READ sem OPEN: " WS-ESTADO
           OPEN INPUT F-CAT
           OPEN INPUT F-CAT
           DISPLAY "OPEN de ficheiro ja aberto: " WS-ESTADO
           WRITE REG-CAT
           DISPLAY "WRITE num ficheiro aberto so para leitura: "
                   WS-ESTADO
           READ F-CAT
           READ F-CAT
           READ F-CAT
           DISPLAY "3.o READ (registo 3): " WS-ESTADO
           READ F-CAT
           DISPLAY "4.o READ (fim): " WS-ESTADO
           READ F-CAT
           DISPLAY "READ depois do fim: " WS-ESTADO
           CLOSE F-CAT
           CLOSE F-CAT
           DISPLAY "CLOSE de ficheiro fechado: " WS-ESTADO
           STOP RUN.
