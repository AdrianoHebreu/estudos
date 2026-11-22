      *> EBCDIC.COB - categorias.dat (ASCII) para EBCDIC
       IDENTIFICATION DIVISION.
       PROGRAM-ID. EBCDIC.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           ALPHABET ALFA-NATIVO IS NATIVE
           ALPHABET ALFA-EBCDIC IS EBCDIC.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENTRADA ASSIGN TO "categorias.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-SAIDA ASSIGN TO "categorias.ebc"
               ORGANIZATION IS SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENTRADA.
       01  REG-ENTRADA             PIC X(17).
       FD  F-SAIDA.
       01  REG-SAIDA               PIC X(17).
       WORKING-STORAGE SECTION.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-ENTRADA OUTPUT F-SAIDA
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-ENTRADA
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       INSPECT REG-ENTRADA
                           CONVERTING ALFA-NATIVO TO ALFA-EBCDIC
                       MOVE REG-ENTRADA TO REG-SAIDA
                       WRITE REG-SAIDA
               END-READ
           END-PERFORM
           CLOSE F-ENTRADA F-SAIDA
           STOP RUN.
