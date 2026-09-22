import { Option } from '~/option/option';
import { Rational } from '~/rational/rational';

import { ItemState } from './item-state';

// TODO: #1976 investigate whether more settings fields can be made non-nullable
export interface ItemSettings extends ItemState {
  defaultBeltId?: string;
  beltOptions: Option[];
  defaultStack?: Rational;
  defaultWagonId?: string;
  wagonOptions: Option[];
}
