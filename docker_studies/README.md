# Mini-Curso de Docker de A a Z

Curso prático de Docker em português europeu, dos primeiros contentores às imagens, redes, volumes, Compose, segurança e diagnóstico. Todos os exemplos foram executados com o Docker 29.9.3 e o Compose v5.7.0 em Docker Desktop no Windows com Git Bash; o PowerShell e o Linux/macOS não foram testados e as aulas assinalam-no. Fio condutor: o «serviço de tarefas», uma API pequena em Python. Cada módulo tem a aula em Markdown, o documento Word completo e um PowerPoint com os pontos principais.

## Percurso

| Pasta | Módulo | Aula | Word | PowerPoint | Título |
|---|---|---|---|---|---|
| [00-Introducao](00-Introducao) | 00 | [Aula](00-Introducao/00-Introducao-e-Mapa-do-Curso.md) | [Word](00-Introducao/00-Introducao-e-Mapa-do-Curso.docx) | [PowerPoint](00-Introducao/00-Introducao-e-Mapa-do-Curso.pptx) | 00 Introdução e mapa do curso |
| [01-Conceitos-e-Primeiros-Passos](01-Conceitos-e-Primeiros-Passos) | 01 | [Aula](01-Conceitos-e-Primeiros-Passos/01-Conceitos-e-Primeiros-Passos.md) | [Word](01-Conceitos-e-Primeiros-Passos/01-Conceitos-e-Primeiros-Passos.docx) | [PowerPoint](01-Conceitos-e-Primeiros-Passos/01-Conceitos-e-Primeiros-Passos.pptx) | 01 Conceitos e primeiros passos |
| [02-Contentores-no-Dia-a-Dia](02-Contentores-no-Dia-a-Dia) | 02 | [Aula](02-Contentores-no-Dia-a-Dia/02-Contentores-no-Dia-a-Dia.md) | [Word](02-Contentores-no-Dia-a-Dia/02-Contentores-no-Dia-a-Dia.docx) | [PowerPoint](02-Contentores-no-Dia-a-Dia/02-Contentores-no-Dia-a-Dia.pptx) | 02 Contentores no dia a dia |
| [03-Imagens-e-Dockerfile](03-Imagens-e-Dockerfile) | 03 | [Aula](03-Imagens-e-Dockerfile/03-Imagens-e-Dockerfile.md) | [Word](03-Imagens-e-Dockerfile/03-Imagens-e-Dockerfile.docx) | [PowerPoint](03-Imagens-e-Dockerfile/03-Imagens-e-Dockerfile.pptx) | 03 Imagens e Dockerfile |
| [04-Redes-e-Volumes](04-Redes-e-Volumes) | 04 | [Aula](04-Redes-e-Volumes/04-Redes-e-Volumes.md) | [Word](04-Redes-e-Volumes/04-Redes-e-Volumes.docx) | [PowerPoint](04-Redes-e-Volumes/04-Redes-e-Volumes.pptx) | 04 Redes e volumes |
| [05-Docker-Compose](05-Docker-Compose) | 05 | [Aula](05-Docker-Compose/05-Docker-Compose.md) | [Word](05-Docker-Compose/05-Docker-Compose.docx) | [PowerPoint](05-Docker-Compose/05-Docker-Compose.pptx) | 05 Docker Compose |
| [06-Boas-Praticas-e-Diagnostico](06-Boas-Praticas-e-Diagnostico) | 06 | [Aula](06-Boas-Praticas-e-Diagnostico/06-Boas-Praticas-e-Diagnostico.md) | [Word](06-Boas-Praticas-e-Diagnostico/06-Boas-Praticas-e-Diagnostico.docx) | [PowerPoint](06-Boas-Praticas-e-Diagnostico/06-Boas-Praticas-e-Diagnostico.pptx) | 06 Boas práticas e diagnóstico |
| [07-Projeto-Final](07-Projeto-Final) | 07 | [Aula](07-Projeto-Final/07-Projeto-Final.md) | [Word](07-Projeto-Final/07-Projeto-Final.docx) | [PowerPoint](07-Projeto-Final/07-Projeto-Final.pptx) | 07 Projeto final |
| [08-Exercicios-Praticos](08-Exercicios-Praticos) | 08 | [Aula](08-Exercicios-Praticos/08-Exercicios.md) | [Word](08-Exercicios-Praticos/08-Exercicios.docx) | [PowerPoint](08-Exercicios-Praticos/08-Exercicios.pptx) | 8 Exercícios práticos |
| [09-Cheat-Sheet](09-Cheat-Sheet) | 09 | [Aula](09-Cheat-Sheet/09-Consulta-Rapida.md) | [Word](09-Cheat-Sheet/09-Consulta-Rapida.docx) | [PowerPoint](09-Cheat-Sheet/09-Consulta-Rapida.pptx) | 09 Consulta rápida |
| [10-Gabarito](10-Gabarito) | 10 | [Aula](10-Gabarito/10-Solucoes.md) | [Word](10-Gabarito/10-Solucoes.docx) | [PowerPoint](10-Gabarito/10-Solucoes.pptx) | 10 Soluções e critérios |

## Blocos do curso

| Bloco | Módulos | Foco |
|---|---|---|
| Base | 01 e 02 | Conceitos, primeiros contentores e o dia a dia |
| Construir | 03 a 05 | Imagens e Dockerfile, redes e volumes, Docker Compose |
| Qualidade | 06 | Boas práticas, segurança, entrega e diagnóstico |
| Fecho | 07 a 10 | Projeto final, exercícios, consulta rápida e gabarito |

## Como estudar

1. Precisas do Docker a funcionar (o módulo 00 explica a instalação). Segue a ordem dos módulos 00 a 06, executando os exemplos (os ficheiros estão nas pastas `exemplos/`).
2. Dá nomes próprios aos teus recursos e usa volumes nomeados: assim limpas tudo no fim sem apagar o que não é teu.
3. Resolve os exercícios do módulo 08 sem consultar o gabarito (cada aula indica quais).
4. Faz o projeto final (módulo 07) e usa o módulo 09 como consulta rápida.

## Limites e verificação

- Os comandos e as opções mudam entre versões do Docker: confirma na documentação da tua versão.
- Swarm, Kubernetes, integração contínua e o scan de vulnerabilidades (docker scout, que pede sessão iniciada) aparecem só em visão geral e estão assinalados como não executados.
- O comportamento no Linux e no macOS vem da documentação e não foi executado.
- Os tempos e tamanhos foram medidos numa só máquina e variam.

## Regenerar os ficheiros Office

    pip install python-docx python-pptx
    python tools/build_course_artifacts.py
    python tools/build_course_artifacts.py --only 04,05

## Convenções

- **DICA** sugere uma forma prática de trabalhar.
- **ATENÇÃO** assinala riscos para os dados, a segurança ou a decisão.
- **NOTA** acrescenta contexto.
- **PRATICAR** remete para um exercício do módulo 08.

## Documentação oficial

- [Documentação do Docker](https://docs.docker.com/)
- [Referência da CLI](https://docs.docker.com/reference/cli/docker/)
- [Dockerfile](https://docs.docker.com/reference/dockerfile/)
- [Docker Compose](https://docs.docker.com/compose/)
