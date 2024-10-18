export type Flag =
  | 'beacons'
  | 'beltStack'
  | 'consumptionAsDrain'
  | 'diminishingBeacons'
  | 'duplicators'
  | 'fuels'
  | 'hideMachineSettings'
  | 'inactiveDrain'
  | 'inserterEstimation'
  | 'flowRate'
  | 'fluidCostRatio'
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
  | 'somersloop'
  | 'wagons';

export type FlagSet =
  | 'spa'
  | '2.0'
  | '1.1'
  | 'dsp'
  | 'sfy'
  | 'coi'
  | 'ffy'
  | 'tta';

export const flags: Record<FlagSet, Set<Flag>> = {
  spa: new Set([
    'beacons',
    'beltStack',
    'diminishingBeacons',
    'fluidCostRatio',
    'fuels',
    'inserterEstimation',
    'miningDepletion',
    'miningProductivity',
    'miningTechnologyBypassLimitations',
    'mods',
    'pollution',
    'power',
    'quality',
    'researchSpeed',
    'wagons',
  ]),
  '2.0': new Set([
    'beacons',
    'diminishingBeacons',
    'fluidCostRatio',
    'fuels',
    'inserterEstimation',
    'miningDepletion',
    'miningProductivity',
    'miningTechnologyBypassLimitations',
    'mods',
    'pollution',
    'power',
    'researchSpeed',
    'wagons',
  ]),
  '1.1': new Set([
    'beacons',
    'flowRate',
    'fluidCostRatio',
    'fuels',
    'inserterEstimation',
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
};
