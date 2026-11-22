      *> ERROS.COB - tres falhas tipicas de ficheiros indexados
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERROS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-TESTE ASSIGN TO "teste.idx"
               ORGANIZATION IS INDEXED
               ACCESS MODE IS SEQUENTIAL
               RECORD KEY IS TST-ID
               FILE STATUS IS WS-ESTADO.
           SELECT F-FALTA ASSIGN TO "naoexiste.idx"
               ORGANIZATION IS INDEXED
               RECORD KEY IS FAL-ID
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-TESTE.
       01  REG-TESTE.
           05  TST-ID              PIC 9(03).
       FD  F-FALTA.
       01  REG-FALTA.
           05  FAL-ID              PIC 9(03).
       WORKING-STORAGE SECTION.
       01  WS-ESTADO               PIC XX.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN I-O F-FALTA
           DISPLAY "OPEN I-O sem ficheiro: " WS-ESTADO
           OPEN OUTPUT F-TESTE
           MOVE 5 TO TST-ID
           WRITE REG-TESTE
           DISPLAY "WRITE 5: " WS-ESTADO
           MOVE 3 TO TST-ID
           WRITE REG-TESTE
           DISPLAY "WRITE 3 depois do 5: " WS-ESTADO
           CLOSE F-TESTE
           STOP RUN.
