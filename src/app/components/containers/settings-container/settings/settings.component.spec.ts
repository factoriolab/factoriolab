import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import * as Mocks from 'src/mocks';
import { IconComponent } from '~/components';
import { Id } from '~/models';
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
});
