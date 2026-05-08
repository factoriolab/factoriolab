import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import modJson from '/public/data/1.1/data.json';
import hashJson from '/public/data/1.1/hash.json';
import i18nJson from '/public/data/1.1/i18n/zh.json';
import { datasets } from '~/data/datasets';
import { Item } from '~/data/schema/item';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';
import { ModuleEffect } from '~/data/schema/module';
import { Recipe } from '~/data/schema/recipe';
import { FlowData } from '~/flow/flow-data';
import { Link } from '~/flow/link';
import { Node } from '~/flow/node';
import { Rational, rational } from '~/rational/rational';
import { SimplexResult } from '~/solver/simplex-result';
import { Step } from '~/solver/step';
import { Adjustment } from '~/state/adjustment';
import { BeaconSettings } from '~/state/beacon-settings';
import { ItemSettings } from '~/state/items/item-settings';
import { ItemState } from '~/state/items/item-state';
import { ItemsStore } from '~/state/items/items-store';
import { MachineSettings } from '~/state/machines/machine-settings';
import { MachinesStore } from '~/state/machines/machines-store';
import { ModuleSettings } from '~/state/module-settings';
import {
  isRecipeObjective,
  ObjectiveState,
} from '~/state/objectives/objective';
import { ObjectiveType } from '~/state/objectives/objective-type';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { initialColumnsState } from '~/state/preferences/columns-state';
import { FlowDiagram } from '~/state/preferences/flow-diagram';
import { FlowSettings } from '~/state/preferences/flow-settings';
import { LinkValue } from '~/state/preferences/link-value';
import { PowerUnit } from '~/state/preferences/power-unit';
import { PreferencesState } from '~/state/preferences/preferences-state';
import { SankeyAlign } from '~/state/preferences/sankey-align';
import { RecipeState } from '~/state/recipes/recipe-state';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { AdjustedDataset, Dataset } from '~/state/settings/dataset';
import { Defaults } from '~/state/settings/defaults';
import { DisplayRate, displayRateInfo } from '~/state/settings/display-rate';
import { Preset } from '~/state/settings/preset';
import { Settings } from '~/state/settings/settings';
import { initialSettingsState } from '~/state/settings/settings-state';
import { SettingsStore } from '~/state/settings/settings-store';
import { spread } from '~/utils/object';
import { toRecord } from '~/utils/record';

import { ItemId } from './item-id';
import { RecipeId } from './recipe-id';
import { TestModule } from './test.module';

