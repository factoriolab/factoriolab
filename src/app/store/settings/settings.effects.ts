import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, pairwise, switchMap, withLatestFrom } from 'rxjs';

import { resetRecipeMachines } from '../recipes/recipes.actions';
import { recipesState, selectRecipesState } from '../recipes/recipes.selectors';
import { setMachineRank } from './settings.actions';

@Injectable()
export class SettingsEffects {
  actions$ = inject(Actions);
  store = inject(Store);

  /**
   * Resets machine-specific recipe settings when default machine is implicitly
   * changed. Effects should match the field resets that occur when a recipe's
   * machine is explicitly changed from one to another, defined by
   * `RecipesActionType.SET_MACHINE`. This effect handles cases that can cause
   * the recipe's machine to implicitly change.
   */
  resetRecipeSettings$ = createEffect(() => {
    return this.store.select(selectRecipesState).pipe(
      pairwise(),
      switchMap((x) =>
        this.actions$.pipe(
          ofType(setMachineRank),
          map(() => x),
        ),
      ),
      withLatestFrom(this.store.select(recipesState)),
      map(([[before, after], recipesRaw]) => {
        const ids: string[] = [];
        for (const recipeId of Object.keys(recipesRaw)) {
          const raw = recipesRaw[recipeId];
          /**
           * Reset recipe machine fields where both are true:
           *   A) Some machine field has been modified from the default
           *      (`fuelId`, `moduleIds`, or `beacons`)
           *   B) The selected machine has been changed as a result of this
           *      action
           */
          if (
            (raw.fuelId != null ||
              raw.modules != null ||
              raw.beacons != null) &&
            after[recipeId].machineId !== before[recipeId].machineId
          )
            ids.push(recipeId);
        }

        return resetRecipeMachines({ ids });
      }),
    );
  });
}
