import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, ItemId, TestUtility } from 'src/tests';
import { Dataset } from '~/models';
import { DialogComponent, IconComponent } from '~/components';
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
      [data]="data"
      [selected]="selected"
      [options]="options"
      (selectIds)="selectIds($event)"
    >
    </lab-ranker>
  `,
})
class TestRankerComponent {
  @ViewChild(RankerComponent) child: RankerComponent;
  data: Dataset = Mocks.Data;
  selected = [ItemId.SpeedModule];
  options: string[] = [
    ItemId.SpeedModule,
    ItemId.SpeedModule2,
    ItemId.SpeedModule3,
    ItemId.ProductivityModule,
    ItemId.ProductivityModule3,
  ];
  selectIds(data): void {}
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

  describe('width', () => {
    it('should make room for all options when <= 4', () => {
      component.options = ['1', '2', '3'];
      fixture.detectChanges();
      expect(component.child.width).toEqual(11);
    });

    it('should calculate based on number of options', () => {
      expect(component.child.width).toEqual(8.625);
    });
  });

  describe('text', () => {
    it('should get the index of this item in the edit list', () => {
      component.child.editValue = ['id'];
      expect(component.child.text('id')).toEqual('1');
    });

    it('should return for null for mismatched id', () => {
      component.child.editValue = [];
      expect(component.child.text('id')).toEqual(null);
    });
  });

  describe('canAdd', () => {
    it('should return true if not edited or empty module', () => {
      expect(component.child.canAdd(null)).toBeTrue();
      component.child.edited = true;
      expect(component.child.canAdd(ItemId.Module)).toBeTrue();
    });

    it('should return false if already added', () => {
      component.child.edited = true;
      component.child.editValue = ['id'];
      expect(component.child.canAdd('id')).toBeFalse();
    });

    it('should check whether it matches a selected module limitation', () => {
      component.child.edited = true;
      component.child.editValue = [ItemId.ProductivityModule];
      expect(component.child.canAdd(ItemId.ProductivityModule3)).toBeFalse();
      expect(component.child.canAdd(ItemId.SpeedModule)).toBeTrue();
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

    it('should set the value to empty module only', () => {
      spyOn(component.child, 'cancel');
      TestUtility.clickDt(fixture, DataTest.None);
      expect(component.selectIds).toHaveBeenCalledWith([ItemId.Module]);
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
      TestUtility.clickDt(fixture, DataTest.Option);
      expect(component.selectIds).toHaveBeenCalledWith([ItemId.SpeedModule]);
      expect(component.child.cancel).toHaveBeenCalled();
    });

    it('should start editing and then close', () => {
      spyOn(component.child, 'cancel');
      TestUtility.clickDt(fixture, DataTest.Option);
      expect(component.selectIds).toHaveBeenCalledWith([ItemId.SpeedModule]);
      expect(component.child.cancel).toHaveBeenCalled();
    });

    it('should start editing and continue if limited', () => {
      spyOn(component.child, 'cancel');
      TestUtility.clickDt(fixture, DataTest.Option, 3);
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
