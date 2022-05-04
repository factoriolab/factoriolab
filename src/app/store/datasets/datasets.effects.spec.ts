import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { of, ReplaySubject } from 'rxjs';

import { Mocks, TestModule } from 'src/tests';
import { ModData, ModHash } from '~/models';
import { LabState } from '../';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';
import * as Actions from './datasets.actions';
import { DatasetsEffects } from './datasets.effects';

describe('DatasetsEffects', () => {
  let effects: DatasetsEffects;
  let actions: ReplaySubject<any>;
  let http: HttpTestingController;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [provideMockActions(() => actions), DatasetsEffects],
    });

    effects = TestBed.inject(DatasetsEffects);
    http = TestBed.inject(HttpTestingController);
    mockStore = TestBed.inject(MockStore);
  });

  describe('appLoad$', () => {
    it('should load the default base mod', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      actions = new ReplaySubject(1);
      actions.next(new App.LoadAction({}));
      const result: Action[] = [];
      effects.appLoad$.subscribe((r) => result.push(r));
      expect(result).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });

    it('should load from state', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      actions = new ReplaySubject(1);
      actions.next(
        new App.LoadAction({
          settingsState: { baseId: Mocks.Base.id },
          productsState: Products.initialProductsState,
        })
      );
      const result: Action[] = [];
      effects.appLoad$.subscribe((r) => result.push(r));
      expect(result).toEqual([]);
    });
  });

  describe('appReset$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      actions = new ReplaySubject(1);
      actions.next(new App.ResetAction());
      const result: Action[] = [];
      effects.appReset$.subscribe((r) => result.push(r));
      expect(result).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });
  });

  describe('setBaseId$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      actions = new ReplaySubject(1);
      actions.next(new Settings.SetBaseAction(Mocks.Base.id));
      const result: Action[] = [];
      effects.setBaseId$.subscribe((r) => result.push(r));
      expect(result).toEqual([
        new Products.ResetAction(Mocks.Base.items[0].id),
      ]);
    });
  });

  describe('requestData', () => {
    it('should set up http requests for data', () => {
      spyOn(mockStore, 'dispatch');
      spyOn(effects, 'loadModsForBase');
      http.expectOne(`data/${Mocks.Base.id}/data.json`).flush(Mocks.BaseData);
      http.expectOne(`data/${Mocks.Base.id}/hash.json`).flush(Mocks.Hash);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Actions.LoadModDataAction({
          id: Mocks.Base.id,
          value: Mocks.BaseData,
        })
      );
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Actions.LoadModHashAction({ id: Mocks.Base.id, value: Mocks.Hash })
      );
      expect(effects.loadModsForBase).toHaveBeenCalledWith(
        Mocks.BaseData.defaults!.modIds
      );
    });

    it('should get values from cache', () => {
      effects.cacheData['id-en'] = Mocks.BaseData;
      effects.cacheHash['id'] = Mocks.Hash;
      let data: [ModData, ModHash] | undefined;
      effects.requestData('id', 'en').subscribe((d) => (data = d));
      expect(data).toEqual([Mocks.BaseData, Mocks.Hash]);
    });

    it('should handle null defaults and skip hash', () => {
      spyOn(effects, 'loadModsForBase');
      let data: [ModData, ModHash] | undefined;
      effects.requestData('id', 'en', true).subscribe((d) => (data = d));
      http
        .expectOne('data/id/data.json')
        .flush({ ...Mocks.BaseData, ...{ defaults: undefined } });
      expect(effects.loadModsForBase).toHaveBeenCalledWith([]);
      expect(data).toBeUndefined();
    });
  });

  describe('loadModsForBase', () => {
    it('should load a list of mods', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      effects.loadModsForBase([Mocks.Mod1.id]);
      expect(effects.requestData).toHaveBeenCalledTimes(1);
    });
  });

  describe('load', () => {
    it('should load stored mod', () => {
      spyOn(effects, 'requestData').and.returnValue(
        of([Mocks.BaseData, Mocks.Hash])
      );
      spyOn(mockStore, 'dispatch');
      effects.load(
        '',
        { settingsState: { baseId: Mocks.Base.id } as any },
        Settings.initialSettingsState
      );
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Products.ResetAction(Mocks.Base.items[0].id)
      );
    });
  });
});
