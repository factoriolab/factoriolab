import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as Mocks from 'src/mocks';
import { ItemId, options, IdType } from '~/models';
import { DatasetState } from '~/store/dataset';
import { IconComponent } from '../icon/icon.component';
import { ToggleComponent } from './toggle.component';
import { TestUtility } from '~/utilities/test';

@Component({
  selector: 'lab-test-toggle',
  template: `
    <lab-toggle
      [data]="data"
      [selectedId]="selectedId"
      [options]="options"
      [selectType]="selectType"
      (cancel)="cancel()"
      (selectId)="selectId($event)"
    >
    </lab-toggle>
  `,
})
class TestToggleComponent {
  @ViewChild(ToggleComponent) child: ToggleComponent;
  data: DatasetState = Mocks.Data;
  selectedId = ItemId.AssemblingMachine1;
  options = options.Assembler;
  selectType = IdType.Item;
  cancel() {}
  selectId(data) {}
}

describe('ToggleComponent', () => {
  let component: TestToggleComponent;
  let fixture: ComponentFixture<TestToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, ToggleComponent, TestToggleComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestToggleComponent);
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
