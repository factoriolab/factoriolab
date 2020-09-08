import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

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
}

describe('SettingsComponent', () => {
  let component: TestSettingsComponent;
  let fixture: ComponentFixture<TestSettingsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort the list of fuels', () => {
    expect(component.child.sortedFuels.length).toBeGreaterThan(1);
    expect(component.child.sortedFuels).not.toEqual(Mocks.Data.fuelIds);
  });

  it('should detect changes on scroll', () => {
    const ref = 'ref';
    spyOn(component.child[ref], 'detectChanges');
    component.child.scroll();
    expect(component.child[ref].detectChanges).toHaveBeenCalled();
  });

  it('should emit beacon count', () => {
    spyOn(component, 'setBeaconCount');
    TestUtility.selectId(fixture, ElementId.SettingsBeaconCount, '3');
    fixture.detectChanges();
    expect(component.setBeaconCount).toHaveBeenCalledWith({
      value: 3,
      default: 8,
    });
  });

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
