/* iva_c.c - funcoes C chamadas a partir de COBOL */
#include <ctype.h>

/* preco em centimos e taxa em percentagem, ambos por valor */
int iva_c(int centimos, int taxa)
{
    return (centimos * (100 + taxa) + 50) / 100;
}

/* texto por referencia: o COBOL NAO termina as cadeias com NUL */
int maiusculas_c(char *texto, int n)
{
    int i;
    for (i = 0; i < n; i++)
        texto[i] = (char) toupper((unsigned char) texto[i]);
    return n;
}
