import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Mocks, TestUtility, ElementId } from 'src/tests';
import { IconComponent } from '~/components';
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
}

describe('SettingsComponent', () => {
  let component: TestSettingsComponent;
  let fixture: ComponentFixture<TestSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [IconComponent, SettingsComponent, TestSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect changes on scroll', () => {
    const ref = 'ref';
    spyOn(component.child[ref], 'detectChanges');
    component.child.scroll();
    expect(component.child[ref].detectChanges).toHaveBeenCalled();
  });

  it('should emit numeric settings', () => {
    spyOn(component, 'setItemPrecision');
    TestUtility.selectId(fixture, ElementId.SettingsPrecisionItemValue, '3');
    fixture.detectChanges();
    expect(component.setItemPrecision).toHaveBeenCalledWith(3);
  });

  it('should ignore invalid numeric events', () => {
    spyOn(component, 'setItemPrecision');
    const event = { target: {} };
    component.child.emitNumber(component.child.setItemPrecision, event as any);
    fixture.detectChanges();
    expect(component.setItemPrecision).not.toHaveBeenCalled();
  });

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
