import { flags } from '../flags';
import { DisplayRate, displayRateInfo } from './display-rate';
import { objectiveUnitOptions } from './objective-unit';

describe('ObjectiveUnit', () => {
  describe('objectiveUnitOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options for Factorio', () => {
      expect(objectiveUnitOptions(dispRateInfo, flags['1.1']).length).toEqual(
        4,
      );
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(objectiveUnitOptions(dispRateInfo, flags.coi).length).toEqual(3);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(objectiveUnitOptions(dispRateInfo, flags.dsp).length).toEqual(3);
    });
  });
});
