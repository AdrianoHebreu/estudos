// O .gitignore do repositório ignora ficheiros .env*, por isso este script cria-os aqui, na pasta env/.
// Corre: bun run criar-env.ts
import { join } from "node:path";

const ficheiros: Record<string, string> = {
    ".env": [
        "LOJA_NOME=Loja Estudo",
        "LOJA_MOEDA=EUR",
        "IVA=0.23",
        "STOCK_MINIMO=10",
        "LOJA_DEBUG=false",
        'SAUDACAO="Bem-vindo a $LOJA_NOME"',
        "ORIGEM_A=env",
        "ORIGEM_B=env",
        "ORIGEM_C=env",
        "ORIGEM_D=env",
    ].join("\n"),
    ".env.development": "MODO=development\nORIGEM_B=env.development\nORIGEM_C=env.development\nORIGEM_D=env.development\n",
    ".env.production": "MODO=production\nORIGEM_B=env.production\nORIGEM_C=env.production\nORIGEM_D=env.production\n",
    ".env.test": "MODO=test\nORIGEM_B=env.test\nORIGEM_C=env.test\nORIGEM_D=env.test\n",
    ".env.local": "ORIGEM_C=env.local\nORIGEM_D=env.local\n",
    "outra.env": "LOJA_NOME=Loja do Porto\nSO_AQUI=sim\n",
};

for (const [nome, conteudo] of Object.entries(ficheiros)) {
    await Bun.write(join(import.meta.dir, nome), conteudo + "\n");
    console.log("criado", nome);
}
