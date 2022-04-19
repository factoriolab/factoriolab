import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { Mocks, ItemId, RecipeId } from 'src/tests';
import { IconComponent, OptionsComponent, PickerComponent } from '~/components';
import {
  DefaultIdPayload,
  DisplayRate,
  IdPayload,
  PreviousPayload,
  RateType,
} from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as Products from '~/store/products';
import { SetDisplayRateAction } from '~/store/settings';
import { ProductsComponent } from './products/products.component';
import { ProductsContainerComponent } from './products-container.component';

describe('ProductsContainerComponent', () => {
  let component: ProductsContainerComponent;
  let fixture: ComponentFixture<ProductsContainerComponent>;
  let store: Store<State>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        TranslateModule.forRoot(),
      ],
      declarations: [
        IconComponent,
        OptionsComponent,
        PickerComponent,
        ProductsComponent,
        ProductsContainerComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove a product', () => {
    const data = '0';
    component.child.removeProduct.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.RemoveAction(data)
    );
  });

  it('should set item on a product', () => {
    const data: IdPayload = { id: Mocks.Product1.id, value: Mocks.Item2.id };
    component.child.setItem.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetItemAction(data)
    );
  });

  it('should set rate on a product', () => {
    const data: IdPayload = { id: Mocks.Product1.id, value: '2' };
    component.child.setRate.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetRateAction(data)
    );
  });

  it('should set rate type on a product', () => {
    const data: IdPayload<RateType> = {
      id: Mocks.Product1.id,
      value: RateType.Wagons,
    };
    component.child.setRateType.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetRateTypeAction(data)
    );
  });

  it('should set via on a product', () => {
    const data: IdPayload = {
      id: Mocks.Product1.id,
      value: RecipeId.AdvancedOilProcessing,
    };
    component.child.setVia.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaAction(data)
    );
  });

  it('should set via setting on a product', () => {
    const data: DefaultIdPayload = {
      id: Mocks.Product1.id,
      value: ItemId.TransportBelt,
      def: ItemId.TransportBelt,
    };
    component.child.setViaSetting.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaSettingAction(data)
    );
  });

  it('should set via factory modules on a product', () => {
    const data: DefaultIdPayload<string[]> = {
      id: Mocks.Product1.id,
      value: [ItemId.SpeedModule, ItemId.SpeedModule],
      def: [ItemId.Module, ItemId.Module],
    };
    component.child.setViaFactoryModules.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaFactoryModulesAction(data)
    );
  });

  it('should set via beacon count on a product', () => {
    const data: DefaultIdPayload = {
      id: Mocks.Product1.id,
      value: '12',
      def: '8',
    };
    component.child.setViaBeaconCount.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaBeaconCountAction(data)
    );
  });

  it('should set via beacon on a product', () => {
    const data: DefaultIdPayload = {
      id: Mocks.Product1.id,
      value: ItemId.Beacon,
      def: ItemId.Beacon,
    };
    component.child.setViaBeacon.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaBeaconAction(data)
    );
  });

  it('should set via beacon modules on a product', () => {
    const data: DefaultIdPayload<string[]> = {
      id: Mocks.Product1.id,
      value: [ItemId.SpeedModule, ItemId.SpeedModule],
      def: [ItemId.Module, ItemId.Module],
    };
    component.child.setViaBeaconModules.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaBeaconModulesAction(data)
    );
  });

  it('should set via overclock on a product', () => {
    const data: DefaultIdPayload<number> = {
      id: Mocks.Product1.id,
      value: 200,
      def: 100,
    };
    component.child.setViaOverclock.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaOverclockAction(data)
    );
  });

  it('should add a product', () => {
    component.child.addProduct.emit(ItemId.WoodenChest);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.AddAction(ItemId.WoodenChest)
    );
  });

  it('should set display rate', () => {
    const value: PreviousPayload<DisplayRate> = {
      value: DisplayRate.PerSecond,
      prev: DisplayRate.PerMinute,
    };
    component.child.setDisplayRate.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetDisplayRateAction(value)
    );
  });
});
