export enum FactorySettingsField {
  ModuleRank = 'moduleRank',
  BeaconCount = 'beaconCount',
  Beacon = 'beacon',
  BeaconModule = 'beaconModule',
}

export interface FactorySettings {
  moduleRank?: string[];
  beaconCount?: number;
  beacon?: string;
  beaconModule?: string;
}
