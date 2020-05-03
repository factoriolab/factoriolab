import { Belt } from './belt';
import { CategoryId } from './category';
import { Factory } from './factory';
import { Module } from './module';

export enum ItemId {
  AssemblingMachine2 = 'assembling-machine-2',
  AssemblingMachine3 = 'assembling-machine-3',
  BurnerMiningDrill = 'burner-mining-drill',
  Coal = 'coal',
  EfficiencyModule1 = 'efficiency-module-1',
  EfficiencyModule2 = 'efficiency-module-2',
  EfficiencyModule3 = 'efficiency-module-3',
  ElectricFurnace = 'electric-furnace',
  ElectricMiningDrill = 'electric-mining-drill',
  ExpressTransportBelt = 'express-transport-belt',
  HeavyOil = 'heavy-oil',
  Lab = 'lab',
  LightOil = 'light-oil',
  MiningProductivity = 'mining-productivity',
  Module = 'module',
  PetroleumGas = 'petroleum-gas',
  Pipe = 'pipe',
  ProductivityModule1 = 'productivity-module-1',
  ProductivityModule2 = 'productivity-module-2',
  ProductivityModule3 = 'productivity-module-3',
  RocketPart = 'rocket-part',
  SolidFuel = 'solid-fuel',
  SpaceSciencePack = 'space-science-pack',
  SpeedModule1 = 'speed-module-1',
  SpeedModule2 = 'speed-module-2',
  SpeedModule3 = 'speed-module-3',
  SteelChest = 'steel-chest',
  StoneFurnace = 'stone-furnace',
  TransportBelt = 'transport-belt',
  Uranium235 = 'uranium-235',
  Uranium238 = 'uranium-238',
  UraniumOre = 'uranium-ore',
  Water = 'water',
  WoodenChest = 'wooden-chest',
}

export interface Item {
  id: ItemId;
  name: string;
  category: CategoryId;
  row: number;
  stack?: number;
  belt?: Belt;
  factory?: Factory;
  module?: Module;
}
