import { IdName } from '../id-name';

export enum Game {
  None = 'None',
  Factorio = 'Factorio',
  CaptainOfIndustry = 'CaptainOfIndustry',
  DysonSphereProgram = 'DysonSphereProgram',
  Satisfactory = 'Satisfactory',
}

export const Games = [
  Game.Factorio,
  Game.CaptainOfIndustry,
  Game.DysonSphereProgram,
  Game.Satisfactory,
];

export const GameOptions: IdName<Game>[] = [
  { id: Game.Factorio, name: 'game.factorio' },
  { id: Game.CaptainOfIndustry, name: 'game.captainOfIndustry' },
  { id: Game.DysonSphereProgram, name: 'game.dysonSphereProgram' },
  { id: Game.Satisfactory, name: 'game.satisfactory' },
];
