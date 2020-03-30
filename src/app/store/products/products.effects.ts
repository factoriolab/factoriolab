import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, switchMap, take, map } from 'rxjs/operators';
import {
  ProductsActionType,
  OpenEditProductAction,
  EffectSelectItemCategoryAction
} from './products.actions';
import { State } from '../';
import { getItemEntities } from '../dataset';

@Injectable()
export class ProductsEffects {
  @Effect()
  added$ = this.actions$.pipe(
    ofType(ProductsActionType.OPEN_EDIT_PRODUCT),
    switchMap((a: OpenEditProductAction) =>
      this.store.select(getItemEntities).pipe(
        take(1),
        filter(e => !!e),
        map(
          e => new EffectSelectItemCategoryAction(e[a.payload.itemId].category)
        )
      )
    )
  );

  constructor(private actions$: Actions, private store: Store<State>) {}
}
