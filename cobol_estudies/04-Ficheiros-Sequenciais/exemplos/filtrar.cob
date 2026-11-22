      *> FILTRAR.COB - copiar os clientes de Lisboa para lisboa.dat
       IDENTIFICATION DIVISION.
       PROGRAM-ID. FILTRAR.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-LISBOA ASSIGN TO "lisboa.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
       01  REG-CLIENTE.
           05  CLI-ID              PIC 9(03).
           05  CLI-NOME            PIC X(20).
           05  CLI-EMAIL           PIC X(30).
           05  CLI-CIDADE          PIC X(10).
           05  CLI-DATA-REGISTO    PIC 9(08).
       FD  F-LISBOA.
       01  REG-LISBOA              PIC X(71).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-LIDOS                PIC 9(03) VALUE ZEROS.
       01  WS-GRAVADOS             PIC 9(03) VALUE ZEROS.
       01  WS-NOVO.
           05  FILLER              PIC X(03) VALUE "009".
           05  FILLER              PIC X(20) VALUE "Iris Barbosa".
           05  FILLER              PIC X(30) VALUE "iris@exemplo.pt".
           05  FILLER              PIC X(10) VALUE "Lisboa".
           05  FILLER              PIC X(08) VALUE "20250101".
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CLIENTES
           OPEN OUTPUT F-LISBOA
           PERFORM LER-CLIENTE
           PERFORM UNTIL FIM-DO-FICHEIRO
               ADD 1 TO WS-LIDOS
               IF CLI-CIDADE = "Lisboa"
                   WRITE REG-LISBOA FROM REG-CLIENTE
                   ADD 1 TO WS-GRAVADOS
               END-IF
               PERFORM LER-CLIENTE
           END-PERFORM
           CLOSE F-CLIENTES F-LISBOA
           DISPLAY "Lidos: " WS-LIDOS " Gravados: " WS-GRAVADOS
      *> EXTEND acrescenta no fim sem apagar o que ja la esta
           OPEN EXTEND F-LISBOA
           WRITE REG-LISBOA FROM WS-NOVO
           DISPLAY "WRITE em EXTEND: " WS-ESTADO
           CLOSE F-LISBOA
           STOP RUN.
       LER-CLIENTE.
           READ F-CLIENTES
               AT END SET FIM-DO-FICHEIRO TO TRUE
           END-READ.
