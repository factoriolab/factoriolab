import { Entities } from './entities';

export interface Zip<T> {
  bare: T;
  hash: T;
}

export interface ZipRecipeSettingsInfo {
  idMap: Entities<number>;
  list: Zip<string>[];
}

export interface ZipMachineSettings {
  moduleMap: Entities<number[]>;
  beaconMap: Entities<number[]>;
}

export interface ZipData {
  objectives: Zip<URLSearchParams>;
  config: Zip<URLSearchParams>;
  objectiveSettings: ZipMachineSettings;
  recipeSettings: ZipMachineSettings;
  machineSettings: ZipMachineSettings;
  beacons?: number[];
}
