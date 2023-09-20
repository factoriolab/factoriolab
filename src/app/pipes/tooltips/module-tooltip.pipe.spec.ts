import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, TestModule } from 'src/tests';
import { Rational } from '~/models';
import { ModuleTooltipPipe } from './module-tooltip.pipe';

describe('ModuleTooltipPipe', () => {
  let pipe: ModuleTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [ModuleTooltipPipe],
    });
    pipe = TestBed.inject(ModuleTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate a module tooltip', () => {
      const data = Mocks.getRawDataset();
      data.itemEntities[ItemId.ProductivityModule].module!.sprays =
        Rational.one;
      const result = pipe.transform(ItemId.ProductivityModule, data);
      expect(result).toBeTruthy();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Mocks.RawDataset)).toEqual('');
      expect(pipe.transform('null', Mocks.RawDataset)).toEqual('');
    });
  });
});
