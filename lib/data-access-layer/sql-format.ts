export function formatExecutableSql(query: {
  toSQL: () => { sql: string; params: unknown[] };
}): string {
  const { sql, params } = query.toSQL();
  if (params.length === 0) {
    return formatSqlMultiline(sql);
  }
  let index = 0;
  const inlined = sql.replace(/\?/g, () => formatSqlParam(params[index++]));
  return formatSqlMultiline(inlined);
}

export function formatSqlMultiline(sql: string): string {
  let text = sql.trim().replace(/\s+/g, " ");

  text = text.replace(/\binsert into\b/gi, "INSERT INTO");
  text = text.replace(/\bdelete from\b/gi, "DELETE FROM");
  text = text.replace(/\s+values\s+/gi, "\nVALUES ");
  text = text.replace(/\s+from\s+/gi, "\nFROM ");
  text = text.replace(/\s+where\s+/gi, "\nWHERE ");
  text = text.replace(/\s+order by\s+/gi, "\nORDER BY ");

  const fromIndex = text.search(/\nFROM /i);
  if (fromIndex > 0) {
    const selectHead = text.slice(0, fromIndex).replace(/^select\s+/i, "SELECT\n  ");
    const rest = text.slice(fromIndex);
    return (breakCommasOutsideQuotes(selectHead) + rest).trim();
  }

  return text.replace(/^select\s+/i, "SELECT\n  ").trim();
}

function breakCommasOutsideQuotes(part: string): string {
  let result = "";
  let inQuote = false;

  for (let i = 0; i < part.length; i++) {
    const char = part[i];
    if (char === "'") {
      inQuote = !inQuote;
      result += char;
      continue;
    }
    if (!inQuote && char === ",") {
      result += ",\n  ";
      continue;
    }
    result += char;
  }

  return result;
}

function formatSqlParam(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (value instanceof Uint8Array) {
    return `X'${Array.from(value)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}
