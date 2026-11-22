      *> USAGE.COB - DISPLAY, COMP, COMP-3 e porque o dinheiro e decimal
       IDENTIFICATION DIVISION.
       PROGRAM-ID. USAGEDEMO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  N-DISPLAY       PIC 9(09)       VALUE 123456789.
       01  N-BINARIO       PIC 9(09) COMP  VALUE 123456789.
       01  N-EMPACOTADO    PIC 9(09) COMP-3 VALUE 123456789.
       01  P-DISPLAY       PIC S9(05)V99   VALUE -49.90.
       01  P-EMPACOTADO    PIC S9(05)V99 COMP-3 VALUE -49.90.
       01  B-QUATRO        PIC 9(04) COMP.
       01  B-DEZOITO       PIC 9(18) COMP.
       01  F-SIMPLES       COMP-1.
       01  F-DUPLA         COMP-2.
       01  D-TOTAL         PIC 9(03)V99    VALUE ZEROS.
       01  D-COMPARA       PIC 9(03)V99    VALUE 1.00.
       01  F-DIF           COMP-2.
       01  I               PIC 9(02).
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- Tamanho em bytes (FUNCTION LENGTH) ---"
           DISPLAY "9(09) DISPLAY      : " FUNCTION LENGTH(N-DISPLAY)
           DISPLAY "9(09) COMP         : " FUNCTION LENGTH(N-BINARIO)
           DISPLAY "9(09) COMP-3       : " FUNCTION LENGTH(N-EMPACOTADO)
           DISPLAY "S9(05)V99 DISPLAY  : " FUNCTION LENGTH(P-DISPLAY)
           DISPLAY "S9(05)V99 COMP-3   : " FUNCTION LENGTH(P-EMPACOTADO)
           DISPLAY "9(04) COMP         : " FUNCTION LENGTH(B-QUATRO)
           DISPLAY "9(18) COMP         : " FUNCTION LENGTH(B-DEZOITO)
           DISPLAY "COMP-1 (simples)   : " FUNCTION LENGTH(F-SIMPLES)
           DISPLAY "COMP-2 (dupla)     : " FUNCTION LENGTH(F-DUPLA)
           DISPLAY "--- Os bytes guardados (hexadecimal) ---"
           DISPLAY "DISPLAY  : " FUNCTION HEX-OF(N-DISPLAY)
           DISPLAY "COMP     : " FUNCTION HEX-OF(N-BINARIO)
           DISPLAY "COMP-3   : " FUNCTION HEX-OF(N-EMPACOTADO)
           DISPLAY "-49.90 DISPLAY : " FUNCTION HEX-OF(P-DISPLAY)
           DISPLAY "-49.90 COMP-3  : " FUNCTION HEX-OF(P-EMPACOTADO)
           DISPLAY "--- Somar 0.10 dez vezes ---"
           MOVE ZERO TO F-DUPLA
           PERFORM VARYING I FROM 1 BY 1 UNTIL I > 10
               ADD 0.1 TO F-DUPLA
               ADD 0.10 TO D-TOTAL
           END-PERFORM
           DISPLAY "COMP-2 (virgula flutuante): " F-DUPLA
           DISPLAY "9(03)V99 (decimal)        : " D-TOTAL
           COMPUTE F-DIF = F-DUPLA - 1
           DISPLAY "COMP-2 menos 1 (devia ser 0): " F-DIF
           IF F-DUPLA = 1.0
               DISPLAY "COMP-2 igual a 1.0: sim"
           ELSE
               DISPLAY "COMP-2 igual a 1.0: NAO"
           END-IF
           IF D-TOTAL = D-COMPARA
               DISPLAY "Decimal igual a 1.00: sim"
           ELSE
               DISPLAY "Decimal igual a 1.00: NAO"
           END-IF
           STOP RUN.
