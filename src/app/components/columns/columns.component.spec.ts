import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUtility } from 'src/tests';
import { Column, Game } from '~/models';
import { initialColumnsState } from '~/store/preferences';
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
      [game]="game"
      [columns]="columns"
      (setColumns)="setColumns($event)"
    >
    </lab-columns>
  `,
})
class TestColumnsComponent {
  @ViewChild(ColumnsComponent) child: ColumnsComponent;
  game = Game.Factorio;
  columns = initialColumnsState;
  setColumns(data): void {}
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
      component.child.edited = true;
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.child.open).toBeTrue();
      expect(component.child.edited).toBeFalse();
      expect(component.child.editValue).toEqual(component.columns);
      component.child.editValue[Column.Items].show = false;
      expect(component.child.columns[Column.Items].show).toBeTrue();
    });
  });

  describe('close', () => {
    beforeEach(() => {
      spyOn(component, 'setColumns');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should close the dialog', () => {
      TestUtility.clickDt(fixture, DataTest.Confirm);
      expect(component.setColumns).not.toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });

    it('should emit edits', () => {
      component.child.edited = true;
      TestUtility.clickDt(fixture, DataTest.Confirm);
      expect(component.setColumns).toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });
  });

  describe('clickId', () => {
    it('should toggle show value', () => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Visibility);
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue[Column.Tree].show).toBeFalse();
    });
  });

  describe('changePrecision', () => {
    it('should change the precision value', () => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      TestUtility.setTextDt(fixture, DataTest.Decimals, '0');
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue[Column.Items].precision).toEqual(0);
    });
  });

  describe('clickFraction', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should switch to using fractions', () => {
      TestUtility.clickDt(fixture, DataTest.Fractions);
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue[Column.Items].precision).toBeNull();
    });

    it('should switch to using decimals', () => {
      component.child.editValue[Column.Items].precision = null;
      TestUtility.clickDt(fixture, DataTest.Fractions);
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue[Column.Items].precision).toEqual(1);
    });
  });

  describe('example', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should give an example of decimal precision', () => {
      component.child.editValue[Column.Items].precision = 2;
      expect(component.child.example(Column.Items)).toEqual('0.34');
    });

    it('should give an example of fractional precision', () => {
      component.child.editValue[Column.Items].precision = null;
      expect(component.child.example(Column.Items)).toEqual('1/3');
    });
  });
});
