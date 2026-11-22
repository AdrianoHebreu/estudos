      *> CRLF.COB - linha com fim de linha CRLF lida como LF
       IDENTIFICATION DIVISION.
       PROGRAM-ID. CRLF.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CIDADES ASSIGN TO WS-NOME-FICHEIRO
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CIDADES.
       01  REG-CIDADE              PIC X(10).
       WORKING-STORAGE SECTION.
       01  WS-NOME-FICHEIRO        PIC X(30).
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       PROCEDURE DIVISION.
       PRINCIPAL.
           ACCEPT WS-NOME-FICHEIRO
           OPEN INPUT F-CIDADES
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-CIDADES
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       DISPLAY FUNCTION HEX-OF(REG-CIDADE)
                       IF REG-CIDADE = "Lisboa"
                           DISPLAY "  e Lisboa"
                       ELSE
                           DISPLAY "  nao e Lisboa"
                       END-IF
               END-READ
           END-PERFORM
           CLOSE F-CIDADES
           STOP RUN.
