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
  ModHash,
  FuelType,
} from '~/models';
import { State } from '../';
import * as Datasets from '../datasets';
import { SettingsState } from './settings.reducer';

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

/* Complex selectors */
export const getIsDsp = createSelector(getBaseDatasetId, (id) => id === 'dsp');

export const getBase = createSelector(
  getBaseDatasetId,
  Datasets.getBaseEntities,
  (id, data) => data[id]
);

export const getDefaults = createSelector(
  getPreset,
  getBase,
  getIsDsp,
  (preset, base, isDsp) => {
    if (base) {
      const m = base.defaults;
      const defaults: Defaults = {
        modIds: m.modIds,
        belt: preset === Preset.Minimum ? m.minBelt : m.maxBelt,
        fuel: m.fuel,
        cargoWagon: m.cargoWagon,
        fluidWagon: m.fluidWagon,
        disabledRecipes: m.disabledRecipes,
        factoryRank:
          preset === Preset.Minimum ? m.minFactoryRank : m.maxFactoryRank,
        moduleRank: isDsp
          ? preset === Preset.Minimum
            ? [m.minBelt]
            : [m.maxBelt]
          : preset === Preset.Minimum
          ? []
          : m.moduleRank,
        beaconCount:
          preset < Preset.Beacon8 ? 0 : preset < Preset.Beacon12 ? 8 : 12,
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
  getIsDsp,
  (app, mods, defaults, isDsp) => {
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
    const beaconIds = items.filter((i) => i.beacon).map((i) => i.id);
    const beltIds = items.filter((i) => i.belt).map((i) => i.id);
    const cargoWagonIds = items.filter((i) => i.cargoWagon).map((i) => i.id);
    const fluidWagonIds = items.filter((i) => i.fluidWagon).map((i) => i.id);
    const factoryIds = items.filter((i) => i.factory).map((i) => i.id);
    const modules = items.filter((i) => i.module);
    const moduleIds = modules.map((i) => i.id);
    const beaconModuleIds = modules
      .filter((i) => !i.module.productivity)
      .map((i) => i.id);
    const fuelIds = items
      .filter((i) => i.fuel)
      .reduce((e: Entities<string[]>, f) => {
        if (!e[f.fuel.category]) {
          e[f.fuel.category] = [];
        }
        e[f.fuel.category].push(f.id);
        return e;
      }, {});

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
      const matches = recipeMatches[i] || [];
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

    // Add missing mining recipes to productivity limitation
    recipes
      .filter((r) => r.mining)
      .forEach(
        (r) => (limitations[ItemId.ProductivityLimitation][r.id] = true)
      );

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
      isDsp,
      categoryIds,
      categoryEntities,
      categoryItemRows,
      iconIds,
      iconEntities,
      itemIds,
      beaconIds,
      beltIds,
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
    return value;
  }
);

export function getEntities<T extends { id: string }>(
  base: T[],
  mods: T[][]
): Entities<T> {
  const entities = toEntities(base);
  for (const mod of mods.filter((m) => m)) {
    for (const i of mod) {
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
