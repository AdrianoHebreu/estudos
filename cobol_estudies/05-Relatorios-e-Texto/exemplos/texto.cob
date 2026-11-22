      *> TEXTO.COB - STRING, UNSTRING, INSPECT e referencia por posicao
       IDENTIFICATION DIVISION.
       PROGRAM-ID. TEXTO.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-NOME         PIC X(20) VALUE "Ana Ribeiro".
       01  WS-EMAIL        PIC X(30) VALUE "ana.ribeiro@exemplo.pt".
       01  WS-SAIDA        PIC X(40).
       01  WS-CURTO        PIC X(12).
       01  WS-PTR          PIC 99.
       01  WS-UTILIZADOR   PIC X(20).
       01  WS-DOMINIO      PIC X(20).
       01  WS-N            PIC 99 VALUE ZERO.
       01  WS-PRIMEIRO     PIC X(10).
       01  WS-ULTIMO       PIC X(10).
       01  WS-CONTA        PIC 99.
       01  WS-FRASE        PIC X(24) VALUE "gestao de stock da loja".
       01  WS-CODIGO       PIC X(10) VALUE "A-12-B-34".
       PROCEDURE DIVISION.
       PRINCIPAL.
           STRING WS-NOME DELIMITED BY SPACE
               " <" DELIMITED BY SIZE
               WS-EMAIL DELIMITED BY SPACE
               ">" DELIMITED BY SIZE
               INTO WS-SAIDA
           END-STRING
           DISPLAY "STRING 1 [" WS-SAIDA "]"
           MOVE SPACES TO WS-SAIDA
           STRING WS-NOME DELIMITED BY "  "
               " <" DELIMITED BY SIZE
               WS-EMAIL DELIMITED BY SPACE
               ">" DELIMITED BY SIZE
               INTO WS-SAIDA
           END-STRING
           DISPLAY "STRING 2 [" WS-SAIDA "]"
           MOVE 1 TO WS-PTR
           STRING "ABC-" DELIMITED BY SIZE
               WS-NOME DELIMITED BY SIZE
               INTO WS-CURTO WITH POINTER WS-PTR
               ON OVERFLOW DISPLAY "STRING 3 transbordou, ponteiro "
                   WS-PTR
           END-STRING
           DISPLAY "STRING 3 [" WS-CURTO "]"
           UNSTRING WS-EMAIL DELIMITED BY "@" OR "."
               INTO WS-UTILIZADOR WS-DOMINIO
               TALLYING IN WS-N
           END-UNSTRING
           DISPLAY "UNSTRING [" WS-UTILIZADOR "] [" WS-DOMINIO "] "
               WS-N " campos"
           UNSTRING WS-NOME DELIMITED BY ALL SPACE
               INTO WS-PRIMEIRO WS-ULTIMO
           END-UNSTRING
           DISPLAY "nome     [" WS-PRIMEIRO "] [" WS-ULTIMO "]"
           MOVE ZERO TO WS-CONTA
           INSPECT WS-FRASE TALLYING WS-CONTA FOR ALL "t"
           DISPLAY "t:" WS-CONTA
           MOVE ZERO TO WS-CONTA
           INSPECT WS-FRASE TALLYING WS-CONTA FOR CHARACTERS
               BEFORE INITIAL " "
           DISPLAY "antes do 1o espaco: " WS-CONTA
           INSPECT WS-FRASE REPLACING FIRST "o" BY "0"
           DISPLAY "FIRST    [" WS-FRASE "]"
           INSPECT WS-FRASE REPLACING ALL "s" BY "$"
           DISPLAY "ALL      [" WS-FRASE "]"
           INSPECT WS-FRASE CONVERTING "abcdefghijklmnopqrstuvwxyz"
               TO "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
           DISPLAY "CONVERT  [" WS-FRASE "]"
           INSPECT WS-CODIGO REPLACING ALL "-" BY "/"
           DISPLAY "codigo   [" WS-CODIGO "]"
           DISPLAY "email(1:3)  [" WS-EMAIL(1:3) "]"
           DISPLAY "email(5:7)  [" WS-EMAIL(5:7) "]"
           DISPLAY "email(12:)  [" WS-EMAIL(12:) "]"
           MOVE "XY" TO WS-EMAIL(1:2)
           DISPLAY "alterado    [" WS-EMAIL "]"
           STOP RUN.
