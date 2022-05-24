import { data } from 'src/data';
import mod from 'src/data/1.1/data.json';
import hash from 'src/data/1.1/hash.json';
import i18n from 'src/data/1.1/i18n/zh.json';
import {
  Entities,
  Game,
  ItemSettings,
  Link,
  LinkValue,
  MatrixResult,
  MatrixResultType,
  Mod as _Mod,
  ModData,
  ModHash,
  ModI18n,
  Node,
  PowerUnit,
  Preset,
  Product,
  RateType,
  Rational,
  RationalProduct,
  RecipeSettings,
  SankeyAlign,
  SankeyData,
  Step,
  toEntities,
} from '~/models';
import * as Datasets from '~/store/datasets';
import * as Factories from '~/store/factories';
import * as Items from '~/store/items';
import * as Preferences from '~/store/preferences';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { ItemId } from './item-id';
import { RecipeId } from './recipe-id';

export const Raw = data;
export const DataState = Datasets.initialDatasetsState;
export const App = data.app;
export const ModInfo = data.mods[0];
export const Data = mod as unknown as ModData;
export const Hash: ModHash = hash;
export const I18n: ModI18n = i18n;
export const Mod = { ...ModInfo, ...Data } as _Mod;
export const Defaults = Settings.getDefaults.projector(Preset.Beacon8, Mod)!;
export const Dataset = Settings.getDataset.projector(
  data.app,
  Mod,
  null,
  null,
  Defaults,
  Game.Factorio
);
export const CategoryId = Dataset.categoryIds[0];
export const Item1 = Dataset.itemEntities[Dataset.itemIds[0]];
export const Item2 = Dataset.itemEntities[Dataset.itemIds[1]];
export const Recipe1 = Dataset.recipeEntities[Dataset.recipeIds[0]];
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
export const ProductsList = [Product1, Product2, Product3, Product4];
export const ProductsState: Products.ProductsState = {
  ids: ProductsList.map((p) => p.id),
  entities: toEntities(ProductsList),
  index: ProductsList.length + 1,
};
export const RationalProducts = ProductsList.map((p) => {
  const rp = new RationalProduct(p);
  rp.viaId = rp.itemId;
  return rp;
});
export const ProductIds = ProductsList.map((p) => p.id);
export const ProductEntities =
  Products.getProductsBy.projector(RationalProducts);
export const ProductSteps = {
  [Item1.id]: [],
  [Item2.id]: [],
  [ItemId.PetroleumGas]: [],
  [ItemId.TransportBelt]: [[RecipeId.TransportBelt, Rational.one]],
};
export const ItemSettings1: ItemSettings = {
  ignore: false,
  beltId: ItemId.TransportBelt,
  wagonId: ItemId.CargoWagon,
};
export const RecipeSettings1: RecipeSettings = {
  factoryId: ItemId.AssemblingMachine2,
  factoryModuleIds: [ItemId.Module, ItemId.Module],
  beaconId: ItemId.Beacon,
  beaconModuleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
  beaconCount: '0',
};
export const RecipeSettings2: RecipeSettings = {
  factoryId: ItemId.AssemblingMachine2,
  factoryModuleIds: [ItemId.Module, ItemId.Module],
  beaconId: ItemId.Beacon,
  beaconModuleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
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
for (const item of Dataset.itemIds.map((i) => Dataset.itemEntities[i])) {
  ItemSettingsEntities[item.id] = { ...ItemSettings1 };
}
export const RecipeSettingsEntities: Entities<RecipeSettings> = {};
for (const recipe of Dataset.recipeIds.map((i) => Dataset.recipeEntities[i])) {
  RecipeSettingsEntities[recipe.id] = { ...RecipeSettings1 };
}
export const SettingsState1 = { ...Settings.initialSettingsState, ...Defaults };
export const ItemSettingsInitial = Items.getItemSettings.projector(
  {},
  Dataset,
  {
    beltId: ItemId.TransportBelt,
    cargoWagonId: ItemId.CargoWagon,
    fluidWagonId: ItemId.FluidWagon,
  }
);
export const FactorySettingsInitial = Factories.getFactories.projector(
  Factories.initialFactoriesState,
  Defaults,
  Dataset
);
export const RecipeSettingsInitial = Recipes.getRecipeSettings.projector(
  {},
  FactorySettingsInitial,
  Dataset
);
export const RationalRecipeSettings =
  Recipes.getRationalRecipeSettings.projector(RecipeSettingsEntities);
export const RationalRecipeSettingsInitial =
  Recipes.getRationalRecipeSettings.projector(RecipeSettingsInitial);
export const AdjustedData = Recipes.getAdjustedDataset.projector(
  RationalRecipeSettingsInitial,
  ItemSettingsInitial,
  Defaults!.disabledRecipeIds,
  {
    fuelId: ItemId.Coal,
    miningBonus: Rational.zero,
    researchSpeed: Rational.one,
    costFactor: Rational.one,
    costFactory: Rational.one,
    data: Dataset,
  }
);
export const PreferencesState: Preferences.PreferencesState = {
  states: { ['name']: 'z=zip' },
  columns: Preferences.initialColumnsState,
  linkSize: LinkValue.Items,
  linkText: LinkValue.Items,
  sankeyAlign: SankeyAlign.Justify,
  simplex: true,
  powerUnit: PowerUnit.Auto,
  language: 'en',
};

function node(i: number, noHref = false): Node {
  return {
    id: i.toString(),
    stepId: i.toString(),
    href: noHref ? undefined : 'data/1.0/icons.png',
    viewBox: '0 0 64 64',
    name: i.toString(),
    color: 'black',
  };
}

function link(i: number, j: number): Link {
  return {
    source: i.toString(),
    target: j.toString(),
    value: Math.max(1, i),
    text: '1 items',
    name: `${i}->${j}`,
    color: 'white',
  };
}

export const Sankey: SankeyData = {
  nodes: [
    node(0, true),
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
  itemIds: [ItemId.Wood],
  recipeIds: [RecipeId.WoodenChest],
  inputIds: [],
};
