      * Subprograma que altera os tres parametros recebidos.
       IDENTIFICATION DIVISION.
       PROGRAM-ID. MUDAR.
       DATA DIVISION.
       LINKAGE SECTION.
       01  LK-REF                 PIC 9(04).
       01  LK-CONT                PIC 9(04).
       01  LK-VAL                 PIC S9(09) COMP-5.
       PROCEDURE DIVISION USING BY REFERENCE LK-REF
                                BY REFERENCE LK-CONT
                                BY VALUE LK-VAL.
           ADD 1 TO LK-REF.
           ADD 1 TO LK-CONT.
           ADD 1 TO LK-VAL.
           DISPLAY "mudar:  ref=" LK-REF " cont=" LK-CONT
                   " val=" LK-VAL.
           GOBACK.
