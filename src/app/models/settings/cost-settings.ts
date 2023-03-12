import { Rational } from '../rational';

export type CostKey =
  | 'factor'
  | 'machine'
  | 'unproduceable'
  | 'excluded'
  | 'surplus'
  | 'maximize';

export type CostsSettings = Record<CostKey, string>;

export type CostsRationalSettings = Record<CostKey, Rational>;
