import { Entities } from './entities';

export interface Zip {
  bare: string;
  hash: string;
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
  objectives: Zip;
  config: Zip;
  objectiveSettings: ZipMachineSettings;
  recipeSettings: ZipMachineSettings;
  machineSettings: ZipMachineSettings;
}
