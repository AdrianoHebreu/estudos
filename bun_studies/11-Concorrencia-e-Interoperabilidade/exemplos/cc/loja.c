/* Sem #include: o TinyCC embutido no Bun 1.4.0 no Windows não encontrou stdint.h.
   Usam-se os tipos nativos: int (32 bits) e long long (64 bits). */

/* Receita total em cêntimos: soma quantidade * preco_cent dos arrays */
long long receita_cent(const int *quantidades, const int *precos_cent, int n) {
    long long total = 0;
    for (int i = 0; i < n; i++) total += (long long)quantidades[i] * precos_cent[i];
    return total;
}

/* Conta primos de 2 até limite (exclusive), como no exemplo dos workers */
int contar_primos(int limite) {
    int n = 0;
    for (int i = 2; i < limite; i++) {
        int primo = 1;
        for (int d = 2; (long long)d * d <= i; d++) if (i % d == 0) { primo = 0; break; }
        n += primo;
    }
    return n;
}

const char *saudacao(void) { return "ola da loja, em C"; }
