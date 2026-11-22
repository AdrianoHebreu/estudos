      *> FORMATOS.COB - ler categorias de ficheiros com formatos
      *> diferentes; o nome do ficheiro vem de uma variavel
       IDENTIFICATION DIVISION.
       PROGRAM-ID. FORMATOS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-LINHAS ASSIGN TO WS-NOME-FICHEIRO
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
           SELECT F-FIXO ASSIGN TO WS-NOME-FICHEIRO
               ORGANIZATION IS SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-LINHAS.
       01  REG-LINHAS.
           05  CAT-ID              PIC 9(02).
           05  CAT-NOME            PIC X(15).
       FD  F-FIXO.
       01  REG-FIXO.
           05  FIX-ID              PIC 9(02).
           05  FIX-NOME            PIC X(15).
       WORKING-STORAGE SECTION.
       01  WS-NOME-FICHEIRO        PIC X(30).
       01  WS-MODO                 PIC X.
       01  WS-ESTADO               PIC XX.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       PROCEDURE DIVISION.
       PRINCIPAL.
           ACCEPT WS-NOME-FICHEIRO
           ACCEPT WS-MODO
           IF WS-MODO = "L"
               OPEN INPUT F-LINHAS
               DISPLAY "OPEN: " WS-ESTADO
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-LINHAS
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           DISPLAY "[" CAT-ID "][" CAT-NOME "]"
                   END-READ
               END-PERFORM
               CLOSE F-LINHAS
           ELSE
               OPEN INPUT F-FIXO
               DISPLAY "OPEN: " WS-ESTADO
               PERFORM UNTIL FIM-DO-FICHEIRO
                   READ F-FIXO
                       AT END SET FIM-DO-FICHEIRO TO TRUE
                       NOT AT END
                           DISPLAY "ID em hex: "
                                   FUNCTION HEX-OF(FIX-ID)
                                   " nome: " FIX-NOME
                   END-READ
               END-PERFORM
               CLOSE F-FIXO
           END-IF
           STOP RUN.
