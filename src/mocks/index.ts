import * as data from 'src/assets/0.18/data.json';
import {
  Product,
  RateType,
  Step,
  RecipeSettings,
  Entities,
  ItemId,
  Factors,
  Node,
  Rational,
  Dataset,
  RationalProduct,
} from '~/models';
import {
  DatasetState,
  datasetReducer,
  LoadDatasetAction,
  getRationalDataset,
} from '~/store/dataset';
import { getProductsBy } from '~/store/products';
import { getRecipeSettings } from '~/store/recipe';
import { initialSettingsState } from '~/store/settings';

export const Raw: Dataset = (data as any).default;
export const Data: DatasetState = datasetReducer(
  undefined,
  new LoadDatasetAction(Raw)
);
export const RationalData = getRationalDataset.projector(Data);
export const CategoryId = Data.categoryEntities[Data.categoryIds[0]].id;
export const Item1 = Data.itemEntities[Data.itemIds[0]];
export const Item2 = Data.itemEntities[Data.itemIds[1]];
export const Recipe1 = Data.recipeEntities[Data.recipeIds[0]];
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
export const RationalProducts = Products.map((p) => new RationalProduct(p));
export const ProductIds = Products.map((p) => p.id);
export const ProductEntities = getProductsBy.projector(RationalProducts);
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
  items: Rational.fromNumber(Product1.rate),
  belts: Rational.fromNumber(0.5),
  factories: Rational.one,
  settings: Settings1,
};
export const Step2: Step = {
  itemId: Item2.id,
  recipeId: Item2.id as any,
  items: Rational.fromNumber(Product2.rate),
  belts: Rational.one,
  factories: Rational.two,
  settings: Settings2,
};
export const Steps = [Step1, Step2];
export const Node1: Node = { ...Step1, ...{ id: 'id1', name: 'name1' } };
export const Node2: Node = {
  ...Step1,
  ...{ id: 'id2', name: Array(1000).join('X'), children: [Node1] },
};
export const Node3 = { ...Step1, ...{ id: 'id3', name: 'name3' } };
export const Root: Node = { id: 'root', children: [Node2, Node3] } as any;
export const BeltSpeed: Entities<Rational> = {
  [ItemId.TransportBelt]: new Rational(BigInt(15)),
};
export const Factors1: Factors = {
  speed: Rational.one,
  prod: Rational.one,
};
export const RecipeFactors: Entities<Factors> = {};
export const RecipeSettingsEntities: Entities<RecipeSettings> = {};
for (const recipe of Data.recipeIds.map((i) => Data.recipeEntities[i])) {
  RecipeSettingsEntities[recipe.id] = { ...Settings1 };
  RecipeFactors[recipe.id] = Factors1;
}
export const RecipeSettingsInitial = getRecipeSettings.projector(
  {},
  Data,
  initialSettingsState
);
