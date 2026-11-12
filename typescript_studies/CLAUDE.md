# Curso de TypeScript de A a Z — instruções para esta pasta

Este projeto gera um curso de TypeScript em português europeu: um `.docx` e um
`.pptx` por aula, a partir de JSON em `content-source/`, com os geradores em `tools/`.

## Antes de fazer seja o que for

**Leia `ESTADO-DO-PROJETO.md` na raiz desta pasta, do princípio ao fim.** Tem o plano
por etapas, o que já está feito, os comandos exatos, o modelo de prompt dos agentes e
uma lista de erros já cometidos que não devem repetir-se. Sem isso vai reinventar
decisões já tomadas.

Se o pedido for "seguir para a próxima etapa" ou equivalente, a etapa a executar é a
primeira marcada como **a seguir** na tabela da secção 5 desse ficheiro.

## Regras que valem sempre

- **Nunca editar os `.docx`/`.pptx` à mão** — são gerados e serão substituídos. O
  conteúdo vive em `content-source/<modulo>/<ficheiro>.json`.
- **A estrutura vem de `tools/course_order.py`**, nunca dos agentes: numeração,
  títulos e navegação são calculados, não escritos por modelos.
- **No fim de cada etapa, correr `python tools/verify_content.py`** e só dar a etapa
  por fechada com zero problemas.
- **Atualizar o `ESTADO-DO-PROJETO.md`** no fim de cada etapa (tabela de etapas,
  secção 6 e os custos medidos na secção 7).
- Usar o comando `python` (não `python3`) e `export PYTHONIOENCODING=utf-8` antes de
  scripts que imprimam acentos.

## Ritmo

Uma etapa é **um módulo** (4 ou 5 aulas), com um agente por aula lançados em
paralelo. Custa à volta de metade de uma janela de utilização de 5 horas. Não juntar
módulos para "poupar tempo": já se tentou e consumiu a janela inteira.
