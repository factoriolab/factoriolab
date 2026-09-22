import { Rational, rational } from '~/rational/rational';

export interface FuelJson {
  types: string[];
  /** Fuel value in MJ */
  value: number | string;
  result?: string;
  pollutionMultiplier?: number | string;
}

export interface Fuel {
  types: Set<string>;
  /** Fuel value in MJ */
  value: Rational;
  result?: string;
  pollutionMultiplier?: Rational;
}

export function parseFuel(json: FuelJson): Fuel;
export function parseFuel(json: FuelJson | undefined): Fuel | undefined;
export function parseFuel(json: FuelJson | undefined): Fuel | undefined {
  if (json == null) return;
  return {
    types: new Set(json.types),
    value: rational(json.value),
    result: json.result,
    pollutionMultiplier: rational(json.pollutionMultiplier),
  };
}
