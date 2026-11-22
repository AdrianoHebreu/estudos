      *> SEMSTATUS.COB - sem FILE STATUS o erro termina o programa
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SEMSTATUS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-NADA ASSIGN TO "nao-existe.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-NADA.
       01  REG-NADA                PIC X(10).
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-NADA
           DISPLAY "chegou aqui".
           STOP RUN.
