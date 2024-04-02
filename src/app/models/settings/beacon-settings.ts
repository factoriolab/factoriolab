import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export interface BeaconSettings {
  count?: Rational;
  id?: string;
  moduleIds?: string[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;
}
