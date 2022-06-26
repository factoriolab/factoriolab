import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { environment } from 'src/environments';
import { Entities, FuelType, ModHash } from '~/models';
import { LabState } from '~/store';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  constructor(private store: Store<LabState>) {
    this.store.select(Products.checkViaState).subscribe((s) => {
      for (const product of s.products) {
        if (
          product.viaId &&
          product.viaId !== product.itemId &&
          product.rate.nonzero() &&
          s.rates[product.id].isZero()
        ) {
          // Reset invalid viaId
          // This normally occurs when a chosen viaId no longer appears in the result steps
          // Usually due to some parent item/recipe being ignored or recipe disabled
          this.store.dispatch(new Products.ResetViaAction(product.id));
        }
      }
    });

    // Used only in development to update hash files
    // istanbul ignore next
    if (environment.debug) {
      this.checkHash();
    }
  }

  // Used only in development to update hash files
  // istanbul ignore next
  checkHash(): void {
    combineLatest([
      this.store.select(Settings.getModId),
      this.store.select(Settings.getDataset),
    ])
      .pipe(
        filter(
          ([modId, data]) => data.categoryIds.length > 0 && data.hash != null
        ),
        first()
      )
      .subscribe(([modId, data]) => {
        console.log(modId);
        const oldDisabled = data.defaults?.disabledRecipeIds ?? [];
        const allDisabled = [
          ...oldDisabled,
          ...data.complexRecipeIds.filter((i) => !data.itemEntities[i]),
        ];
        const disabledEntities = allDisabled.reduce(
          (e: Entities<boolean>, d) => {
            e[d] = true;
            return e;
          },
          {}
        );
        const suggestedDisabled = Object.keys(disabledEntities);
        if (JSON.stringify(oldDisabled) !== JSON.stringify(suggestedDisabled)) {
          console.log(
            `Suggested disabled recipes (${suggestedDisabled.length}):`
          );
          console.log(JSON.stringify(suggestedDisabled));
        } else {
          console.log('No suggested changes to default disabled recipes');
        }
        if (data.hash) {
          const hash: ModHash = {
            items: [...data.hash.items],
            beacons: [...data.hash.beacons],
            belts: [...data.hash.belts],
            fuels: [...data.hash.fuels],
            wagons: [...data.hash.wagons],
            factories: [...data.hash.factories],
            modules: [...data.hash.modules],
            recipes: [...data.hash.recipes],
          };
          const old = JSON.stringify(hash);
          for (const id of [...data.itemIds]
            .sort()
            .filter((i) => hash.items.indexOf(i) === -1)) {
            hash.items.push(id);
          }
          for (const id of [...data.beaconIds]
            .sort()
            .filter((i) => hash.beacons.indexOf(i) === -1)) {
            hash.beacons.push(id);
          }
          for (const id of [...data.beltIds, ...data.pipeIds]
            .sort()
            .filter((i) => hash.belts.indexOf(i) === -1)) {
            hash.belts.push(id);
          }
          if (data.fuelIds[FuelType.Chemical]) {
            for (const id of [...data.fuelIds[FuelType.Chemical]]
              .sort()
              .filter((i) => hash.fuels.indexOf(i) === -1)) {
              hash.fuels.push(id);
            }
          }
          for (const id of [...data.cargoWagonIds, ...data.fluidWagonIds]
            .sort()
            .filter((i) => hash.wagons.indexOf(i) === -1)) {
            hash.wagons.push(id);
          }
          for (const id of [...data.factoryIds]
            .sort()
            .filter((i) => hash.factories.indexOf(i) === -1)) {
            hash.factories.push(id);
          }
          for (const id of [...data.moduleIds]
            .sort()
            .filter((i) => hash.modules.indexOf(i) === -1)) {
            hash.modules.push(id);
          }
          for (const id of [...data.recipeIds]
            .sort()
            .filter((i) => hash.recipes.indexOf(i) === -1)) {
            hash.recipes.push(id);
          }
          if (old === JSON.stringify(hash)) {
            console.log('No change in hash');
          } else {
            console.log('New hash:');
            console.log(JSON.stringify(hash));
          }
        }
        if (data.defaults) {
          const filteredDisabledRecipeIds =
            data.defaults.disabledRecipeIds.filter((a) =>
              data.complexRecipeIds.some((b) => b === a)
            );
          if (
            filteredDisabledRecipeIds.length !==
            data.defaults.disabledRecipeIds.length
          ) {
            console.log(
              `Filtered disabled recipes (${filteredDisabledRecipeIds.length}):`
            );
            console.log(JSON.stringify(filteredDisabledRecipeIds));
          } else {
            console.log('No unrecognized disabled recipes');
          }
        }
        const invalidRecipes: string[] = [];
        for (const id of data.recipeIds) {
          if (!data.recipeEntities[id].producers?.length) {
            invalidRecipes.push(id);
          }
        }
        if (invalidRecipes.length) {
          console.log(
            `Found recipes with no producers: (${invalidRecipes.length}):`
          );
          console.log(JSON.stringify(invalidRecipes));
        }
      });
  }
}
