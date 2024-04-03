import { Component } from '@angular/core';

import { data } from 'src/data';
import mod from 'src/data/1.1/data.json';
import hash from 'src/data/1.1/hash.json';
import i18n from 'src/data/1.1/i18n/zh.json';
import * as M from '~/models';
import * as S from '~/services';
import {
  Datasets,
  Items,
  Machines,
  Objectives as O,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { ItemId } from './item-id';
import { RecipeId } from './recipe-id';

export const Raw = data;
export const DataState = Datasets.initialDatasetsState;
export const ModInfo = data.mods[0];
export const Data = mod as unknown as M.ModData;
Data.defaults!.excludedRecipes = [RecipeId.NuclearFuelReprocessing];
export const Hash: M.ModHash = hash;
export const I18n: M.ModI18n = i18n;
export const Mod = { ...ModInfo, ...Data } as M.Mod;
export const Defaults = Settings.getDefaults.projector(
  M.Preset.Beacon8,
  Mod,
) as M.Defaults;
export function getDataset(): M.Dataset {
  Settings.getDataset.release();
  return Settings.getDataset.projector(
    Mod,
    null,
    Hash,
    Defaults,
    M.Game.Factorio,
  );
}
export const Dataset = getDataset();
export const CategoryId = Dataset.categoryIds[0];
export const Item1 = Dataset.itemEntities[Dataset.itemIds[0]];
export const Item2 = Dataset.itemEntities[Dataset.itemIds[1]];
export const Recipe1 = Dataset.recipeEntities[Dataset.recipeIds[0]];
export const Objective1: M.Objective = {
  id: '0',
  targetId: ItemId.AdvancedCircuit,
  value: M.rational(1n),
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Output,
};
export const Objective2: M.Objective = {
  id: '1',
  targetId: ItemId.IronPlate,
  value: M.rational(1n),
  unit: M.ObjectiveUnit.Belts,
  type: M.ObjectiveType.Input,
};
export const Objective3: M.Objective = {
  id: '2',
  targetId: ItemId.PlasticBar,
  value: M.rational(1n),
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Maximize,
};
export const Objective4: M.Objective = {
  id: '3',
  targetId: ItemId.PetroleumGas,
  value: M.rational(100n),
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Limit,
};
export const Objective5: M.Objective = {
  id: '4',
  targetId: RecipeId.PiercingRoundsMagazine,
  value: M.rational(1n),
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Output,
};
export const Objective6: M.Objective = {
  id: '5',
  targetId: RecipeId.CopperPlate,
  value: M.rational(1n),
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Input,
};
export const Objective7: M.Objective = {
  id: '6',
  targetId: RecipeId.FirearmMagazine,
  value: M.rational(1n),
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Maximize,
};
export const Objective8: M.Objective = {
  id: '7',
  targetId: RecipeId.IronPlate,
  value: M.rational(10n),
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Limit,
};
export const ObjectivesList = [
  Objective1,
  Objective2,
  Objective3,
  Objective4,
  Objective5,
  Objective6,
  Objective7,
  Objective8,
];
export const ObjectivesState: O.ObjectivesState = {
  ids: ObjectivesList.map((o) => o.id),
  entities: M.toEntities(ObjectivesList),
  index: ObjectivesList.length + 1,
};
export const ObjectiveIds = ObjectivesList.map((p) => p.id);
export const ObjectiveSteps = {
  [Objective1.id]: <[string, M.Rational][]>[],
  [Objective2.id]: <[string, M.Rational][]>[],
  [Objective3.id]: <[string, M.Rational][]>[
    [ItemId.PetroleumGas, M.rational(1n)],
  ],
  [Objective4.id]: <[string, M.Rational][]>[
    [RecipeId.TransportBelt, M.rational(1n)],
  ],
};
export const ItemSettings1: M.ItemSettings = {
  excluded: false,
  beltId: ItemId.TransportBelt,
  wagonId: ItemId.CargoWagon,
};
export const RecipeSettings1: M.RecipeSettings = {
  machineId: ItemId.AssemblingMachine2,
  moduleIds: [ItemId.Module, ItemId.Module],
  beacons: [
    {
      id: ItemId.Beacon,
      moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
      count: M.rational(0n),
    },
  ],
};
export const RecipeSettings2: M.RecipeSettings = {
  machineId: ItemId.AssemblingMachine2,
  moduleIds: [ItemId.Module, ItemId.Module],
  beacons: [
    {
      id: ItemId.Beacon,
      moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
      count: M.rational(0n),
    },
  ],
};
export const Step1: M.Step = {
  id: `${Item1.id}.${Item1.id}`,
  itemId: Item1.id,
  recipeId: Item1.id,
  items: Objective1.value,
  belts: M.rational(1n, 2n),
  wagons: M.rational(2n),
  machines: M.rational(1n),
  power: M.rational(1n),
  pollution: M.rational(1n),
};
export const Step2: M.Step = {
  id: `${Item2.id}.${Item2.id}`,
  itemId: Item2.id,
  recipeId: Item2.id,
  items: Objective2.value,
  belts: M.rational(1n),
  wagons: M.rational(1n),
  machines: M.rational(2n),
  power: M.rational(0n),
  pollution: M.rational(0n),
};
export const Steps = [Step1, Step2];
export const BeltSpeed: M.Entities<M.Rational> = {
  [ItemId.TransportBelt]: M.rational(15n),
  [ItemId.Pipe]: M.rational(1500n),
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
  Defaults,
);
export const ItemsStateInitial = Items.getItemsState.projector({}, Dataset, {
  ...Settings.initialSettingsState,
  ...{
    beltId: ItemId.TransportBelt,
    pipeId: ItemId.Pipe,
    fuelRankIds: [ItemId.Coal],
    cargoWagonId: ItemId.CargoWagon,
    fluidWagonId: ItemId.FluidWagon,
    excludedRecipeIds: [],
  },
});
export const MachinesStateInitial = Machines.getMachinesState.projector(
  Machines.initialMachinesState,
  [ItemId.Coal],
  Defaults,
  Dataset,
);
export function getRecipesState(): M.Entities<M.RecipeSettings> {
  Recipes.getRecipesState.release();
  return Recipes.getRecipesState.projector({}, MachinesStateInitial, Dataset);
}
export const RecipesStateInitial = getRecipesState();
export const Costs = Settings.initialSettingsState.costs;
export function getAdjustedDataset(): M.AdjustedDataset {
  Recipes.getAdjustedDataset.release();
  return Recipes.getAdjustedDataset.projector(
    RecipesStateInitial,
    [],
    ItemsStateInitial,
    Dataset.recipeIds,
    Costs,
    {
      netProductionOnly: false,
      proliferatorSprayId: ItemId.Module,
      miningBonus: M.rational(0n),
      researchBonus: M.rational(1n),
    },
    getDataset(),
  );
}
export const AdjustedDataset = getAdjustedDataset();
export const Objectives = ObjectivesList.map((o) => ({
  ...o,
  ...{
    recipe: M.isRecipeObjective(o)
      ? AdjustedDataset.adjustedRecipe[o.targetId]
      : undefined,
  },
}));
export const Objective = Objectives[0];
export const PreferencesState: Preferences.PreferencesState = {
  states: {
    [M.Game.Factorio]: { ['name']: 'z=zip' },
    [M.Game.DysonSphereProgram]: {},
    [M.Game.Satisfactory]: {},
    [M.Game.CaptainOfIndustry]: {},
    [M.Game.Techtonica]: {},
    [M.Game.FinalFactory]: {},
  },
  columns: M.initialColumnsState,
  rows: 50,
  disablePaginator: false,
  powerUnit: M.PowerUnit.Auto,
  language: M.Language.English,
  theme: M.Theme.Dark,
  bypassLanding: false,
  showTechLabels: false,
  hideDuplicateIcons: false,
  paused: false,
  flowDiagram: M.FlowDiagram.Sankey,
  linkSize: M.LinkValue.Items,
  linkText: M.LinkValue.Items,
  sankeyAlign: M.SankeyAlign.Justify,
  flowHideExcluded: true,
};
export const MatrixResultSolved: M.MatrixResult = {
  steps: Steps,
  resultType: M.SimplexResultType.Solved,
  time: 20,
};

const node = (id: string, override?: Partial<M.Node>): M.Node => {
  let result = {
    name: id,
    text: id,
    color: 'black',
    id,
    stepId: id,
    viewBox: '',
    href: '',
  };

  if (override) {
    result = { ...result, ...override };
  }

  return result;
};

const link = (source: string, target: string): M.Link => {
  const name = `${source}-${target}`;
  return {
    name,
    text: name,
    color: 'black',
    source,
    target,
    value: 1,
  };
};

export const getFlow = (): M.FlowData => ({
  nodes: [
    node('r|0'),
    node('r|1'),
    node('r|2', {
      machines: '1',
      machineId: 'machineId',
      recipe: AdjustedDataset.recipeEntities[AdjustedDataset.recipeIds[0]],
    }),
    node('o|3'),
    node('s|4'),
  ],
  links: [
    link('r|0', 'r|2'),
    link('r|1', 'r|2'),
    link('r|2', 'r|2'),
    link('r|2', 'o|3'),
    link('r|2', 's|4'),
  ],
});
export const Flow = getFlow();
export const SimplexModifiers = {
  costInput: M.rational(1000000n),
  costExcluded: M.rational(0n),
};
export const AdjustmentData: M.AdjustmentData = {
  netProductionOnly: false,
  proliferatorSprayId: ItemId.Module,
  miningBonus: M.rational(0n),
  researchBonus: M.rational(1n),
};
export const DisplayRateInfo = M.displayRateInfo[M.DisplayRate.PerMinute];

export const LightOilSteps: M.Step[] = [
  {
    id: '0',
    itemId: ItemId.LightOil,
    items: M.rational(60n),
    output: M.rational(60n),
    machines: M.rational(1n, 51n),
    recipeId: RecipeId.HeavyOilCracking,
    recipeSettings: RecipesStateInitial[RecipeId.HeavyOilCracking],
    parents: {
      '': M.rational(1n),
    },
    outputs: { [ItemId.LightOil]: M.rational(5n, 17n) },
  },
  {
    id: '3',
    itemId: ItemId.HeavyOil,
    items: M.rational(4000n, 17n),
    machines: M.rational(4n, 51n),
    recipeId: RecipeId.AdvancedOilProcessing,
    recipeSettings: RecipesStateInitial[RecipeId.AdvancedOilProcessing],
    parents: { '0': M.rational(1n) },
    outputs: {
      [ItemId.HeavyOil]: M.rational(1n),
      [ItemId.LightOil]: M.rational(12n, 17n),
      [ItemId.PetroleumGas]: M.rational(1n),
    },
  },
  {
    id: '2',
    itemId: ItemId.CrudeOil,
    items: M.rational(1600n, 17n),
    machines: M.rational(8n, 51n),
    recipeId: RecipeId.CrudeOil,
    recipeSettings: RecipesStateInitial[RecipeId.CrudeOil],
    parents: { '3': M.rational(1n) },
    outputs: { [ItemId.CrudeOil]: M.rational(1n) },
  },
  {
    id: '4',
    itemId: ItemId.PetroleumGas,
    items: M.rational(880n, 17n),
    surplus: M.rational(880n, 17n),
  },
  {
    id: '1',
    itemId: ItemId.Water,
    items: M.rational(1100n, 17n),
    machines: M.rational(11n, 12240n),
    recipeId: RecipeId.Water,
    recipeSettings: RecipesStateInitial[RecipeId.Water],
    outputs: { [ItemId.Water]: M.rational(1n) },
    parents: {
      '0': M.rational(3n, 11n),
      '1': M.rational(8n, 11n),
    },
  },
];

export const ThemeValues: S.ThemeValues = {
  textColor: 'white',
  successColor: 'black',
  successBackground: 'green',
  dangerColor: 'black',
  dangerBackground: 'red',
};

@Component({ standalone: true, template: '' })
export class MockComponent {}
