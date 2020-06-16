import { ItemId } from '../data/item';
import { RecipeId } from '../data/recipe';

export const options = {
  Belt: [
    [
      ItemId.TransportBelt,
      ItemId.FastTransportBelt,
      ItemId.ExpressTransportBelt,
    ],
  ],
  Assembler: [
    [
      ItemId.AssemblingMachine1,
      ItemId.AssemblingMachine2,
      ItemId.AssemblingMachine3,
    ],
  ],
  Furnace: [[ItemId.StoneFurnace, ItemId.SteelFurnace, ItemId.ElectricFurnace]],
  Fuel: [
    [
      ItemId.Wood,
      ItemId.Coal,
      ItemId.SolidFuel,
      ItemId.RocketFuel,
      ItemId.NuclearFuel,
    ],
  ],
  OilRecipe: [
    [
      RecipeId.BasicOilProcessing,
      RecipeId.AdvancedOilProcessing,
      RecipeId.CoalLiquefaction,
    ],
  ],
  ProdModule: [
    [
      ItemId.Module,
      ItemId.ProductivityModule,
      ItemId.ProductivityModule2,
      ItemId.ProductivityModule3,
    ],
  ],
  SpeedModule: [
    [
      ItemId.Module,
      ItemId.SpeedModule,
      ItemId.SpeedModule2,
      ItemId.SpeedModule3,
    ],
  ],
  AllModule: [
    [ItemId.Module],
    [ItemId.SpeedModule, ItemId.SpeedModule2, ItemId.SpeedModule3],
    [
      ItemId.ProductivityModule,
      ItemId.ProductivityModule2,
      ItemId.ProductivityModule3,
    ],
  ],
};
