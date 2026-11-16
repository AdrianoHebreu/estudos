import os
import sys

ROOT = r"C:\temp\Sites\studies"

CURSOS = {
    "sql": {
        "pasta": "sql_database_studies",
        "ex_dir": "11-Exercicios-Praticos", "ex_file": "11-Exercicios.md",
        "sol_dir": "13-Gabarito", "sol_file": "13-Solucoes.md",
        "modulos": {1: "Primeiras consultas", 2: "Agregação e funções", 3: "Joins e subconsultas",
                    4: "Modificar dados e transações", 5: "Modelação e DDL", 6: "Consultas avançadas",
                    7: "Índices e desempenho", 8: "Dialetos de SQL", 9: "SQL em código e objetos"},
        "n_proj": 37, "mod_ex": 11, "mod_proj": 10, "mod_cheat": 12, "mod_sol": 13,
        "tema": "SQL e bases de dados",
        "ambiente": "Resolve-os no SQLite (Python) e, sempre que o exercício o pedir, num segundo dialeto.",
        "proj_titulo": "Módulo de relatórios portável para a loja",
        "proj_enunc": "Constrói o módulo de relatórios da loja a funcionar em pelo menos dois dialetos, seguindo o módulo 10: modelo, seis relatórios, transação de encomenda, índices medidos, programa em Python com parâmetros e uma tabela das diferenças entre dialetos.",
        "proj_sol": """O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 10 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Modelo | Chaves e restrições corretas, CHECK na nota, relação 1:N justificada | Sem chaves estrangeiras ou sem restrições |
| Relatórios | Cada um confirmado à mão sobre o loja.sql | Resultados nunca conferidos |
| NULL e junções | Produtos sem avaliações e clientes sem encomendas aparecem | INNER JOIN onde era preciso LEFT JOIN |
| Transação | Encomenda e stock atualizados juntos, com ROLLBACK testado | Atualizações soltas, sem teste de falha |
| Desempenho | Plano e tempo antes e depois, nos dois dialetos | Só uma medição, sem plano |
| Segurança | Todas as consultas parametrizadas | Qualquer f-string com dados do utilizador |
| Portabilidade | Diferenças isoladas numa camada, com tabela no README | SQL específico espalhado pelo código |

**DICA:** pede a um colega que corra o projeto só com o README. Se não conseguir, falta documentação.""",
    },
    "mongo": {
        "pasta": "mongodb_studies",
        "ex_dir": "09-Exercicios-Praticos", "ex_file": "09-Exercicios.md",
        "sol_dir": "11-Gabarito", "sol_file": "11-Solucoes.md",
        "modulos": {1: "Conceitos e ambiente", 2: "CRUD", 3: "Modelação de dados", 4: "Aggregation",
                    5: "Índices e desempenho", 6: "Drivers e transações", 7: "Operação e segurança"},
        "n_proj": 29, "mod_ex": 9, "mod_proj": 8, "mod_cheat": 10, "mod_sol": 11,
        "tema": "MongoDB",
        "ambiente": "Resolve-os com o MongoDB em Docker (as aulas indicam como o arrancar) e o mongosh.",
        "proj_titulo": "Catálogo e encomendas da loja em MongoDB",
        "proj_enunc": "Constrói o catálogo e as encomendas da loja em MongoDB, num stack de Docker Compose com replica set e autenticação, com uma aplicação em Python, cinco relatórios por agregação, índices medidos, cópia de segurança restaurada e eleição demonstrada, seguindo o módulo 08.",
        "proj_sol": """O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 08 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Ambiente | Replica set de 3 nós com autenticação, volumes nomeados e segredos fora do repositório | Credenciais no compose ou sem autenticação |
| Modelo | Decisões de incorporar e referenciar justificadas, com snapshot do preço | Modelo copiado do relacional sem justificação |
| Validação | $jsonSchema em pelo menos duas coleções, com erros testados | Sem validação |
| Transações | Criar e cancelar encomenda atómicos, com teste de falha | Atualizações soltas do stock |
| Relatórios | Cinco pipelines confirmados à mão | Resultados nunca conferidos |
| Índices | Cada um justificado com explain, e os inúteis removidos | Índices a mais ou sem medição |
| Operação | Cópia restaurada noutra base e eleição demonstrada | Cópia nunca restaurada |

**DICA:** pede a um colega que arranque o projeto só com o README. Se não conseguir, falta documentação.""",
    },
    "docker": {
        "pasta": "docker_studies",
        "ex_dir": "08-Exercicios-Praticos", "ex_file": "08-Exercicios.md",
        "sol_dir": "10-Gabarito", "sol_file": "10-Solucoes.md",
        "modulos": {1: "Conceitos e primeiros passos", 2: "Contentores no dia a dia", 3: "Imagens e Dockerfile",
                    4: "Redes e volumes", 5: "Docker Compose", 6: "Boas práticas e diagnóstico"},
        "n_proj": 25, "mod_ex": 8, "mod_proj": 7, "mod_cheat": 9, "mod_sol": 10,
        "tema": "Docker",
        "ambiente": "Resolve-os com o Docker a funcionar e usa sempre nomes próprios e volumes nomeados, para limpares tudo no fim.",
        "proj_titulo": "Aplicação de tarefas completa em Docker Compose",
        "proj_enunc": "Põe o serviço de tarefas a correr em Docker Compose com um proxy, a API e o PostgreSQL, seguindo o módulo 07: imagem multi-stage com utilizador sem privilégios e healthcheck, redes separadas, volume nomeado, segredo do Compose, overrides por ambiente, prova de persistência e as três falhas diagnosticadas.",
        "proj_sol": """O projeto é aberto, por isso não há uma solução única. Usa a grelha do módulo 07 (9 critérios, de 0 a 3, máximo 27) e esta tabela para avaliares cada parte.

| Parte | Está bom quando... | Sinal de alerta |
|---|---|---|
| Imagem | Multi-stage, tag fixa, utilizador sem privilégios e tamanho medido contra a versão ingénua | Tag latest, utilizador root, sem medição |
| Saúde | HEALTHCHECK a funcionar e depends_on com service_healthy | A API arranca antes da base de dados |
| Redes | Só o proxy publica porta; a base de dados não responde a partir do anfitrião | Porta do PostgreSQL publicada |
| Dados | Volume nomeado; testaste down contra down -v | Volume anónimo ou dados perdidos sem teres percebido |
| Segredos | Palavra-passe vinda de um segredo e nada na imagem (docker history e docker inspect limpos) | Palavra-passe em ENV |
| Configuração | Override de desenvolvimento e de produção sem duplicar o ficheiro principal | Dois ficheiros quase iguais |
| Diagnóstico | Três falhas provocadas, com sintoma, causa e correção | Só descreves, sem reproduzir |

**DICA:** pede a um colega que arranque o projeto só com o README e confirma que um único comando o deixa limpo no fim.""",
    },
}

