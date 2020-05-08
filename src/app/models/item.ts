import { Belt } from './belt';
import { CategoryId } from './category';
import { Factory } from './factory';
import { Module } from './module';

export enum ItemId {
  AssemblingMachine1 = 'assembling-machine-1',
  AssemblingMachine2 = 'assembling-machine-2',
  AssemblingMachine3 = 'assembling-machine-3',
  Beacon = 'beacon',
  BurnerMiningDrill = 'burner-mining-drill',
  Coal = 'coal',
  EfficiencyModule = 'efficiency-module',
  EfficiencyModule2 = 'efficiency-module-2',
  EfficiencyModule3 = 'efficiency-module-3',
  ElectricFurnace = 'electric-furnace',
  ElectricMiningDrill = 'electric-mining-drill',
  ExpressTransportBelt = 'express-transport-belt',
  FastTransportBelt = 'fast-transport-belt',
  HeavyOil = 'heavy-oil',
  Lab = 'lab',
  LightOil = 'light-oil',
  MiningProductivity = 'mining-productivity',
  Module = 'module',
  PetroleumGas = 'petroleum-gas',
  Pipe = 'pipe',
  ProductivityModule = 'productivity-module',
  ProductivityModule2 = 'productivity-module-2',
  ProductivityModule3 = 'productivity-module-3',
  RocketPart = 'rocket-part',
  SolidFuel = 'solid-fuel',
  SpaceSciencePack = 'space-science-pack',
  SpeedModule = 'speed-module',
  SpeedModule2 = 'speed-module-2',
  SpeedModule3 = 'speed-module-3',
  Steam = 'steam',
  SteelChest = 'steel-chest',
  SteelFurnace = 'steel-furnace',
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
  /** Fuel value in MJ */
  fuel?: number;
}
