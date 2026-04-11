export type Flag =
  | 'beacons'
  | 'beltStack'
  | 'consumptionAsDrain'
  | 'diminishingBeacons'
  | 'duplicators'
  | 'expensive'
  | 'fuels'
  | 'hideMachineSettings'
  | 'inactiveDrain'
  | 'inserterEstimation'
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
  | 'wagons'
  | 'yield' ;

export type FlagSet =
  | 'spa'
  | '2.0'
  | '2.0q'
  | '1.1'
  | '1.1e'
  | 'dsp'
  | 'sfy'
  | 'coi'
  | 'ffy'
  | 'tta'
  | 'fay'
  | 'mds'
  | 'fdy'
  | 'mtm';

const factorioCommon: Flag[] = [
  'beacons',
  'fluidCostRatio',
  'fuels',
  'inserterEstimation',
  'minimumFactor',
  'miningDepletion',
  'miningProductivity',
  'mods',
  'pollution',
  'power',
  'researchSpeed',
  'wagons',
  'yield',
];

export const flags: Record<FlagSet, Set<Flag>> = {
  spa: new Set([
    ...factorioCommon,
    'beltStack',
    'diminishingBeacons',
    'maximumFactor',
    'quality',
    'rockets',
  ]),
  '2.0': new Set([
    ...factorioCommon,
    'diminishingBeacons',
    'maximumFactor',
  ]),
  '2.0q': new Set([
    ...factorioCommon,
    'diminishingBeacons',
    'maximumFactor',
    'quality',
  ]),
  '1.1': new Set([
    ...factorioCommon,
    'flowRate',
    'minimumRecipeTime',
    'miningTechnologyBypassLimitations',
  ]),
  '1.1e': new Set([
    ...factorioCommon,
    'expensive',
    'flowRate',
    'minimumRecipeTime',
    'miningTechnologyBypassLimitations',
  ]),
  dsp: new Set([
    'beltStack',
    'fuels',
    'inactiveDrain',
    'miningSpeed',
    'power',
    'proliferator',
  ]),
  sfy: new Set([
    'consumptionAsDrain',
    'overclock',
    'power',
    'resourcePurity',
    'somersloop',
    'wagons',
  ]),
  coi: new Set(['hideMachineSettings']),
  ffy: new Set(['duplicators']),
  tta: new Set(['fuels', 'power']),
  fay: new Set(['fuels', 'power', 'miningSpeed', 'beltStack']),
  mds: new Set(['power', 'mods']),
  fdy: new Set(['power']),
  mtm: new Set(['power']),
};
