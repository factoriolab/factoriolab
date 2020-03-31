import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, switchMap, take, map } from 'rxjs/operators';

import { RateType } from '~/models';
import * as actions from './products.actions';
import { getItemEntities } from '../dataset';
import { State } from '../';

@Injectable()
export class ProductsEffects {
  @Effect()
  added$ = this.actions$.pipe(
    ofType(actions.ProductsActionType.OPEN_EDIT_PRODUCT),
    switchMap((a: actions.OpenEditProductAction) =>
      this.store.select(getItemEntities).pipe(
        take(1),
        filter(e => !!e),
        map(
          e =>
            new actions.EffectSelectItemCategoryAction(
              e[a.payload.itemId].category
            )
        )
      )
    )
  );

  constructor(private actions$: Actions, private store: Store<State>) {}
}
