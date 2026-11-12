# Estado do Projeto — Curso de TypeScript de A a Z

> **Este ficheiro existe para uma sessão nova do Claude Code conseguir continuar o
> trabalho sem `/resume` e sem contexto anterior.** Leia-o do princípio ao fim antes
> de mexer em seja o que for. Atualize-o no fim de cada etapa.

**Última atualização:** 2026-09-25 (fim da Etapa 11 — curso concluído)

---

## 1. O que é este projeto

Um curso completo de TypeScript em **português europeu**, entregue como um `.docx`
(teoria, exemplos, exercícios) e um `.pptx` (resumo visual) por aula, organizado em
pastas numeradas por módulo.

**Público-alvo:** alguém que **já fez o Curso de JavaScript de A a Z**
(`C:\temp\Sites\javascript_studies`). O curso **não reensina JavaScript** — nada de
closures, protótipos, event loop ou métodos de array. Foca-se exclusivamente no
sistema de tipos e no que o TypeScript acrescenta. Isto está escrito em todos os
prompts dos agentes e tem de se manter.

É o terceiro curso com a mesma estrutura visual. Os anteriores, que servem de
referência, são `C:\temp\Sites\claude_code_studies` e `C:\temp\Sites\git_studies`.

---

## 2. Como o projeto funciona (arquitetura)

O conteúdo está **separado da apresentação**:

```
content-source/<modulo>/<ficheiro>.json   <- o conteúdo (fonte de verdade, editável)
<modulo>/<ficheiro>.docx + .pptx          <- gerado a partir do JSON (NÃO editar à mão)
tools/                                     <- os geradores
```

**Nunca edite os `.docx`/`.pptx` à mão**: são substituídos na geração seguinte.
Para mudar conteúdo, edite o JSON em `content-source/` e volte a gerar.

### Ferramentas em `tools/`

| Ficheiro | Para que serve |
|---|---|
| `course_order.py` | **A fonte de verdade da estrutura**: módulos, aulas, títulos e slugs. Mexer aqui primeiro. |
| `style.py` | Cores, fontes e título do curso |
| `docbuilder.py` / `pptxbuilder.py` | Geram o Word e o PowerPoint (não precisam de alterações) |
| `build_lesson.py` | Converte JSON em `.docx` + `.pptx` (`--all <pasta>` para lote) |
| `merge_raw.py` | Junta os `_raw_NN.json` escritos pelos agentes com os metadados |
| `refresh_nav.py` | Recalcula o slide final de cada aula ("a seguir vem...") |
| `build_gabarito.py` | Monta o Módulo 14 agregando os exercícios de todas as aulas |
| `generate_readmes.py` | Gera o README de topo e um por módulo |
| `verify_content.py` | **Verificação automática, sem gastar tokens** (ver secção 4) |

### O fluxo de uma aula nova

1. Um agente escreve **só o conteúdo** (5 campos) num ficheiro
   `content-source/<modulo>/_raw_<NN>.json`.
2. `python tools/merge_raw.py <modulo>` junta-lhe os metadados vindos de
   `course_order.py` (numeração, títulos, navegação) e apaga o `_raw_`.
3. `python tools/build_lesson.py --all content-source` gera os documentos.
4. `python tools/verify_content.py` valida.

Os agentes **nunca** tratam de numeração, títulos ou navegação — isso vem sempre de
`course_order.py`, para não depender de bookkeeping feito por modelos.

---

## 3. Ambiente

- **Python** com `python-docx` e `python-pptx` (já instalados; usar o comando
  `python`, **não** `python3`, que aponta para outra instalação sem os pacotes).
- **TypeScript 5.9.3** instalado localmente na raiz do projeto (`npm install`).
  O verificador usa `node_modules/.bin/tsc.cmd`.
- Ao correr scripts Python que imprimem acentos, usar `export PYTHONIOENCODING=utf-8`
  (a consola é cp1252 e rebenta com emojis).

---

## 4. Verificação automática — usar sempre antes de dar por fechado

```bash
cd tools && python verify_content.py
```

Faz quatro coisas, **sem gastar tokens de agentes**:

1. **Compila** cada bloco de código com `tsc --noEmit --strict`.
2. **Executa** os exemplos autónomos e apanha os que rebentam ou não terminam.
3. Procura **português do Brasil** no texto e nos nomes em código.
4. Procura **markdown** deixado por engano em campos de texto simples.

### A convenção do erro propositado (específica deste curso)

Num curso de TypeScript, muitos exemplos mostram **de propósito** código que o
compilador rejeita — é essa a lição. Esses casos têm de ter, na linha imediatamente
anterior, um comentário `// @ts-expect-error` (ou um comentário começado por
`// ERRO:`). O verificador ignora-os; sem a marca, conta-os como erro real.

Lição aprendida no curso de JavaScript: **a verificação automática apanhou mais bugs
reais do que uma passagem de revisão feita por agentes** (declarações duplicadas, um
exercício cuja solução nunca terminava). Compensa muito mais do que uma segunda ronda
de agentes.

---

## 5. O plano, por etapas

Cada etapa é um lote de agentes (1 agente por aula, em paralelo) seguido de
integração e verificação. O custo medido serve para decidir se se avança já ou se
se espera pela renovação do limite de utilização.

