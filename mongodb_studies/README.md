# Mini-Curso de MongoDB de A a Z

Curso prático de MongoDB em português europeu, dos documentos às transações, aos índices e à operação, com **Docker Compose** como ambiente de trabalho e Python (pymongo). Todos os exemplos foram executados com o MongoDB 8.3.17 e o mongosh 2.14.2; o que não foi executado (como o sharding) está assinalado. Fio condutor: a «loja», os mesmos dados do curso de SQL, para poderes comparar os dois modelos. Cada módulo tem a aula em Markdown, o documento Word completo e um PowerPoint com os pontos principais.

## Percurso

| Pasta | Módulo | Aula | Word | PowerPoint | Título |
|---|---|---|---|---|---|
| [00-Introducao](00-Introducao) | 00 | [Aula](00-Introducao/00-Introducao-e-Mapa-do-Curso.md) | [Word](00-Introducao/00-Introducao-e-Mapa-do-Curso.docx) | [PowerPoint](00-Introducao/00-Introducao-e-Mapa-do-Curso.pptx) | 00 Introdução e mapa do curso |
| [01-Conceitos-e-Ambiente](01-Conceitos-e-Ambiente) | 01 | [Aula](01-Conceitos-e-Ambiente/01-Conceitos-e-Ambiente.md) | [Word](01-Conceitos-e-Ambiente/01-Conceitos-e-Ambiente.docx) | [PowerPoint](01-Conceitos-e-Ambiente/01-Conceitos-e-Ambiente.pptx) | 01 Conceitos e ambiente |
| [02-CRUD](02-CRUD) | 02 | [Aula](02-CRUD/02-CRUD.md) | [Word](02-CRUD/02-CRUD.docx) | [PowerPoint](02-CRUD/02-CRUD.pptx) | 02 CRUD: inserir, consultar, atualizar e apagar |
| [03-Modelacao-de-Dados](03-Modelacao-de-Dados) | 03 | [Aula](03-Modelacao-de-Dados/03-Modelacao-de-Dados.md) | [Word](03-Modelacao-de-Dados/03-Modelacao-de-Dados.docx) | [PowerPoint](03-Modelacao-de-Dados/03-Modelacao-de-Dados.pptx) | 03 Modelação de dados |
| [04-Aggregation](04-Aggregation) | 04 | [Aula](04-Aggregation/04-Aggregation.md) | [Word](04-Aggregation/04-Aggregation.docx) | [PowerPoint](04-Aggregation/04-Aggregation.pptx) | 04 Aggregation |
| [05-Indices-e-Desempenho](05-Indices-e-Desempenho) | 05 | [Aula](05-Indices-e-Desempenho/05-Indices-e-Desempenho.md) | [Word](05-Indices-e-Desempenho/05-Indices-e-Desempenho.docx) | [PowerPoint](05-Indices-e-Desempenho/05-Indices-e-Desempenho.pptx) | 05 Índices e desempenho |
| [06-Drivers-e-Transacoes](06-Drivers-e-Transacoes) | 06 | [Aula](06-Drivers-e-Transacoes/06-Drivers-e-Transacoes.md) | [Word](06-Drivers-e-Transacoes/06-Drivers-e-Transacoes.docx) | [PowerPoint](06-Drivers-e-Transacoes/06-Drivers-e-Transacoes.pptx) | 06 Drivers e transações |
| [07-Operacao-e-Seguranca](07-Operacao-e-Seguranca) | 07 | [Aula](07-Operacao-e-Seguranca/07-Operacao-e-Seguranca.md) | [Word](07-Operacao-e-Seguranca/07-Operacao-e-Seguranca.docx) | [PowerPoint](07-Operacao-e-Seguranca/07-Operacao-e-Seguranca.pptx) | 07 Operação e segurança |
| [08-Projeto-Final](08-Projeto-Final) | 08 | [Aula](08-Projeto-Final/08-Projeto-Final.md) | [Word](08-Projeto-Final/08-Projeto-Final.docx) | [PowerPoint](08-Projeto-Final/08-Projeto-Final.pptx) | 08 Projeto final |
| [09-Exercicios-Praticos](09-Exercicios-Praticos) | 09 | [Aula](09-Exercicios-Praticos/09-Exercicios.md) | [Word](09-Exercicios-Praticos/09-Exercicios.docx) | [PowerPoint](09-Exercicios-Praticos/09-Exercicios.pptx) | 9 Exercícios práticos |
| [10-Cheat-Sheet](10-Cheat-Sheet) | 10 | [Aula](10-Cheat-Sheet/10-Consulta-Rapida.md) | [Word](10-Cheat-Sheet/10-Consulta-Rapida.docx) | [PowerPoint](10-Cheat-Sheet/10-Consulta-Rapida.pptx) | 10 Consulta rápida |
| [11-Gabarito](11-Gabarito) | 11 | [Aula](11-Gabarito/11-Solucoes.md) | [Word](11-Gabarito/11-Solucoes.docx) | [PowerPoint](11-Gabarito/11-Solucoes.pptx) | 11 Soluções e critérios |

## Blocos do curso

| Bloco | Módulos | Foco |
|---|---|---|
| Base | 01 e 02 | Conceitos, ambiente com Docker Compose e CRUD |
| Dados | 03 a 05 | Modelação, agregações, índices e desempenho |
| Aplicações e operação | 06 e 07 | Drivers e transações, segurança, replica set e cópias de segurança |
| Fecho | 08 a 11 | Projeto final, exercícios, consulta rápida e gabarito |

## Como estudar

1. Precisas do Docker a funcionar. Segue a ordem dos módulos 00 a 07, executando os exemplos (os ficheiros Compose e os scripts estão nas pastas `exemplos/`).
2. Os dados da loja estão em `00-Introducao/dados/loja_json/`.
3. Resolve os exercícios do módulo 09 sem consultar o gabarito (cada aula indica quais).
4. Faz o projeto final (módulo 08) e usa o módulo 10 como consulta rápida.

## Limites e verificação

- As versões e as opções mudam: confirma na documentação da tua versão.
- Sharding, TLS e a atualização de versão aparecem só em visão geral e estão assinalados como não executados.
- Os tempos de desempenho foram medidos numa só máquina e variam; as aulas usam contagens de documentos e chaves como referência estável.

## Regenerar os ficheiros Office

    pip install python-docx python-pptx
    python tools/build_course_artifacts.py
    python tools/build_course_artifacts.py --only 04,05

## Convenções

- **DICA** sugere uma forma prática de trabalhar.
- **ATENÇÃO** assinala riscos para os dados, a segurança ou a decisão.
- **NOTA** acrescenta contexto.
- **PRATICAR** remete para um exercício do módulo 09.

## Documentação oficial

- [Documentação do MongoDB](https://www.mongodb.com/docs/manual/)
- [mongosh](https://www.mongodb.com/docs/mongodb-shell/)
- [PyMongo](https://pymongo.readthedocs.io/)
- [Docker Compose](https://docs.docker.com/compose/)
