# Mini Curso de SAP Integration Suite

Aprende a desenhar, testar e operar integrações SAP com o caso da Casa Nova Distribuição. O portal envia encomendas, o iFlow transforma-as, o ERP regista-as e uma notificação pode seguir para serviços no Azure. O curso destina-se a developers e arquitetos com noções de HTTP, JSON e XML. As aulas estão em português europeu.

A edição completa inclui 16 módulos, um projeto guiado, 34 exercícios e as respetivas soluções. Começa pelo Word para estudares os passos e exemplos. Usa o PowerPoint para rever e o Markdown para consultar ou editar a fonte.

| Módulo | Tema | Fonte | Word | PowerPoint |
|---|---|---|---|---|
| 00 | Introdução | [Markdown](00-Introducao/00-Introducao.md) | [Word](00-Introducao/00-Introducao.docx) | [PowerPoint](00-Introducao/00-Introducao.pptx) |
| 01 | Cloud Integration e mensagens | [Markdown](01-Cloud-Integration-Conceitos/01-Cloud-Integration-Conceitos.md) | [Word](01-Cloud-Integration-Conceitos/01-Cloud-Integration-Conceitos.docx) | [PowerPoint](01-Cloud-Integration-Conceitos/01-Cloud-Integration-Conceitos.pptx) |
| 02 | Transformações e Groovy | [Markdown](02-Transformacoes-e-Groovy/02-Transformacoes-e-Groovy.md) | [Word](02-Transformacoes-e-Groovy/02-Transformacoes-e-Groovy.docx) | [PowerPoint](02-Transformacoes-e-Groovy/02-Transformacoes-e-Groovy.pptx) |
| 03 | Conectividade e adaptadores | [Markdown](03-Conectividade/03-Conectividade.md) | [Word](03-Conectividade/03-Conectividade.docx) | [PowerPoint](03-Conectividade/03-Conectividade.pptx) |
| 04 | Padrões e tratamento de erros | [Markdown](04-Padroes-e-Erros/04-Padroes-e-Erros.md) | [Word](04-Padroes-e-Erros/04-Padroes-e-Erros.docx) | [PowerPoint](04-Padroes-e-Erros/04-Padroes-e-Erros.pptx) |
| 05 | API Management | [Markdown](05-API-Management/05-API-Management.md) | [Word](05-API-Management/05-API-Management.docx) | [PowerPoint](05-API-Management/05-API-Management.pptx) |
| 06 | Segurança, monitorização e entrega | [Markdown](06-Seguranca-Monitorizacao-e-Entrega/06-Seguranca-Monitorizacao-e-Entrega.md) | [Word](06-Seguranca-Monitorizacao-e-Entrega/06-Seguranca-Monitorizacao-e-Entrega.docx) | [PowerPoint](06-Seguranca-Monitorizacao-e-Entrega/06-Seguranca-Monitorizacao-e-Entrega.pptx) |
| 07 | Eventos e mensageria | [Markdown](07-Eventos/07-Eventos.md) | [Word](07-Eventos/07-Eventos.docx) | [PowerPoint](07-Eventos/07-Eventos.pptx) |
| 08 | B2B e Integration Advisor | [Markdown](08-B2B-Integration-Advisor/08-B2B-Integration-Advisor.md) | [Word](08-B2B-Integration-Advisor/08-B2B-Integration-Advisor.docx) | [PowerPoint](08-B2B-Integration-Advisor/08-B2B-Integration-Advisor.pptx) |
| 09 | Open Connectors | [Markdown](09-Open-Connectors/09-Open-Connectors.md) | [Word](09-Open-Connectors/09-Open-Connectors.docx) | [PowerPoint](09-Open-Connectors/09-Open-Connectors.pptx) |
| 10 | Modernização e migração | [Markdown](10-Modernizacao-e-Migracao/10-Modernizacao-e-Migracao.md) | [Word](10-Modernizacao-e-Migracao/10-Modernizacao-e-Migracao.docx) | [PowerPoint](10-Modernizacao-e-Migracao/10-Modernizacao-e-Migracao.pptx) |
| 11 | SAP S/4HANA, Azure e IA | [Markdown](11-S4HANA-Azure-e-IA/11-S4HANA-Azure-e-IA.md) | [Word](11-S4HANA-Azure-e-IA/11-S4HANA-Azure-e-IA.docx) | [PowerPoint](11-S4HANA-Azure-e-IA/11-S4HANA-Azure-e-IA.pptx) |
| 12 | Projeto final | [Markdown](12-Projeto-Final/12-Projeto-Final.md) | [Word](12-Projeto-Final/12-Projeto-Final.docx) | [PowerPoint](12-Projeto-Final/12-Projeto-Final.pptx) |
| 13 | 34 exercícios práticos | [Markdown](13-Exercicios-Praticos/13-Exercicios-Praticos.md) | [Word](13-Exercicios-Praticos/13-Exercicios-Praticos.docx) | [PowerPoint](13-Exercicios-Praticos/13-Exercicios-Praticos.pptx) |
| 14 | Consulta rápida | [Markdown](14-Cheat-Sheet/14-Consulta-Rapida.md) | [Word](14-Cheat-Sheet/14-Consulta-Rapida.docx) | [PowerPoint](14-Cheat-Sheet/14-Consulta-Rapida.pptx) |
| 15 | Soluções dos exercícios | [Markdown](15-Gabarito/15-Solucoes.md) | [Word](15-Gabarito/15-Solucoes.docx) | [PowerPoint](15-Gabarito/15-Solucoes.pptx) |

