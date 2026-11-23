import com.sap.gateway.ip.core.customdev.util.Message
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import java.util.Locale

def Message processData(Message message) {
    Object entrada = new JsonSlurper().parseText(message.getBody(String) ?: '{}')
    if (!(entrada instanceof Map)) {
        throw new IllegalArgumentException('A entrada deve ser um objeto JSON')
    }

    def referencia = entrada.orderId
    def sku = entrada.sku
    def quantidade = entrada.quantity

    if (!(referencia instanceof String) || !(referencia ==~ /CN-[0-9]{1,12}/)) {
        throw new IllegalArgumentException('Identificador inválido')
    }
    if (!(sku instanceof String) || !(sku.trim() ==~ /[A-Za-z0-9-]{1,32}/)) {
        throw new IllegalArgumentException('SKU inválido')
    }
    if (!(quantidade instanceof Number) || quantidade < 1 ||
        quantidade > Integer.MAX_VALUE || quantidade != quantidade.intValue()) {
        throw new IllegalArgumentException('Quantidade inválida')
    }

    message.setProperty('orderId', referencia)
    message.setBody(JsonOutput.toJson([
        externalId: referencia,
        items: [[sku: sku.trim().toUpperCase(Locale.ROOT), quantity: quantidade.intValue()]]
    ]))
    return message
}
