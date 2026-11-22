// CommonJS clássico: module.exports, require, __filename.
const { basename } = require("node:path");

const IVA = 0.23;
function comIva(preco) { return Math.round(preco * (1 + IVA) * 100) / 100; }

module.exports = { IVA, comIva };
console.log("[moeda.cjs] __filename:", basename(__filename));
