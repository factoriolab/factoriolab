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
  EmptyMod,
} from '~/models';
import { State } from '../';
import { getBaseEntities, getModEntities } from '../datasets';
import { SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: State) => state.settingsState;
const sBaseDatasetId = (state: SettingsState) => state.baseDatasetId;
const sModDatasetIds = (state: SettingsState) => state.modDatasetIds;
const sDisplayRate = (state: SettingsState) => state.displayRate;
const sItemPrecision = (state: SettingsState) => state.itemPrecision;
const sBeltPrecision = (state: SettingsState) => state.beltPrecision;
const sFactoryPrecision = (state: SettingsState) => state.factoryPrecision;
const sBelt = (state: SettingsState) => state.belt;
const sFuel = (state: SettingsState) => state.fuel;
const sRecipeDisabled = (state: SettingsState) => state.recipeDisabled;
const sFactoryRank = (state: SettingsState) => state.factoryRank;
const sModuleRank = (state: SettingsState) => state.moduleRank;
const sBeaconModule = (state: SettingsState) => state.beaconModule;
const sBeaconCount = (state: SettingsState) => state.beaconCount;
const sMiningBonus = (state: SettingsState) => state.miningBonus;
const sResearchSpeed = (state: SettingsState) => state.researchSpeed;
const sFlowRate = (state: SettingsState) => state.flowRate;
const sExpensive = (state: SettingsState) => state.expensive;
const sTheme = (state: SettingsState) => state.theme;

/* Simple selectors */
export const getBaseDatasetId = compose(sBaseDatasetId, settingsState);
export const getModDatasetIds = compose(sModDatasetIds, settingsState);
export const getDisplayRate = compose(sDisplayRate, settingsState);
export const getItemPrecision = compose(sItemPrecision, settingsState);
export const getBeltPrecision = compose(sBeltPrecision, settingsState);
export const getFactoryPrecision = compose(sFactoryPrecision, settingsState);
export const getBelt = compose(sBelt, settingsState);
export const getFuel = compose(sFuel, settingsState);
export const getRecipeDisabled = compose(sRecipeDisabled, settingsState);
export const getFactoryRank = compose(sFactoryRank, settingsState);
export const getModuleRank = compose(sModuleRank, settingsState);
export const getBeaconModule = compose(sBeaconModule, settingsState);
export const getBeaconCount = compose(sBeaconCount, settingsState);
export const getMiningBonus = compose(sMiningBonus, settingsState);
export const getResearchSpeed = compose(sResearchSpeed, settingsState);
export const getFlowRate = compose(sFlowRate, settingsState);
export const getExpensive = compose(sExpensive, settingsState);
export const getTheme = compose(sTheme, settingsState);

/* Complex selectors */
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

export const getBase = createSelector(
  getBaseDatasetId,
  getBaseEntities,
  (id, entities) => (id && entities[id]) || EmptyMod
);

export const getMods = createSelector(
  getModDatasetIds,
  getModEntities,
  (ids, entities) => ids.filter((i) => entities[i]).map((i) => entities[i])
);

export const getDefaults = createSelector(getBase, (base) => base.defaults);

export const getNormalDataset = createSelector(
  getBase,
  getMods,
  (base, mods) => {
    // Map out entities with mods
    const categoryEntities = getEntities(
      base.categories,
      mods.map((m) => m.categories)
    );
    const iconEntities = getEntities(
      base.icons.map((i) => ({ ...i, ...{ file: i.file || base.sprite } })),
      mods.map((m) =>
        m.icons.map((i) => ({ ...i, ...{ file: i.file || m.sprite } }))
      )
    );
    const itemEntities = getEntities(
      base.items,
      mods.map((m) => m.items)
    );
    const recipeEntities = getEntities(
      base.recipes,
      mods.map((m) => m.recipes)
    );
    const limitations = getArrayEntities(
      base.limitations,
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

    // Calculate item simple recipes
    const itemRecipeIds = itemIds.reduce((e: Entities<string>, i) => {
      const exact = recipeIds.find((r) => r === i);
      if (exact) {
        return { ...e, ...{ [i]: i } };
      }
      const matches = recipes.filter((r) => r.out && r.out[i]);
      if (matches.length === 1) {
        return { ...e, ...{ [i]: matches[0].id } };
      }
      return e;
    }, {});

    // Fill in missing recipe names
    for (const id of recipeIds) {
      if (!recipeEntities[id].name) {
        if (itemEntities[id]) {
          recipeEntities[id] = {
            ...recipeEntities[id],
            ...{ name: itemEntities[id].name },
          };
        } else {
          // No item or name found, convert id to name
          const words = recipeEntities[id].id.split('-').filter((w) => w);
          const caps = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
          const name = caps.join(' ');
          recipeEntities[id] = { ...recipeEntities[id], ...{ name } };
        }
      }
    }

    // Calculate allowed modules for recipes
    const recipeModuleIds = recipes.reduce(
      (e: Entities<string[]>, r) => ({
        ...e,
        ...{
          [r.id]: modules
            .filter(
              (m) =>
                !m.module.limitation ||
                limitations[m.module.limitation].some((l) => l === r.id)
            )
            .map((m) => m.id),
        },
      }),
      {}
    );

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
