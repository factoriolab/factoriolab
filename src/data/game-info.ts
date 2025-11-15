import { CUSTOM_MOD, Game } from './game';

/** Game information, nonconfigurable */
export interface GameInfo {
  label: string;
  modId: string;
}

/** Game information data, nonconfigurable */
export const gameInfo: Record<Game, GameInfo> = {
  factorio: { label: 'options.game.factorio', modId: 'spa' },
  'dyson-sphere-program': {
    label: 'options.game.dysonSphereProgram',
    modId: 'dsp',
  },
  satisfactory: { label: 'options.game.satisfactory', modId: 'sfy' },
  'captain-of-industry': {
    label: 'options.game.captainOfIndustry',
    modId: 'coi',
  },
  'final-factory': { label: 'options.game.finalFactory', modId: 'ffy' },
  techtonica: { label: 'options.game.techtonica', modId: 'tta' },
  'factor-y': { label: 'options.game.factorY', modId: 'fay' },
  mindustry: { label: 'options.game.mindustry', modId: 'mds' },
  foundry: { label: 'options.game.foundry', modId: 'fdy' },
  'outworld-station': { label: 'options.game.outworldStation', modId: 'ows' },
  skyformer: { label: 'options.game.skyformer', modId: 'sky' },
  custom: { label: 'options.game.custom', modId: CUSTOM_MOD },
};
