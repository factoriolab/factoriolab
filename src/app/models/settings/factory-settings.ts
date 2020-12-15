export enum FactorySettingsField {
  FactoryModules = 'factoryModules',
  BeaconCount = 'beaconCount',
  Beacon = 'beacon',
  BeaconModules = 'beaconModules',
}

export interface FactorySettings {
  factoryModules?: string[];
  beaconCount?: number;
  beacon?: string;
  beaconModules?: string[];
}
