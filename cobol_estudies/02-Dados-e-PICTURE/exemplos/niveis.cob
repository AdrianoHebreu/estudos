      *> NIVEIS.COB - niveis, PICTURE, VALUE, figurativas e nivel 88
       IDENTIFICATION DIVISION.
       PROGRAM-ID. NIVEIS.
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       77  WS-CONTADOR         PIC 9(03) VALUE 7.
       01  WS-PRODUTO.
           05  PRO-ID          PIC 9(03)    VALUE 4.
           05  PRO-NOME        PIC X(25)
                               VALUE "Auscultadores Bluetooth".
           05  PRO-CATEGORIA   PIC 9(02)    VALUE 2.
           05  PRO-PRECO       PIC 9(05)V99 VALUE 49.90.
           05  PRO-STOCK       PIC 9(05)    VALUE 30.
       01  WS-ENCOMENDA.
           05  ENC-ID          PIC 9(04)    VALUE 6.
           05  ENC-ESTADO      PIC X(10)    VALUE "enviada".
               88  ENC-PENDENTE             VALUE "pendente".
               88  ENC-ENVIADA              VALUE "enviada".
               88  ENC-ENTREGUE             VALUE "entregue".
               88  ENC-FECHADA              VALUE "entregue"
                                                  "cancelada".
       01  WS-LIMPOS.
           05  LIMPO-TEXTO     PIC X(05)    VALUE SPACES.
           05  LIMPO-NUMERO    PIC 9(05)    VALUE ZEROS.
           05  LIMPO-ALTO      PIC X(03)    VALUE HIGH-VALUES.
           05  LIMPO-TRACOS    PIC X(10)    VALUE ALL "-".
       01  WS-CIDADE           PIC A(10)    VALUE "Lisboa".
       01  WS-TRES-A           PIC 999      VALUE 123.
       01  WS-TRES-B           PIC 9(3)     VALUE 123.
       PROCEDURE DIVISION.
       PRINCIPAL.
           DISPLAY "Produto : " PRO-ID "|" PRO-NOME "|" PRO-CATEGORIA
                   "|" PRO-PRECO "|" PRO-STOCK
           DISPLAY "Contador: " WS-CONTADOR
           DISPLAY "Limpos  : [" LIMPO-TEXTO "] [" LIMPO-NUMERO "] ["
                   LIMPO-TRACOS "]"
           DISPLAY "HIGH-VALUES em hexadecimal: "
                   FUNCTION HEX-OF(LIMPO-ALTO)
           DISPLAY "Estado inicial: " ENC-ESTADO
           IF ENC-ENVIADA
               DISPLAY "A encomenda " ENC-ID " esta enviada"
           END-IF
           IF NOT ENC-FECHADA
               DISPLAY "Ainda nao esta fechada"
           END-IF
           SET ENC-ENTREGUE TO TRUE
           DISPLAY "Depois do SET: [" ENC-ESTADO "]"
           IF ENC-FECHADA
               DISPLAY "Agora esta fechada"
           END-IF
           DISPLAY "Cidade (A): [" WS-CIDADE "]"
           DISPLAY "PIC 999 = " FUNCTION LENGTH(WS-TRES-A)
                   " bytes; PIC 9(3) = " FUNCTION LENGTH(WS-TRES-B)
                   " bytes"
           DISPLAY "Tamanho do grupo WS-PRODUTO: "
                   FUNCTION LENGTH(WS-PRODUTO) " bytes"
           STOP RUN.
