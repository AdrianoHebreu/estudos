// Ajudante de mongosh: resume o resultado de explain("executionStats") numa linha.
// Uso: plano("descrição", db.encomendas.find({ ... }).sort({ ... }))
function etapas(no) {                          // percorre o winningPlan e junta os nomes das fases
    if (!no) return [];
    let nomes = [no.stage];
    if (no.inputStage) nomes = nomes.concat(etapas(no.inputStage));
    if (no.inputStages) no.inputStages.forEach((s) => { nomes = nomes.concat(etapas(s)); });
    return nomes;
}
function indiceUsado(no) {
    if (!no) return null;
    if (no.indexName) return no.indexName;
    if (no.inputStage) return indiceUsado(no.inputStage);
    if (no.inputStages) return no.inputStages.map(indiceUsado).join(" + ");
    return null;
}
function plano(titulo, cursor) {
    cursor.explain("executionStats");              // 1.ª execução: tira o ruído de arranque
    const e = cursor.explain("executionStats");
    const s = e.executionStats;
    print(titulo + "\n    " + etapas(e.queryPlanner.winningPlan).join(" > ")
        + "  índice=" + indiceUsado(e.queryPlanner.winningPlan)
        + "  nReturned=" + s.nReturned + "  keys=" + s.totalKeysExamined
        + "  docs=" + s.totalDocsExamined + "  ms=" + s.executionTimeMillis);
}
