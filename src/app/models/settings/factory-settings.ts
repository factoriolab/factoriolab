export enum FactorySettingsField {
  ModuleRank = 'moduleRank',
  BeaconCount = 'beaconCount',
  Beacon = 'beacon',
  BeaconModule = 'beaconModule',
  Overclock = 'overclock',
}

export interface FactorySettings {
  moduleRank?: string[];
  beaconCount?: string;
  beacon?: string;
  beaconModule?: string;
  overclock?: number;
}
