import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { MenuItem, SortEvent } from 'primeng/api';

import { Entities, rational, Step, StepDetail, StepDetailTab } from '~/models';
import { StepIdPipe } from '~/pipes';
import {
  Items,
  LabState,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import {
  assert,
  DispatchTest,
  ItemId,
  Mocks,
  RecipeId,
  setInputs,
  TestModule,
} from '~/tests';
import { BrowserUtility, RecipeUtility } from '~/utilities';

import { StepsComponent } from './steps.component';

describe('StepsComponent', () => {
  let component: StepsComponent;
  let fixture: ComponentFixture<StepsComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, StepsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepsComponent);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(Objectives.selectSteps, Mocks.Steps);
    mockStore.overrideSelector(
      Objectives.selectStepDetails,
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
      setInputs(fixture, { focus: true });
      expect(component.steps()).toEqual([]);
    });
  });

  describe('toggleEffect', () => {
    it('should toggle and expand a row in focus mode', () => {
      spyOn(component, 'expandRow');
      setInputs(fixture, {
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
      assert(component.stepsTable != null);
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
      assert(component.stepsTable != null);
      spyOn(component.stepsTable(), 'toggleRow');
      component.fragmentId = 'step_' + Mocks.Step1.id + '_item';
      component.ngAfterViewInit();
      tick(100);
      expect(component.stepsTable().toggleRow).toHaveBeenCalled();
      expect(domEl.click).toHaveBeenCalled();
    }));

    it('should handle element not found', () => {
      component.fragmentId = Mocks.Step1.id;
      expect(() => {
        component.ngAfterViewInit();
      }).not.toThrow();
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
      spyOn(component as any, 'updateActiveItem');
      component.expandRow(Mocks.Step1, true);
      expect(component.updateActiveItem).not.toHaveBeenCalled();
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

  describe('changeItemExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component, 'setExcludedItems');
      component.changeItemExcluded(ItemId.Coal, true);
      expect(component.setExcludedItems).toHaveBeenCalledWith(
        new Set([ItemId.Coal]),
      );
    });
  });

  describe('changeRecipesExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component, 'setExcludedRecipes');
      component.changeRecipesExcluded([RecipeId.Coal], true);
      expect(component.setExcludedRecipes).toHaveBeenCalledWith(
        new Set([RecipeId.NuclearFuelReprocessing, RecipeId.Coal]),
        new Set([RecipeId.NuclearFuelReprocessing]),
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
      spyOn(component, 'setCheckedItems');
      component.changeStepChecked({ id: '0', itemId: ItemId.Coal }, true);
      expect(component.setCheckedItems).toHaveBeenCalledWith(
        new Set([ItemId.Coal]),
      );
    });

    it('should set for a recipe objective step', () => {
      spyOn(component, 'setCheckedObjectives');
      component.changeStepChecked(
        { id: '0', recipeObjectiveId: '1', recipeId: RecipeId.Coal },
        true,
      );
      expect(component.setCheckedObjectives).toHaveBeenCalledWith(
        new Set(['1']),
      );
    });

    it('should set for a recipe step', () => {
      spyOn(component, 'setCheckedRecipes');
      component.changeStepChecked({ id: '0', recipeId: RecipeId.Coal }, true);
      expect(component.setCheckedRecipes).toHaveBeenCalledWith(
        new Set([RecipeId.Coal]),
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.props('setRows', Preferences.setRows);
    dispatch.props('setExcludedItems', Settings.setExcludedItems);
    dispatch.props('setBelt', Items.setBelt);
    dispatch.props('setWagon', Items.setWagon);
    dispatch.props('setExcludedRecipes', Settings.setExcludedRecipes);
    dispatch.props('addObjective', Objectives.add);
    dispatch.props('setMachine', Recipes.setMachine);
    dispatch.props('setMachine', Objectives.setMachine, ['', '', '', true]);
    dispatch.props('setFuel', Recipes.setFuel);
    dispatch.props('setFuel', Objectives.setFuel, ['', '', '', true]);
    dispatch.props('setModules', Recipes.setModules);
    dispatch.props('setModules', Objectives.setModules, ['', '', true]);
    dispatch.props('setBeacons', Recipes.setBeacons);
    dispatch.props('setBeacons', Objectives.setBeacons, ['', '', true]);
    dispatch.props('setOverclock', Recipes.setOverclock);
    dispatch.props('setOverclock', Objectives.setOverclock, ['', '', '', true]);
    dispatch.props('setCheckedItems', Settings.setCheckedItems);
    dispatch.props('setCheckedRecipes', Settings.setCheckedRecipes);
    dispatch.props('setCheckedObjectives', Settings.setCheckedObjectives);
    dispatch.props('resetItem', Items.resetItem);
    dispatch.props('resetRecipe', Recipes.resetRecipe);
    dispatch.props('resetRecipeObjective', Objectives.resetObjective);
    dispatch.void('resetChecked', Settings.resetChecked);
    dispatch.void('resetExcludedItems', Settings.resetExcludedItems);
    dispatch.void('resetBelts', Items.resetBelts);
    dispatch.void('resetWagons', Items.resetWagons);
    dispatch.void('resetMachines', Recipes.resetMachines);
    dispatch.void('resetBeacons', Recipes.resetBeacons);
  });
});
