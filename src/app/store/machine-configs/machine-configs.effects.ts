import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { combineLatest, first, switchMap } from 'rxjs';

import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Recipes from '../recipe-configs';
import * as Settings from '../settings';
import { MachinesCfgActionType } from './machine-configs.actions';

@Injectable()
export class MachinesCfgEffects {
  /** Resets recipe settings that are invalidated by changes to machine settings */
  resetRecipesCfg$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        MachinesCfgActionType.ADD,
        MachinesCfgActionType.REMOVE,
        MachinesCfgActionType.RAISE,
        MachinesCfgActionType.SET_MACHINE
      ),
      switchMap(() =>
        combineLatest([
          this.store.select(Recipes.recipesCfgState),
          this.store.select(Recipes.getRecipesCfg),
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
