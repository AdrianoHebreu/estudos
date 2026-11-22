      *> RELATIVO.COB - ficheiro relativo: o registo e o numero
       IDENTIFICATION DIVISION.
       PROGRAM-ID. RELATIVO.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENTRADA ASSIGN TO "produtos.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-REL ASSIGN TO "produtos.rel"
               ORGANIZATION IS RELATIVE
               ACCESS MODE IS DYNAMIC
               RELATIVE KEY IS WS-NUM
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENTRADA.
       01  REG-ENTRADA.
           05  ENT-ID              PIC 9(03).
           05  FILLER              PIC X(39).
       FD  F-REL.
       01  REG-REL.
           05  REL-ID              PIC 9(03).
           05  REL-NOME            PIC X(25).
           05  FILLER              PIC X(14).
       WORKING-STORAGE SECTION.
       01  WS-NUM                  PIC 9(03).
       01  WS-ESTADO               PIC XX.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-ENTRADA OUTPUT F-REL
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ENTRADA
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       MOVE ENT-ID TO WS-NUM
                       WRITE REG-REL FROM REG-ENTRADA
               END-READ
           END-PERFORM
           CLOSE F-ENTRADA F-REL
           OPEN I-O F-REL
           MOVE 7 TO WS-NUM
           READ F-REL
           DISPLAY "registo " WS-NUM ": " REL-NOME
           MOVE 3 TO WS-NUM
           DELETE F-REL
           READ F-REL
               INVALID KEY DISPLAY "registo 3: estado " WS-ESTADO
           END-READ
           MOVE 2 TO WS-NUM
           START F-REL KEY IS > WS-NUM
           READ F-REL NEXT
           DISPLAY "a seguir ao 2: " WS-NUM " " REL-NOME
           CLOSE F-REL
           STOP RUN.
