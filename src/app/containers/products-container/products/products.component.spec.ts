import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import * as mocks from 'src/mocks';
import { IconComponent, PickerComponent } from '~/components';
import { Product, RateType, CategoryId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { TestUtility } from '~/utilities/test';
import { ProductsComponent } from './products.component';

@Component({
  selector: 'lab-test-products',
  template: `
    <lab-products
      [data]="data"
      [products]="products"
      (add)="add()"
      (remove)="remove($event)"
      (editProduct)="editProduct($event)"
      (editRate)="editRate($event)"
      (editRateType)="editRateType($event)"
      (selectTab)="selectTab($event)"
    >
    </lab-products>
  `,
})
class TestProductsComponent {
  @ViewChild(ProductsComponent) child: ProductsComponent;
  data: DatasetState = mocks.Data;
  products: Product[] = mocks.Products;
  add() {}
  remove(data) {}
  editProduct(data) {}
  editRate(data) {}
  editRateType(data) {}
  selectTab(data) {}
}

describe('ProductsComponent', () => {
  let component: TestProductsComponent;
  let fixture: ComponentFixture<TestProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        IconComponent,
        PickerComponent,
        ProductsComponent,
        TestProductsComponent,
      ],
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
    TestUtility.clickSelector(fixture, '.relative lab-icon', 0);
    fixture.detectChanges();
    expect(component.child.editProductId).toEqual(0);
    expect(component.child.categoryId).toEqual(CategoryId.Logistics);
  });

  it('should emit numeric values', () => {
    spyOn(component, 'editRate');
    TestUtility.selectSelector(fixture, 'input', '3');
    fixture.detectChanges();
    expect(component.editRate).toHaveBeenCalledWith([mocks.Product1.id, 3]);
  });

  it('should ignore invalid numeric values', () => {
    spyOn(component, 'editRate');
    const event = { target: {} };
    component.child.emitNumber(
      component.child.editRate,
      mocks.Product1.id,
      event as any
    );
    fixture.detectChanges();
    expect(component.editRate).not.toHaveBeenCalled();
  });
});
