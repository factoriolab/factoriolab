import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';

import { Mocks, ItemId, RecipeId } from 'src/tests';
import { IconComponent, PickerComponent } from '~/components';
import { RateType } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as Products from '~/store/products';
import { ProductsComponent } from './products/products.component';
import { ProductsContainerComponent } from './products-container.component';

describe('ProductsContainerComponent', () => {
  let component: ProductsContainerComponent;
  let fixture: ComponentFixture<ProductsContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [
        IconComponent,
        PickerComponent,
        ProductsComponent,
        ProductsContainerComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsContainerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a product', () => {
    spyOn(store, 'dispatch');
    component.child.add.emit(ItemId.WoodenChest);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.AddAction(ItemId.WoodenChest)
    );
  });

  it('should remove a product', () => {
    spyOn(store, 'dispatch');
    const data = '0';
    component.child.remove.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.RemoveAction(data)
    );
  });

  it('should commit edit on a product', () => {
    spyOn(store, 'dispatch');
    const data = { id: Mocks.Product1.id, value: Mocks.Item2.id };
    component.child.setItem.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetItemAction(data)
    );
  });

  it('should edit rate on a product', () => {
    spyOn(store, 'dispatch');
    const data = { id: Mocks.Product1.id, value: 2 };
    component.child.setRate.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetRateAction(data)
    );
  });

  it('should edit rate type on a product', () => {
    spyOn(store, 'dispatch');
    const data = { id: Mocks.Product1.id, value: RateType.Wagons };
    component.child.setRateType.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetRateTypeAction(data)
    );
  });

  it('should edit recipe on a product', () => {
    spyOn(store, 'dispatch');
    const data = {
      id: Mocks.Product1.id,
      value: RecipeId.AdvancedOilProcessing,
    };
    component.child.setVia.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaAction(data)
    );
  });
});
