import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Mocks, ItemId } from 'src/tests';
import {
  IconComponent,
  InputComponent,
  PickerComponent,
  OptionsComponent,
} from '~/components';
import { DisplayRate, RateType } from '~/models';
import { ValidateNumberDirective } from '~/support';
import { ProductsComponent } from './products.component';

@Component({
  selector: 'lab-test-products',
  template: `
    <lab-products
      [data]="data"
      [productSteps]="productSteps"
      [products]="products"
      [displayRate]="displayRate"
      (addProduct)="addProduct()"
      (removeProduct)="removeProduct($event)"
      (setItem)="setItem($event)"
      (setRate)="setRate($event)"
      (setRateType)="setRateType($event)"
      (setVia)="setVia($event)"
    >
    </lab-products>
  `,
})
class TestProductsComponent {
  @ViewChild(ProductsComponent) child: ProductsComponent;
  data = Mocks.Data;
  productSteps = Mocks.ProductSteps;
  products = Mocks.Products;
  displayRate = DisplayRate.PerMinute;
  addProduct(): void {}
  removeProduct(data): void {}
  setItem(data): void {}
  setRate(data): void {}
  setRateType(data): void {}
  setVia(data): void {}
}

describe('ProductsComponent', () => {
  let component: TestProductsComponent;
  let fixture: ComponentFixture<TestProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        IconComponent,
        InputComponent,
        OptionsComponent,
        PickerComponent,
        ValidateNumberDirective,
        ProductsComponent,
        TestProductsComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeItem', () => {
    it('should edit a product item', () => {
      spyOn(component, 'setItem');
      component.child.changeItem(Mocks.Product1, ItemId.Coal);
      expect(component.setItem).toHaveBeenCalledWith({
        id: Mocks.Product1.id,
        value: ItemId.Coal,
      });
    });

    it('should reset the rate type when changing a product that has no simple recipe', () => {
      spyOn(component, 'setRateType');
      spyOn(component, 'setItem');
      component.child.changeItem(Mocks.Product4, ItemId.PetroleumGas);
      expect(component.setRateType).toHaveBeenCalledWith({
        id: Mocks.Product4.id,
        value: RateType.Items,
      });
      expect(component.setItem).toHaveBeenCalledWith({
        id: Mocks.Product4.id,
        value: ItemId.PetroleumGas,
      });
    });
  });
});
