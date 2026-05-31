import { DisplayRate, displayRateInfo } from '../settings/display-rate';
import { objectiveUnitOptions } from './objective-unit';

describe('ObjectiveUnit', () => {
  describe('objectiveUnitOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options with wagons', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, {
          cargoWagonIds: [],
          fluidWagonIds: ['id'],
        } as any),
      ).toHaveSize(4);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, {
          cargoWagonIds: [],
          fluidWagonIds: [],
        } as any),
      ).toHaveSize(3);
    });
  });
});
