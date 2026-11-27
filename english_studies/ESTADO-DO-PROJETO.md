# Estado do projeto: Mini-Curso de Inglês (A1 para A2 e além)

**Ler este ficheiro primeiro ao retomar o trabalho.**

**Estado (2026-11-27): curso completo (módulos 00 a 14) e roteiro interativo de 12 semanas gerados. Falta o uso real pelo aluno e rever conteúdos conforme o feedback.**

## 1. Resumo

- Pasta: `C:\temp\Sites\studies\english_studies`. Aulas em Markdown (uma por módulo); `.docx` e `.pptx` gerados por `tools/build_course_artifacts.py` (copiado do Bun e adaptado). O roteiro HTML é gerado por `tools/roteiro/build_roteiro.py`. Nunca editar ficheiros gerados.
- Público: pessoa de língua portuguesa (pt-PT), nível A1, que quer sair do básico sem viver num país de língua inglesa. Meta: A2 sólido com ponte para B1. Perfil usado no roteiro: 30 min por dia de estudo ativo, maior dificuldade **perceber quando ouve**, objetivo de **trabalho em tecnologia**, interesses em tecnologia, séries e filmes, música e podcasts.
- Aulas em pt-PT («tu») com exemplos em inglês britânico e IPA britânico (notas do americano).
- Metodologia (módulo 11): Natural Method e Comprehensible Input, com imersão nos tempos mortos, barril de conteúdos, micro-hábitos e imersão ativa (shadowing, chorusing, sentence mining, Anki, escrita com correção de IA, interação com conteúdo, roleplay). Os conceitos vêm de prompts que o utilizador viu num vídeo.

## 2. Módulos

| Módulo | Tema | Linhas |
|---|---|---|
| 00 | Introdução e plano de imersão | 167 |
| 01 | Sons e ortografia | 199 |
| 02 | Apresentações e To Be | 220 |
| 03 | Rotinas e presente simples | 220 |
| 04 | Perguntas, números e horas | 220 |
| 05 | Pedir e descrever | 220 |
| 06 | Passado simples | 213 |
| 07 | Planos e futuro | 212 |
| 08 | Descrever e comparar | 228 |
| 09 | Inglês real e phrasal verbs | 221 |
| 10 | Conversar e escrever | 223 |
| 11 | Imersão avançada (manual do roteiro, estimativa de tempo) | 177 |
| 12 | Exercícios práticos (59 exercícios, com níveis) | 477 |
| 13 | Consulta rápida | 163 |
| 14 | Gabarito | 292 |

Os exercícios e as soluções existem só nos módulos 12 e 14: as aulas só têm uma linha PRATICAR. Os blocos por módulo ficaram em ficheiros temporários (`ex_NN.md`, `sol_NN.md`, no scratchpad da sessão) e o montador renumera de forma contínua. Para alterar exercícios, edita diretamente os módulos 12 e 14 (mantém a numeração igual nos dois).

## 3. Roteiro interativo (`Roteiro-12-Semanas/roteiro.html`)

- Página única, sem bibliotecas externas, que lê dados de `tools/roteiro/semanas.json` (12 semanas; 946 palavras no total; 7 dias por semana, 84 no total). Mostra a percentagem de progresso, uma caixa por dia, detalhe do dia ao clicar, gramática, recursos, barril de conteúdos, imersão, autoavaliação e vocabulário (filtro, esconder tradução, exportar TSV para o Anki). Progresso em `localStorage` (com aviso se o browser não deixar), exportar e importar progresso, tema claro ou escuro.
- Regenerar: `python tools/roteiro/build_roteiro.py` (corre da pasta `english_studies`).
- Testado (2026-11-27) num servidor local temporário: 12 semanas, 7 dias, percentagem, persistência, mudança de semana, filtro, esconder tradução, cópia de pedidos de IA. Não foi testado em telemóvel real nem em Firefox ou Safari. O Chrome não abre `file://` pela extensão, por isso o teste foi por `http://127.0.0.1`; o aluno abre o ficheiro diretamente (o `localStorage` de `file://` pode variar entre browsers).
- Vocabulário: as repetições entre semanas foram retiradas (as semanas 1 a 4 mantêm tudo; das semanas 5 a 12 saíram 135 repetições) e acrescentaram-se palavras às semanas 5, 6, 10 e 11 para chegarem a 70 ou mais. A semana 5 e a 10 têm exatamente 70.
- Resultado dos agentes (modelo mais barato, 3 agentes): só links de uma lista fixa (BBC, VOA, British Council, Cambridge Dictionary, YouGlish, Language Reactor, Anki, Microsoft Learn, SAP Developer Center, MDN, GitHub), verificados por título; séries e outros conteúdos sem link e com o aviso «confirma se está na tua plataforma».

