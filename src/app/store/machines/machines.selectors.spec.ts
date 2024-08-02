import { Mocks } from 'src/tests';
import { initialMachinesState } from './machines.reducer';
import * as Selectors from './machines.selectors';

describe('Machines Selectors', () => {
  describe('getMachineSettings', () => {
    it('should fill in machine settings', () => {
      const result = Selectors.getMachinesState.projector(
        initialMachinesState,
        Mocks.Defaults,
        Mocks.AdjustedDataset,
      );
      expect(result.ids?.length).toEqual(3);
      expect(Object.keys(result.entities).length).toEqual(18);
    });

    it('should handle null defaults', () => {
      const result = Selectors.getMachinesState.projector(
        initialMachinesState,
        null,
        Mocks.AdjustedDataset,
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(18);
    });
  });
});
