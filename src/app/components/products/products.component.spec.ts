import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { Mocks, ItemId, initialState, RecipeId } from 'src/tests';
import {
  IconComponent,
  InputComponent,
  PickerComponent,
  OptionsComponent,
} from '~/components';
import { ValidateNumberDirective } from '~/directives';
import { DisplayRate, Product, RateType, RecipeField } from '~/models';
import * as Factories from '~/store/factories';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';
import { RecipeUtility } from '~/utilities';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        InputComponent,
        OptionsComponent,
        PickerComponent,
        ValidateNumberDirective,
        ProductsComponent,
      ],
      imports: [FormsModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    store = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeItem', () => {
    it('should edit a product item', () => {
      spyOn(component, 'setItem');
      component.changeItem(Mocks.Product1, ItemId.Coal, Mocks.AdjustedData);
      expect(component.setItem).toHaveBeenCalledWith(
        Mocks.Product1.id,
        ItemId.Coal
      );
    });

    it('should reset the rate type when changing a product that has no simple recipe', () => {
      spyOn(component, 'setRateType');
      spyOn(component, 'setItem');
      component.changeItem(
        Mocks.Product4,
        ItemId.PetroleumGas,
        Mocks.AdjustedData
      );
      expect(component.setRateType).toHaveBeenCalledWith(
        Mocks.Product4.id,
        RateType.Items
      );
      expect(component.setItem).toHaveBeenCalledWith(
        Mocks.Product4.id,
        ItemId.PetroleumGas
      );
    });
  });

  describe('changeFactory', () => {
    it('should set up default for factory', () => {
      spyOn(RecipeUtility, 'bestMatch').and.returnValue('default');
      spyOn(component, 'setViaSetting');
      component.changeFactory(
        'id',
        'value',
        RecipeId.AdvancedCircuit,
        Mocks.FactorySettingsInitial,
        Mocks.AdjustedData
      );
      expect(component.setViaSetting).toHaveBeenCalledWith(
        'id',
        'value',
        'default'
      );
    });

    it('should handle null factory ids', () => {
      spyOn(RecipeUtility, 'bestMatch').and.returnValue('default');
      spyOn(component, 'setViaSetting');
      component.changeFactory(
        'id',
        'value',
        RecipeId.AdvancedCircuit,
        Factories.initialFactoriesState,
        Mocks.AdjustedData
      );
      expect(component.setViaSetting).toHaveBeenCalledWith(
        'id',
        'value',
        'default'
      );
    });
  });

  describe('changeRecipeField', () => {
    const productMatch: Product = {
      id: '0',
      itemId: ItemId.WoodenChest,
      rate: '1',
      rateType: RateType.Items,
      viaId: ItemId.Wood,
      viaSetting: ItemId.AssemblingMachine3,
      viaFactoryModules: new Array(4).fill(ItemId.SpeedModule2),
      viaBeacon: ItemId.Beacon,
      viaBeaconModules: new Array(2).fill(ItemId.SpeedModule2),
    };
    const productMismatch = {
      ...productMatch,
      ...{
        viaSetting: ItemId.AssemblingMachine2,
        viaFactoryModules: new Array(2).fill(ItemId.SpeedModule2),
      },
    };

    it('should set up default for factory modules (factory match)', () => {
      spyOn(component, 'setViaFactoryModules');
      component.changeRecipeField(
        productMatch,
        ItemId.SpeedModule3,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.FactoryModules,
        0,
        Mocks.AdjustedData
      );
      expect(component.setViaFactoryModules).toHaveBeenCalledWith(
        '0',
        new Array(4).fill(ItemId.SpeedModule3),
        new Array(4).fill(ItemId.SpeedModule3)
      );
    });

    it('should set up default for factory modules (factory mismatch)', () => {
      spyOn(component, 'setViaFactoryModules');
      component.changeRecipeField(
        productMismatch,
        ItemId.SpeedModule,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.FactoryModules,
        0,
        Mocks.AdjustedData
      );
      expect(component.setViaFactoryModules).toHaveBeenCalledWith(
        '0',
        [ItemId.SpeedModule, ItemId.SpeedModule],
        [ItemId.SpeedModule3, ItemId.SpeedModule3]
      );
    });

    it('should set up default for beacon count (factory match)', () => {
      spyOn(component, 'setViaBeaconCount');
      component.changeRecipeField(
        productMatch,
        '4',
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.BeaconCount
      );
      expect(component.setViaBeaconCount).toHaveBeenCalledWith('0', '4', '8');
    });

    it('should set up default for beacon count (factory mismatch)', () => {
      spyOn(component, 'setViaBeaconCount');
      component.changeRecipeField(
        productMismatch,
        '4',
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.BeaconCount
      );
      expect(component.setViaBeaconCount).toHaveBeenCalledWith('0', '4', '8');
    });

    it('should set up default for beacon modules (factory match)', () => {
      spyOn(component, 'setViaBeaconModules');
      component.changeRecipeField(
        productMatch,
        ItemId.SpeedModule3,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.BeaconModules,
        0
      );
      expect(component.setViaBeaconModules).toHaveBeenCalledWith(
        '0',
        new Array(2).fill(ItemId.SpeedModule3),
        new Array(2).fill(ItemId.SpeedModule3)
      );
    });

    it('should set up default for beacon modules (factory mismatch)', () => {
      spyOn(component, 'setViaBeaconModules');
      component.changeRecipeField(
        productMismatch,
        ItemId.SpeedModule3,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.BeaconModules,
        0
      );
      expect(component.setViaBeaconModules).toHaveBeenCalledWith(
        '0',
        new Array(2).fill(ItemId.SpeedModule3),
        new Array(2).fill(ItemId.SpeedModule3)
      );
    });

    it('should set up default for overclock (factory match)', () => {
      spyOn(component, 'setViaOverclock');
      component.changeRecipeField(
        productMatch,
        { target: { valueAsNumber: 100 } } as any,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.Overclock
      );
      expect(component.setViaOverclock).toHaveBeenCalledWith(
        '0',
        100,
        undefined
      );
    });

    it('should set up default for overclock (factory mismatch)', () => {
      spyOn(component, 'setViaOverclock');
      component.changeRecipeField(
        productMismatch,
        { target: { valueAsNumber: 100 } } as any,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.Overclock
      );
      expect(component.setViaOverclock).toHaveBeenCalledWith(
        '0',
        100,
        undefined
      );
    });
  });

  it('should dispatch actions', () => {
    spyOn(store, 'dispatch');
    component.removeProduct('id');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.RemoveAction('id')
    );
    component.setItem('id', 'value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetItemAction({ id: 'id', value: 'value' })
    );
    component.setRate('id', 'value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetRateAction({ id: 'id', value: 'value' })
    );
    component.setRateType('id', RateType.Belts);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetRateTypeAction({ id: 'id', value: RateType.Belts })
    );
    component.setVia('id', 'value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaAction({ id: 'id', value: 'value' })
    );
    component.setViaSetting('id', 'value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaSettingAction({
        id: 'id',
        value: 'value',
        def: 'def',
      })
    );
    component.setViaFactoryModules('id', ['value'], ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaFactoryModulesAction({
        id: 'id',
        value: ['value'],
        def: ['def'],
      })
    );
    component.setViaBeaconCount('id', 'value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaBeaconCountAction({
        id: 'id',
        value: 'value',
        def: 'def',
      })
    );
    component.setViaBeacon('id', 'value', 'def');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaBeaconAction({ id: 'id', value: 'value', def: 'def' })
    );
    component.setViaBeaconModules('id', ['value'], ['def']);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaBeaconModulesAction({
        id: 'id',
        value: ['value'],
        def: ['def'],
      })
    );
    component.setViaOverclock('id', 0, 1);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.SetViaOverclockAction({ id: 'id', value: 0, def: 1 })
    );
    component.addProduct('value');
    expect(store.dispatch).toHaveBeenCalledWith(
      new Products.AddAction('value')
    );
    component.setDisplayRate(DisplayRate.PerHour, DisplayRate.PerMinute);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetDisplayRateAction({
        value: DisplayRate.PerHour,
        prev: DisplayRate.PerMinute,
      })
    );
  });
});
