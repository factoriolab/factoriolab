import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { combineLatest, first, switchMap } from 'rxjs';

import { EnergyType } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { MachinesActionType } from './machines.actions';

@Injectable()
export class MachinesEffects {
  actions$ = inject(Actions);
  store = inject(Store<LabState>);

  /** Resets recipe settings that are invalidated by changes to machine settings */
  resetRecipeSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        MachinesActionType.ADD,
        MachinesActionType.REMOVE,
        MachinesActionType.SET_RANK,
        MachinesActionType.SET_MACHINE,
      ),
      switchMap(() =>
        combineLatest([
          this.store.select(Recipes.recipesState),
          this.store.select(Recipes.getRecipesState),
          this.store.select(Settings.getDataset),
        ]).pipe(first()),
      ),
      switchMap(([rawSettings, recipesState, data]) => {
        const effects: Action[] = [];
        // Look for recipe settings with module effects specified
        for (const i of Object.keys(rawSettings)) {
          const r = rawSettings[i];
          const machineId = recipesState[i]?.machineId;
          if (r && machineId) {
            const machine = data.machineEntities[machineId];
            const recipe = data.recipeEntities[i];
            if (r.fuelId != null) {
              // Check that fuel setting is still valid
              if (machine.type !== EnergyType.Burner) {
                effects.push(new Recipes.ResetRecipeFuelAction(i));
              }
            }

            if (r.machineModuleIds != null || r.beacons != null) {
              // Check that these recipe settings are still valid
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
      }),
    ),
  );
}
