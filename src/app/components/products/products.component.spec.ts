import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import { Product, RateType, RecipeField } from '~/models';
import { SharedModule } from '~/shared/shared.module';
import { LabState } from '~/store';
import * as Factories from '~/store/factories';
import * as Products from '~/store/products';
import * as Settings from '~/store/settings';
import { RecipeUtility } from '~/utilities';
import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductsComponent],
      imports: [SharedModule, TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeItem', () => {
    it('should edit a product item', () => {
      spyOn(component, 'setItem');
      component.changeItem(Mocks.Product1, ItemId.Coal);
      expect(component.setItem).toHaveBeenCalledWith(
        Mocks.Product1.id,
        ItemId.Coal
      );
    });

    it('should reset the rate type when changing a product that has no simple recipe', () => {
      spyOn(component, 'setRateType');
      spyOn(component, 'setItem');
      component.changeItem(Mocks.Product4, ItemId.PetroleumGas);
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
      viaFactoryModuleIds: new Array(4).fill(ItemId.SpeedModule2),
      viaBeaconId: ItemId.Beacon,
      viaBeaconModuleIds: new Array(2).fill(ItemId.SpeedModule2),
    };
    const productMismatch = {
      ...productMatch,
      ...{
        viaSetting: ItemId.AssemblingMachine2,
        viaFactoryModuleIds: new Array(2).fill(ItemId.SpeedModule2),
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

    it('should set up default for beacon (factory match)', () => {
      spyOn(component, 'setViaBeacon');
      component.changeRecipeField(
        productMatch,
        ItemId.Beacon,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.Beacon
      );
      expect(component.setViaBeacon).toHaveBeenCalledWith('0', ItemId.Beacon, ItemId.Beacon);
    });

    it('should set up default for beacon (factory mismatch)', () => {
      spyOn(component, 'setViaBeacon');
      component.changeRecipeField(
        productMismatch,
        ItemId.Beacon,
        RecipeId.WoodenChest,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.Beacon
      );
      expect(component.setViaBeacon).toHaveBeenCalledWith('0', ItemId.Beacon, ItemId.Beacon);
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
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('removeProduct', Products.RemoveAction);
    dispatch.idVal('setItem', Products.SetItemAction);
    dispatch.idVal('setRate', Products.SetRateAction);
    dispatch.idVal('setRateType', Products.SetRateTypeAction);
    dispatch.idVal('setVia', Products.SetViaAction);
    dispatch.idValDef('setViaSetting', Products.SetViaSettingAction);
    dispatch.idValDef(
      'setViaFactoryModules',
      Products.SetViaFactoryModulesAction
    );
    dispatch.idValDef('setViaBeaconCount', Products.SetViaBeaconCountAction);
    dispatch.idValDef('setViaBeacon', Products.SetViaBeaconAction);
    dispatch.idValDef(
      'setViaBeaconModules',
      Products.SetViaBeaconModulesAction
    );
    dispatch.idValDef('setViaOverclock', Products.SetViaOverclockAction);
    dispatch.val('addProduct', Products.AddAction);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
  });
});
