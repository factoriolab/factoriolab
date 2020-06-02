import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import * as Mocks from 'src/mocks';
import { IconComponent } from '~/components';
import { Id, Theme } from '~/models';
import { SettingsState, initialSettingsState } from '~/store/settings';
import { TestUtility } from '~/utilities/test';
import { SettingsComponent } from './settings.component';

@Component({
  selector: 'lab-test-settings',
  template: `
    <lab-settings
      [settings]="settings"
      [data]="data"
      (setDisplayRate)="setDisplayRate($event)"
      (setItemPrecision)="setItemPrecision($event)"
      (setBeltPrecision)="setBeltPrecision($event)"
      (setFactoryPrecision)="setFactoryPrecision($event)"
      (setBelt)="setBelt($event)"
      (setAssembler)="setAssembler($event)"
      (setFurnace)="setFurnace($event)"
      (setOilRecipe)="setOilRecipe($event)"
      (setFuel)="setFuel($event)"
      (setProdModule)="setProdModule($event)"
      (setSpeedModule)="setSpeedModule($event)"
      (setBeaconModule)="setBeaconModule($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (setTheme)="setTheme($event)"
    >
    </lab-settings>
  `,
})
class TestSettingsComponent {
  @ViewChild(SettingsComponent) child: SettingsComponent;
  settings: SettingsState = initialSettingsState;
  data = Mocks.Data;
  setDisplayRate(data) {}
  setItemPrecision(data) {}
  setBeltPrecision(data) {}
  setFactoryPrecision(data) {}
  setBelt(data) {}
  setAssembler(data) {}
  setFurnace(data) {}
  setOilRecipe(data) {}
  setFuel(data) {}
  setProdModule(data) {}
  setSpeedModule(data) {}
  setBeaconModule(data) {}
  setBeaconCount(data) {}
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

  it('should watch the scroll position', () => {
    const scrollTop = 10;
    component.child.scroll({ target: { scrollTop } } as any);
    expect(component.child.scrollTop).toEqual(scrollTop);
  });

  it('should emit numeric settings', () => {
    spyOn(component, 'setItemPrecision');
    TestUtility.selectId(fixture, Id.SettingsPrecisionItemValue, '3');
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
    TestUtility.selectId(fixture, Id.SettingsThemeSelect, Theme.LightMode);
    fixture.detectChanges();
    expect(component.setTheme).toHaveBeenCalledWith(Theme.LightMode);
  });

  it('should ignore falsy event values', () => {
    spyOn(component, 'setTheme');
    const event = { target: {} };
    component.child.emitAny(component.child.setTheme, event as any);
    fixture.detectChanges();
    expect(component.setTheme).not.toHaveBeenCalled();
  });
});
