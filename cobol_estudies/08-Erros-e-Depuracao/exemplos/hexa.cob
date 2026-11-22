      *> HEXA.COB - ver os bytes de um campo
       IDENTIFICATION DIVISION.
       PROGRAM-ID. HEXA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-TEXTO                PIC X(03) VALUE "A12".
       01  WS-VALOR                PIC S9(03) VALUE -12.
       01  WS-BIN                  PIC S9(04) COMP VALUE 258.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "texto " WS-TEXTO " = "
               FUNCTION HEX-OF (WS-TEXTO)
           DISPLAY "com sinal " WS-VALOR " = "
               FUNCTION HEX-OF (WS-VALOR)
           DISPLAY "binario " WS-BIN " = "
               FUNCTION HEX-OF (WS-BIN)
           STOP RUN.
