      *> IMPORTA.COB - importa encomendas; invalidas para rejeicoes
       IDENTIFICATION DIVISION.
       PROGRAM-ID. IMPORTA.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-ENTRADA ASSIGN TO "encomendas-novas.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
           SELECT F-ACEITES ASSIGN TO "encomendas-aceites.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
           SELECT F-REJEITADOS ASSIGN TO "rejeicoes.dat"
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-ENTRADA.
       01  REG-ENTRADA.
           05  ENT-ID              PIC 9(04).
           05  ENT-CLIENTE-ID      PIC 9(03).
           05  ENT-DATA            PIC 9(08).
           05  ENT-ESTADO          PIC X(10).
               88  ESTADO-VALIDO   VALUES "pendente" "enviada"
                                          "entregue" "cancelada".
       FD  F-ACEITES.
       01  REG-ACEITE              PIC X(25).
       FD  F-REJEITADOS.
       01  REG-REJEITADO           PIC X(60).
       WORKING-STORAGE SECTION.
       78  MAX-CLIENTE             VALUE 8.
       01  WS-ESTADO               PIC XX.
       01  WS-CONTEXTO             PIC X(20).
       01  WS-FIM                  PIC X VALUE "N".
           88  FIM-FICHEIRO        VALUE "S".
       01  WS-MOTIVO               PIC X(30).
           88  SEM-MOTIVO          VALUE SPACES.
       01  WS-REJEICAO.
           05  REJ-LINHA           PIC X(25).
           05  FILLER              PIC X(03) VALUE " | ".
           05  REJ-MOTIVO          PIC X(30).
       01  WS-LIDOS                PIC 9(03) VALUE ZERO.
       01  WS-ACEITES              PIC 9(03) VALUE ZERO.
       01  WS-REJEITADOS           PIC 9(03) VALUE ZERO.
       01  WS-PERCENTAGEM          PIC 9(03)V9 VALUE ZERO.
       PROCEDURE DIVISION.
       PRINCIPAL.
           PERFORM ABRIR-FICHEIROS
           PERFORM LER-ENTRADA
           PERFORM UNTIL FIM-FICHEIRO
               PERFORM PROCESSAR-REGISTO
               PERFORM LER-ENTRADA
           END-PERFORM
           PERFORM FECHAR-FICHEIROS
           PERFORM RESUMIR
           STOP RUN.
       ABRIR-FICHEIROS.
           MOVE "OPEN entrada" TO WS-CONTEXTO
           OPEN INPUT F-ENTRADA
           PERFORM VERIFICAR-ESTADO
           MOVE "OPEN aceites" TO WS-CONTEXTO
           OPEN OUTPUT F-ACEITES
           PERFORM VERIFICAR-ESTADO
           MOVE "OPEN rejeitados" TO WS-CONTEXTO
           OPEN OUTPUT F-REJEITADOS
           PERFORM VERIFICAR-ESTADO.
       LER-ENTRADA.
           MOVE "READ entrada" TO WS-CONTEXTO
           READ F-ENTRADA
               AT END SET FIM-FICHEIRO TO TRUE
               NOT AT END ADD 1 TO WS-LIDOS
           END-READ
           IF NOT FIM-FICHEIRO
               PERFORM VERIFICAR-ESTADO
           END-IF.
       PROCESSAR-REGISTO.
           PERFORM VALIDAR-REGISTO
           IF SEM-MOTIVO
               PERFORM GRAVAR-ACEITE
           ELSE
               PERFORM GRAVAR-REJEICAO
           END-IF.
       VALIDAR-REGISTO.
           MOVE SPACES TO WS-MOTIVO
           EVALUATE TRUE
               WHEN ENT-ID NOT NUMERIC
                   MOVE "id nao numerico" TO WS-MOTIVO
               WHEN ENT-CLIENTE-ID NOT NUMERIC
                   MOVE "cliente nao numerico" TO WS-MOTIVO
               WHEN ENT-CLIENTE-ID < 1
                    OR ENT-CLIENTE-ID > MAX-CLIENTE
                   MOVE "cliente fora do intervalo" TO WS-MOTIVO
               WHEN ENT-DATA NOT NUMERIC
                   MOVE "data nao numerica" TO WS-MOTIVO
               WHEN FUNCTION TEST-DATE-YYYYMMDD (ENT-DATA) NOT = 0
                   MOVE "data invalida" TO WS-MOTIVO
               WHEN NOT ESTADO-VALIDO
                   MOVE "estado desconhecido" TO WS-MOTIVO
           END-EVALUATE.
       GRAVAR-ACEITE.
           MOVE "WRITE aceites" TO WS-CONTEXTO
           WRITE REG-ACEITE FROM REG-ENTRADA
           PERFORM VERIFICAR-ESTADO
           ADD 1 TO WS-ACEITES.
       GRAVAR-REJEICAO.
           MOVE "WRITE rejeitados" TO WS-CONTEXTO
           MOVE REG-ENTRADA TO REJ-LINHA
           MOVE WS-MOTIVO TO REJ-MOTIVO
           WRITE REG-REJEITADO FROM WS-REJEICAO
           PERFORM VERIFICAR-ESTADO
           ADD 1 TO WS-REJEITADOS.
       FECHAR-FICHEIROS.
           MOVE "CLOSE" TO WS-CONTEXTO
           CLOSE F-ENTRADA F-ACEITES F-REJEITADOS
           PERFORM VERIFICAR-ESTADO.
       RESUMIR.
           COMPUTE WS-PERCENTAGEM ROUNDED =
               WS-REJEITADOS * 100 / WS-LIDOS
               ON SIZE ERROR MOVE ZERO TO WS-PERCENTAGEM
           END-COMPUTE
           DISPLAY "lidos=" WS-LIDOS " aceites=" WS-ACEITES
               " rejeitados=" WS-REJEITADOS " (" WS-PERCENTAGEM "%)"
           IF WS-REJEITADOS > 0
               MOVE 4 TO RETURN-CODE
           END-IF.
       VERIFICAR-ESTADO.
           IF WS-ESTADO NOT = "00"
               DISPLAY "ERRO " WS-ESTADO " em " WS-CONTEXTO
               MOVE 12 TO RETURN-CODE
               STOP RUN
           END-IF.
