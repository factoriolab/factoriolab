import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

export interface BeaconSettings {
  count?: string;
  id?: string;
  moduleIds?: string[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: string;
}

export class RationalBeaconSettings {
  count?: Rational;
  id?: string;
  moduleIds?: string[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;

  constructor(data: BeaconSettings) {
    if (data.count != null) {
      this.count = Rational.fromString(data.count);
    }
    if (data.id) {
      this.id = data.id;
    }
    if (data.moduleIds) {
      this.moduleIds = data.moduleIds;
    }
    if (data.moduleOptions) {
      this.moduleOptions = data.moduleOptions;
    }
    if (data.total) {
      this.total = Rational.fromString(data.total);
    }
  }
}
