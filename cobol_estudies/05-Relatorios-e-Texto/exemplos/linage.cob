      *> LINAGE.COB - paginacao automatica com LINAGE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LINAGE-DEMO.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ARQ-CLI ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT ARQ-REL ASSIGN TO "linage.txt"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  ARQ-CLI.
       01  REG-CLI.
           05  CLI-ID          PIC 9(03).
           05  CLI-NOME        PIC X(20).
           05  FILLER          PIC X(48).
       FD  ARQ-REL
           LINAGE IS 3 LINES.
       01  REG-REL             PIC X(40).
       WORKING-STORAGE SECTION.
       01  WS-FIM              PIC X VALUE "N".
           88  FIM-FICHEIRO    VALUE "S".
       01  WS-PAGINAS          PIC 99 VALUE ZERO.
       01  WS-LINHA.
           05  L-ID            PIC 9(03).
           05  FILLER          PIC XX VALUE SPACES.
           05  L-NOME          PIC X(20).
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT ARQ-CLI OUTPUT ARQ-REL
           PERFORM UNTIL FIM-FICHEIRO
               READ ARQ-CLI
                   AT END SET FIM-FICHEIRO TO TRUE
                   NOT AT END PERFORM ESCREVER
               END-READ
           END-PERFORM
           DISPLAY "paginas: " WS-PAGINAS
               " LINAGE-COUNTER: " LINAGE-COUNTER
           CLOSE ARQ-CLI ARQ-REL
           STOP RUN.
       ESCREVER.
           MOVE CLI-ID TO L-ID
           MOVE CLI-NOME TO L-NOME
           WRITE REG-REL FROM WS-LINHA AFTER ADVANCING 1 LINE
               AT END-OF-PAGE
                   ADD 1 TO WS-PAGINAS
                   DISPLAY "fim de pagina apos " L-ID
           END-WRITE.
