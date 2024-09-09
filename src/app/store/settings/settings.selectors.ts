import { createSelector } from '@ngrx/store';
import { MenuItem, SelectItem } from 'primeng/api';
import { data } from 'src/data';
import { environment } from 'src/environments';

import { coalesce, fnPropsNotNullish, getIdOptions, spread } from '~/helpers';
import {
  Beacon,
  BeaconSettings,
  Belt,
  CargoWagon,
  columnOptions,
  Dataset,
  Defaults,
  displayRateInfo,
  Entities,
  FluidWagon,
  Fuel,
  Game,
  gameColumnsState,
  gameInfo,
  initialColumnsState,
  InserterData,
  Item,
  ItemId,
  linkValueOptions,
  Machine,
  Module,
  ModuleSettings,
  objectiveUnitOptions,
  Options,
  parseItem,
  parseRecipe,
  Preset,
  presetOptions,
  Rational,
  rational,
  Recipe,
  SettingsComplete,
  Technology,
  toBoolEntities,
  toEntities,
} from '~/models';
import { RecipeUtility } from '~/utilities';

import { LabState } from '../';
import * as Datasets from '../datasets';
import * as Preferences from '../preferences';
import { SettingsState } from './settings.reducer';

/* Base selector functions */
export const settingsState = (state: LabState): SettingsState =>
  state.settingsState;

export const selectModId = createSelector(
  settingsState,
  (state) => state.modId,
);
export const selectResearchedTechnologyIds = createSelector(
  settingsState,
  (state) => state.researchedTechnologyIds,
);
export const selectPreset = createSelector(
  settingsState,
  (state) => state.preset,
);
export const selectBeaconReceivers = createSelector(
  settingsState,
  (state) => state.beaconReceivers,
);
export const selectFlowRate = createSelector(
  settingsState,
  (state) => state.flowRate,
);
export const selectInserterTarget = createSelector(
  settingsState,
  (state) => state.inserterTarget,
);
export const selectInserterCapacity = createSelector(
  settingsState,
  (state) => state.inserterCapacity,
);
export const selectDisplayRate = createSelector(
  settingsState,
  (state) => state.displayRate,
);
export const selectMaximizeType = createSelector(
  settingsState,
  (state) => state.maximizeType,
);

/* Complex selectors */
export const selectMod = createSelector(
  selectModId,
  Datasets.selectModEntities,
  (id, data) => data[id],
);

export const selectHash = createSelector(
  selectModId,
  Datasets.selectHash,
  (id, hashEntities) => hashEntities[id],
);

export const selectGame = createSelector(
  selectModId,
  Datasets.selectModEntities,
  (id, data) => data[id]?.game ?? Game.Factorio,
);

export const selectGameStates = createSelector(
  selectGame,
  Preferences.selectStates,
  (game, states) => states[game],
);

export const selectSavedStates = createSelector(selectGameStates, (states) =>
  Object.keys(states)
    .sort()
    .map(
      (i): SelectItem => ({
        label: i,
        value: i,
      }),
    ),
);

export const selectGameInfo = createSelector(
  selectGame,
  (game) => gameInfo[game],
);

export const selectColumnOptions = createSelector(selectGameInfo, (gameInf) =>
  columnOptions(gameInf),
);

export const selectDisplayRateInfo = createSelector(
  selectDisplayRate,
  (displayRate) => displayRateInfo[displayRate],
);

export const selectObjectiveUnitOptions = createSelector(
  selectGame,
  selectDisplayRateInfo,
  (game, dispRateInfo) => objectiveUnitOptions(dispRateInfo, game),
);

export const selectPresetOptions = createSelector(selectGame, (game) =>
  presetOptions(game),
);

export const selectModOptions = createSelector(selectGame, (game) =>
  data.mods
    .filter((b) => b.game === game)
    .map(
      (m): SelectItem => ({
        label: m.name,
        value: m.id,
      }),
    ),
);

export const selectLinkValueOptions = createSelector(selectGame, (game) =>
  linkValueOptions(game),
);

export const selectColumnsState = createSelector(
  selectGameInfo,
  Preferences.selectColumns,
  (gameInfo, columnsState) => {
    return gameColumnsState(
      spread(initialColumnsState, columnsState),
      gameInfo,
    );
  },
);

