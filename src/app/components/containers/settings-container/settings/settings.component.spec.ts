import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { Mocks, TestUtility, ElementId } from 'src/tests';
import { IconComponent, PrecisionComponent } from '~/components';
import { Theme } from '~/models';
import { SettingsComponent } from './settings.component';

@Component({
  selector: 'lab-test-settings',
  template: `
    <lab-settings
      [data]="data"
      [base]="base"
      [mods]="mods"
      [settings]="settings"
      (saveState)="saveState($event)"
      (deleteState)="deleteState($event)"
      (setPreset)="setPreset($event)"
      (setBase)="setBase($event)"
      (enableMod)="enableMod($event)"
      (disableMod)="disableMod($event)"
      (setBelt)="setBelt($event)"
      (setFuel)="setFuel($event)"
      (disableRecipe)="disableRecipe($event)"
      (enableRecipe)="enableRecipe($event)"
      (preferFactory)="preferFactory($event)"
      (dropFactory)="dropFactory($event)"
      (preferModule)="preferModule($event)"
      (dropModule)="dropModule($event)"
      (setBeaconModule)="setBeaconModule($event)"
      (setDisplayRate)="setDisplayRate($event)"
      (setItemPrecision)="setItemPrecision($event)"
      (setBeltPrecision)="setBeltPrecision($event)"
      (setFactoryPrecision)="setFactoryPrecision($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (setDrillModule)="setDrillModule($event)"
      (setMiningBonus)="setMiningBonus($event)"
      (setResearchSpeed)="setResearchSpeed($event)"
      (setFlowRate)="setFlowRate($event)"
      (setExpensive)="setExpensive($event)"
      (setTheme)="setTheme($event)"
      (resetSettings)="resetSettings($event)"
    >
    </lab-settings>
  `,
})
class TestSettingsComponent {
  @ViewChild(SettingsComponent) child: SettingsComponent;
  data = Mocks.Data;
  base = Mocks.Raw.base;
  mods = Mocks.Raw.mods;
  settings = Mocks.SettingsState1;
  saveState(data) {}
  deleteState(data) {}
  setPreset(data) {}
  setBase(data) {}
  enableMod(data) {}
  disableMod(data) {}
  setBelt(data) {}
  setFuel(data) {}
  disableRecipe(data) {}
  enableRecipe(data) {}
  preferFactory(data) {}
  dropFactory(data) {}
  preferModule(data) {}
  dropModule(data) {}
  setBeaconModule(data) {}
  setDisplayRate(data) {}
  setItemPrecision(data) {}
  setBeltPrecision(data) {}
  setFactoryPrecision(data) {}
  setBeaconCount(data) {}
  setDrillModule(data) {}
  setMiningBonus(data) {}
  setResearchSpeed(data) {}
  setFlowRate(data) {}
  setExpensive(data) {}
  setTheme(data) {}
  resetSettings() {}
}

describe('SettingsComponent', () => {
  let component: TestSettingsComponent;
  let fixture: ComponentFixture<TestSettingsComponent>;
  let router: Router;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [
        IconComponent,
        PrecisionComponent,
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

  describe('get', () => {
    it('should handle no hash in url', () => {
      expect(component.child.hash).toEqual('');
    });

    it('should strip the hash character off the hash', () => {
      location.hash = 'test';
      expect(component.child.hash).toEqual('test');
    });
  });

  describe('ngOnInit', () => {
    it('should ignore if no matching state is found', () => {
      expect(component.child.state).toEqual('');
    });

    it('should set state to matching saved state', () => {
      location.hash = value;
      component.settings = {
        ...Mocks.SettingsState1,
        ...{ states: { [id]: value } },
      };
      fixture.detectChanges();
      component.child.ngOnInit();
      expect(component.child.state).toEqual(id);
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
      const ref = 'ref';
      spyOn(component.child[ref], 'detectChanges');
      component.child.scroll();
      expect(component.child[ref].detectChanges).toHaveBeenCalled();
    });
  });

  describe('changeBeaconCount', () => {
    it('should emit beacon count', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.selectId(fixture, ElementId.SettingsBeaconCount, '3');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        value: 3,
        default: 8,
      });
    });
  });

  describe('emitNumber', () => {
    it('should emit numeric settings', () => {
      spyOn(component, 'setPreset');
      TestUtility.selectId(fixture, ElementId.SettingsPreset, '2');
      fixture.detectChanges();
      expect(component.setPreset).toHaveBeenCalledWith(2);
    });

    it('should ignore invalid numeric events', () => {
      spyOn(component, 'setPreset');
      const event = { target: {} };
      component.child.emitNumber(component.child.setPreset, event as any);
      fixture.detectChanges();
      expect(component.setPreset).not.toHaveBeenCalled();
    });
  });

  describe('emitString', () => {
    it('should emit other truthy settings', () => {
      spyOn(component, 'setTheme');
      TestUtility.selectId(
        fixture,
        ElementId.SettingsThemeSelect,
        Theme.LightMode
      );
      fixture.detectChanges();
      expect(component.setTheme).toHaveBeenCalledWith(Theme.LightMode);
    });

    it('should ignore falsy event values', () => {
      spyOn(component, 'setTheme');
      const event = { target: {} };
      component.child.emitString(component.child.setTheme, event as any);
      fixture.detectChanges();
      expect(component.setTheme).not.toHaveBeenCalled();
    });
  });

  describe('setState', () => {
    it('should ignore falsy values', () => {
      spyOn(router, 'navigate');
      const event: any = { target: { value: null } };
      component.child.setState(event);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should call the router to navigate', () => {
      spyOn(router, 'navigate');
      component.settings = {
        ...Mocks.SettingsState1,
        ...{ states: { [id]: value } },
      };
      fixture.detectChanges();
      const event: any = { target: { value: id } };
      component.child.setState(event);
      expect(router.navigate).toHaveBeenCalledWith([], {
        fragment: value,
      });
    });
  });

  describe('clickSaveState', () => {
    const event: any = { stopPropagation: () => {} };

    it('should emit to save the state', () => {
      spyOn(component, 'saveState');
      component.child.state = id;
      location.hash = value;
      component.child.clickSaveState(event);
      expect(component.saveState).toHaveBeenCalledWith({ id, value });
    });

    it('should set editState to false', () => {
      component.child.editState = true;
      component.child.clickSaveState(event);
      expect(component.child.editState).toBeFalse();
    });

    it('should stop propagation', () => {
      spyOn(event, 'stopPropagation');
      component.child.clickSaveState(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('clickDeleteState', () => {
    const event: any = { stopPropagation: () => {} };

    it('should emit to delete the state', () => {
      spyOn(component, 'deleteState');
      component.child.state = id;
      component.child.clickDeleteState(event);
      expect(component.deleteState).toHaveBeenCalledWith(id);
    });

    it('should set state to empty string', () => {
      component.child.state = id;
      component.child.clickDeleteState(event);
      expect(component.child.state).toEqual('');
    });

    it('should stop propagation', () => {
      spyOn(event, 'stopPropagation');
      component.child.clickDeleteState(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('toggleEditState', () => {
    const event: any = { stopPropagation: () => {} };

    it('should toggle the edit state', () => {
      component.child.toggleEditState(event);
      expect(component.child.editState).toBeTrue();
    });

    it('should stop propagation', () => {
      spyOn(event, 'stopPropagation');
      component.child.toggleEditState(event);
      expect(event.stopPropagation).toHaveBeenCalled();
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
