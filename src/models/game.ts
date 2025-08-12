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
  { value: 'captain-of-industry', label: 'options.game.captainOfIndustry' },
  { value: 'dyson-sphere-program', label: 'options.game.dysonSphereProgram' },
  { value: 'factor-y', label: 'options.game.factorY' },
  {
    value: 'factorio',
    label: 'options.game.factorio',
  },
  { value: 'final-factory', label: 'options.game.finalFactory' },
  { value: 'foundry', label: 'options.game.foundry' },
  { value: 'mindustry', label: 'options.game.mindustry' },
  { value: 'outworld-station', label: 'options.game.outworldStation' },
  { value: 'satisfactory', label: 'options.game.satisfactory' },
  { value: 'techtonica', label: 'options.game.techtonica' },
];
