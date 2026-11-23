# Transformações e Groovy em Cloud Integration

Vais partir de um script real para transformar o conteúdo de uma mensagem e passar para um mapeamento JSON com validação. Usa os conversores ou o mapeamento visual quando exprimem bem a regra. Reserva Groovy para código que seja possível ler, testar e manter. No fim sabes escolher a ferramenta certa, escrever um passo Groovy que valida a encomenda da Casa Nova e saber o que o tenant te vai exigir (versão do passo, importações, conversores).

**NOTA:** os rótulos nesta aula têm este significado. Observado: visto no fluxo Groovy_Ola do módulo 01 (passo GroovyScript 1.1.2). Documentado: resumo de uma página da documentação SAP, citada no fim da secção. Testado localmente: corre com os ficheiros de exemplos/ e verificar.groovy. Por testar: confirma no teu tenant. Todo o código Groovy novo desta aula está marcado como não executado nesta revisão.

## Escolher a ferramenta

A documentação de orientações para scripts diz que se devem usar os passos standard sempre que possível e que o Groovy não deve substituir passos já existentes. Para transformações de XML ou JSON, prefere os mapeamentos standard e as expressões XPath nos Content Modifiers, que são mais legíveis e mais fáceis de manter.

| Recurso | Quando preferir | Verificação útil |
|---|---|---|
| Content Modifier | Copiar um valor para cabeçalho, propriedade ou corpo | Tipo de origem (Constant, Header, XPath, Expression) e se o nome existe |
| Conversor JSON e XML | Troca de representação com regras previsíveis | Raiz única, listas, valores nulos e namespaces |
| Message Mapping | Relação declarativa entre estruturas com esquemas | Cardinalidade e campos opcionais |
| XSLT Mapping | Transformação de XML com regras estruturais | Namespaces e um XML com vários itens |
| Script (Groovy) | Validação ou cálculo específico do domínio | Testes de dados válidos e inválidos |

Documentado: ISuite_Integrations_APIs/general-scripting-guidelines-fcbf0f2.md.

## O contrato do passo de script

No passo Script, o ponto de entrada usado neste curso é `processData(Message message)`. A documentação diz que, se o script tiver a função processData, o campo Script Function pode ficar vazio; se houver várias funções, indicas o nome da função (sem argumentos) nesse campo. O objeto Message dá acesso ao corpo, aos cabeçalhos e às propriedades. Lê o formato que esperas, atualiza a mensagem e devolve-a.

| Pretendes | Métodos da Message (Documentado) | Nota |
|---|---|---|
| Ler ou escrever o corpo | getBody(), getBody(String), setBody(objeto) | getBody(String) devolve String sem precisares de conversão adicional |
| Ler ou escrever cabeçalhos | getHeaders(), getHeader(nome, tipo), setHeader(nome, valor) | Os cabeçalhos seguem para o recetor, as propriedades não |
| Ler ou escrever propriedades | getProperties(), getProperty(nome), setProperty(nome, valor) | O nome de uma propriedade distingue maiúsculas de minúsculas |
| Escrever no registo da execução | messageLogFactory.getMessageLog(message) | Devolve um MessageLog; testa se não é nulo |

Documentado: ISuite_Integrations_APIs/read-and-modify-message-header-message-body-and-exchange-properties-5822f32.md e define-content-modifier-8f04a70.md.

O passo de script tem versões. Documentado:

| Versão do passo | Runtime Groovy | Notas |
|---|---|---|
| 1.1 | 2.4.21 | Versão do fluxo Groovy_Ola (observado: 1.1.2) |
| 2.0 | 4.0.29 | Ativa correções automáticas de incompatibilidades e linguagem mais recente; no editor, o botão Upgrade atualiza o passo e todos os que usam o mesmo script; Downgrade volta à 1.1 |

Ao atualizar para 2.0 é guardada uma cópia do script anterior na pasta Scripts. A SAP recomenda simular o fluxo com o passo atualizado antes de publicar. Um exemplo documentado de incompatibilidade: groovy.util.XmlSlurper deve passar a groovy.xml.XmlSlurper no runtime Groovy 4.

Documentado: ISuite_Integrations_APIs/define-a-local-script-step-03b32eb.md, upgrading-scripts-917e014.md, use-import-statements-supported-by-the-script-runtime-13fee7f.md e fix-script-incompatibilities-7397c42.md.

## O que o script exportado demonstra

