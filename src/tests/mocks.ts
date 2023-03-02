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
  itemId: Item1.id,
  rate: '1',
  rateType: M.AmountType.Items,
};
export const ItemObjective2: M.ItemObjective = {
  id: '1',
  itemId: Item2.id,
  rate: '2',
  rateType: M.AmountType.Belts,
};
export const ItemObjective3: M.ItemObjective = {
  id: '2',
  itemId: ItemId.PetroleumGas,
  rate: '3',
  rateType: M.AmountType.Wagons,
};
export const ItemObjective4: M.ItemObjective = {
  id: '3',
  itemId: ItemId.TransportBelt,
  rate: '4',
  rateType: M.AmountType.Items,
};
export const ItemObjectivesList = [
  ItemObjective1,
  ItemObjective2,
  ItemObjective3,
  ItemObjective4,
];
export const ItemObjectivesState: ItemObjectives.ItemObjectivesState = {
  ids: ItemObjectivesList.map((p) => p.id),
  entities: M.toEntities(ItemObjectivesList),
  index: ItemObjectivesList.length + 1,
};
export const RationalItemObjectives = ItemObjectivesList.map((p) => {
  const rp = new M.RationalItemObjective(p);
  return rp;
});
export const RationalItemObjective = RationalItemObjectives[0];
export const RecipeObjective: M.RecipeObjective = {
  id: '0',
  recipeId: RecipeId.IronPlate,
  count: '1',
};
export const RecipeObjectivesState: RecipeObjectives.RecipeObjectivesState = {
  ids: ['0'],
  entities: { ['0']: RecipeObjective },
  index: 2,
};
export const RationalRecipeObjective = new M.RationalRecipeObjective(
  RecipeObjective,
  Dataset.recipeR[RecipeId.IronPlate]
);
export const ItemObjectiveIds = ItemObjectivesList.map((p) => p.id);
export const ItemObjectiveEntities =
  ItemObjectives.getItemObjectivesBy.projector(RationalItemObjectives);
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
export const ItemSettingsEntities: M.Entities<M.ItemSettings> = {};
for (const item of Dataset.itemIds.map((i) => Dataset.itemEntities[i])) {
  ItemSettingsEntities[item.id] = { ...ItemSettings1 };
}
export const RecipeSettingsEntities: M.Entities<M.RecipeSettings> = {};
for (const recipe of Dataset.recipeIds.map((i) => Dataset.recipeEntities[i])) {
  RecipeSettingsEntities[recipe.id] = { ...RecipeSettings1 };
}
export const SettingsStateInitial = Settings.getSettings.projector(
  Settings.initialSettingsState,
  Defaults
);
export const ItemSettingsInitial = Items.getItemSettings.projector(
  {},
  Dataset,
  {
    ...Settings.initialSettingsState,
    ...{
      beltId: ItemId.TransportBelt,
      pipeId: ItemId.Pipe,
      fuelId: ItemId.Coal,
      cargoWagonId: ItemId.CargoWagon,
      fluidWagonId: ItemId.FluidWagon,
      excludedRecipeIds: [],
    },
  }
);
export const MachineSettingsInitial = Machines.getMachines.projector(
  Machines.initialMachinesState,
  Defaults,
  Dataset
);
export function getRecipeSettings(): M.Entities<M.RecipeSettings> {
  Recipes.getRecipeSettings.release();
  return Recipes.getRecipeSettings.projector(
    {},
    MachineSettingsInitial,
    Dataset
  );
}
export const RecipeSettingsInitial = getRecipeSettings();
export const RationalRecipeSettings =
  Recipes.getRationalRecipeSettings.projector(RecipeSettingsEntities);
export function getRationalRecipeSettings(): M.Entities<M.RationalRecipeSettings> {
  Recipes.getRationalRecipeSettings.release();
  return Recipes.getRationalRecipeSettings.projector(RecipeSettingsInitial);
}
export const RationalRecipeSettingsInitial = getRationalRecipeSettings();
export const AdjustedData = Recipes.getAdjustedDataset.projector(
  RationalRecipeSettingsInitial,
  ItemSettingsInitial,
  {
    netProductionOnly: false,
    proliferatorSprayId: ItemId.Module,
    fuelId: ItemId.Coal,
    miningBonus: M.Rational.zero,
    researchSpeed: M.Rational.one,
    costFactor: M.Rational.one,
    costMachine: M.Rational.one,
    data: Dataset,
  }
);
export const PreferencesState: Preferences.PreferencesState = {
  states: { ['name']: 'z=zip' },
  columns: Preferences.initialColumnsState,
  powerUnit: M.PowerUnit.Auto,
  language: M.Language.English,
  theme: M.Theme.Dark,
  bypassLanding: false,
};
export const MatrixResultSolved: M.MatrixResult = {
  steps: Steps,
  resultType: M.MatrixResultType.Solved,
  time: 20,
  itemIds: [ItemId.Wood],
  recipeIds: [RecipeId.WoodenChest],
  inputIds: [],
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
