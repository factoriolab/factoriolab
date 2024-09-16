import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY, ReplaySubject } from 'rxjs';

import { DataService } from '~/services/data.service';
import { Mocks, TestModule } from '~/tests';

import { load, reset } from '../app.actions';
import { setMod } from '../settings/settings.actions';
import { initialSettingsState } from '../settings/settings.reducer';
import { DatasetsEffects } from './datasets.effects';

describe('DatasetsEffects', () => {
  let effects: DatasetsEffects;
  let actions: ReplaySubject<any>;
  let dataSvc: DataService;

  beforeEach(() => {
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
      actions.next(load({ partial: {} }));
      effects.appLoad$.subscribe();
      expect(dataSvc.requestData).toHaveBeenCalledWith(
        initialSettingsState.modId,
      );
    });
  });

  describe('appReset$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(EMPTY);
      actions = new ReplaySubject(1);
      actions.next(reset());
      effects.appReset$.subscribe();
      expect(dataSvc.requestData).toHaveBeenCalledWith(
        initialSettingsState.modId,
      );
    });
  });

  describe('setModId$', () => {
    it('should reset and load mod for new mod', () => {
      spyOn(dataSvc, 'requestData').and.returnValue(EMPTY);
      actions = new ReplaySubject(1);
      actions.next(setMod({ modId: Mocks.mod.id }));
      effects.setModId$.subscribe();
      expect(dataSvc.requestData).toHaveBeenCalledWith(Mocks.mod.id);
    });
  });
});
