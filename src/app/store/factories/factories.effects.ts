import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { combineLatest, first, switchMap } from 'rxjs';

import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { FactoriesActionType } from './factories.actions';

@Injectable()
export class FactoriesEffects {
  /** Resets recipe settings that are invalidated by changes to factory settings */
  resetRecipeSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        FactoriesActionType.ADD,
        FactoriesActionType.REMOVE,
        FactoriesActionType.RAISE,
        FactoriesActionType.SET_FACTORY
      ),
      switchMap(() =>
        combineLatest([
          this.store.select(Recipes.recipesState),
          this.store.select(Recipes.getRecipeSettings),
          this.store.select(Settings.getDataset),
        ]).pipe(first())
      ),
      switchMap(([rawSettings, recipeSettings, data]) => {
        const effects: Action[] = [];
        // Look for recipe settings with module effects specified
        for (const i of Object.keys(rawSettings)) {
          const r = rawSettings[i];
          if (
            r &&
            (r.factoryModuleIds != null ||
              r.beaconCount != null ||
              r.beaconId != null ||
              r.beaconModuleIds != null)
          ) {
            // Check that these recipe settings are still valid
            const factoryId = recipeSettings[i].factoryId;
            if (factoryId) {
              const factory = data.factoryEntities[factoryId];
              const recipe = data.recipeEntities[i];
              if (
                !RecipeUtility.allowsModules(recipe, factory) ||
                (r.factoryModuleIds &&
                  r.factoryModuleIds.length !== factory.modules)
              ) {
                // Factory does not support module effects, reset these settings
                effects.push(new Recipes.ResetRecipeModulesAction(i));
              }
            }
          }
        }
        return effects;
      })
    )
  );

  constructor(private actions$: Actions, private store: Store<LabState>) {}
}
