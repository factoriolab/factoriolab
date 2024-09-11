import { Optional } from '~/models';

export function asString(value: Optional<string | string[]>): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value[0];
  return value;
}
