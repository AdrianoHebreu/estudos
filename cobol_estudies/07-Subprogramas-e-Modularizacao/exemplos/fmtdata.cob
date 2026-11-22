      * Formata AAAAMMDD como DD/MM/AAAA.
      * RETURN-CODE: 0 = ok, 4 = data invalida (texto ??/??/????).
       IDENTIFICATION DIVISION.
       PROGRAM-ID. FMTDATA.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01  WS-ENTRADA.
           05  WS-AAAA            PIC 9(04).
           05  WS-MM              PIC 9(02).
           05  WS-DD              PIC 9(02).
       01  WS-SAIDA.
           05  WS-S-DD            PIC 9(02).
           05  FILLER             PIC X     VALUE "/".
           05  WS-S-MM            PIC 9(02).
           05  FILLER             PIC X     VALUE "/".
           05  WS-S-AAAA          PIC 9(04).
       LINKAGE SECTION.
       01  LK-DATA                PIC 9(08).
       01  LK-TEXTO               PIC X(10).
       PROCEDURE DIVISION USING LK-DATA LK-TEXTO.
       PRINCIPAL.
           MOVE LK-DATA TO WS-ENTRADA
           IF WS-MM < 1 OR WS-MM > 12 OR WS-DD < 1 OR WS-DD > 31
               MOVE "??/??/????" TO LK-TEXTO
               MOVE 4 TO RETURN-CODE
           ELSE
               MOVE WS-DD TO WS-S-DD
               MOVE WS-MM TO WS-S-MM
               MOVE WS-AAAA TO WS-S-AAAA
               MOVE WS-SAIDA TO LK-TEXTO
               MOVE 0 TO RETURN-CODE
           END-IF
           GOBACK.
