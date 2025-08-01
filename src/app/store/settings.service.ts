import { computed, effect, inject, Injectable } from '@angular/core';
import { MenuItem, SelectItem } from 'primeng/api';
import { environment } from 'src/environments';

import {
  coalesce,
  fnPropsNotNullish,
  getIdOptions,
  reduceEntities,
  spread,
  toEntities,
} from '~/helpers';
import { DEFAULT_MOD } from '~/models/constants';
import { Beacon } from '~/models/data/beacon';
import { Belt } from '~/models/data/belt';
import { CargoWagon } from '~/models/data/cargo-wagon';
import { FluidWagon } from '~/models/data/fluid-wagon';
import { Fuel } from '~/models/data/fuel';
import { Item, ItemJson, parseItem } from '~/models/data/item';
import { Machine, typeHasCraftingSpeed } from '~/models/data/machine';
import { ModHash } from '~/models/data/mod-hash';
import { ModI18n } from '~/models/data/mod-i18n';
import {
  effectPrecision,
  filterEffect,
  Module,
  ModuleEffect,
} from '~/models/data/module';
import { parseRecipe, Recipe } from '~/models/data/recipe';
import { Technology } from '~/models/data/technology';
import { Dataset } from '~/models/dataset';
import { Defaults } from '~/models/defaults';
import { DisplayRate, displayRateInfo } from '~/models/enum/display-rate';
import { Game } from '~/models/enum/game';
import { InserterCapacity } from '~/models/enum/inserter-capacity';
import { InserterTarget } from '~/models/enum/inserter-target';
import { ItemId } from '~/models/enum/item-id';
import { linkValueOptions } from '~/models/enum/link-value';
import { MaximizeType } from '~/models/enum/maximize-type';
import { objectiveUnitOptions } from '~/models/enum/objective-unit';
import { Preset, presetOptions } from '~/models/enum/preset';
import {
  baseId,
  itemHasQuality,
  Quality,
  qualityId,
  recipeHasQuality,
} from '~/models/enum/quality';
import { researchBonusValue } from '~/models/enum/research-bonus';
import { flags } from '~/models/flags';
import { gameInfo } from '~/models/game-info';
import { Mod } from '~/models/mod';
import { modOptions, Options } from '~/models/options';
import { Rational, rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import {
  columnOptions,
  gameColumnsState,
  initialColumnsState,
} from '~/models/settings/column-settings';
import { CostSettings } from '~/models/settings/cost-settings';
import { ModuleSettings } from '~/models/settings/module-settings';
import { Settings } from '~/models/settings/settings';
import { Entities, Optional } from '~/models/utils';
import { RecipeService } from '~/services/recipe.service';

import { AnalyticsService } from '../services/analytics.service';
import { DatasetsService } from './datasets.service';
import { PreferencesService } from './preferences.service';
import { Store } from './store';

export interface SettingsState {
  modId?: string;
  checkedObjectiveIds: Set<string>;
  maximizeType: MaximizeType;
  requireMachinesOutput: boolean;
  displayRate: DisplayRate;
  excludedItemIds: Set<string>;
  checkedItemIds: Set<string>;
  beltId?: string;
  pipeId?: string;
  cargoWagonId?: string;
  fluidWagonId?: string;
  flowRate: Rational;
  stack?: Rational;
  excludedRecipeIds?: Set<string>;
  checkedRecipeIds: Set<string>;
  netProductionOnly: boolean;
  preset: number;
  machineRankIds?: string[];
  fuelRankIds?: string[];
  moduleRankIds?: string[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  beaconReceivers?: Rational;
  proliferatorSprayId: string;
  inserterTarget: InserterTarget;
  miningBonus: Rational;
  researchBonus: Rational;
  inserterCapacity: InserterCapacity;
  researchedTechnologyIds?: Set<string>;
  locationIds?: Set<string>;
  costs: CostSettings;
}

export type PartialSettingsState = Partial<Omit<SettingsState, 'costs'>> & {
  costs?: Partial<CostSettings>;
};

export const initialSettingsState: SettingsState = {
  checkedObjectiveIds: new Set(),
  preset: Preset.Minimum,
  maximizeType: MaximizeType.Ratio,
  requireMachinesOutput: false,
  displayRate: DisplayRate.PerMinute,
  excludedItemIds: new Set(),
  checkedItemIds: new Set(),
  flowRate: rational(1200n),
  checkedRecipeIds: new Set(),
  netProductionOnly: false,
  proliferatorSprayId: ItemId.Module,
  inserterTarget: InserterTarget.ExpressTransportBelt,
  miningBonus: rational.zero,
  researchBonus: researchBonusValue.speed6,
  inserterCapacity: InserterCapacity.Capacity7,
  costs: {
    factor: rational.one,
    machine: rational.one,
    footprint: rational.one,
    unproduceable: rational(1000000000n),
    excluded: rational.zero,
    surplus: rational.zero,
    maximize: rational(-1000000000n),
    recycling: rational(1000n),
  },
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService extends Store<SettingsState> {
  analyticsSvc = inject(AnalyticsService);
  datasetsSvc = inject(DatasetsService);
  preferencesSvc = inject(PreferencesService);
  recipeSvc = inject(RecipeService);

  displayRate = this.select('displayRate');
  flowRate = this.select('flowRate');
  maximizeType = this.select('maximizeType');
  modId = this.select('modId');
  preset = this.select('preset');
  excludedRecipeIds = this.select('excludedRecipeIds');
  researchedTechnologyIds = this.select('researchedTechnologyIds');

  mod = computed(() => {
    const modId = this.modId();
    if (modId == null) return undefined;
    const entities = this.datasetsSvc.modEntities();
    return entities[modId];
  });

  hash = computed(() => {
    const modId = this.modId();
    if (modId == null) return undefined;
    const datasets = this.datasetsSvc.state();
    return datasets[modId]?.hash;
  });

  i18n = computed(() => {
    const modId = this.modId();
    if (modId == null) return undefined;
    const datasets = this.datasetsSvc.state();
    const lang = this.preferencesSvc.language();
    return datasets[modId]?.i18n?.[lang];
  });
  game = computed(() => {
    const mod = this.mod();
    return coalesce(mod?.game, Game.Factorio);
  });

  modStates = computed(() => {
    const modId = this.modId();
    if (modId == null) return {};
    const states = this.preferencesSvc.states();
    return coalesce(states[modId], {});
  });

  stateOptions = computed(() => {
    const states = this.modStates();
    return Object.keys(states)
      .sort()
      .map((i): SelectItem<string> => ({ label: i, value: i }));
  });

  gameInfo = computed(() => {
    const game = this.game();
    return gameInfo[game];
  });

  displayRateInfo = computed(() => {
    const displayRate = this.displayRate();
    return displayRateInfo[displayRate];
  });

  modOptions = computed(() => {
    const game = this.game();
    return modOptions(game);
  });

  defaults = computed(() => this.computeDefaults(this.mod(), this.preset()));

  dataset = computed(() =>
    this.computeDataset(
      this.mod(),
      this.hash(),
      this.i18n(),
      this.game(),
      this.defaults(),
    ),
  );

  linkValueOptions = computed(() => {
    const data = this.dataset();
    return linkValueOptions(data.flags);
  });

  objectiveUnitOptions = computed(() => {
    const dispRateInfo = this.displayRateInfo();
    const data = this.dataset();
    return objectiveUnitOptions(dispRateInfo, data.flags);
  });

  presetOptions = computed(() => {
    const mod = this.mod();
    const data = this.dataset();
    return presetOptions(data.flags, mod?.defaults);
  });

  columnOptions = computed(() => {
    const data = this.dataset();
    return columnOptions(data.flags);
  });

  columnsState = computed(() => {
    const data = this.dataset();
    const columns = this.preferencesSvc.columns();
    return gameColumnsState(spread(initialColumnsState, columns), data.flags);
  });

  settings = computed(() =>
    this.computeSettings(this.state(), this.defaults(), this.dataset()),
  );

  options = computed((): Options => {
    const data = this.dataset();
    const settings = this.settings();
    const itemSet = new Set(settings.availableItemIds);

    function itemOptions(
      ids: string[],
      exclude?: Set<string>,
    ): SelectItem<string>[] {
      return getIdOptions(ids, data.itemEntities, itemSet, exclude);
    }

    const result = {
      categories: getIdOptions(data.categoryIds, data.categoryEntities),
      items: itemOptions(data.itemIds),
      beacons: itemOptions(data.beaconIds),
      belts: itemOptions(data.beltIds, data.itemQIds),
      pipes: itemOptions(data.pipeIds),
      cargoWagons: itemOptions(data.cargoWagonIds, data.itemQIds),
      fluidWagons: itemOptions(data.fluidWagonIds, data.itemQIds),
      fuels: itemOptions(data.fuelIds, data.itemQIds),
      modules: itemOptions(data.moduleIds),
      proliferatorModules: getIdOptions(
        data.proliferatorModuleIds,
        data.itemEntities,
        itemSet,
        new Set(),
        true,
      ),
      machines: itemOptions(data.machineIds),
      recipes: getIdOptions(
        data.recipeIds,
        data.recipeEntities,
        new Set(settings.availableRecipeIds),
      ),
      locations: getIdOptions(data.locationIds, data.locationEntities),
    };

    return result;
  });

  beltSpeed = computed(() => {
    const data = this.dataset();
    const flowRate = this.flowRate();

    const value: Entities<Rational> = { [ItemId.Pipe]: flowRate };
    if (data.beltIds) {
      for (const id of data.beltIds) value[id] = data.beltEntities[id].speed;
    }

    if (data.pipeIds) {
      for (const id of data.pipeIds) value[id] = data.beltEntities[id].speed;
    }

    return value;
  });

  beltSpeedTxt = computed(() => {
    const beltSpeed = this.beltSpeed();
    const dispRateInfo = this.displayRateInfo();

    return Object.keys(beltSpeed).reduce((e: Entities, beltId) => {
      const speed = beltSpeed[beltId].mul(dispRateInfo.value);
      e[beltId] = Number(speed.toNumber().toFixed(2)).toString();
      return e;
    }, {});
  });

  modMenuItem = computed((): MenuItem => {
    const mod = this.mod();

    return {
      icon: 'fa-solid fa-database',
      routerLink: `/${coalesce(mod?.id, DEFAULT_MOD)}/data`,
      queryParamsHandling: 'preserve',
      label: mod?.name,
    };
  });

  constructor() {
    super(initialSettingsState, ['costs']);

    effect(() => {
      const modId = this.modId();
      if (modId) this.analyticsSvc.event('set_mod_id', modId);
    });

    effect(() => {
      const mod = this.mod();
      if (mod) this.analyticsSvc.event('set_game', mod.game);
    });
  }

  computeDefaults(
    mod: Optional<Mod>,
    presetSetting: number,
  ): Optional<Defaults> {
    if (mod?.defaults == null) return;

    const m = mod.defaults;
    if ('presets' in m) {
      const p = coalesce(
        m.presets.find((p) => p.id === presetSetting),
        coalesce(m.presets[0], { id: 0, label: '' }),
      );
      let beacons: BeaconSettings[] = [];
      const beaconId = coalesce(p.beacon, m.beacon);
      if (beaconId) {
        const beaconBaseId = baseId(beaconId);
        const beacon = mod.items.find((i) => i.id === beaconBaseId)?.beacon;
        if (beacon) {
          const beaconModule = coalesce(p.beaconModule, m.beaconModule);
          const modules: ModuleSettings[] = [
            {
              count: rational(beacon.modules),
              id: coalesce(beaconModule, ItemId.Module),
            },
          ];
          const count = rational(coalesce(p.beaconCount, 0));
          beacons = [{ count, id: beaconId, modules }];
        }
      }
      const excludedRecipe = coalesce(p.excludedRecipes, m.excludedRecipes);
      const machineRank = coalesce(p.machineRank, m.machineRank);
      const fuelRank = coalesce(p.fuelRank, m.fuelRank);
      const moduleRank = coalesce(p.moduleRank, m.moduleRank);
      return {
        locations: coalesce(p.locations, m.locations),
        beltId: coalesce(p.belt, m.belt),
        beltStack: rational(coalesce(p.beltStack, m.beltStack)),
        pipeId: coalesce(p.pipe, m.pipe),
        cargoWagonId: coalesce(p.cargoWagon, m.cargoWagon),
        fluidWagonId: coalesce(p.fluidWagon, m.fluidWagon),
        excludedRecipeIds: coalesce(excludedRecipe, []),
        machineRankIds: coalesce(machineRank, []),
        fuelRankIds: coalesce(fuelRank, []),
        moduleRankIds: coalesce(moduleRank, []),
        beacons,
      };
    }

    const preset = presetSetting as Preset;
    let beacons: BeaconSettings[] = [];
    let moduleRank: string[] | undefined;
    let overclock: Rational | undefined;
    switch (mod.game) {
      case Game.Factorio: {
        moduleRank = preset === Preset.Minimum ? undefined : m.moduleRank;
        if (m.beacon) {
          const beacon = mod.items.find((i) => i.id === m.beacon)?.beacon;
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
      case Game.Satisfactory: {
        moduleRank = m.moduleRank;
        overclock = rational(100n);
        break;
      }
      case Game.FinalFactory: {
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
      overclock,
    };
  }

  computeDataset(
    mod: Optional<Mod>,
    hash: Optional<ModHash>,
    i18n: Optional<ModI18n>,
    game: Game,
    defaults: Optional<Defaults>,
  ): Dataset {
    // Map out entities with mods
    const categoryEntities = toEntities(
      coalesce(mod?.categories, []),
      environment.debug,
    );
    const iconFile = `data/${coalesce(mod?.id, DEFAULT_MOD)}/icons.webp`;
    const iconEntities = toEntities(
      coalesce(mod?.icons, []),
      environment.debug,
    );
    const itemData = toEntities(coalesce(mod?.items, []), environment.debug);
    const recipeData = toEntities(
      coalesce(mod?.recipes, []),
      environment.debug,
    );
    const limitations = reduceEntities(coalesce(mod?.limitations, {}));
    const locationEntities = toEntities(
      coalesce(mod?.locations, []),
      environment.debug,
    );

    // Apply localization
    if (i18n) {
      for (const i of Object.keys(i18n.categories).filter(
        (i) => categoryEntities[i],
      )) {
        categoryEntities[i] = spread(categoryEntities[i], {
          name: i18n.categories[i],
        });
      }

      for (const i of Object.keys(i18n.items).filter((i) => itemData[i]))
        itemData[i] = spread(itemData[i], { name: i18n.items[i] });

      for (const i of Object.keys(i18n.recipes).filter((i) => recipeData[i]))
        recipeData[i] = spread(recipeData[i], { name: i18n.recipes[i] });

      if (i18n.locations) {
        for (const i of Object.keys(i18n.locations).filter(
          (i) => locationEntities[i],
        )) {
          locationEntities[i] = spread(locationEntities[i], {
            name: i18n.locations[i],
          });
        }
      }
    }

    // Convert to id arrays
    const categoryIds = Object.keys(categoryEntities);
    const iconIds = Object.keys(iconEntities);
    const itemIds = Object.keys(itemData);
    const recipeIds = Object.keys(recipeData);
    const locationIds = Object.keys(locationEntities);

    // Generate temporary object arrays
    const items = itemIds.map((i) => parseItem(itemData[i]));
    const recipes = recipeIds.map((r) => parseRecipe(recipeData[r]));

    // Calculate missing implicit recipe icons
    // For recipes with no icon, use icon of first output item
    recipes
      .filter((r) => !iconEntities[r.id] && !r.icon)
      .forEach((r) => {
        const firstOutId = Object.keys(r.out)[0];
        const firstOutItem = itemData[firstOutId];
        r.icon = firstOutItem.icon ?? firstOutId;
      });

    const itemQIds = new Set<string>();
    const recipeQIds = new Set<string>();
    const _flags = flags[coalesce(mod?.flags, DEFAULT_MOD)];
    if (_flags.has('quality')) {
      const qualities = [
        Quality.Uncommon,
        Quality.Rare,
        Quality.Epic,
        Quality.Legendary,
      ];
      recipes.forEach((r) => {
        r.producers = [
          ...r.producers,
          ...qualities.flatMap((q) => r.producers.map((p) => qualityId(p, q))),
        ];
      });
      const itemsLen = items.length;
      const recipesLen = recipes.length;
      qualities.forEach((quality) => {
        for (let i = 0; i < itemsLen; i++) {
          const item = items[i];
          if (!itemHasQuality(item)) continue;

          const id = qualityId(item.id, quality);
          itemQIds.add(id);
          itemIds.push(id);
          const qItem = spread(item, {
            id,
            quality,
            icon: coalesce(item.icon, item.id),
          });

          if (
            qItem.machine?.speed &&
            qItem.machine.entityType &&
            typeHasCraftingSpeed.has(qItem.machine.entityType)
          ) {
            const speed = rational(quality)
              .mul(rational(3n, 10n))
              .add(rational.one)
              .mul(qItem.machine.speed);
            qItem.machine = spread(qItem.machine, { speed });
          }

          if (qItem.module) {
            const factor = rational(quality)
              .mul(rational(3n, 10n))
              .add(rational.one);

            for (const eff of Object.keys(effectPrecision) as ModuleEffect[]) {
              if (qItem.module[eff] && !filterEffect(qItem.module, eff)) {
                let value = qItem.module[eff].mul(factor);
                value = value.trunc(effectPrecision[eff]);
                qItem.module = spread(qItem.module, { [eff]: value });
              }
            }
          }

          if (qItem.beacon) {
            const effectivity = rational(quality)
              .mul(rational(2n, 15n))
              .add(rational.one)
              .mul(qItem.beacon.effectivity);

            qItem.beacon = spread(qItem.beacon, { effectivity });

            if (qItem.beacon.usage) {
              const usage = rational.one
                .sub(rational(quality).mul(rational(1n, 6n)))
                .mul(qItem.beacon.usage);
              qItem.beacon = spread(qItem.beacon, { usage });
            }
          }

          if (qItem.pipe) {
            const factor = rational(quality)
              .mul(rational(3n, 10n))
              .add(rational.one);
            const speed = qItem.pipe.speed.mul(factor);
            qItem.pipe = spread(qItem.pipe, { speed });
          }

          items.push(qItem);
        }

        for (let i = 0; i < recipesLen; i++) {
          const recipe = recipes[i];
          if (!recipeHasQuality(recipe, itemData)) continue;

          const id = qualityId(recipe.id, quality);
          recipeQIds.add(id);
          recipeIds.push(id);

          const qIn = this.qualityEntities(
            recipe.in,
            quality,
            itemData,
            recipe.flags.has('technology'),
          );
          const qOut = recipe.flags.has('technology')
            ? recipe.out
            : this.qualityEntities(recipe.out, quality, itemData);
          let qCatalyst: Optional<Entities<Rational>>;
          if (recipe.catalyst)
            qCatalyst = this.qualityEntities(
              recipe.catalyst,
              quality,
              itemData,
            );

          recipes.push(
            spread(recipe, {
              id,
              in: qIn,
              out: qOut,
              catalyst: qCatalyst,
              quality,
              icon: coalesce(recipe.icon, recipe.id),
            }),
          );
        }
      });
    }

    // Filter for item types
    const beaconIds = items
      .filter(fnPropsNotNullish('beacon'))
      .sort((a, b) => a.beacon.modules.sub(b.beacon.modules).toNumber())
      .map((i) => i.id);
    const beltIds = items
      .filter(fnPropsNotNullish('belt'))
      .sort((a, b) => a.belt.speed.sub(b.belt.speed).toNumber())
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
    const noRecipeItemIds = new Set(itemIds);
    const recipeEntities = recipes.reduce((e: Entities<Recipe>, r) => {
      Object.keys(r.out).forEach((i) => {
        if ((r.in[i] ?? 0) < r.out[i]) noRecipeItemIds.delete(i);
      });

      e[r.id] = r;
      return e;
    }, {});

    if (_flags.has('quality')) {
      const qualities = [
        Quality.Uncommon,
        Quality.Rare,
        Quality.Epic,
        Quality.Legendary,
      ];
      for (const quality of qualities) {
        for (const techId in technologyEntities) {
          const tech = technologyEntities[techId];
          if (tech.prodUpgrades) {
            for (const recipeId of tech.prodUpgrades.slice()) {
              const id = qualityId(recipeId, quality);
              if (recipeQIds.has(id)) tech.prodUpgrades.push(id);
            }
          }
        }
      }
    }

    const prodUpgradeTechs: string[] = [];
    const prodUpgrades: Entities<string[]> = {};
    for (const techId in technologyEntities) {
      if (technologyEntities[techId].prodUpgrades) {
        prodUpgradeTechs.push(techId);
        prodUpgrades[techId] = technologyEntities[techId].prodUpgrades;
      }
    }

    return {
      game,
      modId: coalesce(mod?.id, DEFAULT_MOD),
      info: gameInfo[game],
      flags: _flags,
      version: coalesce(mod?.version, {}),
      categoryIds,
      categoryEntities,
      categoryItemRows,
      categoryRecipeRows,
      iconFile,
      iconIds,
      iconEntities,
      itemIds,
      itemQIds,
      itemEntities,
      noRecipeItemIds,
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
      recipeQIds,
      recipeEntities,
      prodUpgradeTechs,
      prodUpgrades,
      technologyIds,
      technologyEntities,
      locationIds,
      locationEntities,
      limitations,
      hash,
      defaults,
    };
  }

  computeSettings(
    state: SettingsState,
    defaults: Optional<Defaults>,
    data: Dataset,
  ): Settings {
    const techIds = state.researchedTechnologyIds;
    const allTechnologyIds = Object.keys(data.technologyEntities);
    let researchedTechnologyIds = new Set(allTechnologyIds);
    if (techIds != null && allTechnologyIds.length > 0) {
      // Filter for only technologies that still exist in this data set
      const filteredTechs = Array.from(techIds).filter((i) =>
        researchedTechnologyIds.has(i),
      );
      researchedTechnologyIds = new Set(filteredTechs);
    }

    const locIds = state.locationIds;
    const defaultLocationIds =
      defaults?.locations ?? Object.keys(data.locationEntities);
    let locationIds = new Set(defaultLocationIds);
    if (locIds != null && defaultLocationIds.length > 0) locationIds = locIds;

    let quality = Quality.Normal;
    if (data.flags.has('quality')) {
      if (researchedTechnologyIds.has(ItemId.LegendaryQuality))
        quality = Quality.Legendary;
      else if (researchedTechnologyIds.has(ItemId.EpicQuality))
        quality = Quality.Epic;
      else if (researchedTechnologyIds.has(ItemId.QualityModuleTechnology))
        quality = Quality.Rare;
    }

    // List of recipes that have been unlocked by technology
    const unlockedRecipes = data.recipeIds
      .map((r) => data.recipeEntities[r])
      .filter(
        (r) =>
          (!r.flags.has('locked') ||
            Array.from(researchedTechnologyIds).some((t) =>
              data.technologyEntities[t].unlockedRecipes?.includes(
                baseId(r.id),
              ),
            )) &&
          (r.quality == null || r.quality <= quality),
      );

    // Initialize list of items with those that have no recipe
    const noRecipeQualItemIds = Array.from(data.noRecipeItemIds)
      .map((i) => data.itemEntities[i])
      .filter((i) => i.quality == null || i.quality < quality)
      .map((i) => i.id);
    const availableItemIds = new Set(noRecipeQualItemIds);
    // Add all items that are consumed or produced by unlocked recipes
    unlockedRecipes.forEach((r) => {
      Object.keys(r.in).forEach((i) => availableItemIds.add(i));
      Object.keys(r.out).forEach((i) => availableItemIds.add(i));
    });

    // Limit available recipes based on locations and whether machines are available
    const availableRecipes = unlockedRecipes.filter(
      (r) =>
        (r.locations == null || r.locations.some((l) => locationIds.has(l))) &&
        r.producers.some(
          (p) =>
            availableItemIds.has(p) &&
            (data.machineEntities[p].locations == null ||
              data.machineEntities[p].locations.some((l) =>
                locationIds.has(l),
              )),
        ),
    );
    const availableRecipeIds = new Set(availableRecipes.map((r) => r.id));

    function pickItemId(
      itemId: Optional<string>,
      defaultId: Optional<string>,
    ): Optional<string> {
      itemId = coalesce(itemId, defaultId);
      if (!itemId || !availableItemIds.has(itemId)) return undefined;
      return itemId;
    }

    function pickItemIds(
      itemIds: Optional<string[]>,
      defaultIds: string[],
    ): string[] {
      itemIds = coalesce(itemIds, defaultIds);
      return itemIds.filter((i) => availableItemIds.has(i));
    }

    const defaultBeltId = defaults?.beltId;
    const beltId = pickItemId(state.beltId, defaultBeltId);
    const defaultPipeId = defaults?.pipeId;
    const pipeId = pickItemId(state.pipeId, defaultPipeId);
    const defaultCargoWagonId = defaults?.cargoWagonId;
    const cargoWagonId = pickItemId(state.cargoWagonId, defaultCargoWagonId);
    const defaultFluidWagonId = defaults?.fluidWagonId;
    const fluidWagonId = pickItemId(state.fluidWagonId, defaultFluidWagonId);
    const defaultMachineRankIds = coalesce(defaults?.machineRankIds, []);
    const machineRankIds = pickItemIds(
      state.machineRankIds,
      defaultMachineRankIds,
    ).filter(
      (m) =>
        data.machineEntities[m].locations == null ||
        data.machineEntities[m].locations.some((l) => locationIds.has(l)),
    );
    const defaultFuelRankIds = coalesce(defaults?.fuelRankIds, []);
    const fuelRankIds = pickItemIds(state.fuelRankIds, defaultFuelRankIds);
    const defaultModuleRankIds = coalesce(defaults?.moduleRankIds, []);
    const moduleRankIds = pickItemIds(
      state.moduleRankIds,
      defaultModuleRankIds,
    );
    let defaultBeacons = defaults?.beacons;
    if (defaultBeacons) {
      // Prune default beacons to available beacons / modules
      defaultBeacons = defaultBeacons
        .map((b) => {
          if (b.id && !availableItemIds.has(b.id))
            b = spread(b, { id: undefined });
          if (b.modules) {
            b = spread(b, {
              modules: b.modules.map((m) => {
                if (m.id && !availableItemIds.has(m.id))
                  m = spread(m, { id: ItemId.Module });
                return m;
              }),
            });
          }
          return b;
        })
        .filter((b) => b.id);
    }
    const defaultExcludedRecipeIds = new Set(defaults?.excludedRecipeIds);
    const excludedRecipeIds = coalesce(
      state.excludedRecipeIds,
      defaultExcludedRecipeIds,
    );

    return spread(state as Settings, {
      beltId,
      defaultBeltId,
      stack: coalesce(state.stack, defaults?.beltStack),
      pipeId,
      defaultPipeId,
      cargoWagonId,
      defaultCargoWagonId,
      fluidWagonId,
      defaultFluidWagonId,
      excludedRecipeIds,
      defaultExcludedRecipeIds,
      machineRankIds,
      defaultMachineRankIds,
      fuelRankIds,
      defaultFuelRankIds,
      moduleRankIds,
      defaultModuleRankIds,
      beacons: this.recipeSvc.hydrateBeacons(state.beacons, defaultBeacons),
      overclock: state.overclock ?? defaults?.overclock,
      researchedTechnologyIds,
      locationIds,
      defaultLocationIds: new Set(data.locationIds),
      availableRecipeIds,
      availableItemIds,
      quality,
    });
  }

  private qualityEntities(
    entities: Entities<Rational>,
    quality: Quality,
    itemData: Entities<ItemJson>,
    qualityDurability = false,
  ): Entities<Rational> {
    const factor = qualityDurability
      ? rational.one.add(rational(quality))
      : rational.one;
    return Object.keys(entities).reduce((e: Entities<Rational>, k) => {
      if (itemData[k].stack) {
        e[qualityId(k, quality)] = entities[k].div(factor);
      } else e[k] = entities[k];
      return e;
    }, {});
  }
}
