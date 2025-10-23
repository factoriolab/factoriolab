import { Injectable } from '@angular/core';
import { faBan } from '@fortawesome/free-solid-svg-icons';

import { Beacon } from '~/data/schema/beacon';
import { Machine, MachineJson } from '~/data/schema/machine';
import { filterEffect } from '~/data/schema/module';
import { Recipe } from '~/data/schema/recipe';
import { Option } from '~/option/option';
import { Rational, rational } from '~/rational/rational';
import { fnPropsNotNullish } from '~/utils/nullish';

import { ModuleSettings } from './module-settings';
import { Dataset } from './settings/dataset';
import { Settings } from './settings/settings';

@Injectable({ providedIn: 'root' })
export class Options {
  /** Determines what option to use based on preferred rank */
  bestMatch(options: Option[], rank: string[]): string {
    const ids = options.map((o) => o.value);
    if (ids.length > 1) {
      for (const r of rank) {
        // Return first matching option in rank list
        if (ids.includes(r)) return r;
      }
    }

    return ids[0];
  }

  machineOptions(recipe: Recipe, settings: Settings, data: Dataset): Option[] {
    let machineIds = recipe.producers.filter(
      (p) =>
        settings.availableItemIds.has(p) &&
        (data.machineRecord[p].locations == null ||
          data.machineRecord[p].locations.some((l) =>
            settings.locationIds.has(l),
          )),
    );
    if (machineIds.length === 0) machineIds = recipe.producers;
    return machineIds.map((m) => ({
      value: m,
      label: data.itemRecord[m].name,
      icon: m,
      iconType: 'item',
      tooltip: m,
      tooltipType: 'machine',
    }));
  }

  fuelOptions(
    entity: MachineJson | Machine,
    settings: Settings,
    data: Dataset,
  ): Option[] {
    if (entity.fuel) {
      const fuel = data.itemRecord[entity.fuel];
      return [{ value: fuel.id, label: fuel.name }];
    }

    if (entity.fuelCategories == null) return [];

    const fuelCategories = entity.fuelCategories;
    let allowed = data.fuelIds
      .map((f) => data.itemRecord[f])
      .filter(fnPropsNotNullish('fuel'))
      .filter((f) => fuelCategories.includes(f.fuel.category));
    if (allowed.some((f) => settings.availableItemIds.has(f.id)))
      allowed = allowed.filter((f) => settings.availableItemIds.has(f.id));
    return allowed.map(
      (f): Option => ({
        value: f.id,
        label: f.name,
        icon: f.id,
        iconType: 'item',
        tooltip: f.id,
        tooltipType: 'fuel',
      }),
    );
  }

  moduleOptions(
    entity: Machine | Beacon,
    settings: Settings,
    data: Dataset,
    recipeId?: string,
  ): Option[] {
    // Get all modules
    let allowed = data.moduleIds
      .map((i) => data.itemRecord[i])
      .filter(fnPropsNotNullish('module'))
      .filter((m) => settings.availableItemIds.has(m.id));

    let recipe: Recipe | undefined;
    if (recipeId != null) {
      recipe = data.recipeRecord[recipeId];
      if (
        Object.keys(data.limitations).length &&
        (!data.flags.has('miningTechnologyBypassLimitations') ||
          (!recipe.flags.has('mining') && !recipe.flags.has('technology')))
      ) {
        // Filter for modules allowed on this recipe
        allowed = allowed.filter(
          (m) =>
            !m.module.limitation ||
            data.limitations[m.module.limitation][recipeId],
        );
      }

      if (recipe.disallowedEffects) {
        for (const disallowedEffect of recipe.disallowedEffects) {
          allowed = allowed.filter((m) =>
            filterEffect(m.module, disallowedEffect),
          );
        }
      }
    }

    // Filter for modules allowed on this entity
    if (entity.disallowedEffects) {
      for (const disallowedEffect of entity.disallowedEffects) {
        allowed = allowed.filter((m) =>
          filterEffect(m.module, disallowedEffect),
        );
      }
    }

    const options = allowed.map(
      (m): Option => ({
        value: m.id,
        label: m.name,
        icon: m.id,
        iconType: 'item',
        tooltip: m.id,
        tooltipType: 'module',
      }),
    );
    if (
      (!data.flags.has('resourcePurity') || !recipe?.flags.has('mining')) &&
      !data.flags.has('duplicators')
    ) {
      options.unshift({
        label: 'none',
        value: '',
        icon: faBan,
      });
    }
    return options;
  }

  /** Determines default modules for a recipe/machine */
  defaultModules(
    options: Option[],
    moduleRankIds: string[],
    count: Rational | true | undefined,
    machineValue?: ModuleSettings[],
  ): ModuleSettings[] | undefined {
    if (count == null) return undefined;

    if (machineValue) {
      const set = new Set(options.map((o) => o.value));
      if (machineValue.every((m) => m.id && set.has(m.id))) return machineValue;
    }

    const id = this.bestMatch(options, moduleRankIds);
    count = count === true ? rational.zero : count;
    return [{ id, count }];
  }
}
