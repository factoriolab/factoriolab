import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { of, ReplaySubject } from 'rxjs';

import { Mocks, TestModule } from 'src/tests';
import { DataService } from '~/services';
import { LabState } from '../';
import * as App from '../app.actions';
import * as Products from '../products';
import * as Settings from '../settings';
import { DatasetsEffects } from './datasets.effects';

describe('DatasetsEffects', () => {
  let effects: DatasetsEffects;
  let actions: ReplaySubject<any>;
  let mockStore: MockStore<LabState>;
  let dataSvc: DataService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [provideMockActions(() => actions), DatasetsEffects],
    });

    effects = TestBed.inject(DatasetsEffects);
    mockStore = TestBed.inject(MockStore);
    dataSvc = TestBed.inject(DataService);
  });

  describe('appLoad$', () => {
    it('should load the default base mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, Mocks.I18n])
      );
      actions = new ReplaySubject(1);
      actions.next(new App.LoadAction({}));
      const result: Action[] = [];
      effects.appLoad$.subscribe((r) => result.push(r));
      expect(result).toEqual([new Products.ResetAction(Mocks.Mod.items[0].id)]);
    });

    it('should load from state', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, Mocks.I18n])
      );
      actions = new ReplaySubject(1);
      actions.next(
        new App.LoadAction({
          settingsState: { modId: Mocks.Mod.id },
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
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, Mocks.I18n])
      );
      actions = new ReplaySubject(1);
      actions.next(new App.ResetAction());
      const result: Action[] = [];
      effects.appReset$.subscribe((r) => result.push(r));
      expect(result).toEqual([new Products.ResetAction(Mocks.Mod.items[0].id)]);
    });
  });

  describe('setModId$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, Mocks.I18n])
      );
      actions = new ReplaySubject(1);
      actions.next(new Settings.SetModAction(Mocks.Mod.id));
      const result: Action[] = [];
      effects.setModId$.subscribe((r) => result.push(r));
      expect(result).toEqual([new Products.ResetAction(Mocks.Mod.items[0].id)]);
    });
  });
});
