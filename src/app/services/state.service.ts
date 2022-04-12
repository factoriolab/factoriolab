import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs/operators';
import { environment } from 'src/environments';
import { FuelType } from '~/models';

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
    this.store
      .select(Settings.getDatasets)
      .pipe(
        filter((d) => !!d.length),
        take(1),
        map((d) => d[0].id)
      )
      .subscribe((id) => {
        this.store
          .select(Settings.getDataset)
          .pipe(take(1))
          .subscribe((d) => {
            console.log(id);
            console.log(
              JSON.stringify(
                d.complexRecipeIds.filter((i) => !d.itemEntities[i])
              )
            );
            const old = JSON.stringify(d.hash);
            for (const id of [...d.itemIds]
              .sort()
              .filter((i) => d.hash.items.indexOf(i) === -1)) {
              d.hash.items.push(id);
            }
            for (const id of [...d.beaconIds]
              .sort()
              .filter((i) => d.hash.beacons.indexOf(i) === -1)) {
              d.hash.beacons.push(id);
            }
            for (const id of [...d.beltIds, ...d.pipeIds]
              .sort()
              .filter((i) => d.hash.belts.indexOf(i) === -1)) {
              d.hash.belts.push(id);
            }
            if (d.fuelIds[FuelType.Chemical]) {
              for (const id of [...d.fuelIds[FuelType.Chemical]]
                .sort()
                .filter((i) => d.hash.fuels.indexOf(i) === -1)) {
                d.hash.fuels.push(id);
              }
            }
            for (const id of [...d.cargoWagonIds, ...d.fluidWagonIds]
              .sort()
              .filter((i) => d.hash.wagons.indexOf(i) === -1)) {
              d.hash.wagons.push(id);
            }
            for (const id of [...d.factoryIds]
              .sort()
              .filter((i) => d.hash.factories.indexOf(i) === -1)) {
              d.hash.factories.push(id);
            }
            for (const id of [...d.moduleIds]
              .sort()
              .filter((i) => d.hash.modules.indexOf(i) === -1)) {
              d.hash.modules.push(id);
            }
            for (const id of [...d.recipeIds]
              .sort()
              .filter((i) => d.hash.recipes.indexOf(i) === -1)) {
              d.hash.recipes.push(id);
            }
            if (old === JSON.stringify(d.hash)) {
              console.log('No change in hash');
            } else {
              console.log('New hash:');
              console.log(JSON.stringify(d.hash));
            }
          });
      });
  }
}
