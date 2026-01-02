import { Rational, rational } from '~/rational/rational';

export interface InserterJson {
  /** Rotation speed in °/s */
  speed: number | string;
  stack?: number | string;
  category?: string;
  ignoresBonus?: boolean;
}

export interface Inserter {
  /** Rotation speed in °/s */
  speed: Rational;
  stack?: Rational;
  category?: string;
  ignoresBonus?: boolean;
}

export interface AdjustedInserter extends Inserter {
  stack: Rational;
}

export function parseInserter(json: InserterJson): Inserter;
export function parseInserter(
  json: InserterJson | undefined,
): Inserter | undefined;
export function parseInserter(
  json: InserterJson | undefined,
): Inserter | undefined {
  if (json == null) return;
  return {
    speed: rational(json.speed),
    stack: rational(json.stack),
    category: json.category,
    ignoresBonus: json.ignoresBonus,
  };
}
