import { Game } from './enum';
import { ColumnKey } from './settings';

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
    route: 'factorio',
    label: 'options.game.factorio',
    meta: 'Factorio',
    modId: '1.1',
    hideColumns: [],
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: 'dsp',
    label: 'options.game.dysonSphereProgram',
    meta: 'Dyson Sphere Program',
    modId: 'dsp',
    hideColumns: ['beacons', 'pollution', 'wagons'],
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: 'satisfactory',
    label: 'options.game.satisfactory',
    meta: 'Satisfactory',
    modId: 'sfy',
    hideColumns: ['beacons', 'pollution'],
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: 'coi',
    label: 'options.game.captainOfIndustry',
    meta: 'Captain of Industry',
    modId: 'coi',
    hideColumns: ['beacons', 'pollution', 'power', 'wagons'],
  },
  [Game.Techtonica]: {
    icon: 'techtonica',
    route: 'techtonica',
    label: 'options.game.techtonica',
    meta: 'Techtonica',
    modId: 'tta',
    hideColumns: [],
  },
};
