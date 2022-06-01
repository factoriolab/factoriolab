import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { initialState, ItemId, Mocks, TestUtility } from 'src/tests';
import { Dataset, IdType } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../icon/icon.component';
import { SelectComponent } from './select.component';

enum DataTest {
  Open = 'lab-select-open',
  None = 'lab-select-none',
  Option = 'lab-select-option',
}

@Component({
  selector: 'lab-test-select',
  template: `
    <lab-select
      [selected]="selected"
      [options]="options"
      [selectType]="selectType"
      [includeEmptyModule]="includeEmptyModule"
      [columns]="columns"
      (selectId)="selectId($event)"
    >
    </lab-select>
  `,
})
class TestSelectComponent {
  @ViewChild(SelectComponent) child!: SelectComponent;
  data: Dataset = Mocks.Dataset;
  selected = ItemId.AssemblingMachine1;
  options: string[] = [
    ItemId.AssemblingMachine1,
    ItemId.AssemblingMachine2,
    ItemId.AssemblingMachine3,
  ];
  selectType = IdType.Item;
  includeEmptyModule = false;
  columns: number | undefined;
  selectId(data: string): void {}
}

describe('SelectComponent', () => {
  let component: TestSelectComponent;
  let fixture: ComponentFixture<TestSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DialogComponent,
        IconComponent,
        SelectComponent,
        TestSelectComponent,
      ],
      providers: [provideMockStore({ initialState })],
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

  describe('ngOnChanges', () => {
    it('should calculate width from specified number of columns', () => {
      component.columns = 3;
      fixture.detectChanges();
      expect(component.child.width).toEqual(7.125);
    });

    it('should calculate width based on number of options', () => {
      component.options = ['1', '2', '3', '4', '5'];
      fixture.detectChanges();
      expect(component.child.width).toEqual(7.125);
    });

    it('should calculate width based maximum row size', () => {
      component.options = ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'b-1'];
      component.includeEmptyModule = true;
      fixture.detectChanges();
      expect(component.child.width).toEqual(11.875);
    });
  });

  describe('clickId', () => {
    it('should emit the selection', () => {
      spyOn(component, 'selectId');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Option);
      expect(component.selectId).toHaveBeenCalledWith(
        ItemId.AssemblingMachine1
      );
      expect(component.child.open).toBeFalse();
    });
  });
});
