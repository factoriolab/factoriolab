import { Game } from './enum/game';

export type GameFlag =
  | 'beacons'
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
  | 'researchSpeed'
  | 'resourcePurity'
  | 'somersloop'
  | 'wagons';

/** Game information, nonconfigurable */
export interface GameInfo {
  icon: string;
  route: string;
  label: string;
  modId: string;
  flags: Set<GameFlag>;
}

/** Game information data, nonconfigurable */
export const gameInfo: Record<Game, GameInfo> = {
  [Game.Factorio2]: {
    icon: 'factorio',
    route: `/2.0`,
    label: 'options.game.factorio2',
    modId: '2.0',
    flags: new Set([
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
  },
  [Game.Factorio]: {
    icon: 'factorio',
    route: '/1.1',
    label: 'options.game.factorio',
    modId: '1.1',
    flags: new Set([
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
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: '/dsp',
    label: 'options.game.dysonSphereProgram',
    modId: 'dsp',
    flags: new Set([
      'fuels',
      'inactiveDrain',
      'miningSpeed',
      'power',
      'proliferator',
    ]),
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: '/sfy',
    label: 'options.game.satisfactory',
    modId: 'sfy',
    flags: new Set([
      'consumptionAsDrain',
      'overclock',
      'power',
      'resourcePurity',
      'somersloop',
      'wagons',
    ]),
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: '/coi',
    label: 'options.game.captainOfIndustry',
    modId: 'coi',
    flags: new Set(['hideMachineSettings']),
  },
  [Game.FinalFactory]: {
    icon: 'final-factory',
    route: '/ffy',
    label: 'options.game.finalFactory',
    modId: 'ffy',
    flags: new Set(['duplicators']),
  },
  [Game.Techtonica]: {
    icon: 'techtonica',
    route: '/tta',
    label: 'options.game.techtonica',
    modId: 'tta',
    flags: new Set(['fuels', 'power']),
  },
};
