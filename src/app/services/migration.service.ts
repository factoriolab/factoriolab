import { inject, Injectable } from '@angular/core';
import { first } from 'rxjs';
import { data } from 'src/data';

import { asString, coalesce, prune, spread, toEntities } from '~/helpers';
import {
  DEFAULT_MOD,
  ZARRAYSEP,
  ZEMPTY,
  ZFIELDSEP,
  ZTRUE,
} from '~/models/constants';
import { ModData } from '~/models/data/mod-data';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ZipVersion } from '~/models/enum/zip-version';
import { LabParams, Params } from '~/models/lab-params';
import { Optional } from '~/models/utils';

import { AnalyticsService } from './analytics.service';
import { CompressionService } from './compression.service';
import { ContentService } from './content.service';
import { TranslateService } from './translate.service';
import { ZipService } from './zip.service';

export const V10LISTSEP = '_'; // V11: Deprecated
export const V10NULL = '?'; // V11: Deprecated
export const V10EMPTY = '='; // V11: _

export enum ZipSectionV10 {
  Version = 'v',
  Mod = 'b',
  Objectives = 'p',
  /** DEPRECATED IN V8 */
  RecipeObjectives = 'q',
  Items = 'i',
  Recipes = 'r',
  Machines = 'f',
  Modules = 'm',
  Beacons = 'e',
  Settings = 's',
  Zip = 'z',
}

interface MigrationState {
  modId?: string;
  params: Params;
  warnings: string[];
  isBare: boolean;
}

export interface MigrationResult {
  modId?: string;
  params: LabParams;
  isBare: boolean;
}

enum MigrationWarning {
  ExpensiveDeprecation = 'The expensive setting has been removed. Please use or request an expensive data set instead.',
  LimitStepDeprecation = 'Limit steps have been replaced by limit objectives. Results may differ if using multiple objectives as limits apply to all objectives.',
}

@Injectable({
  providedIn: 'root',
})
export class MigrationService {
  analyticsSvc = inject(AnalyticsService);
  compressionSvc = inject(CompressionService);
  contentSvc = inject(ContentService);
  translateSvc = inject(TranslateService);
  zipSvc = inject(ZipService);

  /** Migrates older zip params to latest bare/hash formats */
  migrate(modId: string | undefined, params: Params): MigrationResult {
    if (Object.keys(params).length === 0)
      return {
        modId: modId ?? DEFAULT_MOD,
        params: {},
        isBare: true,
      };

    params = spread(params);
    const v = coalesce(params['v'] as ZipVersion, ZipVersion.Version0);
    this.analyticsSvc.event('unzip_version', v);

    const isBare = params['z'] == null;
    if (isBare || v === ZipVersion.Version0) {
      Object.keys(params).forEach((k) => {
        if (Array.isArray(params[k])) {
          params[k] = params[k].map((v) => decodeURIComponent(v));
        } else if (params[k]) {
          params[k] = decodeURIComponent(params[k]);
        }
      });
    }

    const result = this.migrateAny(modId, params, isBare, v);
    this.displayWarnings(result.warnings);

    const coerceArrayKeys = ['o', 'i', 'r', 'm', 'e', 'b'] as const;
    coerceArrayKeys.forEach((k) => {
      const value = result.params[k];
      if (typeof value === 'string') result.params[k] = [value];
    });

    return {
      modId: result.modId,
      params: result.params as LabParams,
      isBare: result.isBare,
    };
  }

