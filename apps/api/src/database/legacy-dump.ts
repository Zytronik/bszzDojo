/**
 * Reads the rows of a phpMyAdmin / mysqldump SQL export (`INSERT INTO `t` (`a`, …) VALUES (…), …;`)
 * without a MySQL server. Values come back as numbers, strings or `null`; timestamps are strings
 * in the dump's time zone (phpMyAdmin writes `SET time_zone = "+00:00"`, so UTC).
 */
export type DumpRow = Record<string, string | number | null>;

const INSERT = /INSERT INTO `([^`]+)` \(([^)]*)\) VALUES\s*/g;

/** Every table's rows, in the order of the dump. */
export function readDump(sql: string): Map<string, DumpRow[]> {
  const tables = new Map<string, DumpRow[]>();
  for (const match of sql.matchAll(INSERT)) {
    const [statement, table = '', columnList = ''] = match;
    const columns = columnList.split(',').map((column) => column.trim().replaceAll('`', ''));
    const rows = tables.get(table) ?? [];
    let position = (match.index ?? 0) + statement.length;
    for (;;) {
      const tuple = readTuple(sql, position);
      rows.push(Object.fromEntries(columns.map((column, i) => [column, tuple.values[i] ?? null])));
      position = skipSpace(sql, tuple.end);
      if (sql[position] === ',') {
        position = skipSpace(sql, position + 1);
        continue;
      }
      if (sql[position] !== ';') throw new Error(`Unexpected "${sql[position]}" in ${table} rows`);
      break;
    }
    tables.set(table, rows);
  }
  return tables;
}

function skipSpace(sql: string, from: number): number {
  let position = from;
  while (/\s/.test(sql[position] ?? '')) position += 1;
  return position;
}

/** One `(…)` of values starting at `from`, and the index after its `)`. */
function readTuple(sql: string, from: number): { values: (string | number | null)[]; end: number } {
  if (sql[from] !== '(') throw new Error(`Expected "(" at ${from}`);
  const values: (string | number | null)[] = [];
  let position = from + 1;
  for (;;) {
    position = skipSpace(sql, position);
    if (sql[position] === "'") {
      const { value, end } = readString(sql, position);
      values.push(value);
      position = end;
    } else {
      let end = position;
      while (end < sql.length && sql[end] !== ',' && sql[end] !== ')') end += 1;
      const raw = sql.slice(position, end).trim();
      values.push(raw.toUpperCase() === 'NULL' ? null : Number(raw));
      position = end;
    }
    position = skipSpace(sql, position);
    if (sql[position] === ',') {
      position += 1;
      continue;
    }
    if (sql[position] === ')') return { values, end: position + 1 };
    throw new Error(`Unexpected "${sql[position]}" at ${position}`);
  }
}

const ESCAPES: Record<string, string> = { n: '\n', r: '\r', t: '\t', '0': '\0', Z: '\x1a' };

/** A single-quoted MySQL string: `\x` escapes and doubled `''`. */
function readString(sql: string, from: number): { value: string; end: number } {
  let value = '';
  let position = from + 1;
  for (;;) {
    const char = sql[position];
    if (char === undefined) throw new Error(`Unterminated string at ${from}`);
    if (char === '\\') {
      const next = sql[position + 1] ?? '';
      value += ESCAPES[next] ?? next;
      position += 2;
    } else if (char === "'" && sql[position + 1] === "'") {
      value += "'";
      position += 2;
    } else if (char === "'") {
      return { value, end: position + 1 };
    } else {
      value += char;
      position += 1;
    }
  }
}
