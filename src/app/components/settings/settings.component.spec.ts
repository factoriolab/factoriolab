import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore } from '@ngrx/store/testing';
import { Confirmation } from 'primeng/api';

import {
  DispatchTest,
  ItemId,
  Mocks,
  TestModule,
  TestUtility,
} from 'src/tests';
import { Game } from '~/models';
import { ContentService } from '~/services';
import { App, LabState, Machines, Preferences, Settings } from '~/store';
import { BrowserUtility } from '~/utilities';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;
  let contentSvc: ContentService;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    router = TestBed.inject(Router);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(
      Preferences.getStates,
      Mocks.PreferencesState.states
    );
    contentSvc = TestBed.inject(ContentService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
  });

  describe('buildMachineMenus', () => {
    it('should set up actions for each machine preference', () => {
      const result = component.buildMachineMenus(
        [
          '',
          ItemId.AssemblingMachine1,
          ItemId.AssemblingMachine2,
          ItemId.ElectricMiningDrill,
        ],
        Mocks.Dataset
      );
      expect(result.length).toEqual(4);
      const middle = result[2];
      spyOn(component, 'raiseMachine');
      middle[0].command!();
      expect(component.raiseMachine).toHaveBeenCalled();
      spyOn(component, 'lowerMachine');
      middle[1].command!();
      expect(component.lowerMachine).toHaveBeenCalled();
    });
  });

  describe('clickResetSettings', () => {
    it('should set up a confirmation dialog and clear settings', () => {
      let confirm: Confirmation | undefined;
      spyOn(contentSvc, 'confirm').and.callFake((c) => (confirm = c));
      component.clickResetSettings();
      TestUtility.assert(confirm?.accept != null);
      spyOn(localStorage, 'clear');
      spyOn(component, 'resetSettings');
      confirm.accept();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(component.resetSettings).toHaveBeenCalled();
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
      component.stateCtrl.setValue(id);
      component.editState = true;
      spyOnProperty(BrowserUtility, 'search').and.returnValue(value);
      component.clickSaveState();
      expect(component.saveState).toHaveBeenCalledWith(id, value);
      expect(component.editState).toBeFalse();
    });
  });

  describe('clickDeleteState', () => {
    it('should emit to remove the state', () => {
      spyOn(component, 'removeState');
      component.state = id;
      component.clickDeleteState();
      expect(component.removeState).toHaveBeenCalledWith(id);
      expect(component.state).toEqual('');
    });
  });

  describe('openEditState', () => {
    it('should start the editing state', () => {
      spyOn(component.stateCtrl, 'setValue');
      spyOn(component.stateCtrl, 'markAsPristine');
      component.state = id;
      component.openEditState();
      expect(component.stateCtrl.setValue).toHaveBeenCalledWith(id);
      expect(component.stateCtrl.markAsPristine).toHaveBeenCalled();
      expect(component.editState).toBeTrue();
    });
  });

  describe('setGame', () => {
    it('should map a game to its default mod id', () => {
      spyOn(component, 'setMod');
      component.setGame(Game.Factorio);
      expect(component.setMod).toHaveBeenCalledWith('1.1');
    });
  });

  describe('changeBeaconModuleRank', () => {
    it('should set the defaults for the default machine', () => {
      spyOn(component, 'setBeaconModuleRank');
      component.changeBeaconModuleRank('', [], {
        beaconModuleId: 'beaconModuleId',
      } as any);
      expect(component.setBeaconModuleRank).toHaveBeenCalledWith(
        '',
        [],
        ['beaconModuleId']
      );
    });

    it('should set the defaults for a specific machine', () => {
      spyOn(component, 'setBeaconModuleRank');
      component.changeBeaconModuleRank(ItemId.AssemblingMachine1, [], {
        beaconModuleRankIds: ['beaconModuleId'],
      } as any);
      expect(component.setBeaconModuleRank).toHaveBeenCalledWith(
        ItemId.AssemblingMachine1,
        [],
        ['beaconModuleId']
      );
    });
  });

  describe('toggleBeaconReceivers', () => {
    it('should turn off beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconReceivers(false);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(null);
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconReceivers(true);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith('1');
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.void('resetSettings', App.ResetAction);
    dispatch.idVal('saveState', Preferences.SaveStateAction);
    dispatch.val('removeState', Preferences.RemoveStateAction);
    dispatch.val('setMod', Settings.SetModAction);
    dispatch.valDef('setDisabledRecipes', Settings.SetDisabledRecipesAction);
    dispatch.val('setNetProductionOnly', Settings.SetNetProductionOnlyAction);
    dispatch.val('setPreset', Settings.SetPresetAction);
    dispatch.valDef('removeMachine', Machines.RemoveAction);
    dispatch.idValDef('setMachine', Machines.SetMachineAction);
    dispatch.idValDef('setModuleRank', Machines.SetModuleRankAction);
    dispatch.idValDef('setOverclock', Machines.SetOverclockAction);
    dispatch.valDef('raiseMachine', Machines.RaiseAction);
    dispatch.valDef('lowerMachine', Machines.LowerAction);
    dispatch.idValDef('setBeaconCount', Machines.SetBeaconCountAction);
    dispatch.idValDef('setBeacon', Machines.SetBeaconAction);
    dispatch.idValDef(
      'setBeaconModuleRank',
      Machines.SetBeaconModuleRankAction
    );
    dispatch.valDef('addMachine', Machines.AddAction);
    dispatch.val('setBeaconReceivers', Settings.SetBeaconReceiversAction);
    dispatch.val('setProliferatorSpray', Settings.SetProliferatorSprayAction);
    dispatch.valDef('setBelt', Settings.SetBeltAction);
    dispatch.valDef('setPipe', Settings.SetPipeAction);
    dispatch.valDef('setCargoWagon', Settings.SetCargoWagonAction);
    dispatch.valDef('setFluidWagon', Settings.SetFluidWagonAction);
    dispatch.valDef('setFuel', Settings.SetFuelAction);
    dispatch.val('setFlowRate', Settings.SetFlowRateAction);
    dispatch.val('setInserterTarget', Settings.SetInserterTargetAction);
    dispatch.val('setMiningBonus', Settings.SetMiningBonusAction);
    dispatch.val('setResearchSpeed', Settings.SetResearchSpeedAction);
    dispatch.val('setInserterCapacity', Settings.SetInserterCapacityAction);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
    dispatch.val('setPowerUnit', Preferences.SetPowerUnitAction);
    dispatch.val('setLanguage', Preferences.SetLanguageAction);
    dispatch.val('setTheme', Preferences.SetThemeAction);
    dispatch.val('setSimplexType', Preferences.SetSimplexTypeAction);
    dispatch.val('setBypassLanding', Preferences.SetBypassLandingAction);
  });
});