| Etapa | Âmbito | Aulas | Estado |
|---|---|---|---|
| **1** | Fundação (estrutura, ferramentas, verificador TS, currículo) + Módulo 00 + **Módulo 01** | 5 | **concluída** |
| **2** | Módulo 02 (Objetos e interfaces) + Módulo 03 (Funções tipadas) | 9 | **concluída** |
| **3** | Módulo 04 — Narrowing e Type Guards | 4 | **concluída** |
| **4** | Módulo 05 — Genéricos | 5 | **concluída** |
| **5** | Módulo 06 — Tipos Avançados | 5 | **concluída** |
| **6** | Módulo 07 — Utility Types | 4 | **concluída** |
| **7** | Módulo 08 — Classes e Orientação a Objetos | 4 | **concluída** |
| **8** | Módulo 09 — Módulos, tsconfig e Declarações | 5 | **concluída** |
| **9** | Módulo 10 — TypeScript no Mundo Real | 4 | **concluída** |
| **10** | Módulo 11 — Migração e Boas Práticas | 4 | **concluída** |
| **11** | Módulo 12 (Projeto final) + Módulo 13 (Cheat sheet) + Gabarito + READMEs + verificação global | 2 | **concluída** |

**Total: 49 aulas + 4 unidades especiais = 53 unidades.**

### Como executar uma etapa

1. Ver em `course_order.py` que aulas pertencem aos módulos da etapa.
2. Lançar **um agente por aula, todos numa só mensagem** (correm em paralelo). O
   prompt de cada agente deve incluir: público-alvo (já sabe JavaScript), mapa do
   curso, conteúdo específico a cobrir, o formato JSON exato, e as regras de
   validação — sobretudo a do `// @ts-expect-error` e a de que **cada bloco é
   compilado isoladamente** (não pode depender de declarações de outro bloco).
3. `python tools/merge_raw.py <pasta-do-modulo>` para cada módulo.
4. `python tools/build_lesson.py --all content-source`
5. `python tools/verify_content.py` e corrigir o que aparecer.
6. **Atualizar este ficheiro** (tabela de etapas + secção 6).

---

## 6. Onde é que isto vai

### Feito

- [x] Estrutura de pastas, `package.json` e TypeScript 5.9.3 local
- [x] Ferramentas copiadas de `javascript_studies/tools` e adaptadas
- [x] `course_order.py` com o currículo completo (49 aulas, 15 módulos)
- [x] `verify_content.py` reescrito para TypeScript (compila com `tsc`, percebe
      `@ts-expect-error`) — testado com um caso bom, um erro propositado e um erro
      real: distinguiu os três corretamente
- [x] **Módulo 00** (Introdução) escrito à mão, gerado e verificado
- [x] **Módulo 01** completo: 5 aulas, 35 secções, 20 exercícios
- [x] **Módulo 02** completo: 5 aulas (tipar objetos, interface vs type, opcionais e
      readonly, extensão e composição, tipagem estrutural)
- [x] **Módulo 03** completo: 4 aulas (parâmetros e retorno, opcionais/default/rest,
      tipos de função e this, sobrecargas)
- [x] **Módulo 04** completo: 4 aulas (narrowing com typeof/instanceof/in, uniões
      discriminadas, type predicates e assertion functions, exaustividade com never)
- [x] **Módulo 05** completo: 5 aulas (funções genéricas, interfaces e classes
      genéricas, constraints e tipos por omissão, inferência, padrões úteis)
- [x] **Módulo 06** completo: 5 aulas (keyof/typeof e indexed access, conditional
      types, mapped types, template literal types, infer e tipos recursivos), com a
      fronteira do Módulo 07 respeitada — verificada por script, zero utility types
      da biblioteca padrão nomeados nas cinco aulas
- [x] **Módulo 07** completo: 4 aulas (Partial/Required/Readonly, Pick/Omit/Record,
      ReturnType/Parameters/Awaited, criar utility types próprios), todas com o padrão
      "mostrar a definição real da biblioteca padrão antes de usar" e a ponte explícita
      para os nomes em português do Módulo 06
- [x] **Módulo 08** completo: 4 aulas (classes tipadas e modificadores de acesso,
      classes abstratas e implements, parameter properties/acessores/membros
      estáticos, decorators), com o contraste `private` (só compilação) vs `#`
      (runtime) medido na Aula 01 e os decorators do standard (stage 3, sem flags)
      medidos a sério na Aula 04
- [x] **Módulo 09** completo: 5 aulas (módulos em TypeScript, tsconfig.json
      essencial, o modo strict opção a opção, declaration files e @types, compilar e
      integrar no ecossistema). Muitas secções desta etapa ficaram só em prosa de
      propósito (comportamento de ferramentas externas ou de tsconfig que o
      verificador não aplica), com tabelas de resultados medidos manualmente em vez
      de blocos "code" forçados
- [x] **Módulo 10** completo: 4 aulas (assincronismo tipado, unknown na fronteira,
      validação em runtime com validadores compostos escritos à mão, tratamento de
      erros tipado com classes de erro e result objects). Todos os exemplos simulam a
      rede com funções locais (nenhum fetch real) e são determinísticos
