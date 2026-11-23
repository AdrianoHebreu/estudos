# Transformações e Groovy em Cloud Integration

Vais partir de um script real para transformar o conteúdo de uma mensagem e passar para um mapeamento JSON com validação. Usa os conversores ou o mapeamento visual quando exprimem bem a regra. Reserva Groovy para código que seja possível ler, testar e manter.

## O contrato do passo de script

No passo Groovy, o ponto de entrada usado neste curso é `processData(Message message)`. O objeto Message dá acesso ao corpo, aos cabeçalhos e às propriedades. Lê o formato que esperas, atualiza a mensagem e devolve-a. Documenta de onde vem a mensagem e que formato entregas ao passo seguinte.

A exportação Groovy Ola usa um passo GroovyScript 1.1.2. Essa é a versão do componente no artefacto. Confirma a versão do passo e as bibliotecas disponíveis no teu perfil. A SAP recomenda atualizar o passo para 2.0 e verificar a compatibilidade do script antes de publicar a alteração.

## O que o script exportado demonstra

O script lê o corpo como String, guarda o comprimento na propriedade `tamanho` e põe o texto em maiúsculas. Esta é uma demonstração de acesso à mensagem. Ao converter todo o JSON, muda também as chaves. Isso quebra contratos em que `orderId` e `ORDERID` são diferentes.

Para repetir a ideia localmente, usa `exemplos/GroovyOla.groovy`. O exemplo didático usa `Locale.ROOT` para estabilizar a conversão e rejeita um corpo nulo ou vazio. Em produção, se a regra diz que o SKU deve ser normalizado, altera apenas o valor do SKU depois de interpretar o JSON.

    import com.sap.gateway.ip.core.customdev.util.Message
    import java.util.Locale

    def Message processData(Message message) {
        String corpo = message.getBody(String)
        if (!corpo) {
            throw new IllegalArgumentException('Corpo em falta')
        }
        message.setProperty('tamanho', corpo.length())
        message.setBody(corpo.toUpperCase(Locale.ROOT))
        return message
    }

O método `String.length()` mede unidades UTF-16, não bytes de rede. Se o limite for em bytes, define a codificação e mede os bytes resultantes.

## Mapear a encomenda para o destino

O script `exemplos/NormalizarEncomenda.groovy` lê JSON com `JsonSlurper`. Valida o identificador, a quantidade inteira positiva e o SKU. O formato de saída transporta a referência e uma linha de produto. Para testar decisões de fronteira, experimenta quantidade zero, texto em vez de inteiro, SKU vazio e JSON malformado.

Entrada do portal:

    {"orderId":"CN-1001","sku":" c-01 ","quantity":2}

Saída prevista para o simulador do ERP:

    {"externalId":"CN-1001","items":[{"sku":"C-01","quantity":2}]}

O identificador permanece disponível em `orderId` nas propriedades da mensagem. O JSON final é produzido com `JsonOutput`, que faz a codificação dos caracteres especiais. Faz a comparação do resultado após interpretar o JSON, pois a ordenação das chaves pode variar entre ferramentas.

## Escolher outra transformação

| Recurso | Quando preferir | Verificação útil |
|---|---|---|
| Conversor JSON e XML | Troca de representação com regras previsíveis | Raiz, listas, valores nulos e namespaces |
| Message Mapping | Relação declarativa entre estruturas com esquemas | Cardinalidade e campos opcionais |
| XSLT Mapping | Transformação de XML com regras estruturais | Namespaces e um XML com vários itens |
| Groovy | Validação ou cálculo específico do domínio | Testes de dados válidos e inválidos |

Uma lista de um elemento em JSON pode exigir configuração própria ao voltar a partir de XML. Testa também listas vazias e vários elementos. Para XSLT, começa com o ficheiro `exemplos/encomenda.xsl` e com o XML de exemplo. A regra cria um elemento EntradaERP com uma linha por Item. A versão XSLT 1.0 do exemplo permite testar a regra localmente e observar o efeito sem depender das funcionalidades de versões mais recentes.

## Ler XML e testar cardinalidade

Usa XmlSlurper quando precisares de ler alguns valores em Groovy. Este excerto conta e soma as quantidades do ficheiro de exemplo. Antes de usar uma mensagem externa, verifica a estrutura, o namespace e os limites que o contrato prevê.

    import groovy.xml.XmlSlurper

    def xml = new XmlSlurper().parseText(corpo)
    assert xml.name() == 'Encomenda'
    def total = xml.Item.collect { it.@quantidade.toInteger() }.sum()
    assert total == 3

Em Message Mapping, prepara o esquema de origem Encomenda com Item repetível e o esquema de destino EntradaERP com Linha repetível. Mapeia a referência da raiz e liga SKU e quantidade aos atributos de Linha. Testa com duas linhas, uma linha e zero linhas para distinguir um mapeamento por ocorrência de um resultado que perde a segunda linha. Se o destino exigir pelo menos uma linha, rejeita a origem vazia conforme o contrato.

## Laboratório de transformação

1. Executa a verificação local indicada no README. A pequena implementação de Message em `exemplos/test-support` dá ao script o corpo e as propriedades de que precisa.
2. No tenant, duplica o laboratório CN01 com um novo nome. Introduz o JSON de entrada e adiciona o passo Groovy entre o Content Modifier e End.
3. Cola o conteúdo de `NormalizarEncomenda.groovy`, publica e confirma num registo novo se o corpo convertido e a propriedade batem com o teste local.
4. Troca a quantidade para zero e observa a falha prevista. Volta aos dados válidos antes de prosseguir.
5. Num fluxo separado, troca o corpo por XML e escolhe XSLT Mapping com `encomenda.xsl`. Compara o número de linhas geradas e a referência.

**ATENÇÃO:** O teste local verifica a função sobre a mensagem simulada. O runtime SAP é necessário para validar o passo publicado, a disponibilidade das bibliotecas e o comportamento dos conversores.

## Exercícios

Resolve os exercícios 4 a 6 no módulo 13. Anota um teste de sucesso, um de falha e a evidência que muda se trocas Groovy por XSLT.

## Fontes oficiais

- [Working with Script and Script Collection](https://help.sap.com/docs/integration-suite/sap-integration-suite/e60f7061fe4b45d69d028b24d5a76901.html)
- [Use Scripting Appropriately](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/use-scripting-appropriately?locale=en-US)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
