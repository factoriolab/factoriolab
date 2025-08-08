import { Rational } from '~/models/rational';

export interface ItemValues {
  /** Sum of value from output objectives */
  out: Rational;
  /** Sum of values from input objectives */
  in?: Rational;
  /** Sum of values from max objectives */
  max?: Rational;
  /** Smallest value from limit objectives */
  lim?: Rational;
}
