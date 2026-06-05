import { Rational, rational } from '~/rational/rational';

export function toNumber(value: Rational | string | number): number {
  if (typeof value === 'string') value = rational(value);
  if (value instanceof Rational) value = value.toNumber();
  return value;
}

export function inRange(
  value: Rational,
  min: Rational | undefined,
  max: Rational | undefined,
): boolean {
  return (min == null || value.gte(min)) && (max == null || value.lte(max));
}
