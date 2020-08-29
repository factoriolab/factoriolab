import { compose, createSelector } from '@ngrx/store';

import {
  ResearchSpeedFactor,
  Rational,
  PIPE_ID,
  Entities,
  Recipe,
  RationalItem,
  RationalRecipe,
  Dataset,
} from '~/models';
import { State } from '../';
import * as Datasets from '../datasets';
import { SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: State) => state.settingsState;
const sBaseDatasetId = (state: SettingsState) => state.baseId;
const sDisplayRate = (state: SettingsState) => state.displayRate;
const sItemPrecision = (state: SettingsState) => state.itemPrecision;
const sBeltPrecision = (state: SettingsState) => state.beltPrecision;
const sFactoryPrecision = (state: SettingsState) => state.factoryPrecision;
const sBeaconCount = (state: SettingsState) => state.beaconCount;
const sDrillModule = (state: SettingsState) => state.drillModule;
const sMiningBonus = (state: SettingsState) => state.miningBonus;
const sResearchSpeed = (state: SettingsState) => state.researchSpeed;
const sFlowRate = (state: SettingsState) => state.flowRate;
const sExpensive = (state: SettingsState) => state.expensive;
const sColumns = (state: SettingsState) => state.columns;
const sTheme = (state: SettingsState) => state.theme;
const sShowHeader = (state: SettingsState) => state.showHeader;

/* Simple selectors */
export const getBaseDatasetId = compose(sBaseDatasetId, settingsState);
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getItemPrecision = compose(sItemPrecision, settingsState);
export const getBeltPrecision = compose(sBeltPrecision, settingsState);
export const getFactoryPrecision = compose(sFactoryPrecision, settingsState);
export const getBeaconCount = compose(sBeaconCount, settingsState);
export const getDrillModule = compose(sDrillModule, settingsState);
export const getMiningBonus = compose(sMiningBonus, settingsState);
export const getResearchSpeed = compose(sResearchSpeed, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);
export const getExpensive = compose(sExpensive, settingsState);
export const getColumns = compose(sColumns, settingsState);
export const getTheme = compose(sTheme, settingsState);
export const getShowHeader = compose(sShowHeader, settingsState);

/* Complex selectors */
export const getBase = createSelector(
  getBaseDatasetId,
  Datasets.getBaseEntities,
  (id, data) => data[id]
);

export const getDefaults = createSelector(
  getBase,
  (base) => base && base.defaults
);

export const getSettings = createSelector(
  settingsState,
  getDefaults,
  (s, d) => ({
    ...s,
    ...{
      modIds: s.modIds || d?.modIds || [],
      belt: s.belt || d?.belt,
      fuel: s.fuel || d?.fuel,
      disabledRecipes: s.disabledRecipes || d?.disabledRecipes || [],
      factoryRank: s.factoryRank || d?.factoryRank || [],
      moduleRank: s.moduleRank || d?.moduleRank || [],
      beaconModule: s.beaconModule || d?.beaconModule,
    },
  })
);

export const getModIds = createSelector(getSettings, (s) => s.modIds);

export const getBelt = createSelector(getSettings, (s) => s.belt);

export const getFuel = createSelector(getSettings, (s) => s.fuel);

export const getDisabledRecipes = createSelector(
  getSettings,
  (s) => s.disabledRecipes
);

export const getFactoryRank = createSelector(getSettings, (s) => s.factoryRank);

export const getModuleRank = createSelector(getSettings, (s) => s.moduleRank);

