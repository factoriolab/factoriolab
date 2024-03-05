import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { MenuItem, SortEvent } from 'primeng/api';

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
import { Items, LabState, Objectives, Preferences, Recipes } from '~/store';
import { StepsComponent } from './steps.component';

enum DataTest {
  Export = 'lab-list-export',
}

describe('StepsComponent', () => {
  let component: StepsComponent;
  let fixture: ComponentFixture<StepsComponent>;
  let mockStore: MockStore<LabState>;
  let exportSvc: ExportService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepsComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(StepsComponent);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(Objectives.getSteps, Mocks.Steps);
    mockStore.overrideSelector(
      Objectives.getStepDetails,
      Mocks.Steps.reduce((e: Entities<StepDetail>, s) => {
        e[s.id] = {
          tabs: [
            { label: StepDetailTab.Item },
            { label: StepDetailTab.Recipe },
            { label: StepDetailTab.Machine },
          ],
          outputs: [],
          recipeIds: [],
          allRecipesIncluded: true,
        };
        return e;
      }, {}),
    );
    exportSvc = TestBed.inject(ExportService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('steps$', () => {
    it('should handle focused mode', () => {
      let steps: Step[] | undefined;
      component.steps$.subscribe((s) => (steps = s));
      component.focus = true;
      expect(steps).toEqual([]);
    });
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

  describe('sortSteps', () => {
    it('should call when sorting is updated', () => {
      spyOn(component, 'sortSteps');
      component.sortSteps$.next(null);
      expect(component.sortSteps).toHaveBeenCalled();
    });

    it('should skip if conditions are not met', () => {
      const curr = {
        order: -1,
        data: [...Mocks.Steps],
      } as SortEvent;
      component.sortSteps(null, curr, Mocks.Steps);
      expect(curr.data).toEqual(Mocks.Steps);
    });

    it('should sort the steps based on the passed field', () => {
      const curr = {
        order: -1,
        field: 'belts',
        data: [...Mocks.Steps],
      } as SortEvent;
      component.sortSteps(null, curr, Mocks.Steps);
      expect(curr.data![0]).not.toEqual(Mocks.Steps[0]);
    });

    it('should handle missing values', () => {
      const curr = {
        order: -1,
        field: 'fake',
        data: [...Mocks.Steps],
      } as SortEvent;
      component.sortSteps(null, curr, Mocks.Steps);
      expect(curr.data).toEqual(Mocks.Steps);
    });

    it('should reset on third column click', () => {
      const prev = {
        order: 1,
        field: 'items',
      } as SortEvent;
      const curr = {
        order: -1,
        field: 'items',
        data: [...Mocks.Steps],
      } as SortEvent;
      spyOn(component.stepsTable!, 'reset');
      spyOn(component.sortSteps$, 'next');
      component.sortSteps(prev, curr, Mocks.Steps);
      expect(component.stepsTable!.reset).toHaveBeenCalled();
      expect(component.sortSteps$.next).toHaveBeenCalled();
    });
  });

  describe('setActiveItems', () => {
    it('should try to restore old active detail tab', () => {
      const tab1: MenuItem = { label: 'tab1' };
      const tab2: MenuItem = { label: 'tab2' };
      component.activeItem = { ['2']: tab2, ['3']: tab2 };
      component.setActiveItems(
        [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }],
        {
          ['1']: {
            tabs: [tab1],
            outputs: [],
            recipeIds: [],
            allRecipesIncluded: true,
          },
          ['2']: {
            tabs: [tab1, tab2],
            outputs: [],
            recipeIds: [],
            allRecipesIncluded: true,
          },
          ['3']: {
            tabs: [tab1],
            outputs: [],
            recipeIds: [],
            allRecipesIncluded: true,
          },
        },
      );
      expect(component.activeItem).toEqual({
        ['1']: tab1,
        ['2']: tab2,
        ['3']: tab1,
      });
    });
  });

  describe('setActiveItem', () => {
    it('should cache the active detail tab', () => {
      const tab1: MenuItem = { label: 'tab1' };
      component.setActiveItem({ id: '0' }, tab1);
      expect(component.activeItem['0']).toEqual(tab1);
    });
  });

  describe('resetStep', () => {
    beforeEach(() => {
      spyOn(component, 'resetItem');
      spyOn(component, 'resetRecipe');
      spyOn(component, 'resetRecipeObjective');
    });

    it('should reset a recipe objective step', () => {
      const step: Step = {
        id: '0',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '1',
      };
      component.resetStep(step);
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).not.toHaveBeenCalled();
      expect(component.resetRecipeObjective).toHaveBeenCalled();
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
      expect(component.resetRecipeObjective).not.toHaveBeenCalled();
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

  describe('toggleRecipes', () => {
    it('should toggle a set of recipes', () => {
      spyOn(component, 'setRecipeExcludedBatch');
      component.toggleRecipes(
        [RecipeId.AdvancedOilProcessing],
        true,
        {} as any,
      );
      expect(component.setRecipeExcludedBatch).toHaveBeenCalledWith([
        { id: RecipeId.AdvancedOilProcessing, value: true, def: false },
      ]);
    });
  });

  describe('toggleRecipe', () => {
    it('should disable a recipe', () => {
      spyOn(component, 'setRecipeExcluded');
      const data = { ...Mocks.Dataset, ...{ defaults: undefined } };
      component.toggleRecipe(
        RecipeId.AdvancedOilProcessing,
        Mocks.RecipesStateInitial,
        data,
      );
      expect(component.setRecipeExcluded).toHaveBeenCalledWith(
        RecipeId.AdvancedOilProcessing,
        true,
        false,
      );
    });

    it('should enable a recipe', () => {
      spyOn(component, 'setRecipeExcluded');
      component.toggleRecipe(
        RecipeId.NuclearFuelReprocessing,
        Mocks.RecipesStateInitial,
        Mocks.Dataset,
      );
      expect(component.setRecipeExcluded).toHaveBeenCalledWith(
        RecipeId.NuclearFuelReprocessing,
        false,
        true,
      );
    });
  });

  describe('changeRecipeField', () => {
    const step: Step = {
      id: '0',
      recipeId: RecipeId.WoodenChest,
      recipeSettings: Mocks.RecipesStateRationalInitial[RecipeId.WoodenChest],
    };

    it('should skip a step with no recipe', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(
        { id: '0' },
        '1',
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.Machine,
      );
      expect(component.setMachine).not.toHaveBeenCalled();
    });

    it('should set up default for machine', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(
        step,
        ItemId.AssemblingMachine2,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.Machine,
      );
      expect(component.setMachine).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.AssemblingMachine2,
        ItemId.AssemblingMachine3,
        false,
      );
    });

    it('should set up default for fuel', () => {
      spyOn(component, 'setFuel');
      component.changeRecipeField(
        step,
        ItemId.Coal,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.Fuel,
      );
      expect(component.setFuel).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.Coal,
        undefined,
        false,
      );
    });

    it('should set up default for machine modules', () => {
      spyOn(component, 'setMachineModules');
      component.changeRecipeField(
        step,
        ItemId.SpeedModule3,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.MachineModules,
        0,
      );
      expect(component.setMachineModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        new Array(4).fill(ItemId.SpeedModule3),
        new Array(4).fill(ItemId.SpeedModule3),
        false,
      );
    });

    it('should set up default for beacon count', () => {
      spyOn(component, 'setBeaconCount');
      component.changeRecipeField(
        step,
        '4',
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.BeaconCount,
        0,
      );
      expect(component.setBeaconCount).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
        '4',
        '8',
        false,
      );
    });

    it('should set up default for beacon', () => {
      spyOn(component, 'setBeacon');
      component.changeRecipeField(
        step,
        ItemId.Beacon,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.Beacon,
        0,
      );
      expect(component.setBeacon).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
        ItemId.Beacon,
        ItemId.Beacon,
        false,
      );
    });

    it('should set up default for beacon modules', () => {
      spyOn(component, 'setBeaconModules');
      component.changeRecipeField(
        step,
        ItemId.SpeedModule3,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.BeaconModules,
        0,
        0,
      );
      expect(component.setBeaconModules).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
        new Array(2).fill(ItemId.SpeedModule3),
        new Array(2).fill(ItemId.SpeedModule3),
        false,
      );
    });

    it('should call to set the beacon total', () => {
      spyOn(component, 'setBeaconTotal');
      component.changeRecipeField(
        step,
        '8',
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.BeaconTotal,
        0,
      );
      expect(component.setBeaconTotal).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        0,
        '8',
        false,
      );
    });

    it('should set up default for overclock', () => {
      spyOn(component, 'setOverclock');
      component.changeRecipeField(
        step,
        100,
        Mocks.MachinesStateInitial,
        Mocks.Dataset,
        RecipeField.Overclock,
      );
      expect(component.setOverclock).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        100,
        undefined,
        false,
      );
    });
  });

  describe('changeStepChecked', () => {
    it('should set for an item step', () => {
      spyOn(component, 'setItemChecked');
      component.changeStepChecked({ id: '0', itemId: ItemId.Coal }, true);
      expect(component.setItemChecked).toHaveBeenCalledWith(ItemId.Coal, true);
    });

    it('should set for a recipe objective step', () => {
      spyOn(component, 'setRecipeChecked');
      component.changeStepChecked(
        { id: '0', recipeObjectiveId: '1', recipeId: RecipeId.Coal },
        true,
      );
      expect(component.setRecipeChecked).toHaveBeenCalledWith('1', true, true);
    });

    it('should set for a recipe step', () => {
      spyOn(component, 'setRecipeChecked');
      component.changeStepChecked({ id: '0', recipeId: RecipeId.Coal }, true);
      expect(component.setRecipeChecked).toHaveBeenCalledWith(
        RecipeId.Coal,
        true,
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('setRows', Preferences.SetRowsAction);
    dispatch.idVal('setItemExcluded', Items.SetExcludedAction);
    dispatch.idVal('setItemChecked', Items.SetCheckedAction);
    dispatch.idValDef('setBelt', Items.SetBeltAction);
    dispatch.idValDef('setWagon', Items.SetWagonAction);
    dispatch.idValDef('setRecipeExcluded', Recipes.SetExcludedAction);
    dispatch.val('setRecipeExcludedBatch', Recipes.SetExcludedBatchAction);
    dispatch.val('addObjective', Objectives.AddAction);
    dispatch.idValDef('setMachine', Recipes.SetMachineAction);
    dispatch.idValDefAlt('setMachine', Objectives.SetMachineAction);
    dispatch.idValDef('setFuel', Recipes.SetFuelAction);
    dispatch.idValDefAlt('setFuel', Objectives.SetFuelAction);
    dispatch.idValDef('setMachineModules', Recipes.SetMachineModulesAction);
    dispatch.idValDefAlt(
      'setMachineModules',
      Objectives.SetMachineModulesAction,
    );
    dispatch.val('addBeacon', Recipes.AddBeaconAction);
    dispatch.valAlt('addBeacon', Objectives.AddBeaconAction);
    dispatch.idVal('removeBeacon', Recipes.RemoveBeaconAction);
    dispatch.idValAlt('removeBeacon', Objectives.RemoveBeaconAction);
    dispatch.idIndValDef('setBeaconCount', Recipes.SetBeaconCountAction);
    dispatch.idIndValDefAlt('setBeaconCount', Objectives.SetBeaconCountAction);
    dispatch.idIndValDef('setBeacon', Recipes.SetBeaconAction);
    dispatch.idIndValDefAlt('setBeacon', Objectives.SetBeaconAction);
    dispatch.idIndValDef('setBeaconModules', Recipes.SetBeaconModulesAction);
    dispatch.idIndValDefAlt(
      'setBeaconModules',
      Objectives.SetBeaconModulesAction,
    );
    dispatch.idIndVal('setBeaconTotal', Recipes.SetBeaconTotalAction);
    dispatch.idIndValAlt('setBeaconTotal', Objectives.SetBeaconTotalAction);
    dispatch.idValDef('setOverclock', Recipes.SetOverclockAction);
    dispatch.idValDefAlt('setOverclock', Objectives.SetOverclockAction);
    dispatch.idVal('setRecipeChecked', Recipes.SetCheckedAction);
    dispatch.idValAlt('setRecipeChecked', Objectives.SetCheckedAction);
    dispatch.val('resetItem', Items.ResetItemAction);
    dispatch.val('resetRecipe', Recipes.ResetRecipeAction);
    dispatch.val('resetRecipeObjective', Objectives.ResetObjectiveAction);
    dispatch.void('resetChecked', Items.ResetCheckedAction);
    dispatch.void('resetExcluded', Items.ResetExcludedAction);
    dispatch.void('resetBelts', Items.ResetBeltsAction);
    dispatch.void('resetWagons', Items.ResetWagonsAction);
    dispatch.void('resetMachines', Recipes.ResetMachinesAction);
    dispatch.void('resetBeacons', Recipes.ResetBeaconsAction);
  });
});
