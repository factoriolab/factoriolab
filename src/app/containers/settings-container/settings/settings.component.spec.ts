import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { IconComponent } from '~/components';
import { Id, DisplayRate } from '~/models';
import { SettingsState, initialSettingsState } from '~/store/settings';
import { TestUtility } from '~/utilities/test';
import { SettingsComponent } from './settings.component';

@Component({
  selector: 'lab-test-settings',
  template: `
    <lab-settings
      [settings]="settings"
      (setDisplayRate)="setDisplayRate($event)"
      (setItemPrecision)="setItemPrecision($event)"
      (setBeltPrecision)="setBeltPrecision($event)"
      (setFactoryPrecision)="setFactoryPrecision($event)"
    >
    </lab-settings>
  `,
})
class TestSettingsComponent {
  @ViewChild(SettingsComponent) child: SettingsComponent;
  settings: SettingsState = initialSettingsState;
  setDisplayRate(data) {}
  setItemPrecision(data) {}
  setBeltPrecision(data) {}
  setFactoryPrecision(data) {}
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

  describe('Display Rate', () => {
    it('should set the display rate', () => {
      spyOn(component, 'setDisplayRate');
      TestUtility.clickId(fixture, Id.SettingsDisplayRatePerSecond);
      expect(component.setDisplayRate).toHaveBeenCalledWith(
        DisplayRate.PerSecond
      );
    });
  });

  describe('Precision', () => {
    describe('Item', () => {
      it('should set item precision to decimals', () => {
        spyOn(component, 'setItemPrecision');
        TestUtility.clickId(fixture, Id.SettingsPrecisionItemDecimals);
        expect(component.setItemPrecision).toHaveBeenCalledWith(
          initialSettingsState.itemPrecision
        );
      });

      it('should not set item precision on invalid event', () => {
        spyOn(component, 'setItemPrecision');
        const event = { target: {} };
        component.child.itemPrecisionValue(event as any);
        fixture.detectChanges();
        expect(component.setItemPrecision).not.toHaveBeenCalled();
      });

      it('should set item precision to value', () => {
        spyOn(component, 'setItemPrecision');
        TestUtility.selectId(fixture, Id.SettingsPrecisionItemValue, '3');
        fixture.detectChanges();
        expect(component.setItemPrecision).toHaveBeenCalledWith(3);
      });

      it('should set item precision to fractions', () => {
        spyOn(component, 'setItemPrecision');
        TestUtility.clickId(fixture, Id.SettingsPrecisionItemFractions);
        expect(component.setItemPrecision).toHaveBeenCalledWith(null);
      });
    });

    describe('Belt', () => {
      it('should set belt precision to decimals', () => {
        spyOn(component, 'setBeltPrecision');
        TestUtility.clickId(fixture, Id.SettingsPrecisionBeltDecimals);
        expect(component.setBeltPrecision).toHaveBeenCalledWith(
          initialSettingsState.beltPrecision
        );
      });

      it('should not set belt precision on invalid event', () => {
        spyOn(component, 'setBeltPrecision');
        const event = { target: {} };
        component.child.beltPrecisionValue(event as any);
        fixture.detectChanges();
        expect(component.setBeltPrecision).not.toHaveBeenCalled();
      });

      it('should set belt precision to value', () => {
        spyOn(component, 'setBeltPrecision');
        TestUtility.selectId(fixture, Id.SettingsPrecisionBeltValue, '3');
        fixture.detectChanges();
        expect(component.setBeltPrecision).toHaveBeenCalledWith(3);
      });

      it('should set belt precision to fractions', () => {
        spyOn(component, 'setBeltPrecision');
        TestUtility.clickId(fixture, Id.SettingsPrecisionBeltFractions);
        expect(component.setBeltPrecision).toHaveBeenCalledWith(null);
      });
    });

    describe('Factory', () => {
      it('should set factory precision to decimals', () => {
        spyOn(component, 'setFactoryPrecision');
        TestUtility.clickId(fixture, Id.SettingsPrecisionFactoryDecimals);
        expect(component.setFactoryPrecision).toHaveBeenCalledWith(
          initialSettingsState.factoryPrecision
        );
      });

      it('should not set factory precision on invalid event', () => {
        spyOn(component, 'setFactoryPrecision');
        const event = { target: {} };
        component.child.factoryPrecisionValue(event as any);
        fixture.detectChanges();
        expect(component.setFactoryPrecision).not.toHaveBeenCalled();
      });

      it('should set factory precision to value', () => {
        spyOn(component, 'setFactoryPrecision');
        TestUtility.selectId(fixture, Id.SettingsPrecisionFactoryValue, '3');
        fixture.detectChanges();
        expect(component.setFactoryPrecision).toHaveBeenCalledWith(3);
      });

      it('should set factory precision to fractions', () => {
        spyOn(component, 'setFactoryPrecision');
        TestUtility.clickId(fixture, Id.SettingsPrecisionFactoryFractions);
        expect(component.setFactoryPrecision).toHaveBeenCalledWith(null);
      });
    });
  });
});
