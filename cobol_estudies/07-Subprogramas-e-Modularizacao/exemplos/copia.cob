      * COPY de copybook da loja, com e sem REPLACING.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. COPIA.
       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT F-CLIENTES ASSIGN TO "dados/clientes.dat"
               ORGANIZATION IS LINE SEQUENTIAL.
       DATA DIVISION.
       FILE SECTION.
       FD  F-CLIENTES.
           COPY "cliente.cpy".
       WORKING-STORAGE SECTION.
           COPY "cliente.cpy"
               REPLACING LEADING ==CLI-== BY ==ANT-==
                         ==REG-CLIENTE== BY ==REG-ANTERIOR==.
       01  WS-FIM                 PIC X     VALUE "N".
           88  FIM-DO-FICHEIRO              VALUE "S".
       PROCEDURE DIVISION.
       PRINCIPAL.
           OPEN INPUT F-CLIENTES
           READ F-CLIENTES AT END SET FIM-DO-FICHEIRO TO TRUE END-READ
           PERFORM UNTIL FIM-DO-FICHEIRO
               DISPLAY CLI-ID " " CLI-NOME " (antes: "
                       ANT-NOME ")"
               MOVE REG-CLIENTE TO REG-ANTERIOR
               READ F-CLIENTES
                   AT END SET FIM-DO-FICHEIRO TO TRUE
               END-READ
           END-PERFORM
           CLOSE F-CLIENTES
           STOP RUN.
