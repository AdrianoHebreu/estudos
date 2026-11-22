      *> FUNCOES.COB - funcoes intrinsecas de texto e numeros
       IDENTIFICATION DIVISION.
       PROGRAM-ID. FUNCOES.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME         PIC X(20) VALUE "  Ana Ribeiro".
       01  WS-TEXTO        PIC X(10) VALUE "12.90".
       01  WS-NUM          PIC 9(05)V99.
       01  WS-PRECOS.
           05  FILLER      PIC 9(05)V99 VALUE 12.90.
           05  FILLER      PIC 9(05)V99 VALUE 49.90.
           05  FILLER      PIC 9(05)V99 VALUE 6.50.
       01  TAB-PRECOS      REDEFINES WS-PRECOS.
           05  PRECO       PIC 9(05)V99 OCCURS 3 TIMES.
       01  WS-RES          PIC X(30).
       01  WS-INT          PIC 9(05).
       01  WS-DEC          PIC 9(05)V99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "LENGTH nome   " FUNCTION LENGTH(WS-NOME)
           DISPLAY "TRIM [" FUNCTION TRIM(WS-NOME) "]"
           DISPLAY "TRIM leading [" FUNCTION TRIM(WS-NOME LEADING)
               "]"
           DISPLAY "LENGTH trim   "
               FUNCTION LENGTH(FUNCTION TRIM(WS-NOME))
           DISPLAY "UPPER [" FUNCTION UPPER-CASE(WS-NOME) "]"
           DISPLAY "LOWER [" FUNCTION LOWER-CASE(WS-NOME) "]"
           DISPLAY "REVERSE [" FUNCTION REVERSE(
               FUNCTION TRIM(WS-NOME)) "]"
           COMPUTE WS-NUM = FUNCTION NUMVAL(WS-TEXTO)
           DISPLAY "NUMVAL " WS-NUM
           COMPUTE WS-DEC = FUNCTION NUMVAL("  1290.50 ") + 1
           DISPLAY "NUMVAL+1 " WS-DEC
           DISPLAY "MAX " FUNCTION MAX(PRECO(1) PRECO(2) PRECO(3))
           DISPLAY "MIN " FUNCTION MIN(PRECO(1) PRECO(2) PRECO(3))
           DISPLAY "MOD 17 5  " FUNCTION MOD(17 5)
           DISPLAY "MOD -17 5 " FUNCTION MOD(-17 5)
           DISPLAY "REM -17 5 " FUNCTION REM(-17 5)
           DISPLAY "CURRENT-DATE [" FUNCTION CURRENT-DATE "]"
           STOP RUN.
