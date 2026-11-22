      *> VIR.COB - DECIMAL-POINT IS COMMA e CURRENCY SIGN
       IDENTIFICATION DIVISION.
       PROGRAM-ID. VIR.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA
           CURRENCY SIGN IS "#".
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-VALOR        PIC 9(05)V99 VALUE 1290,50.
       01  E-PT            PIC ZZ.ZZ9,99.
       01  E-MOEDA         PIC ###.##9,99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE WS-VALOR TO E-PT
           DISPLAY "virgula [" E-PT "]"
           MOVE WS-VALOR TO E-MOEDA
           DISPLAY "moeda   [" E-MOEDA "]"
           DISPLAY "interno [" WS-VALOR "]"
           STOP RUN.
