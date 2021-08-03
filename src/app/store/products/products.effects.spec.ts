import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Action, Store, StoreModule } from '@ngrx/store';
import { DisplayRate } from '~/models';

import { reducers, metaReducers, State } from '..';
import * as Settings from '../settings';
import { AdjustDisplayRateAction } from './products.actions';
import { ProductsEffects } from './products.effects';

describe('ProductsEffects', () => {
  let store: Store<State>;
  let effects: ProductsEffects;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers, { metaReducers }),
        EffectsModule.forRoot([ProductsEffects]),
      ],
    });

    store = TestBed.inject(Store);
    effects = TestBed.inject(ProductsEffects);
  });

  describe('adjustDisplayRate$', () => {
    it('should dispatch an action to adjust product rates', () => {
      spyOn(store, 'dispatch').and.callThrough();
      const effect: Action[] = [];
      effects.adjustDisplayRate$.subscribe((a) => effect.push(a));
      store.dispatch(
        new Settings.SetDisplayRateAction({
          value: DisplayRate.PerSecond,
          prev: DisplayRate.PerMinute,
        })
      );
      expect(effect).toEqual([new AdjustDisplayRateAction('1/60')]);
    });
  });
});
