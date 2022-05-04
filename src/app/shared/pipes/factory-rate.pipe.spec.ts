import { TestBed } from '@angular/core/testing';

import { ItemId } from 'src/tests';
import { Rational } from '~/models';
import { FactoryRatePipe } from './factory-rate.pipe';
import { RatePipe } from './rate.pipe';

describe('FactoryRatePipe', () => {
  let pipe: FactoryRatePipe;
  let ratePipe: RatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RatePipe, FactoryRatePipe] });
    pipe = TestBed.inject(FactoryRatePipe);
    ratePipe = TestBed.inject(RatePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should transform pumpjack values to percentages', () => {
      expect(pipe.transform(Rational.one, null, ItemId.Pumpjack)).toEqual(
        '100%'
      );
      expect(pipe.transform(Rational.from(1, 3), 3, ItemId.Pumpjack)).toEqual(
        '33.4%'
      );
    });

    it('should transform values using rate pipe', () => {
      spyOn(ratePipe, 'transform');
      pipe.transform(Rational.one, null, ItemId.AssemblingMachine1);
      expect(ratePipe.transform).toHaveBeenCalledWith(Rational.one, null);
    });
  });
});
