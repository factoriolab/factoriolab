import { Game } from './enum';

interface GameInfo {
  icon: string;
  route: string;
  label: string;
  meta: string;
  modId: string;
  favicon: string;
}

export const gameInfo: Record<Game, GameInfo> = {
  [Game.None]: {
    icon: 'factorio',
    route: 'factorio',
    label: 'options.game.factorio',
    meta: 'FactorioLab',
    modId: '1.1',
    favicon: 'favicon.ico',
  },
  [Game.Factorio]: {
    icon: 'factorio',
    route: 'factorio',
    label: 'options.game.factorio',
    meta: 'Factorio',
    modId: '1.1',
    favicon: 'assets/favicon/factorio.ico',
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: 'dsp',
    label: 'options.game.dysonSphereProgram',
    meta: 'Dyson Sphere Program',
    modId: 'dsp',
    favicon: 'assets/favicon/dsp.ico',
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: 'satisfactory',
    label: 'options.game.satisfactory',
    meta: 'Satisfactory',
    modId: 'sfy',
    favicon: 'assets/favicon/satisfactory.ico',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: 'coi',
    label: 'options.game.captainOfIndustry',
    meta: 'Captain of Industry',
    modId: 'coi',
    favicon: 'assets/favicon/coi.ico',
  },
};
