import { computed, effect, inject, Injectable } from '@angular/core';

import { DEFAULT_MOD, modOptions } from '~/data/datasets';
import { Game } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { IconType } from '~/data/icon-type';
import { Mod } from '~/data/mod';
import { Beacon } from '~/data/schema/beacon';
import { Belt, PIPE } from '~/data/schema/belt';
import { CargoWagon } from '~/data/schema/cargo-wagon';
import { Category } from '~/data/schema/category';
import { FluidWagon } from '~/data/schema/fluid-wagon';
import { Fuel } from '~/data/schema/fuel';
import { getViewBox, IconData, IconJson } from '~/data/schema/icon-data';
import { Item, ItemJson, parseItem } from '~/data/schema/item';
import { Machine, typeHasCraftingSpeed } from '~/data/schema/machine';
import { ModHash } from '~/data/schema/mod-hash';
import { ModI18n } from '~/data/schema/mod-i18n';
import {
  effectPrecision,
  filterEffect,
  Module,
  ModuleEffect,
} from '~/data/schema/module';
import {
  baseId,
  EPIC_QUALITY,
  itemHasQuality,
  LEGENDARY_QUALITY,
  Quality,
  QUALITY_MODULE_TECHNOLOGY,
  qualityId,
  recipeHasQuality,
} from '~/data/schema/quality';
import { parseRecipe, Recipe } from '~/data/schema/recipe';
import { Technology } from '~/data/schema/technology';
import { getIdOptions, Option, OptionParams } from '~/option/option';
import { Rational, rational } from '~/rational/rational';
import { flags } from '~/state/flags';
import { log } from '~/utils/log';
import { coalesce, fnPropsNotNullish } from '~/utils/nullish';
import { spread } from '~/utils/object';
import { reduceRecord, toRecord } from '~/utils/record';

import { BeaconSettings } from '../beacon-settings';
import { DatasetsStore } from '../datasets/datasets-store';
import { Hydration } from '../hydration';
import { ModuleSettings } from '../module-settings';
import { objectiveUnitOptions } from '../objectives/objective-unit';
import { columnOptions, gameColumnsState } from '../preferences/columns-state';
import { linkValueOptions } from '../preferences/link-value';
import { PreferencesStore } from '../preferences/preferences-store';
import { Store } from '../store';
import { Dataset } from './dataset';
import { Defaults } from './defaults';
import { displayRateInfo } from './display-rate';
import { Options } from './options';
import { Preset, presetOptions } from './preset';
import { Settings } from './settings';
import { initialSettingsState, SettingsState } from './settings-state';
import { systemIconsRecord } from './system-icons';

@Injectable({ providedIn: 'root' })
export class SettingsStore extends Store<SettingsState> {
  private readonly datasetsStore = inject(DatasetsStore);
  private readonly hydration = inject(Hydration);
  private readonly preferencesStore = inject(PreferencesStore);

  modId = this.select('modId');
  maximizeType = this.select('maximizeType');
  displayRate = this.select('displayRate');
  flowRate = this.select('flowRate');
  preset = this.select('preset');
  researchedTechnologyIds = this.select('researchedTechnologyIds');

  mod = computed(() => {
    const modId = this.modId();
    if (modId == null) return undefined;
    const record = this.datasetsStore.modRecord();
    return record[modId];
  });

  hash = computed(() => {
    const modId = this.modId();
    if (modId == null) return undefined;
    const datasets = this.datasetsStore.state();
    return datasets[modId]?.hash;
  });

  i18n = computed(() => {
    const modId = this.modId();
    if (modId == null) return undefined;
    const datasets = this.datasetsStore.state();
    const lang = this.preferencesStore.language();
    return datasets[modId]?.i18n?.[lang];
  });

  game = computed(() => {
    const mod = this.mod();
    return coalesce<Game>(mod?.game, 'factorio');
  });

  modStates = computed(() => {
    const modId = this.modId();
    if (modId == null) return {};
    const states = this.preferencesStore.states();
    return coalesce(states[modId], {});
  });

  stateOptions = computed(() => {
    const states = this.modStates();
    return Object.keys(states)
      .sort()
      .map((i): Option => ({ label: i, value: i }));
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
    this.computeDataset(this.mod(), this.hash(), this.i18n(), this.game()),
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
    const columns = this.preferencesStore.columns();
    return gameColumnsState(columns, data.flags);
  });

  settings = computed(() =>
    this.computeSettings(this.state(), this.defaults(), this.dataset()),
  );

