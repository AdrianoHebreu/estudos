      *> CLIENTE.COB - ler os registos de clientes.dat para um grupo
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CLIENTE.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
       01  LINHA-CLIENTE       PIC X(71).
       WORKING-STORAGE SECTION.
       01  REG-CLIENTE.
           05  CLI-ID              PIC 9(03).
           05  CLI-NOME            PIC X(20).
           05  CLI-EMAIL           PIC X(30).
           05  CLI-CIDADE          PIC X(10).
           05  CLI-DATA-REGISTO    PIC 9(08).
           05  CLI-DATA-PARTES REDEFINES CLI-DATA-REGISTO.
               10  CLI-ANO         PIC 9(04).
               10  CLI-MES         PIC 9(02).
               10  CLI-DIA         PIC 9(02).
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-TOTAL                PIC 9(03) VALUE ZEROS.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Tamanho do registo REG-CLIENTE: "
                   FUNCTION LENGTH(REG-CLIENTE) " bytes"
           OPEN INPUT F-CLIENTES
           READ F-CLIENTES
               AT END SET FIM-DO-FICHEIRO TO TRUE
           END-READ
           PERFORM UNTIL FIM-DO-FICHEIRO
               MOVE LINHA-CLIENTE TO REG-CLIENTE
               ADD 1 TO WS-TOTAL
               DISPLAY "Cliente " CLI-ID ": " CLI-NOME
               DISPLAY "    cidade " CLI-CIDADE " desde "
                       CLI-DIA "/" CLI-MES "/" CLI-ANO
               IF CLI-EMAIL = SPACES
                   DISPLAY "    email: (sem email)"
               ELSE
                   DISPLAY "    email: " CLI-EMAIL
               END-IF
               READ F-CLIENTES
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ
           END-PERFORM
           CLOSE F-CLIENTES
           DISPLAY "Clientes lidos: " WS-TOTAL
           STOP RUN.
