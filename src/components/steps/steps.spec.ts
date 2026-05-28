import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { initialColumnsState } from '~/state/preferences/columns-state';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { Steps } from './steps';

describe('Steps', () => {
  let component: Steps;
  let fixture: ComponentFixture<Steps>;
  let mocks: Mocks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Steps],
    }).compileComponents();

    fixture = TestBed.createComponent(Steps);
    mocks = TestBed.inject(Mocks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('steps', () => {
    it('should filter by the selected id', async () => {
      spyOn(component['objectivesStore'], 'steps').and.returnValue(
        mocks.steps(),
      );
      setInputs(fixture, { selectedId: mocks.step1().id, focus: true });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['steps']()).toHaveSize(1);
    });
  });

  describe('sortedSteps', () => {
    it('should sort based on the specified column', () => {
      spyOn<any>(component, 'steps').and.returnValue(mocks.steps());
      component['tableStore'].apply({ sort: 'wagons', asc: true });
      expect(component['sortedSteps']()).toEqual([
        mocks.step2(),
        mocks.step1(),
      ]);
    });
  });

  describe('leftSpan', () => {
    it('should account for the checkbox and tree columns', () => {
      expect(component['leftSpan']()).toEqual(3);
      component['preferencesStore'].apply({
        columns: {
          ...initialColumnsState,
          ...{
            checkbox: { ...initialColumnsState.checkbox, ...{ show: true } },
          },
        },
      });
      expect(component['leftSpan']()).toEqual(4);
    });
  });

  describe('toggleStep', () => {
    it('should toggle a step to be expanded and collapsed', () => {
      component.toggleStep('id');
      expect(component['expandedSteps']()).toContain('id');
      component.toggleStep('id');
      expect(component['expandedSteps']()).not.toContain('id');
    });
  });

  describe('resetStep', () => {
    it('should call to reset an item and recipe', () => {
      const step = mocks.step1();
      spyOn(component['itemsStore'], 'resetId');
      spyOn(component['recipesStore'], 'resetId');
      component.resetStep(step);
      expect(component['itemsStore'].resetId).toHaveBeenCalledWith(
        step.itemId!,
      );
      expect(component['recipesStore'].resetId).toHaveBeenCalledWith(
        step.recipeId!,
      );
    });

    it('should call to reset recipe settings on a recipe objective', () => {
      let step = mocks.step1();
      step = { ...step, ...{ recipeObjectiveId: 'id' } };
      spyOn(component['objectivesStore'], 'updateRecord');
      component.resetStep(step);
      expect(component['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        'id',
        {
          machineId: undefined,
          fuelId: undefined,
          modules: undefined,
          beacons: undefined,
          overclock: undefined,
        },
      );
    });
  });

  describe('changeModulesBeacons', () => {
    it('should update recipe modules and beacons', () => {
      let step = mocks.step1();
      step = {
        ...step,
        ...{ recipeSettings: { machineId: ItemId.AssemblingMachine3 } },
      };
      spyOn(component['recipesStore'], 'updateRecord');
      component.changeModulesBeacons(step, { modules: [], beacons: [] });
      expect(component['recipesStore'].updateRecord).toHaveBeenCalledWith(
        step.id,
        { modules: [], beacons: [] },
      );
    });

    it('should update recipe objective modules and beacons', () => {
      let step = mocks.step1();
      step = {
        ...step,
        ...{
          recipeObjectiveId: 'id',
          recipeSettings: { machineId: ItemId.AssemblingMachine3 },
        },
      };
      spyOn(component['objectivesStore'], 'updateRecord');
      component.changeModulesBeacons(step, { modules: [], beacons: [] });
      expect(component['objectivesStore'].updateRecord).toHaveBeenCalledWith(
        'id',
        { modules: [], beacons: [] },
      );
    });

    it('should exit early if no recipe or machineId is found', () => {
      const step = mocks.step1();
      spyOn(component['recipesStore'], 'updateRecord');
      component.changeModulesBeacons(step, { modules: [], beacons: [] });
      expect(component['recipesStore'].updateRecord).not.toHaveBeenCalled();
    });
  });
});
