import { Rational } from '~/models/rational';

import { ItemState } from './item-state';

export interface ItemSettings extends ItemState {
  defaultBeltId?: string;
  defaultStack: Rational;
  defaultWagonId?: string;
}
