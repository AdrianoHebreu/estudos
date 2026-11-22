/* main_c.c - programa C que chama o modulo COBOL preco_final */
#include <stdio.h>
#include <stdlib.h>
#include <libcob.h>

int main(void)
{
    char preco[8] = "0001290";   /* 9(05)V99: 7 digitos, sem ponto */
    char final[8] = "0000000";
    int (*preco_final)(char *, char *);

    cob_init(0, NULL);
    preco_final = cob_resolve("preco_final");
    if (preco_final == NULL) {
        fprintf(stderr, "%s\n", cob_resolve_error());
        return 1;
    }
    preco_final(preco, final);
    printf("C recebeu: %.7s\n", final);
    cob_tidy();
    return 0;
}
