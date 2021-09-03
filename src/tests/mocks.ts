import { data } from 'src/data';
import base from 'src/data/1.1/data.json';
import hash from 'src/data/1.1/hash.json';
import mod from 'src/data/res/data.json';
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
  Node,
  Link,
  LinkValue,
  ModHash,
  MatrixResult,
  MatrixResultType,
  Game,
  SankeyAlign,
} from '~/models';
import { initialDatasetsState } from '~/store/datasets';
import { getFactorySettings, initialFactoriesState } from '~/store/factories';
import { getItemSettings } from '~/store/items';
import { initialColumnsState, PreferencesState } from '~/store/preferences';
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
import { ItemId } from './item-id';
import { RecipeId } from './recipe-id';

export const Raw = data;
export const DataState = initialDatasetsState;
export const BaseInfo = data.base[0];
export const BaseData = base;
export const Hash: ModHash = hash;
export const Base: Mod = { ...BaseInfo, ...BaseData };
export const ModData1 = mod;
export const Mod1: Mod = { ...data.mods[0], ...ModData1 };
export const ModInfo = [data.mods[0]];
export const Defaults = getDefaults.projector(Preset.Beacon8, Base);
export const Data = getNormalDataset.projector(
  data.app,
  [Base, Mod1],
  Defaults,
  Game.Factorio
);
export const CategoryId = Data.categoryIds[0];
export const Item1 = Data.itemEntities[Data.itemIds[0]];
export const Item2 = Data.itemEntities[Data.itemIds[1]];
export const Recipe1 = Data.recipeEntities[Data.recipeIds[0]];
export const Product1: Product = {
  id: '0',
  itemId: Item1.id,
  rate: '1',
  rateType: RateType.Items,
};
export const Product2: Product = {
  id: '1',
  itemId: Item2.id,
  rate: '2',
  rateType: RateType.Belts,
};
export const Product3: Product = {
  id: '2',
  itemId: ItemId.PetroleumGas,
  rate: '3',
  rateType: RateType.Wagons,
};
export const Product4: Product = {
  id: '3',
  itemId: ItemId.TransportBelt,
  rate: '4',
  rateType: RateType.Factories,
};
export const Products = [Product1, Product2, Product3, Product4];
export const ProductsState1: ProductsState = {
  ids: Products.map((p) => p.id),
  entities: toEntities(Products),
  index: Products.length + 1,
};
export const RationalProducts = Products.map((p) => {
  const rp = new RationalProduct(p);
  rp.viaId = rp.itemId;
  return rp;
});
export const ProductIds = Products.map((p) => p.id);
export const ProductEntities = getProductsBy.projector(RationalProducts);
export const ProductSteps = {
  [Item1.id]: [],
  [Item2.id]: [],
  [ItemId.PetroleumGas]: [],
  [ItemId.TransportBelt]: [[RecipeId.TransportBelt, Rational.one]],
};
export const ItemSettings1: ItemSettings = {
  ignore: false,
  belt: ItemId.TransportBelt,
  wagon: ItemId.CargoWagon,
};
export const RecipeSettings1: RecipeSettings = {
  factory: ItemId.AssemblingMachine2,
  factoryModules: [ItemId.Module, ItemId.Module],
  beacon: ItemId.Beacon,
  beaconModules: [ItemId.SpeedModule, ItemId.SpeedModule],
  beaconCount: '0',
};
export const RecipeSettings2: RecipeSettings = {
  factory: ItemId.AssemblingMachine2,
  factoryModules: [ItemId.Module, ItemId.Module],
  beacon: ItemId.Beacon,
  beaconModules: [ItemId.SpeedModule, ItemId.SpeedModule],
  beaconCount: '0',
};
export const Step1: Step = {
  id: `${Item1.id}.${Item1.id}`,
  itemId: Item1.id,
  recipeId: Item1.id as any,
  items: Rational.fromString(Product1.rate),
  belts: Rational.fromNumber(0.5),
  wagons: Rational.two,
  factories: Rational.one,
  power: Rational.one,
  pollution: Rational.one,
  beacons: Rational.from(4),
};
export const Step2: Step = {
  id: `${Item2.id}.${Item2.id}`,
  itemId: Item2.id,
  recipeId: Item2.id as any,
  items: Rational.fromString(Product2.rate),
  belts: Rational.one,
  wagons: Rational.one,
  factories: Rational.two,
  power: Rational.zero,
  pollution: Rational.zero,
  beacons: Rational.from(4),
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
export const SettingsState1 = { ...initialSettingsState, ...Defaults };
export const ItemSettingsInitial = getItemSettings.projector({}, Data, {
  belt: ItemId.TransportBelt,
  cargoWagon: ItemId.CargoWagon,
  fluidWagon: ItemId.FluidWagon,
});
export const FactorySettingsInitial = getFactorySettings.projector(
  initialFactoriesState,
  Defaults,
  Data
);
export const RecipeSettingsInitial = getRecipeSettings.projector(
  {},
  FactorySettingsInitial,
  Data
);
export const RationalRecipeSettings = getRationalRecipeSettings.projector(
  RecipeSettingsEntities
);
export const RationalRecipeSettingsInitial =
  getRationalRecipeSettings.projector(RecipeSettingsInitial);
export const AdjustedData = getAdjustedDataset.projector(
  RationalRecipeSettingsInitial,
  ItemSettingsInitial,
  Defaults.disabledRecipes,
  {
    fuel: ItemId.Coal,
    miningBonus: Rational.zero,
    researchSpeed: Rational.one,
    costFactor: Rational.one,
    costFactory: Rational.one,
    data: Data,
  }
);
export const Preferences: PreferencesState = {
  states: { ['name']: 'z=zip' },
  columns: initialColumnsState,
  linkSize: LinkValue.Items,
  linkText: LinkValue.Items,
  sankeyAlign: SankeyAlign.Justify,
  simplex: true,
};

function node(i: number): Node {
  return {
    id: `${i}`,
    href: 'data/1.0/icons.png',
    viewBox: '0 0 64 64',
    name: `${i}`,
    color: 'black',
  };
}

function link(i: number, j: number): Link {
  return {
    source: `${i}`,
    target: `${j}`,
    value: Math.max(1, i),
    text: '1 items',
    name: `${i}->${j}`,
    color: 'white',
  };
}

export const Sankey: SankeyData = {
  nodes: [
    node(0),
    node(1),
    node(2),
    node(3),
    node(4),
    node(5),
    node(6),
    node(7),
    node(8),
    node(9),
  ],
  links: [
    link(1, 0),
    link(2, 0),
    link(3, 0),
    link(4, 0),
    link(5, 0),
    link(6, 0),
    link(7, 0),
    link(8, 0),
    link(0, 9),
  ],
};

export const SankeyCircular: SankeyData = {
  nodes: [node(0), node(1), node(2)],
  links: [link(0, 1), link(1, 2), link(2, 0)],
};

export const MatrixResultSolved: MatrixResult = {
  steps: Steps,
  result: MatrixResultType.Solved,
  pivots: 9,
  time: 20,
  A: [
    [Rational.one, Rational.one, Rational.zero, Rational.zero],
    [Rational.zero, Rational.one, Rational.one, Rational.one],
  ],
  O: [Rational.one, Rational.one, Rational.one, Rational.one],
  items: [ItemId.Wood],
  recipes: [RecipeId.WoodenChest],
  inputs: [],
};
