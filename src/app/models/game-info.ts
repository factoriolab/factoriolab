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
    icon: 'game-factorio',
    route: '/spa',
    label: 'options.game.factorio',
    modId: 'spa',
  },
  [Game.DysonSphereProgram]: {
    icon: 'game-dyson-sphere-program',
    route: '/dsp',
    label: 'options.game.dysonSphereProgram',
    modId: 'dsp',
  },
  [Game.Satisfactory]: {
    icon: 'game-satisfactory',
    route: '/sfy',
    label: 'options.game.satisfactory',
    modId: 'sfy',
  },
  [Game.CaptainOfIndustry]: {
    icon: 'game-captain-of-industry',
    route: '/coi',
    label: 'options.game.captainOfIndustry',
    modId: 'coi',
  },
  [Game.FinalFactory]: {
    icon: 'game-final-factory',
    route: '/ffy',
    label: 'options.game.finalFactory',
    modId: 'ffy',
  },
  [Game.Techtonica]: {
    icon: 'game-techtonica',
    route: '/tta',
    label: 'options.game.techtonica',
    modId: 'tta',
  },
  [Game.FactorY]: {
    icon: 'game-factor-y',
    route: '/fay',
    label: 'options.game.factorY',
    modId: 'fay',
  },
  [Game.Mindustry]: {
    icon: 'game-mindustry',
    route: '/mds',
    label: 'options.game.mindustry',
    modId: 'mds',
  },
  [Game.Foundry]: {
    icon: 'game-foundry',
    route: '/fdy',
    label: 'options.game.foundry',
    modId: 'fdy',
  },
  [Game.OutworldStation]: {
    icon: 'game-outworld-station',
    route: '/ows',
    label: 'options.game.outworldStation',
    modId: 'ows',
  },
};
