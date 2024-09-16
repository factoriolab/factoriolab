import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, TestModule } from '~/tests';

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
      expect(pipe.transform(rational.one, null, ItemId.Pumpjack)).toEqual(
        '100%',
      );
      expect(pipe.transform(rational(1n, 3n), 3, ItemId.Pumpjack)).toEqual(
        '33.4%',
      );
    });

    it('should transform values using rate pipe', () => {
      spyOn(RatePipe, 'transform');
      pipe.transform(rational.one, null, ItemId.AssemblingMachine1);
      expect(RatePipe.transform).toHaveBeenCalledWith(rational.one, null);
    });
  });
});
