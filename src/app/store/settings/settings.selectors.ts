import { createSelector } from '@ngrx/store';
import { SelectItem } from 'primeng/api';

import { environment } from 'src/environments';
import { fnPropsNotNullish, getIdOptions } from '~/helpers';
import {
  BeaconRational,
  BeltRational,
  CargoWagonRational,
  columnOptions,
  CostKey,
  CostRationalSettings,
  Defaults,
  displayRateInfo,
  Entities,
  FluidWagonRational,
  FuelRational,
  Game,
  gameColumnsState,
  gameInfo,
  initialColumnsState,
  InserterData,
  ItemId,
  ItemRational,
  linkValueOptions,
  MachineRational,
  ModuleRational,
  objectiveUnitOptions,
  Options,
  Preset,
  presetOptions,
  Rational,
  RawDataset,
  researchSpeedFactor,
  Technology,
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

export const getModId = createSelector(settingsState, (state) => state.modId);
export const getResearchedTechnologyIds = createSelector(
  settingsState,
  (state) => state.researchedTechnologyIds,
);
export const getNetProductionOnly = createSelector(
  settingsState,
  (state) => state.netProductionOnly,
);
export const getPreset = createSelector(settingsState, (state) => state.preset);
export const getBeaconReceivers = createSelector(
  settingsState,
  (state) => state.beaconReceivers,
);
export const getProliferatorSprayId = createSelector(
  settingsState,
  (state) => state.proliferatorSprayId,
);
export const getFlowRate = createSelector(
  settingsState,
  (state) => state.flowRate,
);
export const getInserterTarget = createSelector(
  settingsState,
  (state) => state.inserterTarget,
);
export const getMiningBonus = createSelector(
  settingsState,
  (state) => state.miningBonus,
);
export const getResearchSpeed = createSelector(
  settingsState,
  (state) => state.researchSpeed,
);
export const getInserterCapacity = createSelector(
  settingsState,
  (state) => state.inserterCapacity,
);
export const getDisplayRate = createSelector(
  settingsState,
  (state) => state.displayRate,
);
export const getMaximizeType = createSelector(
  settingsState,
  (state) => state.maximizeType,
);
export const getSurplusMachinesOutput = createSelector(
  settingsState,
  (state) => state.surplusMachinesOutput,
);
export const getCosts = createSelector(settingsState, (state) => state.costs);

/* Complex selectors */
export const getMod = createSelector(
  getModId,
  Datasets.getModRecord,
  (id, data) => data[id],
);

export const getHash = createSelector(
  getModId,
  Datasets.getHashRecord,
  (id, hashEntities) => hashEntities[id],
);

export const getGame = createSelector(
  getModId,
  Datasets.getModInfoRecord,
  (id, data) => data[id]?.game ?? Game.Factorio,
);

export const getGameStates = createSelector(
  getGame,
  Preferences.getStates,
  (game, states) => states[game],
);

export const getSavedStates = createSelector(getGameStates, (states) =>
  Object.keys(states)
    .sort()
    .map(
      (i): SelectItem => ({
        label: i,
        value: i,
      }),
    ),
);

export const getGameInfo = createSelector(getGame, (game) => gameInfo[game]);

export const getColumnOptions = createSelector(getGameInfo, (gameInf) =>
  columnOptions(gameInf),
);

export const getDisplayRateInfo = createSelector(
  getDisplayRate,
  (displayRate) => displayRateInfo[displayRate],
);

export const getRateUnitOptions = createSelector(
  getGame,
  getDisplayRateInfo,
  (game, dispRateInfo) => objectiveUnitOptions(dispRateInfo, game),
);

export const getPresetOptions = createSelector(getGame, (game) =>
  presetOptions(game),
);

export const getModOptions = createSelector(
  getGame,
  Datasets.getModSets,
  (game, modSets) =>
    modSets
      .filter((b) => b.game === game)
      .map(
        (m): SelectItem => ({
          label: m.name,
          value: m.id,
        }),
      ),
);

export const getLinkValueOptions = createSelector(getGame, (game) =>
  linkValueOptions(game),
);

export const getColumnsState = createSelector(
  getGameInfo,
  Preferences.getColumns,
  (gameInfo, columnsState) => {
    return gameColumnsState(
      { ...initialColumnsState, ...columnsState },
      gameInfo,
    );
  },
);

export const getDefaults = createSelector(getPreset, getMod, (preset, base) => {
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
        beltId: preset === Preset.Minimum ? m.minBelt : m.maxBelt,
        pipeId: preset === Preset.Minimum ? m.minPipe : m.maxPipe,
        fuelId: m.fuel,
        cargoWagonId: m.cargoWagon,
        fluidWagonId: m.fluidWagon,
        excludedRecipeIds: m.excludedRecipes,
        machineRankIds:
          preset === Preset.Minimum ? m.minMachineRank : m.maxMachineRank,
        moduleRankIds: moduleRank,
        beaconCount:
          preset < Preset.Beacon8 ? '0' : preset < Preset.Beacon12 ? '8' : '12',
        beaconId: m.beacon,
        beaconModuleId:
          preset < Preset.Beacon8 ? ItemId.Module : m.beaconModule,
      };
      return defaults;
    }
  }
  return null;
});

