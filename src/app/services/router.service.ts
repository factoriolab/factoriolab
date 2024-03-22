import { inject, Injectable, signal } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { deflate, inflate } from 'pako';
import { combineLatest, debounceTime, Observable, Subject } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

import { data } from 'src/data';
import { filterNullish, orEmpty, orString } from '~/helpers';
import {
  BeaconSettings,
  CostsState,
  DisplayRate,
  Entities,
  Game,
  IdValueDefaultPayload,
  isRecipeObjective,
  ItemSettings,
  MachineSettings,
  ModHash,
  ModuleSettings,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  Rational,
  RecipeSettings,
  Step,
} from '~/models';
import {
  App,
  Datasets,
  Items,
  LabState,
  Machines,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility } from '~/utilities';
import { ContentService } from './content.service';
import { DataService } from './data.service';

export const NULL = '?'; // Encoded, previously 'n'
export const EMPTY = '='; // Encoded, previously 'e'
export const LISTSEP = '_'; // Unreserved, previously ','
export const ARRAYSEP = '~'; // Unreserved, previously '+'
export const FIELDSEP = '*'; // Reserved, unescaped by encoding
export const TRUE = '1';
export const FALSE = '0';
export const BASE64ABC =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.'; // Unreserved
export const MAX = BASE64ABC.length;
export const INVERT = BASE64ABC.split('').reduce(
  (e: Entities<number>, c, i) => {
    e[c] = i;
    return e;
  },
  {},
);
export const MIN_ZIP = 75;

export enum Section {
  Version = 'v',
  Mod = 'b',
  Objectives = 'p',
  RecipeObjectives = 'q', // Obsolete
  Items = 'i',
  Recipes = 'r',
  Machines = 'f',
  Modules = 'm',
  Beacons = 'e',
  Settings = 's',
  Costs = 'c',
  Zip = 'z',
}

export enum ZipVersion {
  Version0 = '0', // Bare
  Version1 = '1', // Bare
  Version2 = '2', // Hash
  Version3 = '3', // Hash
  Version4 = '4', // Bare
  Version5 = '5', // Hash
  Version6 = '6', // Bare
  Version7 = '7', // Hash
  Version8 = '8', // Unified
  Version9 = '9', // Unified
}

export enum MigrationWarning {
  ExpensiveDeprecation = 'The expensive setting has been removed. Please use or request an expensive data set instead.',
  LimitStepDeprecation = 'Limit steps have been replaced by limit objectives. Results may differ if using multiple objectives as limits apply to all objectives.',
}

export interface Zip {
  bare: string;
  hash: string;
}

export interface ZipRecipeSettingsInfo {
  idMap: Entities<number>;
  list: Zip[];
}

export interface ZipMachineSettings {
  moduleMap: Entities<number[]>;
  beaconMap: Entities<number[]>;
}

export interface ZipData {
  objectives: Zip;
  config: Zip;
  objectiveSettings: ZipMachineSettings;
  recipeSettings: ZipMachineSettings;
  machineSettings: ZipMachineSettings;
}

