import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY, ReplaySubject } from 'rxjs';

import { Mocks, TestModule } from 'src/tests';
import { DataService } from '~/services';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { DatasetsEffects } from './datasets.effects';

describe('DatasetsEffects', () => {
  let effects: DatasetsEffects;
  let actions: ReplaySubject<any>;
  let dataSvc: DataService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [provideMockActions(() => actions), DatasetsEffects],
    });

    effects = TestBed.inject(DatasetsEffects);
    dataSvc = TestBed.inject(DataService);
  });

  describe('appLoad$', () => {
    it('should load the default base mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(EMPTY);
      actions = new ReplaySubject(1);
      actions.next(App.load({ partial: {} }));
      effects.appLoad$.subscribe();
      expect(dataSvc.requestData).toHaveBeenCalledWith(
        Settings.initialState.modId,
      );
    });
  });

  describe('appReset$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(EMPTY);
      actions = new ReplaySubject(1);
      actions.next(App.reset());
      effects.appReset$.subscribe();
      expect(dataSvc.requestData).toHaveBeenCalledWith(
        Settings.initialState.modId,
      );
    });
  });

  describe('setModId$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(EMPTY);
      actions = new ReplaySubject(1);
      actions.next(Settings.setMod({ modId: Mocks.Mod.id }));
      effects.setModId$.subscribe();
      expect(dataSvc.requestData).toHaveBeenCalledWith(Mocks.Mod.id);
    });
  });
});
