import { Game } from './enum';

interface GameInfo {
  icon: string;
  route: string;
  title: string;
  meta: string;
  modId: string;
}

export const gameInfo: Record<Game, GameInfo> = {
  [Game.None]: {
    icon: 'assets/factorio.webp',
    route: 'factorio',
    title: 'title.lab',
    meta: 'FactorioLab',
    modId: '1.1',
  },
  [Game.Factorio]: {
    icon: 'assets/factorio.webp',
    route: 'factorio',
    title: 'title.lab',
    meta: 'Factorio',
    modId: '1.1',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'assets/coi.webp',
    route: 'coi',
    title: 'title.coi',
    meta: 'Captain of Industry',
    modId: 'coi',
  },
  [Game.DysonSphereProgram]: {
    icon: 'assets/dsp.webp',
    route: 'dsp',
    title: 'title.dsp',
    meta: 'Dyson Sphere Program',
    modId: 'dsp',
  },
  [Game.Satisfactory]: {
    icon: 'assets/satisfactory.webp',
    route: 'satisfactory',
    title: 'title.sfy',
    meta: 'Satisfactory',
    modId: 'sfy',
  },
};
