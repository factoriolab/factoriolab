import { inject, Injectable, signal } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime, Observable, Subject } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

import { data } from 'src/data';
import { coalesce, prune } from '~/helpers';
import {
  BeaconSettings,
  Entities,
  isRecipeObjective,
  ItemSettings,
  MachineSettings,
  MIN_ZIP,
  ModHash,
  ModuleSettings,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  QueryField,
  rational,
  RecipeSettings,
  Step,
  ZARRAYSEP,
  ZEMPTY,
  ZFIELDSEP,
  Zip,
  ZipData,
  ZipMachineSettings,
  ZipRecipeSettingsInfo,
  ZipVersion,
  ZNULL,
} from '~/models';
import {
  App,
  Datasets,
  Items,
  Machines,
  Objectives,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility } from '~/utilities';
import { CompressionService } from './compression.service';
import { ContentService } from './content.service';
import { DataService } from './data.service';
import { MigrationService } from './migration.service';
import { TranslateService } from './translate.service';
import { ZipService } from './zip.service';

const ZLISTSEP = '_'; // TODO: REMOVE

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  router = inject(Router);
  store = inject(Store);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);
  dataSvc = inject(DataService);
  compressionSvc = inject(CompressionService);
  zipSvc = inject(ZipService);
  migrationSvc = inject(MigrationService);

  zip: string | undefined;
  zipConfig = signal(this.empty);
  // Current hashing algorithm version
  version = ZipVersion.Version11;
  // zipTail: Zip = {
  //   bare: new URLSearchParams({ [ZipSection.Version]: this.version }),
  //   hash: new URLSearchParams({ [ZipSection.Version]: this.version }),
  // };
  first = true;
  ready$ = new Subject<void>();

  get empty(): Zip<URLSearchParams> {
    return { bare: new URLSearchParams(), hash: new URLSearchParams() };
  }

  get emptyRecipeSettingsInfo(): ZipRecipeSettingsInfo {
    return { idMap: {}, list: [] };
  }

  get emptyMachineSettings(): ZipMachineSettings {
    return { moduleMap: {}, beaconMap: {} };
  }

  initialize(): void {
    // this.router.events.subscribe((e) => this.updateState(e));

    this.ready$
      .pipe(
        first(),
        tap(() => this.dataSvc.initialize()),
        switchMap(() => this.store.select(Objectives.selectZipState)),
        debounceTime(0),
        tap((s) =>
          this.updateUrl(
            s.objectives,
            s.itemsState,
            s.recipesState,
            s.machinesState,
            s.settings,
          ),
        ),
      )
      .subscribe();
    this.ready$.next();
  }

  updateUrl(
    objectives: Objectives.ObjectivesState,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
    machineSettings: Machines.MachinesState,
    settings: Settings.SettingsState,
  ): void {
    this.zipState(
      objectives,
      itemsState,
      recipesState,
      machineSettings,
      settings,
    ).subscribe(async (zData) => {
      this.zip = await this.getHash(zData);
      const hash = this.router.url.split('#');
      const url = `${hash[0].split('?')[0]}?${this.zip}${
        (hash[1] && `#${hash[1]}`) || ''
      }`;
      this.router.navigateByUrl(url);
      // Don't cache landing or wizard
      if (!url.startsWith('/?') && !url.startsWith('/wizard'))
        BrowserUtility.routerState = url;
    });
  }

  zipState(
    objectives: Objectives.ObjectivesState,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
    machinesState: Machines.MachinesState,
    settings: Settings.SettingsState,
  ): Observable<ZipData> {
    return this.store.select(Datasets.selectHash).pipe(
      map((hashEntities) => hashEntities[settings.modId]),
      filter((hash): hash is ModHash => hash != null),
      first(),
      map((hash) => {
        // Modules & Beacons
        const zData = this.zipModulesBeacons(
          objectives,
          recipesState,
          machinesState,
          settings,
          hash,
        );

        // Item Objectives
        const o = Object.keys(objectives.entities).map(
          (k) => objectives.entities[k],
        );
        this.zipObjectives(zData, o, hash);

        // Settings
        this.zipItems(zData, itemsState, hash);
        this.zipRecipes(zData, recipesState, hash);
        this.zipMachines(zData, machinesState, hash);
        this.zipSettings(zData, settings, hash);
        this.zipConfig.set(zData.config);
        return zData;
      }),
    );
  }

  async stepHref(
    step: Step,
    config: Zip<URLSearchParams>,
    hash: ModHash | undefined,
  ): Promise<string | null> {
    if (hash == null) return null;

    let objectives: Objective[] | undefined;
    if (step.itemId != null && step.items != null) {
      objectives = [
        {
          id: '0',
          targetId: step.itemId,
          value: step.items,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      ];
    } else if (step.recipeId != null && step.machines != null) {
      objectives = [
        {
          id: '0',
          targetId: step.recipeId,
          value: step.machines,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
      ];
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
    const zHash = await this.getHash(zData);
    return `list?${zHash}`;
  }

  async getHash(zData: ZipData): Promise<string> {
    const bare = new URLSearchParams(zData.objectives.bare);
    zData.config.bare.forEach((value, key) => bare.append(key, value));
    console.log(bare);
    const bareStr = bare.toString();
    const hash = new URLSearchParams(zData.objectives.hash);
    zData.config.hash.forEach((value, key) => hash.append(key, value));
    const hashStr = hash.toString();
    const zStr = await this.compressionSvc.deflate(hashStr);
    const zip = `z=${zStr}&${QueryField.Version}=${this.version}`;
    return bareStr.length < Math.max(zip.length, MIN_ZIP) ? bareStr : zip;
  }

  getParams(zip: string): Entities {
    const sections = zip.split('&');
    const substr = sections[0][1] === '=' ? 2 : 1;
    const params = sections.reduce((e: Entities, v) => {
      e[v[0]] = v.substring(substr);
      return e;
    }, {});
    return params;
  }

  // async updateState(e: Event): Promise<void> {
  //   try {
  //     if (e instanceof NavigationEnd) {
  //       const [prehash, ...posthash] = e.urlAfterRedirects.split('#');
  //       const hash = posthash.join('#'); // Preserve # after first instance
  //       const [_, ...postquery] = prehash.split('?');
  //       let query = postquery.join('?'); // Preserve ? after first instance
  //       if (!query.length && hash.length > 1 && hash[1] === '=') {
  //         // Try to recognize and handle old hash style navigation
  //         query = hash;
  //       }

  //       if (query && this.zip !== query) {
  //         let zip = query;
  //         let isBare = true;
  //         const zipSection = new URLSearchParams(zip).get(ZipSection.Zip);
  //         if (zipSection != null) {
  //           zip = await this.compressionSvc.inflate(zipSection);
  //           isBare = false;
  //         }

  //         const a = new URLSearchParams(zip);
  //         let params = this.getParams(zip);
  //         ({ params, isBare } = this.migrationSvc.migrate(params, isBare));
  //         const state: App.PartialState = {};
  //         if (isBare) {
  //           const moduleSettings = this.unzipModules(params);
  //           const beaconSettings = this.unzipBeacons(params, moduleSettings);
  //           if (params[ZipSection.Objective]) {
  //             state.objectivesState = this.unzipObjectives(
  //               params,
  //               moduleSettings,
  //               beaconSettings,
  //             );
  //           }

  //           if (params[ZipSection.Item]) {
  //             state.itemsState = this.unzipItems(params);
  //           }

  //           if (params[ZipSection.Recipe]) {
  //             state.recipesState = this.unzipRecipes(
  //               params,
  //               moduleSettings,
  //               beaconSettings,
  //             );
  //           }

  //           if (params[ZipSection.Machine]) {
  //             state.machinesState = this.unzipMachines(
  //               params,
  //               moduleSettings,
  //               beaconSettings,
  //             );
  //           }

  //           state.settingsState = this.unzipSettings(params);
  //           this.dispatch(zip, state);
  //         } else {
  //           const modId = this.zipSvc.parseNString(
  //             params[ZipSection.Mod],
  //             data.modHash,
  //           );
  //           this.dataSvc
  //             .requestData(modId || Settings.initialState.modId)
  //             .subscribe(([_, hash]) => {
  //               const moduleSettings = this.unzipModules(params, hash);
  //               const beaconSettings = this.unzipBeacons(
  //                 params,
  //                 moduleSettings,
  //                 hash,
  //               );

  //               if (params[ZipSection.Objective]) {
  //                 state.objectivesState = this.unzipObjectives(
  //                   params,
  //                   moduleSettings,
  //                   beaconSettings,
  //                   hash,
  //                 );
  //               }

  //               if (params[ZipSection.Item]) {
  //                 state.itemsState = this.unzipItems(params, hash);
  //               }

  //               if (params[ZipSection.Recipe]) {
  //                 state.recipesState = this.unzipRecipes(
  //                   params,
  //                   moduleSettings,
  //                   beaconSettings,
  //                   hash,
  //                 );
  //               }

  //               if (params[ZipSection.Machine]) {
  //                 state.machinesState = this.unzipMachines(
  //                   params,
  //                   moduleSettings,
  //                   beaconSettings,
  //                   hash,
  //                 );
  //               }

  //               state.settingsState = this.unzipSettings(params, hash);

  //               if (modId != null) {
  //                 state.settingsState = {
  //                   ...state.settingsState,
  //                   ...{ modId },
  //                 };
  //               }

  //               this.dispatch(zip, state);
  //             });
  //         }
  //       } else {
  //         // No app state to dispatch, ready to load
  //         this.ready$.next();
  //       }
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     throw new Error('RouterService failed to parse url');
  //   }
  // }

  dispatch(zip: string, partial: App.PartialState): void {
    this.zip = zip;
    this.store.dispatch(App.load({ partial }));
    this.ready$.next();
  }

  zipModulesBeacons(
    objectives: Objectives.ObjectivesState,
    recipes: Recipes.RecipesState,
    machines: Machines.MachinesState,
    settings: Settings.SettingsState,
    hash: ModHash,
  ): ZipData {
    const modulesInfo = this.emptyRecipeSettingsInfo;
    const beaconsInfo = this.emptyRecipeSettingsInfo;

    const objectiveSettings = this.zipMachineSettings(
      objectives.entities,
      modulesInfo,
      beaconsInfo,
      hash,
    );
    const recipeSettings = this.zipMachineSettings(
      recipes,
      modulesInfo,
      beaconsInfo,
      hash,
    );
    const machineSettings = this.zipMachineSettings(
      machines,
      modulesInfo,
      beaconsInfo,
      hash,
    );

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
    config.bare.set(QueryField.Version, this.version);
    config.hash.set(QueryField.Version, this.version);
    const data = [
      [QueryField.Module, modulesInfo.list],
      [QueryField.Beacon, beaconsInfo.list],
    ] as const;
    data.forEach(([section, list]) => {
      list.forEach((e) => {
        config.bare.append(section, e.bare);
        config.hash.append(section, e.hash);
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
    state: Entities<Objective | RecipeSettings | MachineSettings>,
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
      if (beacon.modules == null) return undefined;
      return this.zipModuleArray(beacon.modules, modulesInfo, hash);
    });
  }

  zipModuleArray(
    values: ModuleSettings[],
    modulesInfo: ZipRecipeSettingsInfo,
    hash: ModHash,
  ): number[] {
    return values.map((obj) => {
      const count = this.zipSvc.zipString(obj.count?.toString());
      const zip: Zip<string> = {
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

  unzipModules(params: Entities, hash?: ModHash): ModuleSettings[] {
    if (!params[QueryField.Module]) return [];

    const list = params[QueryField.Module].split(ZLISTSEP);
    return list.map((module) => {
      const s = module.split(ZFIELDSEP);
      let i = 0;
      const obj: ModuleSettings = {
        count: this.zipSvc.parseRational(this.zipSvc.parseString(s[i++])),
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
      const count = this.zipSvc.zipString(obj.count?.toString());
      const modules = this.zipSvc.zipArray(moduleMap[i]);
      const total = this.zipSvc.zipString(obj.total?.toString());
      const zip: Zip<string> = {
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
    params: Entities,
    moduleSettings: ModuleSettings[],
    hash?: ModHash,
  ): BeaconSettings[] {
    if (!params[QueryField.Beacon]) return [];

    const list = params[QueryField.Beacon].split(ZLISTSEP);
    return list.map((beacon) => {
      const s = beacon.split(ZFIELDSEP);
      let i = 0;
      const obj: BeaconSettings = {
        count: this.zipSvc.parseRational(this.zipSvc.parseString(s[i++])),
        modules: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => coalesce(moduleSettings[Number(i)], {})),
        id: this.zipSvc.parseString(s[i++], hash?.beacons),
        total: this.zipSvc.parseRational(this.zipSvc.parseString(s[i++])),
      };

      prune(obj);
      return obj;
    });
  }

  zipObjectives(data: ZipData, objectives: Objective[], hash: ModHash): void {
    objectives.forEach((obj) => {
      const value = this.zipSvc.zipDiffString(obj.value.toString(), '1');
      const unit = this.zipSvc.zipDiffNumber(obj.unit, ObjectiveUnit.Items);
      const type = this.zipSvc.zipDiffNumber(obj.type, ObjectiveType.Output);
      const modules = this.zipSvc.zipArray(
        data.objectiveSettings.moduleMap[obj.id],
      );
      const beacons = this.zipSvc.zipArray(
        data.objectiveSettings.beaconMap[obj.id],
      );
      const overclock = this.zipSvc.zipNumber(obj.overclock);

      data.objectives.bare.append(
        QueryField.Objective,
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
      data.objectives.hash.append(
        QueryField.Objective,
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
    });
  }

  unzipObjectives(
    params: Entities,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Objectives.ObjectivesState {
    const list = params[QueryField.Objective].split(ZLISTSEP);
    const ids: string[] = [];
    const entities: Entities<Objective> = {};
    let index = 1;
    for (const itemObjective of list) {
      const s = itemObjective.split(ZFIELDSEP);
      let i = 0;
      const id = index.toString();
      const obj: Objective = {
        id: index.toString(),
        targetId: s[i++], // Convert to real id after determining unit, if hashed
        value: coalesce(this.zipSvc.parseRational(s[i++]), rational.one),
        unit: this.zipSvc.parseNumber(s[i++]) ?? ObjectiveUnit.Items,
        type: this.zipSvc.parseNumber(s[i++]) ?? ObjectiveType.Output,
        machineId: this.zipSvc.parseString(s[i++], hash?.machines),
        modules: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => moduleSettings[Number(i)] ?? {}),
        beacons: this.zipSvc
          .parseArray(s[i++])
          ?.map((i) => beaconSettings[Number(i)] ?? {}),
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
      ids.push(id);
      entities[id] = obj;
      index++;
    }
    return { ids, index, entities };
  }

  zipItems(data: ZipData, state: Items.ItemsState, hash: ModHash): void {
    Object.keys(state).forEach((i) => {
      const obj = state[i];
      data.config.bare.append(
        QueryField.Item,
        this.zipSvc.zipFields([
          i,
          this.zipSvc.zipString(obj.beltId),
          this.zipSvc.zipString(obj.wagonId),
        ]),
      );
      data.config.hash.append(
        QueryField.Item,
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(i, hash.items),
          this.zipSvc.zipNString(obj.beltId, hash.belts),
          this.zipSvc.zipNString(obj.wagonId, hash.wagons),
        ]),
      );
    });
  }

  unzipItems(params: Entities, hash?: ModHash): Items.ItemsState {
    const list = params[QueryField.Item].split(ZLISTSEP);
    const entities: Items.ItemsState = {};
    for (const item of list) {
      const s = item.split(ZFIELDSEP);
      let i = 0;
      const id = coalesce(this.zipSvc.parseString(s[i++], hash?.items), '');
      const obj: ItemSettings = {
        beltId: this.zipSvc.parseString(s[i++], hash?.belts),
        wagonId: this.zipSvc.parseString(s[i++], hash?.wagons),
      };

      prune(obj);
      entities[id] = obj;
    }
    return entities;
  }

  zipRecipes(data: ZipData, state: Recipes.RecipesState, hash: ModHash): void {
    Object.keys(state).forEach((i) => {
      const obj = state[i];
      const modules = this.zipSvc.zipArray(data.recipeSettings.moduleMap[i]);
      const beacons = this.zipSvc.zipArray(data.recipeSettings.beaconMap[i]);
      const overclock = this.zipSvc.zipNumber(obj.overclock);
      const cost = this.zipSvc.zipNumber(obj.cost);

      data.config.bare.append(
        QueryField.Recipe,
        this.zipSvc.zipFields([
          i,
          this.zipSvc.zipString(obj.machineId),
          modules,
          beacons,
          overclock,
          cost,
          this.zipSvc.zipString(obj.fuelId),
        ]),
      );
      data.config.hash.append(
        QueryField.Recipe,
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(i, hash.recipes),
          this.zipSvc.zipNString(obj.machineId, hash.machines),
          modules,
          beacons,
          overclock,
          cost,
          this.zipSvc.zipNString(obj.fuelId, hash.fuels),
        ]),
      );
    });
  }

  unzipRecipes(
    params: Entities,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Recipes.RecipesState {
    const list = params[QueryField.Recipe].split(ZLISTSEP);
    const entities: Recipes.RecipesState = {};
    for (const recipe of list) {
      const s = recipe.split(ZFIELDSEP);
      let i = 0;
      const id = this.zipSvc.parseString(s[i++], hash?.recipes) ?? '';
      const obj: RecipeSettings = {
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
      };

      prune(obj);
      entities[id] = obj;
    }
    return entities;
  }

  zipMachines(
    data: ZipData,
    state: Machines.MachinesState,
    hash: ModHash,
  ): void {
    Object.keys(state).forEach((i) => {
      const obj = state[i];
      const modules = this.zipSvc.zipArray(data.machineSettings.moduleMap[i]);
      const beacons = this.zipSvc.zipArray(data.machineSettings.beaconMap[i]);
      const overclock = this.zipSvc.zipNumber(obj.overclock);

      data.config.bare.append(
        QueryField.Machine,
        this.zipSvc.zipFields([
          i,
          modules,
          beacons,
          this.zipSvc.zipString(obj.fuelId),
          overclock,
        ]),
      );
      data.config.hash.append(
        QueryField.Machine,
        this.zipSvc.zipFields([
          this.zipSvc.zipNString(i, hash.machines),
          modules,
          beacons,
          this.zipSvc.zipNString(obj.fuelId, hash.fuels),
          overclock,
        ]),
      );
    });
  }

  unzipMachines(
    params: Entities,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Machines.MachinesState {
    const list = params[QueryField.Machine].split(ZLISTSEP);
    const entities: Machines.MachinesState = {};
    for (const machine of list) {
      const s = machine.split(ZFIELDSEP);
      let i = 0;
      const id = this.zipSvc.parseString(s[i++], hash?.machines) ?? '';
      const obj: MachineSettings = {
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
      entities[id] = obj;
    }

    return entities;
  }

  zipSettings(
    data: ZipData,
    state: Settings.SettingsState,
    hash: ModHash,
  ): void {
    // const init = Settings.initialState;
    // const displayRate = this.zipSvc.zipDiffDisplayRate(
    //   state.displayRate,
    //   init.displayRate,
    // );
    // const preset = this.zipSvc.zipDiffNumber(state.preset, init.preset);
    // const inserterCapacity = this.zipSvc.zipDiffNumber(
    //   state.inserterCapacity,
    //   init.inserterCapacity,
    // );
    // const inserterTarget = this.zipSvc.zipDiffNumber(
    //   state.inserterTarget,
    //   init.inserterTarget,
    // );
    // const beaconReceivers = this.zipSvc.zipDiffRational(
    //   state.beaconReceivers,
    //   init.beaconReceivers,
    // );
    // const netProductionOnly = this.zipSvc.zipDiffBool(
    //   state.netProductionOnly,
    //   init.netProductionOnly,
    // );
    // const costFactor = this.zipSvc.zipDiffRational(
    //   state.costs.factor,
    //   init.costs.factor,
    // );
    // const costMachine = this.zipSvc.zipDiffRational(
    //   state.costs.machine,
    //   init.costs.machine,
    // );
    // const costUnproduceable = this.zipSvc.zipDiffRational(
    //   state.costs.unproduceable,
    //   init.costs.unproduceable,
    // );
    // const costExcluded = this.zipSvc.zipDiffRational(
    //   state.costs.excluded,
    //   init.costs.excluded,
    // );
    // const costSurplus = this.zipSvc.zipDiffRational(
    //   state.costs.surplus,
    //   init.costs.surplus,
    // );
    // const costMaximize = this.zipSvc.zipDiffRational(
    //   state.costs.maximize,
    //   init.costs.maximize,
    // );
    // const surplusMachinesOutput = this.zipSvc.zipDiffBool(
    //   state.surplusMachinesOutput,
    //   init.surplusMachinesOutput,
    // );
    // const costFootprint = this.zipSvc.zipDiffRational(
    //   state.costs.footprint,
    //   init.costs.footprint,
    // );
    // const z: Zip = {
    //   bare: this.zipSvc.zipFields([
    //     this.zipSvc.zipDiffString(state.modId, init.modId),
    //     this.zipSvc.zipDiffNullableArray(
    //       state.researchedTechnologyIds,
    //       init.researchedTechnologyIds,
    //     ),
    //     displayRate,
    //     preset,
    //     this.zipSvc.zipDiffString(state.beltId, init.beltId),
    //     this.zipSvc.zipDiffRational(state.flowRate, init.flowRate),
    //     this.zipSvc.zipDiffRational(state.miningBonus, init.miningBonus),
    //     this.zipSvc.zipDiffRational(state.researchBonus, init.researchBonus),
    //     inserterCapacity,
    //     inserterTarget,
    //     this.zipSvc.zipDiffString(state.cargoWagonId, init.cargoWagonId),
    //     this.zipSvc.zipDiffString(state.fluidWagonId, init.fluidWagonId),
    //     this.zipSvc.zipDiffString(state.pipeId, init.pipeId),
    //     beaconReceivers,
    //     this.zipSvc.zipDiffString(
    //       state.proliferatorSprayId,
    //       init.proliferatorSprayId,
    //     ),
    //     netProductionOnly,
    //     this.zipSvc.zipDiffNumber(state.maximizeType, init.maximizeType),
    //     costFactor,
    //     costMachine,
    //     costUnproduceable,
    //     costExcluded,
    //     costSurplus,
    //     costMaximize,
    //     surplusMachinesOutput,
    //     costFootprint,
    //   ]),
    //   hash: this.zipSvc.zipFields([
    //     this.zipSvc.zipDiffNullableNArray(
    //       state.researchedTechnologyIds,
    //       init.researchedTechnologyIds,
    //       hash.technologies,
    //     ),
    //     displayRate,
    //     preset,
    //     this.zipSvc.zipDiffNString(state.beltId, init.beltId, hash.belts),
    //     this.zipSvc.zipDiffNRational(state.flowRate, init.flowRate),
    //     this.zipSvc.zipDiffNRational(state.miningBonus, init.miningBonus),
    //     this.zipSvc.zipDiffNRational(state.researchBonus, init.researchBonus),
    //     inserterCapacity,
    //     inserterTarget,
    //     this.zipSvc.zipDiffNString(
    //       state.cargoWagonId,
    //       init.cargoWagonId,
    //       hash.wagons,
    //     ),
    //     this.zipSvc.zipDiffNString(
    //       state.fluidWagonId,
    //       init.fluidWagonId,
    //       hash.wagons,
    //     ),
    //     this.zipSvc.zipDiffNString(state.pipeId, init.pipeId, hash.belts),
    //     beaconReceivers,
    //     this.zipSvc.zipDiffNString(
    //       state.proliferatorSprayId,
    //       init.proliferatorSprayId,
    //       hash.modules,
    //     ),
    //     netProductionOnly,
    //     this.zipSvc.zipDiffNNumber(state.maximizeType, init.maximizeType),
    //     costFactor,
    //     costMachine,
    //     costUnproduceable,
    //     costExcluded,
    //     costSurplus,
    //     costMaximize,
    //     surplusMachinesOutput,
    //     costFootprint,
    //   ]),
    // };
    // if (z.bare.length) {
    //   data.config.bare += `&${ZipSection.Settings}=${encodeURIComponent(z.bare)}`;
    //   data.config.hash += `&${ZipSection.Settings}${z.hash}`;
    // }
  }

  unzipSettings(
    params: Entities,
    hash?: ModHash,
  ): Settings.PartialSettingsState {
    // const zip = params[ZipSection.Settings];
    // const s = zip.split(ZFIELDSEP);
    // let i = 0;
    // const obj: Settings.PartialSettingsState = {
    //   modId: hash == null ? this.zipSvc.parseString(s[i++]) : undefined,
    //   researchedTechnologyIds: this.zipSvc.parseNullableArray(
    //     s[i++],
    //     hash?.technologies,
    //   ),
    //   displayRate: this.zipSvc.parseDisplayRate(s[i++]),
    //   preset: this.zipSvc.parseNumber(s[i++]),
    //   beltId: this.zipSvc.parseString(s[i++], hash?.belts),
    //   flowRate: this.zipSvc.parseRational(s[i++], hash != null),
    //   miningBonus: this.zipSvc.parseRational(s[i++], hash != null),
    //   researchBonus: this.zipSvc.parseRational(s[i++], hash != null),
    //   inserterCapacity: this.zipSvc.parseNumber(s[i++]),
    //   inserterTarget: this.zipSvc.parseNumber(s[i++]),
    //   cargoWagonId: this.zipSvc.parseString(s[i++], hash?.wagons),
    //   fluidWagonId: this.zipSvc.parseString(s[i++], hash?.wagons),
    //   pipeId: this.zipSvc.parseString(s[i++], hash?.belts),
    //   beaconReceivers: this.zipSvc.parseRational(s[i++]),
    //   proliferatorSprayId: this.zipSvc.parseString(s[i++], hash?.modules),
    //   netProductionOnly: this.zipSvc.parseBool(s[i++]),
    //   maximizeType: this.zipSvc.parseNumber(s[i++], hash != null),
    //   costs: {
    //     factor: this.zipSvc.parseRational(s[i++]),
    //     machine: this.zipSvc.parseRational(s[i++]),
    //     unproduceable: this.zipSvc.parseRational(s[i++]),
    //     excluded: this.zipSvc.parseRational(s[i++]),
    //     surplus: this.zipSvc.parseRational(s[i++]),
    //     maximize: this.zipSvc.parseRational(s[i++]),
    //   },
    //   surplusMachinesOutput: this.zipSvc.parseBool(s[i++]),
    // };
    // obj.costs!.footprint = this.zipSvc.parseRational(s[i++]);

    // prune(obj);
    // if (obj.costs) prune(obj.costs);

    // return obj;

    return {};
  }

  setQuerySubset(
    zip: Zip<URLSearchParams>,
    field: QueryField,
    value: string[],
    hash: string[],
  ): void {
    if (!value.length) return;
    const result = this.zipSvc.zipSubset(value, hash);
    zip.bare.set(field, result);
    zip.hash.set(field, result);
  }
}
