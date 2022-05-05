import { createSelector } from '@ngrx/store';

import { environment } from 'src/environments';
import {
  Column,
  columnOptions,
  Dataset,
  Defaults,
  Entities,
  FuelType,
  Game,
  InserterData,
  ItemId,
  Preset,
  presetOptions,
  rateTypeOptions,
  Rational,
  RationalBeacon,
  RationalBelt,
  RationalCargoWagon,
  RationalFactory,
  RationalFluidWagon,
  RationalFuel,
  RationalItem,
  RationalModule,
  RationalRecipe,
  Recipe,
  ResearchSpeedFactor,
  toBoolEntities,
  toEntities,
} from '~/models';
import { LabState } from '../';
import * as Datasets from '../datasets';
import * as Preferences from '../preferences';
import { initialSettingsState, SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: LabState): SettingsState =>
  state.settingsState;

export const getPreset = createSelector(settingsState, (state) => state.preset);
export const getBaseDatasetId = createSelector(
  settingsState,
  (state) => state.baseId
);
export const getExpensive = createSelector(
  settingsState,
  (state) => state.expensive
);
export const getBeaconReceivers = createSelector(
  settingsState,
  (state) => state.beaconReceivers
);
export const getFlowRate = createSelector(
  settingsState,
  (state) => state.flowRate
);
export const getDisplayRate = createSelector(
  settingsState,
  (state) => state.displayRate
);
export const getMiningBonus = createSelector(
  settingsState,
  (state) => state.miningBonus
);
export const getResearchSpeed = createSelector(
  settingsState,
  (state) => state.researchSpeed
);
export const getInserterTarget = createSelector(
  settingsState,
  (state) => state.inserterTarget
);
export const getInserterCapacity = createSelector(
  settingsState,
  (state) => state.inserterCapacity
);
export const getCostFactor = createSelector(
  settingsState,
  (state) => state.costFactor
);
export const getCostFactory = createSelector(
  settingsState,
  (state) => state.costFactory
);
export const getCostInput = createSelector(
  settingsState,
  (state) => state.costInput
);
export const getCostIgnored = createSelector(
  settingsState,
  (state) => state.costIgnored
);
export const getProliferatorSprayId = createSelector(
  settingsState,
  (state) => state.proliferatorSprayId
);

/* Complex selectors */
export const getBase = createSelector(
  getBaseDatasetId,
  Datasets.getBaseEntities,
  (id, data) => data[id]
);

export const getHash = createSelector(
  getBaseDatasetId,
  Datasets.getHashEntities,
  (id, hashEntities) => hashEntities[id]
);

export const getGame = createSelector(
  getBaseDatasetId,
  Datasets.getBaseInfoEntities,
  (id, data) => data[id].game
);

export const getColumnOptions = createSelector(getGame, (game) =>
  columnOptions(game)
);

export const getRateTypeOptions = createSelector(
  getGame,
  getDisplayRate,
  (game, displayRate) => rateTypeOptions(displayRate, game)
);

export const getPresetOptions = createSelector(getGame, (game) =>
  presetOptions(game)
);

export const getBaseOptions = createSelector(
  getGame,
  Datasets.getBaseSets,
  (game, baseSets) => baseSets.filter((b) => b.game === game)
);

export const getColumnsState = createSelector(
  getGame,
  Preferences.getColumns,
  (game, col): Preferences.ColumnsState =>
    game === Game.DysonSphereProgram
      ? {
          ...Preferences.initialColumnsState,
          ...col,
          ...{
            [Column.Wagons]: { ...col[Column.Wagons], ...{ show: false } },
            [Column.Overclock]: {
              ...col[Column.Overclock],
              ...{ show: false },
            },
            [Column.Beacons]: { ...col[Column.Beacons], ...{ show: false } },
            [Column.Pollution]: {
              ...col[Column.Pollution],
              ...{ show: false },
            },
          },
        }
      : game === Game.Satisfactory
      ? {
          ...Preferences.initialColumnsState,
          ...col,
          ...{
            [Column.Beacons]: { ...col[Column.Beacons], ...{ show: false } },
            [Column.Pollution]: {
              ...col[Column.Pollution],
              ...{ show: false },
            },
          },
        }
      : {
          ...Preferences.initialColumnsState,
          ...col,
          ...{
            [Column.Overclock]: {
              ...col[Column.Overclock],
              ...{ show: false },
            },
          },
        }
);

