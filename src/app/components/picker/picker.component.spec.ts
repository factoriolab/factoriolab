import { ViewChild, Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as mocks from 'src/mocks';
import { Category, Item, Id } from '~/models';
import { TestUtility } from '~/utilities/test';
import { IconComponent } from '../icon/icon.component';
import { PickerComponent } from './picker.component';

@Component({
  selector: 'lab-test-picker',
  template: `
    <div id=${Id.Away}></div>
    <lab-picker
      [categories]="categories"
      [categoryId]="categoryId"
      [itemRows]="itemRows"
      [itemEntities]="itemEntities"
      [itemId]="itemId"
      (cancel)="cancel()"
      (selectTab)="selectTab($event)"
      (selectItem)="selectItem($event)"
    ></lab-picker>
  `
})
class TestPickerComponent {
  @ViewChild(PickerComponent) child: PickerComponent;
  categories: Category[] = mocks.Categories;
  categoryId: string = mocks.CategoryId;
  itemRows: string[][] = mocks.ItemRows;
  itemEntities: { [id: string]: Item } = mocks.ItemEntities;
  itemId: string = mocks.Item1.id;
  cancel() {}
  selectTab(data) {}
  selectItem(data) {}
}

describe('PickerComponent', () => {
  let component: TestPickerComponent;
  let fixture: ComponentFixture<TestPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, PickerComponent, TestPickerComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancel when clicked away', () => {
    spyOn(component, 'cancel');
    TestUtility.clickId(fixture, Id.Away);
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, 'lab-picker');
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should select a new item', () => {
    spyOn(component, 'selectItem');
    TestUtility.clickSelector(fixture, '.item lab-icon', 1);
    fixture.detectChanges();
    expect(component.selectItem).toHaveBeenCalledWith(mocks.Item2.id);
  });

  it('should cancel when the same item is selected', () => {
    spyOn(component, 'cancel');
    TestUtility.clickSelector(fixture, '.item lab-icon', 0);
    fixture.detectChanges();
    expect(component.cancel).toHaveBeenCalled();
  });
});
