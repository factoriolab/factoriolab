import { TestBed } from '@angular/core/testing';

import { ItemId, TestModule } from 'src/tests';
import { Rational } from '~/models';
import { MachineRatePipe } from './machine-rate.pipe';
import { RatePipe } from './rate.pipe';

describe('MachineRatePipe', () => {
  let pipe: MachineRatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [MachineRatePipe],
    });
    pipe = TestBed.inject(MachineRatePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should transform pumpjack values to percentages', () => {
      expect(pipe.transform(Rational.one, null, ItemId.Pumpjack)).toEqual(
        '100%',
      );
      expect(pipe.transform(Rational.from([1, 3]), 3, ItemId.Pumpjack)).toEqual(
        '33.4%',
      );
    });

    it('should transform values using rate pipe', () => {
      spyOn(RatePipe, 'transform');
      pipe.transform(Rational.one, null, ItemId.AssemblingMachine1);
      expect(RatePipe.transform).toHaveBeenCalledWith(Rational.one, null);
    });
  });
});
