"""API de despesas com FastAPI. Dados em memória (perdem-se ao parar)."""
from datetime import date

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="API de despesas")


class DespesaIn(BaseModel):
    descricao: str = Field(min_length=1)
    valor: float = Field(gt=0)
    categoria: str
    data: date


class Despesa(DespesaIn):
    id: int


DESPESAS: list[Despesa] = [
    Despesa(id=1, descricao="Mercado", valor=42.5, categoria="alimentacao", data=date(2026, 11, 2)),
    Despesa(id=2, descricao="Metro", valor=1.8, categoria="transporte", data=date(2026, 11, 3)),
]


@app.get("/despesas")
def listar(categoria: str | None = None) -> list[Despesa]:
    """Lista despesas; ?categoria=x filtra."""
    return [d for d in DESPESAS if categoria is None or d.categoria == categoria]


@app.post("/despesas", status_code=201)
def criar(nova: DespesaIn) -> Despesa:
    """Valida o corpo (pydantic) e acrescenta a despesa."""
    despesa = Despesa(id=len(DESPESAS) + 1, **nova.model_dump())
    DESPESAS.append(despesa)
    return despesa


@app.get("/total")
def total() -> dict[str, float]:
    """Soma de todos os valores."""
    return {"total": round(sum(d.valor for d in DESPESAS), 2)}