export const modId = '1.1';
export const raw = datasets;
export const modInfo = datasets.mods.find((m) => m.id === modId)!;
export const modData = modJson as unknown as ModData;
modData.defaults!.excludedRecipes = [RecipeId.NuclearFuelReprocessing];
modData.locations = [{ id: 'id', name: 'Location' }];
export const modHash: ModHash = hashJson;
export const modI18n: ModI18n = i18nJson;
modI18n.locations = { ['id']: 'Translated' };
export let defaults: Defaults;
export let getDataset: () => Dataset;
export let dataset: Dataset;
export let categoryId: string;
export let item1: Item;
export let item2: Item;
export let recipe1: Recipe;
export const objective1: ObjectiveState = {
  id: '1',
  targetId: ItemId.AdvancedCircuit,
  value: rational.one,
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Output,
};
export const objective2: ObjectiveState = {
  id: '2',
  targetId: ItemId.IronPlate,
  value: rational.one,
  unit: ObjectiveUnit.Belts,
  type: ObjectiveType.Input,
};
export const objective3: ObjectiveState = {
  id: '3',
  targetId: ItemId.PlasticBar,
  value: rational.one,
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Maximize,
};
export const objective4: ObjectiveState = {
  id: '4',
  targetId: ItemId.PetroleumGas,
  value: rational(100n),
  unit: ObjectiveUnit.Items,
  type: ObjectiveType.Limit,
};
export const objective5: ObjectiveState = {
  id: '5',
  targetId: RecipeId.PiercingRoundsMagazine,
  value: rational.one,
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Output,
};
export const objective6: ObjectiveState = {
  id: '6',
  targetId: RecipeId.CopperPlate,
  value: rational.one,
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Input,
};
export const objective7: ObjectiveState = {
  id: '7',
  targetId: RecipeId.FirearmMagazine,
  value: rational.one,
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Maximize,
};
export const objective8: ObjectiveState = {
  id: '8',
  targetId: RecipeId.IronPlate,
  value: rational(10n),
  unit: ObjectiveUnit.Machines,
  type: ObjectiveType.Limit,
};
export const objectivesList = [
  objective1,
  objective2,
  objective3,
  objective4,
  objective5,
  objective6,
  objective7,
  objective8,
];
export const objectivesState = toRecord(objectivesList);
export const objectiveIds = objectivesList.map((p) => p.id);
export const objectiveSteps = {
  [objective1.id]: [] as [string, Rational][],
  [objective2.id]: [] as [string, Rational][],
  [objective3.id]: [[ItemId.PetroleumGas, rational.one]] as [
    string,
    Rational,
  ][],
  [objective4.id]: [[RecipeId.TransportBelt, rational.one]] as [
    string,
    Rational,
  ][],
};
export const itemSettings1: ItemState = {
  beltId: ItemId.TransportBelt,
  wagonId: ItemId.CargoWagon,
};
export const recipeSettings1: RecipeState = {
  machineId: ItemId.AssemblingMachine2,
  modules: [{ count: rational(2n), id: ItemId.Module }],
  beacons: [
    {
      count: rational.zero,
      id: ItemId.Beacon,
      modules: [{ count: rational(2n), id: ItemId.SpeedModule }],
    },
  ],
};
export const recipeSettings2: RecipeState = {
  machineId: ItemId.AssemblingMachine2,
  modules: [{ count: rational(2n), id: ItemId.Module }],
  beacons: [
    {
      count: rational.zero,
      id: ItemId.Beacon,
      modules: [{ count: rational(2n), id: ItemId.SpeedModule }],
    },
  ],
};
export let step1: Step;
export let step2: Step;
export let steps: Step[];
export const beltSpeed: Record<string, Rational> = {
  [ItemId.ExpressTransportBelt]: rational(45n),
  [ItemId.TransportBelt]: rational(15n),
  [ItemId.Pipe]: rational(1500n),
};
export let itemsState: Record<string, ItemState>;
export let recipesState: Record<string, RecipeState>;
export const costs = initialSettingsState.costs;
export let settingsStateInitial: Settings;
export let itemsStateInitial: Record<string, ItemSettings>;
export let machinesStateInitial: Record<string, MachineSettings>;
export let getRecipesState: () => Record<string, RecipeState>;
export let recipesStateInitial: Record<string, RecipeState>;
export let getAdjustedDataset: () => AdjustedDataset;
export let adjustedDataset: AdjustedDataset;
export let objectives: ObjectiveState[];
export let objective: ObjectiveState;
export const flowSettings: FlowSettings = {
  diagram: FlowDiagram.Sankey,
  linkSize: LinkValue.Items,
  linkText: LinkValue.Items,
  sankeyAlign: SankeyAlign.Justify,
  hideExcluded: true,
  elkAlgorithm: 'layered',
};
export const preferencesState: PreferencesState = {
  states: {
    [modId]: { ['name']: 'z=zip' },
  },
  columns: initialColumnsState,
  powerUnit: PowerUnit.Auto,
  language: 'en',
  hue: 256,
  theme: 'dark',
  bypassLanding: false,
  showTechLabels: false,
  paused: false,
  convertObjectiveValues: false,
  flowSettings: flowSettings,
  sections: {
    sources: true,
    destinations: true,
    depletion: true,
    inputs: true,
    outputs: true,
  },
};
export let simplexResultSolved: SimplexResult;

const node = (id: string, override?: Partial<Node>): Node => {
  const result = {
    name: id,
    text: id,
    color: 'black',
    id,
    stepId: id,
    icon: dataset.iconRecord.system['module'],
  };

  if (override) return spread(result, override);
  return result;
};

const link = (source: string, target: string): Link => {
  const name = `${source}-${target}`;
  return {
    text: name,
    color: 'black',
    source,
    target,
    value: 1,
  };
};

