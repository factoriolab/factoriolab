import { Mocks, ItemId } from 'src/tests';
import { Game } from '~/models';
import { initialFactoriesState } from './factories.reducer';
import * as Selectors from './factories.selectors';

describe('Factories Selectors', () => {
  describe('getFactorySettings', () => {
    it('should fill in factory settings', () => {
      const result = Selectors.getFactorySettings.projector(
        initialFactoriesState,
        Mocks.Defaults,
        Mocks.AdjustedData
      );
      expect(result.ids?.length).toEqual(3);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should handle null defaults', () => {
      const result = Selectors.getFactorySettings.projector(
        initialFactoriesState,
        null,
        Mocks.AdjustedData
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should read number of beacons', () => {
      const result = Selectors.getFactorySettings.projector(
        {
          ids: null,
          entities: { [ItemId.AssemblingMachine2]: { beaconCount: '0' } },
        },
        null,
        Mocks.AdjustedData
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
      expect(result.entities[ItemId.AssemblingMachine2].beaconCount).toEqual(
        '0'
      );
    });

    it('should use null beaconCount for DSP', () => {
      const result = Selectors.getFactorySettings.projector(
        initialFactoriesState,
        Mocks.Defaults,
        { ...Mocks.AdjustedData, ...{ game: Game.DysonSphereProgram } }
      );
      expect(result.entities[''].beaconCount).toBeNull();
    });

    it('should include overclock in Satisfactory', () => {
      const state = {
        ...initialFactoriesState,
        ...{
          entities: {
            ...initialFactoriesState.entities,
            ...{
              '': {
                ...initialFactoriesState.entities[''],
                ...{ overclock: 200 },
              },
            },
          },
        },
      };
      const result = Selectors.getFactorySettings.projector(
        state,
        Mocks.Defaults,
        { ...Mocks.AdjustedData, ...{ game: Game.Satisfactory } }
      );
      expect(result.entities[''].overclock).toEqual(200);
    });

    it('should default overclock to 100 in Satisfactory', () => {
      const state = {
        ...initialFactoriesState,
        ...{
          entities: {
            ...initialFactoriesState.entities,
            ...{
              '': {
                ...initialFactoriesState.entities[''],
                ...{ overclock: null },
              },
            },
          },
        },
      };
      const result = Selectors.getFactorySettings.projector(
        state,
        Mocks.Defaults,
        { ...Mocks.AdjustedData, ...{ game: Game.Satisfactory } }
      );
      expect(result.entities[''].overclock).toEqual(100);
    });
  });
});
