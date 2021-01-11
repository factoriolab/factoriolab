import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { Mocks, TestUtility } from 'src/tests';
import {
  IconComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from '~/components';
import { SettingsComponent } from './settings.component';

enum DataTest {
  Beacons = 'lab-settings-beacons',
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
      (resetSettings)="resetSettings()"
      (closeSettings)="closeSettings()"
      (saveState)="saveState($event)"
      (deleteState)="deleteState($event)"
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
      (setBelt)="setBelt($event)"
      (setFuel)="setFuel($event)"
      (setFlowRate)="setFlowRate($event)"
      (setMiningBonus)="setMiningBonus($event)"
      (setResearchSpeed)="setResearchSpeed($event)"
      (setInserterTarget)="setInserterTarget($event)"
      (setInserterCapacity)="setInserterCapacity($event)"
      (setDisplayRate)="setDisplayRate($event)"
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
  resetSettings(): void {}
  closeSettings(): void {}
  saveState(data): void {}
  deleteState(data): void {}
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
  setBelt(data): void {}
  setFuel(data): void {}
  setFlowRate(data): void {}
  setMiningBonus(data): void {}
  setResearchSpeed(data): void {}
  setInserterTarget(data): void {}
  setInserterCapacity(data): void {}
  setDisplayRate(data): void {}
}

describe('SettingsComponent', () => {
  let component: TestSettingsComponent;
  let fixture: ComponentFixture<TestSettingsComponent>;
  let router: Router;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [
        IconComponent,
        OptionsComponent,
        RankerComponent,
        SelectComponent,
        ToggleComponent,
        SettingsComponent,
        TestSettingsComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSettingsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
    history.replaceState(null, null, '');
  });

  afterEach(() => {
    history.replaceState(null, null, '');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort the list of fuels', () => {
    expect(component.child.sortedFuels.length).toBeGreaterThan(1);
    expect(component.child.sortedFuels).not.toEqual(Mocks.Data.fuelIds);
  });

  describe('hash', () => {
    it('should handle no hash in url', () => {
      expect(component.child.hash).toEqual('');
    });

    it('should strip the hash character off the hash', () => {
      location.hash = 'test';
      expect(component.child.hash).toEqual('test');
    });
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
      location.hash = 'hash';
      component.child.ngOnInit();
      expect(component.child.state).toEqual('name');
    });

    it('should set up subscription to router', () => {
      const ref = 'ref';
      spyOn(component.child[ref], 'detectChanges');
      fixture.ngZone.run(() => {
        router.navigate([]);
      });
      fixture.detectChanges();
      expect(component.child[ref].detectChanges).toHaveBeenCalled();
    });
  });

  describe('scroll', () => {
    it('should detect changes on scroll', () => {
      spyOn(component.child.ref, 'detectChanges');
      component.child.scroll();
      expect(component.child.ref.detectChanges).toHaveBeenCalled();
    });
  });

  describe('trackBy', () => {
    it('should return the key of the keyvalue', () => {
      expect(component.child.trackBy({ key: id, value })).toEqual(id);
    });
  });

  describe('changeBeaconCount', () => {
    it('should emit beacon count', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.setTextDt(fixture, DataTest.Beacons, '3');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: '',
        value: 3,
      });
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
        fragment: 'hash',
      });
    });
  });

  describe('clickSaveState', () => {
    it('should emit to save the state', () => {
      spyOn(component, 'saveState');
      component.child.tempState = id;
      component.child.editState = true;
      location.hash = value;
      component.child.clickSaveState();
      expect(component.saveState).toHaveBeenCalledWith({ id, value });
      expect(component.child.editState).toBeFalse();
    });
  });

  describe('clickDeleteState', () => {
    it('should emit to delete the state', () => {
      spyOn(component, 'deleteState');
      component.child.state = id;
      component.child.state = id;
      component.child.clickDeleteState();
      expect(component.deleteState).toHaveBeenCalledWith(id);
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
});
