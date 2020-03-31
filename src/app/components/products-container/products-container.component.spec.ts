import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { RateType } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as products from '~/store/products';
import { IconComponent } from '../icon/icon.component';
import { ProductsComponent } from './products/products.component';
import { ProductsContainerComponent } from './products-container.component';

describe('ProductsContainerComponent', () => {
  let component: ProductsContainerComponent;
  let fixture: ComponentFixture<ProductsContainerComponent>;
  let store: Store<State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [
        IconComponent,
        ProductsComponent,
        ProductsContainerComponent
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ProductsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        store = TestBed.inject(Store);
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a product', () => {
    spyOn(store, 'dispatch');
    component.child.add.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new products.AddAction());
  });

  it('should remove a product', () => {
    spyOn(store, 'dispatch');
    component.child.remove.emit(0);
    expect(store.dispatch).toHaveBeenCalledWith(new products.RemoveAction(0));
  });

  it('should open edit on a product', () => {
    spyOn(store, 'dispatch');
    component.child.openEditProduct.emit(mocks.Product1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new products.OpenEditProductAction(mocks.Product1)
    );
  });

  it('should cancel edit on a product', () => {
    spyOn(store, 'dispatch');
    component.child.cancelEditProduct.emit();
    expect(store.dispatch).toHaveBeenCalledWith(
      new products.CancelEditProductAction()
    );
  });

  it('should commit edit on a product', () => {
    spyOn(store, 'dispatch');
    const data: [number, string] = [mocks.Product1.id, mocks.Item2.id];
    component.child.commitEditProduct.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new products.CommitEditProductAction(data)
    );
  });

  it('should edit rate on a product', () => {
    spyOn(store, 'dispatch');
    const data: [number, Fraction] = [mocks.Product1.id, new Fraction(2)];
    component.child.editRate.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new products.EditRateAction(data)
    );
  });

  it('should edit rate type on a product', () => {
    spyOn(store, 'dispatch');
    const data: [number, RateType] = [mocks.Product1.id, RateType.Wagons];
    component.child.editRateType.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new products.EditRateTypeAction(data)
    );
  });

  it('should select a new tab', () => {
    spyOn(store, 'dispatch');
    const tab = 'test';
    component.child.selectTab.emit(tab);
    expect(store.dispatch).toHaveBeenCalledWith(
      new products.SelectItemCategoryAction(tab)
    );
  });
});
