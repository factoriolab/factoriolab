import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, take } from 'rxjs/operators';
import { environment } from 'src/environments';
import { FuelType } from '~/models';

import { State } from '~/store';
import { checkViaState, SetViaAction } from '~/store/products';
import { getDataset, getDatasets } from '~/store/settings';
import { RouterService } from './router.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  constructor(private router: RouterService, private store: Store<State>) {
    this.store.select(checkViaState).subscribe((s) => {
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
          this.store.dispatch(
            new SetViaAction({ id: product.id, value: null })
          );
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
      .select(getDatasets)
      .pipe(
        filter((d) => !!d.length),
        take(1),
        map((d) => d[0].id)
      )
      .subscribe((id) => {
        this.router
          .requestHash(id)
          .pipe(take(1))
          .subscribe((h) => {
            this.store
              .select(getDataset)
              .pipe(take(1))
              .subscribe((d) => {
                console.log(id);
                console.log(
                  JSON.stringify(
                    d.complexRecipeIds.filter((i) => !d.itemEntities[i])
                  )
                );
                const old = JSON.stringify(h);
                for (const id of [...d.itemIds]
                  .sort()
                  .filter((i) => h.items.indexOf(i) === -1)) {
                  h.items.push(id);
                }
                for (const id of [...d.beaconIds]
                  .sort()
                  .filter((i) => h.beacons.indexOf(i) === -1)) {
                  h.beacons.push(id);
                }
                for (const id of [...d.beltIds]
                  .sort()
                  .filter((i) => h.belts.indexOf(i) === -1)) {
                  h.belts.push(id);
                }
                if (d.fuelIds[FuelType.Chemical]) {
                  for (const id of [...d.fuelIds[FuelType.Chemical]]
                    .sort()
                    .filter((i) => h.fuels.indexOf(i) === -1)) {
                    h.fuels.push(id);
                  }
                }
                for (const id of [...d.cargoWagonIds, ...d.fluidWagonIds]
                  .sort()
                  .filter((i) => h.wagons.indexOf(i) === -1)) {
                  h.wagons.push(id);
                }
                for (const id of [...d.factoryIds]
                  .sort()
                  .filter((i) => h.factories.indexOf(i) === -1)) {
                  h.factories.push(id);
                }
                for (const id of [...d.moduleIds]
                  .sort()
                  .filter((i) => h.modules.indexOf(i) === -1)) {
                  h.modules.push(id);
                }
                for (const id of [...d.recipeIds]
                  .sort()
                  .filter((i) => h.recipes.indexOf(i) === -1)) {
                  h.recipes.push(id);
                }
                if (old === JSON.stringify(h)) {
                  console.log('No change in hash');
                } else {
                  console.log('New hash:');
                  console.log(JSON.stringify(h));
                }
              });
          });
      });
  }
}