O script lê o corpo como String, guarda o comprimento na propriedade `tamanho` e põe o texto em maiúsculas. Esta é uma demonstração de acesso à mensagem. Ao converter todo o JSON, muda também as chaves. Isso quebra contratos em que `orderId` e `ORDERID` são diferentes.

Para repetir a ideia localmente, usa `exemplos/GroovyOla.groovy`. O exemplo didático usa `Locale.ROOT` para estabilizar a conversão e rejeita um corpo nulo ou vazio. Em produção, se a regra diz que o SKU deve ser normalizado, altera apenas o valor do SKU depois de interpretar o JSON. Testado localmente.

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

O método `String.length()` mede unidades UTF-16, não bytes de rede. Se o limite for em bytes, define a codificação e mede os bytes resultantes. Para a entrada `{"sku":"c-01","quantity":2}` o valor de tamanho é 27 e o corpo passa a `{"SKU":"C-01","QUANTITY":2}`.

## Mapear a encomenda para o destino

O script `exemplos/NormalizarEncomenda.groovy` lê JSON com `JsonSlurper`. Valida o identificador, a quantidade inteira positiva e o SKU. O formato de saída transporta a referência e uma linha de produto. Para testar decisões de fronteira, experimenta quantidade zero, texto em vez de inteiro, SKU vazio e JSON malformado. Testado localmente (todos estes casos estão em verificar.groovy).

Entrada do portal:

    {"orderId":"CN-1001","sku":" c-01 ","quantity":2}

Saída prevista para o simulador do ERP:

    {"externalId":"CN-1001","items":[{"sku":"C-01","quantity":2}]}

O identificador permanece disponível em `orderId` nas propriedades da mensagem. O JSON final é produzido com `JsonOutput`, que faz a codificação dos caracteres especiais. Faz a comparação do resultado após interpretar o JSON, pois a ordenação das chaves pode variar entre ferramentas.

A documentação mostra um padrão semelhante para JSON grande: obter o corpo como Reader e passá-lo ao parse do JsonSlurper, em vez de materializar uma String. Uma variante do início do script, não executada nesta revisão:

    def leitor = message.getBody(java.io.Reader)
    def entrada = new JsonSlurper().parse(leitor)

Documentado: ISuite_Integrations_APIs/parse-json-af0da64.md. Por testar: o script de exemplos/ usa parseText porque o corpo da Casa Nova é pequeno; confirma no tenant se preferes a variante com Reader.

## Rastreabilidade no monitor

Um erro de validação só é útil se a operação conseguir encontrar a mensagem. A documentação mostra como escrever no registo de processamento a partir do script. Não executado nesta revisão:

    def Message processData(Message message) {
        def registo = messageLogFactory.getMessageLog(message)
        if (registo != null) {
            registo.addCustomHeaderProperty('orderId', message.getProperty('orderId'))
        }
        return message
    }

| Funcionalidade | O que faz (Documentado) | Limite ou cuidado |
|---|---|---|
| addCustomHeaderProperty | Guarda um par nome e valor no registo, e permite pesquisar no monitor com o campo Custom Header | Define a propriedade antes de lhe aceder; confirma o formato do filtro no teu ecrã |
| addAttachmentAsString | Guarda um texto (por exemplo, o corpo) como anexo, visível no separador Attachments | Anexos de corpos com dados pessoais ficam persistidos no registo |
| setStringProperty e variantes | Acrescenta propriedades tipadas ao registo | Só ficam visíveis com o nível de registo Debug ou Trace |

**ATENÇÃO:** não guardes credenciais em cabeçalhos ou propriedades. A documentação avisa que o tracing as pode mostrar em texto limpo e que um cabeçalho pode ser enviado ao recetor. Para valores secretos usa os artefactos de credenciais do Security Material.

Documentado: ISuite_Integrations_APIs/add-information-to-the-message-processing-log-e8e9283.md, use-custom-header-properties-to-search-for-message-processing-logs-d4b5839.md e access-secure-parameters-in-scripts-fdf4ce3.md.

## Boas práticas de scripts

Resumo da página de orientações gerais. Documentado:

| Regra | Porquê |
|---|---|
| Usar só as APIs de script da SAP e classes nativas de Groovy | A SAP só garante as APIs de script oficiais; classes de bibliotecas abertas podem quebrar em atualizações |
| Para XML, usar XmlSlurper (só leitura) ou XmlParser (leitura e alteração) | Prefere parse(Reader) a parseText(String) com payloads grandes |
| Gerar documentos compactos, sem indentação | Menos bytes para transmitir |
| Usar StringBuilder em vez de concatenar Strings em ciclos | Evita criar muitos objetos intermédios |
| Evitar variáveis de binding como body = 123 e preferir def ou tipos | As variáveis de binding ficam em memória até ao redeploy |
| Comentar o código e ligar o registo a um interruptor (nível de registo ou parâmetro externalizado) | Facilita a operação |
| Não usar TimeZone.setDefault nem classes geradas por Eval | Afetam toda a máquina virtual ou nunca são descarregadas |
| Não testar o script por deploys sucessivos | Usa o editor local ou uma simulação |

