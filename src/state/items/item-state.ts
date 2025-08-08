import { Rational } from '~/models/rational';

export interface ItemState {
  beltId?: string;
  stack?: Rational;
  wagonId?: string;
}
