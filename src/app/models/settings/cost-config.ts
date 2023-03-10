import { Rational } from '../rational';

/** Simplex costs configuration key */
export type CostKey =
  | 'factor'
  | 'machine'
  | 'unproduceable'
  | 'excluded'
  | 'surplus'
  | 'maximize';

/** Simplex costs configuration */
export type CostsCfg = Record<CostKey, string>;

/** Rational simplex costs configuration */
export type CostsRatCfg = Record<CostKey, Rational>;
