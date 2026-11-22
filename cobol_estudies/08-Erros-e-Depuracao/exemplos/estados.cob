      *> ESTADOS.COB - rotina central que traduz o FILE STATUS
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ESTADOS.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLI ASSIGN TO WS-NOME-FICH
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-ESTADO.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLI.
       01  REG-CLI                 PIC X(71).
       WORKING-STORAGE SECTION.
       01  WS-NOME-FICH            PIC X(20).
       01  WS-ESTADO               PIC XX.
       01  WS-OPERACAO             PIC X(12).
       01  WS-MENSAGEM             PIC X(40).
       PROCEDURE DIVISION.
       PRINCIPAL.
           MOVE "nao-existe.dat" TO WS-NOME-FICH
           MOVE "OPEN INPUT" TO WS-OPERACAO
           OPEN INPUT F-CLI
           PERFORM VERIFICA-ESTADO
           MOVE "clientes.dat" TO WS-NOME-FICH
           OPEN INPUT F-CLI
           PERFORM VERIFICA-ESTADO
           MOVE "OPEN 2a vez" TO WS-OPERACAO
           OPEN INPUT F-CLI
           PERFORM VERIFICA-ESTADO
           MOVE "WRITE" TO WS-OPERACAO
           WRITE REG-CLI
           PERFORM VERIFICA-ESTADO
           MOVE "READ" TO WS-OPERACAO
           PERFORM 9 TIMES
              READ F-CLI
           END-PERFORM
           PERFORM VERIFICA-ESTADO
           READ F-CLI
           PERFORM VERIFICA-ESTADO
           MOVE "CLOSE" TO WS-OPERACAO
           CLOSE F-CLI
           PERFORM VERIFICA-ESTADO
           CLOSE F-CLI
           PERFORM VERIFICA-ESTADO
           MOVE "READ" TO WS-OPERACAO
           READ F-CLI
           PERFORM VERIFICA-ESTADO
           STOP RUN.
      *> Uma so rotina para todos os ficheiros e operacoes.
       VERIFICA-ESTADO.
           EVALUATE WS-ESTADO
               WHEN "00" MOVE "sucesso" TO WS-MENSAGEM
               WHEN "10" MOVE "fim do ficheiro" TO WS-MENSAGEM
               WHEN "35" MOVE "ficheiro nao existe" TO WS-MENSAGEM
               WHEN "41" MOVE "ficheiro ja aberto" TO WS-MENSAGEM
               WHEN "42" MOVE "ficheiro nao aberto" TO WS-MENSAGEM
               WHEN "46" MOVE "READ depois do fim" TO WS-MENSAGEM
               WHEN "47" MOVE "READ sem OPEN INPUT/I-O" TO WS-MENSAGEM
               WHEN "48" MOVE "WRITE sem OPEN OUTPUT" TO WS-MENSAGEM
               WHEN OTHER MOVE "estado nao previsto" TO WS-MENSAGEM
           END-EVALUATE
           DISPLAY WS-OPERACAO " estado=" WS-ESTADO " " WS-MENSAGEM.
