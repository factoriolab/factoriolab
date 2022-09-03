import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, TestModule } from 'src/tests';
import { Rational } from '~/models';
import { FactoryTooltipPipe } from './factory-tooltip.pipe';

describe('FactoryTooltipPipe', () => {
  let pipe: FactoryTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [FactoryTooltipPipe],
    });
    pipe = TestBed.inject(FactoryTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate a factory tooltip', () => {
      const data = Mocks.getDataset();
      data.itemEntities[ItemId.AssemblingMachine3].factory!.category =
        'chemical';
      data.itemEntities[ItemId.AssemblingMachine3].factory!.silo = {
        parts: Rational.one,
        launch: Rational.two,
      };
      data.itemEntities[ItemId.AssemblingMachine3].factory!.consumption = {
        [ItemId.Wood]: Rational.ten,
      };
      const result = pipe.transform(ItemId.AssemblingMachine3, data);
      expect(result).toBeTruthy();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Mocks.Dataset)).toEqual('');
      expect(pipe.transform('null', Mocks.Dataset)).toEqual('');
    });
  });
});
