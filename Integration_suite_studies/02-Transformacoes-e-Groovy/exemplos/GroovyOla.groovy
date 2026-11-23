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
