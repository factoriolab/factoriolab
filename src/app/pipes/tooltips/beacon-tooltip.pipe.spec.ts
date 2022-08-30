import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, TestModule } from 'src/tests';
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

  describe('transform', () => {
    it('should generate a beacon tooltip', () => {
      const data = Mocks.getDataset();
      data.itemEntities[ItemId.Beacon].beacon!.category = 'chemical';
      const result = pipe.transform(ItemId.Beacon, data);
      expect(result).toBeTruthy();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Mocks.Dataset)).toEqual('');
      expect(pipe.transform('null', Mocks.Dataset)).toEqual('');
    });
  });
});
