package com.sap.gateway.ip.core.customdev.util

// Duplo local que implementa apenas as operações usadas no laboratório.
class Message {
    private String body
    private final Map<String, Object> properties = [:]

    Message(String body) {
        this.body = body
    }

    def <T> T getBody(Class<T> type) {
        return type.cast(body)
    }

    void setBody(String value) {
        body = value
    }

    Object getProperty(String name) {
        properties[name]
    }

    void setProperty(String name, Object value) {
        properties[name] = value
    }
}
