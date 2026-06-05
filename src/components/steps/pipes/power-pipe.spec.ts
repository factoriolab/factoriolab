import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { PowerUnit } from '~/state/preferences/power-unit';

import { PowerPipe } from './power-pipe';

describe('PowerPipe', () => {
  let pipe: PowerPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new PowerPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return the value with the appropriate units', () => {
      expect(pipe.transform(rational.one, null, undefined)).toEqual('1 kW');
      expect(pipe.transform(rational(1000n), null, PowerUnit.MW)).toEqual(
        '1 MW',
      );
      expect(pipe.transform(rational(1000000n), null, PowerUnit.GW)).toEqual(
        '1 GW',
      );
    });

    it('should handle nullish values', () => {
      expect(pipe.transform(null, null, undefined)).toEqual('');
    });
  });
});
