      *> EXPORTA.COB - clientes.dat para CSV, JSON e XML
       IDENTIFICATION DIVISION.
       PROGRAM-ID. EXPORTA.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-CSV ASSIGN TO "clientes.csv"
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT F-JSON ASSIGN TO "clientes.jsonl"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
       01  REG-CLIENTE.
           05  CLI-ID              PIC 9(03).
           05  CLI-NOME            PIC X(20).
           05  CLI-EMAIL           PIC X(30).
           05  CLI-CIDADE          PIC X(10).
           05  CLI-DATA-REGISTO    PIC 9(08).
       FD  F-CSV.
       01  LINHA-CSV               PIC X(100).
       FD  F-JSON.
       01  LINHA-JSON              PIC X(200).
       WORKING-STORAGE SECTION.
       01  WS-FIM                  PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO               VALUE "S".
       01  WS-JSON                 PIC X(200).
       01  WS-TAM                  PIC 9(04).
       01  WS-XML                  PIC X(200).
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CLIENTES OUTPUT F-CSV F-JSON
           MOVE "id;nome;email;cidade;data_registo" TO LINHA-CSV
           WRITE LINHA-CSV
           PERFORM UNTIL FIM-DO-FICHEIRO
               READ F-CLIENTES
                   AT END SET FIM-DO-FICHEIRO TO TRUE
                   NOT AT END
                       PERFORM GRAVAR-CSV
                       PERFORM GRAVAR-JSON
                       IF CLI-ID = 1 PERFORM MOSTRAR-XML END-IF
               END-READ
           END-PERFORM
           CLOSE F-CLIENTES F-CSV F-JSON
           STOP RUN.
       GRAVAR-CSV.
           MOVE SPACES TO LINHA-CSV
           STRING CLI-ID                       DELIMITED BY SIZE
                  ";"                          DELIMITED BY SIZE
                  FUNCTION TRIM(CLI-NOME)      DELIMITED BY SIZE
                  ";"                          DELIMITED BY SIZE
                  FUNCTION TRIM(CLI-EMAIL)     DELIMITED BY SIZE
                  ";"                          DELIMITED BY SIZE
                  FUNCTION TRIM(CLI-CIDADE)    DELIMITED BY SIZE
                  ";"                          DELIMITED BY SIZE
                  CLI-DATA-REGISTO             DELIMITED BY SIZE
               INTO LINHA-CSV
           END-STRING
           WRITE LINHA-CSV.
       GRAVAR-JSON.
           MOVE SPACES TO WS-JSON
           JSON GENERATE WS-JSON FROM REG-CLIENTE COUNT IN WS-TAM
               ON EXCEPTION DISPLAY "JSON falhou"
           END-JSON
           MOVE WS-JSON(1:WS-TAM) TO LINHA-JSON
           WRITE LINHA-JSON.
       MOSTRAR-XML.
           XML GENERATE WS-XML FROM REG-CLIENTE COUNT IN WS-TAM
               ON EXCEPTION DISPLAY "XML falhou"
           END-XML
           DISPLAY WS-XML(1:WS-TAM).
