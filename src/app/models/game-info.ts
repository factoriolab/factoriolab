import { DEFAULT_MOD } from './constants';
import { Game } from './enum/game';

export type GameFlag =
  | 'beacons'
  | 'consumptionAsDrain'
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
  meta: string;
  modId: string;
  flags: Set<GameFlag>;
}

/** Game information data, nonconfigurable */
export const gameInfo: Record<Game, GameInfo> = {
  [Game.Factorio]: {
    icon: 'factorio',
    route: `/${DEFAULT_MOD}`,
    label: 'options.game.factorio',
    meta: 'Factorio',
    modId: DEFAULT_MOD,
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
    meta: 'Dyson Sphere Program',
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
    meta: 'Satisfactory',
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
    meta: 'Captain of Industry',
    modId: 'coi',
    flags: new Set(['hideMachineSettings']),
  },
  [Game.FinalFactory]: {
    icon: 'final-factory',
    route: '/ffy',
    label: 'options.game.finalFactory',
    meta: 'Final Factory',
    modId: 'ffy',
    flags: new Set(['duplicators']),
  },
  [Game.Techtonica]: {
    icon: 'techtonica',
    route: '/tta',
    label: 'options.game.techtonica',
    meta: 'Techtonica',
    modId: 'tta',
    flags: new Set(['fuels', 'power']),
  },
};