  options = computed((): Options => {
    const data = this.dataset();
    const settings = this.settings();
    const itemSet = new Set(settings.availableItemIds);

    function itemOptions(ids: string[], params?: OptionParams): Option[] {
      return getIdOptions(ids, data.itemRecord, {
        ...params,
        ...{ include: itemSet, iconType: 'item' },
      });
    }

    return {
      categories: getIdOptions(data.categoryIds, data.categoryRecord),
      beacons: itemOptions(data.beaconIds, { tooltipType: 'beacon' }),
      belts: itemOptions(data.beltIds, {
        exclude: data.itemQIds,
        tooltipType: 'belt',
      }),
      pipes: itemOptions(data.pipeIds, { tooltipType: 'pipe' }),
      cargoWagons: itemOptions(data.cargoWagonIds, {
        exclude: data.itemQIds,
        tooltipType: 'wagon',
      }),
      fluidWagons: itemOptions(data.fluidWagonIds, {
        exclude: data.itemQIds,
        tooltipType: 'wagon',
      }),
      fuels: itemOptions(data.fuelIds, {
        exclude: data.itemQIds,
        tooltipType: 'fuel',
      }),
      modules: itemOptions(data.moduleIds, { tooltipType: 'module' }),
      proliferatorModules: itemOptions(data.proliferatorModuleIds, {
        emptyModule: true,
        include: itemSet,
        tooltipType: 'module',
      }),
      machines: itemOptions(data.machineIds, { tooltipType: 'machine' }),
      locations: getIdOptions(data.locationIds, data.locationRecord, {
        iconType: 'location',
      }),
    };
  });

  beltSpeed = computed(() => {
    const data = this.dataset();
    const flowRate = this.flowRate();

    const value: Record<string, Rational> = { [PIPE]: flowRate };
    if (data.beltIds) {
      for (const id of data.beltIds) value[id] = data.beltRecord[id].speed;
    }

    if (data.pipeIds) {
      for (const id of data.pipeIds) value[id] = data.beltRecord[id].speed;
    }

    return value;
  });

  beltSpeedTxt = computed(() => {
    const beltSpeed = this.beltSpeed();
    const dispRateInfo = this.displayRateInfo();

    return Object.keys(beltSpeed).reduce(
      (e: Record<string, string>, beltId) => {
        const speed = beltSpeed[beltId].mul(dispRateInfo.value);
        e[beltId] = Number(speed.toNumber().toFixed(2)).toString();
        return e;
      },
      {},
    );
  });

  modMenuItem = computed((): unknown => {
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
      if (modId) log('set_mod_id', modId);
    });

