import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, TestModule } from 'src/tests';
import { App, Factories, LabState, Preferences, Settings } from '~/store';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.void('resetSettings', App.ResetAction);
    dispatch.idVal('saveState', Preferences.SaveStateAction);
    dispatch.val('removeState', Preferences.RemoveStateAction);
    dispatch.val('setMod', Settings.SetModAction);
    dispatch.valDef('setDisabledRecipes', Settings.SetDisabledRecipesAction);
    dispatch.val('setPreset', Settings.SetPresetAction);
    dispatch.valDef('removeFactory', Factories.RemoveAction);
    dispatch.idValDef('setFactory', Factories.SetFactoryAction);
    dispatch.idValDef('setModuleRank', Factories.SetModuleRankAction);
    dispatch.idValDef('setOverclock', Factories.SetOverclockAction);
    dispatch.valDef('raiseFactory', Factories.RaiseAction);
    dispatch.idValDef('setBeaconCount', Factories.SetBeaconCountAction);
    dispatch.idValDef('setBeacon', Factories.SetBeaconAction);
    dispatch.idValDef('setBeaconModule', Factories.SetBeaconModuleAction);
    dispatch.valDef('addFactory', Factories.AddAction);
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
  });
});
