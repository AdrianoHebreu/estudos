// Mini validador de JSON Schema, escrito à mão.
// Cobre só o que o OpenAPI da loja usa: $ref, type, enum, minimum, maximum,
// minLength, required, properties, items e minItems.
// NÃO cobre: oneOf/anyOf/allOf, pattern, format (date, email...), additionalProperties,
// uniqueItems, exclusiveMinimum, multipleOf, nullable, discriminator nem $ref externos.
export type Esquema = {
  $ref?: string;
  type?: "string" | "integer" | "number" | "boolean" | "array" | "object";
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  minItems?: number;
  required?: string[];
  properties?: Record<string, Esquema>;
  items?: Esquema;
  example?: unknown;
  description?: string;
};

export type Componentes = Record<string, Esquema>;

export function validar(valor: unknown, esquema: Esquema, componentes: Componentes, caminho = "$"): string[] {
  if (esquema.$ref) {
    const nome = esquema.$ref.replace("#/components/schemas/", "");
    const alvo = componentes[nome];
    if (!alvo) return [`${caminho}: esquema ${nome} não existe`];
    return validar(valor, alvo, componentes, caminho);
  }
  const erros: string[] = [];
  const tipo = esquema.type;

  if (tipo === "string" && typeof valor !== "string") return [`${caminho}: devia ser string`];
  if (tipo === "boolean" && typeof valor !== "boolean") return [`${caminho}: devia ser boolean`];
  if (tipo === "integer" && !(typeof valor === "number" && Number.isInteger(valor))) return [`${caminho}: devia ser inteiro`];
  if (tipo === "number" && !(typeof valor === "number" && Number.isFinite(valor))) return [`${caminho}: devia ser número`];
  if (tipo === "array" && !Array.isArray(valor)) return [`${caminho}: devia ser array`];
  if (tipo === "object" && (typeof valor !== "object" || valor === null || Array.isArray(valor))) {
    return [`${caminho}: devia ser objeto`];
  }

  if (esquema.enum && !esquema.enum.includes(valor)) erros.push(`${caminho}: devia ser um de ${esquema.enum.join(", ")}`);
  if (typeof valor === "number") {
    if (esquema.minimum !== undefined && valor < esquema.minimum) erros.push(`${caminho}: mínimo ${esquema.minimum}`);
    if (esquema.maximum !== undefined && valor > esquema.maximum) erros.push(`${caminho}: máximo ${esquema.maximum}`);
  }
  if (typeof valor === "string" && esquema.minLength !== undefined && valor.length < esquema.minLength) {
    erros.push(`${caminho}: comprimento mínimo ${esquema.minLength}`);
  }
  if (Array.isArray(valor)) {
    if (esquema.minItems !== undefined && valor.length < esquema.minItems) erros.push(`${caminho}: pelo menos ${esquema.minItems} item(s)`);
    if (esquema.items) valor.forEach((v, i) => erros.push(...validar(v, esquema.items!, componentes, `${caminho}[${i}]`)));
  }
  if (tipo === "object" || esquema.properties) {
    const obj = valor as Record<string, unknown>;
    for (const campo of esquema.required ?? []) {
      if (!(campo in obj)) erros.push(`${caminho}.${campo}: campo obrigatório`);
    }
    for (const [campo, sub] of Object.entries(esquema.properties ?? {})) {
      if (campo in obj) erros.push(...validar(obj[campo], sub, componentes, `${caminho}.${campo}`));
    }
  }
  return erros;
}

// Os parâmetros de caminho e de query chegam sempre como texto: converte antes de validar.
export function converter(texto: string | null, esquema: Esquema): unknown {
  if (texto === null) return undefined;
  if (esquema.type === "integer" || esquema.type === "number") return texto.trim() === "" ? NaN : Number(texto);
  if (esquema.type === "boolean") return texto === "true" ? true : texto === "false" ? false : texto;
  return texto;
}
