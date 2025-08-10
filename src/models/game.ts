import { Option } from '~/models/option';

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
  | 'techtonica';

export const gameOptions: Option<Game>[] = [
  {
    value: 'factorio',
    label: 'options.game.factorio',
  },
  { value: 'dyson-sphere-program', label: 'options.game.dysonSphereProgram' },
  { value: 'satisfactory', label: 'options.game.satisfactory' },
  { value: 'captain-of-industry', label: 'options.game.captainOfIndustry' },
  { value: 'techtonica', label: 'options.game.techtonica' },
  { value: 'final-factory', label: 'options.game.finalFactory' },
  { value: 'factor-y', label: 'options.game.factorY' },
  { value: 'mindustry', label: 'options.game.mindustry' },
  { value: 'foundry', label: 'options.game.foundry' },
  { value: 'outworld-station', label: 'options.game.outworldStation' },
];
