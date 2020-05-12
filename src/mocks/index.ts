import Fraction from 'fraction.js';

import * as data from 'src/assets/0-18.json';
import {
  Product,
  RateType,
  Step,
  RecipeSettings,
  Entities,
  ItemId,
  Factors,
} from '~/models';
import {
  DatasetState,
  datasetReducer,
  LoadDatasetAction,
} from '~/store/dataset';
import { getRecipeSettings } from '~/store/recipe';
import { initialSettingsState } from '~/store/settings';

export const Data: DatasetState = datasetReducer(
  undefined,
  new LoadDatasetAction((data as any).default)
);
export const CategoryId = Data.categories[0].id;
export const Item1 = Data.items[0];
export const Item2 = Data.items[1];
export const Recipe1 = Data.recipes[0];
export const Product1: Product = {
  id: 0,
  itemId: Item1.id,
  rate: 1,
  rateType: RateType.Items,
};
export const Product2: Product = {
  id: 1,
  itemId: Item2.id,
  rate: 2,
  rateType: RateType.Belts,
};
export const Product3: Product = {
  id: 2,
  itemId: ItemId.PetroleumGas,
  rate: 3,
  rateType: RateType.Wagons,
};
export const Product4: Product = {
  id: 3,
  itemId: ItemId.TransportBelt,
  rate: 4,
  rateType: RateType.Factories,
};
export const Products = [Product1, Product2, Product3, Product4];
export const ProductIds = Products.map((p) => p.id);
export const ProductEntities = Products.reduce((e: Entities<Product>, i) => {
  return { ...e, ...{ [i.id]: i } };
}, {});
export const Settings1: RecipeSettings = {
  ignore: false,
  belt: ItemId.TransportBelt,
  factory: ItemId.AssemblingMachine2,
  modules: [ItemId.Module, ItemId.Module],
  beaconModule: ItemId.SpeedModule,
  beaconCount: 0,
};
export const Settings2: RecipeSettings = {
  ignore: false,
  belt: ItemId.TransportBelt,
  factory: ItemId.AssemblingMachine2,
  modules: [ItemId.Module, ItemId.Module],
  beaconModule: ItemId.Module,
  beaconCount: 0,
};
export const Step1: Step = {
  itemId: Item1.id,
  recipeId: Item1.id as any,
  items: new Fraction(Product1.rate),
  belts: new Fraction(0.5),
  factories: new Fraction(1),
  settings: Settings1,
};
export const Step2: Step = {
  itemId: Item2.id,
  recipeId: Item2.id as any,
  items: new Fraction(Product2.rate),
  belts: new Fraction(1),
  factories: new Fraction(2),
  settings: Settings2,
};
export const Steps = [Step1, Step2];
export const BeltSpeed: Entities<Fraction> = {
  [ItemId.TransportBelt]: new Fraction(15),
};
export const Factors1: Factors = {
  speed: new Fraction(1),
  prod: new Fraction(1),
};
export const RecipeFactors: Entities<Factors> = {};
export const RecipeSettingsEntities: Entities<RecipeSettings> = {};
for (const recipe of Data.recipes) {
  RecipeSettingsEntities[recipe.id] = { ...Settings1 };
  RecipeFactors[recipe.id] = Factors1;
}
export const RecipeSettingsInitial = getRecipeSettings.projector(
  {},
  Data,
  initialSettingsState
);
