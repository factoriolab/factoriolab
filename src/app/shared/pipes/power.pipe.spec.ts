import { TestBed } from '@angular/core/testing';

import { PowerUnit, Rational } from '~/models';
import { PowerPipe } from './power.pipe';
import { RatePipe } from './rate.pipe';

describe('PowerPipe', () => {
  let pipe: PowerPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RatePipe, PowerPipe] });
    pipe = TestBed.inject(PowerPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should handle GW/MW/kW', () => {
      expect(
        pipe.transform(Rational.from(1000000), null, PowerUnit.GW)
      ).toEqual('1 GW');
      expect(pipe.transform(Rational.thousand, null, PowerUnit.MW)).toEqual(
        '1 MW'
      );
      expect(pipe.transform(Rational.one, null, PowerUnit.kW)).toEqual('1 kW');
    });
  });
});
