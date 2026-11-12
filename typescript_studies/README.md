# Curso de TypeScript de A a Z

Material de estudo completo sobre TypeScript, das primeiras anotações de tipo aos genéricos, conditional types e migração de projetos reais. **Este curso parte do princípio de que já fez o Curso de JavaScript de A a Z**: não reensina a linguagem base, foca-se no sistema de tipos. Cada aula é um documento Word (`.docx`) independente, dentro da pasta do seu módulo.

Cada aula tem também um `.pptx` companheiro — uma versão em slides da mesma aula, visual e resumida (ícones, tabelas, gráficos e blocos de código, sem parágrafos de texto), pensada para apresentar ou rever rapidamente. O Word continua a ser a referência completa; o PowerPoint é o resumo visual.

## Como está organizado

Os números das pastas indicam a ordem recomendada de estudo.

| Pasta | Módulo | Conteúdo |
|---|---|---|
| `00-Introducao/` | 00 | Porquê o TypeScript, o que muda em relação ao JavaScript e como preparar o ambiente |
| `01-Fundamentos-de-Tipos/` | 01 | Anotações e inferência, any/unknown/never, arrays e tuplas, uniões e literais, enums |
| `02-Objetos-Interfaces-e-Type-Aliases/` | 02 | Tipar objetos, interface vs type, opcionais e readonly, composição, tipagem estrutural |
| `03-Funcoes-Tipadas/` | 03 | Parâmetros e retorno, opcionais/default/rest, tipos de função, sobrecargas |
| `04-Narrowing-e-Type-Guards/` | 04 | typeof/instanceof/in, uniões discriminadas, type predicates, exaustividade com never |
| `05-Genericos/` | 05 | Funções, interfaces e classes genéricas, constraints, inferência, padrões úteis |
| `06-Tipos-Avancados/` | 06 | keyof e indexed access, conditional types, mapped types, template literal types, infer |
| `07-Utility-Types/` | 07 | Partial, Required, Pick, Omit, Record, ReturnType, Awaited e como criar os seus |
| `08-Classes-e-Orientacao-a-Objetos/` | 08 | Modificadores de acesso, classes abstratas, implements, parameter properties, decorators |
| `09-Modulos-tsconfig-e-Declaracoes/` | 09 | Módulos, tsconfig.json, o modo strict, ficheiros .d.ts e @types, compilação |
| `10-TypeScript-no-Mundo-Real/` | 10 | Assincronismo tipado, consumir APIs com unknown, validação em runtime, erros tipados |
| `11-Migracao-e-Boas-Praticas/` | 11 | Migrar JS para TS, evitar any, ler erros do compilador, testes e ferramentas |
| `12-Projeto-Final/` | 12 | Projeto prático que integra o sistema de tipos todo + desafios extra |
| `13-Cheat-Sheet/` | 13 | Referência rápida com toda a sintaxe de tipos do curso |
| `14-Gabarito-dos-Exercicios/` | 14 | Solução comentada de cada exercício proposto no curso |

## Como estudar

1. Siga a ordem numérica dos módulos 00 a 11 (teoria), aula a aula.
2. Depois de cada aula, resolva os exercícios no final do próprio documento.
3. Use o `.pptx` de cada aula como revisão rápida, antes ou depois de ler a teoria.
4. Consolide tudo no **Módulo 12** com o projeto final.
5. Use o **Módulo 13** como consulta rápida no dia a dia.
6. Confirme o seu trabalho no **Módulo 14** só depois de tentar resolver sozinho.

## Convenções usadas nos documentos

- **Blocos de código** — exemplos em TypeScript para ler, compilar ou adaptar.
- **DICA** — sugestões, atalhos e boas práticas opcionais.
- **ATENÇÃO** — comportamentos que podem confundir ou operações arriscadas.
- **NOTA** — contexto adicional ou detalhe técnico opcional.
- **PRATICAR** — remete para os exercícios no final da aula.
