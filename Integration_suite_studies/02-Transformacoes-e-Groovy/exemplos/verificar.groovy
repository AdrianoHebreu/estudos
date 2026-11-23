import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonSlurper
import groovy.xml.XmlSlurper
import javax.xml.transform.TransformerFactory
import javax.xml.transform.stream.StreamResult
import javax.xml.transform.stream.StreamSource

def shell = new GroovyShell(this.class.classLoader)
def ola = shell.parse(new File('GroovyOla.groovy'))
def normalizar = shell.parse(new File('NormalizarEncomenda.groovy'))

def texto = '{"sku":"c-01","quantity":2}'
def primeira = ola.processData(new Message(texto))
assert primeira.getBody(String) == '{"SKU":"C-01","QUANTITY":2}'
assert primeira.getProperty('tamanho') == texto.length()

def valida = normalizar.processData(
    new Message('{"orderId":"CN-1001","sku":" c-01 ","quantity":2}')
)
assert valida.getProperty('orderId') == 'CN-1001'
assert new JsonSlurper().parseText(valida.getBody(String)) ==
    [externalId: 'CN-1001', items: [[sku: 'C-01', quantity: 2]]]

def invalidas = [
    '{"orderId":"CN-1001","sku":"C-01","quantity":0}',
    '{"orderId":"CN-1001","sku":"C-01","quantity":1.5}',
    '{"orderId":"CN-1001","sku":"C-01","quantity":"2"}',
    '{"orderId":"X-1001","sku":"C-01","quantity":2}',
    '{"orderId":"CN-1001","sku":" ","quantity":2}',
    '[]'
]
invalidas.each { textoInvalido ->
    try {
        normalizar.processData(new Message(textoInvalido))
        assert false: "O script aceitou dados inválidos: ${textoInvalido}"
    } catch (IllegalArgumentException e) {
        assert e.message
    }
}

def origem = new XmlSlurper().parse(new File('encomenda.xml'))
assert origem.name() == 'Encomenda'
assert origem.Item.collect { it.@quantidade.toInteger() }.sum() == 3

def output = new StringWriter()
def transformador = TransformerFactory.newInstance()
    .newTransformer(new StreamSource(new File('encomenda.xsl')))
transformador.transform(new StreamSource(new File('encomenda.xml')), new StreamResult(output))
def xml = new XmlSlurper().parseText(output.toString())
assert xml.name() == 'EntradaERP'
assert xml.@referencia.text() == 'CN-1001'
assert xml.Linha*.@codigo*.text() == ['C-01', 'C-02']
assert xml.Linha*.@quantidade*.text() == ['2', '1']

println 'Groovy Ola, validação JSON e XSLT: todos os casos passaram.'
