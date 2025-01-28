export type DefaultsJson = HardCodedPresetsJson | CustomPresetsJson;

export interface HardCodedPresetsJson {
  beacon?: string;
  minBelt?: string;
  maxBelt?: string;
  minPipe?: string;
  maxPipe?: string;
  fuelRank?: string[];
  cargoWagon?: string;
  fluidWagon?: string;
  excludedRecipes?: string[];
  minMachineRank?: string[];
  maxMachineRank?: string[];
  moduleRank?: string[];
  beaconModule?: string;
}

export interface CustomPresetsJson {
  presets: PresetJson[];

  // Defaults for corresponding `DefaultsPresetJson` properties:
  locations?: string[];
  belt?: string;
  beltStack?: number | string;
  pipe?: string;
  fuelRank?: string[];
  cargoWagon?: string;
  fluidWagon?: string;
  excludedRecipes?: string[];
  machineRank?: string[];
  moduleRank?: string[];
  beacon?: string;
  beaconModule?: string;
}

export interface PresetJson {
  /**
   * ID in `src/assets/i18n/*.json`
   * Example: "options.preset.minimum"
   */
  id: number;
  label: string;

  locations?: string[];
  belt?: string;
  beltStack?: number | string;
  pipe?: string;
  fuelRank?: string[];
  cargoWagon?: string;
  fluidWagon?: string;
  excludedRecipes?: string[];
  machineRank?: string[];
  moduleRank?: string[];
  beacon?: string;
  beaconModule?: string;

  /** Defaults to zero */
  beaconCount?: number | string;
}