  migrateAny(
    modId: string | undefined,
    params: Params,
    isBare: boolean,
    v: ZipVersion,
  ): MigrationState {
    const warnings: string[] = [];
    const state: MigrationState = { modId, params, warnings, isBare };
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
      case ZipVersion.Version9:
        return this.migrateV9(state);
      case ZipVersion.Version10:
        return this.migrateV10(state);
      default:
        return state;
    }
  }

  /** Migrates V0 bare zip to latest bare format */
  migrateV0(state: MigrationState): MigrationState {
    const { params } = state;
    if (params[ZipSectionV10.Settings]) {
      // Reorganize settings
      const zip = asString(params[ZipSectionV10.Settings]);
      const s = zip.split(ZFIELDSEP);
      // Convert modId to V1
      let modId = this.zipSvc.parseString(s[0]);
      modId = modId && data.modHash[data.modHashV0.indexOf(modId)];
      modId = modId ?? '';
      // Convert displayRate to V1
      const displayRateV0 = this.zipSvc.parseNumber(s[6]) ?? 60;
      const displayRateV1 =
        displayRateV0 === 1 ? '0' : displayRateV0 === 3600 ? '2' : '1';

      params[ZipSectionV10.Settings] = this.zipSvc.zipFields([
        modId,
        displayRateV1,
        asString(params[ZipSectionV10.Mod]), // Legacy preset
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
    } else if (params[ZipSectionV10.Mod]) {
      params[ZipSectionV10.Settings] = this.zipSvc.zipFields([
        V10NULL,
        V10NULL,
        asString(params[ZipSectionV10.Mod]), // Legacy preset
      ]);
    }

    delete params[ZipSectionV10.Mod];
    params[ZipSectionV10.Version] = ZipVersion.Version1;
    return this.migrateV1(state);
  }

  /** Migrates V1 bare zip to latest bare format */
  migrateV1(state: MigrationState): MigrationState {
    const { params, warnings } = state;
    if (params[ZipSectionV10.Settings]) {
      const zip = asString(params[ZipSectionV10.Settings]);
      const s = zip.split(ZFIELDSEP);
      const index = 11; // Index of expensive field
      if (s.length > index) {
        // Remove expensive field
        const val = s.splice(index, 1);
        const expensive = this.zipSvc.parseBool(val[0]);
        if (expensive) {
          warnings.push(MigrationWarning.ExpensiveDeprecation);
        }
      }

      params[ZipSectionV10.Settings] = this.zipSvc.zipFields(s);
    }

    params[ZipSectionV10.Version] = ZipVersion.Version4;
    return this.migrateV4(state);
  }

  /** Migrates V2 hash zip to latest hash format */
  migrateV2(state: MigrationState): MigrationState {
    const { params } = state;
    if (params[ZipSectionV10.Recipes]) {
      // Convert recipe settings
      const zip = asString(params[ZipSectionV10.Recipes]);
      const list = zip.split(V10LISTSEP);
      const migrated = [];
      const index = 3; // Index of beaconCount field
      for (const recipe of list) {
        const s = recipe.split(ZFIELDSEP);
        if (s.length > index) {
          // Convert beaconCount from number to string format
          const numString = this.parseNNumber(s[index])?.toString();
          s[index] = this.zipSvc.zipString(numString);
        }

        migrated.push(this.zipSvc.zipFields(s));
      }

      params[ZipSectionV10.Recipes] = migrated.join(V10LISTSEP);
    }

    if (params[ZipSectionV10.Machines]) {
      // Convert machine settings
      const zip = asString(params[ZipSectionV10.Machines]);
      const list = zip.split(V10LISTSEP);
      const migrated: string[] = [];
      const index = 2; // Index of beaconCount field
      for (const machine of list) {
        const s = machine.split(ZFIELDSEP);
        if (s.length > index) {
          // Convert beaconCount from number to string format
          const asString = this.parseNNumber(s[index])?.toString();
          s[index] = this.zipSvc.zipString(asString);
        }

        migrated.push(this.zipSvc.zipFields(s));
      }

      params[ZipSectionV10.Machines] = migrated.join(V10LISTSEP);
    }

    params[ZipSectionV10.Version] = ZipVersion.Version3;
    return this.migrateV3(state);
  }

  /** Migrates V3 hash zip to latest hash format */
  migrateV3(state: MigrationState): MigrationState {
    const { params, warnings } = state;
    if (params[ZipSectionV10.Settings]) {
      const zip = asString(params[ZipSectionV10.Settings]);
      const s = zip.split(ZFIELDSEP);
      const index = 10; // Index of expensive field
      if (s.length > index) {
        // Remove expensive field
        const val = s.splice(index, 1);
        const expensive = this.zipSvc.parseBool(val[0]);
        if (expensive) {
          warnings.push(MigrationWarning.ExpensiveDeprecation);
        }
      }

      params[ZipSectionV10.Settings] = this.zipSvc.zipFields(s);
    }

    params[ZipSectionV10.Version] = ZipVersion.Version5;
    return this.migrateV5(state);
  }

  private migrateInlineBeaconsSection(
    params: Params,
    section: ZipSectionV10,
    countIndex: number,
    beacons: string[],
  ): void {
    if (params[section]) {
      const zip = asString(params[section]);
      const list = zip.split(V10LISTSEP);
      const migrated: string[] = [];

      for (const s of list.map((z) => z.split(ZFIELDSEP))) {
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
          s[countIndex] = this.zipSvc.zipArray([beacons.length]);

          // Add beacon settings
          beacons.push(
            this.zipSvc.zipFields([
              count,
              this.zipSvc.zipString(moduleIds),
              this.zipSvc.zipString(id),
              this.zipSvc.zipString(total),
            ]),
          );
        }

        migrated.push(this.zipSvc.zipFields(s));
      }

      params[section] = migrated.join(V10LISTSEP);
    }
  }

  private migrateInlineBeacons(state: MigrationState): MigrationState {
    const list: string[] = [];

    this.migrateInlineBeaconsSection(
      state.params,
      ZipSectionV10.RecipeObjectives,
      4,
      list,
    );
    this.migrateInlineBeaconsSection(
      state.params,
      ZipSectionV10.Recipes,
      3,
      list,
    );

    if (list.length) {
      // Add beacon settings
      state.params[ZipSectionV10.Beacons] = list.join(V10LISTSEP);
    }

    return state;
  }

  /** Migrates V4 bare zip to latest bare format */
  migrateV4(state: MigrationState): MigrationState {
    state = this.migrateInlineBeacons(state);
    state.params[ZipSectionV10.Version] = ZipVersion.Version6;
    return this.migrateV6(state);
  }

  /** Migrates V5 hash zip to latest hash format */
  migrateV5(state: MigrationState): MigrationState {
    state = this.migrateInlineBeacons(state);
    state.params[ZipSectionV10.Version] = ZipVersion.Version7;
    return this.migrateV7(state);
  }

  private migrateInsertField(
    params: Params,
    section: ZipSectionV10,
    index: number,
  ): void {
    if (params[section]) {
      const list = asString(params[section]).split(V10LISTSEP);
      for (let i = 0; i < list.length; i++) {
        const o = list[i].split(ZFIELDSEP);
        if (o.length > index) {
          o.splice(index, 0, '');
          list[i] = this.zipSvc.zipFields(o);
        }
      }

      params[section] = list.join(V10LISTSEP);
    }
  }

  private migrateDeleteField(
    params: Params,
    section: ZipSectionV10,
    index: number,
  ): void {
    if (params[section]) {
      const list = asString(params[section]).split(V10LISTSEP);
      for (let i = 0; i < list.length; i++) {
        const o = list[i].split(ZFIELDSEP);
        if (o.length > index) {
          o.splice(index, 1);
          list[i] = this.zipSvc.zipFields(o);
        }
      }

      params[section] = list.join(V10LISTSEP);
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
    this.migrateInsertField(params, ZipSectionV10.RecipeObjectives, 2);

    /**
     * ItemObjectives: Convert via / limit step, convert machines rate type to
     * recipe objectives
     */
    if (params[ZipSectionV10.Objectives]) {
      const list = asString(params[ZipSectionV10.Objectives]).split(V10LISTSEP);
      const migrated = [...list];
      for (let i = 0; i < list.length; i++) {
        const obj = list[i];
        const o = obj.split(ZFIELDSEP);

        if (o[2] === '3') {
          if (isBare) {
            // Convert old RateType.Machines to recipe objectives
            const recipes = params[ZipSectionV10.RecipeObjectives]
              ? asString(params[ZipSectionV10.RecipeObjectives]).split(
                  V10LISTSEP,
                )
              : [];
            if (o.length > 3) {
              // Also switch into limit / maximize objectives
              const limit = [o[3], o[1], ObjectiveType.Limit.toString()];
              const maximize = [o[0], '1', ObjectiveType.Maximize.toString()];
              recipes.push(this.zipSvc.zipFields(maximize));
              recipes.push(this.zipSvc.zipFields(limit));
              needsLimitDeprecationWarning = true;
            } else {
              recipes.push(this.zipSvc.zipFields([o[0], o[1]]));
            }

            migrated.splice(i, 1);
            params[ZipSectionV10.RecipeObjectives] = recipes.join(V10LISTSEP);
          } else {
            /**
             * Convert hashed RateType.Machines to simple item objective by a
             * number of items, since we can't recover the recipe id directly
             * from the hashed item id. I.E. prefer losing the objective unit
             * over losing the whole objective.
             */
            o[2] = '0';
            migrated[i] = this.zipSvc.zipFields(o);
          }
        } else {
          if (o.length > 3) {
            // Set up limit with via id & objective rate / rate type
            const limit = [o[3], o[1], o[2], ObjectiveType.Limit.toString()];
            // Convert original objective to maximize objective with weight of 1
            const maximize = [o[0], '1', '', ObjectiveType.Maximize.toString()];
            migrated[i] = this.zipSvc.zipFields(maximize);
            migrated.push(this.zipSvc.zipFields(limit));
            needsLimitDeprecationWarning = true;
          }
        }
      }

      if (needsLimitDeprecationWarning) {
        state.warnings.push(MigrationWarning.LimitStepDeprecation);
      }

      params[ZipSectionV10.Objectives] = migrated.join(V10LISTSEP);
    }

    // Items: Remove recipeId
    this.migrateDeleteField(params, ZipSectionV10.Items, 4);

    // Recipes: Insert excluded field
    this.migrateInsertField(params, ZipSectionV10.Recipes, 1);

    /**
     * Settings: Insert researchedTechnologyIds and maximizeType, move
     * disabledRecipeIds into Recipes, move costs
     */
    if (params[ZipSectionV10.Settings]) {
      const s = asString(params[ZipSectionV10.Settings]).split(ZFIELDSEP);
      const x = isBare ? 1 : 0;

      // Convert disabled recipe ids
      if (s.length > 2 + x) {
        const disabledRecipeIds = this.zipSvc.parseArray(
          s[2 + x].replaceAll(V10EMPTY, ZEMPTY),
        );
        if (disabledRecipeIds) {
          const recipes = asString(params[ZipSectionV10.Recipes]);
          const list = recipes ? recipes.split(V10LISTSEP) : [];
          for (const id of disabledRecipeIds) {
            let found = false;
            for (let i = 0; i < list.length; i++) {
              const r = list[i].split(ZFIELDSEP);
              if (r[0] === id) {
                found = true;
                r[1] = ZTRUE;
                list[i] = this.zipSvc.zipFields(r);
              }
            }

            if (!found) {
              list.push(this.zipSvc.zipFields([id, ZTRUE]));
            }
          }

          params[ZipSectionV10.Recipes] = list.join(V10LISTSEP);
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

      params[ZipSectionV10.Settings] = this.zipSvc.zipFields(s);
    }

    params[ZipSectionV10.Version] = ZipVersion.Version8;
    return state;
  }

  /** Migrates V6 bare zip to latest format */
  migrateV6(state: MigrationState): MigrationState {
    state.isBare = true;
    return this.migrateV8(this.migrateToV8(state));
  }

  /** Migrates V7 hash zip to latest format */
  migrateV7(state: MigrationState): MigrationState {
    state.isBare = false;
    return this.migrateV8(this.migrateToV8(state));
  }

  migrateV8(state: MigrationState): MigrationState {
    const { params } = state;

    // Need to convert Recipe Objectives to unified Objectives
    if (params[ZipSectionV10.RecipeObjectives]) {
      let objectives: string[] = [];
      if (params[ZipSectionV10.Objectives])
        objectives = asString(params[ZipSectionV10.Objectives]).split(
          V10LISTSEP,
        );

      const list = asString(params[ZipSectionV10.RecipeObjectives]).split(
        V10LISTSEP,
      );
      for (const s of list) {
        const o = s.split(ZFIELDSEP);
        const n = this.zipSvc.zipFields([
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

      params[ZipSectionV10.RecipeObjectives] = '';
      params[ZipSectionV10.Objectives] = objectives.join(V10LISTSEP);
    }

    return this.migrateV9(state);
  }

  private migrateInlineModulesSection(
    params: Params,
    section: ZipSectionV10,
    index: number,
    modules: string[],
  ): void {
    if (params[section]) {
      const zip = asString(params[section]);
      const list = zip.split(V10LISTSEP);
      const migrated: string[] = [];

      for (const s of list.map((z) => z.split(ZFIELDSEP))) {
        if (s.length > index) {
          const moduleIdsStr = s[index];
          const moduleIds = this.zipSvc.parseArray(moduleIdsStr);
          if (moduleIds == null) continue;
          const moduleMap = new Map<string, number>();

          for (const moduleId of moduleIds) {
            const value = moduleMap.get(moduleId) ?? 0;
            moduleMap.set(moduleId, value + 1);
          }

          const moduleIndices = Array.from(moduleMap.keys()).map(
            (_, i) => modules.length + i,
          );

          // Replace moduleIds field with modules field
          s[index] = this.zipSvc.zipArray(moduleIndices);

          // Add module settings
          for (const key of moduleMap.keys()) {
            modules.push(
              this.zipSvc.zipFields([
                coalesce(moduleMap.get(key)?.toString(), ''),
                key,
              ]),
            );
          }
        }

        migrated.push(this.zipSvc.zipFields(s));
      }

      params[section] = migrated.join(V10LISTSEP);
    }
  }

  migrateV9(state: MigrationState): MigrationState {
    const { params } = state;

    const modules: string[] = [];
    this.migrateInlineModulesSection(
      state.params,
      ZipSectionV10.Beacons,
      1,
      modules,
    );
    this.migrateInlineModulesSection(
      state.params,
      ZipSectionV10.Recipes,
      3,
      modules,
    );
    this.migrateInlineModulesSection(
      state.params,
      ZipSectionV10.Objectives,
      5,
      modules,
    );

    // Migrate machines state
    if (state.params[ZipSectionV10.Machines]) {
      const zip = asString(params[ZipSectionV10.Machines]);
      const list = zip.split(V10LISTSEP);
      const migrated: string[] = [];
      const beacons = state.params[ZipSectionV10.Beacons]
        ? asString(state.params[ZipSectionV10.Beacons]).split(V10LISTSEP)
        : [];

      const countIndex = 2;
      const moduleIdsIndex = countIndex + 1;
      const idIndex = moduleIdsIndex + 1;
      list
        .map((z) => z.split(ZFIELDSEP))
        .forEach((s, i) => {
          if (i === 0 && s[0] === ZTRUE) s[0] = V10EMPTY;

          // Move overclock after fuelId/fuelRankIds
          this.migrateMoveUpField(s, 5, 6);

          if (s[0] !== V10EMPTY && s[0] !== '') {
            if (s.length > 1) {
              // Convert module rank to modules
              const moduleIdsStr = s[1];
              if (moduleIdsStr) {
                const moduleId = moduleIdsStr.split(ZARRAYSEP)[0];
                s[1] = this.zipSvc.zipArray([modules.length]);
                modules.push(this.zipSvc.zipFields(['', moduleId]));
              }
            }
          }

          // Convert beacon properties to beacons
          if (s.length > 2) {
            let id: string | undefined;
            let moduleIndices: number[] | undefined;

            // Move backwards from the last index, removing found properties
            if (s.length > idIndex) {
              // Remove beaconId field
              id = s.splice(idIndex, 1)[0];
            }

            if (s.length > moduleIdsIndex) {
              // Remove modules field
              const moduleIdsStr = s.splice(moduleIdsIndex, 1)[0];
              if (moduleIdsStr) {
                const moduleId = moduleIdsStr.split(ZARRAYSEP)[0];
                moduleIndices = [modules.length];
                modules.push(this.zipSvc.zipFields(['', moduleId]));
              }
            }

            // Get beaconCount field
            const count = s[countIndex];

            // Replace beaconCount field with beacons field
            s[countIndex] = this.zipSvc.zipArray([beacons.length]);

            // Add beacon settings
            beacons.push(
              this.zipSvc.zipFields([
                count,
                this.zipSvc.zipArray(moduleIndices),
                this.zipSvc.zipString(id),
              ]),
            );
          }

          migrated.push(this.zipSvc.zipFields(s));
        });

      if (beacons.length)
        state.params[ZipSectionV10.Beacons] = beacons.join(V10LISTSEP);

      state.params[ZipSectionV10.Machines] = migrated.join(V10LISTSEP);
    }

    if (modules.length)
      state.params[ZipSectionV10.Modules] = modules.join(V10LISTSEP);

    // Move fuelRankIds to Machines state
    if (params[ZipSectionV10.Settings]) {
      const s = asString(params[ZipSectionV10.Settings]).split(ZFIELDSEP);
      const index = state.isBare ? 5 : 4;
      if (s.length > index) {
        const fuelRankIds = s.splice(index, 1)[0];

        if (params[ZipSectionV10.Machines]) {
          const list = asString(params[ZipSectionV10.Machines])
            .split(V10LISTSEP)
            .map((l) => l.split(ZFIELDSEP));
          const s = list.find((l) => l[0] === V10EMPTY || l[0] === '');
          if (s) {
            while (s.length < 4) s.push('');
            s[3] = fuelRankIds;
          } else {
            list.unshift(['', '', '', fuelRankIds]);
          }

          params[ZipSectionV10.Machines] = list
            .map((l) => this.zipSvc.zipFields(l))
            .join(V10LISTSEP);
        } else {
          params[ZipSectionV10.Machines] = ['', '', '', fuelRankIds].join(
            ZFIELDSEP,
          );
        }

        params[ZipSectionV10.Settings] = s.join(ZFIELDSEP);
      }
    }

    params[ZipSectionV10.Version] = ZipVersion.Version10;
    return this.migrateV10(state);
  }

  migrateV10(state: MigrationState): MigrationState {
    const { params } = state;

    delete params[ZipSectionV10.RecipeObjectives];

    const checkedObjectiveIds = new Set<string>();
    const excludedItemIds = new Set<string>();
    const checkedItemIds = new Set<string>();
    const excludedRecipeIds = new Set<string>();
    const checkedRecipeIds = new Set<string>();

    function appendSet(key: string, set: Set<string>): void {
      if (set.size === 0) return;
      params[key] = Array.from(set).join(ZARRAYSEP);
    }

    // Modules
    const oldModules = params[ZipSectionV10.Modules] as Optional<string>;
    delete params[ZipSectionV10.Modules];
    const newModules = oldModules?.split(V10LISTSEP);

    // Beacons
    const oldBeacons = params[ZipSectionV10.Beacons] as Optional<string>;
    delete params[ZipSectionV10.Beacons];
    const newBeacons = oldBeacons?.split(V10LISTSEP);

    // Objectives
    const oldObjectives = params[ZipSectionV10.Objectives] as Optional<string>;
    delete params[ZipSectionV10.Objectives];
    const objectiveIds: string[] = [];
    const newObjectives = oldObjectives
      ?.split(V10LISTSEP)
      .map((entry, i) => {
        const s = entry.split(ZFIELDSEP);
        const id = i.toString();
        objectiveIds.push(id);
        if (s[8] === ZTRUE) checkedObjectiveIds.add(id);
        s.splice(8, 1);
        return s.join(ZFIELDSEP);
      })
      .filter((o) => o);
    if (newObjectives?.length) params['o'] = newObjectives;
    if (checkedObjectiveIds.size) {
      params['och'] = this.zipSvc.zipDiffSubset(
        checkedObjectiveIds,
        undefined,
        objectiveIds,
      );
    }

    // Items
    const oldItems = params[ZipSectionV10.Items] as Optional<string>;
    delete params[ZipSectionV10.Items];
    const newItems = oldItems
      ?.split(V10LISTSEP)
      .map((entry) => {
        const s = entry.split(ZFIELDSEP);
        const id = s[0];
        if (s[1] === ZTRUE) excludedItemIds.add(id);
        if (s[4] === ZTRUE) checkedItemIds.add(id);
        s.splice(4, 1);
        s.splice(1, 1);
        return s.join(ZFIELDSEP);
      })
      .filter((i) => i);
    if (newItems?.length) params['i'] = newItems;
    appendSet('v10iex', excludedItemIds);
    appendSet('v10ich', checkedItemIds);

    // Recipes
    const oldRecipes = params[ZipSectionV10.Recipes] as Optional<string>;
    delete params[ZipSectionV10.Recipes];
    const newRecipes = oldRecipes
      ?.split(V10LISTSEP)
      .map((entry) => {
        const s = entry.split(ZFIELDSEP);
        const id = s[0];
        if (s[1] === ZTRUE) excludedRecipeIds.add(id);
        if (s[7] === ZTRUE) checkedRecipeIds.add(id);
        s.splice(7, 1);
        s.splice(1, 1);
        return s.join(ZFIELDSEP);
      })
      .filter((r) => r);
    if (newRecipes?.length) params['r'] = newRecipes;
    appendSet('v10rex', excludedRecipeIds);
    appendSet('v10rch', checkedRecipeIds);

    // Machines
    const oldMachines = params[ZipSectionV10.Machines] as Optional<string>;
    delete params[ZipSectionV10.Machines];
    let machineRank: string[] | undefined;
    let fuelRankIds: string | undefined;
    let moduleRankIds: string | undefined;
    let beacons: string | undefined;
    let overclock: string | undefined;
    const newMachines: string[] = [];
    oldMachines?.split(V10LISTSEP).forEach((entry, i) => {
      const s = entry.split(ZFIELDSEP);
      const id = s[0];
      if (i === 0) {
        if (id === V10EMPTY) machineRank = [];
        moduleRankIds = s[1];
        beacons = s[2];
        fuelRankIds = s[3];
        overclock = s[4];
      } else {
        if (machineRank != null) machineRank.push(id);
        if (s.length > 1) newMachines.push(entry);
      }
    });

    if (newMachines.length) params['m'] = newMachines;
    params['mmr'] = machineRank?.join(ZARRAYSEP);
    params['mfr'] = fuelRankIds;
    params['mer'] = moduleRankIds;
    params['mbe'] = beacons;
    params['moc'] = overclock;

    // Settings
    const oldSettings = params[ZipSectionV10.Settings] as Optional<string>;
    delete params[ZipSectionV10.Settings];
    if (oldSettings) {
      const s = oldSettings.split(ZFIELDSEP);

      // Mod
      const modId = state.isBare ? s.splice(0, 1)[0] : undefined;
      if (modId) state.modId = modId;

      // Researched technologies
      const oldResearchedTechnologies = s[0];
      if (oldResearchedTechnologies && oldResearchedTechnologies !== V10NULL)
        appendSet(
          'v10tre',
          new Set(oldResearchedTechnologies.split(ZARRAYSEP)),
        );

      const keys = [
        'odr',
        'mpr',
        'ibe',
        'ifr',
        'bmi',
        'bre',
        'bic',
        'mit',
        'icw',
        'ifw',
        'ipi',
        'mbr',
        'mps',
        'rnp',
        'omt',
        'cfa',
        'cma',
        'cun',
        'cex',
        'csu',
        'cmx',
        'osm',
        'cfp',
      ];
      keys.forEach((k, i) => {
        params[k] = s[i + 1] || undefined;
      });

      if (!state.isBare) {
        const fixNNumber = ['ifr', 'bmi', 'bre', 'omt'] as const;
        fixNNumber
          .filter((k) => params[k] != null)
          .forEach((k) => {
            params[k] = this.parseNNumber(asString(params[k]))?.toString();
          });
      }
    }

    // Mod
    const oldMod = params[ZipSectionV10.Mod] as Optional<string>;
    delete params[ZipSectionV10.Mod];
    let newMod = oldMod;
    if (newMod && !state.isBare)
      newMod = data.modHash[this.compressionSvc.idToN(newMod)];
    if (newMod) state.modId = newMod;

    params['e'] = newModules;
    params['b'] = newBeacons;
    params['v'] = ZipVersion.Version11;

    prune(params);

    function replaceDeprecated(v: string): string {
      return v.replaceAll(V10NULL, '').replaceAll(V10EMPTY, ZEMPTY);
    }

    Object.keys(params).forEach((k) => {
      const value = params[k];
      if (Array.isArray(value))
        params[k] = value.map((v) => replaceDeprecated(v));
      else if (value) params[k] = replaceDeprecated(value);
    });

    return state;
  }

  restoreV10ResearchedTechnologies(
    value: Optional<Set<string>>,
    data: ModData,
  ): Optional<Set<string>> {
    const technologies = data.items.filter((i) => i.technology);
    const technologyIds = technologies.map((t) => t.id);
    if (value == null || !technologyIds.length) return undefined;

    /**
     * Source technology list includes only minimal set of technologies that
     * are not required as prerequisites for other researched technologies,
     * to reduce zip size. Need to rehydrate full list of technology ids using
     * their prerequisites.
     */
    const selection = new Set(value);

    const techEntities = toEntities(technologies);
    let addIds: Set<string>;
    do {
      addIds = new Set<string>();

      for (const id of selection) {
        const tech = techEntities[id].technology;
        tech?.prerequisites
          ?.filter((p) => !selection.has(p))
          .forEach((p) => addIds.add(p));
      }

      addIds.forEach((i) => selection.add(i));
    } while (addIds.size);

    if (selection.size === technologyIds.length) return undefined;
    return selection;
  }

  /** V11: Deprecated */
  parseNNumber(value: Optional<string>): number | undefined {
    if (!value?.length) return undefined;
    return this.compressionSvc.idToN(value);
  }

  /* Only for use in migrations */
  parseSet(value: Optional<string>, hash?: string[]): Set<string> | undefined {
    if (value == null) return undefined;
    const result = value.split(ZARRAYSEP);
    if (hash == null) return new Set(result);
    return new Set(result.map((v) => hash[this.compressionSvc.idToN(v)]));
  }

  displayWarnings(warnings: string[]): void {
    this.translateSvc
      .multi(['app.migrationWarning', 'OK'])
      .pipe(first())
      .subscribe(([header, acceptLabel]) => {
        for (const message of warnings) {
          this.contentSvc.confirm({
            message,
            header,
            acceptLabel,
            rejectVisible: false,
          });
        }
      });
  }
}