export const getFlow = (): FlowData => ({
  nodes: [
    node('r|0'),
    node('r|1'),
    node('r|2', {
      machines: '1',
      machineId: 'machineId',
      recipe: adjustedDataset.recipeRecord[adjustedDataset.recipeIds[0]],
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
export let flow: FlowData;
export const drInfo = displayRateInfo[DisplayRate.PerMinute];

export let lightOilSteps: Step[];

export const moduleSettings: ModuleSettings[] = [
  {
    id: ItemId.ProductivityModule3,
    count: rational(3n),
  },
  {
    id: ItemId.Module,
    count: rational.one,
  },
];

export const beaconSettings: BeaconSettings[] = [
  {
    count: rational(8n),
    id: ItemId.Beacon,
    modules: [{ id: ItemId.SpeedModule3, count: rational(2n) }],
  },
];

@Component({ standalone: true, template: '' })
export class MockComponent {}

beforeAll(() => {
  TestBed.configureTestingModule({ imports: [TestModule] });
  const adjustment = TestBed.inject(Adjustment);
  const itemsStore = TestBed.inject(ItemsStore);
  const machinesStore = TestBed.inject(MachinesStore);
  const recipesStore = TestBed.inject(RecipesStore);
  const settingsStore = TestBed.inject(SettingsStore);

  defaults = settingsStore.computeDefaults(modInfo, modData, Preset.Beacon8)!;
  getDataset = (): Dataset => {
    return settingsStore.computeDataset(
      modInfo,
      modData,
      modHash,
      undefined,
      'factorio',
    );
  };
  dataset = getDataset();
  categoryId = dataset.categoryIds[0];
  item1 = dataset.itemRecord[dataset.itemIds[0]];
  item2 = dataset.itemRecord[dataset.itemIds[1]];
  recipe1 = dataset.recipeRecord[dataset.recipeIds[0]];
  step1 = {
    id: `${item1.id}.${item1.id}`,
    itemId: item1.id,
    recipeId: item1.id,
    items: objective1.value,
    belts: rational(1n, 2n),
    wagons: rational(2n),
    machines: rational.one,
    power: rational.one,
    pollution: rational.one,
  };
  step2 = {
    id: `${item2.id}.${item2.id}`,
    itemId: item2.id,
    recipeId: item2.id,
    items: objective2.value,
    belts: rational.one,
    wagons: rational.one,
    machines: rational(2n),
    power: rational.zero,
    pollution: rational.zero,
  };
  steps = [step1, step2];
  itemsState = {};
  for (const item of dataset.itemIds.map((i) => dataset.itemRecord[i]))
    itemsState[item.id] = spread(itemSettings1);

  recipesState = {};
  for (const recipe of dataset.recipeIds.map((i) => dataset.recipeRecord[i]))
    recipesState[recipe.id] = spread(recipeSettings1);

  settingsStateInitial = settingsStore.computeSettings(
    initialSettingsState,
    defaults,
    dataset,
  );
  itemsStateInitial = itemsStore.computeItemsSettings({});
  machinesStateInitial = machinesStore.computeMachinesSettings(
    {},
    settingsStateInitial,
    dataset,
  );
  getRecipesState = (): Record<string, RecipeState> => {
    return recipesStore.computeRecipesSettings({});
  };
  recipesStateInitial = getRecipesState();
  getAdjustedDataset = (): AdjustedDataset => {
    return adjustment.adjustDataset(
      recipesStateInitial,
      itemsStateInitial,
      settingsStateInitial,
      getDataset(),
    );
  };
  adjustedDataset = getAdjustedDataset();
  objectives = objectivesList.map((o) =>
    spread(o, {
      recipe: isRecipeObjective(o)
        ? adjustedDataset.adjustedRecipe[o.targetId]
        : undefined,
    }),
  );
  objective = objectives[0];
  simplexResultSolved = {
    steps: steps,
    resultType: 'solved',
    time: 20,
  };
  flow = getFlow();
  lightOilSteps = [
    {
      id: '0',
      itemId: ItemId.LightOil,
      items: rational(60n),
      output: rational(60n),
      machines: rational(1n, 51n),
      recipeId: RecipeId.HeavyOilCracking,
      recipeSettings: recipesStateInitial[RecipeId.HeavyOilCracking],
      parents: {
        '': rational.one,
      },
      outputs: { [ItemId.LightOil]: rational(5n, 17n) },
    },
    {
      id: '3',
      itemId: ItemId.HeavyOil,
      items: rational(4000n, 17n),
      machines: rational(4n, 51n),
      recipeId: RecipeId.AdvancedOilProcessing,
      recipeSettings: recipesStateInitial[RecipeId.AdvancedOilProcessing],
      parents: { '0': rational.one },
      outputs: {
        [ItemId.HeavyOil]: rational.one,
        [ItemId.LightOil]: rational(12n, 17n),
        [ItemId.PetroleumGas]: rational.one,
      },
    },
    {
      id: '2',
      itemId: ItemId.CrudeOil,
      items: rational(1600n, 17n),
      machines: rational(8n, 51n),
      recipeId: RecipeId.CrudeOil,
      recipeSettings: recipesStateInitial[RecipeId.CrudeOil],
      parents: { '3': rational.one },
      outputs: { [ItemId.CrudeOil]: rational.one },
    },
    {
      id: '4',
      itemId: ItemId.PetroleumGas,
      items: rational(880n, 17n),
      surplus: rational(880n, 17n),
    },
    {
      id: '1',
      itemId: ItemId.Water,
      items: rational(1100n, 17n),
      machines: rational(11n, 12240n),
      recipeId: RecipeId.Water,
      recipeSettings: recipesStateInitial[RecipeId.Water],
      outputs: { [ItemId.Water]: rational.one },
      parents: {
        '0': rational(3n, 11n),
        '1': rational(8n, 11n),
      },
    },
  ];
});

export const ModuleEffects: Record<ModuleEffect, Rational> = {
  consumption: rational.one,
  pollution: rational.one,
  productivity: rational.one,
  quality: rational.zero,
  speed: rational.one,
};
