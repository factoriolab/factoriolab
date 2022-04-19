import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TestUtility, ItemId, initialState, Mocks } from 'src/tests';
import {
  ColumnsComponent,
  IconComponent,
  InfoComponent,
  InputComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from '~/components';
import { ValidateNumberDirective } from '~/directives';
import {
  DisplayRate,
  Game,
  InserterCapacity,
  InserterTarget,
  PowerUnit,
  Preset,
  ResearchSpeed,
} from '~/models';
import { GtZeroPipe } from '~/pipes';
import { RouterService } from '~/services';
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
  let store: MockStore;
  let detectChanges: jasmine.Spy;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [
        ColumnsComponent,
        IconComponent,
        InfoComponent,
        InputComponent,
        OptionsComponent,
        RankerComponent,
        SelectComponent,
        ToggleComponent,
        ValidateNumberDirective,
        GtZeroPipe,
        SettingsComponent,
      ],
      providers: [RouterService, provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    component = fixture.componentInstance;
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
      Preferences.getStates.setResult(Mocks.PreferencesState.states);
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
    it('should select the baseId for Factorio', () => {
      spyOn(component, 'setBase');
      component.setGame(Game.Factorio);
      expect(component.setBase).toHaveBeenCalledWith('1.1');
    });

    it('should select the baseId for Dyson Sphere Program', () => {
      spyOn(component, 'setBase');
      component.setGame(Game.DysonSphereProgram);
      expect(component.setBase).toHaveBeenCalledWith('dsp');
    });

    it('should select the baseId for Satisfactory', () => {
      spyOn(component, 'setBase');
      component.setGame(Game.Satisfactory);
      expect(component.setBase).toHaveBeenCalledWith('sfy');
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
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(undefined);
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconPower(Mocks.SettingsState1);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith('1');
    });
  });

  it('should dispatch actions', () => {
    spyOn(store, 'dispatch');
    component.resetSettings();
    expect(store.dispatch).toHaveBeenCalledWith(new App.ResetAction());
    component.saveState('id', 'value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.SaveStateAction({ id: 'id', value: 'value' })
    );
    component.removeState('value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.RemoveStateAction('value')
    );
    component.setPreset(Preset.Beacon12);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetPresetAction(Preset.Beacon12)
    );
    component.setBase('value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBaseAction('value')
    );
    component.setDisabledRecipes(['value'], ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisabledRecipesAction({ value: ['value'], def: ['def'] })
    );
    component.setExpensive(true);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetExpensiveAction(true)
    );
    component.addFactory('value', ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.AddAction({ value: 'value', def: ['def'] })
    );
    component.removeFactory('value', ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.RemoveAction({ value: 'value', def: ['def'] })
    );
    component.raiseFactory('value', ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.RaiseAction({ value: 'value', def: ['def'] })
    );
    component.setFactory('id', 'value', ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetFactoryAction({ id: 'id', value: 'value', def: ['def'] })
    );
    component.setModuleRank('id', ['value'], ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetModuleRankAction({
        id: 'id',
        value: ['value'],
        def: ['def'],
      })
    );
    component.setBeaconCount('id', 'value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetBeaconCountAction({
        id: 'id',
        value: 'value',
        def: 'def',
      })
    );
    component.setBeacon('id', 'value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetBeaconAction({ id: 'id', value: 'value', def: 'def' })
    );
    component.setBeaconModule('id', 'value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetBeaconModuleAction({
        id: 'id',
        value: 'value',
        def: 'def',
      })
    );
    component.setOverclock('id', 0, 1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Factories.SetOverclockAction({ id: 'id', value: 0, def: 1 })
    );
    component.setBeaconReceivers('value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeaconReceiversAction('value')
    );
    component.setBelt('value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeltAction({ value: 'value', def: 'def' })
    );
    component.setPipe('value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetPipeAction({ value: 'value', def: 'def' })
    );
    component.setFuel('value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFuelAction({ value: 'value', def: 'def' })
    );
    component.setFlowRate(0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFlowRateAction(0)
    );
    component.setCargoWagon('value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetCargoWagonAction({ value: 'value', def: 'def' })
    );
    component.setFluidWagon('value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFluidWagonAction({ value: 'value', def: 'def' })
    );
    component.setInserterTarget(InserterTarget.Chest);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetInserterTargetAction(InserterTarget.Chest)
    );
    component.setMiningBonus(0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetMiningBonusAction(0)
    );
    component.setResearchSpeed(ResearchSpeed.Speed0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetResearchSpeedAction(ResearchSpeed.Speed0)
    );
    component.setInserterCapacity(InserterCapacity.Capacity0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetInserterCapacityAction(InserterCapacity.Capacity0)
    );
    component.setDisplayRate(DisplayRate.PerHour, DisplayRate.PerMinute);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisplayRateAction({
        value: DisplayRate.PerHour,
        prev: DisplayRate.PerMinute,
      })
    );
    component.setSimplex(true);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.SetSimplexAction(true)
    );
    component.setPowerUnit(PowerUnit.GW);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Preferences.SetPowerUnitAction(PowerUnit.GW)
    );
    component.setProliferatorSpray('value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetProliferatorSprayAction('value')
    );
  });
});
