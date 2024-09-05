import { Entities } from './entities';
import { LabParams } from './lab-params';

export interface Zip<T = string> {
  bare: T;
  hash: T;
}

export interface ZipRecipeSettingsInfo {
  idMap: Entities<number>;
  list: Zip[];
}

export interface ZipMachineSettings {
  moduleMap: Entities<number[]>;
  beaconMap: Entities<number[]>;
}

export interface ZipData {
  objectives: Zip<LabParams>;
  config: Zip<LabParams>;
  objectiveSettings: ZipMachineSettings;
  recipeSettings: ZipMachineSettings;
  machineSettings: ZipMachineSettings;
  beacons?: number[];
}
