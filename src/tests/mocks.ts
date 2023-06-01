import { data } from 'src/data';
import mod from 'src/data/1.1/data.json';
import hash from 'src/data/1.1/hash.json';
import i18n from 'src/data/1.1/i18n/zh.json';
import * as M from '~/models';
import {
  Datasets,
  ItemObjectives,
  Items,
  Machines,
  Preferences,
  RecipeObjectives,
  Recipes,
  Settings,
} from '~/store';
import { ItemId } from './item-id';
import { RecipeId } from './recipe-id';

export const Raw = data;
export const DataState = Datasets.initialDatasetsState;
export const ModInfo = data.mods[0];
export const Data = mod as unknown as M.ModData;
export const Hash: M.ModHash = hash;
export const I18n: M.ModI18n = i18n;
export const Mod = { ...ModInfo, ...Data } as M.Mod;
export const Defaults = Settings.getDefaults.projector(
  M.Preset.Beacon8,
  Mod
) as M.Defaults;
export function getDataset(): M.Dataset {
  Settings.getDataset.release();
  return Settings.getDataset.projector(
    Mod,
    null,
    Hash,
    Defaults,
    M.Game.Factorio
  );
}
export const Dataset = getDataset();
export const CategoryId = Dataset.categoryIds[0];
export const Item1 = Dataset.itemEntities[Dataset.itemIds[0]];
export const Item2 = Dataset.itemEntities[Dataset.itemIds[1]];
export const Recipe1 = Dataset.recipeEntities[Dataset.recipeIds[0]];
export const ItemObjective1: M.ItemObjective = {
  id: '0',
  itemId: ItemId.AdvancedCircuit,
  rate: '1',
  rateUnit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Output,
};
export const ItemObjective2: M.ItemObjective = {
  id: '1',
  itemId: ItemId.IronPlate,
  rate: '1',
  rateUnit: M.ObjectiveUnit.Belts,
  type: M.ObjectiveType.Input,
};
export const ItemObjective3: M.ItemObjective = {
  id: '2',
  itemId: ItemId.PlasticBar,
  rate: '1',
  rateUnit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Maximize,
};
export const ItemObjective4: M.ItemObjective = {
  id: '3',
  itemId: ItemId.PetroleumGas,
  rate: '100',
  rateUnit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Limit,
};
export const ItemObjectivesList = [
  ItemObjective1,
  ItemObjective2,
  ItemObjective3,
  ItemObjective4,
];
export const ItemObjectivesState: ItemObjectives.ItemObjectivesState = {
  ids: ItemObjectivesList.map((o) => o.id),
  entities: M.toEntities(ItemObjectivesList),
  index: ItemObjectivesList.length + 1,
};
export const RationalItemObjectives = ItemObjectivesList.map(
  (o) => new M.ItemObjectiveRational(o)
);
export const RationalItemObjective = RationalItemObjectives[0];
export const RecipeObjective1: M.RecipeObjective = {
  id: '0',
  recipeId: RecipeId.PiercingRoundsMagazine,
  count: '1',
  type: M.ObjectiveType.Output,
};
export const RecipeObjective2: M.RecipeObjective = {
  id: '1',
  recipeId: RecipeId.CopperPlate,
  count: '1',
  type: M.ObjectiveType.Input,
};
export const RecipeObjective3: M.RecipeObjective = {
  id: '2',
  recipeId: RecipeId.FirearmMagazine,
  count: '1',
  type: M.ObjectiveType.Maximize,
};
export const RecipeObjective4: M.RecipeObjective = {
  id: '3',
  recipeId: RecipeId.IronPlate,
  count: '10',
  type: M.ObjectiveType.Limit,
};
export const RecipeObjectivesList = [
  RecipeObjective1,
  RecipeObjective2,
  RecipeObjective3,
  RecipeObjective4,
];
export const RecipeObjectivesState: RecipeObjectives.RecipeObjectivesState = {
  ids: RecipeObjectivesList.map((o) => o.id),
  entities: M.toEntities(RecipeObjectivesList),
  index: RecipeObjectivesList.length + 1,
};
export const RationalRecipeObjectives = RecipeObjectivesList.map(
  (o) => new M.RecipeObjectiveRational(o, Dataset.recipeR[o.recipeId])
);
export const RationalRecipeObjective = RationalRecipeObjectives[0];
export const ItemObjectiveIds = ItemObjectivesList.map((p) => p.id);
export const ItemObjectivesteps = {
  [ItemObjective1.id]: <[string, M.Rational][]>[],
  [ItemObjective2.id]: <[string, M.Rational][]>[],
  [ItemObjective3.id]: <[string, M.Rational][]>[
    [ItemId.PetroleumGas, M.Rational.one],
  ],
  [ItemObjective4.id]: <[string, M.Rational][]>[
    [RecipeId.TransportBelt, M.Rational.one],
  ],
};
export const ItemSettings1: M.ItemSettings = {
  excluded: false,
  beltId: ItemId.TransportBelt,
  wagonId: ItemId.CargoWagon,
};
export const RecipeSettings1: M.RecipeSettings = {
  machineId: ItemId.AssemblingMachine2,
  machineModuleIds: [ItemId.Module, ItemId.Module],
  beacons: [
    {
      id: ItemId.Beacon,
      moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
      count: '0',
    },
  ],
};
export const RecipeSettings2: M.RecipeSettings = {
  machineId: ItemId.AssemblingMachine2,
  machineModuleIds: [ItemId.Module, ItemId.Module],
  beacons: [
    {
      id: ItemId.Beacon,
      moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
      count: '0',
    },
  ],
};
export const Step1: M.Step = {
  id: `${Item1.id}.${Item1.id}`,
  itemId: Item1.id,
  recipeId: Item1.id,
  items: M.Rational.fromString(ItemObjective1.rate),
  belts: M.Rational.fromNumber(0.5),
  wagons: M.Rational.two,
  machines: M.Rational.one,
  power: M.Rational.one,
  pollution: M.Rational.one,
};
export const Step2: M.Step = {
  id: `${Item2.id}.${Item2.id}`,
  itemId: Item2.id,
  recipeId: Item2.id,
  items: M.Rational.fromString(ItemObjective2.rate),
  belts: M.Rational.one,
  wagons: M.Rational.one,
  machines: M.Rational.two,
  power: M.Rational.zero,
  pollution: M.Rational.zero,
};
export const Steps = [Step1, Step2];
export const BeltSpeed: M.Entities<M.Rational> = {
  [ItemId.TransportBelt]: new M.Rational(BigInt(15)),
  [ItemId.Pipe]: new M.Rational(BigInt(1500)),
};
export const ItemsState: M.Entities<M.ItemSettings> = {};
for (const item of Dataset.itemIds.map((i) => Dataset.itemEntities[i])) {
  ItemsState[item.id] = { ...ItemSettings1 };
}
export const RecipesState: M.Entities<M.RecipeSettings> = {};
for (const recipe of Dataset.recipeIds.map((i) => Dataset.recipeEntities[i])) {
  RecipesState[recipe.id] = { ...RecipeSettings1 };
}
export const SettingsStateInitial = Settings.getSettings.projector(
  Settings.initialSettingsState,
  Defaults
);
export const ItemsStateInitial = Items.getItemsState.projector({}, Dataset, {
  ...Settings.initialSettingsState,
  ...{
    beltId: ItemId.TransportBelt,
    pipeId: ItemId.Pipe,
    fuelId: ItemId.Coal,
    cargoWagonId: ItemId.CargoWagon,
    fluidWagonId: ItemId.FluidWagon,
    excludedRecipeIds: [],
  },
});
export const MachinesStateInitial = Machines.getMachinesState.projector(
  Machines.initialMachinesState,
  Defaults,
  Dataset
);
export function getRecipesState(): M.Entities<M.RecipeSettings> {
  Recipes.getRecipesState.release();
  return Recipes.getRecipesState.projector({}, MachinesStateInitial, Dataset);
}
export const RecipesStateInitial = getRecipesState();
export const RecipesStateRational =
  Recipes.getRecipesStateRational.projector(RecipesState);
