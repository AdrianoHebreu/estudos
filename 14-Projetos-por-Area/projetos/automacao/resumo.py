"""Lê um CSV de despesas (descricao,valor,categoria,data) e resume por categoria."""
import csv
import sys
from collections import defaultdict
from pathlib import Path


def resumir(caminho: Path) -> dict[str, list[float]]:
    """Agrupa os valores por categoria, saltando linhas inválidas com aviso."""
    grupos: dict[str, list[float]] = defaultdict(list)
    with caminho.open(encoding="utf-8", newline="") as f:
        for n, linha in enumerate(csv.DictReader(f), start=2):
            try:
                grupos[linha["categoria"].strip()].append(float(linha["valor"]))
            except (ValueError, KeyError, AttributeError):
                print(f"AVISO: linha {n} ignorada: {linha}", file=sys.stderr)
    return grupos


def main() -> None:
    caminho = Path(sys.argv[1] if len(sys.argv) > 1 else "despesas.csv")
    grupos = resumir(caminho)
    total = sum(sum(v) for v in grupos.values())
    print(f"{'Categoria':<14}{'N':>3}{'Total':>10}{'%':>8}")
    for cat, vals in sorted(grupos.items(), key=lambda kv: -sum(kv[1])):
        print(f"{cat:<14}{len(vals):>3}{sum(vals):>10.2f}{sum(vals) / total:>8.1%}")
    print(f"{'TOTAL':<14}{sum(map(len, grupos.values())):>3}{total:>10.2f}")


if __name__ == "__main__":
    main()
