      *> TRUNCAR.COB - campos com sinal e truncamento no MOVE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. TRUNCAR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *> Campos com sinal
       01  SALDO               PIC S9(03)     VALUE -42.
       01  SALDO-BRUTO         REDEFINES SALDO PIC X(03).
       01  SALDO-SEP           PIC S9(03) SIGN IS LEADING SEPARATE
                                              VALUE -42.
       01  SEM-SINAL           PIC 9(03).
       01  COM-SINAL           PIC S9(03).
      *> Destinos pequenos para o truncamento
       01  NUM-ORIGEM          PIC 9(05)V99   VALUE 12345.67.
       01  NUM-INTEIRO         PIC 9(03).
       01  NUM-CURTO           PIC 9(03)V9.
       01  NUM-GRANDE          PIC 9(07)V9999.
       01  TXT-ORIGEM          PIC X(25)
                               VALUE "Auscultadores Bluetooth".
       01  TXT-CURTO           PIC X(10).
       01  TXT-GRANDE          PIC X(30).
       01  CONTADOR            PIC 99         VALUE 99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- Sinal ---"
           DISPLAY "S9(03) com -42, DISPLAY : " SALDO
           DISPLAY "S9(03) com -42, bytes   : [" SALDO-BRUTO "] "
                   FUNCTION HEX-OF(SALDO-BRUTO)
           DISPLAY "SIGN LEADING SEPARATE   : " SALDO-SEP
           MOVE -42 TO SEM-SINAL
           DISPLAY "MOVE -42 para PIC 9(03) : " SEM-SINAL
           MOVE -42 TO COM-SINAL
           ADD 100 TO COM-SINAL
           DISPLAY "-42 + 100 em S9(03)     : " COM-SINAL
           DISPLAY "--- Truncamento de numeros ---"
           DISPLAY "Origem 9(05)V99         : " NUM-ORIGEM
           MOVE NUM-ORIGEM TO NUM-INTEIRO
           DISPLAY "Para 9(03)              : " NUM-INTEIRO
           MOVE NUM-ORIGEM TO NUM-CURTO
           DISPLAY "Para 9(03)V9            : " NUM-CURTO
           MOVE NUM-ORIGEM TO NUM-GRANDE
           DISPLAY "Para 9(07)V9999         : " NUM-GRANDE
           ADD 1 TO CONTADOR
           DISPLAY "99 + 1 em PIC 99        : " CONTADOR
           DISPLAY "--- Truncamento de texto ---"
           MOVE TXT-ORIGEM TO TXT-CURTO
           DISPLAY "Para X(10)  : [" TXT-CURTO "]"
           MOVE TXT-ORIGEM TO TXT-GRANDE
           DISPLAY "Para X(30)  : [" TXT-GRANDE "]"
           STOP RUN.
