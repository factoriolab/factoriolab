export type Flag =
  | 'beacons'
  | 'belts'
  | 'beltStack'
  | 'consumptionAsDrain'
  | 'diminishingBeacons'
  | 'duplicators'
  | 'expensive'
  | 'hideMachineSettings'
  | 'inactiveDrain'
  | 'flowRate'
  | 'fluidCostRatio'
  | 'maximumFactor'
  | 'minimumFactor'
  | 'minimumRecipeTime'
  | 'miningDepletion'
  | 'miningProductivity'
  | 'miningSpeed'
  | 'miningTechnologyBypassLimitations'
  | 'mods'
  | 'overclock'
  | 'pollution'
  | 'power'
  | 'proliferator'
  | 'quality'
  | 'researchSpeed'
  | 'resourcePurity'
  | 'rockets'
  | 'somersloop'
  | 'technologies'
  | 'wagons';

export type FlagSet =
  | 'spa'
  | '2.0'
  | '2.0q'
  | '1.1'
  | '1.1e'
  | '1.0'
  | 'dsp'
  | 'sfy'
  | 'coi'
  | 'ffy'
  | 'tta'
  | 'fay'
  | 'mds'
  | 'fdy'
  | 'sky';

export const flags: Record<FlagSet, Set<Flag>> = {
  spa: new Set([
    'beacons',
    'belts',
    'beltStack',
    'diminishingBeacons',
    'fluidCostRatio',
    'maximumFactor',
    'minimumFactor',
    'miningDepletion',
    'miningProductivity',
    'mods',
    'pollution',
    'power',
    'quality',
    'researchSpeed',
    'rockets',
    'technologies',
    'wagons',
  ]),
  '2.0': new Set([
    'beacons',
    'belts',
    'diminishingBeacons',
    'fluidCostRatio',
    'maximumFactor',
    'minimumFactor',
    'miningDepletion',
    'miningProductivity',
    'mods',
    'pollution',
    'power',
    'researchSpeed',
    'technologies',
    'wagons',
  ]),
  '2.0q': new Set([
    'beacons',
    'belts',
    'diminishingBeacons',
    'fluidCostRatio',
    'maximumFactor',
    'minimumFactor',
    'miningDepletion',
    'miningProductivity',
    'mods',
    'pollution',
    'power',
    'quality',
    'researchSpeed',
    'technologies',
    'wagons',
  ]),
  '1.1': new Set([
    'beacons',
    'belts',
    'flowRate',
    'fluidCostRatio',
    'minimumFactor',
    'minimumRecipeTime',
    'miningDepletion',
    'miningProductivity',
    'miningTechnologyBypassLimitations',
    'mods',
    'pollution',
    'power',
    'researchSpeed',
    'technologies',
    'wagons',
  ]),
  '1.1e': new Set([
    'beacons',
    'belts',
    'expensive',
    'flowRate',
    'fluidCostRatio',
    'minimumFactor',
    'minimumRecipeTime',
    'miningDepletion',
    'miningProductivity',
    'miningTechnologyBypassLimitations',
    'mods',
    'pollution',
    'power',
    'researchSpeed',
    'technologies',
    'wagons',
  ]),
  '1.0': new Set([
    'beacons',
    'belts',
    'flowRate',
    'fluidCostRatio',
    'minimumFactor',
    'minimumRecipeTime',
    'miningDepletion',
    'miningProductivity',
    'miningTechnologyBypassLimitations',
    'mods',
    'pollution',
    'power',
    'researchSpeed',
    'wagons',
  ]),
  dsp: new Set([
    'belts',
    'beltStack',
    'inactiveDrain',
    'miningSpeed',
    'power',
    'proliferator',
    'technologies',
  ]),
  sfy: new Set([
    'belts',
    'consumptionAsDrain',
    'overclock',
    'power',
    'resourcePurity',
    'somersloop',
    'wagons',
  ]),
  coi: new Set(['belts', 'hideMachineSettings']),
  ffy: new Set(['belts', 'duplicators']),
  tta: new Set(['belts', 'power']),
  fay: new Set(['belts', 'power', 'miningSpeed', 'beltStack', 'technologies']),
  mds: new Set(['belts', 'power', 'mods']),
  fdy: new Set(['belts', 'power']),
  sky: new Set([]),
};
