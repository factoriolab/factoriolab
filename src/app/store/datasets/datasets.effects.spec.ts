import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';

import { DatasetsEffects } from './datasets.effects';
import { reducers, metaReducers, State } from '..';
import { EffectsModule } from '@ngrx/effects';
import { LoadModAction } from './datasets.actions';
import { Mocks } from 'src/tests';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatasetsEffects', () => {
  let store: Store<State>;
  let effects: DatasetsEffects;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        EffectsModule.forRoot([DatasetsEffects]),
      ],
    });

    store = TestBed.inject(Store);
    effects = TestBed.inject(DatasetsEffects);
  }));

  describe('loadMod$', () => {
    it('should store loaded mods in the cache', () => {
      store.dispatch(
        new LoadModAction({ id: Mocks.Base.id, value: Mocks.BaseData })
      );
      expect(effects.cache[Mocks.Base.id]).toEqual(Mocks.BaseData);
    });
  });
});
