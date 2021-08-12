import { compose, createSelector } from '@ngrx/store';
import { environment } from 'src/environments';

import {
  ResearchSpeedFactor,
  Rational,
  Entities,
  Recipe,
  RationalItem,
  RationalRecipe,
  Dataset,
  Preset,
  Defaults,
  toBoolEntities,
  toEntities,
  ItemId,
  DisplayRate,
  ResearchSpeed,
  InserterTarget,
  InserterCapacity,
  Game,
} from '~/models';
import { State } from '../';
import * as Datasets from '../datasets';
import { initialSettingsState, SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: State): SettingsState =>
  state.settingsState;
const sPreset = (state: SettingsState): Preset => state.preset;
const sBaseDatasetId = (state: SettingsState): string => state.baseId;
const sExpensive = (state: SettingsState): boolean => state.expensive;
const sFlowRate = (state: SettingsState): number => state.flowRate;
const sDisplayRate = (state: SettingsState): DisplayRate => state.displayRate;
const sMiningBonus = (state: SettingsState): number => state.miningBonus;
const sResearchSpeed = (state: SettingsState): ResearchSpeed =>
  state.researchSpeed;
const sInserterTarget = (state: SettingsState): InserterTarget =>
  state.inserterTarget;
const sInserterCapacity = (state: SettingsState): InserterCapacity =>
  state.inserterCapacity;
const sCostFactor = (state: SettingsState): string => state.costFactor;
const sCostFactory = (state: SettingsState): string => state.costFactory;
const sCostInput = (state: SettingsState): string => state.costInput;
const sCostIgnored = (state: SettingsState): string => state.costIgnored;

