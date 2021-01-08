import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Mocks, TestUtility, ItemId, RecipeId } from 'src/tests';
import { IconComponent, PickerComponent } from '~/components';
import { RateType } from '~/models';
import { RecipeUtility } from '~/utilities';
import { ProductsComponent } from './products.component';

@Component({
  selector: 'lab-test-products',
  template: `
    <lab-products
      [data]="data"
      [productRecipes]="productRecipes"
      [products]="products"
      (add)="add()"
      (remove)="remove($event)"
      (editProduct)="editProduct($event)"
      (editRate)="editRate($event)"
      (editRateType)="editRateType($event)"
      (editRecipe)="editRecipe($event)"
    >
    </lab-products>
  `,
})
class TestProductsComponent {
  @ViewChild(ProductsComponent) child: ProductsComponent;
  data = Mocks.Data;
  productRecipes = Mocks.ProductRecipes;
  products = Mocks.Products;
  add() {}
  remove(data) {}
  editProduct(data) {}
  editRate(data) {}
  editRateType(data) {}
  editRecipe(data) {}
}

describe('ProductsComponent', () => {
  let component: TestProductsComponent;
  let fixture: ComponentFixture<TestProductsComponent>;

  beforeEach(async () => {
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should set the default category id', () => {
  //   expect(component.child.categoryId).toEqual(component.data.categoryIds[0]);
  // });

  // it('should not reset the category id', () => {
  //   const value = 'test';
  //   component.child.categoryId = value;
  //   component.child.data = null;
  //   expect(component.child.categoryId).toEqual(value);
  // });

  // it('should open edit on a product', () => {
  //   TestUtility.clickSelector(fixture, '.relative lab-icon', 0);
  //   fixture.detectChanges();
  //   expect(component.child.edit.product.id).toEqual('0');
  //   expect(component.child.categoryId).toEqual(CategoryId.Logistics);
  // });

  it('should commit an edit product', () => {
    spyOn(component, 'editProduct');
    component.child.commitEditProduct(Mocks.Product1, ItemId.Coal);
    expect(component.editProduct).toHaveBeenCalledWith({
      id: Mocks.Product1.id,
      value: ItemId.Coal,
    });
  });

  it('should reset the rate type on committing a product that has no simple recipe', () => {
    spyOn(component, 'editRateType');
    spyOn(component, 'editProduct');
    component.child.commitEditProduct(Mocks.Product4, ItemId.PetroleumGas);
    expect(component.editRateType).toHaveBeenCalledWith({
      id: Mocks.Product4.id,
      value: RateType.Items,
    });
    expect(component.editProduct).toHaveBeenCalledWith({
      id: Mocks.Product4.id,
      value: ItemId.PetroleumGas,
    });
  });

  it('should emit numeric values', () => {
    spyOn(component, 'editRate');
    TestUtility.selectSelector(fixture, 'input', '3');
    fixture.detectChanges();
    expect(component.editRate).toHaveBeenCalledWith({
      id: Mocks.Product1.id,
      value: 3,
    });
  });

  it('should ignore invalid numeric values', () => {
    spyOn(component, 'editRate');
    const event = { target: {} };
    component.child.emitNumber(
      component.child.setRate,
      Mocks.Product1.id,
      event as any
    );
    fixture.detectChanges();
    expect(component.editRate).not.toHaveBeenCalled();
  });

  describe('getRecipe', () => {
    it('should call getProductRecipeData', () => {
      spyOn(RecipeUtility, 'getProductRecipeData').and.callThrough();
      const result = component.child.getRecipe(Mocks.Product4);
      expect(RecipeUtility.getProductRecipeData).toHaveBeenCalled();
      expect(result).toEqual(RecipeId.TransportBelt);
    });
  });

  describe('getOptions', () => {
    it('should get the recipe ids that are available as options', () => {
      const result = component.child.getOptions(Mocks.Product4);
      expect(result).toEqual([RecipeId.TransportBelt]);
    });
  });
});
