import { Game } from './enum';

interface GameInfo {
  icon: string;
  route: string;
  label: string;
  meta: string;
  modId: string;
}

export const gameInfo: Record<Game, GameInfo> = {
  [Game.None]: {
    icon: 'factorio',
    route: 'factorio',
    label: 'options.game.factorio',
    meta: 'FactorioLab',
    modId: '1.1',
  },
  [Game.Factorio]: {
    icon: 'factorio',
    route: 'factorio',
    label: 'options.game.factorio',
    meta: 'Factorio',
    modId: '1.1',
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: 'dsp',
    label: 'options.game.dysonSphereProgram',
    meta: 'Dyson Sphere Program',
    modId: 'dsp',
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: 'satisfactory',
    label: 'options.game.satisfactory',
    meta: 'Satisfactory',
    modId: 'sfy',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: 'coi',
    label: 'options.game.captainOfIndustry',
    meta: 'Captain of Industry',
    modId: 'coi',
  },
};