export const getSettings = createSelector(
  settingsState,
  getDefaults,
  (s, d) => ({
    ...s,
    ...{
      beltId: s.beltId ?? d?.beltId,
      pipeId: s.pipeId ?? d?.pipeId,
      fuelRankIds: s.fuelRankIds ?? (d?.fuelId ? [d.fuelId] : []),
      cargoWagonId: s.cargoWagonId ?? d?.cargoWagonId,
      fluidWagonId: s.fluidWagonId ?? d?.fluidWagonId,
    },
  }),
);

export const getFuelRankIds = createSelector(getSettings, (s) => s.fuelRankIds);

export const getRationalMiningBonus = createSelector(getMiningBonus, (bonus) =>
  Rational.fromNumber(bonus).div(Rational.hundred),
);

export const getResearchFactor = createSelector(
  getResearchSpeed,
  (speed) => researchSpeedFactor[speed],
);

export const getRationalBeaconReceivers = createSelector(
  getBeaconReceivers,
  (total) => (total ? Rational.fromString(total) : null),
);

export const getRationalFlowRate = createSelector(getFlowRate, (rate) =>
  Rational.fromNumber(rate),
);

export const getRationalCost = createSelector(
  getCosts,
  (cost): CostRationalSettings =>
    (Object.keys(cost) as CostKey[]).reduce(
      (a: Partial<CostRationalSettings>, b) => {
        a[b] = Rational.fromString(cost[b]);
        return a;
      },
      {},
    ) as CostRationalSettings,
);

export const getI18n = createSelector(
  getMod,
  Datasets.getI18nRecord,
  Preferences.getLanguage,
  (base, i18n, lang) => (base ? i18n[`${base.id}-${lang}`] : null),
);