export const getDefaults = createSelector(
  getPreset,
  getBase,
  (preset, base) => {
    if (base) {
      const m = base.defaults;
      if (m) {
        let moduleRank: string[] = [];
        switch (base.game) {
          case Game.Factorio: {
            moduleRank = preset === Preset.Minimum ? [] : m.moduleRank;
            break;
          }
          case Game.DysonSphereProgram: {
            moduleRank = preset === Preset.Beacon8 ? m.moduleRank : [];
            break;
          }
          case Game.Satisfactory: {
            moduleRank = m.moduleRank;
          }
        }
        const defaults: Defaults = {
          modIds: m.modIds,
          beltId: preset === Preset.Minimum ? m.minBelt : m.maxBelt,
          pipeId: preset === Preset.Minimum ? m.minPipe : m.maxPipe,
          fuelId: m.fuel,
          cargoWagonId: m.cargoWagon,
          fluidWagonId: m.fluidWagon,
          disabledRecipeIds: m.disabledRecipes,
          factoryRankIds:
            preset === Preset.Minimum ? m.minFactoryRank : m.maxFactoryRank,
          moduleRankIds: moduleRank,
          beaconCount:
            preset < Preset.Beacon8
              ? '0'
              : preset < Preset.Beacon12
              ? '8'
              : '12',
          beaconId: m.beacon,
          beaconModuleId:
            preset < Preset.Beacon8 ? ItemId.Module : m.beaconModule,
        };
        return defaults;
      }
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
      beltId: s.beltId ?? d?.beltId,
      pipeId: s.pipeId ?? d?.pipeId,
      fuelId: s.fuelId ?? d?.fuelId,
      cargoWagonId: s.cargoWagonId ?? d?.cargoWagonId,
      fluidWagonId: s.fluidWagonId ?? d?.fluidWagonId,
      disabledRecipeIds: s.disabledRecipeIds ?? d?.disabledRecipeIds ?? [],
    },
  })
);

export const getFuelId = createSelector(getSettings, (s) => s.fuelId);

export const getDisabledRecipeIds = createSelector(
  getSettings,
  (s) => s.disabledRecipeIds
);

export const getRationalMiningBonus = createSelector(getMiningBonus, (bonus) =>
  Rational.fromNumber(bonus).div(Rational.hundred)
);

export const getResearchFactor = createSelector(
  getResearchSpeed,
  (speed) => ResearchSpeedFactor[speed]
);

