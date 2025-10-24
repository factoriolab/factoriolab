import { Rational } from './rational';

export function sortedKeyValues(
  record: Record<string, Rational>,
): [string, Rational][] {
  return Object.keys(record)
    .sort((a, b) => record[b].sub(record[a]).toNumber())
    .map((k) => [k, record[k]]);
}
