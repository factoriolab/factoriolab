import { Mocks, RecipeId } from 'src/tests';
import { Objective, ObjectiveType, ObjectiveUnit } from '~/models';
import { RecipeUtility } from '~/utilities';
import * as Selectors from './objectives.selectors';

describe('Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.objectivesState({
          objectivesState: Mocks.ObjectivesState,
        } as any)
      ).toEqual(Mocks.ObjectivesState);
      expect(Selectors.getIds.projector(Mocks.ObjectivesState)).toEqual(
        Mocks.ObjectivesState.ids
      );
      expect(Selectors.getEntities.projector(Mocks.ObjectivesState)).toEqual(
        Mocks.ObjectivesState.entities
      );
    });
  });

  describe('getBaseObjectives', () => {
    it('should return the array of objectives', () => {
      const result = Selectors.getBaseObjectives.projector(
        Mocks.ObjectivesState.ids,
        Mocks.ObjectivesState.entities,
        Mocks.Dataset
      );
      expect(result).toEqual(Mocks.ObjectivesList);
    });
  });

  describe('getObjectivess', () => {
    it('should adjust recipe objectives based on settings', () => {
      spyOn(RecipeUtility, 'adjustObjective');
      Selectors.getObjectives.projector(
        [Mocks.Objective5],
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
      expect(RecipeUtility.adjustObjective).toHaveBeenCalledWith(
        Mocks.Objective5,
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
    });
  });

  describe('getRationalObjectives', () => {
    it('should convert objectives to rationals', () => {
      spyOn(RecipeUtility, 'adjustRecipe');
      Selectors.getObjectiveRationals.projector(
        [Mocks.Objective5],
        Mocks.AdjustmentData,
        Mocks.ItemsStateInitial
      );
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecipesModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getRecipesModified.projector(
        {
          [RecipeId.Coal]: {
            machineId: undefined,
            machineModuleIds: undefined,
            overclock: 100,
            beacons: [{ total: '1' }],
          },
        },
        []
      );
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });

    it('should account for recipe objective settings', () => {
      const objective: Objective = {
        id: '1',
        targetId: RecipeId.Coal,
        value: '1',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
        overclock: 100,
        beacons: [{ moduleIds: [] }],
      };
      const result = Selectors.getRecipesModified.projector(
        {
          [RecipeId.Coal]: {},
        },
        [objective]
      );
      expect(result.machines).toBeTrue();
      expect(result.beacons).toBeTrue();
      expect(result.cost).toBeFalse();
    });
  });
});
