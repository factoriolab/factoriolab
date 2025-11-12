import { Game } from './game';

/** Game information, nonconfigurable */
export interface GameInfo {
  route: string;
  label: string;
  modId: string;
}

/** Game information data, nonconfigurable */
export const gameInfo: Record<Game, GameInfo> = {
  factorio: {
    route: '/spa',
    label: 'options.game.factorio',
    modId: 'spa',
  },
  'dyson-sphere-program': {
    route: '/dsp',
    label: 'options.game.dysonSphereProgram',
    modId: 'dsp',
  },
  satisfactory: {
    route: '/sfy',
    label: 'options.game.satisfactory',
    modId: 'sfy',
  },
  'captain-of-industry': {
    route: '/coi',
    label: 'options.game.captainOfIndustry',
    modId: 'coi',
  },
  'final-factory': {
    route: '/ffy',
    label: 'options.game.finalFactory',
    modId: 'ffy',
  },
  techtonica: {
    route: '/tta',
    label: 'options.game.techtonica',
    modId: 'tta',
  },
  'factor-y': {
    route: '/fay',
    label: 'options.game.factorY',
    modId: 'fay',
  },
  mindustry: {
    route: '/mds',
    label: 'options.game.mindustry',
    modId: 'mds',
  },
  foundry: {
    route: '/fdy',
    label: 'options.game.foundry',
    modId: 'fdy',
  },
  'outworld-station': {
    route: '/ows',
    label: 'options.game.outworldStation',
    modId: 'ows',
  },
  skyformer: {
    route: '/sky',
    label: 'options.game.skyformer',
    modId: 'sky',
  },
};