export interface MigrationState {
  params: Entities<string>;
  warnings: string[];
  isBare: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  router = inject(Router);
  gaSvc = inject(GoogleAnalyticsService);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);
  dataSvc = inject(DataService);

  zip: string | undefined;
  zipConfig = signal<Zip>(this.empty);
  base64codes: Uint8Array;
  // Current hashing algorithm version
  version = ZipVersion.Version9;
  zipTail: Zip = {
    bare: `&${Section.Version}=${this.version}`,
    hash: `&${Section.Version}${this.version}`,
  };
  first = true;
  ready$ = new Subject<void>();
  /**
   * V6/V7 Disabled recipes have to be fixed up after data loads because state
   * depends on default values. Trigger this migration to be run after load via
   * this subject.
   */
  fixV8ExcludedRecipes$ = new Subject<void>();

  get empty(): Zip {
    return { bare: '', hash: '' };
  }

  get emptyRecipeSettingsInfo(): ZipRecipeSettingsInfo {
    return { idMap: {}, list: [] };
  }

  get emptyMachineSettings(): ZipMachineSettings {
    return { moduleMap: {}, beaconMap: {} };
  }

  constructor() {
    const l = 256;
    this.base64codes = new Uint8Array(l);
    for (let i = 0; i < l; i++) {
      this.base64codes[i] = 255; // invalid character
    }
    for (let i = 0; i < BASE64ABC.length; i++) {
      this.base64codes[BASE64ABC.charCodeAt(i)] = i;
    }
    this.base64codes['_'.charCodeAt(0)] = 0;

    /**
     * When migrating to V8, set `excluded` to `false` for any recipes which are
     * excluded by default but were not excluded in the migrated router state.
     */
    this.fixV8ExcludedRecipes$
      .pipe(
        switchMap(() =>
          this.store.select(Settings.getMod).pipe(
            map((m) => m?.defaults),
            filterNullish(),
            first(),
          ),
        ),
        switchMap(() =>
          combineLatest([
            this.store.select(Recipes.recipesState),
            this.store.select(Recipes.getRecipesState),
          ]).pipe(first()),
        ),
        tap(([recipesRaw, recipesState]) => {
          const payload: IdValueDefaultPayload<boolean>[] = [];
          for (const id of Object.keys(recipesState)) {
            const value = recipesState[id].excluded;
            if (value && !recipesRaw[id]?.excluded) {
              payload.push({ id, value: false, def: true });
            }
          }
          this.store.dispatch(new Recipes.SetExcludedBatchAction(payload));
        }),
      )
      .subscribe();
  }

  initialize(): void {
    this.router.events.subscribe((e) => this.updateState(e));

    this.ready$
      .pipe(
        first(),
        tap(() => this.dataSvc.initialize()),
        switchMap(() => this.store.select(Objectives.getZipState)),
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

    this.store
      .select(Preferences.getStates)
      .pipe(first())
      .subscribe((states) => this.migrateOldStates(states));
  }

  /** Migrate any saved states ungrouped by game into new groupings */
  migrateOldStates(states: Record<Game, Entities<string>>): void {
    if (
      Object.keys(states).every(
        (k) => Preferences.initialPreferencesState.states[k as Game] != null,
      )
    )
      return; // Does not need to be migrated

    let migratingStates = { ...states } as unknown as Entities<
      Entities<string> | string
    >;
    for (const key of Object.keys(migratingStates)) {
      const state = migratingStates[key];
      if (typeof state !== 'string') continue;

      // State needs to be moved into a grouping
      const game = this.getGameFromState(state);
      migratingStates = {
        ...migratingStates,
        ...{
          [game]: {
            ...(migratingStates[game] as unknown as Entities<string>),
            ...{ [key]: state },
          },
        },
      };
      delete migratingStates[key];
    }

    this.store.dispatch(
      new Preferences.SetStatesAction(
        migratingStates as unknown as Record<Game, Entities<string>>,
      ),
    );
  }

  getGameFromState(state: string): Game {
    const modId = this.getModIdFromState(state);
    return this.getGameFromModId(modId);
  }

  getModIdFromState(state: string): string | undefined {
    if (state.startsWith('z=')) {
      // Zipped saved state
      const matchZip = state.match('z=(.+?)(&|$)');
      if (matchZip == null) return;

      const zip = matchZip[1];
      const unzip = this.inflateSafe(zip);
      const matchModId = unzip.match('(&|^)b(.*?)(&|$)');
      if (matchModId == null) return;

      const zipModId = matchModId[2];
      return this.parseNString(zipModId, data.hash);
    } else {
      // Unzipped saved state
      const match = state.match('s=(.+?)(&|$)');
      if (match == null) return;

      return match[1];
    }
  }

  getGameFromModId(modId: string | undefined): Game {
    if (modId == null) return Game.Factorio;
    return data.mods.find((m) => m.id === modId)?.game ?? Game.Factorio;
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
    ).subscribe((zData) => {
      this.zip = this.getHash(zData);
      const hash = this.router.url.split('#');
      const url = `${hash[0].split('?')[0]}?${this.zip}${
        (hash[1] && `#${hash[1]}`) || ''
      }`;
      this.router.navigateByUrl(url);
      // Don't cache landing or wizard
      if (!url.startsWith('/?') && !url.startsWith('/wizard')) {
        BrowserUtility.routerState = url;
      }
    });
  }

  zipState(
    objectives: Objectives.ObjectivesState,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
    machinesState: Machines.MachinesState,
    settings: Settings.SettingsState,
  ): Observable<ZipData> {
    return this.store.select(Datasets.getHashRecord).pipe(
      map((hashEntities) => hashEntities[settings.modId]),
      filter((hash): hash is ModHash => hash != null),
      first(),
      map((hash) => {
        // Modules & Beacons
        const zData = this.zipModulesBeacons(
          objectives,
          recipesState,
          machinesState,
          hash,
        );

        // Item Objectives
        const o = Object.keys(objectives.entities).map(
          (k) => objectives.entities[k],
        );
        this.zipObjectives(zData, o, hash);

        // Mod (Hashed only, for hash lookup)
        const zMod = this.zipDiffString(
          settings.modId,
          Settings.initialSettingsState.modId,
        );
        if (zMod.length) {
          zData.config.hash += `&${Section.Mod}${this.getId(
            data.hash.indexOf(zMod),
          )}`;
        }

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

  stepHref(step: Step, config: Zip, hash: ModHash | undefined): string | null {
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
    return 'list?' + this.getHash(zData);
  }

  getHash(zData: ZipData): string {
    let bare = zData.objectives.bare + zData.config.bare + this.zipTail.bare;
    if (bare.startsWith('&')) {
      bare = bare.substring(1);
    }

    const hash = zData.objectives.hash + zData.config.hash + this.zipTail.hash;
    const zip = `z=${this.bytesToBase64(deflate(hash))}&${Section.Version}=${
      this.version
    }`;
    return bare.length < Math.max(zip.length, MIN_ZIP) ? bare : zip;
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

  updateState(e: Event): void {
    try {
      if (e instanceof NavigationEnd) {
        const [prehash, ...posthash] = e.urlAfterRedirects.split('#');
        const hash = posthash.join('#'); // Preserve # after first instance
        const [_, ...postquery] = prehash.split('?');
        let query = postquery.join('?'); // Preserve ? after first instance
        if (!query.length && hash.length > 1 && hash[1] === '=') {
          // Try to recognize and handle old hash style navigation
          query = hash;
        }

        if (query && this.zip !== query) {
          let zip = query;
          let isBare = true;
          const zipSection = new URLSearchParams(zip).get(Section.Zip);
          if (zipSection != null) {
            // Upgrade V0 query-unsafe zipped characters
            const z = zipSection
              .replace(/\+/g, '-')
              .replace(/\//g, '.')
              .replace(/=/g, '_');
            zip = this.inflateSafe(z);
            isBare = false;
          }
          // Upgrade V0 query-unsafe delimiters
          zip = zip.replace(/,/g, LISTSEP).replace(/\+/g, ARRAYSEP);
          // Upgrade V0 null/empty values
          zip = zip
            .replace(/\*n\*/g, `*${NULL}*`)
            .replace(/\*e\*/g, `*${EMPTY}*`);
          let params = this.getParams(zip);
          let warnings: string[] = [];
          ({ params, warnings, isBare } = this.migrate(params, isBare));
          this.displayWarnings(warnings);
          const state: App.PartialState = {};
          if (isBare) {
            const moduleSettings = this.unzipModules(params);
            const beaconSettings = this.unzipBeacons(params, moduleSettings);
            if (params[Section.Objectives]) {
              state.objectivesState = this.unzipObjectives(
                params,
                moduleSettings,
                beaconSettings,
              );
            }
            if (params[Section.Items]) {
              state.itemsState = this.unzipItems(params);
            }
            if (params[Section.Recipes]) {
              state.recipesState = this.unzipRecipes(
                params,
                moduleSettings,
                beaconSettings,
              );
            }
            if (params[Section.Machines]) {
              state.machinesState = this.unzipMachines(
                params,
                moduleSettings,
                beaconSettings,
              );
            }
            if (params[Section.Settings]) {
              state.settingsState = this.unzipSettings(params);
            }
            this.dispatch(zip, state);
          } else {
            const modId = this.parseNString(params[Section.Mod], data.hash);
            this.dataSvc
              .requestData(modId || Settings.initialSettingsState.modId)
              .subscribe(([_, hash]) => {
                const moduleSettings = this.unzipModules(params, hash);
                const beaconSettings = this.unzipBeacons(
                  params,
                  moduleSettings,
                  hash,
                );
                if (params[Section.Objectives]) {
                  state.objectivesState = this.unzipObjectives(
                    params,
                    moduleSettings,
                    beaconSettings,
                    hash,
                  );
                }
                if (params[Section.Items]) {
                  state.itemsState = this.unzipItems(params, hash);
                }
                if (params[Section.Recipes]) {
                  state.recipesState = this.unzipRecipes(
                    params,
                    moduleSettings,
                    beaconSettings,
                    hash,
                  );
                }
                if (params[Section.Machines]) {
                  state.machinesState = this.unzipMachines(
                    params,
                    moduleSettings,
                    beaconSettings,
                    hash,
                  );
                }
                if (params[Section.Settings]) {
                  state.settingsState = this.unzipSettings(params, hash);
                }
                if (modId != null) {
                  state.settingsState = {
                    ...state.settingsState,
                    ...{ modId },
                  };
                }
                this.dispatch(zip, state);
              });
          }
        } else {
          // No app state to dispatch, ready to load
          this.ready$.next();
        }
      }
    } catch (err) {
      console.error(err);
      throw new Error('RouterService failed to parse url');
    }
  }

  dispatch(zip: string, state: App.PartialState): void {
    this.zip = zip;
    this.store.dispatch(new App.LoadAction(state));
    this.ready$.next();
  }

  /** Migrates older zip params to latest bare/hash formats */
  migrate(params: Entities, isBare: boolean): MigrationState {
    const warnings: string[] = [];
    const v = (params[Section.Version] as ZipVersion) ?? ZipVersion.Version0;
    this.gaSvc.event('unzip_version', v);

    if (isBare || v === ZipVersion.Version0) {
      Object.keys(params).forEach((k) => {
        params[k] = decodeURIComponent(params[k]);
      });
    }

    const state: MigrationState = { params, warnings, isBare };
    switch (v) {
      case ZipVersion.Version0:
        return this.migrateV0(state);
      case ZipVersion.Version1:
        return this.migrateV1(state);
      case ZipVersion.Version2:
        return this.migrateV2(state);
      case ZipVersion.Version3:
        return this.migrateV3(state);
      case ZipVersion.Version4:
        return this.migrateV4(state);
      case ZipVersion.Version5:
        return this.migrateV5(state);
      case ZipVersion.Version6:
        return this.migrateV6(state);
      case ZipVersion.Version7:
        return this.migrateV7(state);
      case ZipVersion.Version8:
        return this.migrateV8(state);
      default:
        return { params, warnings, isBare };
    }
  }

  /** Migrates V0 bare zip to latest bare format */
  migrateV0(state: MigrationState): MigrationState {
    const { params } = state;
    if (params[Section.Settings]) {
      // Reorganize settings
      const zip = params[Section.Settings];
      const s = zip.split(FIELDSEP);
      // Convert modId to V1
      let modId = this.parseString(s[0]);
      modId = modId && data.hash[data.v0.indexOf(modId)];
      modId = modId ?? NULL;
      // Convert displayRate to V1
      const displayRateV0 =
        this.parseNumber(s[6]) ?? Settings.initialSettingsState.displayRate;
      const displayRateV1 = this.zipDiffDisplayRate(
        displayRateV0,
        Settings.initialSettingsState.displayRate,
      );
      params[Section.Settings] = this.zipFields([
        modId,
        displayRateV1,
        params[Section.Mod], // Legacy preset
        s[1], // excludedRecipeIds
        s[3], // beltId
        s[4], // fuelId
        s[5], // flowRate
        s[7], // miningBonus
        s[8], // researchSpeed
        s[10], // inserterCapacity
        s[9], // inserterTarget
        s[2], // expensive
        s[11], // cargoWagonId
        s[12], // fluidWagonId
      ]);
    } else if (params[Section.Mod]) {
      params[Section.Settings] = this.zipFields([
        NULL,
        NULL,
        params[Section.Mod], // Legacy preset
      ]);
    }

    params[Section.Version] = ZipVersion.Version1;
    return this.migrateV1(state);
  }

  /** Migrates V1 bare zip to latest bare format */
  migrateV1(state: MigrationState): MigrationState {
    const { params, warnings } = state;
    if (params[Section.Settings]) {
      const zip = params[Section.Settings];
      const s = zip.split(FIELDSEP);
      const index = 11; // Index of expensive field
      if (s.length > index) {
        // Remove expensive field
        const val = s.splice(index, 1);
        const expensive = this.parseBool(val[0]);
        if (expensive) {
          warnings.push(MigrationWarning.ExpensiveDeprecation);
        }
      }

      params[Section.Settings] = this.zipFields(s);
    }

    params[Section.Version] = ZipVersion.Version4;
    return this.migrateV4(state);
  }

  /** Migrates V2 hash zip to latest hash format */
  migrateV2(state: MigrationState): MigrationState {
    const { params } = state;
    if (params[Section.Recipes]) {
      // Convert recipe settings
      const zip = params[Section.Recipes];
      const list = zip.split(LISTSEP);
      const migrated = [];
      const index = 3; // Index of beaconCount field
      for (const recipe of list) {
        const s = recipe.split(FIELDSEP);
        if (s.length > index) {
          // Convert beaconCount from number to string format
          const asString = this.parseNNumber(s[index])?.toString();
          s[index] = this.zipTruthyString(asString);
        }

        migrated.push(this.zipFields(s));
      }

      params[Section.Recipes] = migrated.join(LISTSEP);
    }

    if (params[Section.Machines]) {
      // Convert machine settings
      const zip = params[Section.Machines];
      const list = zip.split(LISTSEP);
      const migrated: string[] = [];
      const index = 2; // Index of beaconCount field
      for (const machine of list) {
        const s = machine.split(FIELDSEP);
        if (s.length > index) {
          // Convert beaconCount from number to string format
          const asString = this.parseNNumber(s[index])?.toString();
          s[index] = this.zipTruthyString(asString);
        }

        migrated.push(this.zipFields(s));
      }

      params[Section.Machines] = migrated.join(LISTSEP);
    }

    params[Section.Version] = ZipVersion.Version3;
    return this.migrateV3(state);
  }

  /** Migrates V3 hash zip to latest hash format */
  migrateV3(state: MigrationState): MigrationState {
    const { params, warnings } = state;
    if (params[Section.Settings]) {
      const zip = params[Section.Settings];
      const s = zip.split(FIELDSEP);
      const index = 10; // Index of expensive field
      if (s.length > index) {
        // Remove expensive field
        const val = s.splice(index, 1);
        const expensive = this.parseBool(val[0]);
        if (expensive) {
          warnings.push(MigrationWarning.ExpensiveDeprecation);
        }
      }

      params[Section.Settings] = this.zipFields(s);
    }

    params[Section.Version] = ZipVersion.Version5;
    return this.migrateV5(state);
  }

  private migrateInlineBeaconsSection(
    params: Entities,
    section: Section,
    countIndex: number,
    beacons: string[],
  ): void {
    if (params[section]) {
      const zip = params[section];
      const list = zip.split(LISTSEP);
      const migrated: string[] = [];

      for (const s of list.map((z) => z.split(FIELDSEP))) {
        const moduleIdsIndex = countIndex + 1;
        const idIndex = moduleIdsIndex + 1;
        const totalIndex = idIndex + 3; // Only ever applied to recipes

        if (s.length > countIndex) {
          let id: string | undefined;
          let moduleIds: string | undefined;
          let total: string | undefined;

          // Move backwards from the last index, removing found properties
          if (s.length > totalIndex) {
            // Remove total field
            total = s.splice(totalIndex, 1)[0];
          }

          if (s.length > idIndex) {
            // Remove beaconId field
            id = s.splice(idIndex, 1)[0];
          }

          if (s.length > moduleIdsIndex) {
            // Remove modules field
            moduleIds = s.splice(moduleIdsIndex, 1)[0];
          }

          // Get beaconCount field
          const count = s[countIndex];

          // Replace beaconCount field with beacons field
          s[countIndex] = this.zipTruthyArray([beacons.length]);

          // Add beacon settings
          beacons.push(
            this.zipFields([
              count,
              this.zipTruthyString(moduleIds),
              this.zipTruthyString(id),
              this.zipTruthyString(total),
            ]),
          );
        }

        migrated.push(this.zipFields(s));
      }

      params[section] = migrated.join(LISTSEP);
    }
  }

  private migrateInlineBeacons(state: MigrationState): MigrationState {
    const list: string[] = [];

    this.migrateInlineBeaconsSection(
      state.params,
      Section.RecipeObjectives,
      4,
      list,
    );
    this.migrateInlineBeaconsSection(state.params, Section.Recipes, 3, list);

    if (list.length) {
      // Add beacon settings
      state.params[Section.Beacons] = list.join(LISTSEP);
    }

    return state;
  }

  /** Migrates V4 bare zip to latest bare format */
  migrateV4(state: MigrationState): MigrationState {
    state = this.migrateInlineBeacons(state);
    state.params[Section.Version] = ZipVersion.Version6;
    return this.migrateV6(state);
  }

  /** Migrates V5 hash zip to latest hash format */
  migrateV5(state: MigrationState): MigrationState {
    state = this.migrateInlineBeacons(state);
    state.params[Section.Version] = ZipVersion.Version7;
    return this.migrateV7(state);
  }

  private migrateInsertField(
    params: Entities,
    section: Section,
    index: number,
  ): void {
    if (params[section]) {
      const list = params[section].split(LISTSEP);
      for (let i = 0; i < list.length; i++) {
        const o = list[i].split(FIELDSEP);
        if (o.length > index) {
          o.splice(index, 0, '');
          list[i] = this.zipFields(o);
        }
      }

      params[section] = list.join(LISTSEP);
    }
  }

  private migrateDeleteField(
    params: Entities,
    section: Section,
    index: number,
  ): void {
    if (params[section]) {
      const list = params[section].split(LISTSEP);
      for (let i = 0; i < list.length; i++) {
        const o = list[i].split(FIELDSEP);
        if (o.length > index) {
          o.splice(index, 1);
          list[i] = this.zipFields(o);
        }
      }

      params[section] = list.join(LISTSEP);
    }
  }

  private migrateMoveUpField(fields: string[], from: number, to: number): void {
    if (fields[from] != null) {
      const value = fields[from];
      fields.splice(from, 1);
      if (fields.length > to) {
        // Insert space to maintain length
        fields.splice(to, 0, '');
      }

      while (fields.length <= to) {
        fields.push('');
      }

      fields[to] = value;
    }
  }

  private migrateToV8(state: MigrationState): MigrationState {
    const { params, isBare } = state;
    let needsLimitDeprecationWarning = false;

    // RecipeObjectives: Insert type field
    this.migrateInsertField(params, Section.RecipeObjectives, 2);

    /**
     * ItemObjectives: Convert via / limit step, convert machines rate type to
     * recipe objectives
     */
    if (params[Section.Objectives]) {
      const list = params[Section.Objectives].split(LISTSEP);
      const migrated = [...list];
      for (let i = 0; i < list.length; i++) {
        const obj = list[i];
        const o = obj.split(FIELDSEP);

        if (o[2] === '3') {
          if (isBare) {
            // Convert old RateType.Machines to recipe objectives
            const recipes = params[Section.RecipeObjectives]
              ? params[Section.RecipeObjectives].split(LISTSEP)
              : [];
            if (o.length > 3) {
              // Also switch into limit / maximize objectives
              const limit = [o[3], o[1], ObjectiveType.Limit.toString()];
              const maximize = [o[0], '1', ObjectiveType.Maximize.toString()];
              recipes.push(this.zipFields(maximize));
              recipes.push(this.zipFields(limit));
              needsLimitDeprecationWarning = true;
            } else {
              recipes.push(this.zipFields([o[0], o[1]]));
            }

            migrated.splice(i, 1);
            params[Section.RecipeObjectives] = recipes.join(LISTSEP);
          } else {
            /**
             * Convert hashed RateType.Machines to simple item objective by a
             * number of items, since we can't recover the recipe id directly
             * from the hashed item id. I.E. prefer losing the objective unit
             * over losing the whole objective.
             */
            o[2] = '0';
            migrated[i] = this.zipFields(o);
          }
        } else {
          if (o.length > 3) {
            // Set up limit with via id & objective rate / rate type
            const limit = [o[3], o[1], o[2], ObjectiveType.Limit.toString()];
            // Convert original objective to maximize objective with weight of 1
            const maximize = [o[0], '1', '', ObjectiveType.Maximize.toString()];
            migrated[i] = this.zipFields(maximize);
            migrated.push(this.zipFields(limit));
            needsLimitDeprecationWarning = true;
          }
        }
      }

      if (needsLimitDeprecationWarning) {
        state.warnings.push(MigrationWarning.LimitStepDeprecation);
      }

      params[Section.Objectives] = migrated.join(LISTSEP);
    }

    // Items: Remove recipeId
    this.migrateDeleteField(params, Section.Items, 4);

    // Recipes: Insert excluded field
    this.migrateInsertField(params, Section.Recipes, 1);

    /**
     * Settings: Insert researchedTechnologyIds and maximizeType, move
     * disabledRecipeIds into Recipes, move costs
     */
    if (params[Section.Settings]) {
      const s = params[Section.Settings].split(FIELDSEP);
      const x = isBare ? 1 : 0;

      // Convert disabled recipe ids
      if (s.length > 2 + x) {
        const disabledRecipeIds = this.parseArray(s[2 + x]);
        if (disabledRecipeIds) {
          const recipes = params[Section.Recipes];
          const list = recipes ? recipes.split(LISTSEP) : [];
          for (const id of disabledRecipeIds) {
            let found = false;
            for (let i = 0; i < list.length; i++) {
              const r = list[i].split(FIELDSEP);
              if (r[0] === id) {
                found = true;
                r[1] = TRUE;
                list[i] = this.zipFields(r);
              }
            }

            if (!found) {
              list.push(this.zipFields([id, TRUE]));
            }
          }

          params[Section.Recipes] = list.join(LISTSEP);

          this.fixV8ExcludedRecipes$.next();
        }

        s.splice(2 + x, 1);
      }

      // Insert researchedTechnologyIds
      s.splice(x, 0, '');

      // Move cost fields
      this.migrateMoveUpField(s, 16 + x, 20 + x);
      this.migrateMoveUpField(s, 15 + x, 19 + x);
      this.migrateMoveUpField(s, 14 + x, 18 + x);
      this.migrateMoveUpField(s, 13 + x, 17 + x);

      params[Section.Settings] = this.zipFields(s);
    }

    params[Section.Version] = ZipVersion.Version8;
    return state;
  }

  /** Migrates V6 bare zip to latest format */
  migrateV6(state: MigrationState): MigrationState {
    state.isBare = true;
    return this.migrateToV8(state);
  }

  /** Migrates V7 hash zip to latest format */
  migrateV7(state: MigrationState): MigrationState {
    state.isBare = false;
    return this.migrateToV8(state);
  }

  migrateV8(state: MigrationState): MigrationState {
    const { params } = state;

    // Need to convert Recipe Objectives to unified Objectives
    if (params[Section.RecipeObjectives]) {
      let objectives: string[] = [];
      if (params[Section.Objectives]) {
        objectives = params[Section.Objectives].split(LISTSEP);
      }

      const list = params[Section.RecipeObjectives].split(LISTSEP);
      for (let i = 0; i < list.length; i++) {
        const o = list[i].split(FIELDSEP);
        const n = this.zipFields([
          o[0],
          o[1],
          '3',
          o[2],
          o[3],
          o[4],
          o[5],
          o[6],
          o[7],
        ]);
        objectives.push(n);
      }

      params[Section.Objectives] = objectives.join(LISTSEP);
    }

    params[Section.Version] = ZipVersion.Version9;
    return state;
  }

  displayWarnings(warnings: string[]): void {
    for (const message of warnings) {
      this.contentSvc.confirm({
        message,
        header: this.translateSvc.instant('app.migrationWarning'),
        acceptLabel: this.translateSvc.instant('OK'),
        // acceptVisible: false,
        rejectVisible: false,
      });
    }
  }

  zipModulesBeacons(
    objectives: Objectives.ObjectivesState,
    recipes: Recipes.RecipesState,
    machines: Machines.MachinesState,
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
      machines.entities,
      modulesInfo,
      beaconsInfo,
      hash,
    );

    if (machines.beacons) {
      const moduleMap = this.beaconModuleMap(
        machines.beacons,
        modulesInfo,
        hash,
      );
      machineSettings.beaconMap[''] = this.zipBeaconArray(
        machines.beacons,
        moduleMap,
        beaconsInfo,
        hash,
      );
    }

    const config = this.empty;
    const data = [
      [Section.Modules, modulesInfo.list],
      [Section.Beacons, beaconsInfo.list],
    ] as const;
    data.forEach(([section, list]) => {
      const z = this.zipList(list);
      if (z.bare.length) {
        config.bare += `&${section}=${z.bare}`;
        config.hash += `&${section}${z.hash}`;
      }
    });

    return {
      objectives: this.empty,
      config,
      objectiveSettings,
      recipeSettings,
      machineSettings,
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
      const count = this.zipTruthyString(obj.count.toString());
      const zip: Zip = {
        bare: this.zipFields([count, this.zipTruthyString(obj.id)]),
        hash: this.zipFields([
          count,
          this.zipTruthyNString(obj.id, hash.modules),
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
    if (!params[Section.Modules]) return [];

    const list = params[Section.Modules].split(LISTSEP);
    return list.map((module) => {
      const s = module.split(FIELDSEP);
      let i = 0;
      const obj: ModuleSettings = {
        count: Rational.from(this.parseString(s[i++]) ?? 0),
        id: this.parseString(s[i++], hash?.modules) ?? '',
      };

      this.deleteEmptyKeys(obj);
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
      const count = this.zipTruthyString(obj.count.toString());
      const modules = this.zipTruthyArray(moduleMap[i]);
      const total = this.zipTruthyString(obj.total?.toString());
      const zip: Zip = {
        bare: this.zipFields([
          count,
          this.zipTruthyString(obj.id),
          modules,
          total,
        ]),
        hash: this.zipFields([
          count,
          this.zipTruthyNString(obj.id, hash.beacons),
          modules,
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
    if (!params[Section.Beacons]) return [];

    const list = params[Section.Beacons].split(LISTSEP);
    return list.map((beacon) => {
      const s = beacon.split(FIELDSEP);
      let i = 0;
      const obj: BeaconSettings = {
        count: Rational.from(this.parseString(s[i++]) ?? 0),
        id: orString(this.parseString(s[i++], hash?.beacons)),
        modules: orEmpty(
          this.parseArray(s[i++])?.map((i) => moduleSettings[Number(i)] ?? {}),
        ),
        total: Rational.from(this.parseString(s[i++])),
      };

      this.deleteEmptyKeys(obj);
      return obj;
    });
  }

  zipObjectives(data: ZipData, objectives: Objective[], hash: ModHash): void {
    const z = this.zipList(
      objectives.map((obj) => {
        const value = obj.value.toString();
        const unit = this.zipDiffNumber(obj.unit, ObjectiveUnit.Items);
        const type = this.zipDiffNumber(obj.type, ObjectiveType.Output);
        const modules = this.zipTruthyArray(
          data.objectiveSettings.moduleMap[obj.id],
        );
        const beacons = this.zipTruthyArray(
          data.objectiveSettings.beaconMap[obj.id],
        );
        const overclock = this.zipTruthyNumber(obj.overclock);
        const checked = this.zipTruthyBool(obj.checked);

        return {
          bare: this.zipFields([
            obj.targetId,
            value,
            unit,
            type,
            this.zipTruthyString(obj.machineId),
            modules,
            beacons,
            overclock,
            checked,
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(
              obj.targetId,
              isRecipeObjective(obj) ? hash.recipes : hash.items,
            ),
            value,
            unit,
            type,
            this.zipTruthyNString(obj.machineId, hash.machines),
            modules,
            beacons,
            overclock,
            checked,
          ]),
        };
      }),
    );

    if (z.bare.length) {
      data.objectives.bare += `${Section.Objectives}=${z.bare}`;
      data.objectives.hash += `${Section.Objectives}${z.hash}`;
    }
  }

  unzipObjectives(
    params: Entities,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Objectives.ObjectivesState {
    const list = params[Section.Objectives].split(LISTSEP);
    const ids: string[] = [];
    const entities: Entities<Objective> = {};
    let index = 1;
    for (const itemObjective of list) {
      const s = itemObjective.split(FIELDSEP);
      let i = 0;
      const id = index.toString();
      const obj: Objective = {
        id: index.toString(),
        targetId: s[i++], // Convert to real id after determining unit, if hashed
        value: this.parseRational(s[i++]) ?? Rational.zero,
        unit: this.parseNumber(s[i++]) ?? ObjectiveUnit.Items,
        type: this.parseNumber(s[i++]) ?? ObjectiveType.Output,
        machineId: this.parseString(s[i++], hash?.machines),
        modules: this.parseArray(s[i++])?.map(
          (i) => moduleSettings[Number(i)] ?? {},
        ),
        beacons: this.parseArray(s[i++])?.map(
          (i) => beaconSettings[Number(i)] ?? {},
        ),
        overclock: this.parseRational(s[i++]),
        checked: this.parseBool(s[i++]),
      };

      if (hash) {
        obj.targetId = orString(
          this.parseNString(
            obj.targetId,
            isRecipeObjective(obj) ? hash.recipes : hash.items,
          ),
        );
      }

      this.deleteEmptyKeys(obj);
      ids.push(id);
      entities[id] = obj;
      index++;
    }
    return { ids, index, entities };
  }

  zipItems(data: ZipData, state: Items.ItemsState, hash: ModHash): void {
    const z = this.zipList(
      Object.keys(state).map((id) => {
        const obj = state[id];
        const excluded = this.zipTruthyBool(obj.excluded);
        const checked = this.zipTruthyBool(obj.checked);

        return {
          bare: this.zipFields([
            id,
            excluded,
            this.zipTruthyString(obj.beltId),
            this.zipTruthyString(obj.wagonId),
            checked,
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(id, hash.items),
            excluded,
            this.zipTruthyNString(obj.beltId, hash.belts),
            this.zipTruthyNString(obj.wagonId, hash.wagons),
            checked,
          ]),
        };
      }),
    );

    if (z.bare.length) {
      data.config.bare += `&${Section.Items}=${z.bare}`;
      data.config.hash += `&${Section.Items}${z.hash}`;
    }
  }

  unzipItems(params: Entities, hash?: ModHash): Items.ItemsState {
    const list = params[Section.Items].split(LISTSEP);
    const entities: Items.ItemsState = {};
    for (const item of list) {
      const s = item.split(FIELDSEP);
      let i = 0;
      const id = orString(this.parseString(s[i++], hash?.items));
      const obj: ItemSettings = {
        excluded: this.parseBool(s[i++]),
        beltId: this.parseString(s[i++], hash?.belts),
        wagonId: this.parseString(s[i++], hash?.wagons),
        checked: this.parseBool(s[i++]),
      };

      this.deleteEmptyKeys(obj);
      entities[id] = obj;
    }
    return entities;
  }

  zipRecipes(data: ZipData, state: Recipes.RecipesState, hash: ModHash): void {
    const z = this.zipList(
      Object.keys(state).map((i) => {
        const obj = state[i];
        const excluded = this.zipTruthyBool(obj.excluded);
        const modules = this.zipTruthyArray(data.recipeSettings.moduleMap[i]);
        const beacons = this.zipTruthyArray(data.recipeSettings.beaconMap[i]);
        const overclock = this.zipTruthyNumber(obj.overclock);
        const cost = this.zipTruthyNumber(obj.cost);
        const checked = this.zipTruthyBool(obj.checked);

        return {
          bare: this.zipFields([
            i,
            excluded,
            this.zipTruthyString(obj.machineId),
            modules,
            beacons,
            overclock,
            cost,
            checked,
            this.zipTruthyString(obj.fuelId),
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(i, hash.recipes),
            excluded,
            this.zipTruthyNString(obj.machineId, hash.machines),
            modules,
            beacons,
            overclock,
            cost,
            checked,
            this.zipTruthyNString(obj.fuelId, hash.fuels),
          ]),
        };
      }),
    );

    if (z.bare.length) {
      data.config.bare += `&${Section.Recipes}=${z.bare}`;
      data.config.hash += `&${Section.Recipes}${z.hash}`;
    }
  }

  unzipRecipes(
    params: Entities,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Recipes.RecipesState {
    const list = params[Section.Recipes].split(LISTSEP);
    const entities: Recipes.RecipesState = {};
    for (const recipe of list) {
      const s = recipe.split(FIELDSEP);
      let i = 0;
      const id = orString(this.parseString(s[i++], hash?.recipes));
      const obj: RecipeSettings = {
        excluded: this.parseBool(s[i++]),
        machineId: this.parseString(s[i++], hash?.machines),
        modules: this.parseArray(s[i++])?.map(
          (i) => moduleSettings[Number(i)] ?? {},
        ),
        beacons: this.parseArray(s[i++])?.map(
          (i) => beaconSettings[Number(i)] ?? {},
        ),
        overclock: this.parseRational(s[i++]),
        cost: this.parseRational(s[i++]),
        checked: this.parseBool(s[i++]),
        fuelId: this.parseString(s[i++], hash?.fuels),
      };

      this.deleteEmptyKeys(obj);
      entities[id] = obj;
    }
    return entities;
  }

  zipMachines(
    data: ZipData,
    state: Machines.MachinesState,
    hash: ModHash,
  ): void {
    const id = state.ids ? EMPTY : '';
    const beacons = this.zipTruthyArray(data.machineSettings.beaconMap[id]);
    const overclock = this.zipTruthyNumber(state.overclock);
    const list: Zip[] = [
      {
        bare: this.zipFields([
          id,
          this.zipTruthyArray(state.moduleRankIds),
          beacons,
          this.zipTruthyArray(state.fuelRankIds),
          overclock,
        ]),
        hash: this.zipFields([
          id,
          this.zipTruthyNArray(state.moduleRankIds, hash.modules),
          beacons,
          this.zipTruthyNArray(state.fuelRankIds, hash.fuels),
          overclock,
        ]),
      },
    ];

    const ids = state.ids ?? Object.keys(state.entities);
    ids.forEach((i) => {
      const obj = state.entities[i] ?? {};
      const modules = this.zipTruthyArray(data.machineSettings.moduleMap[i]);
      const beacons = this.zipTruthyArray(data.machineSettings.beaconMap[i]);
      const overclock = this.zipTruthyNumber(obj.overclock);
      list.push({
        bare: this.zipFields([
          i,
          modules,
          beacons,
          this.zipTruthyString(obj.fuelId),
          overclock,
        ]),
        hash: this.zipFields([
          this.zipTruthyNString(i, hash.machines),
          modules,
          beacons,
          this.zipTruthyNString(obj.fuelId, hash.fuels),
          overclock,
        ]),
      });
    });

    const z = this.zipList(list);
    if (z.bare.length) {
      data.config.bare += `&${Section.Machines}=${z.bare}`;
      data.config.hash += `&${Section.Machines}${z.hash}`;
    }
  }

  unzipMachines(
    params: Entities,
    moduleSettings: ModuleSettings[],
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Machines.MachinesState {
    const list = params[Section.Machines].split(LISTSEP);
    const state: Machines.MachinesState = { entities: {} };
    let ids: string[] | undefined;
    for (let z = 0; z < list.length; z++) {
      const machine = list[z];
      const s = machine.split(FIELDSEP);
      let i = 0;
      let id: string = s[i++];
      if (z === 0 && id === EMPTY) {
        ids = [];
        id = '';
      }

      if (id && hash) id = orString(this.parseNString(id, hash.machines));
      if (id && ids) ids.push(id);

      const moduleStr = s[i++];
      const beacons = this.parseArray(s[i++])?.map(
        (i) => beaconSettings[Number(i)] ?? {},
      );
      const fuelStr = s[i++];
      const overclock = this.parseRational(s[i++]);

      if (id) {
        const obj: MachineSettings = {
          modules: this.parseArray(moduleStr)?.map(
            (i) => moduleSettings[Number(i)] ?? {},
          ),
          beacons,
          fuelId: this.parseString(fuelStr, hash?.fuels),
          overclock,
        };
        this.deleteEmptyKeys(obj);
        if (Object.keys(obj).length) state.entities[id] = obj;
      } else {
        const moduleRankIds = this.parseArray(moduleStr, hash?.modules);
        const fuelRankIds = this.parseArray(fuelStr, hash?.fuels);
        if (ids != null) state.ids = ids;
        if (moduleRankIds != null) state.moduleRankIds = moduleRankIds;
        if (beacons != null) state.beacons = beacons;
        if (fuelRankIds != null) state.fuelRankIds = fuelRankIds;
        if (overclock != null) state.overclock = overclock;
      }
    }

    return state;
  }

  zipSettings(
    data: ZipData,
    state: Settings.SettingsState,
    hash: ModHash,
  ): void {
    const init = Settings.initialSettingsState;
    const displayRate = this.zipDiffDisplayRate(
      state.displayRate,
      init.displayRate,
    );
    const preset = this.zipDiffNumber(state.preset, init.preset);
    const inserterCapacity = this.zipDiffNumber(
      state.inserterCapacity,
      init.inserterCapacity,
    );
    const inserterTarget = this.zipDiffNumber(
      state.inserterTarget,
      init.inserterTarget,
    );
    const beaconReceivers = this.zipDiffNumber(
      state.beaconReceivers,
      init.beaconReceivers,
    );
    const netProductionOnly = this.zipDiffBool(
      state.netProductionOnly,
      init.netProductionOnly,
    );
    const z: Zip = {
      bare: this.zipFields([
        this.zipDiffString(state.modId, init.modId),
        this.zipDiffNullableArray(
          state.researchedTechnologyIds,
          init.researchedTechnologyIds,
        ),
        displayRate,
        preset,
        this.zipDiffString(state.beltId, init.beltId),
        this.zipDiffNumber(state.flowRate, init.flowRate),
        this.zipDiffNumber(state.miningBonus, init.miningBonus),
        this.zipDiffNumber(state.researchSpeed, init.researchSpeed),
        inserterCapacity,
        inserterTarget,
        this.zipDiffString(state.cargoWagonId, init.cargoWagonId),
        this.zipDiffString(state.fluidWagonId, init.fluidWagonId),
        this.zipDiffString(state.pipeId, init.pipeId),
        beaconReceivers,
        this.zipDiffString(state.proliferatorSprayId, init.proliferatorSprayId),
        netProductionOnly,
        this.zipDiffNumber(state.maximizeType, init.maximizeType),
      ]),
      hash: this.zipFields([
        this.zipDiffNullableNArray(
          state.researchedTechnologyIds,
          init.researchedTechnologyIds,
          hash.technologies,
        ),
        displayRate,
        preset,
        this.zipDiffNString(state.beltId, init.beltId, hash.belts),
        this.zipDiffNumber(state.flowRate, init.flowRate),
        this.zipDiffNumber(state.miningBonus, init.miningBonus),
        this.zipDiffNNumber(state.researchSpeed, init.researchSpeed),
        inserterCapacity,
        inserterTarget,
        this.zipDiffNString(state.cargoWagonId, init.cargoWagonId, hash.wagons),
        this.zipDiffNString(state.fluidWagonId, init.fluidWagonId, hash.wagons),
        this.zipDiffNString(state.pipeId, init.pipeId, hash.belts),
        beaconReceivers,
        this.zipDiffNString(
          state.proliferatorSprayId,
          init.proliferatorSprayId,
          hash.modules,
        ),
        netProductionOnly,
        this.zipDiffNumber(state.maximizeType, init.maximizeType),
      ]),
    };

    if (z.bare.length) {
      data.config.bare += `&${Section.Settings}=${encodeURIComponent(z.bare)}`;
      data.config.hash += `&${Section.Settings}${z.hash}`;
    }

    const costsFactor = this.zipDiffNumber(
      state.costs.factor,
      init.costs.factor,
    );
    const costsMachine = this.zipDiffNumber(
      state.costs.machine,
      init.costs.machine,
    );
    const costsUnproduceable = this.zipDiffNumber(
      state.costs.unproduceable,
      init.costs.unproduceable,
    );
    const costsExcluded = this.zipDiffNumber(
      state.costs.excluded,
      init.costs.excluded,
    );
    const costsSurplus = this.zipDiffNumber(
      state.costs.surplus,
      init.costs.surplus,
    );
    const costsMaximize = this.zipDiffNumber(
      state.costs.maximize,
      init.costs.maximize,
    );
    const surplusMachinesOutput = this.zipDiffBool(
      state.surplusMachinesOutput,
      init.surplusMachinesOutput,
    );
    const costsFootprint = this.zipDiffNumber(
      state.costs.footprint,
      init.costs.footprint,
    );
    const zip = this.zipFields([
      surplusMachinesOutput,
      costsFactor,
      costsMachine,
      costsUnproduceable,
      costsExcluded,
      costsSurplus,
      costsMaximize,
      costsFootprint,
    ]);
    const costsZ: Zip = {
      bare: zip,
      hash: zip,
    };

    if (costsZ.bare.length) {
      data.config.bare += `&${Section.Costs}=${encodeURIComponent(costsZ.bare)}`;
      data.config.hash += `&${Section.Costs}${costsZ.hash}`;
    }
  }

  unzipSettings(
    params: Entities,
    hash?: ModHash,
  ): Settings.PartialSettingsState {
    let zip = params[Section.Settings];
    let s = zip.split(FIELDSEP);
    let i = 0;
    const state: Settings.PartialSettingsState = {
      modId: hash == null ? this.parseString(s[i++]) : undefined,
      researchedTechnologyIds: this.parseNullableArray(
        s[i++],
        hash?.technologies,
      ),
      displayRate: this.parseDisplayRate(s[i++]),
      preset: this.parseNumber(s[i++]),
      beltId: this.parseString(s[i++], hash?.belts),
      flowRate: this.parseRational(s[i++]),
      miningBonus: this.parseRational(s[i++]),
      researchSpeed: this.parseNumber(s[i++]),
      inserterCapacity: this.parseNumber(s[i++]),
      inserterTarget: this.parseNumber(s[i++]),
      cargoWagonId: this.parseString(s[i++], hash?.wagons),
      fluidWagonId: this.parseString(s[i++], hash?.wagons),
      pipeId: this.parseString(s[i++], hash?.belts),
      beaconReceivers: this.parseRational(s[i++]),
      proliferatorSprayId: this.parseString(s[i++], hash?.modules),
      netProductionOnly: this.parseBool(s[i++]),
      maximizeType: this.parseNumber(s[i++]),
      surplusMachinesOutput: this.parseBool(s[i++]),
    };

    zip = params[Section.Costs];
    if (zip) {
      s = zip.split(FIELDSEP);
      i = 0;
      const costs: Partial<CostsState> = {
        factor: this.parseRational(s[i++]),
        machine: this.parseRational(s[i++]),
        unproduceable: this.parseRational(s[i++]),
        excluded: this.parseRational(s[i++]),
        surplus: this.parseRational(s[i++]),
        maximize: this.parseRational(s[i++]),
        footprint: this.parseRational(s[i++]),
      };
      this.deleteEmptyKeys(costs);
      if (Object.keys(costs).length) state.costs = costs;
    }

    this.deleteEmptyKeys(state);
    return state;
  }

  zipList(list: Zip[]): Zip {
    return {
      bare: encodeURIComponent(list.map((i) => i.bare).join(LISTSEP)),
      hash: list.map((i) => i.hash).join(LISTSEP),
    };
  }

  zipFields(fields: string[]): string {
    return fields.join(FIELDSEP).replace(/\**$/, '');
  }

  zipTruthyString(value: string | undefined): string {
    return value == null ? '' : value;
  }

  zipTruthyNumber(value: number | Rational | undefined): string {
    return value == null ? '' : value.toString();
  }

  zipTruthyBool(value: boolean | undefined): string {
    return value == null ? '' : value ? TRUE : FALSE;
  }

  zipTruthyArray(value: string[] | number[] | undefined): string {
    return value == null ? '' : value.length ? value.join(ARRAYSEP) : EMPTY;
  }

  zipTruthyNString(value: string | undefined, hash: string[]): string {
    return value == null ? '' : this.getId(hash.indexOf(value));
  }

  zipTruthyNArray(value: string[] | undefined, hash: string[]): string {
    return value == null
      ? ''
      : value.length
        ? value.map((v) => this.getId(hash.indexOf(v))).join(ARRAYSEP)
        : EMPTY;
  }

  zipDiffString(
    value: string | null | undefined,
    init: string | null | undefined,
  ): string {
    return value === init ? '' : value == null ? NULL : value;
  }

  zipDiffNumber(
    value: number | Rational | null | undefined,
    init: number | Rational | null | undefined,
  ): string {
    return value === init ? '' : value == null ? NULL : value.toString();
  }

  zipDiffDisplayRate(
    value: DisplayRate | undefined,
    init: DisplayRate | undefined,
  ): string {
    if (value === init) return '';

    switch (value) {
      case DisplayRate.PerSecond:
        return '0';
      case DisplayRate.PerMinute:
        return '1';
      case DisplayRate.PerHour:
        return '2';
      default:
        return NULL;
    }
  }

  zipDiffBool(value: boolean | undefined, init: boolean | undefined): string {
    return value === init ? '' : value == null ? NULL : value ? TRUE : FALSE;
  }

  zipDiffNullableArray(
    value: string[] | null | undefined,
    init: string[] | null | undefined,
  ): string {
    const zVal =
      value != null
        ? value.length > 0
          ? [...value].sort().join(ARRAYSEP)
          : EMPTY
        : NULL;
    const zInit =
      init != null
        ? init.length > 0
          ? [...init].sort().join(ARRAYSEP)
          : EMPTY
        : NULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffRank(value: string[] | undefined, init: string[] | undefined): string {
    const zVal = value ? (value.length ? value.join(ARRAYSEP) : EMPTY) : NULL;
    const zInit = init ? (init.length ? init.join(ARRAYSEP) : EMPTY) : NULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffNString(
    value: string | undefined,
    init: string | undefined,
    hash: string[],
  ): string {
    return value === init
      ? ''
      : value == null
        ? NULL
        : this.getId(hash.indexOf(value));
  }

  zipDiffNNumber(value: number | undefined, init: number | undefined): string {
    return value === init ? '' : value == null ? NULL : this.getId(value);
  }

  zipDiffNullableNArray(
    value: string[] | null | undefined,
    init: string[] | null | undefined,
    hash: string[],
  ): string {
    const zVal =
      value != null
        ? value.length > 0
          ? value
              .map((v) => this.getId(hash.indexOf(v)))
              .sort()
              .join(ARRAYSEP)
          : EMPTY
        : NULL;
    const zInit =
      init != null
        ? init.length > 0
          ? init
              .map((v) => this.getId(hash.indexOf(v)))
              .sort()
              .join(ARRAYSEP)
          : EMPTY
        : NULL;
    return zVal === zInit ? '' : zVal;
  }

  zipDiffNRank(
    value: string[] | undefined,
    init: string[] | undefined,
    hash: string[],
  ): string {
    const zVal = value
      ? value.length
        ? value.map((v) => this.getId(hash.indexOf(v))).join(ARRAYSEP)
        : EMPTY
      : NULL;
    const zInit = init
      ? init.length
        ? init.map((v) => this.getId(hash.indexOf(v))).join(ARRAYSEP)
        : EMPTY
      : NULL;
    return zVal === zInit ? '' : zVal;
  }

  parseString(value: string | undefined, hash?: string[]): string | undefined {
    if (hash != null) return this.parseNString(value, hash);
    if (!value?.length || value === NULL) return undefined;
    return value;
  }

  parseBool(value: string | undefined): boolean | undefined {
    if (!value?.length || value === NULL) return undefined;
    return value === TRUE;
  }

  parseNumber(value: string | undefined): number | undefined {
    if (!value?.length || value === NULL) return undefined;
    return Number(value);
  }

  parseDisplayRate(value: string | undefined): DisplayRate | undefined {
    if (!value?.length || value === NULL) return undefined;

    switch (value) {
      case '0':
        return DisplayRate.PerSecond;
      case '1':
        return DisplayRate.PerMinute;
      case '2':
        return DisplayRate.PerHour;
      default:
        return undefined;
    }
  }

  parseArray(value: string | undefined, hash?: string[]): string[] | undefined {
    if (hash != null) return this.parseNArray(value, hash);
    if (!value?.length || value === NULL) return undefined;
    return value === EMPTY ? [] : value.split(ARRAYSEP);
  }

  parseRational(value: string | undefined): Rational | undefined {
    return Rational.from(this.parseString(value));
  }

  parseNullableArray(
    value: string | undefined,
    hash?: string[],
  ): string[] | null | undefined {
    if (hash != null) return this.parseNullableNArray(value, hash);
    if (!value?.length) return undefined;
    if (value === NULL) return null;
    return value === EMPTY ? [] : value.split(ARRAYSEP);
  }

  parseNString(value: string | undefined, hash: string[]): string | undefined {
    const v = this.parseString(value);
    if (v == null) return v;
    return hash[this.getN(v)];
  }

  parseNNumber(value: string | undefined): number | undefined {
    if (!value?.length || value === NULL) return undefined;
    return this.getN(value);
  }

  parseNArray(value: string | undefined, hash: string[]): string[] | undefined {
    const v = this.parseArray(value);
    if (v == null) return v;
    return v.map((a) => hash[this.getN(a)]);
  }

  parseNullableNArray(
    value: string | undefined,
    hash: string[],
  ): string[] | null | undefined {
    const v = this.parseNullableArray(value);
    if (v == null) return v;
    return v.map((a) => hash[this.getN(a)]);
  }

  getId(n: number): string {
    if (n / MAX >= 1)
      return this.getId(Math.floor(n / MAX)) + this.getId(n % MAX);

    return BASE64ABC[n];
  }

  getN(id: string): number {
    const n = INVERT[id[0]];
    if (id.length > 1) {
      id = id.substring(1);
      return n * Math.pow(MAX, id.length) + this.getN(id);
    }

    return n;
  }

  getBase64Code(charCode: number): number {
    if (charCode >= this.base64codes.length) {
      throw new Error('Unable to parse base64 string.');
    }

    const code = this.base64codes[charCode];
    if (code === 255) {
      throw new Error('Unable to parse base64 string.');
    }

    return code;
  }

  bytesToBase64(bytes: Uint8Array): string {
    let result = '';
    let i: number;
    const l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += BASE64ABC[bytes[i - 2] >> 2];
      result += BASE64ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += BASE64ABC[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      result += BASE64ABC[bytes[i] & 0x3f];
    }

    if (i === l + 1) {
      // 1 octet yet to write
      result += BASE64ABC[bytes[i - 2] >> 2];
      result += BASE64ABC[(bytes[i - 2] & 0x03) << 4];
      result += '__';
    }

    if (i === l) {
      // 2 octets yet to write
      result += BASE64ABC[bytes[i - 2] >> 2];
      result += BASE64ABC[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += BASE64ABC[(bytes[i - 1] & 0x0f) << 2];
      result += '_';
    }
    return result;
  }

  inflateSafe(str: string): string {
    try {
      return this.inflate(str);
    } catch {
      console.warn(
        'Router failed to parse url, checking for missing trailing characters...',
      );
    }

    try {
      return this.inflateMend(str, '-');
    } catch {
      // ignore error
    }

    try {
      return this.inflateMend(str, '.');
    } catch {
      // ignore error
    }

    return this.inflateMend(str, '_');
  }

  inflateMend(str: string, char: string): string {
    const z = this.inflate(str + char);
    if (!z) throw new Error('Failed to parse, generated empty string');
    console.warn(`Router mended url by appending '${char}'`);
    return z;
  }

  inflate(str: string): string {
    return inflate(this.base64ToBytes(str), { to: 'string' });
  }

  base64ToBytes(str: string): Uint8Array {
    if (str.length % 4 !== 0) {
      throw new Error('Unable to parse base64 string.');
    }

    const index = str.indexOf('_');
    if (index !== -1 && index < str.length - 2) {
      throw new Error('Unable to parse base64 string.');
    }

    const missingOctets = str.endsWith('__') ? 2 : str.endsWith('_') ? 1 : 0;
    const n = str.length;
    const result = new Uint8Array(3 * (n / 4));
    let buffer: number;
    for (let i = 0, j = 0; i < n; i += 4, j += 3) {
      buffer =
        (this.getBase64Code(str.charCodeAt(i)) << 18) |
        (this.getBase64Code(str.charCodeAt(i + 1)) << 12) |
        (this.getBase64Code(str.charCodeAt(i + 2)) << 6) |
        this.getBase64Code(str.charCodeAt(i + 3));
      result[j] = buffer >> 16;
      result[j + 1] = (buffer >> 8) & 0xff;
      result[j + 2] = buffer & 0xff;
    }

    return result.subarray(0, result.length - missingOctets);
  }

  deleteEmptyKeys<T extends object>(obj: T): void {
    (Object.keys(obj) as (keyof T)[])
      .filter((k) => obj[k] === undefined)
      .forEach((k) => delete obj[k]);
  }
}