- [x] **Módulo 11** completo: 4 aulas (migrar JS para TS com allowJs/checkJs/JSDoc,
      evitar any e fugas de tipo, ler e resolver erros do compilador, testes de tipos
      e ferramentas). Os blocos em JavaScript com JSDoc usam a convenção
      multi-ficheiro (ignorados pelo verificador) e foram validados à parte pelos
      agentes com `--allowJs --checkJs`
- [x] **Módulo 12** (Projeto Final): Gestor de Encomendas em 8 etapas (domínio com
      união discriminada de estados, transições que só aceitam o estado certo,
      validação na fronteira, repositório genérico async com `Resultado<T, E>`,
      relatório, testes de tipos) e 5 desafios extra
- [x] **Módulo 13** (Cheat Sheet): 9 secções, 122 linhas de tabela, só com o que as
      aulas deram (o agente leu os títulos das 49 aulas antes de escrever)
- [x] **Módulo 00** revisto: a tabela da estrutura já batia com os 15 módulos reais
- [x] Gabarito final: **204 exercícios de 51 unidades** (o cheat sheet fica de fora
      de propósito)
- [x] **Verificação global final a zero problemas: 526 blocos compilados com
      `tsc --strict`** (23 ignorados de propósito: JSON, shell, multi-ficheiro) e
      executados em Node, 53 unidades geradas

**Duas correções feitas na Etapa 1, que valem para as seguintes:**

1. O verificador compilava todos os blocos numa só chamada e os ficheiros sem
   `import`/`export` partilhavam o âmbito global — duas aulas com `const utilizador`
   colidiriam. Resolvido com a função `isolar()`, que acrescenta `export {}` a cada
   bloco. **Não é preciso pedir aos agentes nomes artificialmente únicos.**
2. O próprio Módulo 00 afirmava que "todo o JavaScript válido é TypeScript válido"
   com um exemplo que não compila em `strict`. A afirmação passou a ser qualificada
   (a *sintaxe* é válida; com `noImplicitAny` o compilador exige os tipos). Foi o
   verificador que apanhou isto.

### A seguir

