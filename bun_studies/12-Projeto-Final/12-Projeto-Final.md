# 12 Projeto final

## O que vais fazer

Vais construir a **API da loja** inteira só com o que o Bun traz, sem nenhum pacote do npm: servidor HTTP, base de dados SQLite, documentação com OpenAPI e Swagger UI, testes, segurança básica e, no fim, um **executável único**. O projeto junta tudo o que aprendeste: runtime e TypeScript, ficheiros, servidor, cliente, bases de dados, segurança, testes e bundler.

**NOTA:** o projeto é aberto. O módulo 15 traz uma grelha para te avaliares, e não um código para copiar. O ponto de partida é a API da loja do módulo 03 (`03-Servidor-HTTP/exemplos/loja-api`) e os dados do `loja.sql`.

## Regra do projeto

A pasta do projeto **não pode ter node_modules**. Se precisares de instalar alguma coisa, a funcionalidade nativa que a substitui está nos módulos 01 a 11 (consulta a tabela «O que substitui» de cada um).

## Requisitos

### 1. Dados (módulo 05)

- Carrega o `loja.sql` num ficheiro SQLite com `bun:sqlite`, com `PRAGMA foreign_keys` ligado (o Bun abre-o desligado).
- Uma camada de acesso a dados com consultas parametrizadas (nunca texto concatenado).
- Dinheiro tratado com cuidado: o SQLite não tem DECIMAL exato, por isso guarda em cêntimos ou arredonda de forma explícita e documenta a escolha.

### 2. API (módulo 03)

| Rota | Descrição |
|---|---|
| GET /api/produtos | Lista com filtro por categoria e paginação |
| GET /api/produtos/:id | Um produto, ou 404 |
| POST /api/encomendas | Cria uma encomenda com as suas linhas |
| GET /api/encomendas/:id | Uma encomenda com o total e as linhas |
| GET /api/relatorios/receita | Receita por categoria e por mês |

- A criação de uma encomenda é feita numa **transação** e baixa o stock; se faltar stock, devolve um erro claro e não grava nada.
- Os pedidos são validados antes de tocar na base de dados.
- Um tratamento de erros central, sem expor detalhes internos.

### 3. Documentação (módulo 03)

- Uma única tabela de rotas que gera as rotas do servidor **e** o documento OpenAPI.
- `/openapi.json` e `/docs` com o Swagger UI.
- Um teste que garante que todas as rotas estão documentadas.

### 4. Segurança (módulo 07)

- Autenticação simples por token assinado com HMAC (ou por `Bun.password` para as palavras-passe dos clientes), com a segurança do segredo explicada. Diz no README o que falta para ser um sistema real (rotação de chaves, expiração, revogação).
- Cabeçalhos e limites de tamanho do corpo dos pedidos.

### 5. Testes (módulo 08)

- Pelo menos 15 testes com `bun test`: lógica de cálculo, validação, repositório em memória, e a API com um servidor numa porta própria.
- Um teste a falhar de propósito, comentado, a mostrar o que o teste apanha.
- Cobertura medida com `--coverage` e o resultado registado.

### 6. Entrega (módulo 09)

- Um executável único com `bun build --compile`, a funcionar sem o código-fonte e sem o Bun instalado na pasta.
- A página de documentação e a base de dados inicial dentro do executável (ou carregadas no arranque).
- O tamanho do executável medido e registado.

### 7. Extra à escolha

Escolhe um: cache com Redis (módulo 06), relatório guardado em S3 com URL pré-assinada (módulo 06), ou o relatório de receita calculado com Workers (módulo 11).

## Entregáveis

| Entregável | Conteúdo |
|---|---|
| Código | A API, a camada de dados, as rotas e o OpenAPI |
| Testes | Os ficheiros `.test.ts` e o resultado da cobertura |
| Executável | O `.exe` (ou o binário da tua plataforma) e o comando que o gerou |
| Documentação | `/openapi.json` e `/docs` a funcionar |
| README | Como correr, testar e construir, e as limitações |

## Passo a passo

| Fase | O que fazes |
|---|---|
| 1 | Camada de dados com SQLite e os testes do repositório |
| 2 | As rotas de leitura e a documentação OpenAPI |
| 3 | A criação de encomendas com transação e validação |
| 4 | Autenticação e tratamento de erros |
| 5 | Mais testes e a cobertura |
| 6 | O executável único e a prova de que funciona sozinho |

**DICA:** escreve primeiro a tabela de rotas e os testes. Com a tabela pronta, o servidor e o OpenAPI saem dela, e os testes dizem-te logo quando alguma coisa se estraga.

## Grelha de avaliação

Cada critério vale de 0 a 3 (0 = ausente, 1 = fraco, 2 = bom, 3 = muito bom).

| Critério | O que procurar |
|---|---|
| Sem dependências | Nenhum `node_modules`, e só `Bun.*`, `bun:*`, APIs Web e `node:*` embutidos |
| Dados | Consultas parametrizadas, chaves estrangeiras ligadas, dinheiro tratado com cuidado |
| API | As cinco rotas, códigos HTTP corretos e erros claros |
| Transação | A encomenda é atómica e o stock não fica negativo |
| Documentação | OpenAPI válido, `/docs` a funcionar e teste que cobre todas as rotas |
| Segurança | Segredos fora do código, palavras-passe com hash, validação dos pedidos |
| Testes | Pelo menos 15, com a cobertura registada e um teste que falha de propósito |
| Executável | Funciona sozinho, com tamanho medido |
| Documentação escrita | Alguém consegue correr, testar e construir só com o README |

Somando 9 critérios de 0 a 3, o máximo é 27. Até 13 há lacunas importantes; de 14 a 22 o trabalho está sólido; a partir de 23 está pronto para mostrar.

## Erros comuns

| Erro | Como evitar |
|---|---|
| Instalar uma biblioteca por hábito | Procura primeiro a funcionalidade nativa nos módulos do curso |
| `PRAGMA foreign_keys` desligado | Liga-o ao abrir a base de dados |
| Concatenar texto em SQL | Usa sempre parâmetros |
| Escrever a documentação à mão, separada das rotas | Gera o OpenAPI a partir da tabela de rotas |
| Esquecer que o Bun 1.4.0 e a documentação 1.4.5 diferem | Confirma por execução e regista a versão |
| Testes que dependem da ordem ou de portas fixas | Usa uma base em memória e uma porta própria |

## Depende do ambiente

- **Windows:** o curso foi testado no Windows 11. O comportamento de caminhos e de alguns utilitários (`Bun.$`, `Bun.write`) pode diferir de Linux e macOS.
- **Versão do Bun:** o curso usa o Bun 1.4.0, e a documentação oficial já descreve a 1.4.5. Algumas opções documentadas podem não existir na tua versão.
- **Produção real:** este projeto é de estudo. Num ambiente real há ainda TLS, registo de eventos, limites de pedidos, cópias de segurança e um processo de entrega.

## Exercícios

**PRATICAR:** o exercício 45 do módulo 13 é este projeto. O módulo 15 traz a grelha de avaliação.

## Fontes oficiais

- [Documentação do Bun](https://bun.com/docs)
- [Bun.serve](https://bun.com/docs/api/http)
- [bun:sqlite](https://bun.com/docs/api/sqlite)
- [bun test](https://bun.com/docs/test)
- [Bundler, incluindo os executáveis de ficheiro único](https://bun.com/docs/bundler)
- [Especificação OpenAPI](https://spec.openapis.org/oas/latest.html)
