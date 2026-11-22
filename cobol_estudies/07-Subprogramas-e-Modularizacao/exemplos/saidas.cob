      * EXIT PROGRAM chamado de um subprograma e do principal.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SAIDAS.
       PROCEDURE DIVISION.
       INICIO.
           CALL "SUBEXIT".
           DISPLAY "saidas: voltei de SUBEXIT".
           EXIT PROGRAM.
           DISPLAY "saidas: depois do EXIT PROGRAM no principal".
           GOBACK.