**Nada: o curso está concluído.** Se for preciso corrigir conteúdo, editar o JSON
em `content-source/` e voltar a correr a sequência da secção 9 ("Depois de os
agentes entregarem"). As unidades especiais 12 e 13 não passam pelo `merge_raw.py`
(que só trata aulas numeradas): os seus JSON finais foram escritos com os metadados
copiados do formato do Módulo 00 (`kind` = `projeto` / `cheatsheet`) e editam-se
diretamente.

A pasta `scratchpad/` que tinha ficado na raiz do curso (restos das Etapas 7 e 8)
foi apagada a pedido do utilizador em 2026-09-25.

A partir daqui, **uma etapa é um módulo** (4 ou 5 aulas). Foi uma decisão explícita
do utilizador depois de a Etapa 2, com 9 aulas, ter consumido a janela inteira: com
5 aulas sobra-lhe cerca de metade da janela para outro trabalho.

Os títulos das aulas estão em `tools/course_order.py`. O prompt de cada agente deve
seguir o modelo da secção 5 e incluir sempre estes pontos, que foram o que fez a
Etapa 1 correr limpa:

- o aluno **já sabe JavaScript** — não reensinar a linguagem base;
- **cada bloco é compilado isoladamente**, não pode depender de outro bloco;
- código que o compilador deve rejeitar leva `// @ts-expect-error` na linha anterior;
- não redeclarar o mesmo identificador dentro do mesmo bloco;
- podem validar com `npx tsc --noEmit --strict` a partir da raiz do curso, e devem
  também EXECUTAR em Node os blocos sem erro intencional para confirmar as saídas
  dos comentários (foi o que fez a Etapa 4 passar a verificação sem uma correção);
- o briefing pode estar errado sobre o compilador: mandar escrever o comportamento
  real e assinalá-lo na resposta (ver erro 12 da secção 8).

Depois: `merge_raw.py <modulo>`, `refresh_nav.py`, `build_lesson.py --all
content-source`, `build_gabarito.py`, `generate_readmes.py`, `verify_content.py`.
A pasta `content-source/<modulo>/` pode não existir ainda — criá-la antes de lançar
os agentes, senão o `Write` de cada um falha.

---

## 7. Custos medidos (para decidir se se avança)

Referência do curso de JavaScript, já concluído: **~3,8 M tokens** de agentes para
58 unidades — cerca de 40 k por agente que só escreve, e 60 k por agente que também
compila e valida o próprio código.

| Etapa | Agentes | Tokens medidos | Por agente |
|---|---|---|---|
| 1 | 5 | **360 595** | 72 k (min 62 k, máx 99 k) |
| 2 | 9 | **720 606** | 80 k (min 58 k, máx 99 k) |
| 3 | 4 | **326 876** | 82 k (min 72 k, máx 95 k) |
| 4 | 5 | **440 300** | 88 k (min 79 k, máx 96 k) |
| 5 | 5 | **413 002** | 83 k (min 77 k, máx 95 k) |
| 6 | 4 | **409 365** | 102 k (min 83 k, máx 128 k) |
| 7 | 4 | **520 884** | 130 k (min 102 k, máx 171 k) |
| 8 | 5 | **840 881** | 168 k (min 131 k, máx 199 k) |
| 9 | 4 | **268 336** | 67 k (min 61 k, máx 71 k) |
| 10 | 4 | **310 035** | 78 k (min 71 k, máx 87 k) |
| 11 | 2 | **192 285** | 96 k (min 87 k, máx 105 k) |

**Ritmo real, medido (não estimado):** uma etapa de 9 aulas consumiu **97% de uma
janela de 5 horas** — praticamente a janela inteira, contando agentes, integração e
verificação. No limite semanal, custou **9 pontos percentuais**.

Consequências práticas, a respeitar no planeamento:
- **Uma etapa de 9 aulas ocupa uma janela inteira.** Não conte fazer mais nada nessa
  janela.
- Se precisar de folga para outro trabalho, **reduza a etapa para 5 ou 6 aulas**
  (uma etapa de 5 aulas custou ~68% de uma janela que já vinha usada).
- A estimativa inicial para esta etapa foi de 55-70% e revelou-se muito otimista: o
  custo dos agentes é só parte, a integração e a verificação pesam mais do que parece.

**Total do curso:** as 11 etapas somaram **~4,80 M tokens** de agentes (51
agentes), contra ~3,8 M do curso de JavaScript. A diferença vem quase toda das
Etapas 7 e 8 (medições de decorators e de flags do tsconfig).

**Etapa 11 (2 unidades especiais): 192 285 tokens**, dentro da previsão (200-300 k).
O Cheat Sheet foi o mais caro (105 k) por ler os títulos das 49 aulas antes de
escrever; compensou, porque não entrou nada que as aulas não tenham dado.

**Etapa 10 (4 aulas): 310 035 tokens** — em linha com a Etapa 9, apesar de o módulo
ser sobre ferramentas como o 09. A diferença para os 840 k da Etapa 8 confirma a
conclusão anterior: o que encareceu o Módulo 09 foi comparar muitas configurações de
flags, e o prompt desta etapa já dizia que blocos ficavam em prosa ou multi-ficheiro.
Verificação global a zero problemas à primeira, pela quinta etapa seguida.

**Etapa 9 (4 aulas): 268 336 tokens — a etapa mais barata do curso, e a descida
quebra a série de quatro aumentos seguidos (168 k → 67 k por agente).** Os prompts
continuaram a mandar medir, mas os pontos a medir eram poucos e concretos (códigos
de erro, tipos inferidos, assinaturas da lib), sem a comparação "com e sem flag" que
encareceu a Etapa 8. Verificação global a zero problemas à primeira. Conclusão: o que
encarece não é "medir", é o número de configurações diferentes a comparar.

**Etapa 8 (5 aulas): 840 881 tokens — quarto aumento seguido do custo por agente
(83 k → 102 k → 130 k → 168 k) e a etapa mais cara do curso até agora, mesmo sem
aumentar o número de aulas em relação à Etapa 5 (também 5 aulas, mas só 413 k).** A
diferença não é o número de aulas nem a dificuldade do tema — é que este módulo
(ferramentas e configuração) obrigou os agentes a medir com `npx tsc` manual, com
flags extra, muito mais vezes do que um módulo só de sistema de tipos: cada opção do
tsconfig e cada sub-opção do strict teve de ser isolada e comparada "com" e "sem" a
flag antes de entrar na aula. A Aula 03 (o modo strict) e a Aula 02 (tsconfig geral)
foram as mais caras (199 k e 177 k) precisamente pelas que mais mediram. Confirma,
outra vez, que **medir custa tokens e paga-se em correções zero**: a verificação
final voltou a dar zero problemas à primeira. Um efeito novo nesta etapa: dois
agentes diferentes (Aulas 01 e 04) testaram de forma independente a mesma técnica
sugerida no prompt (`declare module` + `import` no mesmo bloco) e ambos mediram, sem
se combinarem, que ela não funciona — prova de que a instrução "meça antes de
assumir" está mesmo a ser seguida, mesmo quando quem escreveu o prompt (o próprio
planeamento da etapa) também tinha assumido algo errado.

**Etapa 7 (4 aulas): 520 884 tokens — novo máximo, e o segundo aumento seguido do
custo por agente (102 k → 130 k).** A Aula 04 (Decorators) custou 171 k sozinha, o
agente mais caro do curso até agora, porque a instrução desta etapa foi medir tudo
sobre decorators sem confiar em memória — a versão standard (stage 3) mudou a
assinatura e o comportamento em relação à versão legacy mais conhecida, e o agente
correu experiências extra (addInitializer em classe vs instância, ordem de avaliação
com vários decorators, o que acontece ao nome de uma classe anónima devolvida, e um
erro de mixin constraint TS2545 não previsto no briefing). Confirma o padrão da Etapa
6: **pedir medição em vez de afirmação custa mais tokens e paga-se em zero correções
manuais.** A verificação final voltou a dar zero problemas de compilação/execução à
primeira — só apanhou um falso positivo do verificador de markdown (ver secção 8,
erro 21), corrigido a seguir sem repetir agentes.