export const selectDefaults = createSelector(
  selectPreset,
  selectMod,
  (preset, base): Defaults | null => {
    if (base?.defaults == null) return null;

    const m = base.defaults;
    let beacons: BeaconSettings[] = [];
    let moduleRank: string[] | undefined;
    switch (base.game) {
      case Game.Factorio: {
        moduleRank = preset === Preset.Minimum ? undefined : m.moduleRank;
        if (m.beacon) {
          const beacon = base.items.find((i) => i.id === m.beacon)?.beacon;
          if (beacon) {
            const id = m.beacon;
            const modules: ModuleSettings[] = [
              {
                count: rational(beacon.modules),
                id: coalesce(m.beaconModule, ItemId.Module),
              },
            ];

            const count =
              preset < Preset.Beacon8
                ? rational.zero
                : preset === Preset.Beacon8
                  ? rational(8n)
                  : rational(12n);
            beacons = [{ count, id, modules }];
          }
        }
        break;
      }
      case Game.DysonSphereProgram: {
        moduleRank = preset === Preset.Beacon8 ? m.moduleRank : undefined;
        break;
      }
      case Game.FinalFactory:
      case Game.Satisfactory: {
        moduleRank = m.moduleRank;
        break;
      }
    }

    const machineRankIds =
      preset === Preset.Minimum ? m.minMachineRank : m.maxMachineRank;
    return {
      beltId: preset === Preset.Minimum ? m.minBelt : m.maxBelt,
      pipeId: preset === Preset.Minimum ? m.minPipe : m.maxPipe,
      cargoWagonId: m.cargoWagon,
      fluidWagonId: m.fluidWagon,
      excludedRecipeIds: coalesce(m.excludedRecipes, []),
      machineRankIds: coalesce(machineRankIds, []),
      fuelRankIds: coalesce(m.fuelRank, []),
      moduleRankIds: coalesce(moduleRank, []),
      beacons,
    };
  },
);

export const selectI18n = createSelector(
  selectMod,
  Datasets.selectI18n,
  Preferences.selectLanguage,
  (base, i18n, lang) => (base ? i18n[`${base.id}-${lang}`] : null),
);