## Prática local e no SAP

- **Sem tenant.** Faz as verificações Groovy e XSLT do módulo 02 e os testes do simulador do ERP no módulo 12. Os restantes laboratórios têm alternativa por simulação ou desenho quando dependem de um serviço SAP.
- **Com tenant de estudo.** Confirma primeiro as capacidades e permissões disponíveis. Segue os passos de cada laboratório e compara a execução com o resultado esperado. Usa um destino HTTPS acessível ao runtime quando o fluxo precisar de comunicar fora do SAP.
- **Origem do primeiro exemplo.** O `Groovy_Ola.zip`, exportado e testado anteriormente pelo autor, foi consultado para ler o modelo `.iflw` e o script. O curso inclui uma adaptação didática do script. A exportação original fica fora do repositório.
- **Validação.** Foram executados os testes locais de Groovy, XSLT e do simulador. Os restantes passos no SAP são guiões com resultados esperados. O simulador do ERP é uma API de estudo, independente de SAP S/4HANA.

## Executar os exemplos

Os comandos PowerShell seguintes partem desta pasta.

Para o módulo 02, usa Java e os três JARs Apache Groovy da mesma versão, com as dependências numa pasta temporária. A versão usada na validação foi 4.0.29.

    $sapGroovy = Join-Path $env:TEMP 'estudos-sap-groovy'
    New-Item -ItemType Directory -Force -Path $sapGroovy | Out-Null
    foreach ($modulo in 'groovy', 'groovy-json', 'groovy-xml') {
        $nome = "$modulo-4.0.29.jar"
        $origem = "https://repo.maven.apache.org/maven2/org/apache/groovy/$modulo/4.0.29/$nome"
        Invoke-WebRequest -Uri $origem -OutFile (Join-Path $sapGroovy $nome)
    }
    Push-Location '02-Transformacoes-e-Groovy/exemplos'
    java -cp "$sapGroovy/*;test-support" groovy.ui.GroovyMain verificar.groovy
    Pop-Location

Para o módulo 12, usa Bun. Corre os testes e inicia o simulador quando quiseres experimentar os pedidos à mão.

    Push-Location '12-Projeto-Final/exemplos'
    bun test erp.test.ts
    bun run erp.ts
    Pop-Location

O simulador está em `http://127.0.0.1:8765`. Num segundo terminal, abre a mesma pasta de exemplos e usa os comandos HTTP da aula. Termina o simulador com Ctrl+C.

## Regenerar os documentos

Edita as aulas Markdown na pasta de cada módulo. O gerador é o mesmo usado em `bun_studies`, com os títulos do novo curso e uma variante compacta no Word da consulta rápida.

    python -m pip install python-docx python-pptx
    python tools/build_course_artifacts.py
    python tools/build_course_artifacts.py --only 02,12

Consulta também o [estado do projeto](ESTADO-DO-PROJETO.md).

## Fonte e licença

O conteúdo dos módulos 00 e 02 a 12 resume a documentação oficial da SAP, em português e com exemplos próprios. Texto-base: [SAP-docs/btp-integration-suite](https://github.com/SAP-docs/btp-integration-suite) (CC-BY 4.0). Cada secção indica se é Documentado, Observado ou Por testar.
