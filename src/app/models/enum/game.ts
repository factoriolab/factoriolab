import { IdName } from '../id-name';

export enum Game {
  None = 'None',
  Factorio = 'Factorio',
  DysonSphereProgram = 'DysonSphereProgram',
  Satisfactory = 'Satisfactory',
}

export const GameOptions: IdName<Game>[] = [
  { id: Game.Factorio, name: 'game.Factorio' },
  { id: Game.DysonSphereProgram, name: 'game.DysonSphereProgram' },
  { id: Game.Satisfactory, name: 'game.Satisfactory' },
];
