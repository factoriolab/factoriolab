import { TestBed } from '@angular/core/testing';

import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';

import { gameColumnsState, initialColumnsState } from './columns-state';

describe('gameColumnsState', () => {
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    mocks = TestBed.inject(Mocks);
  });

  it('should automatically hide columns invalid for the passed game', () => {
    const data = mocks.getDataset();
    data.cargoWagonIds = [];
    data.fluidWagonIds = [];
    data.beaconIds = [];
    data.flags = new Set();

    const result = gameColumnsState(
      { ...initialColumnsState, test: 'test' } as any,
      data,
    );
    expect(result.wagons.show).toBeFalse();
    expect(result.beacons.show).toBeFalse();
    expect(result.pollution.show).toBeFalse();
    expect((result as any).test).toBeUndefined();
  });
});
