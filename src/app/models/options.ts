import { ItemId } from './item';
import { RecipeId } from './recipe';

export enum OptionsType {
  Belt,
  Assembler,
  Furnace,
  Fuel,
  OilRecipe,
  ProdModule,
  SpeedModule,
  AllModule,
}

export const options: { [key: number]: string[][] } = {
  [OptionsType.Belt]: [
    [
      ItemId.TransportBelt,
      ItemId.FastTransportBelt,
      ItemId.ExpressTransportBelt,
    ],
  ],
  [OptionsType.Assembler]: [
    [
      ItemId.AssemblingMachine1,
      ItemId.AssemblingMachine2,
      ItemId.AssemblingMachine3,
    ],
  ],
  [OptionsType.Furnace]: [
    [ItemId.StoneFurnace, ItemId.SteelFurnace, ItemId.ElectricFurnace],
  ],
  [OptionsType.Fuel]: [
    [
      ItemId.Wood,
      ItemId.Coal,
      ItemId.SolidFuel,
      ItemId.RocketFuel,
      ItemId.NuclearFuel,
    ],
  ],
  [OptionsType.OilRecipe]: [
    [
      RecipeId.BasicOilProcessing,
      RecipeId.AdvancedOilProcessing,
      RecipeId.CoalLiquefaction,
    ],
  ],
  [OptionsType.ProdModule]: [
    [
      ItemId.Module,
      ItemId.ProductivityModule,
      ItemId.ProductivityModule2,
      ItemId.ProductivityModule3,
    ],
  ],
  [OptionsType.SpeedModule]: [
    [
      ItemId.Module,
      ItemId.SpeedModule,
      ItemId.SpeedModule2,
      ItemId.SpeedModule3,
    ],
  ],
  [OptionsType.AllModule]: [
    [ItemId.Module],
    [ItemId.SpeedModule, ItemId.SpeedModule2, ItemId.SpeedModule3],
    [
      ItemId.ProductivityModule,
      ItemId.ProductivityModule2,
      ItemId.ProductivityModule3,
    ],
  ],
};
