import { inject, Injectable } from '@angular/core';

import { Option } from '~/option/option';
import { Rational, rational } from '~/rational/rational';
import { areArraysEqual } from '~/utils/equality';
import { coalesce, fnPropsNotNullish } from '~/utils/nullish';

import { areBeaconSettingsEqual, BeaconSettings } from './beacon-settings';
import { areModuleSettingsEqual, ModuleSettings } from './module-settings';
import { Options } from './options';

@Injectable({ providedIn: 'root' })
export class Hydration {
  private readonly options = inject(Options);

  dehydrateModules(
    value: ModuleSettings[],
    options: Option[],
    moduleRankIds: string[],
    count: Rational | true | undefined,
    machineValue?: ModuleSettings[],
  ): ModuleSettings[] | undefined {
    const def = this.options.defaultModules(
      options,
      moduleRankIds,
      count,
      machineValue,
    );
    if (areArraysEqual(value, def, areModuleSettingsEqual)) return undefined;

    const moduleId = this.options.bestMatch(options, moduleRankIds);
    const moduleCount = count === true || count == null ? rational.zero : count;
    const result = value
      // Exclude empty module entry
      .filter((m) => m.id !== '')
      .map((m) => {
        const r = {} as ModuleSettings;
        if (m.id !== moduleId) r.id = m.id;
        if (m.id == null || !m.count?.eq(moduleCount)) r.count = m.count;
        return r;
      });

    return result;
  }

  hydrateModules(
    value: ModuleSettings[] | undefined,
    options: Option[],
    moduleRankIds: string[],
    count: Rational | true | undefined,
    machineValue?: ModuleSettings[],
  ): ModuleSettings[] | undefined {
    if (value == null)
      return this.options.defaultModules(
        options,
        moduleRankIds,
        count,
        machineValue,
      );

    const moduleCount = count === true || count == null ? rational.zero : count;
    const moduleId = this.options.bestMatch(options, moduleRankIds);
    const result = value.map((m) => ({
      count: coalesce(m.count, moduleCount),
      id: coalesce(m.id, moduleId),
    }));

    if (moduleCount.nonzero()) {
      // Restore empty module entry
      const total = result.reduce((a, b) => a.add(b.count), rational.zero);
      const empty = moduleCount.sub(total);
      if (empty.gt(rational.zero)) result.push({ count: empty, id: '' });
    }

    return result;
  }

  dehydrateBeacons(
    value: BeaconSettings[],
    def: BeaconSettings[] | undefined,
  ): BeaconSettings[] | undefined {
    if (areArraysEqual(value, def, areBeaconSettingsEqual)) return undefined;

    if (def == null || def.length === 0) return value;

    const beaconSettings = def[0];
    const moduleId = beaconSettings?.modules?.[0].id;
    const moduleCount = coalesce(
      beaconSettings?.modules?.[0].count,
      rational.zero,
    );
    const result = value.map((b) => {
      const r = {} as BeaconSettings;
      if (b.id && b.id !== beaconSettings.id) r.id = b.id;
      if (!b.count?.eq(coalesce(beaconSettings.count, rational.zero)))
        r.count = b.count;
      if (
        !areArraysEqual(
          b.modules,
          beaconSettings.modules,
          areModuleSettingsEqual,
        )
      )
        r.modules = b.modules
          ?.filter((m) => m.id !== '')
          .map((m) => {
            const r = {} as ModuleSettings;
            if (m.id !== moduleId) r.id = m.id;
            if (!m.count?.eq(moduleCount)) r.count = m.count;
            return r;
          });
      if (b.total) r.total = b.total;
      return r;
    });

    if (result.every((r) => Object.keys(r).length === 0)) return [];

    return result;
  }

  hydrateBeacons(
    value: BeaconSettings[] | undefined,
    def: BeaconSettings[] | undefined,
  ): BeaconSettings[] | undefined {
    if (value == null || def == null || def.length === 0) return def;

    const beaconSettings = def[0];
    const moduleSettings = beaconSettings.modules?.[0];
    const result = value.map((b) => ({
      id: coalesce(b.id, beaconSettings.id),
      count: b.count ?? beaconSettings.count,
      modules: coalesce(
        b.modules?.map((m) => ({
          id: coalesce(m.id, moduleSettings?.id),
          count: coalesce(m.count, moduleSettings?.count),
        })),
        beaconSettings.modules,
      ),
      total: coalesce(b.total, beaconSettings.total),
    }));

    if (moduleSettings?.count == null) return result;

    return result.filter(fnPropsNotNullish('modules')).map((b) => {
      // Restore empty module entry
      const total = b.modules.reduce(
        (a, b) => a.add(coalesce(b.count, rational.zero)),
        rational.zero,
      );
      const empty = moduleSettings?.count?.sub(total);
      if (empty?.gt(rational.zero)) b.modules.push({ count: empty, id: '' });

      return b;
    });
  }
}
