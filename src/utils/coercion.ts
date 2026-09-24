export function asString(value: string | string[] | undefined): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value[0];
  return value;
}

export function asSet<T>(value: T[]): Set<T>;
export function asSet<T>(value: T[] | null | undefined): Set<T> | undefined;
export function asSet<T>(value: T[] | null | undefined): Set<T> | undefined {
  if (value == null) return undefined;
  return new Set(value);
}
