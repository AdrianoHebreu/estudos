"""Le categorias.ebc (EBCDIC, gerado por EBCDIC.COB) com a tabela CP037."""
dados = open("categorias.ebc", "rb").read()
for i in range(0, len(dados), 17):
    reg = dados[i:i + 17]
    print(reg[:6].hex(" "), "->", repr(reg.decode("cp037")))

# simbolos: o que EBCDIC_SIMBOLOS.COB escreveu, lido como CP037
cob = bytes.fromhex("ADBDC0D0A15F6A5A7B7C")      # saida do GnuCOBOL
print("original  :", "[]{}~^|!#@")
print("lido cp037:", ascii(cob.decode("cp037")))
print("cp037 -> ascii:", "[]{}~^|!#@".encode("cp037").hex())
