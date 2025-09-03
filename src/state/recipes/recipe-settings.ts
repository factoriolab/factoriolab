import { Option } from '~/models/option';
import { Rational } from '~/rational/rational';

import { RecipeState } from './recipe-state';

export interface RecipeSettings extends RecipeState {
  defaultMachineId?: string;
  defaultFuelId?: string;
  machineOptions?: Option[];
  fuelOptions?: Option[];
  moduleOptions?: Option[];
  defaultOverclock?: Rational;
}
