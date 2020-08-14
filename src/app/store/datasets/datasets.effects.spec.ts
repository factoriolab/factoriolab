import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store, Action } from '@ngrx/store';
import { of, EMPTY } from 'rxjs';

import { Mocks } from 'src/tests';
import { reducers, metaReducers, State } from '..';
import { AppLoadAction } from '../app.actions';
import { ResetAction } from '../products';
import { SetBaseAction } from '../settings';
import { LoadModAction } from './datasets.actions';
import { DatasetsEffects } from './datasets.effects';

describe('DatasetsEffects', () => {
  let store: Store<State>;
  let effects: DatasetsEffects;
  let http: HttpTestingController;

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
    http = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    location.hash = '';
  });

  describe('loadMod$', () => {
    it('should store loaded mods in the cache', () => {
      store.dispatch(
        new LoadModAction({ id: Mocks.Base.id, value: Mocks.BaseData })
      );
      expect(effects.cache[Mocks.Base.id]).toEqual(Mocks.BaseData);
    });
  });

  describe('appLoad$', () => {
    it('should load the default base mod', () => {
      spyOn(store, 'dispatch').and.callThrough();
      spyOn(effects, 'requestData').and.returnValue(of(Mocks.BaseData));
      spyOn(effects, 'loadModsForBase');
      let effect: Action;
      effects.appLoad$.subscribe((a) => (effect = a));
      store.dispatch(new AppLoadAction({} as any));
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults.modIds
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new ResetAction(Mocks.Base.items[0].id)
      );
      expect(effect).toEqual(
        new LoadModAction({ id: Mocks.Base.id, value: Mocks.BaseData })
      );
    });

    it('should load from state', () => {
      spyOn(store, 'dispatch').and.callThrough();
      spyOn(effects, 'requestData').and.returnValue(of(Mocks.BaseData));
      spyOn(effects, 'loadModsForBase');
      let effect: Action;
      effects.appLoad$.subscribe((a) => (effect = a));
      store.dispatch(
        new AppLoadAction({
          settingsState: {
            baseId: Mocks.Base.id,
            modIds: [],
          },
          productsState: {},
        } as any)
      );
      expect(effects.loadModsForBase).toHaveBeenCalledWith([]);
      expect(store.dispatch).not.toHaveBeenCalledWith(
        new ResetAction(Mocks.Base.items[0].id)
      );
      expect(effect).toEqual(
        new LoadModAction({ id: Mocks.Base.id, value: Mocks.BaseData })
      );
    });
  });

  describe('setBaseId$', () => {
    it('should return reset products if already loaded', () => {
      effects.cache[Mocks.Base.id] = Mocks.BaseData;
      const effect: Action[] = [];
      effects.setBaseId$.subscribe((a) => effect.push(a));
      store.dispatch(new SetBaseAction(Mocks.Base.id));
      expect(effect).toEqual([new ResetAction(Mocks.Base.items[0].id)]);
    });

    it('should reset and load mod for new mod', () => {
      spyOn(effects, 'requestData').and.returnValue(of(Mocks.BaseData));
      spyOn(effects, 'loadModsForBase');
      const effect: Action[] = [];
      effects.setBaseId$.subscribe((a) => effect.push(a));
      store.dispatch(new SetBaseAction(Mocks.Base.id));
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults.modIds
      );
      expect(effect).toEqual([
        new ResetAction(Mocks.Base.items[0].id),
        new LoadModAction({ id: Mocks.Base.id, value: Mocks.BaseData }),
      ]);
    });
  });

  describe('loadModsForBase', () => {
    it('should load a list of mods', () => {
      spyOn(store, 'dispatch');
      spyOn(effects, 'requestData').and.returnValue(of(Mocks.ModData1));
      effects.loadModsForBase([Mocks.Mod1.id]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new LoadModAction({ id: Mocks.Mod1.id, value: Mocks.ModData1 })
      );
    });
  });

  describe('constructor', () => {
    it('should request data via HTTP and load base mod', () => {
      // Note: Request has already been made since location hash is empty
      spyOn(store, 'dispatch');
      spyOn(effects, 'loadModsForBase');
      http.expectOne(`data/${Mocks.Base.id}/data.json`).flush(Mocks.BaseData);
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults.modIds
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new ResetAction(Mocks.Base.items[0].id)
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new LoadModAction({ id: Mocks.Base.id, value: Mocks.BaseData })
      );
    });

    it('should skip request if url contains a hash', () => {
      http.expectOne(`data/${Mocks.Base.id}/data.json`).flush(Mocks.BaseData);
      location.hash = 'test';
      const fakeHttp = { get: () => {} };
      spyOn(fakeHttp, 'get');
      const e = new DatasetsEffects(EMPTY, fakeHttp as any, null, null);
      http.expectNone(`data/${Mocks.Base.id}/data.json`);
      expect(fakeHttp.get).not.toHaveBeenCalled();
    });
  });
});
