import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { map, pairwise, switchMap, withLatestFrom } from 'rxjs';

import { LabState } from '../';
import * as Recipes from '../recipes';
import { MachinesActionType } from './machines.actions';

@Injectable()
export class MachinesEffects {
  actions$ = inject(Actions);
  store = inject(Store<LabState>);

  /**
   * Resets machine-specific recipe settings when default machine is implicitly
   * changed. Effects should match the field resets that occur when a recipe's
   * machine is explicitly changed from one to another, defined by
   * `RecipesActionType.SET_MACHINE`. This effect handles cases that can cause
   * the recipe's machine to implicitly change.
   */
  resetRecipeSettings$ = createEffect(() =>
    this.store.select(Recipes.getRecipesState).pipe(
      pairwise(),
      switchMap((x) =>
        this.actions$.pipe(
          ofType(
            MachinesActionType.ADD,
            MachinesActionType.REMOVE,
            MachinesActionType.SET_RANK,
            MachinesActionType.SET_MACHINE,
          ),
          map(() => x),
        ),
      ),
      withLatestFrom(this.store.select(Recipes.recipesState)),
      switchMap(([[before, after], recipesRaw]) => {
        const effects: Action[] = [];
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
              raw.moduleIds != null ||
              raw.beacons != null) &&
            after[recipeId].machineId !== before[recipeId].machineId
          )
            effects.push(new Recipes.ResetRecipeMachineAction(recipeId));
        }

        return effects;
      }),
    ),
  );
}
