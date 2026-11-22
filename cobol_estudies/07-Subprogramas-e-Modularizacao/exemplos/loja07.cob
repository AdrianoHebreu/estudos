      * Programa principal modular: encomendas com total e IVA.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. LOJA07.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENCOMENDAS ASSIGN TO "dados/encomendas.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-LINHAS ASSIGN TO "dados/linhas.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENCOMENDAS.
           COPY "encomenda.cpy".
       FD  F-LINHAS.
           COPY "linha.cpy".
       WORKING-STORAGE SECTION.
           COPY "pariva.cpy".
       01  WS-FIM-ENC             PIC X     VALUE "N".
           88  FIM-ENCOMENDAS               VALUE "S".
       01  WS-FIM-LIN             PIC X     VALUE "N".
           88  FIM-LINHAS                   VALUE "S".
       01  WS-DATA-TXT            PIC X(10).
       01  WS-ENC-SEM             PIC 9(08)V99.
       01  WS-ENC-COM             PIC 9(08)V99.
       01  WS-GERAL-COM           PIC 9(08)V99 VALUE ZEROS.
       01  WS-ED-SEM              PIC Z(5)9.99.
       01  WS-ED-COM              PIC Z(5)9.99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-ENCOMENDAS
           READ F-ENCOMENDAS
               AT END SET FIM-ENCOMENDAS TO TRUE
           END-READ
           PERFORM UNTIL FIM-ENCOMENDAS
               PERFORM TOTALIZAR-ENCOMENDA
               CALL "FMTDATA" USING ENC-DATA WS-DATA-TXT
               MOVE WS-ENC-SEM TO WS-ED-SEM
               MOVE WS-ENC-COM TO WS-ED-COM
               DISPLAY ENC-ID " " WS-DATA-TXT " " ENC-ESTADO
                       WS-ED-SEM " " WS-ED-COM
               ADD WS-ENC-COM TO WS-GERAL-COM
               READ F-ENCOMENDAS
                   AT END SET FIM-ENCOMENDAS TO TRUE
               END-READ
           END-PERFORM
           CLOSE F-ENCOMENDAS
           MOVE WS-GERAL-COM TO WS-ED-COM
           DISPLAY "Total geral com IVA: " WS-ED-COM
           PERFORM TESTAR-LINHA-INVALIDA
           STOP RUN.
       TOTALIZAR-ENCOMENDA.
           MOVE ZEROS TO WS-ENC-SEM WS-ENC-COM
           MOVE "N" TO WS-FIM-LIN
           OPEN INPUT F-LINHAS
           READ F-LINHAS AT END SET FIM-LINHAS TO TRUE END-READ
           PERFORM UNTIL FIM-LINHAS
               IF LIN-ENCOMENDA-ID = ENC-ID
                   MOVE LIN-QUANTIDADE TO PAR-QTD
                   MOVE LIN-PRECO-UNITARIO TO PAR-PRECO
                   MOVE 23 TO PAR-IVA-PERC
                   CALL "IVALINHA" USING PAR-LINHA
                   IF RETURN-CODE = 0
                       ADD PAR-SEM-IVA TO WS-ENC-SEM
                       ADD PAR-COM-IVA TO WS-ENC-COM
                   END-IF
               END-IF
               READ F-LINHAS
                   AT END SET FIM-LINHAS TO TRUE
               END-READ
           END-PERFORM
           CLOSE F-LINHAS.
       TESTAR-LINHA-INVALIDA.
           MOVE 0 TO PAR-QTD
           MOVE 12.90 TO PAR-PRECO
           MOVE 23 TO PAR-IVA-PERC
           CALL "IVALINHA" USING PAR-LINHA
           DISPLAY "linha com quantidade 0: rc=" RETURN-CODE
           CALL "FMTDATA" USING 20251345 WS-DATA-TXT
           DISPLAY "data 20251345: " WS-DATA-TXT " rc=" RETURN-CODE.
