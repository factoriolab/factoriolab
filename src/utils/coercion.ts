export function asString(value: string | string[] | undefined): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value[0];
  return value;
}
