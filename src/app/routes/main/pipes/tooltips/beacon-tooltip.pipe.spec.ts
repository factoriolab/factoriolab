import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { BeaconTooltipPipe } from './beacon-tooltip.pipe';

describe('BeaconTooltipPipe', () => {
  let pipe: BeaconTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [BeaconTooltipPipe],
    });
    pipe = TestBed.inject(BeaconTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
