import { effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { DEFAULT_MOD } from '~/data/datasets';
import { FileClient } from '~/data/file-client';
import { ModData } from '~/data/schema/mod-data';
import { ModHash } from '~/data/schema/mod-hash';
import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { asString } from '~/utils/coercion';
import { coalesce } from '~/utils/nullish';
import { prune, spread } from '~/utils/object';
import { storedSignal } from '~/utils/stored-signal';

import { BeaconSettings } from '../beacon-settings';
import { ItemState } from '../items/item-state';
import { ItemsStore } from '../items/items-store';
import { MachineState } from '../machines/machine-state';
import { MachinesStore } from '../machines/machines-store';
import { ModuleSettings } from '../module-settings';
import { isRecipeObjective, ObjectiveState } from '../objectives/objective';
import { ObjectiveType } from '../objectives/objective-type';
import { ObjectiveUnit } from '../objectives/objective-unit';
import { ObjectivesStore } from '../objectives/objectives-store';
import { RecipeState } from '../recipes/recipe-state';
import { RecipesStore } from '../recipes/recipes-store';
import { CostSettings } from '../settings/cost-settings';
import { Dataset } from '../settings/dataset';
import {
  initialSettingsState,
  PartialSettingsState,
  SettingsState,
} from '../settings/settings-state';
import { SettingsStore } from '../settings/settings-store';
import { initialTableState, TableState } from '../table/table-state';
import { TableStore } from '../table/table-store';
import { Compression } from './compression';
import { ZFIELDSEP } from './constants';
import { LabParams } from './lab-params';
import { Migration } from './migration';
import { Params } from './params';
import { Zip } from './zip';
import { ZipData } from './zip-data';
import { ZipVersion } from './zip-version';

const MIN_ZIP = 200;

interface ZipRecipeSettingsInfo {
  idMap: Record<string, number>;
  list: ZipData[];
}

interface ZipMachineSettings {
  moduleMap: Record<string, number[]>;
  beaconMap: Record<string, number[]>;
}

interface ZipState {
  objectives: ZipData<LabParams>;
  config: ZipData<LabParams>;
  objectiveSettings: ZipMachineSettings;
  recipeSettings: ZipMachineSettings;
  machineSettings: ZipMachineSettings;
  beacons?: number[];
}

interface State {
  objectives: Record<string, ObjectiveState>;
  items: Record<string, ItemState>;
  recipes: Record<string, RecipeState>;
  machines: Record<string, MachineState>;
  settings: SettingsState;
  table: TableState;
  data: Dataset;
  hash: ModHash;
}

interface PartialState {
  objectivesState?: Record<string, ObjectiveState>;
  itemsState?: Record<string, ItemState>;
  recipesState?: Record<string, RecipeState>;
  machinesState?: Record<string, MachineState>;
  settingsState?: PartialSettingsState;
  tableState?: Partial<TableState>;
}

@Injectable({ providedIn: 'root' })
export class RouterSync {
  private readonly router = inject(Router);
  private readonly compression = inject(Compression);
  private readonly itemsStore = inject(ItemsStore);
  private readonly machinesStore = inject(MachinesStore);
  private readonly migration = inject(Migration);
  private readonly objectivesStore = inject(ObjectivesStore);
  private readonly recipesStore = inject(RecipesStore);
  private readonly fileClient = inject(FileClient);
  private readonly settingsStore = inject(SettingsStore);
  private readonly tableStore = inject(TableStore);
  private readonly zip = inject(Zip);

  state$ = new Subject<State>();
  zipConfig = signal(this.empty);
  // Current hashing algorithm version
  version = ZipVersion.Version11;
  zipTail: LabParams = { v: this.version };
  route$ = new Subject<ActivatedRoute>();
  ready = signal(false);
  stored = storedSignal('router');

  get empty(): ZipData<LabParams> {
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
        /** Skip any navigations triggered by `RouterSync.updateUrl` */
        filter(
          () =>
            !(
              this.router.currentNavigation()?.extras.info as
                | { sync?: true }
                | undefined
            )?.sync,
        ),
        switchMap(async ({ params, queryParams }) => {
          queryParams = await this.unzipQueryParams(queryParams);
          return { params, queryParams };
        }),
        map(({ params, queryParams }) =>
          this.migration.migrate(
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
      const hash = this.settingsStore.hash();
      if (!ready || !hash) return;
      const objectives = this.objectivesStore.state();
      const items = this.itemsStore.state();
      const recipes = this.recipesStore.state();
      const machines = this.machinesStore.state();
      const settings = this.settingsStore.state();
      const table = this.tableStore.state();
      const data = this.settingsStore.dataset();

      this.state$.next({
        objectives,
        items,
        recipes,
        machines,
        settings,
        table,
        data,
        hash,
      });
    });

    this.state$
      .pipe(
        map((z) => this.zipState(z)),
        tap((z) => {
          this.zipConfig.set(z.config);
        }),
        switchMap((z) => this.updateUrl(z)),
      )
      .subscribe();
  }

  async updateUrl(zState: ZipState): Promise<void> {
    const queryParams = await this.getHash(zState);
    await this.router.navigate([], {
      queryParams,
      preserveFragment: true,
      // Use sync: true to indicate we should not re-apply this state
      info: { sync: true },
    });
    this.stored.set(this.router.url);
  }

  zipState(state: State): ZipState {
    const {
      objectives,
      items,
      recipes,
      machines,
      settings,
      table,
      data,
      hash,
    } = state;
    const zState = this.zipModulesBeacons(
      objectives,
      recipes,
      machines,
      settings,
      hash,
    );

    this.zipObjectives(zState, objectives, hash);
    this.zipItems(zState, items, hash);
    this.zipRecipes(zState, recipes, hash);
    this.zipMachines(zState, machines, hash);
    this.zipSettings(zState, settings, Object.keys(objectives), data, hash);
    this.zipTable(zState, table);
    return zState;
  }

  async stepHref(
    step: Step,
    config: ZipData<LabParams>,
    hash: ModHash | undefined,
  ): Promise<LabParams | null> {
    if (hash == null) return null;

    let objectives: Record<string, ObjectiveState> | undefined;
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

    const zState: ZipState = {
      objectives: this.empty,
      config: config,
      objectiveSettings: this.emptyMachineSettings,
      recipeSettings: this.emptyMachineSettings,
      machineSettings: this.emptyMachineSettings,
    };

    this.zipObjectives(zState, objectives, hash);
    return await this.getHash(zState);
  }

  async getHashParams(hash: LabParams): Promise<LabParams> {
    const hashStr = this.toString(hash as Params);
    const zStr = await this.compression.deflate(hashStr);
    return {
      z: zStr,
      v: this.version,
    };
  }

  async getHash(zState: ZipState): Promise<LabParams> {
    const bare = spread(
      zState.objectives.bare,
      zState.config.bare,
      this.zipTail,
    );

    const hash = spread(
      zState.objectives.hash,
      zState.config.hash,
      this.zipTail,
    );
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
        const unzip = await this.compression.inflate(zSafe);
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
      this.fileClient.requestData(modId ?? DEFAULT_MOD),
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
    state.tableState = this.unzipTable(params);

    this.dispatch(state);
  }

  dispatch(state: PartialState): void {
    this.objectivesStore.load(state.objectivesState);
    this.itemsStore.load(state.itemsState);
    this.recipesStore.load(state.recipesState);
    this.machinesStore.load(state.machinesState);
    this.settingsStore.load(state.settingsState);
    this.tableStore.load(state.tableState);
    this.ready.set(true);
  }

  zipModulesBeacons(
    objectives: Record<string, ObjectiveState>,
    recipes: Record<string, RecipeState>,
    machines: Record<string, MachineState>,
    settings: SettingsState,
    hash: ModHash,
  ): ZipState {
    const modulesInfo = this.emptyRecipeSettingsInfo;
    const beaconsInfo = this.emptyRecipeSettingsInfo;

    const zip = (
      record: Record<string, ObjectiveState | RecipeState | MachineState>,
    ): ZipMachineSettings => {
      return this.zipMachineSettings(record, modulesInfo, beaconsInfo, hash);
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
    state: Record<string, ObjectiveState | RecipeState | MachineState>,
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
      const count = this.zip.zipRational(obj.count);
      const zip: ZipData = {
        bare: this.zip.zipFields([count, this.zip.zipString(obj.id)]),
        hash: this.zip.zipFields([
          count,
          this.zip.zipNString(obj.id, hash.modules),
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
        count: this.zip.parseRational(s[i++]),
        id: this.zip.parseString(s[i++], hash?.modules),
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
      const count = this.zip.zipRational(obj.count);
      const modules = this.zip.zipArray(moduleMap[i]);
      const total = this.zip.zipRational(obj.total);
      const zip: ZipData = {
        bare: this.zip.zipFields([
          count,
          modules,
          this.zip.zipString(obj.id),
          total,
        ]),
        hash: this.zip.zipFields([
          count,
          modules,
          this.zip.zipNString(obj.id, hash.beacons),
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
        count: this.zip.parseRational(s[i++]),
        modules: this.zip.parseIndices(s[i++], moduleSettings),
        id: this.zip.parseString(s[i++], hash?.beacons),
        total: this.zip.parseRational(s[i++]),
      };

      prune(obj);
      return obj;
    });
  }

  zipObjectives(
    data: ZipState,
    objectives: Record<string, ObjectiveState>,
    hash: ModHash,
  ): void {
    const ids = Object.keys(objectives);
    if (!ids.length) return;

    const list = ids.map((i) => objectives[i]);
    data.objectives.bare.o = [];
    data.objectives.hash.o = [];
    for (const obj of list) {
      const value = this.zip.zipDiffRational(obj.value, rational.one);
      const unit = this.zip.zipDiffNumber(obj.unit, ObjectiveUnit.Items);
      const type = this.zip.zipDiffNumber(obj.type, ObjectiveType.Output);
      const modules = this.zip.zipArray(
        data.objectiveSettings.moduleMap[obj.id],
      );
      const beacons = this.zip.zipArray(
        data.objectiveSettings.beaconMap[obj.id],
      );
      const overclock = this.zip.zipNumber(obj.overclock);

      data.objectives.bare.o.push(
        this.zip.zipFields([
          obj.targetId,
          value,
          unit,
          type,
          this.zip.zipString(obj.machineId),
          modules,
          beacons,
          overclock,
          this.zip.zipString(obj.fuelId),
        ]),
      );
      data.objectives.hash.o.push(
        this.zip.zipFields([
          this.zip.zipNString(
            obj.targetId,
            isRecipeObjective(obj) ? hash.recipes : hash.items,
          ),
          value,
          unit,
          type,
          this.zip.zipNString(obj.machineId, hash.machines),
          modules,
          beacons,
          overclock,
          this.zip.zipNString(obj.fuelId, hash.fuels),
        ]),
      );
    }
  }

  unzipObjectives(
    params: LabParams,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Record<string, ObjectiveState> | undefined {
    if (params.o == null) return;

    const state: Record<string, ObjectiveState> = {};
    let index = 1;
    for (const itemObjective of params.o) {
      const s = itemObjective.split(ZFIELDSEP);
      let i = 0;
      const id = index.toString();
      const obj: ObjectiveState = {
        id: index.toString(),
        targetId: s[i++], // Convert to real id after determining unit, if hashed
        value: coalesce(this.zip.parseRational(s[i++]), rational.one),
        unit: this.zip.parseNumber(s[i++]) ?? ObjectiveUnit.Items,
        type: this.zip.parseNumber(s[i++]) ?? ObjectiveType.Output,
        machineId: this.zip.parseString(s[i++], hash?.machines),
        modules: this.zip.parseIndices(s[i++], moduleSettings),
        beacons: this.zip.parseIndices(s[i++], beaconSettings),
        overclock: this.zip.parseRational(s[i++]),
        fuelId: this.zip.parseString(s[i++], hash?.fuels),
      };

      if (hash) {
        obj.targetId = coalesce(
          this.zip.parseNString(
            obj.targetId,
            isRecipeObjective(obj) ? hash.recipes : hash.items,
          ),
          '',
        );
      }

      prune(obj);
      state[id] = obj;
      index++;
    }

    return state;
  }

  zipItems(
    data: ZipState,
    state: Record<string, ItemState>,
    hash: ModHash,
  ): void {
    const keys = Object.keys(state);
    if (!keys.length) return;

    data.config.bare.i = [];
    data.config.hash.i = [];
    for (const id of keys) {
      const obj = state[id];
      data.config.bare.i.push(
        this.zip.zipFields([
          id,
          this.zip.zipString(obj.beltId),
          this.zip.zipString(obj.wagonId),
          this.zip.zipRational(obj.stack),
        ]),
      );
      data.config.hash.i.push(
        this.zip.zipFields([
          this.zip.zipNString(id, hash.items),
          this.zip.zipNString(obj.beltId, hash.belts),
          this.zip.zipNString(obj.wagonId, hash.wagons),
          this.zip.zipRational(obj.stack),
        ]),
      );
    }
  }

  unzipItems(
    params: LabParams,
    hash?: ModHash,
  ): Record<string, ItemState> | undefined {
    if (params.i == null) return;

    const state: Record<string, ItemState> = {};
    for (const item of params.i) {
      const s = item.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zip.parseString(s[i++], hash?.items), '');
      const obj: ItemState = {
        beltId: this.zip.parseString(s[i++], hash?.belts),
        wagonId: this.zip.parseString(s[i++], hash?.wagons),
        stack: this.zip.parseRational(s[i++]),
      };

      prune(obj);
      if (Object.keys(obj).length) state[id] = obj;
    }

    return state;
  }

  zipRecipes(
    data: ZipState,
    state: Record<string, RecipeState>,
    hash: ModHash,
  ): void {
    const keys = Object.keys(state);
    if (!keys.length) return;

    data.config.bare.r = [];
    data.config.hash.r = [];
    for (const id of keys) {
      const obj = state[id];
      const modules = this.zip.zipArray(data.recipeSettings.moduleMap[id]);
      const beacons = this.zip.zipArray(data.recipeSettings.beaconMap[id]);
      const overclock = this.zip.zipNumber(obj.overclock);
      const cost = this.zip.zipNumber(obj.cost);
      const prod = this.zip.zipNumber(obj.productivity);
      data.config.bare.r.push(
        this.zip.zipFields([
          id,
          this.zip.zipString(obj.machineId),
          modules,
          beacons,
          overclock,
          cost,
          this.zip.zipString(obj.fuelId),
          prod,
        ]),
      );
      data.config.hash.r.push(
        this.zip.zipFields([
          this.zip.zipNString(id, hash.recipes),
          this.zip.zipNString(obj.machineId, hash.machines),
          modules,
          beacons,
          overclock,
          cost,
          this.zip.zipNString(obj.fuelId, hash.fuels),
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
  ): Record<string, RecipeState> | undefined {
    if (params.r == null) return;

    const state: Record<string, RecipeState> = {};
    for (const recipe of params.r) {
      const s = recipe.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zip.parseString(s[i++], hash?.recipes), '');
      const obj: RecipeState = {
        machineId: this.zip.parseString(s[i++], hash?.machines),
        modules: this.zip
          .parseArray(s[i++])
          ?.map((i) => moduleSettings[Number(i)] ?? {}),
        beacons: this.zip
          .parseArray(s[i++])
          ?.map((i) => beaconSettings[Number(i)] ?? {}),
        overclock: this.zip.parseRational(s[i++]),
        cost: this.zip.parseRational(s[i++]),
        fuelId: this.zip.parseString(s[i++], hash?.fuels),
        productivity: this.zip.parseRational(s[i++]),
      };

      prune(obj);
      if (Object.keys(obj).length) state[id] = obj;
    }

    return state;
  }

  zipMachines(
    data: ZipState,
    state: Record<string, MachineState>,
    hash: ModHash,
  ): void {
    const keys = Object.keys(state);
    if (!keys.length) return;

    data.config.bare.m = [];
    data.config.hash.m = [];
    for (const id of keys) {
      const obj = state[id];
      const modules = this.zip.zipArray(data.machineSettings.moduleMap[id]);
      const beacons = this.zip.zipArray(data.machineSettings.beaconMap[id]);
      const overclock = this.zip.zipNumber(obj.overclock);
      data.config.bare.m.push(
        this.zip.zipFields([
          id,
          modules,
          beacons,
          this.zip.zipString(obj.fuelId),
          overclock,
        ]),
      );
      data.config.hash.m.push(
        this.zip.zipFields([
          this.zip.zipNString(id, hash.machines),
          modules,
          beacons,
          this.zip.zipNString(obj.fuelId, hash.fuels),
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
  ): Record<string, MachineState> | undefined {
    if (params.m == null) return;

    const state: Record<string, MachineState> = {};
    for (const machine of params.m) {
      const s = machine.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zip.parseString(s[i++], hash?.machines), '');
      const obj: MachineState = {
        modules: this.zip
          .parseArray(s[i++])
          ?.map((i) => moduleSettings[Number(i)] ?? {}),
        beacons: this.zip
          .parseArray(s[i++])
          ?.map((i) => beaconSettings[Number(i)] ?? {}),
        fuelId: this.zip.parseString(s[i++], hash?.fuels),
        overclock: this.zip.parseRational(s[i++]),
      };

      prune(obj);
      if (Object.keys(obj).length) state[id] = obj;
    }

    return state;
  }

  zipSettings(
    zState: ZipState,
    state: SettingsState,
    objectiveIds: string[],
    data: Dataset,
    hash: ModHash,
  ): void {
    const init = initialSettingsState;

    // Set up shorthand functions to zip state
    const set = this.zip.set(zState.config, state, init);
    const sub = set(this.zip.zipDiffSubset.bind(this.zip));
    const num = set(this.zip.zipDiffNumber.bind(this.zip));
    const bln = set(this.zip.zipDiffBool.bind(this.zip));
    const str = set(this.zip.zipDiffString.bind(this.zip));
    const rat = set(this.zip.zipDiffRational.bind(this.zip));
    const rnk = set(this.zip.zipDiffArray.bind(this.zip));
    const arr = set(this.zip.zipDiffIndices.bind(this.zip));

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
    arr('mbe', (s) => (s === init ? undefined : zState.beacons));
    rat('moc', (s) => s.overclock);
    rat('mbr', (s) => s.beaconReceivers);
    str('mps', (s) => s.proliferatorSprayId, hash.modules);
    rat('bmi', (s) => s.miningBonus);
    rat('bre', (s) => s.researchBonus);
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
    const get = this.zip.get(params);
    const sub = get(this.zip.parseSubset.bind(this.zip));
    const num = get(this.zip.parseNumber.bind(this.zip));
    const bln = get(this.zip.parseBool.bind(this.zip));
    const str = get(this.zip.parseString.bind(this.zip));
    const rat = get(this.zip.parseRational.bind(this.zip));
    const rnk = get(this.zip.parseArray.bind(this.zip));
    const arr = get(this.zip.parseIndices.bind(this.zip));

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
      miningBonus: rat('bmi'),
      researchBonus: rat('bre'),
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

    const mps = this.migration.parseSet.bind(this.migration);
    if (params.v10iex) obj.excludedItemIds = mps(params.v10iex, hash?.items);
    if (params.v10ich) obj.checkedItemIds = mps(params.v10ich, hash?.items);
    if (params.v10rex)
      obj.excludedRecipeIds = mps(params.v10rex, hash?.recipes);
    if (params.v10rch) obj.checkedRecipeIds = mps(params.v10rch, hash?.recipes);
    if (params.v10tre) {
      obj.researchedTechnologyIds = mps(params.v10tre, hash?.technologies);
      obj.researchedTechnologyIds =
        this.migration.restoreV10ResearchedTechnologies(
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

  zipTable(zState: ZipState, state: TableState): void {
    const init = initialTableState;

    // Set up shorthand functions to zip state
    const set = this.zip.set(zState.config, state, init);
    const num = set(this.zip.zipDiffNumber.bind(this.zip));
    const bln = set(this.zip.zipDiffBool.bind(this.zip));
    const str = set(this.zip.zipDiffString.bind(this.zip));

    // Zip state
    str('tfi', (s) => s.filter);
    str('tso', (s) => s.sort);
    bln('tas', (s) => s.asc);
    num('tpg', (s) => s.page);
    num('tro', (s) => s.rows);
  }

  unzipTable(params: LabParams): Partial<TableState> | undefined {
    // Set up shorthand functions to parse state
    const get = this.zip.get(params);
    const num = get(this.zip.parseNumber.bind(this.zip));
    const bln = get(this.zip.parseBool.bind(this.zip));
    const str = get(this.zip.parseString.bind(this.zip));

    const obj: Partial<TableState> = {
      filter: str('tfi'),
      sort: str('tso'),
      asc: bln('tas'),
      page: num('tpg'),
      rows: num('tro'),
    };

    prune(obj);
    if (!Object.keys(obj).length) return;

    return obj;
  }
}
