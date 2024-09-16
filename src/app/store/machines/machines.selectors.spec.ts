import { Mocks } from '~/tests';

import { initialMachinesState } from './machines.reducer';
import { selectMachinesState } from './machines.selectors';

describe('Machines Selectors', () => {
  describe('getMachineSettings', () => {
    it('should fill in machine settings', () => {
      const result = selectMachinesState.projector(
        initialMachinesState,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(Object.keys(result).length).toEqual(18);
    });
  });
});
