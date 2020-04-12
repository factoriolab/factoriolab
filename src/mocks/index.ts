import Fraction from 'fraction.js';

import * as data from 'src/assets/0-18.json';
import {
  Product,
  RateType,
  Step,
  RecipeSettings,
  Entities,
  ItemId,
} from '~/models';
import {
  DatasetState,
  datasetReducer,
  LoadDatasetAction,
} from '~/store/dataset';

export const Data: DatasetState = datasetReducer(
  undefined,
  new LoadDatasetAction((data as any).default)
);
export const CategoryId = Data.categories[0].id;
export const Item1 = Data.items[0];
export const Item2 = Data.items[1];
export const Product1: Product = {
  id: 0,
  itemId: Item1.id,
  rate: new Fraction(1),
  rateType: RateType.Items,
};
export const Product2: Product = {
  id: 1,
  itemId: Item2.id,
  rate: new Fraction(2),
  rateType: RateType.Lanes,
};
export const Products = [Product1, Product2];
export const Settings: RecipeSettings = {
  ignore: false,
  lane: ItemId.TransportBelt,
  factory: ItemId.AssemblingMachine2,
  modules: [ItemId.Module, ItemId.Module],
  beaconType: ItemId.Module,
  beaconCount: 0,
};
export const Step1: Step = {
  itemId: Item1.id,
  items: Product1.rate,
  lanes: new Fraction(0.5),
  factories: new Fraction(1),
  settings: Settings,
};
export const Step2: Step = {
  itemId: Item2.id,
  items: Product2.rate,
  lanes: new Fraction(1),
  factories: new Fraction(2),
  settings: Settings,
};
export const Steps = [Step1, Step2];
export const BeltSpeed: Entities<Fraction> = {
  [ItemId.TransportBelt]: new Fraction(15),
};
export const RecipeFactors: Entities<[Fraction, Fraction]> = {};
export const RecipeSettingsEntities: Entities<RecipeSettings> = {};
for (const item of Data.items) {
  RecipeSettingsEntities[item.id] = Settings;
  RecipeFactors[item.id] = [new Fraction(1), new Fraction(1)];
}
