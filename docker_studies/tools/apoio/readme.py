import glob
import os
import sys

ROOT = r"C:\temp\Sites\studies"

CFG = {
    "sql": {
        "pasta": "sql_database_studies",
        "titulo": "Mini-Curso de SQL e Bases de Dados de A a Z",
        "intro": "Curso prático de SQL em português europeu, do primeiro SELECT às consultas avançadas, com **foco nas diferenças entre dialetos**. Todos os exemplos foram executados em SQLite 3.45.3, PostgreSQL 17.12, MySQL 8.4.13 e SQL Server 2025 (RTM-CU6); Oracle e SAP HANA aparecem só em nota, marcada como não executada. Fio condutor: a «loja» (categorias, clientes, produtos, encomendas e linhas de encomenda).",
        "blocos": [
            ("Base", "01 a 03", "Consultas, agregação, funções, joins e subconsultas"),
            ("Escrita e modelo", "04 e 05", "Modificar dados, transações, modelação e DDL"),
            ("Avançado", "06 a 09", "CTE, janelas, índices, dialetos, SQL em código e objetos"),
            ("Fecho", "10 a 13", "Projeto final, exercícios, consulta rápida e gabarito"),
        ],
        "como": [
            "Segue a ordem dos módulos 00 a 09, executando os exemplos. O ficheiro de dados está em `00-Introducao/dados/loja.sql`.",
            "No início basta o SQLite (vem com o Python). Para comparar dialetos, usa PostgreSQL, MySQL e SQL Server em Docker (as aulas indicam os comandos).",
            "Resolve os exercícios do módulo 11 sem consultar o gabarito (cada aula indica quais).",
            "Faz o projeto final (módulo 10) e usa o módulo 12 como consulta rápida.",
        ],
        "limites": [
            "As diferenças entre dialetos foram **executadas**, mas os sistemas evoluem: confirma na documentação da tua versão.",
            "Oracle e SAP HANA não foram executados (não havia instância) e a aula di-lo.",
            "Os tempos de desempenho foram medidos numa só máquina e variam.",
        ],
        "docs": [("SQLite", "https://www.sqlite.org/docs.html"), ("PostgreSQL 17", "https://www.postgresql.org/docs/17/"),
                 ("MySQL 8.4", "https://dev.mysql.com/doc/refman/8.4/en/"), ("SQL Server, T-SQL", "https://learn.microsoft.com/sql/t-sql/language-reference")],
        "ex": "11",
    },
    "mongo": {
        "pasta": "mongodb_studies",
        "titulo": "Mini-Curso de MongoDB de A a Z",
        "intro": "Curso prático de MongoDB em português europeu, dos documentos às transações, aos índices e à operação, com **Docker Compose** como ambiente de trabalho e Python (pymongo). Todos os exemplos foram executados com o MongoDB 8.3.17 e o mongosh 2.14.2; o que não foi executado (como o sharding) está assinalado. Fio condutor: a «loja», os mesmos dados do curso de SQL, para poderes comparar os dois modelos.",
        "blocos": [
            ("Base", "01 e 02", "Conceitos, ambiente com Docker Compose e CRUD"),
            ("Dados", "03 a 05", "Modelação, agregações, índices e desempenho"),
            ("Aplicações e operação", "06 e 07", "Drivers e transações, segurança, replica set e cópias de segurança"),
            ("Fecho", "08 a 11", "Projeto final, exercícios, consulta rápida e gabarito"),
        ],
        "como": [
            "Precisas do Docker a funcionar. Segue a ordem dos módulos 00 a 07, executando os exemplos (os ficheiros Compose e os scripts estão nas pastas `exemplos/`).",
            "Os dados da loja estão em `00-Introducao/dados/loja_json/`.",
            "Resolve os exercícios do módulo 09 sem consultar o gabarito (cada aula indica quais).",
            "Faz o projeto final (módulo 08) e usa o módulo 10 como consulta rápida.",
        ],
        "limites": [
            "As versões e as opções mudam: confirma na documentação da tua versão.",
            "Sharding, TLS e a atualização de versão aparecem só em visão geral e estão assinalados como não executados.",
            "Os tempos de desempenho foram medidos numa só máquina e variam; as aulas usam contagens de documentos e chaves como referência estável.",
        ],
        "docs": [("Documentação do MongoDB", "https://www.mongodb.com/docs/manual/"), ("mongosh", "https://www.mongodb.com/docs/mongodb-shell/"),
                 ("PyMongo", "https://pymongo.readthedocs.io/"), ("Docker Compose", "https://docs.docker.com/compose/")],
        "ex": "09",
    },
    "docker": {
        "pasta": "docker_studies",
        "titulo": "Mini-Curso de Docker de A a Z",
        "intro": "Curso prático de Docker em português europeu, dos primeiros contentores às imagens, redes, volumes, Compose, segurança e diagnóstico. Todos os exemplos foram executados com o Docker 29.9.3 e o Compose v5.7.0 em Docker Desktop no Windows com Git Bash; o PowerShell e o Linux/macOS não foram testados e as aulas assinalam-no. Fio condutor: o «serviço de tarefas», uma API pequena em Python.",
        "blocos": [
            ("Base", "01 e 02", "Conceitos, primeiros contentores e o dia a dia"),
            ("Construir", "03 a 05", "Imagens e Dockerfile, redes e volumes, Docker Compose"),
            ("Qualidade", "06", "Boas práticas, segurança, entrega e diagnóstico"),
            ("Fecho", "07 a 10", "Projeto final, exercícios, consulta rápida e gabarito"),
        ],
        "como": [
            "Precisas do Docker a funcionar (o módulo 00 explica a instalação). Segue a ordem dos módulos 00 a 06, executando os exemplos (os ficheiros estão nas pastas `exemplos/`).",
            "Dá nomes próprios aos teus recursos e usa volumes nomeados: assim limpas tudo no fim sem apagar o que não é teu.",
            "Resolve os exercícios do módulo 08 sem consultar o gabarito (cada aula indica quais).",
            "Faz o projeto final (módulo 07) e usa o módulo 09 como consulta rápida.",
        ],
        "limites": [
            "Os comandos e as opções mudam entre versões do Docker: confirma na documentação da tua versão.",
            "Swarm, Kubernetes, integração contínua e o scan de vulnerabilidades (docker scout, que pede sessão iniciada) aparecem só em visão geral e estão assinalados como não executados.",
            "O comportamento no Linux e no macOS vem da documentação e não foi executado.",
            "Os tempos e tamanhos foram medidos numa só máquina e variam.",
        ],
        "docs": [("Documentação do Docker", "https://docs.docker.com/"), ("Referência da CLI", "https://docs.docker.com/reference/cli/docker/"),
                 ("Dockerfile", "https://docs.docker.com/reference/dockerfile/"), ("Docker Compose", "https://docs.docker.com/compose/")],
        "ex": "08",
    },
}

