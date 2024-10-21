import { Game } from './enum/game';

/** Game information, nonconfigurable */
export interface GameInfo {
  icon: string;
  route: string;
  label: string;
  modId: string;
}

/** Game information data, nonconfigurable */
export const gameInfo: Record<Game, GameInfo> = {
  [Game.Factorio]: {
    icon: 'factorio',
    route: '/2.0',
    label: 'options.game.factorio',
    modId: '2.0',
  },
  [Game.DysonSphereProgram]: {
    icon: 'dyson-sphere-program',
    route: '/dsp',
    label: 'options.game.dysonSphereProgram',
    modId: 'dsp',
  },
  [Game.Satisfactory]: {
    icon: 'satisfactory',
    route: '/sfy',
    label: 'options.game.satisfactory',
    modId: 'sfy',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'captain-of-industry',
    route: '/coi',
    label: 'options.game.captainOfIndustry',
    modId: 'coi',
  },
  [Game.FinalFactory]: {
    icon: 'final-factory',
    route: '/ffy',
    label: 'options.game.finalFactory',
    modId: 'ffy',
  },
  [Game.Techtonica]: {
    icon: 'techtonica',
    route: '/tta',
    label: 'options.game.techtonica',
    modId: 'tta',
  },
};
