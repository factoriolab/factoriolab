import { Rational } from '../rational';

export type CostKey =
  | 'factor'
  | 'machine'
  | 'footprint'
  | 'unproduceable'
  | 'excluded'
  | 'surplus'
  | 'maximize';

export type CostSettings = Record<CostKey, string>;

export type CostRationalSettings = Record<CostKey, Rational>;
