import { ItemId } from '../data/item';

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
