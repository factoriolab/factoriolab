import { Mocks, ItemId } from 'src/tests';
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
      expect(result.ids.length).toEqual(3);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should handle null defaults', () => {
      const result = Selectors.getFactorySettings.projector(
        initialFactoriesState,
        null,
        Mocks.AdjustedData
      );
      expect(result.ids.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should read number of beacons', () => {
      const result = Selectors.getFactorySettings.projector(
        {
          ids: null,
          entities: { [ItemId.AssemblingMachine2]: { beaconCount: 0 } },
        },
        null,
        Mocks.AdjustedData
      );
      expect(result.ids.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
      expect(result.entities[ItemId.AssemblingMachine2].beaconCount).toEqual(0);
    });
  });
});
