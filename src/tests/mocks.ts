import { Component } from '@angular/core';

import { data } from 'src/data';
import mod from 'src/data/1.1/data.json';
import hash from 'src/data/1.1/hash.json';
import i18n from 'src/data/1.1/i18n/zh.json';
import * as M from '~/models';
import {
  Datasets,
  Items,
  Machines,
  Objectives,
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
export function getRawDataset(): M.RawDataset {
  Settings.getDataset.release();
  return Settings.getDataset.projector(
    Mod,
    null,
    Hash,
    Defaults,
    M.Game.Factorio,
  );
}
export const RawDataset = getRawDataset();
export const CategoryId = RawDataset.categoryIds[0];
export const Item1 = RawDataset.itemEntities[RawDataset.itemIds[0]];
export const Item2 = RawDataset.itemEntities[RawDataset.itemIds[1]];
export const Recipe1 = RawDataset.recipeEntities[RawDataset.recipeIds[0]];
export const Objective1: M.Objective = {
  id: '0',
  targetId: ItemId.AdvancedCircuit,
  value: '1',
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Output,
};
export const Objective2: M.Objective = {
  id: '1',
  targetId: ItemId.IronPlate,
  value: '1',
  unit: M.ObjectiveUnit.Belts,
  type: M.ObjectiveType.Input,
};
export const Objective3: M.Objective = {
  id: '2',
  targetId: ItemId.PlasticBar,
  value: '1',
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Maximize,
};
export const Objective4: M.Objective = {
  id: '3',
  targetId: ItemId.PetroleumGas,
  value: '100',
  unit: M.ObjectiveUnit.Items,
  type: M.ObjectiveType.Limit,
};
export const Objective5: M.Objective = {
  id: '4',
  targetId: RecipeId.PiercingRoundsMagazine,
  value: '1',
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Output,
};
export const Objective6: M.Objective = {
  id: '5',
  targetId: RecipeId.CopperPlate,
  value: '1',
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Input,
};
export const Objective7: M.Objective = {
  id: '6',
  targetId: RecipeId.FirearmMagazine,
  value: '1',
  unit: M.ObjectiveUnit.Machines,
  type: M.ObjectiveType.Maximize,
};
export const Objective8: M.Objective = {
  id: '7',
  targetId: RecipeId.IronPlate,
  value: '10',
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
export const ObjectivesState: Objectives.ObjectivesState = {
  ids: ObjectivesList.map((o) => o.id),
  entities: M.toEntities(ObjectivesList),
  index: ObjectivesList.length + 1,
};
export const ObjectiveIds = ObjectivesList.map((p) => p.id);
export const ObjectiveSteps = {
  [Objective1.id]: <[string, M.Rational][]>[],
  [Objective2.id]: <[string, M.Rational][]>[],
  [Objective3.id]: <[string, M.Rational][]>[
    [ItemId.PetroleumGas, M.Rational.one],
  ],
  [Objective4.id]: <[string, M.Rational][]>[
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
  items: M.Rational.fromString(Objective1.value),
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
  items: M.Rational.fromString(Objective2.value),
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
for (const item of RawDataset.itemIds.map((i) => RawDataset.itemEntities[i])) {
  ItemsState[item.id] = { ...ItemSettings1 };
}
export const RecipesState: M.Entities<M.RecipeSettings> = {};
for (const recipe of RawDataset.recipeIds.map(
  (i) => RawDataset.recipeEntities[i],
)) {
  RecipesState[recipe.id] = { ...RecipeSettings1 };
}
export const SettingsStateInitial = Settings.getSettings.projector(
  Settings.initialSettingsState,
  Defaults,
);
export const ItemsStateInitial = Items.getItemsState.projector({}, RawDataset, {
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
  RawDataset,
);
export function getRecipesState(): M.Entities<M.RecipeSettings> {
  Recipes.getRecipesState.release();
  return Recipes.getRecipesState.projector(
    {},
    MachinesStateInitial,
    RawDataset,
  );
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
  Settings.initialSettingsState.costs,
);
export function getDataset(): M.Dataset {
  Recipes.getAdjustedDataset.release();
  return Recipes.getAdjustedDataset.projector(
    RecipesStateRationalInitial,
    [],
    ItemsStateInitial,
    CostRational,
    {
      netProductionOnly: false,
      proliferatorSprayId: ItemId.Module,
      miningBonus: M.Rational.zero,
      researchSpeed: M.Rational.one,
      recipeIds: RawDataset.recipeIds,
      data: getRawDataset(),
    },
  );
}
export const Dataset = getDataset();
export const RationalObjectives = ObjectivesList.map(
  (o) =>
    new M.ObjectiveRational(
      o,
      M.isRecipeObjective(o) ? Dataset.recipeR[o.targetId] : undefined,
    ),
);
export const RationalObjective = RationalObjectives[0];
export const PreferencesState: Preferences.PreferencesState = {
  states: {
    [M.Game.Factorio]: { ['name']: 'z=zip' },
    [M.Game.DysonSphereProgram]: {},
    [M.Game.Satisfactory]: {},
    [M.Game.CaptainOfIndustry]: {},
  },
  columns: M.initialColumnsState,
  rows: 50,
  powerUnit: M.PowerUnit.Auto,
  language: M.Language.English,
  theme: M.Theme.Dark,
  bypassLanding: false,
  showTechLabels: false,
  hideDuplicateIcons: false,
  paused: false,
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
  miningBonus: M.Rational.zero,
  researchSpeed: M.Rational.one,
  recipeIds: RawDataset.recipeIds,
  data: RawDataset,
};
export const DisplayRateInfo = M.displayRateInfo[M.DisplayRate.PerMinute];

@Component({ standalone: true, template: '' })
export class MockComponent {}
