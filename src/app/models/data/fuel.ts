import { Rational, rational } from '../rational';

export interface FuelJson {
  category: string;
  /** Fuel value in MJ */
  value: number | string;
  result?: string;
}

export interface Fuel {
  category: string;
  /** Fuel value in MJ */
  value: Rational;
  result?: string;
}

export function parseFuel(json: FuelJson): Fuel;
export function parseFuel(json: FuelJson | undefined): Fuel | undefined;
export function parseFuel(json: FuelJson | undefined): Fuel | undefined {
  if (json == null) return;
  return {
    category: json.category,
    value: rational(json.value),
    result: json.result,
  };
}
