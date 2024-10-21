import { Rational } from '../rational';

export interface ItemState {
  beltId?: string;
  stack?: Rational;
  wagonId?: string;
}

export interface ItemSettings extends ItemState {
  defaultBeltId?: string;
  defaultWagonId?: string;
}