export const selectDataset = createSelector(
  selectMod,
  selectI18n,
  selectHash,
  selectDefaults,
  selectGame,
  (mod, i18n, hash, defaults, game) => {
    // Map out entities with mods
    const categoryEntities = toEntities(
      coalesce(mod?.categories, []),
      {},
      environment.debug,
    );
    const modIconPath = `data/${mod?.id}/icons.webp`;
    const iconEntities = toEntities(
      coalesce(mod?.icons, []).map((i) => ({
        ...i,
        ...{ file: i.file ?? modIconPath },
      })),
      {},
      environment.debug,
    );
    const itemData = toEntities(
      coalesce(mod?.items, []),
      {},
      environment.debug,
    );
    const recipeData = toEntities(
      coalesce(mod?.recipes, []),
      {},
      environment.debug,
    );
    const limitations = reduceEntities(mod?.limitations ?? {});

    // Apply localization
    if (i18n) {
      for (const i of Object.keys(i18n.categories).filter(
        (i) => categoryEntities[i],
      )) {
        categoryEntities[i] = {
          ...categoryEntities[i],
          ...{
            name: i18n.categories[i],
          },
        };
      }
      for (const i of Object.keys(i18n.items).filter((i) => itemData[i])) {
        itemData[i] = {
          ...itemData[i],
          ...{
            name: i18n.items[i],
          },
        };
      }
      for (const i of Object.keys(i18n.recipes).filter((i) => recipeData[i])) {
        recipeData[i] = {
          ...recipeData[i],
          ...{
            name: i18n.recipes[i],
          },
        };
      }
    }

    // Convert to id arrays
    const categoryIds = Object.keys(categoryEntities);
    const iconIds = Object.keys(iconEntities);
    const itemIds = Object.keys(itemData);
    const recipeIds = Object.keys(recipeData);

    // Generate temporary object arrays
    const items = itemIds.map((i) => parseItem(itemData[i]));
    const recipes = recipeIds.map((r) => parseRecipe(recipeData[r]));

    // Filter for item types
    const beaconIds = items
      .filter(fnPropsNotNullish('beacon'))
      .sort((a, b) => a.beacon.modules.sub(b.beacon.modules).toNumber())
      .map((i) => i.id);
    const beltIds = items
      .filter(fnPropsNotNullish('belt'))
      .sort((a, b) =>
        /** Don't sort belts in DSP, leave based on stacks */
        game === Game.DysonSphereProgram
          ? 0
          : a.belt.speed.sub(b.belt.speed).toNumber(),
      )
      .map((i) => i.id);
    const pipeIds = items
      .filter(fnPropsNotNullish('pipe'))
      .sort((a, b) => a.pipe.speed.sub(b.pipe.speed).toNumber())
      .map((i) => i.id);
    const cargoWagonIds = items
      .filter(fnPropsNotNullish('cargoWagon'))
      .sort((a, b) => a.cargoWagon.size.sub(b.cargoWagon.size).toNumber())
      .map((i) => i.id);
    const fluidWagonIds = items
      .filter(fnPropsNotNullish('fluidWagon'))
      .sort((a, b) =>
        a.fluidWagon.capacity.sub(b.fluidWagon.capacity).toNumber(),
      )
      .map((i) => i.id);
    const machineIds = items
      .filter(fnPropsNotNullish('machine'))
      .map((i) => i.id);
    const modules = items.filter(fnPropsNotNullish('module'));
    const moduleIds = modules.map((i) => i.id);
    const proliferatorModuleIds = modules
      .filter((i) => i.module.sprays != null)
      .map((i) => i.id);
    const fuels = items
      .filter(fnPropsNotNullish('fuel'))
      .sort((a, b) => a.fuel.value.sub(b.fuel.value).toNumber());
    const fuelIds = fuels.map((i) => i.id);
    const technologyIds = items
      .filter(fnPropsNotNullish('technology'))
      .map((r) => r.id);

    // Calculate missing implicit recipe icons
    // For recipes with no icon, use icon of first output item
    recipes
      .filter((r) => !iconEntities[r.id] && !r.icon)
      .forEach((r) => {
        const firstOutId = Object.keys(r.out)[0];
        const firstOutItem = itemData[firstOutId];
        r.icon = firstOutItem.icon ?? firstOutId;
      });

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

    // Calculate recipe item rows
    const categoryRecipeRows: Entities<string[][]> = {};
    for (const id of categoryIds) {
      const rows: string[][] = [[]];
      const rowRecipes = recipes
        .filter((r) => r.category === id)
        .sort((a, b) => a.row - b.row);
      if (rowRecipes.length) {
        let index = rowRecipes[0].row;
        for (const recipe of rowRecipes) {
          if (recipe.row > index) {
            rows.push([]);
            index = recipe.row;
          }
          rows[rows.length - 1].push(recipe.id);
        }
        categoryRecipeRows[id] = rows;
      }
    }

    // Convert to rationals
    const beaconEntities: Entities<Beacon> = {};
    const beltEntities: Entities<Belt> = {};
    const cargoWagonEntities: Entities<CargoWagon> = {};
    const fluidWagonEntities: Entities<FluidWagon> = {};
    const machineEntities: Entities<Machine> = {};
    const moduleEntities: Entities<Module> = {};
    const fuelEntities: Entities<Fuel> = {};
    const technologyEntities: Entities<Technology> = {};
    const itemEntities = items.reduce((e: Entities<Item>, i) => {
      if (i.beacon) beaconEntities[i.id] = i.beacon;

      if (i.belt) beltEntities[i.id] = i.belt;
      else if (i.pipe) beltEntities[i.id] = i.pipe;

      if (i.cargoWagon) cargoWagonEntities[i.id] = i.cargoWagon;
      if (i.fluidWagon) fluidWagonEntities[i.id] = i.fluidWagon;
      if (i.machine) machineEntities[i.id] = i.machine;
      if (i.module) moduleEntities[i.id] = i.module;
      if (i.fuel) fuelEntities[i.id] = i.fuel;
      if (i.technology) technologyEntities[i.id] = i.technology;

      e[i.id] = i;
      return e;
    }, {});
    const recipeEntities = recipes.reduce((e: Entities<Recipe>, r) => {
      e[r.id] = r;
      return e;
    }, {});

    const dataset: Dataset = {
      game,
      version: mod?.version ?? {},
      categoryIds,
      categoryEntities,
      categoryItemRows,
      categoryRecipeRows,
      iconIds,
      iconEntities,
      itemIds,
      itemEntities,
      beaconIds,
      beaconEntities,
      beltIds,
      pipeIds,
      beltEntities,
      cargoWagonIds,
      cargoWagonEntities,
      fluidWagonIds,
      fluidWagonEntities,
      machineIds,
      machineEntities,
      moduleIds,
      proliferatorModuleIds,
      moduleEntities,
      fuelIds,
      fuelEntities,
      recipeIds,
      recipeEntities,
      technologyIds,
      technologyEntities,
      limitations,
      hash,
      defaults,
    };
    return dataset;
  },
);

