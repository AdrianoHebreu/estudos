      *> PRECO_FINAL.COB - modulo COBOL chamado por um main em C
       IDENTIFICATION DIVISION.
       PROGRAM-ID. preco_final.
       DATA DIVISION.
       LINKAGE SECTION.
       01  LK-PRECO                PIC 9(05)V99.
       01  LK-FINAL                PIC 9(05)V99.
       PROCEDURE DIVISION USING LK-PRECO LK-FINAL.
           COMPUTE LK-FINAL ROUNDED = LK-PRECO * 1.23
           GOBACK.
