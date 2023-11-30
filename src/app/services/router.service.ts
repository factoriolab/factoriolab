import { inject, Injectable } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { deflate, inflate } from 'pako';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  Observable,
  Subject,
} from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

import { data } from 'src/data';
import { filterNullish, orString } from '~/helpers';
import {
  BeaconSettings,
  DisplayRate,
  Entities,
  Game,
  IdValueDefaultPayload,
  isRecipeObjective,
  ItemSettings,
  MachineSettings,
  ModHash,
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
  Beacons = 'e',
  Settings = 's',
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

export interface ZipData {
  objectives: Zip;
  config: Zip;
  objectiveBeaconMap: Entities<number[]>;
  recipeBeaconMap: Entities<number[]>;
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
  zipConfig$ = new BehaviorSubject<Zip>(this.empty);
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
        // Setup object lists
        const o = objectives.ids.map((i) => objectives.entities[i]);

        // Beacons
        const zData = this.zipBeacons(o, recipesState, hash);

        // Item Objectives
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
        this.zipConfig$.next(zData.config);
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
          value: step.items.toString(),
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      ];
    } else if (step.recipeId != null && step.machines != null) {
      objectives = [
        {
          id: '0',
          targetId: step.recipeId,
          value: step.machines.toString(),
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
      ];
    }

    if (objectives == null) return null;

    const zData: ZipData = {
      objectives: this.empty,
      config: config,
      recipeBeaconMap: {},
      objectiveBeaconMap: {},
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
            const beaconSettings = this.unzipBeacons(params);
            if (params[Section.Objectives]) {
              state.objectivesState = this.unzipObjectives(
                params,
                beaconSettings,
              );
            }
            if (params[Section.Items]) {
              state.itemsState = this.unzipItems(params);
            }
            if (params[Section.Recipes]) {
              state.recipesState = this.unzipRecipes(params, beaconSettings);
            }
            if (params[Section.Machines]) {
              state.machinesState = this.unzipMachines(params);
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
                const beaconSettings = this.unzipBeacons(params, hash);
                if (params[Section.Objectives]) {
                  state.objectivesState = this.unzipObjectives(
                    params,
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
                    beaconSettings,
                    hash,
                  );
                }
                if (params[Section.Machines]) {
                  state.machinesState = this.unzipMachines(params, hash);
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

  zipBeacons(
    objectives: Objective[],
    recipes: Recipes.RecipesState,
    hash: ModHash,
  ): ZipData {
    const list: Zip[] = [];
    const beaconsIdMap: Entities<number> = {};
    const objectiveBeaconMap: Entities<number[]> = {};
    const recipeBeaconMap: Entities<number[]> = {};

    for (const objective of objectives) {
      if (objective.beacons != null) {
        objectiveBeaconMap[objective.id] = this.zipBeaconArray(
          objective.beacons,
          beaconsIdMap,
          list,
          hash,
        );
      }
    }

    for (const recipeId of Object.keys(recipes)) {
      const recipe = recipes[recipeId];
      if (recipe.beacons != null) {
        recipeBeaconMap[recipeId] = this.zipBeaconArray(
          recipe.beacons,
          beaconsIdMap,
          list,
          hash,
        );
      }
    }

    const z = this.zipList(list);
    const config: Zip = z.bare.length
      ? {
          bare: `&${Section.Beacons}=${z.bare}`,
          hash: `&${Section.Beacons}${z.hash}`,
        }
      : this.empty;

    return {
      objectives: this.empty,
      config,
      objectiveBeaconMap: objectiveBeaconMap,
      recipeBeaconMap,
    };
  }

  zipBeaconArray(
    beacons: BeaconSettings[],
    beaconsIdMap: Entities<number>,
    list: Zip[],
    hash: ModHash,
  ): number[] {
    return beacons.map((obj) => {
      const zip: Zip = {
        bare: this.zipFields([
          this.zipTruthyString(obj.count),
          this.zipTruthyArray(obj.moduleIds),
          this.zipTruthyString(obj.id),
          this.zipTruthyString(obj.total),
        ]),
        hash: this.zipFields([
          this.zipTruthyString(obj.count),
          this.zipTruthyNArray(obj.moduleIds, hash.modules),
          this.zipTruthyNString(obj.id, hash.beacons),
          this.zipTruthyString(obj.total),
        ]),
      };

      if (beaconsIdMap[zip.bare] == null) {
        beaconsIdMap[zip.bare] = list.length;
        list.push(zip);
      }

      return beaconsIdMap[zip.bare];
    });
  }

  unzipBeacons(params: Entities, hash?: ModHash): BeaconSettings[] {
    if (!params[Section.Beacons]) return [];

    const list = params[Section.Beacons].split(LISTSEP);

    return list.map((beacon) => {
      const s = beacon.split(FIELDSEP);
      let i = 0;
      let obj: BeaconSettings;

      if (hash) {
        obj = {
          count: this.parseString(s[i++]),
          moduleIds: this.parseNArray(s[i++], hash.modules),
          id: this.parseNString(s[i++], hash.beacons),
          total: this.parseString(s[i++]),
        };
      } else {
        obj = {
          count: this.parseString(s[i++]),
          moduleIds: this.parseArray(s[i++]),
          id: this.parseString(s[i++]),
          total: this.parseString(s[i++]),
        };
      }

      this.deleteEmptyKeys(obj);
      return obj;
    });
  }

  zipObjectives(data: ZipData, objectives: Objective[], hash: ModHash): void {
    const z = this.zipList(
      objectives.map((obj) => {
        const value = Rational.fromString(obj.value).toString();
        const unit = this.zipDiffNumber(obj.unit, ObjectiveUnit.Items);
        const type = this.zipDiffNumber(obj.type, ObjectiveType.Output);

        return {
          bare: this.zipFields([
            obj.targetId,
            value,
            unit,
            type,
            this.zipTruthyString(obj.machineId),
            this.zipTruthyArray(obj.machineModuleIds),
            this.zipTruthyArray(data.objectiveBeaconMap[obj.id]),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyBool(obj.checked),
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
            this.zipTruthyNArray(obj.machineModuleIds, hash.modules),
            this.zipTruthyArray(data.objectiveBeaconMap[obj.id]),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyBool(obj.checked),
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
      let obj: Objective;

      if (hash) {
        obj = {
          id,
          targetId: s[i++], // Convert to real id after determining unit
          value: s[i++],
          unit: Number(s[i++]) | ObjectiveUnit.Items,
          type: Number(s[i++]) | ObjectiveType.Output,
          machineId: this.parseNString(s[i++], hash.machines),
          machineModuleIds: this.parseNArray(s[i++], hash.modules),
          beacons: this.parseArray(s[i++])?.map(
            (i) => beaconSettings[Number(i)] ?? {},
          ),
          overclock: this.parseNumber(s[i++]),
          checked: this.parseBool(s[i++]),
        };

        obj.targetId = orString(
          this.parseNString(
            obj.targetId,
            isRecipeObjective(obj) ? hash.recipes : hash.items,
          ),
        );
      } else {
        obj = {
          id,
          targetId: s[i++],
          value: s[i++],
          unit: Number(s[i++]) | ObjectiveUnit.Items,
          type: Number(s[i++]) | ObjectiveType.Output,
          machineId: this.parseString(s[i++]),
          machineModuleIds: this.parseArray(s[i++]),
          beacons: this.parseArray(s[i++])?.map(
            (i) => beaconSettings[Number(i)] ?? {},
          ),
          overclock: this.parseNumber(s[i++]),
          checked: this.parseBool(s[i++]),
        };
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
      Object.keys(state).map((i) => {
        const obj = state[i];
        const g = this.zipTruthyBool(obj.excluded);

        return {
          bare: this.zipFields([
            i,
            g,
            this.zipTruthyString(obj.beltId),
            this.zipTruthyString(obj.wagonId),
            this.zipTruthyBool(obj.checked),
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(i, hash.items),
            g,
            this.zipTruthyNString(obj.beltId, hash.belts),
            this.zipTruthyNString(obj.wagonId, hash.wagons),
            this.zipTruthyBool(obj.checked),
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
      let id: string;
      let obj: ItemSettings;

      if (hash) {
        id = orString(this.parseNString(s[i++], hash.items));
        obj = {
          excluded: this.parseBool(s[i++]),
          beltId: this.parseNString(s[i++], hash.belts),
          wagonId: this.parseNString(s[i++], hash.wagons),
          checked: this.parseBool(s[i++]),
        };
      } else {
        id = s[i++];
        obj = {
          excluded: this.parseBool(s[i++]),
          beltId: this.parseString(s[i++]),
          wagonId: this.parseString(s[i++]),
          checked: this.parseBool(s[i++]),
        };
      }

      this.deleteEmptyKeys(obj);
      entities[id] = obj;
    }
    return entities;
  }

  zipRecipes(data: ZipData, state: Recipes.RecipesState, hash: ModHash): void {
    const z = this.zipList(
      Object.keys(state).map((i) => {
        const obj = state[i];

        return {
          bare: this.zipFields([
            i,
            this.zipTruthyBool(obj.excluded),
            this.zipTruthyString(obj.machineId),
            this.zipTruthyArray(obj.machineModuleIds),
            this.zipTruthyArray(data.recipeBeaconMap[i]),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyString(obj.cost),
            this.zipTruthyBool(obj.checked),
            this.zipTruthyString(obj.fuelId),
          ]),
          hash: this.zipFields([
            this.zipTruthyNString(i, hash.recipes),
            this.zipTruthyBool(obj.excluded),
            this.zipTruthyNString(obj.machineId, hash.machines),
            this.zipTruthyNArray(obj.machineModuleIds, hash.modules),
            this.zipTruthyArray(data.recipeBeaconMap[i]),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyString(obj.cost),
            this.zipTruthyBool(obj.checked),
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
    beaconSettings: BeaconSettings[],
    hash?: ModHash,
  ): Recipes.RecipesState {
    const list = params[Section.Recipes].split(LISTSEP);
    const entities: Recipes.RecipesState = {};
    for (const recipe of list) {
      const s = recipe.split(FIELDSEP);
      let i = 0;
      let id: string;
      let obj: RecipeSettings;

      if (hash) {
        id = orString(this.parseNString(s[i++], hash.recipes));
        obj = {
          excluded: this.parseBool(s[i++]),
          machineId: this.parseNString(s[i++], hash.machines),
          machineModuleIds: this.parseNArray(s[i++], hash.modules),
          beacons: this.parseArray(s[i++])?.map(
            (i) => beaconSettings[Number(i)] ?? {},
          ),
          overclock: this.parseNumber(s[i++]),
          cost: this.parseString(s[i++]),
          checked: this.parseBool(s[i++]),
          fuelId: this.parseNString(s[i++], hash.fuels),
        };
      } else {
        id = s[i++];
        obj = {
          excluded: this.parseBool(s[i++]),
          machineId: this.parseString(s[i++]),
          machineModuleIds: this.parseArray(s[i++]),
          beacons: this.parseArray(s[i++])?.map(
            (i) => beaconSettings[Number(i)] ?? {},
          ),
          overclock: this.parseNumber(s[i++]),
          cost: this.parseString(s[i++]),
          checked: this.parseBool(s[i++]),
          fuelId: this.parseString(s[i++]),
        };
      }

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
    const ids = state.ids ? ['', ...state.ids] : Object.keys(state.entities);
    const z = this.zipList(
      ids.map((i) => {
        const obj = state.entities[i] || {};
        let h = true;
        if (i === '') {
          i = state.ids == null ? '' : TRUE;
          h = false;
        }
        return {
          bare: this.zipFields([
            i,
            this.zipTruthyArray(obj.moduleRankIds),
            this.zipTruthyString(obj.beaconCount),
            this.zipTruthyArray(obj.beaconModuleRankIds),
            this.zipTruthyString(obj.beaconId),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyString(obj.fuelId),
          ]),
          hash: this.zipFields([
            h ? this.zipTruthyNString(i, hash.machines) : i,
            this.zipTruthyNArray(obj.moduleRankIds, hash.modules),
            this.zipTruthyString(obj.beaconCount),
            this.zipTruthyNArray(obj.beaconModuleRankIds, hash.modules),
            this.zipTruthyNString(obj.beaconId, hash.beacons),
            this.zipTruthyNumber(obj.overclock),
            this.zipTruthyNString(obj.fuelId, hash.fuels),
          ]),
        };
      }),
    );

    if (z.bare.length) {
      data.config.bare += `&${Section.Machines}=${z.bare}`;
      data.config.hash += `&${Section.Machines}${z.hash}`;
    }
  }

  unzipMachines(params: Entities, hash?: ModHash): Machines.MachinesState {
    const list = params[Section.Machines].split(LISTSEP);
    let ids: string[] | undefined;
    const entities: Entities<MachineSettings> = {};
    let loadIds = false;
    for (let z = 0; z < list.length; z++) {
      const machine = list[z];
      const s = machine.split(FIELDSEP);
      let i = 0;
      let id: string | undefined;
      let obj: Partial<MachineSettings>;

      if (hash) {
        id = s[i++];
        obj = {
          moduleRankIds: this.parseNArray(s[i++], hash.modules),
          beaconCount: this.parseString(s[i++]),
          beaconModuleRankIds: this.parseNArray(s[i++], hash.modules),
          beaconId: this.parseNString(s[i++], hash.beacons),
          overclock: this.parseNumber(s[i++]),
          fuelId: this.parseNString(s[i++], hash.fuels),
        };
        if (z === 0 && id === TRUE) {
          loadIds = true;
          ids = [];
          id = '';
        } else {
          if (id) {
            id = this.parseNString(id, hash.machines);
          }
          if (loadIds && ids != null) {
            ids.push(orString(id));
          }
        }
      } else {
        id = s[i++];
        obj = {
          moduleRankIds: this.parseArray(s[i++]),
          beaconCount: this.parseString(s[i++]),
          beaconModuleRankIds: this.parseArray(s[i++]),
          beaconId: this.parseString(s[i++]),
          overclock: this.parseNumber(s[i++]),
          fuelId: this.parseString(s[i++]),
        };
        if (z === 0 && id === TRUE) {
          loadIds = true;
          ids = [];
          id = '';
        } else if (loadIds && ids != null) {
          ids.push(id);
        }
      }

      this.deleteEmptyKeys(obj);
      if (Object.keys(obj).length) {
        entities[orString(id)] = obj;
      }
    }
    return { ids, entities };
  }

  zipSettings(
    data: ZipData,
    state: Settings.SettingsState,
    hash: ModHash,
  ): void {
    const init = Settings.initialSettingsState;
    const z: Zip = {
      bare: this.zipFields([
        this.zipDiffString(state.modId, init.modId),
        this.zipDiffNullableArray(
          state.researchedTechnologyIds,
          init.researchedTechnologyIds,
        ),
        this.zipDiffDisplayRate(state.displayRate, init.displayRate),
        this.zipDiffNumber(state.preset, init.preset),
        this.zipDiffString(state.beltId, init.beltId),
        this.zipDiffRank(state.fuelRankIds, init.fuelRankIds),
        this.zipDiffNumber(state.flowRate, init.flowRate),
        this.zipDiffNumber(state.miningBonus, init.miningBonus),
        this.zipDiffNumber(state.researchSpeed, init.researchSpeed),
        this.zipDiffNumber(state.inserterCapacity, init.inserterCapacity),
        this.zipDiffNumber(state.inserterTarget, init.inserterTarget),
        this.zipDiffString(state.cargoWagonId, init.cargoWagonId),
        this.zipDiffString(state.fluidWagonId, init.fluidWagonId),
        this.zipDiffString(state.pipeId, init.pipeId),
        this.zipDiffString(state.beaconReceivers, init.beaconReceivers),
        this.zipDiffString(state.proliferatorSprayId, init.proliferatorSprayId),
        this.zipDiffBool(state.netProductionOnly, init.netProductionOnly),
        this.zipDiffNumber(state.maximizeType, init.maximizeType),
        this.zipDiffString(state.costs.factor, init.costs.factor),
        this.zipDiffString(state.costs.machine, init.costs.machine),
        this.zipDiffString(state.costs.unproduceable, init.costs.unproduceable),
        this.zipDiffString(state.costs.excluded, init.costs.excluded),
        this.zipDiffString(state.costs.surplus, init.costs.surplus),
        this.zipDiffString(state.costs.maximize, init.costs.maximize),
        this.zipDiffBool(
          state.surplusMachinesOutput,
          init.surplusMachinesOutput,
        ),
        this.zipDiffString(state.costs.footprint, init.costs.footprint),
      ]),
      hash: this.zipFields([
        this.zipDiffNullableNArray(
          state.researchedTechnologyIds,
          init.researchedTechnologyIds,
          hash.technologies,
        ),
        this.zipDiffDisplayRate(state.displayRate, init.displayRate),
        this.zipDiffNumber(state.preset, init.preset),
        this.zipDiffNString(state.beltId, init.beltId, hash.belts),
        this.zipDiffNRank(state.fuelRankIds, init.fuelRankIds, hash.fuels),
        this.zipDiffNNumber(state.flowRate, init.flowRate),
        this.zipDiffNNumber(state.miningBonus, init.miningBonus),
        this.zipDiffNNumber(state.researchSpeed, init.researchSpeed),
        this.zipDiffNumber(state.inserterCapacity, init.inserterCapacity),
        this.zipDiffNumber(state.inserterTarget, init.inserterTarget),
        this.zipDiffNString(state.cargoWagonId, init.cargoWagonId, hash.wagons),
        this.zipDiffNString(state.fluidWagonId, init.fluidWagonId, hash.wagons),
        this.zipDiffNString(state.pipeId, init.pipeId, hash.belts),
        this.zipDiffString(state.beaconReceivers, init.beaconReceivers),
        this.zipDiffNString(
          state.proliferatorSprayId,
          init.proliferatorSprayId,
          hash.modules,
        ),
        this.zipDiffBool(state.netProductionOnly, init.netProductionOnly),
        this.zipDiffNNumber(state.maximizeType, init.maximizeType),
        this.zipDiffString(state.costs.factor, init.costs.factor),
        this.zipDiffString(state.costs.machine, init.costs.machine),
        this.zipDiffString(state.costs.unproduceable, init.costs.unproduceable),
        this.zipDiffString(state.costs.excluded, init.costs.excluded),
        this.zipDiffString(state.costs.surplus, init.costs.surplus),
        this.zipDiffString(state.costs.maximize, init.costs.maximize),
        this.zipDiffBool(
          state.surplusMachinesOutput,
          init.surplusMachinesOutput,
        ),
        this.zipDiffString(state.costs.footprint, init.costs.footprint),
      ]),
    };

    if (z.bare.length) {
      data.config.bare += `&${Section.Settings}=${encodeURIComponent(z.bare)}`;
      data.config.hash += `&${Section.Settings}${z.hash}`;
    }
  }

  unzipSettings(
    params: Entities,
    hash?: ModHash,
  ): Settings.PartialSettingsState {
    const zip = params[Section.Settings];
    const s = zip.split(FIELDSEP);
    let i = 0;
    let obj: Settings.PartialSettingsState;

    if (hash) {
      obj = {
        researchedTechnologyIds: this.parseNullableNArray(
          s[i++],
          hash.technologies,
        ),
        displayRate: this.parseDisplayRate(s[i++]),
        preset: this.parseNumber(s[i++]),
        beltId: this.parseNString(s[i++], hash.belts),
        fuelRankIds: this.parseNArray(s[i++], hash.fuels),
        flowRate: this.parseNNumber(s[i++]),
        miningBonus: this.parseNNumber(s[i++]),
        researchSpeed: this.parseNNumber(s[i++]),
        inserterCapacity: this.parseNumber(s[i++]),
        inserterTarget: this.parseNumber(s[i++]),
        cargoWagonId: this.parseNString(s[i++], hash.wagons),
        fluidWagonId: this.parseNString(s[i++], hash.wagons),
        pipeId: this.parseNString(s[i++], hash.belts),
        beaconReceivers: this.parseString(s[i++]),
        proliferatorSprayId: this.parseNString(s[i++], hash.modules),
        netProductionOnly: this.parseBool(s[i++]),
        maximizeType: this.parseNNumber(s[i++]),
        costs: {
          factor: this.parseString(s[i++]),
          machine: this.parseString(s[i++]),
          unproduceable: this.parseString(s[i++]),
          excluded: this.parseString(s[i++]),
          surplus: this.parseString(s[i++]),
          maximize: this.parseString(s[i++]),
        },
        surplusMachinesOutput: this.parseBool(s[i++]),
      };
      obj.costs!.footprint = this.parseString(s[i++]);
    } else {
      obj = {
        modId: this.parseString(s[i++]),
        researchedTechnologyIds: this.parseNullableArray(s[i++]),
        displayRate: this.parseDisplayRate(s[i++]),
        preset: this.parseNumber(s[i++]),
        beltId: this.parseString(s[i++]),
        fuelRankIds: this.parseArray(s[i++]),
        flowRate: this.parseNumber(s[i++]),
        miningBonus: this.parseNumber(s[i++]),
        researchSpeed: this.parseNumber(s[i++]),
        inserterCapacity: this.parseNumber(s[i++]),
        inserterTarget: this.parseNumber(s[i++]),
        cargoWagonId: this.parseString(s[i++]),
        fluidWagonId: this.parseString(s[i++]),
        pipeId: this.parseString(s[i++]),
        beaconReceivers: this.parseString(s[i++]),
        proliferatorSprayId: this.parseString(s[i++]),
        netProductionOnly: this.parseBool(s[i++]),
        maximizeType: this.parseNumber(s[i++]),
        costs: {
          factor: this.parseString(s[i++]),
          machine: this.parseString(s[i++]),
          unproduceable: this.parseString(s[i++]),
          excluded: this.parseString(s[i++]),
          surplus: this.parseString(s[i++]),
          maximize: this.parseString(s[i++]),
        },
        surplusMachinesOutput: this.parseBool(s[i++]),
      };
      obj.costs!.footprint = this.parseString(s[i++]);
    }

    this.deleteEmptyKeys(obj);
    if (obj.costs) this.deleteEmptyKeys(obj.costs);

    return obj;
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

  zipTruthyNumber(value: number | undefined): string {
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

  zipDiffNumber(value: number | undefined, init: number | undefined): string {
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

  parseString(value: string | undefined): string | undefined {
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

  parseArray(value: string | undefined): string[] | undefined {
    if (!value?.length || value === NULL) return undefined;
    return value === EMPTY ? [] : value.split(ARRAYSEP);
  }

  parseNullableArray(value: string | undefined): string[] | null | undefined {
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
