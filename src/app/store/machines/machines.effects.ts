import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { combineLatest, first, switchMap } from 'rxjs';

import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { MachinesActionType } from './machines.actions';

@Injectable()
export class MachinesEffects {
  /** Resets recipe settings that are invalidated by changes to machine settings */
  resetRecipeSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        MachinesActionType.ADD,
        MachinesActionType.REMOVE,
        MachinesActionType.RAISE,
        MachinesActionType.SET_MACHINE
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
          if (r && (r.machineModuleIds != null || r.beacons != null)) {
            // Check that these recipe settings are still valid
            const machineId = recipeSettings[i].machineId;
            if (machineId) {
              const machine = data.machineEntities[machineId];
              const recipe = data.recipeEntities[i];
              if (
                !RecipeUtility.allowsModules(recipe, machine) ||
                (r.machineModuleIds &&
                  r.machineModuleIds.length !== machine.modules)
              ) {
                // Machine does not support module effects, reset these settings
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
