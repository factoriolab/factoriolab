import { effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter,
  firstValueFrom,
  map,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';

import { asString, coalesce, prune, spread } from '~/helpers';
import { DEFAULT_MOD, MIN_ZIP, ZFIELDSEP } from '~/models/constants';
import { ModData } from '~/models/data/mod-data';
import { ModHash } from '~/models/data/mod-hash';
import { Dataset } from '~/models/dataset';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { ZipVersion } from '~/models/enum/zip-version';
import { LabParams, Params } from '~/models/lab-params';
import { isRecipeObjective, ObjectiveState } from '~/models/objective';
import { rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { CostSettings } from '~/models/settings/cost-settings';
import { ItemState } from '~/models/settings/item-settings';
import { MachineState } from '~/models/settings/machine-settings';
import { ModuleSettings } from '~/models/settings/module-settings';
import { RecipeState } from '~/models/settings/recipe-settings';
import { Step } from '~/models/step';
import { storedSignal } from '~/models/stored-signal';
import { Entities } from '~/models/utils';
import {
  Zip,
  ZipData,
  ZipMachineSettings,
  ZipRecipeSettingsInfo,
} from '~/models/zip';

import { ItemsService, ItemsState } from '../store/items.service';
import { MachinesService, MachinesState } from '../store/machines.service';
import {
  ObjectivesService,
  ObjectivesState,
} from '../store/objectives.service';
import { RecipesService, RecipesState } from '../store/recipes.service';
import {
  initialSettingsState,
  PartialSettingsState,
  SettingsService,
  SettingsState,
} from '../store/settings.service';
import { CompressionService } from './compression.service';
import { DataService } from './data.service';
import { MigrationService } from './migration.service';
import { ZipService } from './zip.service';

interface ZipState {
  objectives: ObjectivesState;
  items: ItemsState;
  recipes: RecipesState;
  machines: MachinesState;
  settings: SettingsState;
  data: Dataset;
  hash: ModHash;
}

export interface PartialState {
  objectivesState?: ObjectivesState;
  itemsState?: ItemsState;
  recipesState?: RecipesState;
  machinesState?: MachinesState;
  settingsState?: PartialSettingsState;
}

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  router = inject(Router);
  compressionSvc = inject(CompressionService);
  dataSvc = inject(DataService);
  itemsSvc = inject(ItemsService);
  machinesSvc = inject(MachinesService);
  migrationSvc = inject(MigrationService);
  objectivesSvc = inject(ObjectivesService);
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);
  zipSvc = inject(ZipService);

  zipState$ = new Subject<ZipState>();
  zipConfig = signal(this.empty);
  // Current hashing algorithm version
  version = ZipVersion.Version11;
  zipTail: LabParams = { v: this.version };
  route$ = new Subject<ActivatedRoute>();
  ready = signal(false);
  navigating$ = new BehaviorSubject<boolean>(false);
  stored = storedSignal('router');

  get empty(): Zip<LabParams> {
    return { bare: {}, hash: {} };
  }

  get emptyRecipeSettingsInfo(): ZipRecipeSettingsInfo {
    return { idMap: {}, list: [] };
  }

  get emptyMachineSettings(): ZipMachineSettings {
    return { moduleMap: {}, beaconMap: {} };
  }

  constructor() {
    this.route$
      .pipe(
        switchMap((r) =>
          combineLatest({
            params: r.params,
            queryParams: r.queryParams,
          }),
        ),
        withLatestFrom(this.navigating$),
        filter(([_, navigating]) => !navigating),
        map(([route]) => route),
        switchMap(async ({ params, queryParams }) => {
          queryParams = await this.unzipQueryParams(queryParams);
          return { params, queryParams };
        }),
        map(({ params, queryParams }) =>
          this.migrationSvc.migrate(
            params['id'] as string | undefined,
            queryParams,
          ),
        ),
        switchMap(({ modId, params, isBare }) =>
          this.updateState(modId, params, isBare),
        ),
      )
      .subscribe();

    effect(() => {
      const ready = this.ready();
      const hash = this.settingsSvc.hash();
      if (!ready || !hash) return;
      const objectives = this.objectivesSvc.state();
      const items = this.itemsSvc.state();
      const recipes = this.recipesSvc.state();
      const machines = this.machinesSvc.state();
      const settings = this.settingsSvc.state();
      const data = this.settingsSvc.dataset();

      this.zipState$.next({
        objectives,
        items,
        recipes,
        machines,
        settings,
        data,
        hash,
      });
    });

    this.zipState$
      .pipe(
        debounceTime(0),
        map((z) => this.zipState(z)),
        tap((z) => {
          this.zipConfig.set(z.config);
        }),
        switchMap((z) => this.updateUrl(z)),
      )
      .subscribe();
  }

  async updateUrl(zData: ZipData): Promise<void> {
    const queryParams = await this.getHash(zData);
    this.navigating$.next(true);
    await this.router.navigate([], { queryParams });
    this.navigating$.next(false);
    const url = this.router.url;
    const path = url.split('?')[0];
    // Only cache list / flow routes
    if (path.endsWith('list') || path.endsWith('flow')) this.stored.set(url);
  }

  zipState(state: ZipState): ZipData {
    const { objectives, items, recipes, machines, settings, data, hash } =
      state;
    const zData = this.zipModulesBeacons(
      objectives,
      recipes,
      machines,
      settings,
      hash,
    );

    this.zipObjectives(zData, objectives, hash);
    this.zipItems(zData, items, hash);
    this.zipRecipes(zData, recipes, hash);
    this.zipMachines(zData, machines, hash);
    this.zipSettings(zData, settings, Object.keys(objectives), data, hash);
    return zData;
  }

  async stepHref(
    step: Step,
    config: Zip<LabParams>,
    hash: ModHash | undefined,
  ): Promise<LabParams | null> {
    if (hash == null) return null;

    let objectives: ObjectivesState | undefined;
    if (step.itemId != null && step.items != null) {
      objectives = {
        ['1']: {
          id: '1',
          targetId: step.itemId,
          value: step.items,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      };
    } else if (step.recipeId != null && step.machines != null) {
      objectives = {
        ['1']: {
          id: '1',
          targetId: step.recipeId,
          value: step.machines,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
      };
    }

    if (objectives == null) return null;

    const zData: ZipData = {
      objectives: this.empty,
      config: config,
      objectiveSettings: this.emptyMachineSettings,
      recipeSettings: this.emptyMachineSettings,
      machineSettings: this.emptyMachineSettings,
    };
    this.zipObjectives(zData, objectives, hash);
    return await this.getHash(zData);
  }

  async getHashParams(hash: LabParams): Promise<LabParams> {
    const hashStr = this.toString(hash as Params);
    const zStr = await this.compressionSvc.deflate(hashStr);
    return {
      z: zStr,
      v: this.version,
    };
  }

  async getHash(zData: ZipData): Promise<LabParams> {
    const bare = spread(zData.objectives.bare, zData.config.bare, this.zipTail);
    const hash = spread(zData.objectives.hash, zData.config.hash, this.zipTail);
    const zip = await this.getHashParams(hash);

    const bareStr = this.toString(bare as Params);
    const bareLen = bareStr.length;
    const zipStr = this.toString(zip as Params);
    const zipLen = zipStr.length;
    return bareLen < Math.max(zipLen, MIN_ZIP) ? bare : zip;
  }

  toParams(value: string): Params {
    const sections = value.split('&');
    if (sections.some((s) => !s.includes('='))) {
      // Need to parse out < V11 hashed state without '=' delimiter
      return sections.reduce((e: Params, v) => {
        e[v[0]] = v.substring(1);
        return e;
      }, {});
    }

    return sections.reduce((e: Params, v) => {
      const [key, value] = v.split('=');

      if (e[key] == null) e[key] = value;
      else if (Array.isArray(e[key])) e[key].push(value);
      else e[key] = [e[key], value];

      return e;
    }, {});
  }

  toString(value: Params): string {
    return Object.keys(value)
      .flatMap((k) => {
        const v = value[k];
        if (Array.isArray(v)) return v.map((e) => `${k}=${e}`);
        else if (v) return `${k}=${v}`;
        return [];
      }, '')
      .join('&');
  }

  async unzipQueryParams(queryParams: Params): Promise<Params> {
    const zip = queryParams['z'];
    if (zip != null) {
      try {
        // Upgrade V0 query-unsafe zipped characters
        const zSafe = asString(zip)
          .replace(/\+/g, '-')
          .replace(/\//g, '.')
          .replace(/=/g, '_');
        const unzip = await this.compressionSvc.inflate(zSafe);
        queryParams = this.toParams(unzip);
        queryParams['z'] = zip;
      } catch (err) {
        console.error(err);
        throw new Error('RouterService failed to parse url');
      }
    }

    return queryParams;
  }

  async updateState(
    modId: string | undefined,
    params: LabParams,
    isBare: boolean,
  ): Promise<void> {
    if (modId == null && Object.keys(params).length === 0) {
      // Nothing to set up
      this.ready.set(true);
      return;
    }

    const [modData, modHash] = await firstValueFrom(
      this.dataSvc.requestData(modId ?? DEFAULT_MOD),
    );

    const hash = isBare ? undefined : modHash;
    const ms = this.unzipModules(params, hash);
    const bs = this.unzipBeacons(params, ms, hash);
    const state: PartialState = {};
    state.objectivesState = this.unzipObjectives(params, ms, bs, hash);
    state.itemsState = this.unzipItems(params, hash);
    state.recipesState = this.unzipRecipes(params, ms, bs, hash);
    state.machinesState = this.unzipMachines(params, ms, bs, hash);
    const objectiveIds = state.objectivesState
      ? Object.keys(state.objectivesState)
      : [];
    state.settingsState = this.unzipSettings(
      modId,
      params,
      bs,
      objectiveIds,
      modData,
      modHash,
      hash,
    );
    // prune(state);
    this.dispatch(state);
  }

  dispatch(state: PartialState): void {
    this.objectivesSvc.load(state.objectivesState);
    this.itemsSvc.load(state.itemsState);
    this.recipesSvc.load(state.recipesState);
    this.machinesSvc.load(state.machinesState);
    this.settingsSvc.load(state.settingsState);
    this.ready.set(true);
  }

  zipModulesBeacons(
    objectives: ObjectivesState,
    recipes: RecipesState,
    machines: MachinesState,
    settings: SettingsState,
    hash: ModHash,
  ): ZipData {
    const modulesInfo = this.emptyRecipeSettingsInfo;
    const beaconsInfo = this.emptyRecipeSettingsInfo;

    const zip = (
      entities: Entities<ObjectiveState | RecipeState | MachineState>,
    ): ZipMachineSettings => {
      return this.zipMachineSettings(entities, modulesInfo, beaconsInfo, hash);
    };
    const objectiveSettings = zip(objectives);
    const recipeSettings = zip(recipes);
    const machineSettings = zip(machines);

    let beacons: number[] | undefined;
    if (settings.beacons) {
      const moduleMap = this.beaconModuleMap(
        settings.beacons,
        modulesInfo,
        hash,
      );
      beacons = this.zipBeaconArray(
        settings.beacons,
        moduleMap,
        beaconsInfo,
        hash,
      );
    }

    const config = this.empty;
    const type = ['bare', 'hash'] as const;
    const data = [
      ['e', modulesInfo.list],
      ['b', beaconsInfo.list],
    ] as const;
    data.forEach(([section, list]) => {
      list.forEach((e) => {
        type.forEach((t) => {
          if (config[t][section] == null) config[t][section] = [e[t]];
          else config[t][section].push(e[t]);
        });
      });
    });

    return {
      objectives: this.empty,
      config,
      objectiveSettings,
      recipeSettings,
      machineSettings,
      beacons,
    };
  }

  zipMachineSettings(
    state: Entities<ObjectiveState | RecipeState | MachineState>,
    modulesInfo: ZipRecipeSettingsInfo,
    beaconsInfo: ZipRecipeSettingsInfo,
    hash: ModHash,
  ): ZipMachineSettings {
    const result = this.emptyMachineSettings;
    for (const id of Object.keys(state)) {
      const value = state[id];
      if (value.modules != null) {
        result.moduleMap[id] = this.zipModuleArray(
          value.modules,
          modulesInfo,
          hash,
        );
      }

      if (value.beacons != null) {
        const moduleMap = this.beaconModuleMap(
          value.beacons,
          modulesInfo,
          hash,
        );
        result.beaconMap[id] = this.zipBeaconArray(
          value.beacons,
          moduleMap,
          beaconsInfo,
          hash,
        );
      }
    }

    return result;
  }

  beaconModuleMap(
    beacons: BeaconSettings[],
    modulesInfo: ZipRecipeSettingsInfo,
    hash: ModHash,
  ): (number[] | undefined)[] {
    return beacons.map((beacon) => {
      if (beacon.modules == null) return;
      return this.zipModuleArray(beacon.modules, modulesInfo, hash);
    });
  }

  zipModuleArray(
    values: ModuleSettings[],
    modulesInfo: ZipRecipeSettingsInfo,
    hash: ModHash,
  ): number[] {
    return values.map((obj) => {
      const count = this.zipSvc.zipRational(obj.count);
      const zip: Zip = {
        bare: this.zipSvc.zipFields([count, this.zipSvc.zipString(obj.id)]),
        hash: this.zipSvc.zipFields([
          count,
          this.zipSvc.zipNString(obj.id, hash.modules),
        ]),
      };

      if (modulesInfo.idMap[zip.bare] == null) {
        modulesInfo.idMap[zip.bare] = modulesInfo.list.length;
        modulesInfo.list.push(zip);
      }

      return modulesInfo.idMap[zip.bare];
    });
  }

  unzipModules(params: LabParams, hash?: ModHash): ModuleSettings[] {
    if (params.e == null) return [];
    return params.e.map((module) => {
      const s = module.split(ZFIELDSEP);
      let i = 0;
      const obj: ModuleSettings = {
        count: this.zipSvc.parseRational(s[i++]),
        id: this.zipSvc.parseString(s[i++], hash?.modules),
      };

      prune(obj);
      return obj;
    });
  }

  zipBeaconArray(
    beacons: BeaconSettings[],
    moduleMap: (number[] | undefined)[],
    beaconsInfo: ZipRecipeSettingsInfo,
    hash: ModHash,
  ): number[] {
    return beacons.map((obj, i) => {
      const count = this.zipSvc.zipRational(obj.count);
      const modules = this.zipSvc.zipArray(moduleMap[i]);
      const total = this.zipSvc.zipRational(obj.total);
      const zip: Zip = {
        bare: this.zipSvc.zipFields([
          count,
          modules,
          this.zipSvc.zipString(obj.id),
          total,
        ]),
        hash: this.zipSvc.zipFields([
          count,
          modules,
          this.zipSvc.zipNString(obj.id, hash.beacons),
          total,
        ]),
      };

      if (beaconsInfo.idMap[zip.bare] == null) {
        beaconsInfo.idMap[zip.bare] = beaconsInfo.list.length;
        beaconsInfo.list.push(zip);
      }

      return beaconsInfo.idMap[zip.bare];
    });
  }

  unzipBeacons(
    params: LabParams,
    moduleSettings: ModuleSettings[],
    hash?: ModHash,
  ): BeaconSettings[] {
    if (params.b == null) return [];
    return params.b.map((beacon) => {
      const s = beacon.split(ZFIELDSEP);
      let i = 0;
      const obj: BeaconSettings = {
        count: this.zipSvc.parseRational(s[i++]),
        modules: this.zipSvc.parseIndices(s[i++], moduleSettings),
        id: this.zipSvc.parseString(s[i++], hash?.beacons),
        total: this.zipSvc.parseRational(s[i++]),
      };

      prune(obj);
      return obj;
    });
  }

  zipObjectives(
    data: ZipData,
    objectives: ObjectivesState,
    hash: ModHash,
  ): void {
    const ids = Object.keys(objectives);
    if (!ids.length) return;

    const list = ids.map((i) => objectives[i]);
    data.objectives.bare.o = [];
    data.objectives.hash.o = [];
    for (const obj of list) {
      const value = this.zipSvc.zipDiffRational(obj.value, rational.one);
      const unit = this.zipSvc.zipDiffNumber(obj.unit, ObjectiveUnit.Items);
      const type = this.zipSvc.zipDiffNumber(obj.type, ObjectiveType.Output);
      const modules = this.zipSvc.zipArray(
        data.objectiveSettings.moduleMap[obj.id],
      );
      const beacons = this.zipSvc.zipArray(
        data.objectiveSettings.beaconMap[obj.id],
      );
      const overclock = this.zipSvc.zipNumber(obj.overclock);

      data.objectives.bare.o.push(
        this.zipSvc.zipFields([
          obj.targetId,
          value,
          unit,
          type,
          this.zipSvc.zipString(obj.machineId),
          modules,
          beacons,
          overclock,
          this.zipSvc.zipString(obj.fuelId),
        ]),
      );
      data.objectives.hash.o.push(
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(
            obj.targetId,
            isRecipeObjective(obj) ? hash.recipes : hash.items,
          ),
          value,
          unit,
          type,
          this.zipSvc.zipNString(obj.machineId, hash.machines),
          modules,
          beacons,
          overclock,
          this.zipSvc.zipNString(obj.fuelId, hash.fuels),
        ]),
      );
    }
  }

  unzipObjectives(
    params: LabParams,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): ObjectivesState | undefined {
    if (params.o == null) return;

    const entities: Entities<ObjectiveState> = {};
    let index = 1;
    for (const itemObjective of params.o) {
      const s = itemObjective.split(ZFIELDSEP);
      let i = 0;
      const id = index.toString();
      const obj: ObjectiveState = {
        id: index.toString(),
        targetId: s[i++], // Convert to real id after determining unit, if hashed
        value: coalesce(this.zipSvc.parseRational(s[i++]), rational.one),
        unit: this.zipSvc.parseNumber(s[i++]) ?? ObjectiveUnit.Items,
        type: this.zipSvc.parseNumber(s[i++]) ?? ObjectiveType.Output,
        machineId: this.zipSvc.parseString(s[i++], hash?.machines),
        modules: this.zipSvc.parseIndices(s[i++], moduleSettings),
        beacons: this.zipSvc.parseIndices(s[i++], beaconSettings),
        overclock: this.zipSvc.parseRational(s[i++]),
        fuelId: this.zipSvc.parseString(s[i++], hash?.fuels),
      };

      if (hash) {
        obj.targetId = coalesce(
          this.zipSvc.parseNString(
            obj.targetId,
            isRecipeObjective(obj) ? hash.recipes : hash.items,
          ),
          '',
        );
      }

      prune(obj);
      entities[id] = obj;
      index++;
    }
    return entities;
  }

  zipItems(data: ZipData, state: ItemsState, hash: ModHash): void {
    const keys = Object.keys(state);
    if (!keys.length) return;

    data.config.bare.i = [];
    data.config.hash.i = [];
    for (const id of keys) {
      const obj = state[id];
      data.config.bare.i.push(
        this.zipSvc.zipFields([
          id,
          this.zipSvc.zipString(obj.beltId),
          this.zipSvc.zipString(obj.wagonId),
          this.zipSvc.zipRational(obj.stack),
        ]),
      );
      data.config.hash.i.push(
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(id, hash.items),
          this.zipSvc.zipNString(obj.beltId, hash.belts),
          this.zipSvc.zipNString(obj.wagonId, hash.wagons),
          this.zipSvc.zipRational(obj.stack),
        ]),
      );
    }
  }

  unzipItems(params: LabParams, hash?: ModHash): ItemsState | undefined {
    if (params.i == null) return;

    const entities: ItemsState = {};
    for (const item of params.i) {
      const s = item.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zipSvc.parseString(s[i++], hash?.items), '');
      const obj: ItemState = {
        beltId: this.zipSvc.parseString(s[i++], hash?.belts),
        wagonId: this.zipSvc.parseString(s[i++], hash?.wagons),
        stack: this.zipSvc.parseRational(s[i++]),
      };

      prune(obj);
      if (Object.keys(obj).length) entities[id] = obj;
    }
    return entities;
  }

  zipRecipes(data: ZipData, state: RecipesState, hash: ModHash): void {
    const keys = Object.keys(state);
    if (!keys.length) return;

    data.config.bare.r = [];
    data.config.hash.r = [];
    for (const id of keys) {
      const obj = state[id];
      const modules = this.zipSvc.zipArray(data.recipeSettings.moduleMap[id]);
      const beacons = this.zipSvc.zipArray(data.recipeSettings.beaconMap[id]);
      const overclock = this.zipSvc.zipNumber(obj.overclock);
      const cost = this.zipSvc.zipNumber(obj.cost);
      const prod = this.zipSvc.zipNumber(obj.productivity);
      data.config.bare.r.push(
        this.zipSvc.zipFields([
          id,
          this.zipSvc.zipString(obj.machineId),
          modules,
          beacons,
          overclock,
          cost,
          this.zipSvc.zipString(obj.fuelId),
          prod,
        ]),
      );
      data.config.hash.r.push(
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(id, hash.recipes),
          this.zipSvc.zipNString(obj.machineId, hash.machines),
          modules,
          beacons,
          overclock,
          cost,
          this.zipSvc.zipNString(obj.fuelId, hash.fuels),
          prod,
        ]),
      );
    }
  }

  unzipRecipes(
    params: LabParams,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): RecipesState | undefined {
    if (params.r == null) return;

    const entities: RecipesState = {};
    for (const recipe of params.r) {
      const s = recipe.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zipSvc.parseString(s[i++], hash?.recipes), '');
      const obj: RecipeState = {
        machineId: this.zipSvc.parseString(s[i++], hash?.machines),
        modules: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => moduleSettings[Number(i)] ?? {}),
        beacons: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => beaconSettings[Number(i)] ?? {}),
        overclock: this.zipSvc.parseRational(s[i++]),
        cost: this.zipSvc.parseRational(s[i++]),
        fuelId: this.zipSvc.parseString(s[i++], hash?.fuels),
        productivity: this.zipSvc.parseRational(s[i++]),
      };

      prune(obj);
      if (Object.keys(obj).length) entities[id] = obj;
    }
    return entities;
  }

  zipMachines(data: ZipData, state: MachinesState, hash: ModHash): void {
    const keys = Object.keys(state);
    if (!keys.length) return;

    data.config.bare.m = [];
    data.config.hash.m = [];
    for (const id of keys) {
      const obj = state[id];
      const modules = this.zipSvc.zipArray(data.machineSettings.moduleMap[id]);
      const beacons = this.zipSvc.zipArray(data.machineSettings.beaconMap[id]);
      const overclock = this.zipSvc.zipNumber(obj.overclock);
      data.config.bare.m.push(
        this.zipSvc.zipFields([
          id,
          modules,
          beacons,
          this.zipSvc.zipString(obj.fuelId),
          overclock,
        ]),
      );
      data.config.hash.m.push(
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(id, hash.machines),
          modules,
          beacons,
          this.zipSvc.zipNString(obj.fuelId, hash.fuels),
          overclock,
        ]),
      );
    }
  }

  unzipMachines(
    params: LabParams,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): MachinesState | undefined {
    if (params.m == null) return;

    const entities: MachinesState = {};
    for (const machine of params.m) {
      const s = machine.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zipSvc.parseString(s[i++], hash?.machines), '');
      const obj: MachineState = {
        modules: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => moduleSettings[Number(i)] ?? {}),
        beacons: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => beaconSettings[Number(i)] ?? {}),
        fuelId: this.zipSvc.parseString(s[i++], hash?.fuels),
        overclock: this.zipSvc.parseRational(s[i++]),
      };

      prune(obj);
      if (Object.keys(obj).length) entities[id] = obj;
    }

    return entities;
  }

  zipSettings(
    zData: ZipData,
    state: SettingsState,
    objectiveIds: string[],
    data: Dataset,
    hash: ModHash,
  ): void {
    const init = initialSettingsState;

    // Set up shorthand functions to zip state
    const set = this.zipSvc.set(zData.config, state, init);
    const sub = set(this.zipSvc.zipDiffSubset.bind(this.zipSvc));
    const num = set(this.zipSvc.zipDiffNumber.bind(this.zipSvc));
    const bln = set(this.zipSvc.zipDiffBool.bind(this.zipSvc));
    const str = set(this.zipSvc.zipDiffString.bind(this.zipSvc));
    const rat = set(this.zipSvc.zipDiffRational.bind(this.zipSvc));
    const rnk = set(this.zipSvc.zipDiffArray.bind(this.zipSvc));
    const arr = set(this.zipSvc.zipDiffIndices.bind(this.zipSvc));

    // Zip state
    sub('och', (s) => s.checkedObjectiveIds, objectiveIds);
    num('omt', (s) => s.maximizeType);
    bln('orm', (s) => s.requireMachinesOutput);
    num('odr', (s) => s.displayRate);
    sub('iex', (s) => s.excludedItemIds, data.itemIds, hash.items);
    sub('ich', (s) => s.checkedItemIds, data.itemIds, hash.items);
    str('ibe', (s) => s.beltId, hash.belts);
    str('ipi', (s) => s.pipeId, hash.belts);
    str('icw', (s) => s.cargoWagonId, hash.wagons);
    str('ifw', (s) => s.fluidWagonId, hash.wagons);
    rat('ifr', (s) => s.flowRate);
    rat('ist', (s) => s.stack);
    sub('rex', (s) => s.excludedRecipeIds, data.recipeIds, hash.recipes);
    sub('rch', (s) => s.checkedRecipeIds, data.recipeIds, hash.recipes);
    bln('rnp', (s) => s.netProductionOnly);
    num('mpr', (s) => s.preset);
    rnk('mmr', (s) => s.machineRankIds, hash.machines);
    rnk('mfr', (s) => s.fuelRankIds, hash.fuels);
    rnk('mer', (s) => s.moduleRankIds, hash.modules);
    arr('mbe', (s) => (s === init ? undefined : zData.beacons));
    rat('moc', (s) => s.overclock);
    rat('mbr', (s) => s.beaconReceivers);
    str('mps', (s) => s.proliferatorSprayId, hash.modules);
    num('mit', (s) => s.inserterTarget);
    rat('bmi', (s) => s.miningBonus);
    rat('bre', (s) => s.researchBonus);
    num('bic', (s) => s.inserterCapacity);
    sub(
      'tre',
      (s) => s.researchedTechnologyIds,
      data.technologyIds,
      hash.technologies,
    );
    sub('loc', (s) => s.locationIds, data.locationIds, hash.locations ?? []);
    rat('cfa', (s) => s.costs.factor);
    rat('cma', (s) => s.costs.machine);
    rat('cfp', (s) => s.costs.footprint);
    rat('cun', (s) => s.costs.unproduceable);
    rat('cex', (s) => s.costs.excluded);
    rat('csu', (s) => s.costs.surplus);
    rat('cmx', (s) => s.costs.maximize);
    rat('cre', (s) => s.costs.recycling);
  }

  unzipSettings(
    modId: string | undefined,
    params: LabParams,
    beaconSettings: BeaconSettings[],
    objectiveIds: string[],
    modData: ModData,
    modHash: ModHash,
    hash?: ModHash,
  ): PartialSettingsState | undefined {
    // Set up shorthand functions to parse state
    const get = this.zipSvc.get(params);
    const sub = get(this.zipSvc.parseSubset.bind(this.zipSvc));
    const num = get(this.zipSvc.parseNumber.bind(this.zipSvc));
    const bln = get(this.zipSvc.parseBool.bind(this.zipSvc));
    const str = get(this.zipSvc.parseString.bind(this.zipSvc));
    const rat = get(this.zipSvc.parseRational.bind(this.zipSvc));
    const rnk = get(this.zipSvc.parseArray.bind(this.zipSvc));
    const arr = get(this.zipSvc.parseIndices.bind(this.zipSvc));

    const obj: PartialSettingsState = {
      modId,
      checkedObjectiveIds: sub('och', objectiveIds),
      maximizeType: num('omt'),
      requireMachinesOutput: bln('orm'),
      displayRate: num('odr'),
      excludedItemIds: sub('iex', modHash.items),
      checkedItemIds: sub('ich', modHash.items),
      beltId: str('ibe', hash?.belts),
      pipeId: str('ipi', hash?.belts),
      cargoWagonId: str('icw', hash?.wagons),
      fluidWagonId: str('ifw', hash?.wagons),
      flowRate: rat('ifr'),
      stack: rat('ist'),
      excludedRecipeIds: sub('rex', modHash.recipes),
      checkedRecipeIds: sub('rch', modHash.recipes),
      netProductionOnly: bln('rnp'),
      preset: num('mpr'),
      machineRankIds: rnk('mmr', hash?.machines),
      fuelRankIds: rnk('mfr', hash?.fuels),
      moduleRankIds: rnk('mer', hash?.modules),
      beacons: arr('mbe', beaconSettings),
      overclock: rat('moc'),
      beaconReceivers: rat('mbr'),
      proliferatorSprayId: str('mps', hash?.modules),
      inserterTarget: num('mit'),
      miningBonus: rat('bmi'),
      researchBonus: rat('bre'),
      inserterCapacity: num('bic'),
      researchedTechnologyIds: sub('tre', modHash.technologies),
      locationIds: sub('loc', modHash.locations ?? []),
    };

    const costs: Partial<CostSettings> = {
      factor: rat('cfa'),
      machine: rat('cma'),
      footprint: rat('cfp'),
      unproduceable: rat('cun'),
      excluded: rat('cex'),
      surplus: rat('csu'),
      maximize: rat('cmx'),
      recycling: rat('cre'),
    };

    const mps = this.migrationSvc.parseSet.bind(this.migrationSvc);
    if (params.v10iex) obj.excludedItemIds = mps(params.v10iex, hash?.items);
    if (params.v10ich) obj.checkedItemIds = mps(params.v10ich, hash?.items);
    if (params.v10rex)
      obj.excludedRecipeIds = mps(params.v10rex, hash?.recipes);
    if (params.v10rch) obj.checkedRecipeIds = mps(params.v10rch, hash?.recipes);
    if (params.v10tre) {
      obj.researchedTechnologyIds = mps(params.v10tre, hash?.technologies);
      obj.researchedTechnologyIds =
        this.migrationSvc.restoreV10ResearchedTechnologies(
          obj.researchedTechnologyIds,
          modData,
        );
    }

    prune(costs);
    if (Object.keys(costs).length) obj.costs = costs;

    prune(obj);
    if (!Object.keys(obj).length) return;

    return obj;
  }
}
