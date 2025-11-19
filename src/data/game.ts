import { Option } from '../option/option';

export type Game =
  | 'captain-of-industry'
  | 'dyson-sphere-program'
  | 'factor-y'
  | 'factorio'
  | 'final-factory'
  | 'foundry'
  | 'mindustry'
  | 'outworld-station'
  | 'satisfactory'
  | 'skyformer'
  | 'techtonica'
  | 'custom';

export const CUSTOM_MOD = 'cst';

export const gameOptions: Option<Game>[] = [
  {
    value: 'captain-of-industry',
    label: 'options.game.captainOfIndustry',
    icon: 'captain-of-industry',
    iconType: 'system',
  },
  {
    value: 'dyson-sphere-program',
    label: 'options.game.dysonSphereProgram',
    icon: 'dyson-sphere-program',
    iconType: 'system',
  },
  {
    value: 'factor-y',
    label: 'options.game.factorY',
    icon: 'factor-y',
    iconType: 'system',
  },
  {
    value: 'factorio',
    label: 'options.game.factorio',
    icon: 'factorio',
    iconType: 'system',
  },
  {
    value: 'final-factory',
    label: 'options.game.finalFactory',
    icon: 'final-factory',
    iconType: 'system',
  },
  {
    value: 'foundry',
    label: 'options.game.foundry',
    icon: 'foundry',
    iconType: 'system',
  },
  {
    value: 'mindustry',
    label: 'options.game.mindustry',
    icon: 'mindustry',
    iconType: 'system',
  },
  {
    value: 'outworld-station',
    label: 'options.game.outworldStation',
    icon: 'outworld-station',
    iconType: 'system',
  },
  {
    value: 'satisfactory',
    label: 'options.game.satisfactory',
    icon: 'satisfactory',
    iconType: 'system',
  },
  {
    value: 'skyformer',
    label: 'options.game.skyformer',
    icon: 'skyformer',
    iconType: 'system',
  },
  {
    value: 'techtonica',
    label: 'options.game.techtonica',
    icon: 'techtonica',
    iconType: 'system',
  },
  {
    value: 'custom',
    label: 'options.game.custom',
    icon: 'custom',
    iconType: 'system',
  },
];
