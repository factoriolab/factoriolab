import { Rational, rational } from '../rational';

export interface CargoWagonJson {
  size: number | string;
}

export interface CargoWagon {
  size: Rational;
}

export function parseCargoWagon(json: CargoWagonJson): CargoWagon;
export function parseCargoWagon(
  json: CargoWagonJson | undefined,
): CargoWagon | undefined;
export function parseCargoWagon(
  json: CargoWagonJson | undefined,
): CargoWagon | undefined {
  if (json == null) return;
  return { size: rational(json.size) };
}
