import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MenuItem, SortEvent } from 'primeng/api';

import { StepDetailTab } from '~/models/enum/step-detail-tab';
import { rational } from '~/models/rational';
import { Step } from '~/models/step';
import { StepDetail } from '~/models/step-detail';
import { Entities } from '~/models/utils';
import { StepIdPipe } from '~/pipes/step-id.pipe';
import { ItemId, Mocks, RecipeId, setInputs, TestModule } from '~/tests';

import { StepsComponent } from './steps.component';

describe('StepsComponent', () => {
  let component: StepsComponent;
  let fixture: ComponentFixture<StepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, StepsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepsComponent);
    component = fixture.componentInstance;
    spyOn(component, '_steps').and.returnValue(Mocks.steps);
    spyOn(component, 'stepDetails').and.returnValue(
      Mocks.steps.reduce((e: Entities<StepDetail>, s, i) => {
        e[s.id] = {
          tabs:
            i === 0
              ? [
                  { id: '0', label: StepDetailTab.Item },
                  { id: '1', label: StepDetailTab.Recipe },
                  { id: '2', label: StepDetailTab.Machine },
                ]
              : [],
          outputs: [],
          recipeIds: [],
          recipesEnabled: [],
          recipeOptions: [],
        };
        return e;
      }, {}),
    );
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
        selectedId: Mocks.step1.id,
      });
      expect(component.expandRow).toHaveBeenCalled();
    });
  });

  describe('loadFragmentId', () => {
    it('should scroll to and expand the fragment id', fakeAsync(() => {
      const domEl = { scrollIntoView: (): void => {} };
      spyOn(domEl, 'scrollIntoView');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      spyOn(component.stepsTable(), 'toggleRow');
      component.fragmentId = 'step_' + Mocks.step1.id;
      component.loadFragmentId();
      tick(100);
      expect(component.stepsTable().toggleRow).toHaveBeenCalled();
      expect(domEl.scrollIntoView).toHaveBeenCalled();
    }));

    it('should scroll to and open tab for the fragment id', fakeAsync(() => {
      const domEl = { click: (): void => {} };
      spyOn(domEl, 'click');
      spyOn(window.document, 'querySelector').and.returnValue(domEl as any);
      spyOn(component.stepsTable(), 'toggleRow');
      component.fragmentId = 'step_' + Mocks.step1.id + '_item';
      component.loadFragmentId();
      tick(100);
      expect(component.stepsTable().toggleRow).toHaveBeenCalled();
      expect(domEl.click).toHaveBeenCalled();
    }));

    it('should handle step with no tabs', () => {
      spyOn(component.stepsTable(), 'toggleRow');
      component.fragmentId = `step_${Mocks.step2.id}_item`;
      component.loadFragmentId();
      expect(component.stepsTable().toggleRow).not.toHaveBeenCalled();
    });

    it('should handle element not found', () => {
      component.fragmentId = Mocks.step1.id;
      expect(() => {
        component.loadFragmentId();
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
        data: [...Mocks.steps],
      } as SortEvent;
      component.sortSteps(null, curr, Mocks.steps);
      expect(curr.data).toEqual(Mocks.steps);
    });

    it('should sort the steps based on the passed field', () => {
      const curr = {
        order: -1,
        field: 'belts',
        data: [...Mocks.steps],
      } as SortEvent;
      component.sortSteps(null, curr, Mocks.steps);
      expect(curr.data![0]).not.toEqual(Mocks.steps[0]);
    });

    it('should handle missing values', () => {
      const curr = {
        order: -1,
        field: 'fake',
        data: [...Mocks.steps],
      } as SortEvent;
      component.sortSteps(null, curr, Mocks.steps);
      expect(curr.data).toEqual(Mocks.steps);
    });

    it('should reset on third column click', () => {
      const prev = {
        order: 1,
        field: 'items',
      } as SortEvent;
      const curr = {
        order: -1,
        field: 'items',
        data: [...Mocks.steps],
      } as SortEvent;
      spyOn(component.stepsTable(), 'reset');
      spyOn(component.sortSteps$, 'next');
      component.sortSteps(prev, curr, Mocks.steps);
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
            recipesEnabled: [],
            recipeOptions: [],
          },
          ['3']: {
            tabs: [tab1],
            outputs: [],
            recipeIds: [],
            recipesEnabled: [],
            recipeOptions: [],
          },
        },
      );
      expect(component.activeItem).toEqual({ ['2']: tab2, ['3']: tab1 });
    });
  });

  describe('expandRow', () => {
    it('should return if the row is collapsing', () => {
      spyOn(component as any, 'updateActiveItem');
      component.expandRow(Mocks.step1, true);
      expect(component.updateActiveItem).not.toHaveBeenCalled();
    });

    it('should pick the last open tab to show on expand', () => {
      spyOn(component, 'stepDetailTab').and.returnValue(StepDetailTab.Machine);
      const id = StepIdPipe.transform(Mocks.step1);
      component.expandRow(Mocks.step1, false);
      expect(component.activeItem[id]).toEqual({
        id: '2',
        label: StepDetailTab.Machine,
      });
    });

    it('should pick a default tab to show on expand', () => {
      const id = StepIdPipe.transform(Mocks.step1);
      component.expandRow(Mocks.step1, false);
      expect(component.activeItem[id]).toEqual({
        id: '0',
        label: StepDetailTab.Item,
      });
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
      spyOn(component.itemsSvc, 'resetId');
      spyOn(component.objectivesSvc, 'updateEntity');
      spyOn(component.recipesSvc, 'resetId');
    });

    it('should reset a recipe objective step', () => {
      const step: Step = {
        id: '0',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
        recipeObjectiveId: '1',
      };
      component.resetStep(step);
      expect(component.itemsSvc.resetId).toHaveBeenCalled();
      expect(component.recipesSvc.resetId).not.toHaveBeenCalled();
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalled();
    });

    it('should reset a recipe step', () => {
      const step: Step = {
        id: '0',
        itemId: ItemId.Coal,
        recipeId: RecipeId.Coal,
      };
      component.resetStep(step);
      expect(component.itemsSvc.resetId).toHaveBeenCalled();
      expect(component.recipesSvc.resetId).toHaveBeenCalled();
      expect(component.objectivesSvc.updateEntity).not.toHaveBeenCalled();
    });
  });

  describe('changeItemExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component.settingsSvc, 'apply');
      component.changeItemExcluded(ItemId.Coal, true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        excludedItemIds: new Set([ItemId.Coal]),
      });
    });
  });

  describe('changeRecipesIncluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.changeRecipesIncluded(
        [RecipeId.Coal, RecipeId.CoalLiquefaction],
        [RecipeId.CoalLiquefaction],
      );
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'excludedRecipeIds',
        new Set([RecipeId.NuclearFuelReprocessing, RecipeId.Coal]),
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });
  });

  describe('changeModulesBeacons', () => {
    let step: Step;

    beforeEach(() => {
      step = {
        id: '0',
        recipeId: RecipeId.WoodenChest,
        recipeSettings: Mocks.recipesStateInitial[RecipeId.WoodenChest],
      };
      spyOn(component.recipesSvc, 'updateEntity');
      spyOn(component.objectivesSvc, 'updateEntity');
    });

    it('should skip a step with no recipe', () => {
      component.changeModulesBeacons({ id: '0' }, {});
      expect(component.recipesSvc.updateEntity).not.toHaveBeenCalled();
    });

    it('should skip a step with no machine', () => {
      component.changeModulesBeacons(
        { id: '0', recipeId: RecipeId.AdvancedCircuit },
        {},
      );
      expect(component.recipesSvc.updateEntity).not.toHaveBeenCalled();
    });

    it('should set up default for modules and beacons', () => {
      spyOn(component.recipeSvc, 'dehydrateModules');
      spyOn(component.recipeSvc, 'dehydrateBeacons');
      component.changeModulesBeacons(step, { modules: [], beacons: [] });
      expect(component.recipesSvc.updateEntity).toHaveBeenCalled();
    });

    it('should update recipe objective', () => {
      const step: Step = {
        id: '0',
        recipeId: RecipeId.WoodenChest,
        recipeObjectiveId: '1',
        recipeSettings: Mocks.recipesStateInitial[RecipeId.WoodenChest],
      };
      component.changeModulesBeacons(step, {});
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith(
        '1',
        {},
      );
    });
  });

  describe('changeBelts', () => {
    it('should return if itemId is undefined', () => {
      spyOn(component.itemsSvc, 'updateEntityField');
      component.changeBelts({ id: '0' }, {}, undefined);
      expect(component.itemsSvc.updateEntityField).not.toHaveBeenCalled();
    });

    it('should update the stack and beltId', () => {
      spyOn(component.itemsSvc, 'updateEntityField');
      component.changeBelts(
        Mocks.step1,
        Mocks.itemsStateInitial[ItemId.Coal],
        ItemId.TransportBelt,
      );
      expect(component.itemsSvc.updateEntityField).toHaveBeenCalledWith(
        Mocks.step1.itemId!,
        'stack',
        undefined,
        rational.one,
      );
      expect(component.itemsSvc.updateEntityField).toHaveBeenCalledWith(
        Mocks.step1.itemId!,
        'beltId',
        Mocks.itemsStateInitial[ItemId.Coal].beltId,
        ItemId.TransportBelt,
      );
    });
  });

  describe('changeStepChecked', () => {
    beforeEach(() => {
      spyOn(component.settingsSvc, 'apply');
    });

    it('should set for an item step', () => {
      component.changeStepChecked({ id: '0', itemId: ItemId.Coal }, true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        checkedItemIds: new Set([ItemId.Coal]),
      });
    });

    it('should set for a recipe objective step', () => {
      component.changeStepChecked(
        { id: '0', recipeObjectiveId: '1', recipeId: RecipeId.Coal },
        true,
      );
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        checkedObjectiveIds: new Set(['1']),
      });
    });

    it('should set for a recipe step', () => {
      component.changeStepChecked({ id: '0', recipeId: RecipeId.Coal }, true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        checkedRecipeIds: new Set([RecipeId.Coal]),
      });
    });
  });

  describe('resetChecked', () => {
    it('should reset all checked properties', () => {
      spyOn(component.settingsSvc, 'apply');
      component.resetChecked();
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        checkedItemIds: new Set(),
        checkedObjectiveIds: new Set(),
        checkedRecipeIds: new Set(),
      });
    });
  });

  describe('resetExcludedItems', () => {
    it('should reset excluded items', () => {
      const event = new Event('click');
      spyOn(component.settingsSvc, 'apply');
      spyOn(event, 'stopImmediatePropagation');
      component.resetExcludedItems(event);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        excludedItemIds: new Set(),
      });
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });
  });

  describe('resetBelts', () => {
    it('should reset belts', () => {
      const event = new Event('click');
      spyOn(component.itemsSvc, 'resetFields');
      spyOn(event, 'stopImmediatePropagation');
      component.resetBelts(event);
      expect(component.itemsSvc.resetFields).toHaveBeenCalledWith('beltId');
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });
  });

  describe('resetWagons', () => {
    it('should reset wagons', () => {
      const event = new Event('click');
      spyOn(component.itemsSvc, 'resetFields');
      spyOn(event, 'stopImmediatePropagation');
      component.resetWagons(event);
      expect(component.itemsSvc.resetFields).toHaveBeenCalledWith('wagonId');
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });
  });

  describe('resetMachines', () => {
    it('should reset machines', () => {
      const event = new Event('click');
      spyOn(component.objectivesSvc, 'resetFields');
      spyOn(component.recipesSvc, 'resetFields');
      spyOn(event, 'stopImmediatePropagation');
      component.resetMachines(event);
      expect(component.objectivesSvc.resetFields).toHaveBeenCalled();
      expect(component.recipesSvc.resetFields).toHaveBeenCalled();
      expect(event.stopImmediatePropagation).toHaveBeenCalled();
    });
  });

  describe('resetBeacons', () => {
    it('should reset machines', () => {
      spyOn(component.objectivesSvc, 'resetFields');
      spyOn(component.recipesSvc, 'resetFields');
      component.resetBeacons();
      expect(component.objectivesSvc.resetFields).toHaveBeenCalled();
      expect(component.recipesSvc.resetFields).toHaveBeenCalled();
    });
  });
});
