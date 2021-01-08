import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import { IdType, DisplayRate, Dataset } from '~/models';
import { IconComponent } from '../icon/icon.component';
import { SelectComponent } from './select.component';

@Component({
  selector: 'lab-test-select',
  template: `
    <lab-select
      [data]="data"
      [selectedId]="selectedId"
      [options]="options"
      [selectType]="selectType"
      [displayRate]="displayRate"
      [includeEmptyModule]="includeEmptyModule"
      (cancel)="cancel()"
      (selectId)="selectId($event)"
    >
    </lab-select>
  `,
})
class TestSelectComponent {
  @ViewChild(SelectComponent) child: SelectComponent;
  data: Dataset = Mocks.Data;
  selectedId = ItemId.AssemblingMachine1;
  options = [
    ItemId.AssemblingMachine1,
    ItemId.AssemblingMachine2,
    ItemId.AssemblingMachine3,
  ];
  selectType = IdType.Item;
  displayRate = DisplayRate.PerMinute;
  includeEmptyModule = false;
  cancel() {}
  selectId(data) {}
}

describe('SelectComponent', () => {
  let component: TestSelectComponent;
  let fixture: ComponentFixture<TestSelectComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, SelectComponent, TestSelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should set top based on parent', () => {
  //   component.child.parent = { getBoundingClientRect: () => ({ y: 0 }) } as any;
  //   expect(component.child.top).toEqual(-8);
  //   component.child.parent = null;
  //   expect(component.child.top).toEqual(-8);
  // });

  // it('should set left based on parent', () => {
  //   component.child.parent = { getBoundingClientRect: () => ({ x: 0 }) } as any;
  //   expect(component.child.left).toEqual(-17);
  //   component.child.parent = null;
  //   expect(component.child.left).toEqual(-8);
  // });

  it('should set width based on options', () => {
    expect(component.child.width).toEqual(10.25);
  });

  it('should set minimum width', () => {
    component.child.options = new Array(25);
    expect(component.child.width).toEqual(14.75);
  });

  // it('should set opening to false on first click event', () => {
  //   spyOn(component, 'cancel');
  //   document.body.click();
  //   expect(component.cancel).not.toHaveBeenCalled();
  //   expect(component.child.opening).toEqual(false);
  // });

  it('should cancel', () => {
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'i', 0);
    fixture.detectChanges();
    expect(component.cancel).toHaveBeenCalled();
  });

  // it('should cancel when clicked away', () => {
  //   spyOn(component, 'cancel');
  //   component.child.opening = false;
  //   document.body.click();
  //   expect(component.cancel).toHaveBeenCalled();
  // });

  // it('should not cancel when clicked on', () => {
  //   spyOn(component, 'cancel');
  //   component.child.opening = false;
  //   TestUtility.clickSelector(fixture, 'lab-select');
  //   expect(component.cancel).not.toHaveBeenCalled();
  // });

  it('should select a new id', () => {
    spyOn(component, 'selectId');
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'lab-icon', 1);
    fixture.detectChanges();
    expect(component.selectId).toHaveBeenCalledWith(ItemId.AssemblingMachine2);
    expect(component.cancel).toHaveBeenCalled();
  });
});
