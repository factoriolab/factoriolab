import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { ExportService } from '~/services';
import {
  Items,
  LabState,
  Producers,
  Products,
  Recipes,
  Settings,
} from '~/store';
import { ListComponent } from './list.component';
import { ListModule } from './list.module';

enum DataTest {
  Export = 'lab-list-export',
}

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockStore: MockStore<LabState>;
  let exportSvc: ExportService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ListModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(Products.getSteps, Mocks.Steps);
    mockStore.overrideSelector(
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
    exportSvc = TestBed.inject(ExportService);
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
      spyOn(component, 'resetProducer');
      const step: Step = {
        id: '0',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
        producerId: '1',
      };
      component.resetStep(step);
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).toHaveBeenCalled();
      expect(component.resetProducer).toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('should call the export service', () => {
      spyOn(exportSvc, 'stepsToCsv');
      TestUtility.clickDt(fixture, DataTest.Export);
      fixture.detectChanges();
      expect(exportSvc.stepsToCsv).toHaveBeenCalled();
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
        Mocks.SettingsStateInitial,
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

  describe('changeRecipeField', () => {
    const step: Step = {
      id: '0',
      recipeId: RecipeId.WoodenChest,
      recipeSettings: Mocks.RationalRecipeSettingsInitial[RecipeId.WoodenChest],
    };

    it('should skip a step with no recipe', () => {
      spyOn(component, 'setFactory');
      component.changeRecipeField(
        { id: '0' },
        '1',
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.Factory
      );
      expect(component.setFactory).not.toHaveBeenCalled();
    });

    it('should set up default for factory', () => {
      spyOn(component, 'setFactory');
      component.changeRecipeField(
        step,
        ItemId.AssemblingMachine2,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.Factory
      );
      expect(component.setFactory).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.AssemblingMachine2,
        ItemId.AssemblingMachine3,
        false
      );
    });

    it('should set up default for factory modules', () => {
      spyOn(component, 'setFactoryModules');
      component.changeRecipeField(
        step,
        ItemId.SpeedModule3,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.FactoryModules,
        0
      );
      expect(component.setFactoryModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        new Array(4).fill(ItemId.SpeedModule3),
        new Array(4).fill(ItemId.SpeedModule3),
        false
      );
    });

    it('should set up default for beacon count', () => {
      spyOn(component, 'setBeaconCount');
      component.changeRecipeField(
        step,
        '4',
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.BeaconCount
      );
      expect(component.setBeaconCount).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        '4',
        '8',
        false
      );
    });

    it('should set up default for beacon', () => {
      spyOn(component, 'setBeacon');
      component.changeRecipeField(
        step,
        ItemId.Beacon,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.Beacon
      );
      expect(component.setBeacon).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.Beacon,
        ItemId.Beacon,
        false
      );
    });

    it('should set up default for beacon modules', () => {
      spyOn(component, 'setBeaconModules');
      component.changeRecipeField(
        step,
        ItemId.SpeedModule3,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.BeaconModules,
        0
      );
      expect(component.setBeaconModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        new Array(2).fill(ItemId.SpeedModule3),
        new Array(2).fill(ItemId.SpeedModule3),
        false
      );
    });

    it('should set up default for overclock', () => {
      spyOn(component, 'setOverclock');
      component.changeRecipeField(
        step,
        100,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset,
        RecipeField.Overclock
      );
      expect(component.setOverclock).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        100,
        undefined,
        false
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('ignoreItem', Items.IgnoreItemAction);
    dispatch.idValDef('setBelt', Items.SetBeltAction);
    dispatch.idValDef('setWagon', Items.SetWagonAction);
    dispatch.idValDef('setFactory', Recipes.SetFactoryAction);
    dispatch.idValDefAlt('setFactory', Producers.SetFactoryAction);
    dispatch.idValDef('setFactoryModules', Recipes.SetFactoryModulesAction);
    dispatch.idValDefAlt(
      'setFactoryModules',
      Producers.SetFactoryModulesAction
    );
    dispatch.idValDef('setBeaconCount', Recipes.SetBeaconCountAction);
    dispatch.idValDefAlt('setBeaconCount', Producers.SetBeaconCountAction);
    dispatch.idValDef('setBeacon', Recipes.SetBeaconAction);
    dispatch.idValDefAlt('setBeacon', Producers.SetBeaconAction);
    dispatch.idValDef('setBeaconModules', Recipes.SetBeaconModulesAction);
    dispatch.idValDefAlt('setBeaconModules', Producers.SetBeaconModulesAction);
    dispatch.idVal('setBeaconTotal', Recipes.SetBeaconTotalAction);
    dispatch.idValDef('setOverclock', Recipes.SetOverclockAction);
    dispatch.idValDefAlt('setOverclock', Producers.SetOverclockAction);
    dispatch.val('resetItem', Items.ResetItemAction);
    dispatch.val('resetRecipe', Recipes.ResetRecipeAction);
    dispatch.val('resetProducer', Producers.ResetProducerAction);
    dispatch.void('resetIgnores', Items.ResetIgnoresAction);
    dispatch.void('resetBelts', Items.ResetBeltsAction);
    dispatch.void('resetWagons', Items.ResetWagonsAction);
    dispatch.void('resetFactories', Recipes.ResetFactoriesAction);
    dispatch.void('resetBeacons', Recipes.ResetBeaconsAction);
    dispatch.valDef('setDisabledRecipes', Settings.SetDisabledRecipesAction);
    dispatch.idValDef('setDefaultRecipe', Items.SetRecipeAction);
  });
});