**Etapa 6 (4 aulas): 409 365 tokens — o custo por agente subiu para 102 k e quebrou a
estabilidade das cinco etapas anteriores.** A etapa anterior com 4 aulas (a 3) tinha
custado 327 k. A diferença não é o número de aulas: é a instrução de **medir em vez
de afirmar**. Os prompts desta etapa mandavam validar no compilador pontos concretos
(o `keyof any` do Omit, o `T & {}` do NonNullable, o limite de recursão, o que um
mapped type ingénuo faz a arrays e funções) e o agente mais caro (128 k, a Aula 04)
foi precisamente o que mediu mais casos. Pagou-se: a verificação deu **zero problemas
à primeira, terceira etapa seguida sem uma correção manual**, e três afirmações do
briefing foram corrigidas antes de entrarem no curso. Contar com **~100 k por agente**
quando o prompt pede medições, não 83 k.

**Confirmado na Etapa 5 (5 aulas):** 413 002 tokens de agentes — praticamente igual
aos 440 300 da Etapa 4, com o mesmo número de aulas. O custo por agente mantém-se
estável nas cinco etapas (72 k, 80 k, 82 k, 88 k, 83 k): a variável que manda é mesmo
o **número de aulas**, não o tema nem a dificuldade. O Módulo 06 é dos temas mais
difíceis do curso e não custou mais do que os genéricos. Todos os cinco agentes
compilaram e executaram os blocos antes de gravar, e a verificação final deu **zero
problemas à primeira, sem uma única correção manual** — segunda etapa seguida em que
isso acontece. A exigência de executar, e não só compilar, paga-se sozinha.

**Confirmado na Etapa 4 (5 aulas):** 440 300 tokens de agentes — bate certo com a
previsão de "~410 k para um módulo de 5 aulas" feita no fim da Etapa 3. O custo por
agente subiu ligeiramente (88 k) porque quatro dos cinco agentes compilaram **e
executaram** todos os blocos antes de gravar; pagou-se bem: a verificação final deu
zero problemas à primeira, sem uma única correção manual. Manter a exigência.

**Confirmado na Etapa 3 (4 aulas):** 326 876 tokens de agentes, mais a integração e a
verificação — coerente com a previsão de ~400 k por etapa de um módulo. O custo por
agente mantém-se estável nas três etapas (72 k, 80 k, 82 k), por isso a variável que
manda é o **número de aulas do módulo**, não o tema. Um módulo de 5 aulas deve rondar
os 410 k de agentes.

**Decisão a tomar no fim de cada etapa:** com o custo medido, avançar já para a
etapa seguinte ou esperar pela renovação do limite de utilização.

---

## 8. Erros já cometidos noutros cursos — não repetir

1. **Escrever títulos sem acentos** no manifesto e só dar por isso no fim. Os
   títulos corretos vivem em `course_order.py`; os slugs (nomes de ficheiro) é que
   são ASCII de propósito.
2. **Esquecer o `refresh_nav.py`** depois de mudar a estrutura: o slide final de
   cada aula passa a apontar para o módulo errado, e nada avisa.
3. **Exemplos com resultados voláteis** nos comentários (`new Date()` sem
   argumentos, `Math.random()`): o comentário fica errado no dia seguinte. Os
   prompts dos agentes têm de proibir isto explicitamente.
4. **Módulo 00 desatualizado**: descreve a estrutura do curso em prosa, por isso
   tem de ser atualizado à mão sempre que se acrescenta ou renumera um módulo.
      Nenhum script apanha isto.
5. **Agentes a morrer a meio por limite de utilização**: o ficheiro que já
   escreveram costuma estar bom. Validar antes de deitar fora e relançar.
6. **O scratchpad é partilhado entre agentes em paralelo.** Na Etapa 2, quatro
   agentes relataram ficheiros temporários sobrepostos uns pelos outros. Dê a cada
   agente uma subpasta própria no prompt (por exemplo `scratchpad/m04a01`).
7. **O `@ts-expect-error` só apanha erros SEMÂNTICOS, não sintáticos.** Uma
   demonstração que dependa de um erro de sintaxe não funciona — é preciso trocar o
   exemplo.
8. **O `@ts-expect-error` vai na linha onde o tsc reporta o erro**, que nem sempre é
   a linha do `const`: numa propriedade aninhada é imediatamente antes dessa
   propriedade; num `type` duplicado o erro aparece nas duas declarações.
9. **Exemplos que rebentam a meio matam o resto do bloco.** Na Etapa 2 havia um
   exemplo cujo `TypeError` era intencional, mas que impedia as cinco linhas
   seguintes de correr — as saídas prometidas nos comentários nunca aconteciam.
   Envolva o erro intencional num `try/catch`.
10. **O verificador só apanha português do Brasil, não o corrige.** Na Etapa 3 passou
   um "você" no `subtitle` de uma aula: os agentes validam o código com o compilador,
   mas ninguém valida a variante de português antes de gravar. Vale a pena um aviso
   explícito no prompt contra "você" (usar "o próprio código", "quem escreve" ou a
   3.ª pessoa), porque é sempre aí que escapa.
11. **Funcionalidades recentes do TypeScript mudam os exemplos.** A versão instalada é
   a 5.9.3: o estreitamento sobrevive em closures criadas depois da última atribuição
   (TS 5.4) e os predicados de tipo são inferidos em funções curtas (TS 5.5). Dois
   agentes tiveram de contornar isto — o exemplo de perda de narrowing precisa de um
   `let` reatribuído mais abaixo, e o exemplo do "antes" de um predicado precisa de
   `: boolean` explícito para a inferência não estragar a demonstração.

