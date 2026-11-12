from fastapi.testclient import TestClient

import main

client = TestClient(main.app)


def test_criar_filtrar_e_total():
    antes = len(client.get("/despesas").json())
    r = client.post("/despesas", json={"descricao": "Cinema", "valor": 8, "categoria": "lazer", "data": "2026-11-05"})
    assert r.status_code == 201
    assert len(client.get("/despesas").json()) == antes + 1
    assert [d["descricao"] for d in client.get("/despesas?categoria=lazer").json()] == ["Cinema"]
    assert client.get("/total").json()["total"] == 52.3


def test_valor_invalido_da_422():
    r = client.post("/despesas", json={"descricao": "x", "valor": -1, "categoria": "a", "data": "2026-11-05"})
    assert r.status_code == 422
