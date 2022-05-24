import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';

import {
  DispatchTest,
  ItemId,
  Mocks,
  TestModule,
  TestUtility,
} from 'src/tests';
import { Entities, Game } from '~/models';
import { SharedModule } from '~/shared/shared.module';
import { LabState } from '~/store';
import * as App from '~/store/app.actions';
import * as Factories from '~/store/factories';
import * as Preferences from '~/store/preferences';
import * as Settings from '~/store/settings';
import { BrowserUtility } from '~/utilities';
import { SettingsComponent } from './settings.component';

enum DataTest {
  FlowRate = 'lab-settings-flow-rate',
  MiningBonus = 'lab-settings-mining-bonus',
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;
  let mockGetStates: MemoizedSelector<LabState, Entities>;
  let detectChanges: jasmine.Spy;
  let translateSvc: TranslateService;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [TestModule, SharedModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    router = TestBed.inject(Router);
    mockStore = TestBed.inject(MockStore);
    mockGetStates = mockStore.overrideSelector(
      Preferences.getStates,
      Mocks.PreferencesState.states
    );
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    translateSvc = TestBed.inject(TranslateService);
    component = fixture.componentInstance;
    mockStore.refreshState();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isInOverlayMode', () => {
    it('should determine whether in overlay mode', () => {
      expect(component.isInOverlayMode).toBeFalse();
    });
  });

  describe('ngOnInit', () => {
    it('should ignore if no matching state is found', () => {
      expect(component.state).toEqual('');
    });

    it('should set state to matching saved state', () => {
      spyOnProperty(BrowserUtility, 'search').and.returnValue('z=zip');
      component.ngOnInit();
      expect(component.state).toEqual('name');
    });

    it('should set up subscription to router', () => {
      fixture.ngZone!.run(() => {
        router.navigate([]);
      });
      fixture.detectChanges();
      expect(detectChanges).toHaveBeenCalled();
    });
  });

  describe('scroll', () => {
    it('should detect changes on scroll', () => {
      component.scroll();
      expect(detectChanges).toHaveBeenCalled();
    });
  });

  describe('click', () => {
    it('should set opening to false on first click', () => {
      spyOn(component.closeSettings, 'emit');
      document.body.click();
      expect(component.opening).toBeFalse();
      expect(component.closeSettings.emit).not.toHaveBeenCalled();
    });

    it('should cancel when clicked away in overlay mode', () => {
      spyOn(component.closeSettings, 'emit');
      spyOnProperty(component, 'isInOverlayMode', 'get').and.returnValue(true);
      component.opening = false;
      document.body.click();
      expect(component.closeSettings.emit).toHaveBeenCalled();
    });

    it('should not cancel when clicked away in wide screen mode', () => {
      spyOn(component.closeSettings, 'emit');
      spyOnProperty(component, 'isInOverlayMode', 'get').and.returnValue(false);
      component.opening = false;
      document.body.click();
      expect(component.closeSettings.emit).not.toHaveBeenCalled();
    });

    it('should not cancel when clicked on', () => {
      spyOn(component.closeSettings, 'emit');
      component.opening = false;
      TestUtility.clickSelector(fixture, '.panel');
      expect(component.closeSettings.emit).not.toHaveBeenCalled();
    });
  });

  describe('setGame', () => {
    it('should select the modId for Factorio', () => {
      spyOn(component, 'setMod');
      component.setGame(Game.Factorio);
      expect(component.setMod).toHaveBeenCalledWith('1.1');
    });

    it('should select the modId for Dyson Sphere Program', () => {
      spyOn(component, 'setMod');
      component.setGame(Game.DysonSphereProgram);
      expect(component.setMod).toHaveBeenCalledWith('dsp');
    });

    it('should select the modId for Satisfactory', () => {
      spyOn(component, 'setMod');
      component.setGame(Game.Satisfactory);
      expect(component.setMod).toHaveBeenCalledWith('sfy');
    });
  });

  describe('changeBeaconCount', () => {
    it('should emit beacon count', () => {
      spyOn(component, 'setBeaconCount');
      component.changeBeaconCount(
        '',
        '3',
        Mocks.FactorySettingsInitial,
        Mocks.AdjustedData
      );
      expect(component.setBeaconCount).toHaveBeenCalledWith('', '3', '8');
    });

    it('should emit beacon count on specific factory', () => {
      spyOn(component, 'setBeaconCount');
      component.changeBeaconCount(
        ItemId.AssemblingMachine3,
        '3',
        Mocks.FactorySettingsInitial,
        Mocks.AdjustedData
      );
      expect(component.setBeaconCount).toHaveBeenCalledWith(
        ItemId.AssemblingMachine3,
        '3',
        '8'
      );
    });
  });

  describe('changeOverclock', () => {
    it('should emit overclock', () => {
      spyOn(component, 'setOverclock');
      component.changeOverclock(
        '',
        {
          target: { valueAsNumber: 200 },
        } as any,
        Mocks.FactorySettingsInitial
      );
      expect(component.setOverclock).toHaveBeenCalledWith('', 200, 100);
    });

    it('should emit overclock on specific factory', () => {
      spyOn(component, 'setOverclock');
      component.changeOverclock(
        ItemId.AssemblingMachine3,
        {
          target: { valueAsNumber: 200 },
        } as any,
        Mocks.FactorySettingsInitial
      );
      expect(component.setOverclock).toHaveBeenCalledWith(
        ItemId.AssemblingMachine3,
        200,
        undefined
      );
    });
  });

  describe('emitNumber', () => {
    it('should emit a numeric value', () => {
      spyOn(component, 'setFlowRate');
      TestUtility.setTextDt(fixture, DataTest.FlowRate, '1000');
      fixture.detectChanges();
      expect(component.setFlowRate).toHaveBeenCalledWith(1000);
    });

    it('should not emit a number less than the minimum', () => {
      spyOn(component, 'setMiningBonus');
      TestUtility.setTextDt(fixture, DataTest.MiningBonus, '-10');
      fixture.detectChanges();
      expect(component.setMiningBonus).toHaveBeenCalledWith(0);
    });
  });

  describe('setState', () => {
    it('should call the router to navigate', () => {
      spyOn(router, 'navigate');
      component.setState('name', Mocks.PreferencesState);
      expect(component.state).toEqual('name');
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { z: 'zip' },
      });
    });
  });

  describe('clickSaveState', () => {
    it('should emit to save the state', () => {
      spyOn(component, 'saveState');
      component.tempState = id;
      component.editState = true;
      spyOnProperty(BrowserUtility, 'search').and.returnValue(value);
      component.clickSaveState();
      expect(component.saveState).toHaveBeenCalledWith(id, value);
      expect(component.editState).toBeFalse();
    });
  });

  describe('clickRemoveState', () => {
    it('should emit to remove the state', () => {
      spyOn(component, 'removeState');
      component.state = id;
      component.clickRemoveState();
      expect(component.removeState).toHaveBeenCalledWith(id);
      expect(component.state).toEqual('');
    });
  });

  describe('toggleEditState', () => {
    it('should toggle the edit state', () => {
      component.toggleEditState();
      expect(component.editState).toBeTrue();
      expect(component.tempState).toEqual(component.state);
    });
  });

  describe('clickResetSettings', () => {
    it('should emit to reset settings', () => {
      spyOn(component, 'resetSettings');
      spyOn(window, 'confirm').and.returnValue(true);
      component.clickResetSettings();
      expect(window.confirm).toHaveBeenCalled();
      expect(component.resetSettings).toHaveBeenCalled();
    });
  });

  describe('toggleBeaconPower', () => {
    it('should turn off beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconPower({
        ...Mocks.SettingsState1,
        ...{ beaconReceivers: '1' },
      });
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(null);
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconPower(Mocks.SettingsState1);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith('1');
    });
  });

  describe('changeLanguage', () => {
    it('should set the language in the translate service and emit', () => {
      spyOn(translateSvc, 'use');
      spyOn(component, 'setLanguage');
      component.changeLanguage('lang');
      expect(translateSvc.use).toHaveBeenCalledWith('lang');
      expect(component.setLanguage).toHaveBeenCalledWith('lang');
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.void('resetSettings', App.ResetAction);
    dispatch.idVal('saveState', Preferences.SaveStateAction);
    dispatch.val('removeState', Preferences.RemoveStateAction);
    dispatch.val('setPreset', Settings.SetPresetAction);
    dispatch.val('setMod', Settings.SetModAction);
    dispatch.valDef('setDisabledRecipes', Settings.SetDisabledRecipesAction);
    dispatch.valDef('addFactory', Factories.AddAction);
    dispatch.valDef('removeFactory', Factories.RemoveAction);
    dispatch.valDef('raiseFactory', Factories.RaiseAction);
    dispatch.idValDef('setFactory', Factories.SetFactoryAction);
    dispatch.idValDef('setModuleRank', Factories.SetModuleRankAction);
    dispatch.idValDef('setBeaconCount', Factories.SetBeaconCountAction);
    dispatch.idValDef('setBeacon', Factories.SetBeaconAction);
    dispatch.idValDef('setBeaconModule', Factories.SetBeaconModuleAction);
    dispatch.idValDef('setOverclock', Factories.SetOverclockAction);
    dispatch.val('setBeaconReceivers', Settings.SetBeaconReceiversAction);
    dispatch.valDef('setBelt', Settings.SetBeltAction);
    dispatch.valDef('setPipe', Settings.SetPipeAction);
    dispatch.valDef('setFuel', Settings.SetFuelAction);
    dispatch.val('setFlowRate', Settings.SetFlowRateAction);
    dispatch.valDef('setCargoWagon', Settings.SetCargoWagonAction);
    dispatch.valDef('setFluidWagon', Settings.SetFluidWagonAction);
    dispatch.val('setInserterTarget', Settings.SetInserterTargetAction);
    dispatch.val('setMiningBonus', Settings.SetMiningBonusAction);
    dispatch.val('setResearchSpeed', Settings.SetResearchSpeedAction);
    dispatch.val('setInserterCapacity', Settings.SetInserterCapacityAction);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
    dispatch.val('setSimplex', Preferences.SetSimplexAction);
    dispatch.val('setLanguage', Preferences.SetLanguageAction);
    dispatch.val('setPowerUnit', Preferences.SetPowerUnitAction);
    dispatch.val('setProliferatorSpray', Settings.SetProliferatorSprayAction);
  });
});
