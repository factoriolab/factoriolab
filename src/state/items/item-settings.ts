import { Option } from '~/option/option';
import { Rational } from '~/rational/rational';

import { ItemState } from './item-state';

export interface ItemSettings extends ItemState {
  defaultBeltId?: string;
  beltOptions: Option[];
  defaultStack: Rational;
  defaultWagonId?: string;
  wagonOptions: Option[];
}