/* Simple selectors */
export const getPreset = compose(sPreset, settingsState);
export const getBaseDatasetId = compose(sBaseDatasetId, settingsState);
export const getExpensive = compose(sExpensive, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getMiningBonus = compose(sMiningBonus, settingsState);
export const getResearchSpeed = compose(sResearchSpeed, settingsState);
export const getInserterTarget = compose(sInserterTarget, settingsState);
export const getInserterCapacity = compose(sInserterCapacity, settingsState);
export const getCostFactor = compose(sCostFactor, settingsState);
export const getCostFactory = compose(sCostFactory, settingsState);
export const getCostInput = compose(sCostInput, settingsState);
export const getCostIgnored = compose(sCostIgnored, settingsState);

/* Complex selectors */
export const getBase = createSelector(
  getBaseDatasetId,
  Datasets.getBaseEntities,
  (id, data) => data[id]
);

export const getGame = createSelector(
  getBaseDatasetId,
  Datasets.getBaseInfoEntities,
  (id, data) => data[id].game
);

export const getDefaults = createSelector(
  getPreset,
  getBase,
  (preset, base) => {
    if (base) {
      const m = base.defaults;
      let moduleRank: string[];
      switch (base.game) {
        case Game.Factorio: {
          moduleRank = preset === Preset.Minimum ? [] : m.moduleRank;
          break;
        }
        case Game.DysonSphereProgram: {
          moduleRank = preset === Preset.Minimum ? [m.minBelt] : [m.maxBelt];
          break;
        }
        case Game.Satisfactory: {
          moduleRank = m.moduleRank;
        }
      }
      const defaults: Defaults = {
        modIds: m.modIds,
        belt: preset === Preset.Minimum ? m.minBelt : m.maxBelt,
        pipe: preset === Preset.Minimum ? m.minPipe : m.maxPipe,
        fuel: m.fuel,
        cargoWagon: m.cargoWagon,
        fluidWagon: m.fluidWagon,
        disabledRecipes: m.disabledRecipes,
        factoryRank:
          preset === Preset.Minimum ? m.minFactoryRank : m.maxFactoryRank,
        moduleRank,
        beaconCount:
          preset < Preset.Beacon8 ? '0' : preset < Preset.Beacon12 ? '8' : '12',
        beacon: m.beacon,
        beaconModule: preset < Preset.Beacon8 ? ItemId.Module : m.beaconModule,
      };
      return defaults;
    }
    return null;
  }
);

export const getSettings = createSelector(
  settingsState,
  getDefaults,
  (s, d) => ({
    ...s,
    ...{
      belt: s.belt || d?.belt,
      pipe: s.pipe || d?.pipe,
      fuel: s.fuel || d?.fuel,
      cargoWagon: s.cargoWagon || d?.cargoWagon,
      fluidWagon: s.fluidWagon || d?.fluidWagon,
      disabledRecipes: s.disabledRecipes || d?.disabledRecipes || [],
    },
  })
);

export const getFuel = createSelector(getSettings, (s) => s.fuel);

export const getDisabledRecipes = createSelector(
  getSettings,
  (s) => s.disabledRecipes
);

export const getRationalMiningBonus = createSelector(getMiningBonus, (bonus) =>
  Rational.fromNumber(bonus).div(Rational.hundred)
);

export const getResearchFactor = createSelector(
  getResearchSpeed,
  (speed) => ResearchSpeedFactor[speed]
);

export const getRationalFlowRate = createSelector(getFlowRate, (rate) =>
  Rational.fromNumber(rate)
);

export const getRationalCostFactor = createSelector(getCostFactor, (cost) =>
  Rational.fromString(cost)
);

export const getRationalCostFactory = createSelector(getCostFactory, (cost) =>
  Rational.fromString(cost)
);

export const getRationalCostInput = createSelector(getCostInput, (cost) =>
  Rational.fromString(cost)
);

export const getRationalCostIgnored = createSelector(getCostIgnored, (cost) =>
  Rational.fromString(cost)
);

export const getMods = createSelector(
  getBase,
  Datasets.getModEntities,
  (base, data) =>
    base?.defaults?.modIds?.filter((i) => data[i]).map((i) => data[i]) || []
);

// Return list only if base and all mods have been loaded
export const getDatasets = createSelector(getBase, getMods, (base, mods) =>
  base && base.defaults.modIds.length === mods.length ? [base, ...mods] : []
);

export const getNormalDataset = createSelector(
  Datasets.getAppData,
  getDatasets,
  getDefaults,
  getGame,
  (app, mods, defaults, game) => {
    // Map out entities with mods
    const categoryEntities = getEntities(
      app.categories,
      mods.map((m) => m.categories)
    );
    const iconEntities = getEntities(
      app.icons.map((i) => ({
        ...i,
        ...{ file: i.file || `data/${app.id}/icons.png` },
      })),
      mods.map((m) =>
        m.icons.map((i) => ({
          ...i,
          ...{ file: i.file || `data/${m.id}/icons.png` },
        }))
      )
    );
    const itemEntities = getEntities(
      app.items,
      mods.map((m) => m.items)
    );
    const recipeEntities = getEntities(
      app.recipes,
      mods.map((m) => m.recipes)
    );
    const limitations = getArrayEntities(
      app.limitations,
      mods.map((m) => m.limitations)
    );

    // Convert to id arrays
    let categoryIds = Object.keys(categoryEntities);
    const iconIds = Object.keys(iconEntities);
    const itemIds = Object.keys(itemEntities);
    const recipeIds = Object.keys(recipeEntities);

    // Generate temporary object arrays
    const items = itemIds.map((i) => itemEntities[i]);
    const recipes = recipeIds.map((r) => recipeEntities[r]);

    // Filter for item types
    const beaconIds = items
      .filter((i) => i.beacon)
      .sort((a, b) => a.beacon.modules - b.beacon.modules)
      .map((i) => i.id);
    const beltIds = items
      .filter((i) => i.belt)
      .sort((a, b) => a.belt.speed - b.belt.speed)
      .map((i) => i.id);
    const pipeIds = items
      .filter((i) => i.pipe)
      .sort((a, b) => a.pipe.speed - b.pipe.speed)
      .map((i) => i.id);
    const cargoWagonIds = items
      .filter((i) => i.cargoWagon)
      .sort((a, b) => a.cargoWagon.size - b.cargoWagon.size)
      .map((i) => i.id);
    const fluidWagonIds = items
      .filter((i) => i.fluidWagon)
      .sort((a, b) => a.fluidWagon.capacity - b.fluidWagon.capacity)
      .map((i) => i.id);
    const factoryIds = items.filter((i) => i.factory).map((i) => i.id);
    const modules = items.filter((i) => i.module);
    const moduleIds = modules.map((i) => i.id);
    const beaconModuleIds = modules
      .filter((i) => !i.module.productivity)
      .map((i) => i.id);
    const fuelIds = items
      .filter((i) => i.fuel)
      .sort((a, b) => a.fuel.value - b.fuel.value)
      .reduce((e: Entities<string[]>, f) => {
        if (!e[f.fuel.category]) {
          e[f.fuel.category] = [];
        }
        e[f.fuel.category].push(f.id);
        return e;
      }, {});

    // Apply icon references
    items
      .filter((i) => i.icon)
      .forEach((i) => (iconEntities[i.id] = iconEntities[i.icon]));
    recipes
      .filter((r) => r.icon)
      .forEach((r) => (iconEntities[r.id] = iconEntities[r.icon]));

    // Calculate missing implicit recipe icons
    // For recipes with no icon, use icon of first output product
    recipes
      .filter((r) => !iconEntities[r.id] && r.out)
      .forEach(
        (r) => (iconEntities[r.id] = iconEntities[Object.keys(r.out)[0]])
      );
    // Calculate category item rows
    const categoryItemRows: Entities<string[][]> = {};
    for (const id of categoryIds) {
      const rows: string[][] = [[]];
      const rowItems = items
        .filter((i) => i.category === id)
        .sort((a, b) => a.row - b.row);
      if (rowItems.length) {
        let index = rowItems[0].row;
        for (const item of rowItems) {
          if (item.row > index) {
            rows.push([]);
            index = item.row;
          }
          rows[rows.length - 1].push(item.id);
        }
        categoryItemRows[id] = rows;
      }
    }
    categoryIds = categoryIds.filter((c) => categoryItemRows[c]);

    // Convert to rationals
    const itemR = itemIds.reduce((e: Entities<RationalItem>, i) => {
      e[i] = new RationalItem(itemEntities[i]);
      return e;
    }, {});
    const recipeR = recipeIds.reduce((e: Entities<RationalRecipe>, r) => {
      e[r] = new RationalRecipe(recipeEntities[r]);
      return e;
    }, {});

    // Calculate item simple recipes
    const recipeMatches = recipeIds.reduce(
      (e: Entities<RationalRecipe[]>, r) => {
        const recipe = recipeR[r];
        const outputs = recipe.out ? Object.keys(recipe.out) : [recipe.id];
        for (const o of outputs.filter((i) => recipe.produces(i))) {
          if (!e[o]) {
            e[o] = [recipe];
          } else {
            e[o].push(recipe);
          }
        }
        return e;
      },
      {}
    );
    const itemRecipeIds = itemIds.reduce((e: Entities<string>, i) => {
      const matches = recipeMatches.hasOwnProperty(i) ? recipeMatches[i] : [];
      if (
        matches.length === 1 &&
        (!matches[0].out || Object.keys(matches[0].out).length === 1)
      ) {
        // Ensure recipe produces this item and this item only
        // If so, use this recipe as a direct mapping
        e[i] = matches[0].id;
      }
      return e;
    }, {});

    // Fill in missing recipe names
    for (const id of recipeIds.filter((i) => !recipeEntities[i].name)) {
      if (itemEntities[id]) {
        recipeEntities[id] = {
          ...recipeEntities[id],
          ...{ name: itemEntities[id].name },
        };
      } else {
        // No item found, convert id to name
        const cap = id.charAt(0).toUpperCase() + id.slice(1);
        const name = cap.replace(/-/g, ' ');
        recipeEntities[id] = { ...recipeEntities[id], ...{ name } };
      }
    }

    // Calculate allowed modules for recipes
    const recipeModuleIds = recipes.reduce((e: Entities<string[]>, r) => {
      e[r.id] = modules
        .filter(
          (m) => !m.module.limitation || limitations[m.module.limitation][r.id]
        )
        .map((m) => m.id);
      return e;
    }, {});

    // Calculate complex recipes
    const simpleRecipes = Object.keys(itemRecipeIds).map(
      (i) => itemRecipeIds[i]
    );
    const complexRecipeIds = recipeIds
      .filter((r) => simpleRecipes.indexOf(r) === -1)
      .sort();

    const dataset: Dataset = {
      game,
      categoryIds,
      categoryEntities,
      categoryItemRows,
      iconIds,
      iconEntities,
      itemIds,
      beaconIds,
      beltIds,
      pipeIds,
      cargoWagonIds,
      fluidWagonIds,
      factoryIds,
      moduleIds,
      beaconModuleIds,
      fuelIds,
      itemEntities,
      itemR,
      itemRecipeIds,
      recipeIds,
      complexRecipeIds,
      recipeEntities,
      recipeR,
      recipeModuleIds,
      defaults,
    };
    return dataset;
  }
);

export const getDataset = createSelector(
  getNormalDataset,
  getExpensive,
  (data, expensive) => {
    if (expensive) {
      const newData = { ...data };
      const recipes: Recipe[] = [];
      for (const recipe of data.recipeIds.map(
        (id) => data.recipeEntities[id]
      )) {
        if (recipe.expensive) {
          const newRecipe = { ...recipe, ...recipe.expensive };
          if (recipe.out && !recipe.expensive.out) {
            // If expensive recipe specifies no outputs, reset to default
            delete newRecipe.out;
          }
          recipes.push(newRecipe);
        } else {
          recipes.push(recipe);
        }
      }
      newData.recipeEntities = toEntities(recipes);
      return newData;
    } else {
      return data;
    }
  }
);

export const getBeltSpeed = createSelector(
  getDataset,
  getRationalFlowRate,
  (data, flowRate) => {
    const value: Entities<Rational> = { [ItemId.Pipe]: flowRate };
    if (data.beltIds) {
      for (const id of data.beltIds) {
        value[id] = data.itemR[id].belt.speed;
      }
    }
    if (data.pipeIds) {
      for (const id of data.pipeIds) {
        value[id] = data.itemR[id].pipe.speed;
      }
    }
    return value;
  }
);

export const getAdjustmentData = createSelector(
  getFuel,
  getRationalMiningBonus,
  getResearchFactor,
  getRationalCostFactor,
  getRationalCostFactory,
  getDataset,
  (fuel, miningBonus, researchSpeed, costFactor, costFactory, data) => ({
    fuel,
    miningBonus,
    researchSpeed,
    costFactor,
    costFactory,
    data,
  })
);

export const getModifiedCost = createSelector(
  settingsState,
  (state) =>
    state.costFactor !== initialSettingsState.costFactor ||
    state.costFactory !== initialSettingsState.costFactory ||
    state.costInput !== initialSettingsState.costInput ||
    state.costIgnored !== initialSettingsState.costIgnored
);

export function getEntities<T extends { id: string }>(
  base: T[],
  mods: T[][]
): Entities<T> {
  const entities = toEntities(base);
  for (const mod of mods.filter((m) => m)) {
    for (const i of mod) {
      // Used only in development to validate data files
      // istanbul ignore next
      if (environment.debug && mod.filter((m) => m.id === i.id).length > 1) {
        console.warn(`Duplicate id: ${i.id}`);
      }
      entities[i.id] = i;
    }
  }
  return entities;
}

export function getArrayEntities(
  base: Entities<string[]>,
  mods: Entities<string[]>[]
): Entities<Entities<boolean>> {
  let entities = reduceEntities(base);
  for (const mod of mods.filter((m) => m)) {
    entities = reduceEntities(mod, entities);
  }
  return entities;
}

export function reduceEntities(
  value: Entities<string[]>,
  init: Entities<Entities<boolean>> = {}
): Entities<Entities<boolean>> {
  return Object.keys(value).reduce((e: Entities<Entities<boolean>>, x) => {
    e[x] = toBoolEntities(value[x], init[x]);
    return e;
  }, init);
}
