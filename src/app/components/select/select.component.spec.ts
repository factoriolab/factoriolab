import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as mocks from 'src/mocks';
import { ItemId, OptionsType } from '~/models';
import { DatasetState } from '~/store/dataset';
import { IconComponent } from '../icon/icon.component';
import { SelectComponent, SelectType } from './select.component';
import { TestUtility } from '~/utilities/test';

@Component({
  selector: 'lab-test-select',
  template: `
    <lab-select
      [data]="data"
      [selectedId]="selectedId"
      [optionsType]="optionsType"
      [selectType]="selectType"
      (cancel)="cancel()"
      (selectId)="selectId($event)"
    >
    </lab-select>
  `,
})
class TestSelectComponent {
  @ViewChild(SelectComponent) child: SelectComponent;
  data: DatasetState = mocks.Data;
  selectedId = ItemId.AssemblingMachine1;
  optionsType = OptionsType.Assembler;
  selectType = SelectType.Item;
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
    TestUtility.clickSelector(fixture, 'lab-icon', 1);
    fixture.detectChanges();
    expect(component.selectId).toHaveBeenCalledWith(ItemId.AssemblingMachine2);
  });

  it('should cancel when the same id is selected', () => {
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'lab-icon', 0);
    fixture.detectChanges();
    expect(component.cancel).toHaveBeenCalled();
  });
});
