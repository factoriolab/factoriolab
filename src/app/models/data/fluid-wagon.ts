import { Rational, rational } from '../rational';

export interface FluidWagonJson {
  capacity: number | string;
}

export interface FluidWagon {
  capacity: Rational;
}

export function parseFluidWagon(json: FluidWagonJson): FluidWagon;
export function parseFluidWagon(
  json: FluidWagonJson | undefined,
): FluidWagon | undefined;
export function parseFluidWagon(
  json: FluidWagonJson | undefined,
): FluidWagon | undefined {
  if (json == null) return;
  return { capacity: rational(json.capacity) };
}
