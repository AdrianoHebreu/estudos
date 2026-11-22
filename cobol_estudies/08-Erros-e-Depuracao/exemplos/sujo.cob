      *> SUJO.COB - dados sujos num campo numerico
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SUJO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-TEXTO                PIC X(03).
       01  WS-NUM REDEFINES WS-TEXTO PIC 9(03).
       01  WS-TOTAL                PIC 9(05) VALUE ZERO.
       01  WS-IDX                  PIC 9.
       01  WS-TABELA.
           05  FILLER              PIC X(03) VALUE "012".
           05  FILLER              PIC X(03) VALUE "A12".
           05  FILLER              PIC X(03) VALUE "   ".
           05  FILLER              PIC X(03) VALUE " 12".
           05  FILLER              PIC X(03) VALUE "1.5".
       01  WS-LINHAS REDEFINES WS-TABELA.
           05  WS-LINHA            PIC X(03) OCCURS 5 TIMES.
       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM VARYING WS-IDX FROM 1 BY 1 UNTIL WS-IDX > 5
              MOVE WS-LINHA (WS-IDX) TO WS-TEXTO
              IF WS-NUM IS NUMERIC
                 DISPLAY "[" WS-TEXTO "] numerico"
                 ADD WS-NUM TO WS-TOTAL
              ELSE
                 DISPLAY "[" WS-TEXTO "] NAO numerico"
                 ADD WS-NUM TO WS-TOTAL
              END-IF
              DISPLAY "    WS-NUM=" WS-NUM " total=" WS-TOTAL
           END-PERFORM
           STOP RUN.