## 4. O que foi verificado

- Estrutura: 15 aulas, 15 Word, 15 PowerPoint; `lint` 0; sem carateres de controlo, barras invertidas nem marcas soltas nos Word.
- Links (2026-11-27): os das aulas foram abertos e conferidos pelo título real; os da Cambridge (gramática) existem; o British Council e a página dos níveis CEFR do Conselho da Europa só se abrem no browser (o `curl` leva 403); o artigo de «Guided learning hours» da Cambridge também bloqueia o `curl`, mas foi encontrado por pesquisa.
- Conteúdo: a revisão incidiu nas afirmações que os agentes assinalaram (IPA de thirteen e thirty, half six, gonna, couldja e wouldja, at the weekend, etc.), todas conferidas ou uniformizadas (gonna: /ˈɡɒnə/ britânico e /ˈɡʌnə/ americano), e nas soluções fechadas dos módulos 03, 04, 06 e 08. Não foi feita uma revisão linha a linha de todas as aulas e soluções por um falante nativo.
- Estimativa de tempo (módulo 11): usa as horas orientadoras da Cambridge English (A1 cerca de 90 a 100, A2 cerca de 180 a 200, B1 cerca de 350 a 400, acumuladas); as subtrações e os cenários são cálculo próprio e estão assinalados como estimativa otimista.

## 5. Limites conhecidos

- Não há áudio próprio: a escuta usa BBC 6 Minute English, VOA, British Council e o Cambridge Dictionary. Os exercícios de escuta têm critérios e não respostas únicas.
- Pronúncia: as aproximações para falantes de português são heurísticas; o curso manda confirmar no áudio.
- Serviços citados sem ligação e sem verificação de preços (HelloTalk, Tandem, iTalki, Preply): confirmar no momento.
- Hipótese do input compreensível (Krashen) apresentada como discutida; repetição espaçada como prática comum.
- O roteiro não foi validado por uso real: ajustar tempos, ordem e dificuldade depois da primeira semana.

## 6. Como gerar

    export PYTHONIOENCODING=utf-8
    python tools/build_course_artifacts.py            # tudo
    python tools/build_course_artifacts.py --only 02,03
    python tools/roteiro/build_roteiro.py             # roteiro HTML
    python tools/apoio/lint.py english_studies        # tem de dar 0 problemas

Depois: apagar `tools/__pycache__`.

## 7. Regras de conteúdo

Português europeu e «tu». Callouts **DICA:**, **ATENÇÃO:**, **NOTA:**, **PRATICAR:**. Blocos de texto a copiar em 4 espaços. Sem itálico em títulos nem dentro de negrito, sem `|` em células, sem acento grave solto (código em linha emparelhado é aceite), sem barras invertidas. Cada aula termina com Exercícios (linha PRATICAR para o módulo 12) e Fontes oficiais (links verificados). Cada módulo tem laboratório com resultado esperado e tabela de diagnóstico. Aproximações sobre o português marcadas como tal. Máximo de 3 agentes de cada vez; nunca terminar processos por nome (ver `CLAUDE.md` da raiz).

## 8. Próximos passos possíveis

1. O aluno usa a semana 1 do roteiro e dá feedback (tempos, dificuldade, o que falta).
2. Rever a pronúncia e as notas britânico contra americano com uma fonte humana, se existir.
3. Pontos de extensão: ponte para B1 (present perfect e condicionais), áudio gerado (voz sintética) para os ditados, versão para telemóvel (PWA).
