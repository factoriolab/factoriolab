import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { TestModule, TestUtility } from 'src/tests';
import { Column } from '~/models';
import { LabState } from '~/store';
import { DialogComponent } from '../dialog/dialog.component';
import { ColumnsComponent } from './columns.component';

enum DataTest {
  Open = 'lab-columns-open',
  Visibility = 'lab-columns-visibility',
  Decimals = 'lab-columns-decimals',
  Fractions = 'lab-columns-fractions',
  Confirm = 'lab-columns-confirm',
}

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogComponent, ColumnsComponent],
      imports: [TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clickOpen', () => {
    it('should set up edit objects', () => {
      component.edited = true;
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.open).toBeTrue();
      expect(component.edited).toBeFalse();
      expect(component.editValue).not.toEqual({});
    });
  });

  describe('close', () => {
    beforeEach(() => {
      spyOn(mockStore, 'dispatch');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should close the dialog', () => {
      TestUtility.clickDt(fixture, DataTest.Confirm);
      expect(mockStore.dispatch).not.toHaveBeenCalled();
      expect(component.open).toBeFalse();
    });

    it('should emit edits', () => {
      component.edited = true;
      TestUtility.clickDt(fixture, DataTest.Confirm);
      expect(mockStore.dispatch).toHaveBeenCalled();
      expect(component.open).toBeFalse();
    });
  });

  describe('clickId', () => {
    it('should toggle show value', () => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Visibility);
      expect(component.edited).toBeTrue();
      expect(component.editValue[Column.Tree].show).toBeFalse();
    });
  });

  describe('changePrecision', () => {
    it('should change the precision value', () => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      TestUtility.setTextDt(fixture, DataTest.Decimals, '0');
      expect(component.edited).toBeTrue();
      expect(component.editValue[Column.Items].precision).toEqual(0);
    });
  });

  describe('clickFraction', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should switch to using fractions', () => {
      TestUtility.clickDt(fixture, DataTest.Fractions);
      expect(component.edited).toBeTrue();
      expect(component.editValue[Column.Items].precision).toBeNull();
    });

    it('should switch to using decimals', () => {
      component.editValue[Column.Items].precision = null;
      TestUtility.clickDt(fixture, DataTest.Fractions);
      expect(component.edited).toBeTrue();
      expect(component.editValue[Column.Items].precision).toEqual(1);
    });
  });

  describe('example', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should give an example of decimal precision', () => {
      component.editValue[Column.Items].precision = 2;
      expect(component.example(Column.Items)).toEqual('0.34');
    });

    it('should give an example of fractional precision', () => {
      component.editValue[Column.Items].precision = null;
      expect(component.example(Column.Items)).toEqual('1/3');
    });
  });
});
