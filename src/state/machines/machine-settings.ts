import { Option } from '~/models/option';
import { Rational } from '~/rational/rational';

import { MachineState } from './machine-state';

export interface MachineSettings extends MachineState {
  defaultFuelId?: string;
  fuelOptions?: Option[];
  moduleOptions?: Option[];
  defaultOverclock?: Rational;
}
