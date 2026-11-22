      *> DATAS.COB - dia da semana, vencimento e diferenca entre datas
       IDENTIFICATION DIVISION.
       PROGRAM-ID. DATAS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT ARQ-ENC ASSIGN TO "encomendas.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  ARQ-ENC.
       01  REG-ENC.
           05  ENC-ID          PIC 9(04).
           05  ENC-CLIENTE     PIC 9(03).
           05  ENC-DATA        PIC 9(08).
           05  ENC-ESTADO      PIC X(10).
       WORKING-STORAGE SECTION.
       01  WS-FIM              PIC X VALUE "N".
           88  FIM-FICHEIRO    VALUE "S".
       01  NOMES-DIA.
           05  FILLER          PIC X(07) VALUE "domingo".
           05  FILLER          PIC X(07) VALUE "segunda".
           05  FILLER          PIC X(07) VALUE "terca  ".
           05  FILLER          PIC X(07) VALUE "quarta ".
           05  FILLER          PIC X(07) VALUE "quinta ".
           05  FILLER          PIC X(07) VALUE "sexta  ".
           05  FILLER          PIC X(07) VALUE "sabado ".
       01  TAB-DIAS            REDEFINES NOMES-DIA.
           05  NOME-DIA        PIC X(07) OCCURS 7 TIMES.
       01  WS-INTEIRO          PIC 9(07).
       01  WS-DIA-SEMANA       PIC 9.
       01  WS-VENCE            PIC 9(08).
       01  WS-DIAS             PIC S9(05).
       01  WS-DATA-REG         PIC 9(08) VALUE 20240115.
       01  WS-DATA-TXT         PIC 9999/99/99.
       01  WS-TESTE            PIC 9(08).
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT ARQ-ENC
           PERFORM UNTIL FIM-FICHEIRO
               READ ARQ-ENC
                   AT END SET FIM-FICHEIRO TO TRUE
                   NOT AT END PERFORM MOSTRAR
               END-READ
           END-PERFORM
           CLOSE ARQ-ENC
           COMPUTE WS-DIAS = FUNCTION INTEGER-OF-DATE(20250110)
               - FUNCTION INTEGER-OF-DATE(WS-DATA-REG)
           DISPLAY "dias entre 2024-01-15 e 2025-01-10: " WS-DIAS
           COMPUTE WS-DIAS = FUNCTION INTEGER-OF-DATE(20240115)
               - FUNCTION INTEGER-OF-DATE(20250110)
           DISPLAY "ordem trocada: " WS-DIAS
           DISPLAY "29 fev 2024:   "
               FUNCTION INTEGER-OF-DATE(20240229)
           DISPLAY "29 fev 2025:   "
               FUNCTION INTEGER-OF-DATE(20250229)
           DISPLAY "TEST-DATE 20250229: "
               FUNCTION TEST-DATE-YYYYMMDD(20250229)
           DISPLAY "TEST-DATE 20240229: "
               FUNCTION TEST-DATE-YYYYMMDD(20240229)
           STOP RUN.
       MOSTRAR.
           MOVE ENC-DATA TO WS-DATA-TXT
           COMPUTE WS-INTEIRO = FUNCTION INTEGER-OF-DATE(ENC-DATA)
           COMPUTE WS-DIA-SEMANA = FUNCTION MOD(WS-INTEIRO 7)
           COMPUTE WS-VENCE =
               FUNCTION DATE-OF-INTEGER(WS-INTEIRO + 30)
           DISPLAY ENC-ID " " WS-DATA-TXT " "
               NOME-DIA(WS-DIA-SEMANA + 1) " vence " WS-VENCE.
