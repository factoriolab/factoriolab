import { IdName } from '../id-name';

export enum Game {
  None = 'None',
  Factorio = 'Factorio',
  CaptainOfIndustry = 'CaptainOfIndustry',
  DysonSphereProgram = 'DysonSphereProgram',
  CaptainOfIndustry = 'CaptainOfIndustry',
  Satisfactory = 'Satisfactory',
}

export const GameOptions: IdName<Game>[] = [
  { id: Game.Factorio, name: 'game.Factorio' },
  { id: Game.CaptainOfIndustry, name: 'game.CaptainOfIndustry' },
  { id: Game.DysonSphereProgram, name: 'game.DysonSphereProgram' },
  { id: Game.CaptainOfIndustry, name: 'game.CaptainOfIndustry' },
  { id: Game.Satisfactory, name: 'game.Satisfactory' },
];
