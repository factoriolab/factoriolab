import { Game } from './enum';

interface GameInfo {
  icon: string;
  route: string;
  title: string;
  meta: string;
}

export const GameInfo: Record<Game, GameInfo> = {
  [Game.None]: {
    icon: 'assets/factorio.png',
    route: 'factorio',
    title: 'title.lab',
    meta: 'FactorioLab',
  },
  [Game.Factorio]: {
    icon: 'assets/factorio.png',
    route: 'factorio',
    title: 'title.lab',
    meta: 'Factorio',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'assets/coi.png',
    route: 'coi',
    title: 'title.coi',
    meta: 'Captain of Industry',
  },
  [Game.DysonSphereProgram]: {
    icon: 'assets/dsp.png',
    route: 'dsp',
    title: 'title.dsp',
    meta: 'Dyson Sphere Program',
  },
  [Game.Satisfactory]: {
    icon: 'assets/satisfactory.png',
    route: 'satisfactory',
    title: 'title.sfy',
    meta: 'Satisfactory',
  },
};
