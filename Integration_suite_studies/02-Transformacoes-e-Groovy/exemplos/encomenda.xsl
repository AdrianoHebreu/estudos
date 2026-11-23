<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" omit-xml-declaration="yes" indent="yes"/>
  <xsl:template match="/Encomenda">
    <EntradaERP referencia="{@id}">
      <xsl:for-each select="Item">
        <Linha codigo="{@sku}" quantidade="{@quantidade}"/>
      </xsl:for-each>
    </EntradaERP>
  </xsl:template>
</xsl:stylesheet>
