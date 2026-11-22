      * Subprograma que termina com EXIT PROGRAM.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SUBEXIT.
       PROCEDURE DIVISION.
           DISPLAY "  subexit: a devolver com EXIT PROGRAM".
           EXIT PROGRAM.
           DISPLAY "  subexit: esta linha ja nao devia aparecer".
           GOBACK.
