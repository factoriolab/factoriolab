import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store, Action } from '@ngrx/store';
import { of } from 'rxjs';

import { Mocks } from 'src/tests';
import { reducers, metaReducers, LabState } from '..';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';
import { DatasetsEffects } from './datasets.effects';

describe('DatasetsEffects', () => {
  let store: Store<LabState>;
  let effects: DatasetsEffects;
  let http: HttpTestingController;

  beforeEach(async () => {
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
  });

  // afterEach(() => {
  //   history.replaceState(null, null, '');
  // });

  describe('appLoad$', () => {
    it('should load the default base mod', () => {
      spyOn(store, 'dispatch').and.callThrough();
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      spyOn(effects, 'loadModsForBase');
      store.dispatch(new App.LoadAction({} as any));
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults?.modIds
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new Products.ResetAction(Mocks.Base.items[0].id)
      );
    });

    it('should load from state', () => {
      spyOn(store, 'dispatch').and.callThrough();
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      spyOn(effects, 'loadModsForBase');
      store.dispatch(
        new App.LoadAction({
          settingsState: { baseId: Mocks.Base.id },
          productsState: {},
        } as any)
      );
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults?.modIds
      );
      expect(store.dispatch).not.toHaveBeenCalledWith(
        new Products.ResetAction(Mocks.Base.items[0].id)
      );
    });
  });

  describe('appReset$', () => {
    it('should return reset action if already loaded', () => {
      effects.cacheData[Mocks.Base.id] = Mocks.BaseData;
      const effect: Action[] = [];
      effects.appReset$.subscribe((a) => effect.push(a));
      store.dispatch(new App.ResetAction());
      expect(effect).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });

    it('should reset and load mod for new mod', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      spyOn(effects, 'loadModsForBase');
      const effect: Action[] = [];
      effects.appReset$.subscribe((a) => effect.push(a));
      store.dispatch(new App.ResetAction());
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults?.modIds
      );
      expect(effect).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });
  });

  describe('setBaseId$', () => {
    it('should return reset action if already loaded', () => {
      effects.cacheData[Mocks.Base.id] = Mocks.BaseData;
      const effect: Action[] = [];
      effects.setBaseId$.subscribe((a) => effect.push(a));
      store.dispatch(new Settings.SetBaseAction(Mocks.Base.id));
      expect(effect).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });

    it('should reset and load mod for new mod', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      spyOn(effects, 'loadModsForBase');
      const effect: Action[] = [];
      effects.setBaseId$.subscribe((a) => effect.push(a));
      store.dispatch(new Settings.SetBaseAction(Mocks.Base.id));
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults?.modIds
      );
      expect(effect).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });
  });

  describe('loadModsForBase', () => {
    it('should load a list of mods', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      effects.loadModsForBase([Mocks.Mod1.id]);
      expect(effects.requestData).toHaveBeenCalled();
    });
  });

  describe('load', () => {
    beforeEach(() => {
      http.expectOne(`data/${Mocks.Base.id}/data.json`).flush(Mocks.BaseData);
    });

    it('should request data via HTTP and load base mod', () => {
      spyOn(store, 'dispatch');
      spyOn(effects, 'loadModsForBase');
      effects.load('', undefined, { baseId: Mocks.Base.id } as any);
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults?.modIds
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new Products.ResetAction(Mocks.Base.items[0].id)
      );
    });

    it('should load from storage', () => {
      spyOn(store, 'dispatch');
      spyOn(effects, 'loadModsForBase');
      effects.load(
        '',
        { settingsState: { baseId: Mocks.Base.id }, productsState: {} } as any,
        Settings.initialSettingsState
      );
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.Base.defaults?.modIds ?? []
      );
      expect(store.dispatch).not.toHaveBeenCalledWith(
        new Products.ResetAction(Mocks.Base.items[0].id)
      );
    });

    it('should skip request if url contains a hash', () => {
      spyOn(store, 'dispatch');
      spyOn(effects, 'loadModsForBase');
      effects.load('test', undefined, { baseId: Mocks.Base.id } as any);
      http.expectNone(`data/${Mocks.Base.id}/data.json`);
      expect(effects.loadModsForBase).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });
});
