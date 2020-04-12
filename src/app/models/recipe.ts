import { ItemId } from './item';

export enum RecipeId {
  AdvancedOilProcessing = 'advanced-oil-processing',
  BasicOilProcessing = 'basic-oil-processing',
  CoalLiquefaction = 'coal-liquefaction',
  HeavyOilCracking = 'heavy-oil-cracking',
  LightOilCracking = 'light-oil-cracking',
  Satellite = 'satellite',
  SolidFuelFromLightOil = 'solid-fuel-from-light-oil',
  SolidFuelFromPetroleumGas = 'solid-fuel-from-petroleum-gas',
  SpaceSciencePack = 'space-science-pack',
}

export interface Recipe {
  id: RecipeId;
  time: number;
  in?: { [key: string]: number };
  out?: { [key: string]: number };
  producers?: ItemId[];
}
