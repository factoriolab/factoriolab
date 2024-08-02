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
import { Entities, rational, Step, StepDetail, StepDetailTab } from '~/models';
import { Items, LabState, Objectives, Preferences, Recipes } from '~/store';
import { BrowserUtility, RecipeUtility } from '~/utilities';
import { StepIdPipe } from '../../pipes';
import { StepsComponent } from './steps.component';

describe('StepsComponent', () => {
  let component: StepsComponent;
  let fixture: ComponentFixture<StepsComponent>;
  let mockStore: MockStore<LabState>;

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
            { id: '0', label: StepDetailTab.Item },
            { id: '1', label: StepDetailTab.Recipe },
            { id: '2', label: StepDetailTab.Machine },
          ],
          outputs: [],
          recipeIds: [],
          allRecipesIncluded: true,
        };
        return e;
      }, {}),
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('steps', () => {
    it('should handle focused mode', () => {
      TestUtility.setInputs(fixture, { focus: true });
      expect(component.steps()).toEqual([]);
    });
  });

  describe('toggleEffect', () => {
    it('should toggle and expand a row in focus mode', () => {
      spyOn(component, 'expandRow');
      TestUtility.setInputs(fixture, {
        focus: true,
        selectedId: Mocks.Step1.id,
      });
      expect(component.expandRow).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should scroll to and expand the fragment id', fakeAsync(() => {
      const domEl = { scrollIntoView: (): void => {} };
      spyOn(domEl, 'scrollIntoView');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      TestUtility.assert(component.stepsTable != null);
      spyOn(component.stepsTable(), 'toggleRow');
      component.fragmentId = 'step_' + Mocks.Step1.id;
      component.ngAfterViewInit();
      tick(100);
      expect(component.stepsTable().toggleRow).toHaveBeenCalled();
      expect(domEl.scrollIntoView).toHaveBeenCalled();
    }));

    it('should scroll to and open tab for the fragment id', fakeAsync(() => {
      const domEl = { click: (): void => {} };
      spyOn(domEl, 'click');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      TestUtility.assert(component.stepsTable != null);
      spyOn(component.stepsTable(), 'toggleRow');
      component.fragmentId = 'step_' + Mocks.Step1.id + '_item';
      component.ngAfterViewInit();
      tick(100);
      expect(component.stepsTable().toggleRow).toHaveBeenCalled();
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
      spyOn(component.stepsTable(), 'reset');
      spyOn(component.sortSteps$, 'next');
      component.sortSteps(prev, curr, Mocks.Steps);
      expect(component.stepsTable().reset).toHaveBeenCalled();
      expect(component.sortSteps$.next).toHaveBeenCalled();
    });
  });

  describe('setActiveItems', () => {
    it('should call to update active item for each step', () => {
      const tab1: MenuItem = { label: 'tab1' };
      const tab2: MenuItem = { label: 'tab2' };
      component.activeItem = { ['2']: tab2, ['3']: tab2 };
      component.setActiveItems(
        [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }],
        {
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
      expect(component.activeItem).toEqual({ ['2']: tab2, ['3']: tab1 });
    });
  });

  describe('expandRow', () => {
    it('should return if the row is collapsing', () => {
      spyOn(component as any, '_updateActiveItem');
      component.expandRow(Mocks.Step1, true);
      expect(component['_updateActiveItem']).not.toHaveBeenCalled();
    });

    it('should pick the last open tab to show on expand', () => {
      const tab: MenuItem = { label: 'machine' };
      const stepDetails: Entities<StepDetail> = {
        [Mocks.Step1.id]: {
          tabs: [tab],
          outputs: [],
          recipeIds: [],
          allRecipesIncluded: false,
        },
      };
      spyOn(component, 'stepDetails').and.returnValue(stepDetails);
      spyOnProperty(BrowserUtility, 'stepDetailTab').and.returnValue(
        StepDetailTab.Machine,
      );
      const id = StepIdPipe.transform(Mocks.Step1);
      component.expandRow(Mocks.Step1, false);
      expect(component.activeItem[id]).toEqual(tab);
    });

    it('should pick a default tab to show on expand', () => {
      const tab: MenuItem = { label: 'machine' };
      const stepDetails: Entities<StepDetail> = {
        [Mocks.Step1.id]: {
          tabs: [tab],
          outputs: [],
          recipeIds: [],
          allRecipesIncluded: false,
        },
      };
      spyOn(component, 'stepDetails').and.returnValue(stepDetails);
      const id = StepIdPipe.transform(Mocks.Step1);
      component.expandRow(Mocks.Step1, false);
      expect(component.activeItem[id]).toEqual(tab);
    });
  });

  describe('setActiveItem', () => {
    it('should return if passed item is nullish', () => {
      component.setActiveItem({ id: '0' }, undefined);
      expect(component.activeItem['0']).toBeUndefined();
    });

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
      const data = { ...Mocks.AdjustedDataset, ...{ defaults: undefined } };
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
        Mocks.AdjustedDataset,
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
      recipeSettings: Mocks.RecipesStateInitial[RecipeId.WoodenChest],
    };

    it('should skip a step with no recipe', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField({ id: '0' }, '1', 'machine');
      expect(component.setMachine).not.toHaveBeenCalled();
    });

    it('should skip a step with no machine', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(
        { id: '0', recipeId: RecipeId.AdvancedCircuit },
        '1',
        'machine',
      );
      expect(component.setMachine).not.toHaveBeenCalled();
    });

    it('should set up default for machine', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(step, ItemId.AssemblingMachine2, 'machine');
      expect(component.setMachine).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.AssemblingMachine2,
        ItemId.AssemblingMachine1,
        false,
      );
    });

    it('should ignore invalid machine event', () => {
      spyOn(component, 'setMachine');
      component.changeRecipeField(step, 0, 'machine');
      expect(component.setMachine).not.toHaveBeenCalled();
    });

    it('should set up default for fuel', () => {
      spyOn(component, 'setFuel');
      component.changeRecipeField(step, ItemId.Coal, 'fuel');
      expect(component.setFuel).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        ItemId.Coal,
        undefined,
        false,
      );
    });

    it('should ignore invalid fuel event', () => {
      spyOn(component, 'setFuel');
      component.changeRecipeField(step, 0, 'fuel');
      expect(component.setFuel).not.toHaveBeenCalled();
    });

    it('should set up default for modules', () => {
      spyOn(RecipeUtility, 'dehydrateModules');
      spyOn(component, 'setModules');
      component.changeRecipeField(step, [], 'modules');
      expect(component.setModules).toHaveBeenCalled();
    });

    it('should ignore invalid modules event', () => {
      spyOn(component, 'setModules');
      component.changeRecipeField(step, ItemId.AdvancedCircuit, 'modules');
      expect(component.setModules).not.toHaveBeenCalled();
    });

    it('should set up default for beacons', () => {
      spyOn(RecipeUtility, 'dehydrateBeacons');
      spyOn(component, 'setBeacons');
      component.changeRecipeField(step, [], 'beacons');
      expect(component.setBeacons).toHaveBeenCalled();
    });

    it('should ignore invalid beacons event', () => {
      spyOn(component, 'setBeacons');
      component.changeRecipeField(step, ItemId.AdvancedCircuit, 'beacons');
      expect(component.setBeacons).not.toHaveBeenCalled();
    });

    it('should set up default for overclock', () => {
      spyOn(component, 'setOverclock');
      component.changeRecipeField(step, 100, 'overclock');
      expect(component.setOverclock).toHaveBeenCalledWith(
        RecipeId.WoodenChest,
        rational(100n),
        undefined,
        false,
      );
    });

    it('should ignore invalid overclock event', () => {
      spyOn(component, 'setOverclock');
      component.changeRecipeField(step, ItemId.AdvancedCircuit, 'overclock');
      expect(component.setOverclock).not.toHaveBeenCalled();
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
    dispatch.idVal('setModules', Recipes.SetModulesAction);
    dispatch.idValAlt('setModules', Objectives.SetModulesAction);
    dispatch.idVal('setBeacons', Recipes.SetBeaconsAction);
    dispatch.idValAlt('setBeacons', Objectives.SetBeaconsAction);
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