export function getRecipesStateRational(): M.Entities<M.RecipeSettingsRational> {
  Recipes.getRecipesStateRational.release();
  return Recipes.getRecipesStateRational.projector(RecipesStateInitial);
}
export const RecipesStateRationalInitial = getRecipesStateRational();
export const CostRational = Settings.getRationalCost.projector(
  Settings.initialSettingsState.costs
);
export const AdjustedData = Recipes.getAdjustedDataset.projector(
  RecipesStateRationalInitial,
  ItemsStateInitial,
  CostRational,
  {
    netProductionOnly: false,
    proliferatorSprayId: ItemId.Module,
    fuelId: ItemId.Coal,
    miningBonus: M.Rational.zero,
    researchSpeed: M.Rational.one,
    data: Dataset,
  }
);
export const PreferencesState: Preferences.PreferencesState = {
  states: { ['name']: 'z=zip' },
  columns: M.initialColumnsState,
  powerUnit: M.PowerUnit.Auto,
  language: M.Language.English,
  theme: M.Theme.Dark,
  bypassLanding: false,
};
export const MatrixResultSolved: M.MatrixResult = {
  steps: Steps,
  resultType: M.MatrixResultType.Solved,
  time: 20,
};
export const Flow: M.FlowData = {
  theme: M.themeMap[M.Theme.Light],
  nodes: [
    {
      name: 'a-name',
      text: 'a-text',
      id: 'a',
      type: M.NodeType.Recipe,
    },
    {
      name: 'b-name',
      text: 'b-text',
      id: 'b',
      type: M.NodeType.Recipe,
      recipe: Data.recipes[0],
      machines: '1',
      machineId: 'machineId',
    },
  ],
  links: [
    {
      name: 'a-b',
      text: 'a-b-text',
      source: 'a',
      target: 'b',
    },
    {
      name: 'b-b',
      text: 'b-b-text',
      source: 'b',
      target: 'b',
    },
  ],
};
export const SimplexModifiers = {
  costInput: M.Rational.from(1000000),
  costExcluded: M.Rational.zero,
};
export const AdjustmentData = {
  netProductionOnly: false,
  proliferatorSprayId: ItemId.Module,
  fuelId: ItemId.Coal,
  miningBonus: M.Rational.zero,
  researchSpeed: M.Rational.one,
  costFactor: M.Rational.one,
  costMachine: M.Rational.one,
  data: Dataset,
};
export const DisplayRateInfo = M.displayRateInfo[M.DisplayRate.PerMinute];
