import { Mocks } from 'src/tests';
import { RecipeUtility } from '~/utilities';
import * as Selectors from './recipe-objectives.selectors';

describe('Recipe Objectives Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(
        Selectors.producersState({
          producersState: Mocks.ProducersState,
        } as any)
      ).toEqual(Mocks.ProducersState);
      expect(Selectors.getIds.projector(Mocks.ProducersState)).toEqual(
        Mocks.ProducersState.ids
      );
      expect(Selectors.getEntities.projector(Mocks.ProducersState)).toEqual(
        Mocks.ProducersState.entities
      );
    });
  });

  describe('getBaseProducers', () => {
    it('should return the array of producers', () => {
      const result = Selectors.getBaseProducers.projector(
        Mocks.ProducersState.ids,
        Mocks.ProducersState.entities,
        Mocks.Dataset
      );
      expect(result).toEqual([Mocks.Producer]);
    });
  });

  describe('getProducers', () => {
    it('should adjust producers based on settings', () => {
      spyOn(RecipeUtility, 'adjustProducer');
      Selectors.getProducers.projector(
        [Mocks.Producer],
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
      expect(RecipeUtility.adjustProducer).toHaveBeenCalledWith(
        Mocks.Producer,
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
    });
  });

  describe('getRationalProducers', () => {
    it('should convert producers to rationals', () => {
      spyOn(RecipeUtility, 'adjustRecipe');
      Selectors.getRationalProducers.projector(
        [Mocks.Producer],
        Mocks.AdjustmentData,
        Mocks.ItemsStateInitial
      );
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(1);
    });
  });
});