nome = sys.argv[1]
c = CFG[nome]
os.chdir(os.path.join(ROOT, c["pasta"]))
rows = []
for md in sorted(glob.glob("[0-9][0-9]-*/*.md")):
    d, f = os.path.split(md)
    base = f[:-3]
    t = open(md, encoding="utf-8").read().splitlines()[0].lstrip("# ").strip()
    rows.append(f"| [{d}]({d}) | {d[:2]} | [Aula]({d}/{f}) | [Word]({d}/{base}.docx) | [PowerPoint]({d}/{base}.pptx) | {t} |")

s = f"# {c['titulo']}\n\n{c['intro']} Cada módulo tem a aula em Markdown, o documento Word completo e um PowerPoint com os pontos principais.\n\n"
s += "## Percurso\n\n| Pasta | Módulo | Aula | Word | PowerPoint | Título |\n|---|---|---|---|---|---|\n" + "\n".join(rows) + "\n\n"
s += "## Blocos do curso\n\n| Bloco | Módulos | Foco |\n|---|---|---|\n" + "\n".join(f"| {a} | {b} | {d} |" for a, b, d in c["blocos"]) + "\n\n"
s += "## Como estudar\n\n" + "\n".join(f"{i}. {t}" for i, t in enumerate(c["como"], 1)) + "\n\n"
s += "## Limites e verificação\n\n" + "\n".join(f"- {t}" for t in c["limites"]) + "\n\n"
s += "## Regenerar os ficheiros Office\n\n    pip install python-docx python-pptx\n    python tools/build_course_artifacts.py\n    python tools/build_course_artifacts.py --only 04,05\n\n"
s += "## Convenções\n\n- **DICA** sugere uma forma prática de trabalhar.\n- **ATENÇÃO** assinala riscos para os dados, a segurança ou a decisão.\n- **NOTA** acrescenta contexto.\n- **PRATICAR** remete para um exercício do módulo " + c["ex"] + ".\n\n"
s += "## Documentação oficial\n\n" + "\n".join(f"- [{a}]({b})" for a, b in c["docs"]) + "\n"
open("README.md", "w", encoding="utf-8").write(s)

# ESTADO: substituir o bloco PAUSADO por um estado final
p = "ESTADO-DO-PROJETO.md"
e = open(p, encoding="utf-8").read()
if "## Estado em 2026-11-13: PAUSADO" in e:
    e = e[: e.index("## Estado em 2026-11-13: PAUSADO")].rstrip() + "\n"
e += f"\n## Estado em 2026-11-13: CONCLUÍDO\n\nCurso completo: módulos 00 a {len(glob.glob('[0-9][0-9]-*'))-1} escritos e gerados (aulas, Word e PowerPoint). Exemplos executados; o que não foi executado está assinalado nas aulas. A pasta `_rascunho/` foi apagada.\n"
open(p, "w", encoding="utf-8").write(e)
print("ok", nome)
