import { Option } from '~/models/option';

import { datasets } from './datasets';

export enum Game {
  Factorio = 'Factorio',
  CaptainOfIndustry = 'CaptainOfIndustry',
  DysonSphereProgram = 'DysonSphereProgram',
  FinalFactory = 'FinalFactory',
  Satisfactory = 'Satisfactory',
  Techtonica = 'Techtonica',
  FactorY = 'FactorY',
  Mindustry = 'Mindustry',
  Foundry = 'Foundry',
  OutworldStation = 'OutworldStation',
}

export const gameOptions: Option<Game>[] = [
  { value: Game.Factorio, label: 'options.game.factorio' },
  { value: Game.DysonSphereProgram, label: 'options.game.dysonSphereProgram' },
  { value: Game.Satisfactory, label: 'options.game.satisfactory' },
  { value: Game.CaptainOfIndustry, label: 'options.game.captainOfIndustry' },
  { value: Game.Techtonica, label: 'options.game.techtonica' },
  { value: Game.FinalFactory, label: 'options.game.finalFactory' },
  { value: Game.FactorY, label: 'options.game.factorY' },
  { value: Game.Mindustry, label: 'options.game.mindustry' },
  { value: Game.Foundry, label: 'options.game.foundry' },
  { value: Game.OutworldStation, label: 'options.game.outworldStation' },
];

export function modOptions(game: Game): Option[] {
  return datasets.mods
    .filter((m) => m.game === game)
    .map((m): Option => ({ label: m.name, value: m.id }));
}
