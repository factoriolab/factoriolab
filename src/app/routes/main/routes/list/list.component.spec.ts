import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
import { AppSharedModule } from '~/app-shared.module';
import {
  Entities,
  RecipeField,
  Step,
  StepDetail,
  StepDetailTab,
} from '~/models';
import { RouterService } from '~/services';
import { LabState, Products } from '~/store';
import { ExportUtility, RecipeUtility } from '~/utilities';
import { ListComponent } from './list.component';

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
      declarations: [ListComponent, ListComponent],
      imports: [TestModule, AppSharedModule],
    }).compileComponents();
  });

  beforeEach(() => {
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

  // describe('ngOnChanges', () => {
  //   it('should expand the selected step', () => {
  //     component.selectedId = Mocks.Step1.id;
  //     fixture.detectChanges();
  //     expect(component.child.expanded).toEqual({
  //       [Mocks.Step1.id]: StepDetailTab.Item,
  //     });
  //   });

  //   it('should handle no matching step', () => {
  //     component.selectedId = 'id';
  //     fixture.detectChanges();
  //     expect(component.child.expanded).toEqual({});
  //   });
  // });

  // describe('ngAfterViewInit', () => {
  //   it('should scroll to and expand the fragment id', () => {
  //     const domEl = { scrollIntoView: (): void => {} };
  //     spyOn(domEl, 'scrollIntoView');
  //     spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
  //     component.child.fragmentId = Mocks.Step1.id;
  //     component.child.ngAfterViewInit();
  //     expect(domEl.scrollIntoView).toHaveBeenCalled();
  //     expect(component.child.expanded).toEqual({
  //       [Mocks.Step1.id]: StepDetailTab.Item,
  //     });
  //   });

  //   it('should handle element not found', () => {
  //     component.child.fragmentId = Mocks.Step1.id;
  //     expect(() => component.child.ngAfterViewInit()).not.toThrow();
  //   });
  // });

  // describe('syncDetailTabs', () => {
  //   it('should collapse a tab that no longer has details', () => {
  //     component.child.expanded['id'] = StepDetailTab.Item;
  //     mockGetSteps.setResult([]);
  //     mockGetStepDetails.setResult({});
  //     mockStore.refreshState();
  //     fixture.detectChanges();
  //     expect(component.child.expanded).toEqual({});
  //     expect(detectChanges).toHaveBeenCalled();
  //   });

  //   it('should collapse a tab that no longer exists', () => {
  //     component.child.expanded['id'] = StepDetailTab.Item;
  //     mockGetSteps.setResult([]);
  //     mockGetStepDetails.setResult({});
  //     mockStore.refreshState();
  //     fixture.detectChanges();
  //     expect(component.child.expanded).toEqual({});
  //     expect(detectChanges).toHaveBeenCalled();
  //   });

  //   it('should pick a different detail tab', () => {
  //     component.child.expanded[Mocks.Step1.id] = StepDetailTab.Recipes;
  //     mockGetStepDetails.setResult(
  //       Mocks.Steps.reduce((e: Entities<StepDetail>, s) => {
  //         e[s.id] = {
  //           tabs: [StepDetailTab.Item],
  //           outputs: [],
  //           recipeIds: [],
  //           defaultableRecipeIds: [],
  //         };
  //         return e;
  //       }, {})
  //     );
  //     mockStore.refreshState();
  //     fixture.detectChanges();
  //     expect(component.child.expanded).toEqual({
  //       [Mocks.Step1.id]: StepDetailTab.Item,
  //     });
  //     expect(detectChanges).toHaveBeenCalled();
  //   });
  // });

  // describe('resetStep', () => {
  //   it('should reset a step', () => {
  //     spyOn(component.child, 'resetItem');
  //     spyOn(component.child, 'resetRecipe');
  //     component.child.resetStep(Mocks.Step1);
  //     expect(component.child.resetItem).toHaveBeenCalled();
  //     expect(component.child.resetRecipe).toHaveBeenCalled();
  //   });
  // });

  // describe('export', () => {
  //   it('should call the export utility', () => {
  //     spyOn(ExportUtility, 'stepsToCsv');
  //     TestUtility.clickDt(fixture, DataTest.Export);
  //     fixture.detectChanges();
  //     expect(ExportUtility.stepsToCsv).toHaveBeenCalled();
  //   });
  // });

  // describe('toggleDefaultRecipe', () => {
  //   it('should reset a default recipe to null', () => {
  //     spyOn(component.child, 'setDefaultRecipe');
  //     const itemSettings = {
  //       ...Mocks.ItemSettingsInitial,
  //       ...{
  //         [ItemId.Coal]: {
  //           ...Mocks.ItemSettingsInitial[ItemId.Coal],
  //           ...{
  //             recipeId: RecipeId.Coal,
  //           },
  //         },
  //       },
  //     };
  //     component.child.toggleDefaultRecipe(
  //       ItemId.Coal,
  //       RecipeId.Coal,
  //       itemSettings,
  //       Settings.initialSettingsState,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setDefaultRecipe).toHaveBeenCalledWith(
  //       ItemId.Coal
  //     );
  //   });

  //   it('should set a default recipe', () => {
  //     spyOn(component.child, 'setDefaultRecipe');
  //     component.child.toggleDefaultRecipe(
  //       ItemId.Coal,
  //       RecipeId.Coal,
  //       Mocks.ItemSettingsInitial,
  //       Mocks.SettingsState1,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setDefaultRecipe).toHaveBeenCalledWith(
  //       ItemId.Coal,
  //       RecipeId.Coal,
  //       RecipeId.Coal
  //     );
  //   });

  //   it('should handle null disabled recipes', () => {
  //     spyOn(component.child, 'setDefaultRecipe');
  //     component.child.toggleDefaultRecipe(
  //       ItemId.Coal,
  //       RecipeId.Coal,
  //       Mocks.ItemSettingsInitial,
  //       Settings.initialSettingsState,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setDefaultRecipe).toHaveBeenCalledWith(
  //       ItemId.Coal,
  //       RecipeId.Coal,
  //       RecipeId.Coal
  //     );
  //   });
  // });

  // describe('toggleRecipe', () => {
  //   it('should enable a recipe', () => {
  //     spyOn(component.child, 'setDisabledRecipes');
  //     const settings = {
  //       ...Settings.initialSettingsState,
  //       ...{ disabledRecipeIds: [RecipeId.AdvancedOilProcessing] },
  //     };
  //     const data = { ...Mocks.AdjustedData, ...{ defaults: undefined } };
  //     component.child.toggleRecipe(
  //       RecipeId.AdvancedOilProcessing,
  //       settings,
  //       data
  //     );
  //     expect(component.child.setDisabledRecipes).toHaveBeenCalledWith(
  //       [],
  //       undefined
  //     );
  //   });

  //   it('should disable a recipe', () => {
  //     spyOn(component.child, 'setDisabledRecipes');
  //     component.child.toggleRecipe(
  //       RecipeId.AdvancedOilProcessing,
  //       Settings.initialSettingsState,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setDisabledRecipes).toHaveBeenCalledWith(
  //       [RecipeId.AdvancedOilProcessing],
  //       Mocks.AdjustedData.defaults?.disabledRecipeIds
  //     );
  //   });
  // });

  // describe('changeFactory', () => {
  //   it('should set up default for factory', () => {
  //     spyOn(RecipeUtility, 'bestMatch').and.returnValue('default');
  //     spyOn(component.child, 'setFactory');
  //     component.child.changeFactory(
  //       RecipeId.AdvancedCircuit,
  //       'value',
  //       Mocks.FactorySettingsInitial,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setFactory).toHaveBeenCalledWith(
  //       RecipeId.AdvancedCircuit,
  //       'value',
  //       'default'
  //     );
  //   });

  //   it('should handle null factory ids', () => {
  //     spyOn(RecipeUtility, 'bestMatch').and.returnValue('default');
  //     spyOn(component.child, 'setFactory');
  //     component.child.changeFactory(
  //       RecipeId.AdvancedCircuit,
  //       'value',
  //       Factories.initialFactoriesState,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setFactory).toHaveBeenCalledWith(
  //       RecipeId.AdvancedCircuit,
  //       'value',
  //       'default'
  //     );
  //   });
  // });

  // describe('changeRecipeField', () => {
  //   it('should set up default for factory modules', () => {
  //     spyOn(component.child, 'setFactoryModules');
  //     component.child.changeRecipeField(
  //       RecipeId.WoodenChest,
  //       ItemId.SpeedModule3,
  //       Mocks.RecipeSettingsInitial,
  //       Mocks.FactorySettingsInitial,
  //       RecipeField.FactoryModules,
  //       0,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.child.setFactoryModules).toHaveBeenCalledWith(
  //       RecipeId.WoodenChest,
  //       new Array(4).fill(ItemId.SpeedModule3),
  //       new Array(4).fill(ItemId.SpeedModule3)
  //     );
  //   });

  //   it('should set up default for beacon count', () => {
  //     spyOn(component.child, 'setBeaconCount');
  //     component.child.changeRecipeField(
  //       RecipeId.WoodenChest,
  //       '4',
  //       Mocks.RecipeSettingsInitial,
  //       Mocks.FactorySettingsInitial,
  //       RecipeField.BeaconCount
  //     );
  //     expect(component.child.setBeaconCount).toHaveBeenCalledWith(
  //       RecipeId.WoodenChest,
  //       '4',
  //       '8'
  //     );
  //   });

  //   it('should set up default for beacon', () => {
  //     spyOn(component.child, 'setBeacon');
  //     component.child.changeRecipeField(
  //       RecipeId.WoodenChest,
  //       ItemId.Beacon,
  //       Mocks.RecipeSettingsInitial,
  //       Mocks.FactorySettingsInitial,
  //       RecipeField.Beacon
  //     );
  //     expect(component.child.setBeacon).toHaveBeenCalledWith(
  //       RecipeId.WoodenChest,
  //       ItemId.Beacon,
  //       ItemId.Beacon
  //     );
  //   });

  //   it('should set up default for beacon modules', () => {
  //     spyOn(component.child, 'setBeaconModules');
  //     component.child.changeRecipeField(
  //       RecipeId.WoodenChest,
  //       ItemId.SpeedModule3,
  //       Mocks.RecipeSettingsInitial,
  //       Mocks.FactorySettingsInitial,
  //       RecipeField.BeaconModules,
  //       0
  //     );
  //     expect(component.child.setBeaconModules).toHaveBeenCalledWith(
  //       RecipeId.WoodenChest,
  //       new Array(2).fill(ItemId.SpeedModule3),
  //       new Array(2).fill(ItemId.SpeedModule3)
  //     );
  //   });

  //   it('should set up default for overclock', () => {
  //     spyOn(component.child, 'setOverclock');
  //     component.child.changeRecipeField(
  //       RecipeId.WoodenChest,
  //       { target: { valueAsNumber: 100 } } as any,
  //       Mocks.RecipeSettingsInitial,
  //       Mocks.FactorySettingsInitial,
  //       RecipeField.Overclock
  //     );
  //     expect(component.child.setOverclock).toHaveBeenCalledWith(
  //       RecipeId.WoodenChest,
  //       100,
  //       undefined
  //     );
  //   });
  // });

  // it('should dispatch actions', () => {
  //   const dispatch = new DispatchTest(mockStore, component);
  //   dispatch.val('ignoreItem', Items.IgnoreItemAction);
  //   dispatch.idValDef('setBelt', Items.SetBeltAction);
  //   dispatch.idValDef('setWagon', Items.SetWagonAction);
  //   dispatch.idValDef('setFactory', Recipes.SetFactoryAction);
  //   dispatch.idValDef('setFactoryModules', Recipes.SetFactoryModulesAction);
  //   dispatch.idValDef('setBeaconCount', Recipes.SetBeaconCountAction);
  //   dispatch.idValDef('setBeacon', Recipes.SetBeaconAction);
  //   dispatch.idValDef('setBeaconModules', Recipes.SetBeaconModulesAction);
  //   dispatch.idVal('setBeaconTotal', Recipes.SetBeaconTotalAction);
  //   dispatch.idValDef('setOverclock', Recipes.SetOverclockAction);
  //   dispatch.val('resetItem', Items.ResetItemAction);
  //   dispatch.val('resetRecipe', Recipes.ResetRecipeAction);
  //   dispatch.void('resetIgnore', Items.ResetIgnoresAction);
  //   dispatch.void('resetBelt', Items.ResetBeltsAction);
  //   dispatch.void('resetWagon', Items.ResetWagonsAction);
  //   dispatch.void('resetFactory', Recipes.ResetFactoriesAction);
  //   dispatch.void('resetOverclock', Recipes.ResetOverclocksAction);
  //   dispatch.void('resetBeacons', Recipes.ResetBeaconsAction);
  //   dispatch.valDef('setDisabledRecipes', Settings.SetDisabledRecipesAction);
  //   dispatch.idValDef('setDefaultRecipe', Items.SetRecipeAction);
  // });
});
