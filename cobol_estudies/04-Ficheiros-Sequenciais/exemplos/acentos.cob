      *> ACENTOS.COB - em UTF-8 cada letra acentuada ocupa 2 bytes
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ACENTOS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ACENTOS ASSIGN TO "acentos.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ACENTOS.
       01  REG-PESSOA.
           05  PES-NOME            PIC X(08).
           05  PES-CIDADE          PIC X(06).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-TEXTO                PIC X(10) VALUE "José".
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Bytes em ""José"": "
                   FUNCTION LENGTH("José")
           DISPLAY "Bytes em ""Jose"": "
                   FUNCTION LENGTH("Jose")
           DISPLAY FUNCTION UPPER-CASE(WS-TEXTO)
           OPEN INPUT F-ACENTOS
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ACENTOS
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       DISPLAY "nome=[" PES-NOME "] cidade=["
                               PES-CIDADE "] estado " WS-ESTADO
               END-READ
           END-PERFORM
           CLOSE F-ACENTOS
           STOP RUN.
