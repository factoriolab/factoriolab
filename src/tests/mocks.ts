import { data } from 'src/data';
import base from 'src/data/1.0/data.json';
import mod from 'src/data/research/data.json';
import {
  Product,
  RateType,
  Step,
  RecipeSettings,
  Entities,
  Rational,
  RationalProduct,
  ItemSettings,
  Mod,
  Preset,
  toEntities,
  SankeyData,
} from '~/models';
import { initialDatasetsState } from '~/store/datasets';
import { getProductsBy, ProductsState } from '~/store/products';
import {
  getRecipeSettings,
  getAdjustedDataset,
  getRationalRecipeSettings,
} from '~/store/recipes';
import {
  getNormalDataset,
  initialSettingsState,
  getDefaults,
} from '~/store/settings';
import { getItemSettings } from '~/store/items';
import { ItemId } from './item-id';

export const Raw = data;
export const DataState = initialDatasetsState;
export const BaseInfo = data.base[0];
export const BaseData = base;
export const Base: Mod = { ...BaseInfo, ...BaseData };
export const ModData1 = mod;
export const Mod1: Mod = { ...data.mods[0], ...ModData1 };
export const ModInfo = [data.mods[0]];
export const Defaults = getDefaults.projector(Preset.Beacon8, base);
export const Data = getNormalDataset.projector(
  data.app,
  [Base, Mod1],
  Defaults
);
export const CategoryId = Data.categoryIds[0];
export const Item1 = Data.itemEntities[Data.itemIds[0]];
export const Item2 = Data.itemEntities[Data.itemIds[1]];
export const Recipe1 = Data.recipeEntities[Data.recipeIds[0]];
export const Product1: Product = {
  id: '0',
  itemId: Item1.id,
  rate: 1,
  rateType: RateType.Items,
};
export const Product2: Product = {
  id: '1',
  itemId: Item2.id,
  rate: 2,
  rateType: RateType.Belts,
};
export const Product3: Product = {
  id: '2',
  itemId: ItemId.PetroleumGas,
  rate: 3,
  rateType: RateType.Wagons,
};
export const Product4: Product = {
  id: '3',
  itemId: ItemId.TransportBelt,
  rate: 4,
  rateType: RateType.Factories,
};
export const Products = [Product1, Product2, Product3, Product4];
export const ProductsState1: ProductsState = {
  ids: Products.map((p) => p.id),
  entities: toEntities(Products),
  index: Products.length + 1,
};
export const RationalProducts = Products.map((p) => new RationalProduct(p));
export const ProductIds = Products.map((p) => p.id);
export const ProductEntities = getProductsBy.projector(RationalProducts);
export const ItemSettings1: ItemSettings = {
  ignore: false,
  belt: ItemId.TransportBelt,
};
export const RecipeSettings1: RecipeSettings = {
  factory: ItemId.AssemblingMachine2,
  factoryModules: [ItemId.Module, ItemId.Module],
  beacon: ItemId.Beacon,
  beaconModules: [ItemId.SpeedModule, ItemId.SpeedModule],
  beaconCount: 0,
};
export const RecipeSettings2: RecipeSettings = {
  factory: ItemId.AssemblingMachine2,
  factoryModules: [ItemId.Module, ItemId.Module],
  beacon: ItemId.Beacon,
  beaconModules: [ItemId.SpeedModule, ItemId.SpeedModule],
  beaconCount: 0,
};
export const Step1: Step = {
  depth: 0,
  itemId: Item1.id,
  recipeId: Item1.id as any,
  items: Rational.fromNumber(Product1.rate),
  belts: Rational.fromNumber(0.5),
  factories: Rational.one,
  power: Rational.one,
  pollution: Rational.one,
};
export const Step2: Step = {
  depth: 1,
  itemId: Item2.id,
  recipeId: Item2.id as any,
  items: Rational.fromNumber(Product2.rate),
  belts: Rational.one,
  factories: Rational.two,
  power: Rational.zero,
  pollution: Rational.zero,
};
export const Steps = [Step1, Step2];
export const BeltSpeed: Entities<Rational> = {
  [ItemId.TransportBelt]: new Rational(BigInt(15)),
  [ItemId.Pipe]: new Rational(BigInt(1500)),
};
export const ItemSettingsEntities: Entities<ItemSettings> = {};
for (const item of Data.itemIds.map((i) => Data.itemEntities[i])) {
  ItemSettingsEntities[item.id] = { ...ItemSettings1 };
}
export const RecipeSettingsEntities: Entities<RecipeSettings> = {};
for (const recipe of Data.recipeIds.map((i) => Data.recipeEntities[i])) {
  RecipeSettingsEntities[recipe.id] = { ...RecipeSettings1 };
}
export const InitialSettingsState = initialSettingsState;
export const SettingsState1 = { ...initialSettingsState, ...Defaults };
export const ItemSettingsInitial = getItemSettings.projector(
  {},
  Data,
  ItemId.TransportBelt
);
export const RecipeSettingsInitial = getRecipeSettings.projector(
  {},
  Defaults.factoryRank,
  Defaults.moduleRank,
  Defaults.beaconCount,
  Defaults.beacon,
  Defaults.beaconModule,
  InitialSettingsState.drillModule,
  Data
);
export const RationalRecipeSettings = getRationalRecipeSettings.projector(
  RecipeSettingsEntities
);
export const AdjustedData = getAdjustedDataset.projector(
  RationalRecipeSettings,
  ItemId.Coal,
  Rational.zero,
  Rational.zero,
  Data
);
export const Sankey: SankeyData = {
  nodes: [
    {
      id: '0',
      name: 'A',
      color: 'red',
      href: 'data/1.0/icons.png',
      viewBox: '0 0 64 64',
    },
    {
      id: '1',
      name: 'B',
      color: 'green',
      href: 'data/1.0/icons.png',
      viewBox: '0 64 64 64',
    },
    {
      id: '2',
      name: 'C',
      color: 'blue',
      href: 'data/1.0/icons.png',
      viewBox: '64 0 64 64',
    },
  ],
  links: [
    {
      source: '0',
      target: '2',
      value: 1,
      name: '0->2',
      color: 'yellow',
    },
    {
      source: '1',
      target: '2',
      value: 2,
      name: '1->2',
      color: 'orange',
    },
  ],
};
