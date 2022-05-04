import { IdName } from '../id-name';

export enum Game {
  Factorio,
  DysonSphereProgram,
  Satisfactory,
}

export const GameOptions: IdName<Game>[] = [
  { id: Game.Factorio, name: 'game.Factorio' },
  { id: Game.DysonSphereProgram, name: 'game.DysonSphereProgram' },
  { id: Game.Satisfactory, name: 'game.Satisfactory' },
];
