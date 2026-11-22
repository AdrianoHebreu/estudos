      *> LIMITES.COB - subscrito fora da tabela
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LIMITES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  TAB-DIAS.
           05  DIA-NOME        PIC X(07) OCCURS 3 TIMES.
       01  OUTRO-CAMPO         PIC X(07) VALUE "ESCONDE".
       01  WS-POS              PIC 9(02) VALUE 4.
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE "Segunda" TO DIA-NOME(1)
           MOVE "Terca"   TO DIA-NOME(2)
           MOVE "Quarta"  TO DIA-NOME(3)
           DISPLAY "Posicao " WS-POS ": [" DIA-NOME(WS-POS) "]"
           STOP RUN.
