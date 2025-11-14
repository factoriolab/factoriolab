import { Rational, rational } from '~/rational/rational';

export type CostKey =
  | 'factor'
  | 'machine'
  | 'footprint'
  | 'unproduceable'
  | 'excluded'
  | 'surplus'
  | 'maximize'
  | 'recycling';

export type CostSettings = Record<CostKey, Rational>;

export const costKeys: CostKey[] = [
  'factor',
  'machine',
  'recycling',
  'footprint',
  'unproduceable',
  'excluded',
  'surplus',
  'maximize',
];

/** In Factorio, one item ~= ten fluid units */
export const FACTORIO_FLUID_COST_RATIO = rational(1n, 10n);
