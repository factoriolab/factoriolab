import { SelectItem } from 'primeng/api';

export enum Game {
  None = 'None',
  Factorio = 'Factorio',
  CaptainOfIndustry = 'CaptainOfIndustry',
  DysonSphereProgram = 'DysonSphereProgram',
  Satisfactory = 'Satisfactory',
}

export const games = [
  Game.Factorio,
  Game.CaptainOfIndustry,
  Game.DysonSphereProgram,
  Game.Satisfactory,
];

export const gameOptions: SelectItem<Game>[] = [
  { value: Game.Factorio, label: 'game.factorio' },
  { value: Game.CaptainOfIndustry, label: 'game.captainOfIndustry' },
  { value: Game.DysonSphereProgram, label: 'game.dysonSphereProgram' },
  { value: Game.Satisfactory, label: 'game.satisfactory' },
];
