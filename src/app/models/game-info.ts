import { DEFAULT_MOD } from './constants';
import { Game } from './enum/game';
import { ColumnKey } from './settings/column-settings';

/** Game information, nonconfigurable */
export interface GameInfo {
  icon: string;
  route: string;
  label: string;
  meta: string;
  modId: string;
  hideColumns: ColumnKey[];
}

/** Game information data, nonconfigurable */
export const gameInfo: Record<Game, GameInfo> = {
  [Game.Factorio]: {
    icon: 'factorio',
    route: `/${DEFAULT_MOD}`,
    label: 'options.game.factorio',
    meta: 'Factorio',
    modId: DEFAULT_MOD,
    hideColumns: [],
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: '/dsp',
    label: 'options.game.dysonSphereProgram',
    meta: 'Dyson Sphere Program',
    modId: 'dsp',
    hideColumns: ['beacons', 'pollution', 'wagons'],
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: '/sfy',
    label: 'options.game.satisfactory',
    meta: 'Satisfactory',
    modId: 'sfy',
    hideColumns: ['beacons', 'pollution'],
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: '/coi',
    label: 'options.game.captainOfIndustry',
    meta: 'Captain of Industry',
    modId: 'coi',
    hideColumns: ['beacons', 'pollution', 'power', 'wagons'],
  },
  [Game.FinalFactory]: {
    icon: 'final-factory',
    route: '/ffy',
    label: 'options.game.finalFactory',
    meta: 'Final Factory',
    modId: 'ffy',
    hideColumns: ['beacons', 'pollution', 'power', 'wagons'],
  },
  [Game.Techtonica]: {
    icon: 'techtonica',
    route: '/tta',
    label: 'options.game.techtonica',
    meta: 'Techtonica',
    modId: 'tta',
    hideColumns: ['beacons', 'pollution', 'wagons'],
  },
};
