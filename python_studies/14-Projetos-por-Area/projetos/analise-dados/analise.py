"""Analisa despesas.csv: totais por categoria e por mês, estatísticas e gráfico PNG."""
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # backend sem janela: só escreve ficheiros
import matplotlib.pyplot as plt
import pandas as pd

PASTA = Path(__file__).parent


def carregar(caminho: Path) -> pd.DataFrame:
    """Lê o CSV e converte a coluna data para datetime."""
    df = pd.read_csv(caminho, parse_dates=["data"])
    df["mes"] = df["data"].dt.to_period("M").astype(str)
    return df


def totais(df: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    """Devolve (total por categoria, total por mês)."""
    por_categoria = df.groupby("categoria")["valor"].sum().sort_values(ascending=False)
    por_mes = df.groupby("mes")["valor"].sum()
    return por_categoria, por_mes


def grafico(por_categoria: pd.Series, destino: Path) -> None:
    """Guarda um gráfico de barras com o total por categoria."""
    fig, ax = plt.subplots(figsize=(6, 3.5))
    ax.bar(por_categoria.index, por_categoria.values, color="#3b7dd8")
    ax.set_title("Despesas por categoria (set–nov 2026)")
    ax.set_ylabel("Total (€)")
    ax.tick_params(axis="x", rotation=25)
    fig.tight_layout()
    fig.savefig(destino, dpi=80)
    plt.close(fig)


def main() -> None:
    df = carregar(PASTA / "despesas.csv")
    por_categoria, por_mes = totais(df)
    print("Total por categoria (€):\n", por_categoria.round(2).to_string(), sep="")
    print("\nTotal por mês (€):\n", por_mes.round(2).to_string(), sep="")
    print("\nEstatísticas do valor:")
    print(df["valor"].agg(["count", "mean", "median", "min", "max"]).round(2).to_string())
    print("\nMédia por categoria (€):\n", df.groupby("categoria")["valor"].mean().round(2).to_string(), sep="")
    destino = PASTA / "despesas_por_categoria.png"
    grafico(por_categoria, destino)
    print(f"\nGráfico guardado em {destino.name} ({destino.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