12. **O prompt do agente afirmou uma falsidade sobre o TypeScript e quase entrou no
   curso.** Na Etapa 4, o briefing da aula de inferência mandava mostrar que
   `juntar<T>(a: T, b: T)` chamado com um number e uma string "infere a união
   `string | number`". É falso: o compilador fixa `T` no primeiro candidato e rejeita
   o segundo (TS2345). O agente validou, contrariou o briefing e escreveu o
   comportamento real, mais os casos vizinhos que produzem mesmo a união (candidatos
   compatíveis dão o supertipo comum; um único argumento que já é união dá a união).
   Duas conclusões: **não afirme comportamento do compilador num prompt sem o ter
   verificado** — descreva antes o que se quer demonstrar e deixe o agente apurar o
   resultado; e **diga explicitamente ao agente para contrariar o briefing** quando o
   compilador o desmentir, porque o instinto de um modelo é obedecer ao enunciado.
   Pelo mesmo motivo caiu outra afirmação do briefing: trocar a ordem `(fn, itens)`
   para `(itens, fn)` NÃO parte a inferência do callback (os argumentos sensíveis ao
   contexto são adiados para uma segunda passagem).

13. **Um comentário de saída sobre `readonly` estava errado e só a EXECUÇÃO o apanhou.**
   Na Etapa 5, uma aula escrevia que, depois de um `@ts-expect-error` numa escrita a
   uma propriedade tornada `readonly`, o valor lido continuaria a ser o original. É
   falso: `readonly` é só verificação de compilação, o JavaScript emitido faz a
   atribuição na mesma. Compilar não chegava — foi correr em Node que apanhou isto.
   **Manter a exigência de executar os blocos, não só compilá-los.**

14. **Provar um erro de tipo com um literal de objeto não funciona.** Para demonstrar
   que um conditional distributivo dá `{valor: string} | {valor: number}` e não
   `{valor: string | number}`, um literal `{ valor: misto }` NÃO é rejeitado (o
   compilador verifica literais de objeto contra a união combinada das propriedades).
   É preciso passar uma **variável já tipada**. Vale para qualquer demonstração de
   incompatibilidade com uniões de objetos.

15. **Não afirmar limites numéricos do compilador sem os medir** (corolário do erro 12).
   O briefing da Etapa 5 dizia que uma união de template literals rebenta "acima de
   100 000 membros": na realidade **atingir** 100 000 já dá TS2590. E `${number}`
   aceita muito mais do que parece — negativos, notação científica, zeros à esquerda e
   até hexadecimal (`0x1F`) —, pelo que nunca substitui validação em runtime. Foi o
   agente a medir cada caso que produziu a tabela que ficou na aula.

