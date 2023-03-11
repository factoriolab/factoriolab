import { ColumnKey } from './config';
import { Game } from './enum';

/** Game information, nonconfigurable */
export interface GameInf {
  icon: string;
  route: string;
  label: string;
  meta: string;
  modId: string;
  hideColumns: ColumnKey[];
}

/** Game information data, nonconfigurable */
export const gameInf: Record<Game, GameInf> = {
  [Game.None]: {
    icon: 'factorio',
    route: 'factorio',
    label: 'options.game.factorio',
    meta: 'FactorioLab',
    modId: '1.1',
    hideColumns: [],
  },
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
};
