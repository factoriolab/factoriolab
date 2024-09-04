import { Component } from '@angular/core';

import { data } from 'src/data';
import mod from 'src/data/1.1/data.json';
import hash from 'src/data/1.1/hash.json';
import i18n from 'src/data/1.1/i18n/zh.json';
import { spread } from '~/helpers';
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
export const DataState = Datasets.initialState;
export const ModInfo = data.mods[0];
export const Data = mod as unknown as M.ModData;
Data.defaults!.excludedRecipes = [RecipeId.NuclearFuelReprocessing];
export const Hash: M.ModHash = hash;
export const I18n: M.ModI18n = i18n;
export const Mod = { ...ModInfo, ...Data } as M.Mod;
export const Defaults = Settings.selectDefaults.projector(
  M.Preset.Beacon8,
  Mod,
) as M.Defaults;
export function getDataset(): M.Dataset {
  Settings.selectDataset.release();
  return Settings.selectDataset.projector(
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
  value: M.rational.one,
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Output,
};
export const Objective2: M.Objective = {
  id: '1',
  targetId: ItemId.IronPlate,
  value: M.rational.one,
  unit: M.ObjectiveUnit.Belts,
  type: M.ObjectiveType.Input,
};
export const Objective3: M.Objective = {
  id: '2',
  targetId: ItemId.PlasticBar,
  value: M.rational.one,
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
  value: M.rational.one,
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Output,
};
export const Objective6: M.Objective = {
  id: '5',
  targetId: RecipeId.CopperPlate,
  value: M.rational.one,
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Input,
};
export const Objective7: M.Objective = {
  id: '6',
  targetId: RecipeId.FirearmMagazine,
  value: M.rational.one,
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
    [ItemId.PetroleumGas, M.rational.one],
  ],
  [Objective4.id]: <[string, M.Rational][]>[
    [RecipeId.TransportBelt, M.rational.one],
  ],
};
export const ItemSettings1: M.ItemSettings = {
  beltId: ItemId.TransportBelt,
  wagonId: ItemId.CargoWagon,
};
export const RecipeSettings1: M.RecipeSettings = {
  machineId: ItemId.AssemblingMachine2,
  modules: [{ count: M.rational(2n), id: ItemId.Module }],
  beacons: [
    {
      count: M.rational.zero,
      id: ItemId.Beacon,
      modules: [{ count: M.rational(2n), id: ItemId.SpeedModule }],
    },
  ],
};
export const RecipeSettings2: M.RecipeSettings = {
  machineId: ItemId.AssemblingMachine2,
  modules: [{ count: M.rational(2n), id: ItemId.Module }],
  beacons: [
    {
      count: M.rational.zero,
      id: ItemId.Beacon,
      modules: [{ count: M.rational(2n), id: ItemId.SpeedModule }],
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
  machines: M.rational.one,
  power: M.rational.one,
  pollution: M.rational.one,
};
export const Step2: M.Step = {
  id: `${Item2.id}.${Item2.id}`,
  itemId: Item2.id,
  recipeId: Item2.id,
  items: Objective2.value,
  belts: M.rational.one,
  wagons: M.rational.one,
  machines: M.rational(2n),
  power: M.rational.zero,
  pollution: M.rational.zero,
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
export const SettingsStateInitial = Settings.selectSettings.projector(
  Settings.initialState,
  Defaults,
  new Set(Dataset.technologyIds),
);
export const ItemsStateInitial = Items.selectItemsState.projector(
  {},
  Dataset,
  SettingsStateInitial,
);
export const MachinesStateInitial = Machines.selectMachinesState.projector(
  Machines.initialState,
  SettingsStateInitial,
  Dataset,
);
export function getRecipesState(): M.Entities<M.RecipeSettings> {
  Recipes.selectRecipesState.release();
  return Recipes.selectRecipesState.projector(
    {},
    MachinesStateInitial,
    SettingsStateInitial,
    Dataset,
  );
}
export const RecipesStateInitial = getRecipesState();
export const Costs = Settings.initialState.costs;
export function getAdjustedDataset(): M.AdjustedDataset {
  Recipes.selectAdjustedDataset.release();
  return Recipes.selectAdjustedDataset.projector(
    RecipesStateInitial,
    ItemsStateInitial,
    Dataset.recipeIds,
    SettingsStateInitial,
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
export const FlowSettings: M.FlowSettings = {
  diagram: M.FlowDiagram.Sankey,
  linkSize: M.LinkValue.Items,
  linkText: M.LinkValue.Items,
  sankeyAlign: M.SankeyAlign.Justify,
  hideExcluded: true,
};
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
  convertObjectiveValues: false,
  flowSettings: FlowSettings,
};
export const MatrixResultSolved: M.MatrixResult = {
  steps: Steps,
  resultType: M.SimplexResultType.Solved,
  time: 20,
};

const node = (
  id: string,
  includeHref: boolean,
  override?: Partial<M.Node>,
): M.Node => {
  const result = {
    name: id,
    text: id,
    color: 'black',
    id,
    stepId: id,
    posX: '0',
    posY: '0',
    viewBox: '0 0 64 64',
    href: includeHref ? 'data/1.1/icons.png' : '',
  };

  if (override) return spread(result, override);
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

export const getFlow = (includeHref = false): M.FlowData => ({
  nodes: [
    node('r|0', includeHref),
    node('r|1', includeHref),
    node('r|2', includeHref, {
      machines: '1',
      machineId: 'machineId',
      recipe: AdjustedDataset.recipeEntities[AdjustedDataset.recipeIds[0]],
    }),
    node('o|3', includeHref),
    node('s|4', includeHref),
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
  costExcluded: M.rational.zero,
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
      '': M.rational.one,
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
    parents: { '0': M.rational.one },
    outputs: {
      [ItemId.HeavyOil]: M.rational.one,
      [ItemId.LightOil]: M.rational(12n, 17n),
      [ItemId.PetroleumGas]: M.rational.one,
    },
  },
  {
    id: '2',
    itemId: ItemId.CrudeOil,
    items: M.rational(1600n, 17n),
    machines: M.rational(8n, 51n),
    recipeId: RecipeId.CrudeOil,
    recipeSettings: RecipesStateInitial[RecipeId.CrudeOil],
    parents: { '3': M.rational.one },
    outputs: { [ItemId.CrudeOil]: M.rational.one },
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
    outputs: { [ItemId.Water]: M.rational.one },
    parents: {
      '0': M.rational(3n, 11n),
      '1': M.rational(8n, 11n),
    },
  },
];

export const ModuleSettings: M.ModuleSettings[] = [
  {
    id: ItemId.ProductivityModule3,
    count: M.rational(3n),
  },
  {
    id: ItemId.Module,
    count: M.rational.one,
  },
];

export const BeaconSettings: M.BeaconSettings[] = [
  {
    count: M.rational(8n),
    id: ItemId.Beacon,
    modules: [{ id: ItemId.SpeedModule3, count: M.rational(2n) }],
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
