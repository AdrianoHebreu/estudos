      *> ERRO-MOVE.COB - numero com decimais para texto: erro
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ERROMOVE.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  PRECO               PIC 9(05)V99 VALUE 12.90.
       01  TEXTO               PIC X(08).
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE PRECO TO TEXTO
           DISPLAY "[" TEXTO "]"
           STOP RUN.
