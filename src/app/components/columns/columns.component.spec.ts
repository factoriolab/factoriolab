import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility } from 'src/tests';
import { Column, Entities } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';
import { ColumnsComponent } from './columns.component';

enum DataTest {
  Open = 'lab-columns-open',
  Visibility = 'lab-columns-visibility',
  Decimals = 'lab-columns-decimals',
  Fractions = 'lab-columns-fractions',
  Confirm = 'lab-columns-confirm',
}

@Component({
  selector: 'lab-test-columns',
  template: `
    <lab-columns
      [selected]="selected"
      [precision]="precision"
      (selectIds)="selectIds($event)"
      (setPrecision)="setPrecision($event)"
    >
    </lab-columns>
  `,
})
class TestColumnsComponent {
  @ViewChild(ColumnsComponent) child: ColumnsComponent;
  selected = Mocks.Columns.ids;
  precision: Entities<number> = Mocks.Columns.precision;
  selectIds(data) {}
  setPrecision(data) {}
  constructor(public ref: ChangeDetectorRef) {}
}

describe('ColumnsComponent', () => {
  let component: TestColumnsComponent;
  let fixture: ComponentFixture<TestColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogComponent, ColumnsComponent, TestColumnsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clickOpen', () => {
    it('should set up edit objects', () => {
      component.child.editedValue = true;
      component.child.editedPrecision = true;
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.child.open).toBeTrue();
      expect(component.child.editedValue).toBeFalse();
      expect(component.child.editValue).toEqual(component.selected);
      expect(component.child.editedPrecision).toBeFalse();
      expect(component.child.editPrecision).toEqual(component.precision);
    });
  });

  describe('close', () => {
    beforeEach(() => {
      spyOn(component, 'selectIds');
      spyOn(component, 'setPrecision');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should close the dialog', () => {
      TestUtility.clickDt(fixture, DataTest.Confirm);
      expect(component.selectIds).not.toHaveBeenCalled();
      expect(component.setPrecision).not.toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });

    it('should emit edits', () => {
      component.child.editedValue = true;
      component.child.editedPrecision = true;
      TestUtility.clickDt(fixture, DataTest.Confirm);
      expect(component.selectIds).toHaveBeenCalled();
      expect(component.setPrecision).toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });
  });

  describe('clickId', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should add id to selected', () => {
      component.child.editValue = [];
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Visibility);
      expect(component.child.editedValue).toBeTrue();
      expect(component.child.editValue).toEqual([Column.Belts]);
    });

    it('should remove id from selected', () => {
      component.child.editValue = [Column.Belts];
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Visibility);
      expect(component.child.editedValue).toBeTrue();
      expect(component.child.editValue).toEqual([]);
    });
  });

  describe('changePrecision', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should handle invalid events', () => {
      component.child.changePrecision(null, { target: null } as any);
      expect(component.child.editedPrecision).toBeFalse();
    });

    it('should change the precision value', () => {
      TestUtility.setTextDt(fixture, DataTest.Decimals, '0');
      expect(component.child.editedPrecision).toBeTrue();
      expect(component.child.editPrecision[Column.Items]).toEqual(0);
    });
  });

  describe('clickFraction', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should switch to using fractions', () => {
      TestUtility.clickDt(fixture, DataTest.Fractions);
      expect(component.child.editedPrecision).toBeTrue();
      expect(component.child.editPrecision[Column.Items]).toBeNull();
    });

    it('should switch to using decimals', () => {
      component.child.editPrecision[Column.Items] = null;
      TestUtility.clickDt(fixture, DataTest.Fractions);
      expect(component.child.editedPrecision).toBeTrue();
      expect(component.child.editPrecision[Column.Items]).toEqual(1);
    });
  });
});