export const getRationalBeaconReceivers = createSelector(
  getBeaconReceivers,
  (total) => (total ? Rational.fromString(total) : null)
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

export const getSimplexModifiers = createSelector(
  getRationalCostInput,
  getRationalCostIgnored,
  Preferences.getSimplex,
  (costInput, costIgnored, simplex) => ({
    costInput,
    costIgnored,
    simplex,
  })
);

export const getMods = createSelector(
  getBase,
  Datasets.getModEntities,
  (base, data) =>
    base?.defaults?.modIds?.filter((i) => data[i]).map((i) => data[i]) || []
);

// Return list only if base and all mods have been loaded
export const getDatasets = createSelector(getBase, getMods, (base, mods) =>
  base?.defaults && base.defaults.modIds.length === mods.length
    ? [base, ...mods]
    : []
);

export const getI18n = createSelector(
  getDatasets,
  Datasets.getI18nEntities,
  Preferences.getLanguage,
  (mods, i18n, lang) => mods.map((m) => i18n[`${m.id}-${lang}`])
);

export const getNormalDataset = createSelector(
  Datasets.getAppData,
  getDatasets,
  getI18n,
  getDefaults,
  getGame,
  getHash,
  (app, mods, i18n, defaults, game, hash) => {
    // Map out entities with mods
    const categoryEntities = getEntities(
      app.categories,
      mods.map((m) => m.categories)
    );
    const iconEntities = getEntities(
      app.icons.map((i) => ({
        ...i,
        ...{ file: i.file ?? `data/${app.id}/icons.png` },
      })),
      mods.map((m) =>
        m.icons.map((i) => ({
          ...i,
          ...{ file: i.file ?? `data/${m.id}/icons.png` },
        }))
      )
    );
    const itemData = getEntities(
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

    // Apply localization
    for (const locale of i18n) {
      if (locale) {
        for (const i of Object.keys(locale.categories)) {
          categoryEntities[i] = {
            ...categoryEntities[i],
            ...{
              name: locale.categories[i],
            },
          };
        }
        for (const i of Object.keys(locale.items)) {
          itemData[i] = {
            ...itemData[i],
            ...{
              name: locale.items[i],
            },
          };
        }
        for (const i of Object.keys(locale.recipes)) {
          recipeEntities[i] = {
            ...recipeEntities[i],
            ...{
              name: locale.recipes[i],
            },
          };
        }
      }
    }

    // Convert to id arrays
    let categoryIds = Object.keys(categoryEntities);
    const iconIds = Object.keys(iconEntities);
    const itemIds = Object.keys(itemData);
    const recipeIds = Object.keys(recipeEntities);

    // Generate temporary object arrays
    const items = itemIds.map((i) => itemData[i]);
    const recipes = recipeIds.map((r) => recipeEntities[r]);

    // Filter for item types
    const beaconIds = items
      .filter((i) => i.beacon != null)
      .sort((a, b) => a.beacon!.modules - b.beacon!.modules)
      .map((i) => i.id);
    const beltIds = items
      .filter((i) => i.belt)
      .sort((a, b) =>
        /** Don't sort belts in DSP, leave based on stacks */
        game === Game.DysonSphereProgram ? 0 : a.belt!.speed - b.belt!.speed
      )
      .map((i) => i.id);
    const pipeIds = items
      .filter((i) => i.pipe)
      .sort((a, b) => a.pipe!.speed - b.pipe!.speed)
      .map((i) => i.id);
    const cargoWagonIds = items
      .filter((i) => i.cargoWagon)
      .sort((a, b) => a.cargoWagon!.size - b.cargoWagon!.size)
      .map((i) => i.id);
    const fluidWagonIds = items
      .filter((i) => i.fluidWagon)
      .sort((a, b) => a.fluidWagon!.capacity - b.fluidWagon!.capacity)
      .map((i) => i.id);
    const factoryIds = items.filter((i) => i.factory).map((i) => i.id);
    const modules = items.filter((i) => i.module);
    const moduleIds = modules.map((i) => i.id);
    const beaconModuleIds = modules
      .filter((i) => i.module!.productivity == null)
      .map((i) => i.id);
    const fuelIds = items
      .filter((i) => i.fuel)
      .sort((a, b) => a.fuel!.value - b.fuel!.value)
      .reduce((e: Entities<string[]>, f) => {
        const cat = f.fuel!.category;
        if (!e[cat]) {
          e[cat] = [];
        }
        e[cat].push(f.id);
        return e;
      }, {});

    // Apply icon references
    items
      .filter((i) => i.icon)
      .forEach((i) => (iconEntities[i.id] = iconEntities[i.icon!]));
    recipes
      .filter((r) => r.icon)
      .forEach((r) => (iconEntities[r.id] = iconEntities[r.icon!]));

    // Calculate missing implicit recipe icons
    // For recipes with no icon, use icon of first output product
    recipes
      .filter((r) => !iconEntities[r.id] && r.out)
      .forEach(
        (r) => (iconEntities[r.id] = iconEntities[Object.keys(r.out!)[0]])
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
    const beaconEntities: Entities<RationalBeacon> = {};
    const beltEntities: Entities<RationalBelt> = {};
    const cargoWagonEntities: Entities<RationalCargoWagon> = {};
    const fluidWagonEntities: Entities<RationalFluidWagon> = {};
    const factoryEntities: Entities<RationalFactory> = {};
    const moduleEntities: Entities<RationalModule> = {};
    const fuelEntities: Entities<RationalFuel> = {};
    const itemEntities = itemIds.reduce((e: Entities<RationalItem>, i) => {
      const item = new RationalItem(itemData[i]);
      if (item.beacon) {
        beaconEntities[i] = item.beacon;
      }
      if (item.belt) {
        beltEntities[i] = item.belt;
      } else if (item.pipe) {
        beltEntities[i] = item.pipe;
      }
      if (item.cargoWagon) {
        cargoWagonEntities[i] = item.cargoWagon;
      }
      if (item.fluidWagon) {
        fluidWagonEntities[i] = item.fluidWagon;
      }
      if (item.factory) {
        factoryEntities[i] = item.factory;
      }
      if (item.module) {
        moduleEntities[i] = item.module;
      }
      if (item.fuel) {
        fuelEntities[i] = item.fuel;
      }

      e[i] = item;
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
        const outputs = Object.keys(recipe.out);
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
    const itemRecipeIds = itemIds.reduce((e: Entities, i) => {
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

    // Calculate allowed modules for recipes
    const recipeModuleIds = recipes.reduce((e: Entities<string[]>, r) => {
      e[r.id] = modules
        .filter(
          (m) =>
            m.module!.limitation == null ||
            limitations[m.module!.limitation][r.id]
        )
        .map((m) => m.id);
      return e;
    }, {});

    const prodModuleIds = moduleIds.filter(
      (i) => itemEntities[i].module!.productivity != null
    );

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
      itemEntities,
      itemRecipeIds,
      beaconIds,
      beaconEntities,
      beltIds,
      pipeIds,
      beltEntities,
      cargoWagonIds,
      cargoWagonEntities,
      fluidWagonIds,
      fluidWagonEntities,
      factoryIds,
      factoryEntities,
      moduleIds,
      beaconModuleIds,
      moduleEntities,
      fuelIds,
      fuelEntities,
      recipeIds,
      complexRecipeIds,
      recipeEntities,
      recipeR,
      recipeModuleIds,
      prodModuleIds,
      hash,
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

export const getChemicalFuelIds = createSelector(
  getDataset,
  (data) => data.fuelIds[FuelType.Chemical] ?? []
);

export const getBeltSpeed = createSelector(
  getDataset,
  getRationalFlowRate,
  (data, flowRate) => {
    const value: Entities<Rational> = { [ItemId.Pipe]: flowRate };
    if (data.beltIds) {
      for (const id of data.beltIds) {
        value[id] = data.beltEntities[id].speed;
      }
    }
    if (data.pipeIds) {
      for (const id of data.pipeIds) {
        value[id] = data.beltEntities[id].speed;
      }
    }
    return value;
  }
);

export const getAdjustmentData = createSelector(
  getFuelId,
  getProliferatorSprayId,
  getRationalMiningBonus,
  getResearchFactor,
  getRationalCostFactor,
  getRationalCostFactory,
  getDataset,
  (
    fuelId,
    proliferatorSprayId,
    miningBonus,
    researchSpeed,
    costFactor,
    costFactory,
    data
  ) => ({
    fuelId,
    proliferatorSprayId,
    miningBonus,
    researchSpeed,
    costFactor,
    costFactory,
    data,
  })
);

export const getSettingsModified = createSelector(settingsState, (state) => ({
  cost:
    state.costFactor !== initialSettingsState.costFactor ||
    state.costFactory !== initialSettingsState.costFactory ||
    state.costInput !== initialSettingsState.costInput ||
    state.costIgnored !== initialSettingsState.costIgnored,
}));

export const getInserterData = createSelector(
  getInserterTarget,
  getInserterCapacity,
  (target, capacity) => InserterData[target][capacity]
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
