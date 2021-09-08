import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import {
  ColumnsComponent,
  IconComponent,
  InputComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from '~/components';
import { Game } from '~/models';
import { RouterService } from '~/services';
import { reducers, metaReducers } from '~/store';
import { initialColumnsState } from '~/store/preferences';
import { ValidateNumberDirective } from '~/support';
import { BrowserUtility } from '~/utilities';
import { SettingsComponent } from './settings.component';

enum DataTest {
  FlowRate = 'lab-settings-flow-rate',
  MiningBonus = 'lab-settings-mining-bonus',
}

@Component({
  selector: 'lab-test-settings',
  template: `
    <lab-settings
      [data]="data"
      [base]="base"
      [factories]="factories"
      [settings]="settings"
      [preferences]="preferences"
      [columns]="columns"
      (resetSettings)="resetSettings()"
      (closeSettings)="closeSettings()"
      (saveState)="saveState($event)"
      (removeState)="removeState($event)"
      (setPreset)="setPreset($event)"
      (setBase)="setBase($event)"
      (setDisabledRecipes)="setDisabledRecipes($event)"
      (setExpensive)="setExpensive($event)"
      (addFactory)="addFactory($event)"
      (removeFactory)="removeFactory($event)"
      (raiseFactory)="raiseFactory($event)"
      (setFactory)="setFactory($event)"
      (setModuleRank)="setModuleRank($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (setBeacon)="setBeacon($event)"
      (setBeaconModule)="setBeaconModule($event)"
      (setOverclock)="setOverclock($event)"
      (setBeaconReceivers)="setBeaconReceivers($event)"
      (setBelt)="setBelt($event)"
      (setPipe)="setPipe($event)"
      (setFuel)="setFuel($event)"
      (setFlowRate)="setFlowRate($event)"
      (setCargoWagon)="setCargoWagon($event)"
      (setFluidWagon)="setFluidWagon($event)"
      (setMiningBonus)="setMiningBonus($event)"
      (setResearchSpeed)="setResearchSpeed($event)"
      (setInserterTarget)="setInserterTarget($event)"
      (setInserterCapacity)="setInserterCapacity($event)"
      (setDisplayRate)="setDisplayRate($event)"
      (setColumns)="setColumns($event)"
    >
    </lab-settings>
  `,
})
class TestSettingsComponent {
  @ViewChild(SettingsComponent) child: SettingsComponent;
  data = Mocks.Data;
  base = Mocks.Raw.base;
  factories = Mocks.FactorySettingsInitial;
  settings = Mocks.SettingsState1;
  preferences = Mocks.Preferences;
  columns = initialColumnsState;
  resetSettings(): void {}
  closeSettings(): void {}
  saveState(data): void {}
  removeState(data): void {}
  setPreset(data): void {}
  setBase(data): void {}
  setDisabledRecipes(data): void {}
  setExpensive(data): void {}
  addFactory(data): void {}
  removeFactory(data): void {}
  raiseFactory(data): void {}
  setFactory(data): void {}
  setModuleRank(data): void {}
  setBeaconCount(data): void {}
  setBeacon(data): void {}
  setBeaconModule(data): void {}
  setOverclock(data): void {}
  setBeaconReceivers(data): void {}
  setBelt(data): void {}
  setPipe(data): void {}
  setFuel(data): void {}
  setFlowRate(data): void {}
  setCargoWagon(data): void {}
  setFluidWagon(data): void {}
  setMiningBonus(data): void {}
  setResearchSpeed(data): void {}
  setInserterTarget(data): void {}
  setInserterCapacity(data): void {}
  setDisplayRate(data): void {}
  setColumns(data): void {}
}

describe('SettingsComponent', () => {
  let component: TestSettingsComponent;
  let fixture: ComponentFixture<TestSettingsComponent>;
  let router: Router;
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
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      declarations: [
        ColumnsComponent,
        IconComponent,
        InputComponent,
        OptionsComponent,
        RankerComponent,
        SelectComponent,
        ToggleComponent,
        ValidateNumberDirective,
        SettingsComponent,
        TestSettingsComponent,
      ],
      providers: [RouterService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSettingsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    fixture.detectChanges();
    history.replaceState(null, null, '');
  });

  afterEach(() => {
    history.replaceState(null, null, '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle no fuels', () => {
    component.child.data = {} as any;
    expect(component.child.sortedFuels).toEqual([]);
  });

  describe('factoryRows', () => {
    it('should add empty string to list of ids', () => {
      expect(component.child.factoryRows).toEqual([
        '',
        ...Mocks.FactorySettingsInitial.ids,
      ]);
    });
  });

  describe('factoryOptions', () => {
    it('should filter for factories that have not been added', () => {
      const result = component.child.factoryOptions;
      expect(result.length).toBeLessThan(component.data.factoryIds.length);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('savedStates', () => {
    it('should map saved states to an array of options', () => {
      expect(component.child.savedStates).toEqual([
        { id: 'name', name: 'name' },
      ]);
    });
  });

  describe('ngOnInit', () => {
    it('should ignore if no matching state is found', () => {
      expect(component.child.state).toEqual('');
    });

    it('should set state to matching saved state', () => {
      spyOnProperty(BrowserUtility, 'search').and.returnValue('z=zip');
      component.child.ngOnInit();
      expect(component.child.state).toEqual('name');
    });

    it('should set up subscription to router', () => {
      fixture.ngZone.run(() => {
        router.navigate([]);
      });
      fixture.detectChanges();
      expect(detectChanges).toHaveBeenCalled();
    });
  });

  describe('scroll', () => {
    it('should detect changes on scroll', () => {
      component.child.scroll();
      expect(detectChanges).toHaveBeenCalled();
    });
  });

  describe('setGame', () => {
    it('should select the baseId for Factorio', () => {
      spyOn(component, 'setBase');
      component.child.setGame(Game.Factorio);
      expect(component.setBase).toHaveBeenCalledWith('1.1');
    });

    it('should select the baseId for Dyson Sphere Program', () => {
      spyOn(component, 'setBase');
      component.child.setGame(Game.DysonSphereProgram);
      expect(component.setBase).toHaveBeenCalledWith('dsp');
    });

    it('should select the baseId for Satisfactory', () => {
      spyOn(component, 'setBase');
      component.child.setGame(Game.Satisfactory);
      expect(component.setBase).toHaveBeenCalledWith('sfy');
    });
  });

  describe('changeBeaconCount', () => {
    it('should emit beacon count', () => {
      spyOn(component, 'setBeaconCount');
      component.child.changeBeaconCount('', '3');
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: '',
        value: '3',
        def: '8',
      });
    });

    it('should emit beacon count on specific factory', () => {
      spyOn(component, 'setBeaconCount');
      component.child.changeBeaconCount(ItemId.AssemblingMachine3, '3');
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: ItemId.AssemblingMachine3,
        value: '3',
        def: '8',
      });
    });
  });

  describe('changeOverclock', () => {
    it('should emit overclock', () => {
      spyOn(component, 'setOverclock');
      component.child.changeOverclock('', {
        target: { valueAsNumber: 200 },
      } as any);
      expect(component.setOverclock).toHaveBeenCalledWith({
        id: '',
        value: 200,
        def: 100,
      });
    });

    it('should emit overclock on specific factory', () => {
      spyOn(component, 'setOverclock');
      component.child.changeOverclock(ItemId.AssemblingMachine3, {
        target: { valueAsNumber: 200 },
      } as any);
      expect(component.setOverclock).toHaveBeenCalledWith({
        id: ItemId.AssemblingMachine3,
        value: 200,
        def: null,
      });
    });

    it('should ignore bad values', () => {
      spyOn(component, 'setOverclock');
      component.child.changeOverclock('', {
        target: { valueAsNumber: 260 },
      } as any);
      expect(component.setOverclock).not.toHaveBeenCalled();
    });
  });

  describe('emitNumber', () => {
    it('should emit flow rate', () => {
      spyOn(component, 'setFlowRate');
      TestUtility.setTextDt(fixture, DataTest.FlowRate, '1000');
      fixture.detectChanges();
      expect(component.setFlowRate).toHaveBeenCalledWith(1000);
    });

    it('should emit mining bonus', () => {
      spyOn(component, 'setMiningBonus');
      TestUtility.setTextDt(fixture, DataTest.MiningBonus, '100');
      fixture.detectChanges();
      expect(component.setMiningBonus).toHaveBeenCalledWith(100);
    });

    it('should not emit a number less than the minimum', () => {
      spyOn(component, 'setMiningBonus');
      TestUtility.setTextDt(fixture, DataTest.MiningBonus, '-10');
      fixture.detectChanges();
      expect(component.setMiningBonus).not.toHaveBeenCalled();
    });
  });

  describe('setState', () => {
    it('should ignore falsy values', () => {
      spyOn(router, 'navigate');
      component.child.setState(null);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should call the router to navigate', () => {
      spyOn(router, 'navigate');
      component.child.setState('name');
      expect(component.child.state).toEqual('name');
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { z: 'zip' },
      });
    });
  });

  describe('clickSaveState', () => {
    it('should emit to save the state', () => {
      spyOn(component, 'saveState');
      component.child.tempState = id;
      component.child.editState = true;
      spyOnProperty(BrowserUtility, 'search').and.returnValue(value);
      component.child.clickSaveState();
      expect(component.saveState).toHaveBeenCalledWith({ id, value });
      expect(component.child.editState).toBeFalse();
    });
  });

  describe('clickRemoveState', () => {
    it('should emit to remove the state', () => {
      spyOn(component, 'removeState');
      component.child.state = id;
      component.child.state = id;
      component.child.clickRemoveState();
      expect(component.removeState).toHaveBeenCalledWith(id);
      expect(component.child.state).toEqual('');
    });
  });

  describe('toggleEditState', () => {
    it('should toggle the edit state', () => {
      component.child.toggleEditState();
      expect(component.child.editState).toBeTrue();
      expect(component.child.tempState).toEqual(component.child.state);
    });
  });

  describe('clickResetSettings', () => {
    it('should cancel if user does not confirm', () => {
      spyOn(component, 'resetSettings');
      spyOn(window, 'confirm').and.returnValue(false);
      component.child.clickResetSettings();
      expect(window.confirm).toHaveBeenCalled();
      expect(component.resetSettings).not.toHaveBeenCalled();
    });

    it('should emit to reset settings if user confirms', () => {
      spyOn(component, 'resetSettings');
      spyOn(window, 'confirm').and.returnValue(true);
      component.child.clickResetSettings();
      expect(window.confirm).toHaveBeenCalled();
      expect(component.resetSettings).toHaveBeenCalled();
    });
  });

  describe('gtZero', () => {
    it('should handle valid values', () => {
      expect(component.child.gtZero('0')).toBeFalse();
      expect(component.child.gtZero('0.5')).toBeTrue();
    });

    it('should handle invalid value', () => {
      expect(component.child.gtZero('x')).toBeFalse();
    });
  });

  describe('toggleBeaconPower', () => {
    it('should turn off beacon power estimation', () => {
      component.child.settings = {
        ...component.child.settings,
        ...{ beaconReceivers: '1' },
      };
      spyOn(component, 'setBeaconReceivers');
      component.child.toggleBeaconPower();
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(null);
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.child.toggleBeaconPower();
      expect(component.setBeaconReceivers).toHaveBeenCalledWith('1');
    });
  });
});