Estas regras explicam as escolhas do exemplo: sem bibliotecas externas, sem estado global e com a lógica toda numa função testável.

## Conversores JSON e XML

Os conversores estão no editor, em Transformation, Converter. Os campos documentados:

| Conversor | Campo | O que define |
|---|---|---|
| JSON para XML | Add XML Root Element e Name | Ativa um elemento raiz com o nome (regras NCName) |
| JSON para XML | Namespace Mapping, JSON Prefix, JSON Prefix Separator | Mapeia prefixos JSON para namespaces XML; os separadores aceites são dois pontos, vírgula, ponto, barra vertical, ponto e vírgula e espaço |
| XML para JSON | JSON Output Encoding | Por omissão, lê CamelCharsetName do cabeçalho ou propriedade; se não houver valor, usa UTF-8 |
| XML para JSON | Streaming (All ou Specific Ones) | Quais os elementos que viram arrays; tem de incluir todos os que têm multiplicidade maior que 1 |

Regras que mais surpreendem (Documentado):

- O JSON para XML exige que o objeto de raiz tenha exatamente um membro. Um JSON de encomenda com três campos precisa da opção Add XML Root Element, ou de um Content Modifier antes com um corpo do tipo { "root": ${in.body} }.
- Um texto JSON que começa por um array não é suportado.
- Membros cujo nome começa por @ viram atributos e têm de aparecer no início do objeto pai.
- No XML para JSON, todos os valores passam a Strings JSON (o número 2 não volta como número) e comentários, DTDs e instruções de processamento são ignorados.
- Uma lista com um só elemento pode voltar como objeto e não como array, a não ser que o streaming indique o elemento como array.

Documentado: ISuite_Integrations_APIs/define-json-to-xml-converter-5a7c0cd.md, define-xml-to-json-converter-a60a282.md, conversion-rules-for-json-to-xml-conversion-232a9cf.md, limitations-for-json-to-xml-conversion-3a02829.md, limitations-for-xml-to-json-conversion-4bf5a05.md e how-streaming-in-the-xml-to-json-converter-works-4e05044.md.

## Message Mapping e XSLT

| Passo | Como configurar (Documentado) | Pontos de atenção |
|---|---|---|
| Message Mapping | Separador Processing, Reference Type Static (ficheiro mmap) ou Dynamic (identificador numa expressão); cria o mapeamento ligando campos da origem ao destino | Esquemas aceites: XSD, OData edmx, WSDL e OpenAPI JSON 2.0 e 3.0; referências remotas não são suportadas |
| Message Mapping, funções | Funções standard e funções de utilizador em script ou numa biblioteca | Nós sem saída ligada são removidos ao guardar |
| XSLT Mapping | Separador Processing, Source Integration Flow (ficheiro xsl em Resources) ou Header (nome do cabeçalho); campo Output Format String ou Bytes | A versão 1.2 do passo permite recursos XSLT 3.0, como JSON para XML, mapas, arrays e streaming |

Para XSLT, começa com o ficheiro `exemplos/encomenda.xsl` e com o XML de exemplo. A regra cria um elemento EntradaERP com uma linha por Item. A versão XSLT 1.0 do exemplo permite testar a regra localmente (Testado localmente) e observar o efeito sem depender das funcionalidades de versões mais recentes.

Em Message Mapping, prepara o esquema de origem Encomenda com Item repetível e o esquema de destino EntradaERP com Linha repetível. Mapeia a referência da raiz e liga SKU e quantidade aos atributos de Linha. Testa com duas linhas, uma linha e zero linhas para distinguir um mapeamento por ocorrência de um resultado que perde a segunda linha. Se o destino exigir pelo menos uma linha, rejeita a origem vazia conforme o contrato. Por testar no tenant.

Documentado: ISuite_Integrations_APIs/creating-message-mapping-as-a-flow-step-3d5cb7f.md e create-xslt-mapping-5ce1f15.md.

## Ler XML e testar cardinalidade

