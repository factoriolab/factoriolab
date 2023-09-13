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

export class BeaconRationalSettings {
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

    this.id = obj.id;
    this.moduleIds = obj.moduleIds;
    this.moduleOptions = obj.moduleOptions;

    if (obj.total) {
      this.total = Rational.fromString(obj.total);
    }
  }
}
