import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryId, ItemId, TestModule, TestUtility } from 'src/tests';
import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../icon/icon.component';
import { PickerComponent } from './picker.component';

enum DataTest {
  Open = 'lab-picker-open',
  Search = 'lab-picker-search',
  SearchValue = 'lab-picker-search-value',
}

@Component({
  selector: 'lab-test-picker',
  template: `
    <lab-picker
      [selected]="selected"
      (selectId)="selectId($event)"
    ></lab-picker>
  `,
})
class TestPickerComponent {
  @ViewChild(PickerComponent) child!: PickerComponent;
  selected: string | undefined = undefined;
  selectId(data: string): void {}
}

describe('PickerComponent', () => {
  let component: TestPickerComponent;
  let fixture: ComponentFixture<TestPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        DialogComponent,
        PickerComponent,
        TestPickerComponent,
      ],
      imports: [TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should select tab', () => {
      component.selected = ItemId.BurnerMiningDrill;
      fixture.detectChanges();
      expect(component.child.tab).toEqual(CategoryId.Production);
    });
  });

  describe('clickOpen', () => {
    it('should set up the dialog', () => {
      component.child.search = true;
      component.child.searchValue = 'test';
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.child.open).toBeTrue();
      expect(component.child.search).toBeFalse();
      expect(component.child.searchValue).toBe('');
      expect(component.child.categoryIds.length).toEqual(6);
      expect(Object.keys(component.child.categoryItemRows).length).toEqual(6);
    });
  });

  describe('inputSearch', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Search);
      fixture.detectChanges();
    });

    it('should filter out matching items and categories', () => {
      TestUtility.setTextDt(fixture, DataTest.SearchValue, 'module speed');
      expect(component.child.tab).toEqual(CategoryId.Production);
      expect(component.child.categoryIds).toEqual([CategoryId.Production]);
      expect(component.child.categoryItemRows[CategoryId.Production]).toEqual([
        [ItemId.SpeedModule, ItemId.SpeedModule2, ItemId.SpeedModule3],
      ]);
    });

    it('should persist matching category', () => {
      component.child.tab = CategoryId.Research;
      TestUtility.setTextDt(fixture, DataTest.SearchValue, 'speed');
      expect(component.child.tab).toEqual(CategoryId.Research);
    });
  });
});