export const getDataset = createSelector(
  getMod,
  getI18n,
  getHash,
  getDefaults,
  getGame,
  (mod, i18n, hash, defaults, game) => {
    // Map out entities with mods
    const categoryEntities = toEntities(
      mod?.categories ?? [],
      {},
      environment.debug,
    );
    const modIconPath = `data/${mod?.id}/icons.webp`;
    const iconEntities = toEntities(
      (mod?.icons ?? []).map((i) => ({
        ...i,
        ...{ file: i.file ?? modIconPath },
      })),
      {},
      environment.debug,
    );
    const itemData = toEntities(mod?.items ?? [], {}, environment.debug);
    const recipeEntities = toEntities(
      mod?.recipes ?? [],
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
      for (const i of Object.keys(i18n.recipes).filter(
        (i) => recipeEntities[i],
      )) {
        recipeEntities[i] = {
          ...recipeEntities[i],
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
    const recipeIds = Object.keys(recipeEntities);

    // Generate temporary object arrays
    const items = itemIds.map((i) => itemData[i]);
    const recipes = recipeIds.map((r) => recipeEntities[r]);

    // Filter for item types
    const beaconIds = items
      .filter(fnPropsNotNullish('beacon'))
      .sort((a, b) => a.beacon.modules - b.beacon.modules)
      .map((i) => i.id);
    const beltIds = items
      .filter(fnPropsNotNullish('belt'))
      .sort((a, b) =>
        /** Don't sort belts in DSP, leave based on stacks */
        game === Game.DysonSphereProgram
          ? 0
          : Rational.from(a.belt.speed)
              .sub(Rational.from(b.belt.speed))
              .toNumber(),
      )
      .map((i) => i.id);
    const pipeIds = items
      .filter(fnPropsNotNullish('pipe'))
      .sort((a, b) =>
        Rational.from(a.pipe.speed).sub(Rational.from(b.pipe.speed)).toNumber(),
      )
      .map((i) => i.id);
    const cargoWagonIds = items
      .filter(fnPropsNotNullish('cargoWagon'))
      .sort((a, b) => a.cargoWagon.size - b.cargoWagon.size)
      .map((i) => i.id);
    const fluidWagonIds = items
      .filter(fnPropsNotNullish('fluidWagon'))
      .sort((a, b) =>
        Rational.from(a.fluidWagon.capacity)
          .sub(Rational.from(b.fluidWagon.capacity))
          .toNumber(),
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
      .sort((a, b) =>
        Rational.from(a.fuel.value).sub(Rational.from(b.fuel.value)).toNumber(),
      );
    const fuelIds = fuels.map((i) => i.id);
    const technologyIds = items
      .filter(fnPropsNotNullish('technology'))
      .map((r) => r.id);

    // Calculate missing implicit recipe icons
    // For recipes with no icon, use icon of first output item
    recipes
      .filter((r) => !iconEntities[r.id] && !recipeEntities[r.id].icon)
      .forEach((r) => {
        const firstOutId = Object.keys(r.out)[0];
        const firstOutItem = itemData[firstOutId];
        
        recipeEntities[r.id] = {
          ...recipeEntities[r.id],
          ...{ icon: firstOutItem.icon ?? firstOutId },
        };
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
    const beaconEntities: Entities<BeaconRational> = {};
    const beltEntities: Entities<BeltRational> = {};
    const cargoWagonEntities: Entities<CargoWagonRational> = {};
    const fluidWagonEntities: Entities<FluidWagonRational> = {};
    const machineEntities: Entities<MachineRational> = {};
    const moduleEntities: Entities<ModuleRational> = {};
    const fuelEntities: Entities<FuelRational> = {};
    const technologyEntities: Entities<Technology> = {};
    const itemEntities = itemIds.reduce((e: Entities<ItemRational>, i) => {
      const item = new ItemRational(itemData[i]);
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

      if (item.machine) {
        machineEntities[i] = item.machine;
      }

      if (item.module) {
        moduleEntities[i] = item.module;
      }

      if (item.fuel) {
        fuelEntities[i] = item.fuel;
      }

      if (item.technology) {
        technologyEntities[i] = item.technology;
      }

      e[i] = item;
      return e;
    }, {});

    const dataset: RawDataset = {
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

export const getOptions = createSelector(
  getDataset,
  (data): Options => ({
    categories: getIdOptions(data.categoryIds, data.categoryEntities),
    items: getIdOptions(data.itemIds, data.itemEntities),
    beacons: getIdOptions(data.beaconIds, data.itemEntities),
    belts: getIdOptions(data.beltIds, data.itemEntities),
    pipes: getIdOptions(data.pipeIds, data.itemEntities),
    cargoWagons: getIdOptions(data.cargoWagonIds, data.itemEntities),
    fluidWagons: getIdOptions(data.fluidWagonIds, data.itemEntities),
    proliferatorModules: getIdOptions(
      data.proliferatorModuleIds,
      data.itemEntities,
      true,
    ),
    fuels: getIdOptions(data.fuelIds, data.itemEntities),
    recipes: getIdOptions(data.recipeIds, data.recipeEntities),
  }),
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
  },
);

export const getBeltSpeedTxt = createSelector(
  getBeltSpeed,
  getDisplayRateInfo,
  (beltSpeed, dispRateInfo) =>
    Object.keys(beltSpeed).reduce((e: Entities<string>, beltId) => {
      const speed = beltSpeed[beltId].mul(dispRateInfo.value);
      e[beltId] = Number(speed.toNumber().toFixed(2)).toString();
      return e;
    }, {}),
);

export const getSettingsModified = createSelector(settingsState, (state) => ({
  costs: state.costs !== initialSettingsState.costs,
}));

export const getInserterData = createSelector(
  getInserterTarget,
  getInserterCapacity,
  (target, capacity) => InserterData[target][capacity],
);

export const getAllResearchedTechnologyIds = createSelector(
  getResearchedTechnologyIds,
  getDataset,
  (researchedTechnologyIds, data) => {
    if (
      /** No need to parse if all researched */
      researchedTechnologyIds == null ||
      /** Skip if data is not loaded */
      Object.keys(data.technologyEntities).length === 0
    )
      return researchedTechnologyIds;

    // Filter out any technology ids that are no longer valid
    const validTechnologyIds = researchedTechnologyIds.filter(
      (i) => data.technologyEntities[i] != null,
    );

    /**
     * Source technology list includes only minimal set of technologies that
     * are not required as prerequisites for other researched technologies,
     * to reduce zip size. Need to rehydrate full list of technology ids using
     * their prerequisites.
     */
    const selection = new Set(validTechnologyIds);

    let addIds: Set<string>;
    do {
      addIds = new Set<string>();

      for (const id of selection) {
        const tech = data.technologyEntities[id];
        tech.prerequisites
          ?.filter((p) => !selection.has(p))
          .forEach((p) => addIds.add(p));
      }

      addIds.forEach((i) => selection.add(i));
    } while (addIds.size);

    return Array.from(selection);
  },
);

export const getAvailableRecipes = createSelector(
  getAllResearchedTechnologyIds,
  getDataset,
  (researchedTechnologyIds, data) => {
    if (researchedTechnologyIds == null) return data.recipeIds;

    const set = new Set(researchedTechnologyIds);
    return data.recipeIds.filter((i) => {
      const recipe = data.recipeEntities[i];
      return recipe.unlockedBy == null || set.has(recipe.unlockedBy);
    });
  },
);

export const getAdjustmentData = createSelector(
  getNetProductionOnly,
  getProliferatorSprayId,
  getRationalMiningBonus,
  getResearchFactor,
  getAvailableRecipes,
  (
    netProductionOnly,
    proliferatorSprayId,
    miningBonus,
    researchSpeed,
    recipeIds,
  ) => ({
    netProductionOnly,
    proliferatorSprayId,
    miningBonus,
    researchSpeed,
    recipeIds,
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