export const getBeaconModule = createSelector(
  getSettings,
  (s) => s.beaconModule
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

export const getAvailableMods = createSelector(
  getBaseDatasetId,
  Datasets.getModSets,
  (id, mods) =>
    mods.filter(
      (m) => !m.compatibleIds || m.compatibleIds.some((i) => i === id)
    )
);

export const getMods = createSelector(
  getModIds,
  Datasets.getModEntities,
  (ids, data) => ids.filter((i) => data[i]).map((i) => data[i])
);

export const getDatasets = createSelector(getBase, getMods, (base, mods) =>
  base ? [base, ...mods] : []
);

export const getNormalDataset = createSelector(
  Datasets.getAppData,
  getDatasets,
  getDefaults,
  (app, mods, defaults) => {
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
    const categoryIds = Object.keys(categoryEntities);
    const iconIds = Object.keys(iconEntities);
    const itemIds = Object.keys(itemEntities);
    const recipeIds = Object.keys(recipeEntities);

    // Generate temporary object arrays
    const items = itemIds.map((i) => itemEntities[i]);
    const recipes = recipeIds.map((r) => recipeEntities[r]);

    // Filter for item types
    const beltIds = items.filter((i) => i.belt).map((i) => i.id);
    const fuelIds = items.filter((i) => i.fuel).map((i) => i.id);
    const factoryIds = items.filter((i) => i.factory).map((i) => i.id);
    const modules = items.filter((i) => i.module);
    const moduleIds = modules.map((i) => i.id);
    const beaconModuleIds = modules
      .filter((i) => !i.module.productivity)
      .map((i) => i.id);

    // Convert to rationals
    const itemR = itemIds.reduce(
      (e: Entities<RationalItem>, i) => ({
        ...e,
        ...{ [i]: new RationalItem(itemEntities[i]) },
      }),
      {}
    );
    const recipeR = recipeIds.reduce(
      (e: Entities<RationalRecipe>, r) => ({
        ...e,
        ...{ [r]: new RationalRecipe(recipeEntities[r]) },
      }),
      {}
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

    // Calculate item simple recipes
    const itemRecipeIds = itemIds.reduce((e: Entities<string>, i) => {
      const exact = recipes.find((r) => r.id === i);
      if (exact && !exact.in) {
        // Exact match has no inputs, so use it
        return { ...e, ...{ [i]: exact.id } };
      }
      const matches = recipes.filter((r) => r.id === i || (r.out && r.out[i]));
      if (matches.length === 1) {
        // Only one recipe produces this item, so use it
        return { ...e, ...{ [i]: matches[0].id } };
      }
      const noIn = matches.find((r) => !r.in);
      if (noIn) {
        // One matching recipe requires no inputs, so use it
        return { ...e, ...{ [i]: noIn.id } };
      }
      return e;
    }, {});

    // Fill in missing recipe names
    for (const id of recipeIds) {
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
      const isMining = r.producers.every((p) => itemEntities[p].factory.mining);
      return {
        ...e,
        ...{
          [r.id]: modules
            .filter(
              (m) =>
                !m.module.limitation ||
                limitations[m.module.limitation].some((l) => l === r.id) ||
                // Manual override for raw mining recipes
                (m.module.limitation === 'productivity-module' && isMining)
            )
            .map((m) => m.id),
        },
      };
    }, {});

    const dataset: Dataset = {
      categoryIds,
      categoryEntities,
      categoryItemRows,
      iconIds,
      iconEntities,
      itemIds,
      beltIds,
      fuelIds,
      factoryIds,
      moduleIds,
      beaconModuleIds,
      itemEntities,
      itemR,
      itemRecipeIds,
      recipeIds,
      recipeEntities,
      recipeR,
      recipeModuleIds,
      limitations,
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
          recipes.push({ ...recipe, ...recipe.expensive });
        } else {
          recipes.push(recipe);
        }
      }
      newData.recipeEntities = recipes.reduce(
        (e: Entities<Recipe>, r) => ({ ...e, ...{ [r.id]: r } }),
        {}
      );
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
    const value: Entities<Rational> = { [PIPE_ID]: flowRate };
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
  const entities = base.reduce(
    (e: Entities<T>, i) => ({ ...e, ...{ [i.id]: i } }),
    {}
  );
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
): Entities<string[]> {
  const entities = { ...base };
  for (const mod of mods.filter((m) => m)) {
    for (const i of Object.keys(mod)) {
      if (entities[i]) {
        entities[i] = [...entities[i], ...mod[i]];
      } else {
        entities[i] = mod[i];
      }
    }
  }
  return entities;
}
