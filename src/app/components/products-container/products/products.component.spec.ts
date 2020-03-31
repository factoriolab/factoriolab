import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { Category, Product, Item, RateType } from '~/models';
import { TestUtility } from '~/utilities/test';
import { IconComponent } from '~/components/icon/icon.component';
import { ProductsComponent } from './products.component';

@Component({
  selector: 'lab-test-products',
  template: `
    <lab-products
      [products]="products"
      [categories]="categories"
      [categoryId]="categoryId"
      [itemRows]="itemRows"
      [itemEntities]="itemEntities"
      [editProductId]="editProductId"
      (add)="add()"
      (remove)="remove($event)"
      (openEditProduct)="openEditProduct($event)"
      (cancelEditProduct)="cancelEditProduct()"
      (commitEditProduct)="commitEditProduct($event)"
      (editRate)="editRate($event)"
      (editRateType)="editRateType($event)"
      (selectTab)="selectTab($event)"
    >
    </lab-products>
  `
})
class TestProductsComponent {
  @ViewChild(ProductsComponent) child: ProductsComponent;
  products: Product[] = mocks.Products;
  categories: Category[] = mocks.Categories;
  categoryId: string = mocks.CategoryId;
  itemRows: string[][] = mocks.ItemRows;
  itemEntities: { [id: string]: Item } = mocks.ItemEntities;
  editProductId: null;
  add() {}
  remove(data) {}
  openEditProduct(data) {}
  cancelEditProduct() {}
  commitEditProduct(data) {}
  editRate(data) {}
  editRateType(data) {}
  selectTab(data) {}
}

describe('ProductsComponent', () => {
  let component: TestProductsComponent;
  let fixture: ComponentFixture<TestProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, ProductsComponent, TestProductsComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestProductsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit on a product', () => {
    spyOn(component, 'openEditProduct');
    TestUtility.clickSelector(fixture, '.dropdown-container lab-icon', 0);
    fixture.detectChanges();
    expect(component.openEditProduct).toHaveBeenCalledWith(mocks.Product1);
  });

  it('should stop propagation when product is clicked', () => {
    const testEvent: any = { stopPropagation: () => {} };
    spyOn(testEvent, 'stopPropagation');
    component.child.clickEditProduct(mocks.Product1, testEvent);
    expect(testEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should select an item', () => {
    spyOn(component, 'commitEditProduct');
    component.child.selectItem(mocks.Product1.id, mocks.Item2.id);
    expect(component.commitEditProduct).toHaveBeenCalledWith([
      mocks.Product1.id,
      mocks.Item2.id
    ]);
  });

  it('should edit rate of a product', () => {
    spyOn(component, 'editRate');
    TestUtility.selectSelector(fixture, 'input', '3');
    fixture.detectChanges();
    expect(component.editRate).toHaveBeenCalledWith([
      mocks.Product1.id,
      new Fraction(3)
    ]);
  });

  it('should not edit rate of a product on invalid event', () => {
    spyOn(component, 'editRate');
    const event = { target: {} };
    component.child.rateChange(mocks.Product1.id, event);
    expect(component.editRate).not.toHaveBeenCalled();
  });

  it('should not edit rate of a product if unchanged', () => {
    spyOn(component, 'editRate');
    TestUtility.selectSelector(fixture, 'input', '1');
    fixture.detectChanges();
    expect(component.editRate).not.toHaveBeenCalled();
  });

  it('should edit rate type of a product', () => {
    spyOn(component, 'editRateType');
    TestUtility.selectSelector(fixture, 'select', '1');
    fixture.detectChanges();
    expect(component.editRateType).toHaveBeenCalledWith([
      mocks.Product1.id,
      RateType.Factories
    ]);
  });
});
