import { TestBed } from '@angular/core/testing';

import { PowerUnit } from '~/models/enum/power-unit';
import { rational } from '~/models/rational';
import { TestModule } from '~/tests';

import { PowerPipe } from './power.pipe';

describe('PowerPipe', () => {
  let pipe: PowerPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [PowerPipe],
    });
    pipe = TestBed.inject(PowerPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should handle GW/MW/kW', () => {
      expect(pipe.transform(rational(1000000n), null, PowerUnit.GW)).toEqual(
        '1 GW',
      );
      expect(pipe.transform(rational(1000n), null, PowerUnit.MW)).toEqual(
        '1 MW',
      );
      expect(pipe.transform(rational.one, null, PowerUnit.kW)).toEqual('1 kW');
    });
  });
});
