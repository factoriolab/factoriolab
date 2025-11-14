export type Flag =
  | 'beltStack'
  | 'consumptionAsDrain'
  | 'duplicators'
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
  | 'somersloop';

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
    'beltStack',
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
  ]),
  '2.0': new Set([
    'fluidCostRatio',
    'maximumFactor',
    'minimumFactor',
    'miningDepletion',
    'miningProductivity',
    'mods',
    'pollution',
    'power',
    'researchSpeed',
  ]),
  '2.0q': new Set([
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
  ]),
  '1.1': new Set([
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
  ]),
  '1.1e': new Set([
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
  ]),
  '1.0': new Set([
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
  ]),
  dsp: new Set([
    'beltStack',
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
  ]),
  coi: new Set(['hideMachineSettings']),
  ffy: new Set(['duplicators']),
  tta: new Set(['power']),
  fay: new Set(['power', 'miningSpeed', 'beltStack']),
  mds: new Set(['power', 'mods']),
  fdy: new Set(['power']),
  sky: new Set([]),
};
