# Modernizar interfaces SAP Process Orchestration

A Casa Nova tem uma interface antiga para ficheiros de stock, um processo de encomendas e uma integração usada apenas por um portal desativado. Vais decidir o que retirar, migrar ou redesenhar e preparar uma transição com critérios observáveis.

## Inventariar antes de migrar

Começa pelo comportamento em produção. Identifica volume, horários, donos, destinos, formato, autenticação, dependências e requisito de recuperação. Junta amostras saneadas e casos raros. Distingue configuração existente daquilo que o negócio ainda precisa. O resultado deve indicar o risco de interrupção por interface e quem autoriza o corte.

| Interface | Decisão de partida | Evidência |
|---|---|---|
| Stock por ficheiro | Avaliar migração | Formato, horários e dependência SFTP |
| Encomendas | Redesenhar com contrato explícito | Duplicados e regras de negócio |
| Portal retirado | Confirmar retirada | Tráfego, dono e data de encerramento |

## Assessment tooling e regressão

Migration Assessment ajuda a estimar o esforço e a avaliar objetos no âmbito suportado. Migration Tooling facilita a transferência de cenários elegíveis. O resultado das ferramentas é uma entrada para a decisão. Complementa-o com dependências, funções personalizadas, requisitos operacionais e riscos do domínio. Se a ferramenta gerar um artefacto, confirma se ainda precisa de ajustes manuais.

Uma verificação de regressão compara entradas representativas e resultados dos dois percursos. Compara campos de negócio e efeitos persistidos. Normaliza campos variáveis como a hora ou a referência interna do ambiente. Testa as exceções: ficheiro inválido, credencial expirada, destino indisponível e confirmação tardia.

## Edge Integration Cell

Edge Integration Cell permite executar cenários suportados num ambiente Kubernetes gerido pelo cliente, conforme os pré-requisitos e capacidades documentados. É uma opção para requisitos de conectividade ou localização do processamento. Avalia topologia, disponibilidade, atualizações e operação antes de a escolher. Os componentes de gestão e o runtime têm papéis distintos.

## Laboratório de plano de corte

1. Para a interface de stock, regista as janelas, a chave do lote e o último identificador confirmado no sistema antigo.
2. Desenha uma execução em paralelo com uma saída de verificação sem efeitos de negócio. Compara contagens e somas úteis antes de encaminhar tráfego real.
3. Define quem suspende a origem e verifica que filas e ficheiros pendentes ficaram reconciliados.
4. Define a condição de reversão. Se o novo fluxo já escreveu efeitos no ERP, recupera o estado a partir da chave de negócio antes de reativar o antigo.
5. Se tiveres acesso a uma instância SAP PO de teste e ao Assessment, segue o tutorial oficial e compara o relatório com o inventário. Sem esses sistemas, usa os três casos fictícios.

A decisão de concluir o corte precisa de uma janela, resultados observados e um responsável. Uma mudança de configuração pode reverter a rota. A reconciliação trata o que já foi gravado e evita processar tudo duas vezes.

## Exercícios

Resolve os exercícios 28 a 30 no módulo 13. Entrega a matriz, os critérios de corte e um procedimento que distingue reversão técnica de reconciliação.

## Fontes oficiais

- [Use the Migration Assessment Application](https://developers.sap.com/tutorials/migration-assessment)
- [What Is Migration Tooling](https://help.sap.com/docs/integration-suite/sap-integration-suite/what-is-migration-tooling)
- [Plan Your Setup of Edge Integration Cell](https://help.sap.com/docs/integration-suite/sap-integration-suite/plan-your-setup-of-edge-integration-cell)
