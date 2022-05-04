import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, Mocks, TestModule, TestUtility } from 'src/tests';
import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../icon/icon.component';
import { RankerComponent } from './ranker.component';

enum DataTest {
  Open = 'lab-ranker-open',
  None = 'lab-ranker-none',
  Option = 'lab-ranker-option',
}

@Component({
  selector: 'lab-test-ranker',
  template: `
    <lab-ranker
      [selected]="selected"
      [options]="options"
      (selectIds)="selectIds($event)"
    >
    </lab-ranker>
  `,
})
class TestRankerComponent {
  @ViewChild(RankerComponent) child!: RankerComponent;
  selected = [ItemId.SpeedModule];
  options: string[] = [
    ItemId.ProductivityModule,
    ItemId.ProductivityModule3,
    ItemId.SpeedModule,
    ItemId.SpeedModule2,
    ItemId.SpeedModule3,
  ];
  selectIds(data: string[]): void {}
}

describe('RankerComponent', () => {
  let component: TestRankerComponent;
  let fixture: ComponentFixture<TestRankerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DialogComponent,
        IconComponent,
        RankerComponent,
        TestRankerComponent,
      ],
      imports: [TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set and update width', () => {
      expect(component.child.width).toEqual(7.125);
      component.options = ['0', '1', '2', '3', '4', '5'];
      fixture.detectChanges();
      expect(component.child.width).toEqual(3.5);
    });
  });

  describe('text', () => {
    it('should get the index of this item in the edit list', () => {
      component.child.editValue = ['id'];
      expect(component.child.text('id')).toEqual('1');
    });

    it('should return for null for mismatched id', () => {
      component.child.editValue = [];
      expect(component.child.text('id')).toBeNull();
    });
  });

  describe('canAdd', () => {
    it('should return true if not edited or empty module', () => {
      expect(component.child.canAdd('', Mocks.AdjustedData)).toBeTrue();
      component.child.edited = true;
      expect(
        component.child.canAdd(ItemId.Module, Mocks.AdjustedData)
      ).toBeTrue();
    });

    it('should return false if already added', () => {
      component.child.edited = true;
      component.child.editValue = ['id'];
      expect(component.child.canAdd('id', Mocks.AdjustedData)).toBeFalse();
    });

    it('should check whether it matches a selected module limitation', () => {
      component.child.edited = true;
      component.child.editValue = [ItemId.ProductivityModule];
      expect(
        component.child.canAdd(ItemId.ProductivityModule3, Mocks.AdjustedData)
      ).toBeFalse();
      expect(
        component.child.canAdd(ItemId.SpeedModule, Mocks.AdjustedData)
      ).toBeTrue();
    });
  });

  describe('clickOpen', () => {
    it('should set up the dialog', () => {
      component.child.edited = true;
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.child.open).toBeTrue();
      expect(component.child.edited).toBeFalse();
      expect(component.child.editValue).toEqual(component.selected);
    });
  });

  describe('close', () => {
    beforeEach(() => {
      spyOn(component, 'selectIds');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should close the dialog', () => {
      component.child.close();
      expect(component.selectIds).not.toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });

    it('should emit edits', () => {
      component.child.edited = true;
      component.child.close();
      expect(component.selectIds).toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });
  });

  describe('clickId', () => {
    beforeEach(() => {
      spyOn(component, 'selectIds');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should set the value to empty', () => {
      spyOn(component.child, 'cancel');
      TestUtility.clickDt(fixture, DataTest.None);
      expect(component.selectIds).toHaveBeenCalledWith([]);
      expect(component.child.cancel).toHaveBeenCalled();
    });

    it('should emit the edited value when clicking on empty module', () => {
      spyOn(component.child, 'cancel');
      component.child.edited = true;
      TestUtility.clickDt(fixture, DataTest.None);
      expect(component.selectIds).toHaveBeenCalledWith(component.selected);
      expect(component.child.cancel).toHaveBeenCalled();
    });

    it('should add the item to the list and close', () => {
      spyOn(component.child, 'cancel');
      component.child.edited = true;
      component.child.editValue = [];
      TestUtility.clickDt(fixture, DataTest.Option, 2);
      expect(component.selectIds).toHaveBeenCalledWith([ItemId.SpeedModule]);
      expect(component.child.cancel).toHaveBeenCalled();
    });

    it('should start editing and then close', () => {
      spyOn(component.child, 'cancel');
      TestUtility.clickDt(fixture, DataTest.Option, 2);
      expect(component.selectIds).toHaveBeenCalledWith([ItemId.SpeedModule]);
      expect(component.child.cancel).toHaveBeenCalled();
    });

    it('should start editing and continue if limited', () => {
      spyOn(component.child, 'cancel');
      TestUtility.clickDt(fixture, DataTest.Option);
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue).toEqual([ItemId.ProductivityModule]);
      expect(component.selectIds).not.toHaveBeenCalled();
      expect(component.child.cancel).not.toHaveBeenCalled();
    });

    it('should skip item that cannot be added', () => {
      spyOn(component.child, 'cancel');
      spyOn(component.child, 'canAdd').and.returnValue(false);
      TestUtility.clickDt(fixture, DataTest.Option, 3);
      expect(component.child.edited).toBeFalse();
      expect(component.child.editValue).toEqual(component.selected);
      expect(component.selectIds).not.toHaveBeenCalled();
      expect(component.child.cancel).not.toHaveBeenCalled();
    });
  });
});