export const selectAllResearchedTechnologyIds = createSelector(
  selectResearchedTechnologyIds,
  selectDataset,
  (researchedTechnologyIds, data) => {
    const allTechnologyIds = Object.keys(data.technologyEntities);
    if (
      /** No need to parse if all researched */
      researchedTechnologyIds == null ||
      /** Skip if data is not loaded */
      allTechnologyIds.length === 0
    )
      return new Set(allTechnologyIds);

    return researchedTechnologyIds;
  },
);

export const selectSettings = createSelector(
  settingsState,
  selectDefaults,
  selectAllResearchedTechnologyIds,
  (s, d, researchedTechnologyIds): SettingsComplete => ({
    ...s,
    ...{
      beltId: s.beltId ?? d?.beltId,
      pipeId: s.pipeId ?? d?.pipeId,
      cargoWagonId: s.cargoWagonId ?? d?.cargoWagonId,
      fluidWagonId: s.fluidWagonId ?? d?.fluidWagonId,
      excludedRecipeIds: new Set(s.excludedRecipeIds ?? d?.excludedRecipeIds),
      machineRankIds: s.machineRankIds ?? d?.machineRankIds ?? [],
      fuelRankIds: s.fuelRankIds ?? d?.fuelRankIds ?? [],
      moduleRankIds: s.moduleRankIds ?? d?.moduleRankIds ?? [],
      beacons: RecipeUtility.hydrateBeacons(s.beacons, d?.beacons),
      overclock: s.overclock,
      researchedTechnologyIds,
    },
  }),
);

export const selectOptions = createSelector(
  selectDataset,
  (data): Options => ({
    categories: getIdOptions(data.categoryIds, data.categoryEntities),
    items: getIdOptions(data.itemIds, data.itemEntities),
    beacons: getIdOptions(data.beaconIds, data.itemEntities),
    belts: getIdOptions(data.beltIds, data.itemEntities),
    pipes: getIdOptions(data.pipeIds, data.itemEntities),
    cargoWagons: getIdOptions(data.cargoWagonIds, data.itemEntities),
    fluidWagons: getIdOptions(data.fluidWagonIds, data.itemEntities),
    fuels: getIdOptions(data.fuelIds, data.itemEntities),
    modules: getIdOptions(data.moduleIds, data.itemEntities),
    proliferatorModules: getIdOptions(
      data.proliferatorModuleIds,
      data.itemEntities,
      true,
    ),
    machines: getIdOptions(data.machineIds, data.itemEntities),
    recipes: getIdOptions(data.recipeIds, data.recipeEntities),
  }),
);

export const selectBeltSpeed = createSelector(
  selectDataset,
  selectFlowRate,
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
  },
);

export const selectBeltSpeedTxt = createSelector(
  selectBeltSpeed,
  selectDisplayRateInfo,
  (beltSpeed, dispRateInfo) =>
    Object.keys(beltSpeed).reduce((e: Entities<string>, beltId) => {
      const speed = beltSpeed[beltId].mul(dispRateInfo.value);
      e[beltId] = Number(speed.toNumber().toFixed(2)).toString();
      return e;
    }, {}),
);

export const selectInserterData = createSelector(
  selectInserterTarget,
  selectInserterCapacity,
  (target, capacity) => InserterData[target][capacity],
);

export const selectAvailableRecipes = createSelector(
  selectAllResearchedTechnologyIds,
  selectDataset,
  (researchedTechnologyIds, data) =>
    data.recipeIds.filter((i) => {
      const recipe = data.recipeEntities[i];
      return (
        recipe.unlockedBy == null ||
        researchedTechnologyIds.has(recipe.unlockedBy)
      );
    }),
);

export const selectModMenuItem = createSelector(
  selectMod,
  (mod): MenuItem => ({
    icon: 'fa-solid fa-database',
    routerLink: '/data',
    queryParamsHandling: 'preserve',
    label: mod?.name,
  }),
);

export function reduceEntities(
  value: Entities<string[]>,
  init: Entities<Entities<boolean>> = {},
): Entities<Entities<boolean>> {
  return Object.keys(value).reduce((e: Entities<Entities<boolean>>, x) => {
    e[x] = toBoolEntities(value[x], init[x]);
    return e;
  }, init);
}
