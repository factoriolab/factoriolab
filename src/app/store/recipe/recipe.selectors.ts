import { createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { State } from '../';
import { getRecipes, getItemEntities } from '../dataset';
import { RecipeSettings } from 'src/app/models';
import { getSettingsState } from '../settings';

const recipeState = (state: State) => state.recipeState;

export const getRecipeSettings = createSelector(
  recipeState,
  getRecipes,
  getItemEntities,
  getSettingsState,
  (sState, sRecipes, sItemEntities, sSettings) => {
    const value: { [id: string]: RecipeSettings } = {};
    for (const recipe of sRecipes) {
      const settings: RecipeSettings = sState[recipe.id]
        ? { ...sState[recipe.id] }
        : { ignore: false };

      // Belt
      if (!settings.belt) {
        settings.belt = sSettings.belt;
      }

      // Factory
      if (!settings.factory) {
        if (!recipe.producers) {
          settings.factory = sSettings.assembler;
        } else if (recipe.producers.length === 1) {
          settings.factory = recipe.producers[0];
        } else if (recipe.producers.some(p => p === sSettings.assembler)) {
          settings.factory = sSettings.assembler;
        } else if (recipe.producers.some(p => p === sSettings.furnace)) {
          settings.factory = sSettings.furnace;
        } else if (recipe.producers.some(p => p === sSettings.drill)) {
          settings.factory = sSettings.drill;
        } else {
          settings.factory = recipe.producers[0];
        }
      }

      const factoryItem = sItemEntities[settings.factory];
      if (factoryItem.factory.modules) {
        let prodAllowed = false;
        if (recipe.out) {
          for (const out in recipe.out) {
            if (recipe.out[out]) {
              const item = sItemEntities[out];
              if (
                item.category === 'intermediate' ||
                item.category === 'research'
              ) {
                prodAllowed = true;
              }
            }
          }
        } else {
          const item = sItemEntities[recipe.id];
          if (
            item.category === 'intermediate' ||
            item.category === 'research'
          ) {
            prodAllowed = true;
          }
        }

        // Modules
        if (!settings.modules) {
          let moduleId: string;
          if (sSettings.module[0]) {
            if (
              !sSettings.module[0].startsWith('productivity') ||
              prodAllowed
            ) {
              // Default module is allowed
              moduleId = sSettings.module[0];
            } else if (
              sSettings.module[1] &&
              (!sSettings.module[1].startsWith('productivity') || prodAllowed)
            ) {
              // Fallback module is allowed
              moduleId = sSettings.module[1];
            }
          }

          if (moduleId) {
            settings.modules = [];
            for (let i = 0; i < factoryItem.factory.modules; i++) {
              settings.modules.push(moduleId);
            }
          }
        }

        // Beacons
        if (!settings.beaconType) {
          if (sSettings.beaconType) {
            settings.beaconType = sSettings.beaconType;
          }
        }
        if (settings.beaconCount == null) {
          if (sSettings.beaconCount != null) {
            settings.beaconCount = sSettings.beaconCount;
          }
        }
      }

      value[recipe.id] = settings;
    }
    return value;
  }
);

export const getRecipeFactors = createSelector(
  getRecipeSettings,
  getItemEntities,
  (sRecipeSettings, sItemEntities) => {
    const values: { [id: string]: [Fraction, Fraction] } = {};
    for (const recipeId in sRecipeSettings) {
      if (sRecipeSettings[recipeId]) {
        const settings = sRecipeSettings[recipeId];
        values[recipeId] = [
          new Fraction(sItemEntities[settings.factory].factory.speed),
          new Fraction(1)
        ];
        let speed = new Fraction(1);
        let prod = new Fraction(1);
        if (settings.modules) {
          for (const moduleId of settings.modules) {
            if (sItemEntities[moduleId]) {
              const mod = sItemEntities[moduleId].module;
              speed = speed.add(mod.speed);
              prod = prod.add(mod.productivity);
            }
          }
        }
        if (settings.beaconType) {
          const mod = sItemEntities[settings.beaconType].module;
          speed = speed.add(new Fraction(mod.speed).mul(settings.beaconCount));
          prod = prod.add(
            new Fraction(mod.productivity).mul(settings.beaconCount)
          );
        }
        values[recipeId][0] = values[recipeId][0].mul(speed);
        values[recipeId][1] = prod;
      }
    }
    return values;
  }
);
