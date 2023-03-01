import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
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
import { Items, LabState, Producers, Products, Recipes } from '~/store';
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
            { label: StepDetailTab.Machine },
          ],
          outputs: [],
          recipeIds: [],
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
    it('should scroll to and expand the fragment id', fakeAsync(() => {
      const domEl = { scrollIntoView: (): void => {} };
      spyOn(domEl, 'scrollIntoView');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      TestUtility.assert(component.stepsTable != null);
      spyOn(component.stepsTable, 'toggleRow');
      component.fragmentId = 'step_' + Mocks.Step1.id;
      component.ngAfterViewInit();
      tick(100);
      expect(component.stepsTable.toggleRow).toHaveBeenCalled();
      expect(domEl.scrollIntoView).toHaveBeenCalled();
    }));

    it('should scroll to and open tab for the fragment id', fakeAsync(() => {
      const domEl = { click: (): void => {} };
      spyOn(domEl, 'click');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      TestUtility.assert(component.stepsTable != null);
      spyOn(component.stepsTable, 'toggleRow');
      component.fragmentId = 'step_' + Mocks.Step1.id + '_item';
      component.ngAfterViewInit();
      tick(100);
      expect(component.stepsTable.toggleRow).toHaveBeenCalled();
      expect(domEl.click).toHaveBeenCalled();
    }));

    it('should handle element not found', () => {
      component.fragmentId = Mocks.Step1.id;
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });
  });

  describe('resetStep', () => {
    beforeEach(() => {
      spyOn(component, 'resetItem');
      spyOn(component, 'resetRecipe');
      spyOn(component, 'resetProducer');
    });

    it('should reset a producer step', () => {
      const step: Step = {
        id: '0',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '1',
      };
      component.resetStep(step);
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).not.toHaveBeenCalled();
      expect(component.resetProducer).toHaveBeenCalled();
    });

    it('should reset a recipe step', () => {
      const step: Step = {
        id: '0',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
      };
      component.resetStep(step);
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).toHaveBeenCalled();
      expect(component.resetProducer).not.toHaveBeenCalled();
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

  // describe('toggleRecipe', () => {
  //   it('should enable a recipe', () => {
  //     spyOn(component, 'setExcludedRecipes');
  //     const settings = {
  //       ...Settings.initialSettingsState,
  //       ...{ excludedRecipeIds: [RecipeId.AdvancedOilProcessing] },
  //     };
  //     const data = { ...Mocks.AdjustedData, ...{ defaults: undefined } };
  //     component.toggleRecipe(RecipeId.AdvancedOilProcessing, settings, data);
  //     expect(component.setExcludedRecipes).toHaveBeenCalledWith([], undefined);
  //   });

  //   it('should disable a recipe', () => {
  //     spyOn(component, 'setExcludedRecipes');
  //     component.toggleRecipe(
  //       RecipeId.AdvancedOilProcessing,
  //       Settings.initialSettingsState,
  //       Mocks.AdjustedData
  //     );
  //     expect(component.setExcludedRecipes).toHaveBeenCalledWith(
  //       [RecipeId.AdvancedOilProcessing],
  //       Mocks.AdjustedData.defaults?.excludedRecipeIds
  //     );
  //   });
  // });

  describe('changeRecipeField', () => {
    const step: Step = {
      id: '0',
      recipeId: RecipeId.WoodenChest,
      recipeSettings: Mocks.RationalRecipeSettingsInitial[RecipeId.WoodenChest],
    };

    it('should skip a step with no recipe', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(
        { id: '0' },
        '1',
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.Machine
      );
      expect(component.setMachine).not.toHaveBeenCalled();
    });

    it('should set up default for machine', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(
        step,
        ItemId.AssemblingMachine2,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.Machine
      );
      expect(component.setMachine).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.AssemblingMachine2,
        ItemId.AssemblingMachine3,
        false
      );
    });

    it('should set up default for machine modules', () => {
      spyOn(component, 'setMachineModules');
      component.changeRecipeField(
        step,
        ItemId.SpeedModule3,
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.MachineModules,
        0
      );
      expect(component.setMachineModules).toHaveBeenCalledWith(
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
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.BeaconCount,
        0
      );
      expect(component.setBeaconCount).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
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
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.Beacon,
        0
      );
      expect(component.setBeacon).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
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
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.BeaconModules,
        0,
        0
      );
      expect(component.setBeaconModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
        new Array(2).fill(ItemId.SpeedModule3),
        new Array(2).fill(ItemId.SpeedModule3),
        false
      );
    });

    it('should call to set the beacon total', () => {
      spyOn(component, 'setBeaconTotal');
      component.changeRecipeField(
        step,
        '8',
        Mocks.MachineSettingsInitial,
        Mocks.Dataset,
        RecipeField.BeaconTotal,
        0
      );
      expect(component.setBeaconTotal).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
        '8',
        false
      );
    });

    it('should set up default for overclock', () => {
      spyOn(component, 'setOverclock');
      component.changeRecipeField(
        step,
        100,
        Mocks.MachineSettingsInitial,
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

  describe('changeStepChecked', () => {
    it('should set for an item step', () => {
      spyOn(component, 'setItemChecked');
      component.changeStepChecked({ id: '0', itemId: ItemId.Coal }, true);
      expect(component.setItemChecked).toHaveBeenCalledWith(ItemId.Coal, true);
    });

    it('should set for a producer step', () => {
      spyOn(component, 'setRecipeChecked');
      component.changeStepChecked(
        { id: '0', recipeObjectiveId: '1', recipeId: RecipeId.Coal },
        true
      );
      expect(component.setRecipeChecked).toHaveBeenCalledWith('1', true, true);
    });

    it('should set for a recipe step', () => {
      spyOn(component, 'setRecipeChecked');
      component.changeStepChecked({ id: '0', recipeId: RecipeId.Coal }, true);
      expect(component.setRecipeChecked).toHaveBeenCalledWith(
        RecipeId.Coal,
        true
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.idVal('setItemExcluded', Items.SetExcludedAction);
    dispatch.idValDef('setBelt', Items.SetBeltAction);
    dispatch.idValDef('setWagon', Items.SetWagonAction);
    dispatch.idVal('setItemChecked', Items.SetCheckedAction);
    dispatch.idValDef('setMachine', Recipes.SetMachineAction);
    dispatch.idValDefAlt('setMachine', Producers.SetMachineAction);
    dispatch.idValDef('setMachineModules', Recipes.SetMachineModulesAction);
    dispatch.idValDefAlt(
      'setMachineModules',
      Producers.SetMachineModulesAction
    );
    dispatch.val('addBeacon', Recipes.AddBeaconAction);
    dispatch.valAlt('addBeacon', Producers.AddBeaconAction);
    dispatch.idVal('removeBeacon', Recipes.RemoveBeaconAction);
    dispatch.idValAlt('removeBeacon', Producers.RemoveBeaconAction);
    dispatch.idIndValDef('setBeaconCount', Recipes.SetBeaconCountAction);
    dispatch.idIndValDefAlt('setBeaconCount', Producers.SetBeaconCountAction);
    dispatch.idIndValDef('setBeacon', Recipes.SetBeaconAction);
    dispatch.idIndValDefAlt('setBeacon', Producers.SetBeaconAction);
    dispatch.idIndValDef('setBeaconModules', Recipes.SetBeaconModulesAction);
    dispatch.idIndValDefAlt(
      'setBeaconModules',
      Producers.SetBeaconModulesAction
    );
    dispatch.idIndVal('setBeaconTotal', Recipes.SetBeaconTotalAction);
    dispatch.idIndValAlt('setBeaconTotal', Producers.SetBeaconTotalAction);
    dispatch.idValDef('setOverclock', Recipes.SetOverclockAction);
    dispatch.idValDefAlt('setOverclock', Producers.SetOverclockAction);
    dispatch.idVal('setRecipeChecked', Recipes.SetCheckedAction);
    dispatch.idValAlt('setRecipeChecked', Producers.SetCheckedAction);
    dispatch.val('resetItem', Items.ResetItemAction);
    dispatch.val('resetRecipe', Recipes.ResetRecipeAction);
    dispatch.val('resetProducer', Producers.ResetObjectiveAction);
    dispatch.void('resetChecked', Items.ResetCheckedAction);
    dispatch.void('resetExcluded', Items.ResetExcludedAction);
    dispatch.void('resetBelts', Items.ResetBeltsAction);
    dispatch.void('resetWagons', Items.ResetWagonsAction);
    dispatch.void('resetMachines', Recipes.ResetMachinesAction);
    dispatch.void('resetBeacons', Recipes.ResetBeaconsAction);
  });
});
