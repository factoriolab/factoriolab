import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';

/** Beacon configuration */
export interface BeaconCfg {
  count?: string;
  id?: string;
  moduleIds?: string[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: string;
}

/** Beacon rational configuration */
export class BeaconRtlCfg {
  count?: Rational;
  id?: string;
  moduleIds?: string[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;

  constructor(obj: BeaconCfg) {
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