nome = sys.argv[1]
c = CURSOS[nome]
base = os.path.join(ROOT, c["pasta"])
rasc = os.path.join(base, "_rascunho")

ex = [f"# {c['mod_ex']} Exercícios práticos\n\n{len(c['modulos'])*4} exercícios, quatro por módulo, mais um projeto final. Cada aula indica com **PRATICAR** os exercícios que lhe correspondem. {c['ambiente']} Só consultas o módulo {c['mod_sol']} depois de tentares.\n"]
sol = [f"# {c['mod_sol']} Soluções e critérios\n\nSoluções dos exercícios do módulo {c['mod_ex']}. Todas foram executadas durante a escrita do curso e os resultados mostrados são reais. Há sempre mais de uma solução correta: compara o comportamento, não o código.\n"]

for m, titulo in c["modulos"].items():
    e = open(os.path.join(rasc, f"ex_{m:02d}.md"), encoding="utf-8").read().strip()
    s = open(os.path.join(rasc, f"sol_{m:02d}.md"), encoding="utf-8").read().strip()
    ex.append(f"## Módulo {m:02d} · {titulo}\n\n{e}\n")
    sol.append(f"## Módulo {m:02d} · {titulo}\n\n{s}\n")

ex.append(f"""## Projeto final

### Exercício {c['n_proj']} · {c['proj_titulo']}

**Nível:** Avançado

{c['proj_enunc']}

**PRATICAR:** faz o projeto por fases e usa a grelha do módulo {c['mod_proj']} e a consulta rápida do módulo {c['mod_cheat']}.
""")
sol.append(f"## Projeto final · Exercício {c['n_proj']}\n\n{c['proj_sol']}\n")

os.makedirs(os.path.join(base, c["ex_dir"]), exist_ok=True)
os.makedirs(os.path.join(base, c["sol_dir"]), exist_ok=True)
open(os.path.join(base, c["ex_dir"], c["ex_file"]), "w", encoding="utf-8").write("\n".join(ex))
open(os.path.join(base, c["sol_dir"], c["sol_file"]), "w", encoding="utf-8").write("\n".join(sol))
print("montado", nome)