Usa XmlSlurper quando precisares de ler alguns valores em Groovy. Este excerto conta e soma as quantidades do ficheiro de exemplo (Testado localmente em verificar.groovy). Antes de usar uma mensagem externa, verifica a estrutura, o namespace e os limites que o contrato prevê.

    import groovy.xml.XmlSlurper

    def xml = new XmlSlurper().parseText(corpo)
    assert xml.name() == 'Encomenda'
    def total = xml.Item.collect { it.@quantidade.toInteger() }.sum()
    assert total == 3

No iFlow, a documentação recomenda preferir o Reader (não executado nesta revisão): `new XmlSlurper().parse(message.getBody(Reader))`. Quanto ao import, a documentação indica groovy.xml.XmlSlurper para o passo 2.0 (Groovy 4). Por testar: com o passo 1.1 (Groovy 2.4.21) confirma qual dos dois imports o editor aceita.

## Laboratório de transformação

1. Executa a verificação local indicada no README. A pequena implementação de Message em `exemplos/test-support` dá ao script o corpo e as propriedades de que precisa.
2. No tenant, duplica o laboratório CN01 com um novo nome. Introduz o JSON de entrada e adiciona o passo Groovy entre o Content Modifier e End.
3. Cola o conteúdo de `NormalizarEncomenda.groovy`, publica e confirma num registo novo se o corpo convertido e a propriedade batem com o teste local. Resultado esperado no passo End do monitor: Payload com o JSON de saída e a propriedade orderId com CN-1001.
4. Troca a quantidade para zero e observa a falha prevista (mensagem Quantidade inválida; o estado Failed é por testar). Volta aos dados válidos antes de prosseguir.
5. Num fluxo separado, troca o corpo por XML e escolhe XSLT Mapping com `encomenda.xsl`. Compara o número de linhas geradas e a referência.
6. Variante (por testar): num terceiro fluxo, coloca um conversor JSON para XML a seguir ao Groovy, com Add XML Root Element e o nome Encomenda. Observa o resultado e o que acontece sem a opção de raiz.

**ATENÇÃO:** o teste local verifica a função sobre a mensagem simulada. O runtime SAP é necessário para validar o passo publicado, a disponibilidade das bibliotecas e o comportamento dos conversores.

## Diagnóstico

| Sintoma | O que verificar |
|---|---|
| A execução falha com Corpo em falta ou Identificador inválido | O Payload no passo anterior ao script (o monitor mostra a mensagem antes do passo) e o nome dos campos |
| O corpo volta com as chaves em maiúsculas | Usaste a demonstração GroovyOla em vez de NormalizarEncomenda |
| Erro no conversor JSON para XML sobre o membro de raiz | O JSON tem mais de um membro no topo, ou começa por um array: usa Add XML Root Element |
| O XML para JSON devolve o número como texto | Todos os valores passam a Strings JSON; converte no script ou no mapeamento |
| A lista de um item aparece como objeto | Streaming com Specific Ones e o caminho do elemento, ou valida o consumidor |
| O editor assinala incompatibilidades de importação | Separador Problems, Upgrade Readiness Check; considera atualizar o passo para 2.0 e simula |
| O script funciona local e falha no tenant | A versão do passo (1.1 ou 2.0), os imports e as bibliotecas disponíveis |
| Uma propriedade não é encontrada | Maiúsculas e minúsculas no nome e se o passo anterior a definiu |

## Exercícios

**PRATICAR:** resolve os exercícios 4 a 6 no módulo 13. Anota um teste de sucesso, um de falha e a evidência que muda se trocas Groovy por XSLT.

## Fontes oficiais

- [Working with Script and Script Collection](https://help.sap.com/docs/integration-suite/sap-integration-suite/e60f7061fe4b45d69d028b24d5a76901.html)
- [Use Scripting Appropriately](https://help.sap.com/docs/cloud-integration/sap-cloud-integration/use-scripting-appropriately?locale=en-US)
- [Design and Deploy Your First Integration Flow](https://developers.sap.com/tutorials/cp-starter-integration-cpi-design-iflow)
- [Define a Local Script Step (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/define-a-local-script-step-03b32eb.md)
- [General Scripting Guidelines (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/general-scripting-guidelines-fcbf0f2.md)
- [Upgrading Scripts (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/upgrading-scripts-917e014.md)
- [Limitations for JSON to XML Conversion (fonte em GitHub)](https://github.com/SAP-docs/btp-integration-suite/blob/main/docs/ISuite_Integrations_APIs/limitations-for-json-to-xml-conversion-3a02829.md)

Texto-base: SAP-docs/btp-integration-suite (CC-BY 4.0)
