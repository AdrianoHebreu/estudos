      *> MOVER.COB - regras do MOVE (alfanumerico, numerico, grupo)
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MOVER.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
      *> Texto para texto
       01  TXT-ORIGEM          PIC X(10)    VALUE "ABCDEFGHIJ".
       01  TXT-CURTO           PIC X(05).
       01  TXT-LONGO           PIC X(15).
      *> Numero para texto e texto para numero
       01  NUM-STOCK           PIC 9(05)    VALUE 30.
       01  NUM-NEGATIVO        PIC S9(03)   VALUE -42.
       01  TXT-DESTINO         PIC X(08).
       01  TXT-DIGITOS         PIC X(05)    VALUE "00042".
       01  TXT-CURTO-DIG       PIC X(03)    VALUE "42 ".
       01  TXT-LETRAS          PIC X(03)    VALUE "ABC".
       01  NUM-DESTINO         PIC 9(05).
      *> Mover grupos: o grupo e tratado como texto
       01  GRUPO-A.
           05  A-ID            PIC 9(03)    VALUE 4.
           05  A-NOME          PIC X(10)    VALUE "Bluetooth".
           05  A-PRECO         PIC 9(03)V99 VALUE 49.90.
       01  GRUPO-B.
           05  B-ID            PIC 9(03).
           05  B-NOME          PIC X(10).
           05  B-PRECO         PIC 9(03)V99.
       01  GRUPO-C.
           05  C-TEXTO         PIC X(08).
           05  C-NUMERO        PIC 9(07).
      *> MOVE CORRESPONDING: so os nomes iguais, noutra ordem
       01  ENC-ENTRADA.
           05  ID-ENC          PIC 9(04)    VALUE 12.
           05  CLIENTE-ID      PIC 9(03)    VALUE 2.
           05  ESTADO          PIC X(10)    VALUE "pendente".
           05  SO-NA-ENTRADA   PIC X(03)    VALUE "XXX".
       01  ENC-SAIDA.
           05  ESTADO          PIC X(12).
           05  ID-ENC          PIC 9(06).
           05  SO-NA-SAIDA     PIC X(03)    VALUE "---".
           05  CLIENTE-ID      PIC 9(03).
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "--- Texto para texto ---"
           MOVE TXT-ORIGEM TO TXT-CURTO
           DISPLAY "X(10) para X(05): [" TXT-CURTO "]"
           MOVE TXT-ORIGEM TO TXT-LONGO
           DISPLAY "X(10) para X(15): [" TXT-LONGO "]"
           MOVE "ola" TO TXT-LONGO
           DISPLAY "literal para X(15): [" TXT-LONGO "]"
           DISPLAY "--- Numero para texto ---"
           MOVE NUM-STOCK TO TXT-DESTINO
           DISPLAY "9(05) 30 para X(08): [" TXT-DESTINO "]"
           MOVE NUM-NEGATIVO TO TXT-DESTINO
           DISPLAY "S9(03) -42 para X(08): [" TXT-DESTINO "]"
           MOVE 7 TO TXT-DESTINO
           DISPLAY "literal 7 para X(08): [" TXT-DESTINO "]"
           DISPLAY "--- Texto para numero ---"
           MOVE TXT-DIGITOS TO NUM-DESTINO
           DISPLAY "X(05) 00042 para 9(05): [" NUM-DESTINO "]"
           MOVE TXT-CURTO-DIG TO NUM-DESTINO
           DISPLAY "X(03) 42+espaco para 9(05): [" NUM-DESTINO "]"
           IF NUM-DESTINO IS NUMERIC
               DISPLAY "    esse campo e NUMERIC"
           ELSE
               DISPLAY "    esse campo NAO e NUMERIC"
           END-IF
           MOVE TXT-LETRAS TO NUM-DESTINO
           DISPLAY "X(03) ABC para 9(05): [" NUM-DESTINO "]"
           DISPLAY "--- Grupos ---"
           MOVE GRUPO-A TO GRUPO-B
           DISPLAY "A para B (mesmo desenho): [" GRUPO-B "]"
           MOVE GRUPO-A TO GRUPO-C
           DISPLAY "A para C (desenho diferente): [" GRUPO-C "]"
           DISPLAY "    C-TEXTO  [" C-TEXTO "]"
           DISPLAY "    C-NUMERO [" C-NUMERO "]"
           IF C-NUMERO IS NUMERIC
               DISPLAY "    C-NUMERO e NUMERIC"
           ELSE
               DISPLAY "    C-NUMERO NAO e NUMERIC"
           END-IF
           MOVE SPACES TO GRUPO-B
           IF B-ID IS NUMERIC
               DISPLAY "SPACES no grupo: B-ID e NUMERIC"
           ELSE
               DISPLAY "SPACES no grupo: B-ID NAO e NUMERIC"
           END-IF
           INITIALIZE GRUPO-B
           DISPLAY "INITIALIZE no grupo: [" GRUPO-B "]"
           DISPLAY "--- MOVE CORRESPONDING ---"
           MOVE CORRESPONDING ENC-ENTRADA TO ENC-SAIDA
           DISPLAY "ID-ENC     : [" ID-ENC OF ENC-SAIDA "]"
           DISPLAY "CLIENTE-ID : [" CLIENTE-ID OF ENC-SAIDA "]"
           DISPLAY "ESTADO     : [" ESTADO OF ENC-SAIDA "]"
           DISPLAY "SO-NA-SAIDA: [" SO-NA-SAIDA "] (ficou como estava)"
           STOP RUN.
