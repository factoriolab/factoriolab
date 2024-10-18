import { flags } from '../flags';
import { gameColumnsState, initialColumnsState } from './column-settings';

describe('gameColumnsState', () => {
  it('should automatically hide columns invalid for the passed game', () => {
    const result = gameColumnsState(initialColumnsState, flags.dsp);
    expect(result.wagons.show).toBeFalse();
    expect(result.beacons.show).toBeFalse();
    expect(result.pollution.show).toBeFalse();
  });
});
