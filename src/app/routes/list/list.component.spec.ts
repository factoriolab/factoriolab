import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

import {
  DispatchTest,
  ItemId,
  Mocks,
  RecipeId,
  TestModule,
  TestUtility,
} from 'src/tests';
import {
  Entities,
  RecipeField,
  Step,
  StepDetail,
  StepDetailTab,
} from '~/models';
import { RouterService } from '~/services';
import {
  Factories,
  Items,
  LabState,
  Products,
  Recipes,
  Settings,
} from '~/store';
import { ExportUtility, RecipeUtility } from '~/utilities';
import { ListComponent } from './list.component';
import { ListModule } from './list.module';

enum DataTest {
  Export = 'lab-list-export',
}

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let route: ActivatedRoute;
  let router: RouterService;
  let mockStore: MockStore<LabState>;
  let mockGetSteps: MemoizedSelector<LabState, Step[]>;
  let mockGetStepDetails: MemoizedSelector<LabState, Entities<StepDetail>>;
  let detectChanges: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ListModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    route = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(RouterService);
    mockStore = TestBed.inject(MockStore);
    mockGetSteps = mockStore.overrideSelector(Products.getSteps, Mocks.Steps);
    mockGetStepDetails = mockStore.overrideSelector(
      Products.getStepDetails,
      Mocks.Steps.reduce((e: Entities<StepDetail>, s) => {
        e[s.id] = {
          tabs: [
            { label: StepDetailTab.Item },
            { label: StepDetailTab.Recipe },
            { label: StepDetailTab.Factory },
          ],
          outputs: [],
          recipeIds: [],
          defaultableRecipeIds: [],
        };
        return e;
      }, {})
    );
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should scroll to and expand the fragment id', () => {
      const domEl = { scrollIntoView: (): void => {} };
      spyOn(domEl, 'scrollIntoView');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      TestUtility.assert(component.stepsTable != null);
      spyOn(component.stepsTable, 'toggleRow');
      component.fragmentId = Mocks.Step1.id;
      component.ngAfterViewInit();
      expect(domEl.scrollIntoView).toHaveBeenCalled();
      expect(component.stepsTable.toggleRow).toHaveBeenCalled();
    });

    it('should handle element not found', () => {
      component.fragmentId = Mocks.Step1.id;
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });
  });

  describe('resetStep', () => {
    it('should reset a step', () => {
      spyOn(component, 'resetItem');
      spyOn(component, 'resetRecipe');
      component.resetStep(Mocks.Step1);
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('should call the export utility', () => {
      spyOn(ExportUtility, 'stepsToCsv');
      TestUtility.clickDt(fixture, DataTest.Export);
      fixture.detectChanges();
      expect(ExportUtility.stepsToCsv).toHaveBeenCalled();
    });
  });

  describe('toggleDefaultRecipe', () => {
    it('should reset a default recipe to null', () => {
      spyOn(component, 'setDefaultRecipe');
      const itemSettings = {
        ...Mocks.ItemSettingsInitial,
        ...{
          [ItemId.Coal]: {
            ...Mocks.ItemSettingsInitial[ItemId.Coal],
            ...{
              recipeId: RecipeId.Coal,
            },
          },
        },
      };
      component.toggleDefaultRecipe(
        ItemId.Coal,
        RecipeId.Coal,
        itemSettings,
        Settings.initialSettingsState,
        Mocks.AdjustedData
      );
      expect(component.setDefaultRecipe).toHaveBeenCalledWith(ItemId.Coal);
    });

    it('should set a default recipe', () => {
      spyOn(component, 'setDefaultRecipe');
      component.toggleDefaultRecipe(
        ItemId.Coal,
        RecipeId.Coal,
        Mocks.ItemSettingsInitial,
        Mocks.SettingsState1,
        Mocks.AdjustedData
      );
      expect(component.setDefaultRecipe).toHaveBeenCalledWith(
        ItemId.Coal,
        RecipeId.Coal,
        RecipeId.Coal
      );
    });

    it('should handle null disabled recipes', () => {
      spyOn(component, 'setDefaultRecipe');
      component.toggleDefaultRecipe(
        ItemId.Coal,
        RecipeId.Coal,
        Mocks.ItemSettingsInitial,
        Settings.initialSettingsState,
        Mocks.AdjustedData
      );
      expect(component.setDefaultRecipe).toHaveBeenCalledWith(
        ItemId.Coal,
        RecipeId.Coal,
        RecipeId.Coal
      );
    });
  });

  describe('toggleRecipe', () => {
    it('should enable a recipe', () => {
      spyOn(component, 'setDisabledRecipes');
      const settings = {
        ...Settings.initialSettingsState,
        ...{ disabledRecipeIds: [RecipeId.AdvancedOilProcessing] },
      };
      const data = { ...Mocks.AdjustedData, ...{ defaults: undefined } };
      component.toggleRecipe(RecipeId.AdvancedOilProcessing, settings, data);
      expect(component.setDisabledRecipes).toHaveBeenCalledWith([], undefined);
    });

    it('should disable a recipe', () => {
      spyOn(component, 'setDisabledRecipes');
      component.toggleRecipe(
        RecipeId.AdvancedOilProcessing,
        Settings.initialSettingsState,
        Mocks.AdjustedData
      );
      expect(component.setDisabledRecipes).toHaveBeenCalledWith(
        [RecipeId.AdvancedOilProcessing],
        Mocks.AdjustedData.defaults?.disabledRecipeIds
      );
    });
  });

  describe('changeFactory', () => {
    it('should set up default for factory', () => {
      spyOn(RecipeUtility, 'bestMatch').and.returnValue('default');
      spyOn(component, 'setFactory');
      component.changeFactory(
        RecipeId.AdvancedCircuit,
        'value',
        Mocks.FactorySettingsInitial,
        Mocks.AdjustedData
      );
      expect(component.setFactory).toHaveBeenCalledWith(
        RecipeId.AdvancedCircuit,
        'value',
        'default'
      );
    });

    it('should handle null factory ids', () => {
      spyOn(RecipeUtility, 'bestMatch').and.returnValue('default');
      spyOn(component, 'setFactory');
      component.changeFactory(
        RecipeId.AdvancedCircuit,
        'value',
        Factories.initialFactoriesState,
        Mocks.AdjustedData
      );
      expect(component.setFactory).toHaveBeenCalledWith(
        RecipeId.AdvancedCircuit,
        'value',
        'default'
      );
    });
  });

  describe('changeRecipeField', () => {
    it('should set up default for factory modules', () => {
      spyOn(component, 'setFactoryModules');
      component.changeRecipeField(
        RecipeId.WoodenChest,
        ItemId.SpeedModule3,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.FactoryModules,
        0,
        Mocks.AdjustedData
      );
      expect(component.setFactoryModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        new Array(4).fill(ItemId.SpeedModule3),
        new Array(4).fill(ItemId.SpeedModule3)
      );
    });

    it('should set up default for beacon count', () => {
      spyOn(component, 'setBeaconCount');
      component.changeRecipeField(
        RecipeId.WoodenChest,
        '4',
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.BeaconCount
      );
      expect(component.setBeaconCount).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        '4',
        '8'
      );
    });

    it('should set up default for beacon', () => {
      spyOn(component, 'setBeacon');
      component.changeRecipeField(
        RecipeId.WoodenChest,
        ItemId.Beacon,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.Beacon
      );
      expect(component.setBeacon).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.Beacon,
        ItemId.Beacon
      );
    });

    it('should set up default for beacon modules', () => {
      spyOn(component, 'setBeaconModules');
      component.changeRecipeField(
        RecipeId.WoodenChest,
        ItemId.SpeedModule3,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.BeaconModules,
        0
      );
      expect(component.setBeaconModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        new Array(2).fill(ItemId.SpeedModule3),
        new Array(2).fill(ItemId.SpeedModule3)
      );
    });

    it('should set up default for overclock', () => {
      spyOn(component, 'setOverclock');
      component.changeRecipeField(
        RecipeId.WoodenChest,
        100,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        RecipeField.Overclock
      );
      expect(component.setOverclock).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        100,
        undefined
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('ignoreItem', Items.IgnoreItemAction);
    dispatch.idValDef('setBelt', Items.SetBeltAction);
    dispatch.idValDef('setWagon', Items.SetWagonAction);
    dispatch.idValDef('setFactory', Recipes.SetFactoryAction);
    dispatch.idValDef('setFactoryModules', Recipes.SetFactoryModulesAction);
    dispatch.idValDef('setBeaconCount', Recipes.SetBeaconCountAction);
    dispatch.idValDef('setBeacon', Recipes.SetBeaconAction);
    dispatch.idValDef('setBeaconModules', Recipes.SetBeaconModulesAction);
    dispatch.idVal('setBeaconTotal', Recipes.SetBeaconTotalAction);
    dispatch.idValDef('setOverclock', Recipes.SetOverclockAction);
    dispatch.val('resetItem', Items.ResetItemAction);
    dispatch.val('resetRecipe', Recipes.ResetRecipeAction);
    dispatch.void('resetIgnores', Items.ResetIgnoresAction);
    dispatch.void('resetBelts', Items.ResetBeltsAction);
    dispatch.void('resetWagons', Items.ResetWagonsAction);
    dispatch.void('resetFactories', Recipes.ResetFactoriesAction);
    dispatch.void('resetBeacons', Recipes.ResetBeaconsAction);
    dispatch.valDef('setDisabledRecipes', Settings.SetDisabledRecipesAction);
    dispatch.idValDef('setDefaultRecipe', Items.SetRecipeAction);
  });
});
