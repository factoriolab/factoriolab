import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { ModuleSettings } from './module-settings';

export interface BeaconSettings {
  count: Rational;
  id: string;
  modules: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;
}
