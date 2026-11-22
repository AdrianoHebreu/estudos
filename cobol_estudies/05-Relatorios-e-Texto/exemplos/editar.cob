      *> EDITAR.COB - simbolos de edicao, um de cada vez
       IDENTIFICATION DIVISION.
       PROGRAM-ID. EDITAR.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-VALOR        PIC S9(05)V99 VALUE 1290.50.
       01  WS-PEQUENO      PIC S9(05)V99 VALUE 12.90.
       01  WS-NEG          PIC S9(05)V99 VALUE -49.9.
       01  WS-ZERO         PIC S9(05)V99 VALUE ZERO.
       01  WS-DATA         PIC 9(08)     VALUE 20250110.
       01  WS-TEL          PIC 9(09)     VALUE 912345678.
       01  E-Z             PIC ZZ,ZZ9.99.
       01  E-ASTER         PIC **,**9.99.
       01  E-FIXO          PIC 99,999.99.
       01  E-CIF           PIC $$$,$$9.99.
       01  E-MAIS          PIC +ZZ,ZZ9.99.
       01  E-MENOS         PIC -ZZ,ZZ9.99.
       01  E-FLUT          PIC ----9.99.
       01  E-CR            PIC ZZ,ZZ9.99CR.
       01  E-DB            PIC ZZ,ZZ9.99DB.
       01  E-ZERO0         PIC 9(05).99.
       01  E-BRANCO        PIC ZZ,ZZ9.99 BLANK WHEN ZERO.
       01  E-DATA          PIC 9999/99/99.
       01  E-TEL           PIC 999B999B999.
       01  E-ZEROS         PIC 9(05)00.
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE WS-VALOR TO E-Z      DISPLAY "Z       [" E-Z "]"
           MOVE WS-PEQUENO TO E-Z    DISPLAY "Z       [" E-Z "]"
           MOVE WS-ZERO TO E-Z       DISPLAY "Z zero  [" E-Z "]"
           MOVE WS-PEQUENO TO E-ASTER
           DISPLAY "*       [" E-ASTER "]"
           MOVE WS-PEQUENO TO E-FIXO
           DISPLAY "9 fixo  [" E-FIXO "]"
           MOVE WS-VALOR TO E-CIF    DISPLAY "$       [" E-CIF "]"
           MOVE WS-VALOR TO E-MAIS   DISPLAY "+ pos   [" E-MAIS "]"
           MOVE WS-NEG TO E-MAIS     DISPLAY "+ neg   [" E-MAIS "]"
           MOVE WS-VALOR TO E-MENOS  DISPLAY "- pos   [" E-MENOS "]"
           MOVE WS-NEG TO E-MENOS    DISPLAY "- neg   [" E-MENOS "]"
           MOVE WS-NEG TO E-FLUT     DISPLAY "---- neg[" E-FLUT "]"
           MOVE WS-VALOR TO E-FLUT   DISPLAY "---- pos[" E-FLUT "]"
           MOVE WS-VALOR TO E-CR     DISPLAY "CR pos  [" E-CR "]"
           MOVE WS-NEG TO E-CR       DISPLAY "CR neg  [" E-CR "]"
           MOVE WS-VALOR TO E-DB     DISPLAY "DB pos  [" E-DB "]"
           MOVE WS-NEG TO E-DB       DISPLAY "DB neg  [" E-DB "]"
           MOVE WS-PEQUENO TO E-ZERO0 DISPLAY "9.99    [" E-ZERO0 "]"
           MOVE WS-ZERO TO E-BRANCO  DISPLAY "BLANK   [" E-BRANCO "]"
           MOVE WS-DATA TO E-DATA    DISPLAY "/       [" E-DATA "]"
           MOVE WS-TEL TO E-TEL      DISPLAY "B       [" E-TEL "]"
           MOVE 123 TO E-ZEROS       DISPLAY "00      [" E-ZEROS "]"
           STOP RUN.
