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

  constructor(obj: BeaconSettings) {
    if (obj.count != null) {
      this.count = Rational.fromString(obj.count);
    }
    if (obj.id) {
      this.id = obj.id;
    }
    if (obj.moduleIds) {
      this.moduleIds = obj.moduleIds;
    }
    if (obj.moduleOptions) {
      this.moduleOptions = obj.moduleOptions;
    }
    if (obj.total) {
      this.total = Rational.fromString(obj.total);
    }
  }
}
