import { Game } from '../enum/game';
import { gameInfo } from '../game-info';
import { gameColumnsState, initialColumnsState } from './column-settings';

describe('gameColumnsState', () => {
  it('should automatically hide columns invalid for the passed game', () => {
    const result = gameColumnsState(
      initialColumnsState,
      gameInfo[Game.DysonSphereProgram],
    );
    expect(result.wagons.show).toBeFalse();
    expect(result.beacons.show).toBeFalse();
    expect(result.pollution.show).toBeFalse();
  });
});