16. **Ao demonstrar um tipo dependente de um conditional por resolver, a asserção tem
   de ser dupla.** `... as Repetido<T>` dá TS2352 ("neither type sufficiently
   overlaps"); só `as unknown as Repetido<T>` compila. Do mesmo modo,
   `Promise.resolve(Promise.resolve(x))` achata em runtime, por isso um exemplo de
   promessa aninhada precisa de `declare function f(): Promise<Promise<T>>` em vez de
   um valor construído.

17. **A fronteira entre dois módulos vizinhos aguenta-se, mas só se for dita e
   verificada.** O Módulo 06 ensina a mecânica dos utility types sem poder nomear um
   único; correu limpo porque a proibição estava explícita em cada um dos cinco
   prompts, com a alternativa dada (implementar à mão com nome próprio em português).
   Confirme sempre por script no fim — um `grep` pelos nomes da biblioteca padrão
   custa segundos e é a única prova de que a fronteira se manteve.

18. **"Um mapped type ingénuo destrói arrays e funções" é meia verdade** — o briefing
   da Etapa 6 afirmava-o e o agente mediu: com `type Ingenuo<T> = { [K in keyof T]?:
   Ingenuo<T[K]> }`, as **funções e métodos** perdem mesmo a assinatura de chamada
   (TS2349), mas **arrays e tuplos sobrevivem** — o mapped type é homomórfico e
   continuam arrays; o que muda é o `?` atravessar para os elementos, que passam a
   `E | undefined`. Os primitivos passam intactos. Mais um caso do erro 12: o que
   parecia folclore bem conhecido estava errado a meio.

19. **Uma função com `this` declarado é atribuível a um tipo de função sem `this`.**
   Na Etapa 6, a via natural para mostrar que o `this` é exigido — atribuir a função a
   `(valor: number) => string` — não dá erro nenhum, e o `@ts-expect-error` passa a ser
   ele próprio um erro (TS2578). O erro real só aparece ao **chamar** a função sem o
   contexto, e essa chamada rebenta em runtime, por isso tem de ir dentro de um
   `try/catch` (regra 6). Vale para qualquer demonstração de `this` tipado.

20. **Ao usar `@ts-expect-error` numa escrita a uma propriedade `readonly`, ponha-a
   DEPOIS dos `console.log` cujo resultado está comentado.** Corolário do erro 13: a
   escrita é emitida e executa-se, por isso uma demonstração colocada a meio do bloco
   altera os valores que as linhas seguintes imprimem e os comentários passam a estar
   errados. Dois agentes da Etapa 6 deram por isto sozinhos ao executar os blocos.

21. **O verificador de markdown dispara em QUALQUER campo de texto cuja linha comece
   por `#` seguido de espaço** (`titulo #`, regex `^#{1,6}\s+\S`), não só em
   `heading`: aplica-se também a `body`, `callout_text`, células de tabela,
   `subtitle`, `objectives`, `summary` e aos campos dos exercícios. Na Etapa 7, o
   título "# continua privado quando o programa corre" (a comparar `private` com o
   campo `#` do JavaScript) foi apanhado como falso positivo de markdown. Não é um
   bug do verificador a corrigir — é o comportamento esperado, porque um `#` a início
   de linha É markdown na esmagadora maioria dos casos. Quando o curso precisar
   mesmo de começar uma frase ou título pelo símbolo `#` (privado do JavaScript,
   hashtags, etc.), reescreva para o `#` não ser o primeiro carácter da linha (por
   exemplo "O campo # continua..." em vez de "# continua..."). Vale para qualquer
   módulo futuro que fale de campos privados `#`.

22. **`declare module 'nome' { ... }` seguido de `import ... from 'nome'` NO MESMO
   FICHEIRO não funciona**, ao contrário do que esta secção chegou a recomendar como
   técnica para simular um módulo externo dentro de um único bloco autónomo. Dois
   agentes da Etapa 8 (Módulo 09, Aulas 01 e 04) mediram-no de forma independente e
   confirmaram o mesmo erro: assim que o ficheiro tem qualquer `import`/`export`
   próprio — incluindo o `export {};` que o `isolar()` do verificador injeta em
   blocos sem nenhum —, o TypeScript deixa de tratar `declare module 'nome'` como uma
   declaração AMBIENTE nova e passa a tratá-la como uma AUMENTAÇÃO de um módulo já
   existente, dando sempre TS2664 ("cannot be found") porque esse módulo não existe
   em lado nenhum. Só compila num ficheiro sem NENHUM `import`/`export` — o que o
   `isolar()` do verificador impede sempre que o bloco já tenha um. A alternativa que
   funcionou nos dois casos: a convenção multi-ficheiro que o próprio
   `verify_content.py` já reconhece e ignora de propósito (comentários
   `// nome.d.ts` seguidos de `// noutro ficheiro main.ts` dentro do mesmo campo
   `code`, apanhados por `nao_e_ts()` e excluídos da compilação), validada à parte
   com ficheiros reais no scratchpad antes de gravar. Corolário do erro 12: até uma
   instrução já escrita com confiança numa secção "A seguir" pode estar errada —
   mande sempre medir antes de assumir, mesmo quando a instrução vem deste próprio
   ficheiro.

23. **Pormenores do briefing da Etapa 9 que o compilador corrigiu** (todos entraram
   no curso com o comportamento real):
   - `if (promessa)` dá TS2801 só quando a variável não é usada dentro do `if`;
     `if (!promessa)` e `while (promessa)` passam sem aviso.
   - `Promise.allSettled` com um `T` genérico dá `PromiseSettledResult<Awaited<T>>`,
     não `PromiseSettledResult<T>` — um predicado com `T` dá TS2677.
   - `typeof x.campo === "string"` depois de `"campo" in x` estreita só a
     propriedade, não o objeto: para devolver o tipo de domínio é preciso construir
     um objeto novo. Aceder a propriedade de um elemento de `unknown[]` dá TS2571,
     não TS18046 (esse só aparece com identificador).
   - TS2776 não aparece com arrow functions sem anotação (isso é TS2775); aparece
     com chamada por índice (`lista[0](x)`).
   - `catch (e: Error)` dá TS1196 e o `@ts-expect-error` apanha-o (tem de ir na
     linha do `}` que fecha o `try`).
   - Um agente correu o `build_lesson.py`/compilação a partir da pasta do curso e
     deixou `b*.ts` temporários na raiz (apagou-os ele próprio). Repetir no prompt
     que nada fica na pasta do curso além do `_raw_NN.json`.

24. **Pormenores da Etapa 10 medidos pelos agentes** (entraram no curso assim):
   - Num `.js`, `allowJs` sozinho já verifica os ficheiros com `// @ts-check`;
     parâmetros sem JSDoc são `any` E opcionais; um `.js` só com `@typedef` não é
     módulo (`import("./x.js").T` dá TS2306 sem um `export {}`).
   - Numa cadeia só de propriedades, o tsc 5.9 junta o caminho numa linha ("The
     types of 'a.b.c' are incompatible") em vez de uma linha por nível. O TS2769
     lista cada sobrecarga até 3 candidatas; só com 4 ou mais diz "The last overload
     gave the following error".
   - O truque `const _t: never = x` para ver um tipo não funciona debaixo de
     `@ts-expect-error` (a mensagem fica escondida).
   - O Node 24 corre `.ts` sem flag (type stripping), sem verificar tipos; `enum`,
     parameter properties e `namespace` dão `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`; um
     `import` sem `type` de algo que só é tipo rebenta no Node.
   - O `Igual<A, B>` robusto dá `false` para `{a:1} & {b:2}` contra `{a:1; b:2}`.
   - `as const satisfies` é preciso para manter literais contra um `Record<K, string>`.

---

## 9. Modelo de prompt para os agentes (copiar e adaptar)

Um agente por aula, **todos lançados na mesma mensagem** para correrem em paralelo.
Substituir o que está entre chavetas. Isto foi afinado ao longo de duas etapas e foi
o que fez as 14 primeiras aulas chegarem sem um único erro de compilação.

(Os caminhos abaixo usam barras normais de propósito: funcionam na mesma em Windows
e evitam que as barras invertidas sejam interpretadas como escapes ao copiar.)

```
Está a escrever o conteúdo de UMA aula para um Curso de TypeScript em PORTUGUÊS
EUROPEU (de Portugal: "ficheiro" e não "arquivo", "utilizador" e não "usuário",
"está a fazer" e não "estar fazendo" — nunca português do Brasil). NUNCA use "você":
prefira a 3.ª pessoa, "quem escreve o código", "o próprio código" ou a forma impessoal.

PÚBLICO-ALVO: o aluno JÁ FEZ um curso completo de JavaScript. Não reensine
JavaScript. Escreva só sobre o que o TypeScript acrescenta.

TAREFA: escrever o JSON de conteúdo da aula "{TÍTULO}" (Módulo {MM}, Aula {NN}) e
gravá-lo com Write em:
C:/temp/Sites/typescript_studies/content-source/{PASTA_DO_MODULO}/_raw_{NN}.json

MAPA DO CURSO: {listar os módulos, marcando como conhecidos os já dados e dizendo
que temas ficam para módulos posteriores, para não haver repetição}

CONTEÚDO A COBRIR: {lista dos pontos concretos da aula}

FORMATO DO JSON (exatamente estes campos, nada mais):
{
  "subtitle": "frase curta (até ~90 caracteres) para a capa",
  "objectives": ["3 a 6 itens curtos"],
  "sections": [
    {"heading": "título curto", "body": ["1 a 3 parágrafos de texto simples"],
     "code": "código TypeScript (ou string vazia)",
     "callout_kind": "DICA | ATENCAO | NOTA | PRATICAR | NONE",
     "callout_text": "texto ou string vazia",
     "table_headers": ["só se uma tabela ajudar; senão lista vazia"],
     "table_rows": [["mesmas colunas que os cabeçalhos"]],
     "slide_bullets": [{"icon": "emoji", "text": "frase até ~70 caracteres"}]}
  ],
  "exercises": [
    {"title": "...", "difficulty": "Iniciante | Intermedio | Avancado",
     "statement": "enunciado autossuficiente", "hint": "pista que não resolve",
     "solution_code": "solução completa", "solution_explanation": "2 a 3 frases"}
  ],
  "summary": ["4 a 6 bullets"]
}

REGRAS OBRIGATÓRIAS (validadas automaticamente pelo compilador):
1. 5 a 7 secções e 4 exercícios de dificuldade crescente.
2. NADA de markdown nos campos de texto: sem asteriscos, sem cardinais, sem blocos
   de código markdown e sem listas com traço. Vai para um documento Word.
3. Todo o código tem de COMPILAR com: tsc --noEmit --strict --target es2022
   Cada bloco é compilado ISOLADAMENTE: tem de ser autónomo, sem depender de
   declarações de outro bloco.
4. Código que o compilador deve rejeitar leva SEMPRE um comentário @ts-expect-error
   na linha imediatamente anterior, com a explicação. Sem essa marca conta como erro
   real. Atenção: um @ts-expect-error que não apanhe erro nenhum é ele próprio um
   erro de compilação. E vai na linha onde o tsc reporta o erro, que nem sempre é a
   linha do const — numa propriedade aninhada é imediatamente antes dessa
   propriedade; num type duplicado o erro aparece nas duas declarações.
5. Não redeclare o mesmo identificador dentro do mesmo bloco. Entre blocos
   diferentes não há problema: cada um é compilado como um módulo isolado.
6. Se um exemplo lançar um erro em tempo de execução de propósito, envolva-o num
   try/catch — senão o resto do bloco nunca corre e os comentários de saída passam
   a prometer resultados que o aluno nunca vê.
7. Os comentários que mostram resultados ou tipos inferidos têm de estar corretos.
8. Direto e claro, sem encher texto.
9. O briefing acima pode estar errado sobre o que o compilador faz. Se o validar e o
   resultado for outro, escreva o COMPORTAMENTO REAL e diga-o na resposta final — não
   force o exemplo a encaixar no enunciado.

Valide antes de gravar: há um TypeScript instalado em C:/temp/Sites/typescript_studies — a partir dessa
pasta pode correr: npx tsc --noEmit --strict --target es2022 ficheiro.ts
Use uma subpasta própria para os ficheiros temporários (por exemplo m{MM}a{NN}): o
scratchpad é partilhado e vários agentes já se sobrepuseram uns aos outros.

Grave o ficheiro e responda com uma frase, dizendo quantas secções e exercícios
escreveu.
```

### Depois de os agentes entregarem

```bash
cd tools
python merge_raw.py {PASTA_DO_MODULO}
python refresh_nav.py
python build_lesson.py --all ../content-source --out-root ..
python build_gabarito.py --out-root ..
python generate_readmes.py --out-root ..
python verify_content.py
```

E depois atualizar este ficheiro: tabela de etapas (secção 5), o que ficou feito
(secção 6) e os tokens medidos (secção 7).
