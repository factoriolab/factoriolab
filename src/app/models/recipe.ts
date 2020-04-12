export enum RecipeId {
  HeavyOilCracking = 'heavy-oil-cracking',
  LightOilCracking = 'light-oil-cracking',
  Satellite = 'satellite',
  SolidFuelFromLightOil = 'solid-fuel-from-light-oil',
  SolidFuelFromPetroleumGas = 'solid-fuel-from-petroleum-gas',
  SpaceSciencePack = 'space-science-pack',
}

export interface Recipe {
  id: string;
  time: number;
  in?: { [key: string]: number };
  out?: { [key: string]: number };
  producers?: string[];
}