    effect(() => {
      const mod = this.mod();
      if (mod) log('set_game', mod.game);
    });
  }

  computeDefaults(
    mod: Mod | undefined,
    presetSetting: number,
  ): Defaults | undefined {
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
              id: coalesce(beaconModule, ''),
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
      case 'factorio': {
        moduleRank = preset === Preset.Minimum ? undefined : m.moduleRank;
        if (m.beacon) {
          const beacon = mod.items.find((i) => i.id === m.beacon)?.beacon;
          if (beacon) {
            const id = m.beacon;
            const modules: ModuleSettings[] = [
              {
                count: rational(beacon.modules),
                id: coalesce(m.beaconModule, ''),
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
      case 'dyson-sphere-program': {
        moduleRank = preset === Preset.Beacon8 ? m.moduleRank : undefined;
        break;
      }
      case 'satisfactory': {
        moduleRank = m.moduleRank;
        overclock = rational(100n);
        break;
      }
      case 'final-factory': {
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
    mod: Mod | undefined,
    hash: ModHash | undefined,
    i18n: ModI18n | undefined,
    game: Game,
  ): Dataset {
    // Map out records with mods
    const categoryRecord = toRecord(coalesce(mod?.categories, []));
    const iconData = toRecord(coalesce(mod?.icons, []));
    const itemData = toRecord(coalesce(mod?.items, []));
    const recipeData = toRecord(coalesce(mod?.recipes, []));
    const limitations = reduceRecord(coalesce(mod?.limitations, {}));
    const locationRecord = toRecord(coalesce(mod?.locations, []));

    // Apply localization
    if (i18n) {
      for (const i of Object.keys(i18n.categories).filter(
        (i) => categoryRecord[i],
      )) {
        categoryRecord[i] = spread(categoryRecord[i], {
          name: i18n.categories[i],
        });
      }

      for (const i of Object.keys(i18n.items).filter((i) => itemData[i]))
        itemData[i] = spread(itemData[i], { name: i18n.items[i] });

      for (const i of Object.keys(i18n.recipes).filter((i) => recipeData[i]))
        recipeData[i] = spread(recipeData[i], { name: i18n.recipes[i] });

      if (i18n.locations) {
        for (const i of Object.keys(i18n.locations).filter(
          (i) => locationRecord[i],
        )) {
          locationRecord[i] = spread(locationRecord[i], {
            name: i18n.locations[i],
          });
        }
      }
    }

    // Convert to id arrays
    const categoryIds = Object.keys(categoryRecord);
    const iconIds = Object.keys(iconData);
    const itemIds = Object.keys(itemData);
    const recipeIds = Object.keys(recipeData);
    const locationIds = Object.keys(locationRecord);

    // Generate temporary object arrays
    const items = itemIds.map((i) => parseItem(itemData[i]));
    const recipes = recipeIds.map((r) => parseRecipe(recipeData[r]));

    // Calculate missing implicit recipe icons
    // For recipes with no icon, use icon of first output item
    recipes
      .filter((r) => !iconData[r.id] && !r.icon)
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

          const qIn = this.qualityRecord(
            recipe.in,
            quality,
            itemData,
            recipe.flags.has('technology'),
          );
          const qOut = recipe.flags.has('technology')
            ? recipe.out
            : this.qualityRecord(recipe.out, quality, itemData);
          let qCatalyst: Record<string, Rational> | undefined;
          if (recipe.catalyst)
            qCatalyst = this.qualityRecord(recipe.catalyst, quality, itemData);

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
    const itemCategoryRows: Record<string, string[][]> = {};
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

        itemCategoryRows[id] = rows;
      }
    }

    // Calculate recipe item rows
    const recipeCategoryRows: Record<string, string[][]> = {};
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

        recipeCategoryRows[id] = rows;
      }
    }

    // Convert to rationals
    const beaconRecord: Record<string, Beacon> = {};
    const beltRecord: Record<string, Belt> = {};
    const cargoWagonRecord: Record<string, CargoWagon> = {};
    const fluidWagonRecord: Record<string, FluidWagon> = {};
    const machineRecord: Record<string, Machine> = {};
    const moduleRecord: Record<string, Module> = {};
    const fuelRecord: Record<string, Fuel> = {};
    const technologyRecord: Record<string, Technology> = {};
    const itemRecord = items.reduce((e: Record<string, Item>, i) => {
      if (i.beacon) beaconRecord[i.id] = i.beacon;

      if (i.belt) beltRecord[i.id] = i.belt;
      else if (i.pipe) beltRecord[i.id] = i.pipe;

      if (i.cargoWagon) cargoWagonRecord[i.id] = i.cargoWagon;
      if (i.fluidWagon) fluidWagonRecord[i.id] = i.fluidWagon;
      if (i.machine) machineRecord[i.id] = i.machine;
      if (i.module) moduleRecord[i.id] = i.module;
      if (i.fuel) fuelRecord[i.id] = i.fuel;
      if (i.technology) technologyRecord[i.id] = i.technology;

      e[i.id] = i;
      return e;
    }, {});
    const noRecipeItemIds = new Set(itemIds);
    const recipeRecord = recipes.reduce((e: Record<string, Recipe>, r) => {
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
        for (const techId in technologyRecord) {
          const tech = technologyRecord[techId];
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
    const prodUpgrades: Record<string, string[]> = {};
    for (const techId in technologyRecord) {
      if (technologyRecord[techId].prodUpgrades) {
        prodUpgradeTechs.push(techId);
        prodUpgrades[techId] = technologyRecord[techId].prodUpgrades;
      }
    }

    const file = `data/${coalesce(mod?.id, DEFAULT_MOD)}/icons.webp`;
    const image = `url("${file}")`;
    function toIconRecord(
      ids: string[],
      rec: Record<string, Category | Item | Recipe | IconJson>,
    ): Record<string, IconData> {
      return ids.reduce<Record<string, IconData>>((e, i) => {
        const entity = rec[i];
        const id = coalesce((entity as Category | Item | Recipe).icon, i);
        const data = iconData[id];
        const text = (entity as Category | Item | Recipe).iconText;
        const quality = (entity as Item | Recipe).quality;
        const viewBox = getViewBox(data.position);
        e[i] = { ...data, file, image, viewBox, text, quality };
        return e;
      }, {});
    }

    // Generate Icon Record
    const iconRecord: Record<IconType, Record<string, IconData>> = {
      system: systemIconsRecord,
      game: toIconRecord(iconIds, iconData),
      category: toIconRecord(categoryIds, categoryRecord),
      item: toIconRecord(itemIds, itemRecord),
      recipe: toIconRecord(recipeIds, recipeRecord),
      location: toIconRecord(locationIds, locationRecord),
    };

    return {
      game,
      modId: coalesce(mod?.id, DEFAULT_MOD),
      info: gameInfo[game],
      flags: _flags,
      version: coalesce(mod?.version, {}),
      categoryIds,
      categoryRecord,
      itemCategoryRows,
      recipeCategoryRows,
      iconIds,
      iconRecord,
      itemIds,
      itemQIds,
      itemRecord,
      noRecipeItemIds,
      beaconIds,
      beaconRecord,
      beltIds,
      pipeIds,
      beltRecord,
      cargoWagonIds,
      cargoWagonRecord,
      fluidWagonIds,
      fluidWagonRecord,
      machineIds,
      machineRecord,
      moduleIds,
      proliferatorModuleIds,
      moduleRecord,
      fuelIds,
      fuelRecord,
      recipeIds,
      recipeQIds,
      recipeRecord,
      prodUpgradeTechs,
      prodUpgrades,
      technologyIds,
      technologyRecord,
      locationIds,
      locationRecord,
      limitations,
      hash,
    };
  }

  computeSettings(
    state: SettingsState,
    defaults: Defaults | undefined,
    data: Dataset,
  ): Settings {
    const techIds = state.researchedTechnologyIds;
    const allTechnologyIds = Object.keys(data.technologyRecord);
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
      defaults?.locations ?? Object.keys(data.locationRecord);
    let locationIds = new Set(defaultLocationIds);
    if (locIds != null && defaultLocationIds.length > 0) locationIds = locIds;

    let quality = Quality.Normal;
    if (data.flags.has('quality')) {
      if (researchedTechnologyIds.has(LEGENDARY_QUALITY))
        quality = Quality.Legendary;
      else if (researchedTechnologyIds.has(EPIC_QUALITY))
        quality = Quality.Epic;
      else if (researchedTechnologyIds.has(QUALITY_MODULE_TECHNOLOGY))
        quality = Quality.Rare;
    }

    // List of recipes that have been unlocked by technology
    const unlockedRecipes = data.recipeIds
      .map((r) => data.recipeRecord[r])
      .filter(
        (r) =>
          (!r.flags.has('locked') ||
            Array.from(researchedTechnologyIds).some((t) =>
              data.technologyRecord[t].unlockedRecipes?.includes(baseId(r.id)),
            )) &&
          (r.quality == null || r.quality <= quality),
      );

    // Initialize list of items with those that have no recipe
    const noRecipeQualItemIds = Array.from(data.noRecipeItemIds)
      .map((i) => data.itemRecord[i])
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
            (data.machineRecord[p].locations == null ||
              data.machineRecord[p].locations.some((l) => locationIds.has(l))),
        ),
    );
    const availableRecipeIds = new Set(availableRecipes.map((r) => r.id));

    function pickItemId(
      itemId: string | undefined,
      defaultId: string | undefined,
    ): string | undefined {
      itemId = coalesce(itemId, defaultId);
      if (!itemId || !availableItemIds.has(itemId)) return undefined;
      return itemId;
    }

    function pickItemIds(
      itemIds: string[] | undefined,
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
        data.machineRecord[m].locations == null ||
        data.machineRecord[m].locations.some((l) => locationIds.has(l)),
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
                  m = spread(m, { id: '' });
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
      beacons: this.hydration.hydrateBeacons(state.beacons, defaultBeacons),
      overclock: state.overclock ?? defaults?.overclock,
      researchedTechnologyIds,
      locationIds,
      defaultLocationIds: new Set(data.locationIds),
      availableRecipeIds,
      availableItemIds,
      quality,
    });
  }

  private qualityRecord(
    record: Record<string, Rational>,
    quality: Quality,
    itemData: Record<string, ItemJson>,
    qualityDurability = false,
  ): Record<string, Rational> {
    const factor = qualityDurability
      ? rational.one.add(rational(quality))
      : rational.one;
    return Object.keys(record).reduce((e: Record<string, Rational>, k) => {
      if (itemData[k].stack) {
        e[qualityId(k, quality)] = record[k].div(factor);
      } else e[k] = record[k];
      return e;
    }, {});
  }
}
