import { Game } from './enum';

interface GameInfo {
  icon: string;
  route: string;
  title: string;
  label: string;
  meta: string;
  modId: string;
}

export const gameInfo: Record<Game, GameInfo> = {
  [Game.None]: {
    icon: 'factorio',
    route: 'factorio',
    title: 'title.lab',
    label: 'options.game.factorio',
    meta: 'FactorioLab',
    modId: '1.1',
  },
  [Game.Factorio]: {
    icon: 'factorio',
    route: 'factorio',
    title: 'title.lab',
    label: 'options.game.factorio',
    meta: 'Factorio',
    modId: '1.1',
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: 'dsp',
    title: 'title.dsp',
    label: 'options.game.dysonSphereProgram',
    meta: 'Dyson Sphere Program',
    modId: 'dsp',
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: 'satisfactory',
    title: 'title.sfy',
    label: 'options.game.satisfactory',
    meta: 'Satisfactory',
    modId: 'sfy',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: 'coi',
    title: 'title.coi',
    label: 'options.game.captainOfIndustry',
    meta: 'Captain of Industry',
    modId: 'coi',
  },
};
