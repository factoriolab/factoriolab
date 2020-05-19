import { ItemId } from './item';

export enum RecipeId {
  AdvancedOilProcessing = 'advanced-oil-processing',
  BasicOilProcessing = 'basic-oil-processing',
  CoalLiquefaction = 'coal-liquefaction',
  ElectronicCircuit = 'electronic-circuit',
  HeavyOilCracking = 'heavy-oil-cracking',
  KovarexEnrichmentProcess = 'kovarex-enrichment-process',
  LightOilCracking = 'light-oil-cracking',
  RocketPart = 'rocket-part',
  Satellite = 'satellite',
  SolidFuelFromLightOil = 'solid-fuel-from-light-oil',
  SolidFuelFromPetroleumGas = 'solid-fuel-from-petroleum-gas',
  SpaceSciencePack = 'space-science-pack',
  SteelChest = 'steel-chest',
  UraniumProcessing = 'uranium-processing',
}

export interface Recipe {
  id: RecipeId;
  name: string;
  time: number;
  in?: { [key: string]: number };
  out?: { [key: string]: number };
  expensive?: {
    time?: number;
    in?: { [key: string]: number };
  };
  producers?: ItemId[];
}
