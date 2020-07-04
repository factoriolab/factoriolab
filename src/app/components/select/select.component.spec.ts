import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import { IdType } from '~/models';
import { DatasetState } from '~/store/dataset';
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
      (cancel)="cancel()"
      (selectId)="selectId($event)"
    >
    </lab-select>
  `,
})
class TestSelectComponent {
  @ViewChild(SelectComponent) child: SelectComponent;
  data: DatasetState = Mocks.Data;
  selectedId = ItemId.AssemblingMachine1;
  selectType = IdType.Item;
  cancel() {}
  selectId(data) {}
}

describe('SelectComponent', () => {
  let component: TestSelectComponent;
  let fixture: ComponentFixture<TestSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, SelectComponent, TestSelectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set opening to false on first click event', () => {
    spyOn(component, 'cancel');
    document.body.click();
    expect(component.cancel).not.toHaveBeenCalled();
    expect(component.child.opening).toEqual(false);
  });

  it('should cancel', () => {
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'i', 0);
    fixture.detectChanges();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should cancel when clicked away', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    document.body.click();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-select');
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should select a new id', () => {
    spyOn(component, 'selectId');
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'lab-icon', 1);
    fixture.detectChanges();
    expect(component.selectId).toHaveBeenCalledWith(ItemId.AssemblingMachine2);
    expect(component.cancel).toHaveBeenCalled();
  });
});
