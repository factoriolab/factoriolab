export type DefaultsJson = HardCodedPresetsJson | CustomPresetsJson;

export interface HardCodedPresetsJson extends BaseDefaultsJson {
  minBeltRank?: string[];
  maxBeltRank?: string[];
  minMachineRank?: string[];
  maxMachineRank?: string[];
}

export interface CustomPresetsJson extends BaseCustomJson {
  presets: PresetJson[];
}

export interface PresetJson extends BaseCustomJson {
  /**
   * ID in `public/data/{mod}/defaults.json`
   * Example: "options.preset.minimum"
   */
  id: number;
  label: string;
}

export interface BaseCustomJson extends BaseDefaultsJson {
  locations?: string[];
  beltRank?: string[];
  beltStack?: number | string;
  machineRank?: string[];
  /** Defaults to zero */
  beaconCount?: number | string;
}

export interface BaseDefaultsJson {
  beacon?: string;
  fuelRank?: string[];
  wagonRank?: string[];
  excludedRecipes?: string[];
  moduleRank?: string[];
  beaconModule?: string;
  miningBonus?: string | number;
  researchBonus?: string | number;
  researchProductivity?: string | number;
  researchedTechnologies?: string[];
  recipeProductivity?: Partial<Record<string, string | number>>;
}
