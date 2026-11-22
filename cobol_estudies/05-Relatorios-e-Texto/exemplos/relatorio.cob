      *> RELATORIO.COB - encomendas por cliente, quebra de controlo
       IDENTIFICATION DIVISION.
       PROGRAM-ID. RELATORIO.
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SPECIAL-NAMES.
           DECIMAL-POINT IS COMMA.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ARQ-CLI ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT ARQ-ENC ASSIGN TO "enc-por-cli.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT ARQ-LIN ASSIGN TO "linhas.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT ARQ-REL ASSIGN TO "relatorio.txt"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  ARQ-CLI.
       01  REG-CLI.
           05  CLI-ID          PIC 9(03).
           05  CLI-NOME        PIC X(20).
           05  FILLER          PIC X(48).
       FD  ARQ-ENC.
       01  REG-ENC.
           05  ENC-ID          PIC 9(04).
           05  ENC-CLIENTE     PIC 9(03).
           05  ENC-DATA        PIC 9(08).
           05  ENC-ESTADO      PIC X(10).
       FD  ARQ-LIN.
       01  REG-LIN.
           05  LIN-ID          PIC 9(04).
           05  LIN-ENCOMENDA   PIC 9(04).
           05  LIN-PRODUTO     PIC 9(03).
           05  LIN-QTD         PIC 9(03).
           05  LIN-PRECO       PIC 9(05)V99.
       FD  ARQ-REL.
       01  REG-REL             PIC X(60).
       WORKING-STORAGE SECTION.
       01  WS-FIM              PIC X VALUE "N".
           88  FIM-FICHEIRO    VALUE "S".
       01  TAB-NOMES.
           05  NOME-CLI        PIC X(20) OCCURS 8 TIMES.
       01  TAB-TOTAIS.
           05  TOTAL-ENC       PIC 9(07)V99 VALUE ZERO OCCURS 12 TIMES.
       01  WS-CLI-ANT          PIC 9(03) VALUE ZERO.
       01  WS-SUB-CLI          PIC 9(07)V99 VALUE ZERO.
       01  WS-TOTAL-GERAL      PIC 9(07)V99 VALUE ZERO.
       01  WS-MAX-LIN          PIC 99 VALUE 8.
       01  WS-LIN              PIC 99 VALUE 99.
       01  WS-PAG              PIC 99 VALUE ZERO.
       01  CAB-1.
           05  FILLER          PIC X(36)
               VALUE "ENCOMENDAS POR CLIENTE".
           05  FILLER          PIC X(08) VALUE "Pagina ".
           05  CAB-PAG         PIC Z9.
       01  CAB-2.
           05  FILLER          PIC X(60)
               VALUE "Cliente              Enc   Data        Estado".
       01  LIN-DETALHE.
           05  DET-CLIENTE     PIC X(20).
           05  FILLER          PIC X VALUE SPACE.
           05  DET-ENC         PIC 9(04).
           05  FILLER          PIC XX VALUE SPACES.
           05  DET-DATA        PIC 9999/99/99.
           05  FILLER          PIC XX VALUE SPACES.
           05  DET-ESTADO      PIC X(10).
           05  FILLER          PIC X VALUE SPACE.
           05  DET-TOTAL       PIC ZZZ.ZZ9,99.
       01  LIN-SUBTOTAL.
           05  FILLER          PIC X(06) VALUE "Total ".
           05  SUB-CLIENTE     PIC X(20).
           05  FILLER          PIC X(23) VALUE ALL ".".
           05  SUB-TOTAL       PIC ZZZ.ZZ9,99.
       01  LIN-GERAL.
           05  FILLER          PIC X(47) VALUE "TOTAL GERAL".
           05  GER-TOTAL       PIC Z.ZZZ.ZZ9,99.
       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM CARREGAR-NOMES
           PERFORM CARREGAR-TOTAIS
           OPEN INPUT ARQ-ENC OUTPUT ARQ-REL
           READ ARQ-ENC AT END SET FIM-FICHEIRO TO TRUE END-READ
           IF NOT FIM-FICHEIRO
               MOVE ENC-CLIENTE TO WS-CLI-ANT
           END-IF
           PERFORM UNTIL FIM-FICHEIRO
               IF ENC-CLIENTE NOT = WS-CLI-ANT
                   PERFORM IMPRIMIR-SUBTOTAL
                   MOVE ENC-CLIENTE TO WS-CLI-ANT
               END-IF
               PERFORM IMPRIMIR-DETALHE
               READ ARQ-ENC AT END SET FIM-FICHEIRO TO TRUE END-READ
           END-PERFORM
           IF WS-CLI-ANT NOT = ZERO
               PERFORM IMPRIMIR-SUBTOTAL
           END-IF
           MOVE WS-TOTAL-GERAL TO GER-TOTAL
           WRITE REG-REL FROM LIN-GERAL AFTER ADVANCING 2 LINES
           CLOSE ARQ-ENC ARQ-REL
           STOP RUN.
       CARREGAR-NOMES.
           OPEN INPUT ARQ-CLI
           PERFORM UNTIL FIM-FICHEIRO
               READ ARQ-CLI
                   AT END SET FIM-FICHEIRO TO TRUE
                   NOT AT END MOVE CLI-NOME TO NOME-CLI(CLI-ID)
               END-READ
           END-PERFORM
           CLOSE ARQ-CLI
           MOVE "N" TO WS-FIM.
       CARREGAR-TOTAIS.
           OPEN INPUT ARQ-LIN
           PERFORM UNTIL FIM-FICHEIRO
               READ ARQ-LIN
                   AT END SET FIM-FICHEIRO TO TRUE
                   NOT AT END COMPUTE TOTAL-ENC(LIN-ENCOMENDA) =
                       TOTAL-ENC(LIN-ENCOMENDA) + LIN-QTD * LIN-PRECO
               END-READ
           END-PERFORM
           CLOSE ARQ-LIN
           MOVE "N" TO WS-FIM.
       IMPRIMIR-DETALHE.
           IF WS-LIN >= WS-MAX-LIN
               PERFORM IMPRIMIR-CABECALHO
           END-IF
           MOVE NOME-CLI(ENC-CLIENTE) TO DET-CLIENTE
           MOVE ENC-ID TO DET-ENC
           MOVE ENC-DATA TO DET-DATA
           MOVE ENC-ESTADO TO DET-ESTADO
           MOVE TOTAL-ENC(ENC-ID) TO DET-TOTAL
           WRITE REG-REL FROM LIN-DETALHE AFTER ADVANCING 1 LINE
           ADD 1 TO WS-LIN
           IF ENC-ESTADO NOT = "cancelada"
               ADD TOTAL-ENC(ENC-ID) TO WS-SUB-CLI
           END-IF.
       IMPRIMIR-SUBTOTAL.
           MOVE NOME-CLI(WS-CLI-ANT) TO SUB-CLIENTE
           MOVE WS-SUB-CLI TO SUB-TOTAL
           WRITE REG-REL FROM LIN-SUBTOTAL AFTER ADVANCING 1 LINE
           ADD 1 TO WS-LIN
           ADD WS-SUB-CLI TO WS-TOTAL-GERAL
           MOVE ZERO TO WS-SUB-CLI.
       IMPRIMIR-CABECALHO.
           ADD 1 TO WS-PAG
           MOVE WS-PAG TO CAB-PAG
           IF WS-PAG = 1
               WRITE REG-REL FROM CAB-1 AFTER ADVANCING 1 LINE
           ELSE
               WRITE REG-REL FROM CAB-1 AFTER ADVANCING PAGE
           END-IF
           WRITE REG-REL FROM CAB-2 AFTER ADVANCING 1 LINE
           MOVE 2 TO WS-LIN.
