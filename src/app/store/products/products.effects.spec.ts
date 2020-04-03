import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';

import * as mocks from 'src/mocks';
import { State, reducers, metaReducers } from '..';
import * as actions from './products.actions';
import { ProductsEffects } from './products.effects';

describe('Products Effects', () => {
  let store: Store<State>;
  let effects: ProductsEffects;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers, { metaReducers }),
        EffectsModule.forRoot([ProductsEffects])
      ]
    });

    store = TestBed.inject(Store);
    effects = TestBed.inject(ProductsEffects);
  }));

  describe('selectItemCategory$', () => {
    it('selects the category of the product opened to edit', fakeAsync(() => {
      const value = 'test';
      spyOn(store, 'dispatch').and.callThrough();
      spyOn(store, 'select').and.returnValue(
        of({ [mocks.Product1.itemId]: { category: value } })
      );
      let effect;
      effects.selectItemCategory$.subscribe(e => (effect = e));
      store.dispatch(new actions.OpenEditProductAction(mocks.Product1));
      tick();
      expect(effect).toEqual(new actions.SelectItemCategoryEffectAction(value));
    }));
  });
});
