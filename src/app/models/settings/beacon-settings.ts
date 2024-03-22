import { SelectItem } from 'primeng/api';

import { Rational } from '../rational';
import { ModuleSettings } from './module-settings';

export interface BeaconSettings {
  count: string;
  id: string;
  modules: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: string;
}

export class BeaconSettingsRational {
  count: Rational;
  id: string;
  modules: ModuleSettings[];
  /** Calculated, not configurable */
  moduleOptions?: SelectItem[];
  total?: Rational;

  constructor(obj: BeaconSettings) {
    this.id = obj.id;
    this.modules = obj.modules;
    this.moduleOptions = obj.moduleOptions;
    this.count = Rational.from(obj.count);
    this.total = Rational.from(obj.total);
  }
}
